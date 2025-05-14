
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AdAccount, SyncProgress } from '@/types/facebook';

// Start Facebook OAuth
export const startFacebookAuth = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      toast.error('Você precisa estar logado para conectar sua conta do Facebook');
      return null;
    }

    const response = await fetch('/functions/v1/facebook-auth/authorize', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.session.access_token}`
      }
    });
    
    const { authUrl, error } = await response.json();
    
    if (error) {
      toast.error(`Erro ao iniciar autenticação: ${error}`);
      return null;
    }
    
    return authUrl;
  } catch (error) {
    console.error('Erro ao iniciar autenticação:', error);
    toast.error('Não foi possível conectar ao Facebook. Tente novamente mais tarde.');
    return null;
  }
};

// Fetch Facebook Ad data
export const fetchFacebookAdData = async (accountId: string, 
  updateProgress: (accountId: string, status: 'loading' | 'success' | 'error', message: string) => void) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Usuário não autenticado');
    }
    
    // Update progress
    updateProgress(accountId, 'loading', 'Obtendo dados do Facebook...');
    
    const response = await fetch('/functions/v1/facebook-auth/get-ad-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({ accountId })
    });
    
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Erro ao buscar dados');
    }
    
    updateProgress(accountId, 'loading', 'Sincronizando dados com o banco de dados...');
    
    // Sync data with database
    const syncResponse = await fetch('/functions/v1/facebook-auth/sync-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({
        pixels: data.pixels,
        campaigns: data.campaigns,
        accountId,
        access_token: data.access_token
      })
    });
    
    const syncResult = await syncResponse.json();
    
    if (!syncResponse.ok || syncResult.error) {
      throw new Error(syncResult.error || 'Erro ao sincronizar dados');
    }
    
    updateProgress(accountId, 'success', 'Dados sincronizados com sucesso!');
    
    toast.success('Dados sincronizados com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Erro ao buscar dados:', error);
    updateProgress(accountId, 'error', `Erro: ${error.message}`);
    
    toast.error(`Falha ao sincronizar dados: ${error.message}`);
    return false;
  }
};

// Fetch user's Facebook integrations
export const fetchFacebookIntegrations = async (userId: string) => {
  const { data, error } = await supabase
    .from('facebook_integrations')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  
  // Transform the data to match our FacebookIntegration interface
  return (data as any[]).map(item => {
    // Ensure ad_accounts is properly typed as AdAccount[]
    const adAccounts = Array.isArray(item.ad_accounts) 
      ? item.ad_accounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          account_id: account.account_id,
          business_name: account.business_name
        }))
      : [];
      
    return {
      ...item,
      ad_accounts: adAccounts
    };
  });
};
