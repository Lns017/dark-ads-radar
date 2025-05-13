
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID") || "";
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET") || "";
const BASE_URL = Deno.env.get("FUNCTION_BASE_URL") || "http://localhost:54321";

// Scopes necessários para acessar dados de anúncios e pixels
const FB_SCOPES = [
  "ads_read",
  "ads_management",
  "business_management",
  "pages_read_engagement",
  "catalog_management",
  "email",
  "public_profile",
];

serve(async (req) => {
  const url = new URL(req.url);
  const action = url.pathname.split("/").pop();
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Autorização com JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handler para iniciar o processo de autenticação OAuth
  if (action === "authorize") {
    const redirectUri = `${BASE_URL}/functions/v1/facebook-auth/callback`;
    const state = crypto.randomUUID();
    
    // Armazenar o state para validação posterior
    await supabase.from("facebook_auth_states").insert({
      state,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    const authUrl = new URL("https://www.facebook.com/v17.0/dialog/oauth");
    authUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("scope", FB_SCOPES.join(","));
    authUrl.searchParams.append("response_type", "code");

    return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handler para processar o callback do OAuth
  if (action === "callback") {
    try {
      const params = url.searchParams;
      const code = params.get("code");
      const state = params.get("state");
      
      if (!code || !state) {
        throw new Error("Parâmetros inválidos no callback");
      }
      
      // Verificar se o state é válido
      const { data: stateData, error: stateError } = await supabase
        .from("facebook_auth_states")
        .select("user_id")
        .eq("state", state)
        .single();
      
      if (stateError || !stateData) {
        throw new Error("Estado de autenticação inválido");
      }
      
      if (stateData.user_id !== user.id) {
        throw new Error("Usuário não autorizado");
      }
      
      // Trocar o código pelo token de acesso
      const redirectUri = `${BASE_URL}/functions/v1/facebook-auth/callback`;
      const tokenUrl = new URL("https://graph.facebook.com/v17.0/oauth/access_token");
      tokenUrl.searchParams.append("client_id", FACEBOOK_APP_ID);
      tokenUrl.searchParams.append("client_secret", FACEBOOK_APP_SECRET);
      tokenUrl.searchParams.append("redirect_uri", redirectUri);
      tokenUrl.searchParams.append("code", code);
      
      const tokenResponse = await fetch(tokenUrl.toString());
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error("Falha ao obter token de acesso");
      }
      
      // Obter informações básicas da conta do Facebook
      const graphResponse = await fetch(`https://graph.facebook.com/v17.0/me?fields=id,name,email&access_token=${tokenData.access_token}`);
      const userData = await graphResponse.json();
      
      if (!graphResponse.ok) {
        throw new Error("Falha ao obter dados do usuário Facebook");
      }
      
      // Obter contas de anúncios associadas
      const adsAccountsResponse = await fetch(`https://graph.facebook.com/v17.0/me/adaccounts?fields=id,name,account_id,business_name&access_token=${tokenData.access_token}`);
      const adsAccountsData = await adsAccountsResponse.json();
      
      // Salvar os dados da integração no Supabase
      const { error: integrationError } = await supabase
        .from("facebook_integrations")
        .upsert({
          user_id: user.id,
          facebook_user_id: userData.id,
          facebook_user_name: userData.name,
          facebook_user_email: userData.email,
          access_token: tokenData.access_token,
          token_expires_in: tokenData.expires_in,
          ad_accounts: adsAccountsData.data || [],
          connected_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: "user_id"
        });
      
      if (integrationError) {
        throw new Error(`Falha ao salvar integração: ${integrationError.message}`);
      }
      
      // Limpar o estado de autenticação usado
      await supabase
        .from("facebook_auth_states")
        .delete()
        .eq("state", state);
      
      // Redirecionar para o frontend com sucesso
      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${url.origin}/facebook-success?status=success`
        }
      });
    } catch (error) {
      console.error("Erro no callback OAuth:", error);
      return new Response(null, {
        status: 302,
        headers: {
          "Location": `${url.origin}/facebook-success?status=error&message=${encodeURIComponent(error.message)}`
        }
      });
    }
  }

  // Handler para buscar dados das contas de anúncios
  if (action === "get-ad-data") {
    try {
      // Buscar token de acesso do usuário
      const { data: integration, error: integrationError } = await supabase
        .from("facebook_integrations")
        .select("access_token, ad_accounts")
        .eq("user_id", user.id)
        .single();
      
      if (integrationError || !integration) {
        throw new Error("Integração com Facebook não encontrada");
      }
      
      const body = await req.json();
      const { accountId } = body;
      
      if (!accountId) {
        throw new Error("ID da conta de anúncios não fornecido");
      }
      
      // Buscar dados de campanhas
      const campaignsResponse = await fetch(
        `https://graph.facebook.com/v17.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time,start_time,stop_time,updated_time&access_token=${integration.access_token}`
      );
      const campaignsData = await campaignsResponse.json();
      
      // Buscar dados de pixels
      const pixelsResponse = await fetch(
        `https://graph.facebook.com/v17.0/${accountId}/adspixels?fields=id,name,owner_business,data_use_setting,creation_time,is_created_by_business,last_fired_time,owner_ad_account,code_update_status&access_token=${integration.access_token}`
      );
      const pixelsData = await pixelsResponse.json();
      
      // Se tivermos pixels, buscar os eventos também
      const pixelsWithEvents = [];
      if (pixelsData.data && pixelsData.data.length > 0) {
        for (const pixel of pixelsData.data) {
          // Buscar estatísticas de eventos do pixel
          const pixelStatsResponse = await fetch(
            `https://graph.facebook.com/v17.0/${pixel.id}/stats?aggregation=event&event_type=all&access_token=${integration.access_token}`
          );
          const pixelStatsData = await pixelStatsResponse.json();
          
          pixelsWithEvents.push({
            ...pixel,
            events: pixelStatsData.data || []
          });
        }
      }

      // Adicionar dados à resposta
      return new Response(JSON.stringify({
        campaigns: campaignsData.data || [],
        pixels: pixelsWithEvents,
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Erro ao buscar dados do Facebook:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // Handler para sincronizar dados com o banco de dados
  if (action === "sync-data") {
    try {
      const body = await req.json();
      const { pixels, campaigns, accountId } = body;

      if (!pixels || !campaigns || !accountId) {
        throw new Error("Dados incompletos para sincronização");
      }

      // Mapear pixels para o formato do banco de dados
      for (const pixel of pixels) {
        const eventos_capturados = pixel.events?.map(event => event.event_name) || [];
        const status = pixel.last_fired_time ? 'ativo' : 'inativo';

        // Inserir pixel no banco de dados
        const { error: pixelError } = await supabase
          .from("pixels")
          .upsert({
            id: pixel.id,
            nome_pixel: pixel.name,
            plataforma: 'facebook',
            status,
            user_id: user.id,
            eventos_capturados,
            facebook_account_id: accountId,
            facebook_last_fired_time: pixel.last_fired_time,
            facebook_creation_time: pixel.creation_time,
            criado_em: new Date(pixel.creation_time || Date.now()).toISOString()
          }, {
            onConflict: "id"
          });

        if (pixelError) {
          console.error("Erro ao salvar pixel:", pixelError);
        }

        // Mapear campanhas para o formato do banco de dados
        for (const campaign of campaigns) {
          // Buscar métricas da campanha
          const metricResponse = await fetch(
            `https://graph.facebook.com/v17.0/${campaign.id}/insights?fields=spend,impressions,clicks,actions,conversions,cost_per_action_type&date_preset=last_30d&access_token=${body.access_token}`
          );
          const metricData = await metricResponse.json();
          const metrics = metricData.data?.[0] || {};
          
          // Calcular conversões (se disponível nos dados de ações)
          let conversoes = 0;
          let investimento = 0;
          
          if (metrics.spend) {
            investimento = parseFloat(metrics.spend);
          }
          
          if (metrics.actions) {
            const purchaseActions = metrics.actions.filter(a => 
              a.action_type === 'purchase' || 
              a.action_type === 'omni_purchase' || 
              a.action_type === 'offline_conversion.purchase'
            );
            
            if (purchaseActions.length > 0) {
              conversoes = purchaseActions.reduce((sum, action) => 
                sum + parseInt(action.value || 0), 0);
            }
          }
          
          // Calcular CPA
          const custo_por_conversao = conversoes > 0 ? investimento / conversoes : 0;
          
          // Inserir campanha no banco de dados
          const { error: campaignError } = await supabase
            .from("campanhas")
            .upsert({
              id: campaign.id,
              nome_campanha: campaign.name,
              pixel_id: pixel.id, // Associar a campanha ao pixel
              investimento,
              conversoes,
              custo_por_conversao,
              facebook_account_id: accountId,
              facebook_status: campaign.status,
              facebook_budget: campaign.daily_budget || campaign.lifetime_budget,
              facebook_objective: campaign.objective,
              data: new Date().toISOString()
            }, {
              onConflict: "id"
            });
            
          if (campaignError) {
            console.error("Erro ao salvar campanha:", campaignError);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return new Response(JSON.stringify({ error: "Endpoint não encontrado" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
});
