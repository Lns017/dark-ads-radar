
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import FacebookAccountCard from '@/components/facebook/FacebookAccountCard';
import EmptyStateConnect from '@/components/facebook/EmptyStateConnect';
import SyncConfirmDialog from '@/components/facebook/SyncConfirmDialog';
import { FacebookIntegration, AdAccount, SyncProgress } from '@/types/facebook';
import { Json } from '@/integrations/supabase/types';

const FacebookIntegrationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [syncDialog, setSyncDialog] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for OAuth status
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    
    if (status === 'success') {
      toast.success('Conta do Facebook conectada com sucesso!');
      navigate('/facebook-integration', { replace: true });
    } else if (status === 'error') {
      toast.error(`Erro na conexão: ${message || 'Não foi possível conectar sua conta'}`);
      navigate('/facebook-integration', { replace: true });
    }
  }, [location, navigate]);

  // Fetch Facebook integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['facebook-integrations'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('facebook_integrations')
        .select('*')
        .eq('user_id', user.id);
      
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
        } as FacebookIntegration;
      });
    },
    enabled: !!user
  });

  // Start Facebook OAuth
  const startAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Você precisa estar logado para conectar sua conta do Facebook');
        return;
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
        return;
      }
      
      // Redirect to Facebook auth URL
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
      toast.error('Não foi possível conectar ao Facebook. Tente novamente mais tarde.');
    }
  };

  // Fetch Facebook data
  const fetchFacebookData = async (accountId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado');
      }
      
      // Update progress
      setSyncProgress(prev => [
        ...prev.filter(p => p.accountId !== accountId),
        { accountId, status: 'loading', message: 'Obtendo dados do Facebook...' }
      ]);
      
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
      
      setSyncProgress(prev => [
        ...prev.filter(p => p.accountId !== accountId),
        { 
          accountId, 
          status: 'loading', 
          message: 'Sincronizando dados com o banco de dados...' 
        }
      ]);
      
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
      
      setSyncProgress(prev => [
        ...prev.filter(p => p.accountId !== accountId),
        { accountId, status: 'success', message: 'Dados sincronizados com sucesso!' }
      ]);
      
      toast.success('Dados sincronizados com sucesso!');
      
      // Clear progress after a few seconds
      setTimeout(() => {
        setSyncProgress(prev => prev.filter(p => p.accountId !== accountId));
      }, 5000);
      
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      setSyncProgress(prev => [
        ...prev.filter(p => p.accountId !== accountId),
        { 
          accountId, 
          status: 'error', 
          message: `Erro: ${error.message}` 
        }
      ]);
      
      toast.error(`Falha ao sincronizar dados: ${error.message}`);
    }
  };
  
  // Open sync dialog
  const openSyncDialog = (account: AdAccount) => {
    setSelectedAccount(account);
    setSyncDialog(true);
  };
  
  // Start sync
  const startSync = () => {
    if (selectedAccount) {
      fetchFacebookData(selectedAccount.id);
      setSyncDialog(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <main className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Integração com Facebook Ads</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {(!integrations || integrations.length === 0) ? (
                <EmptyStateConnect onConnect={startAuth} />
              ) : (
                <div className="space-y-6">
                  {integrations.map((integration) => (
                    <FacebookAccountCard 
                      key={integration.id}
                      integration={integration}
                      syncProgress={syncProgress}
                      onReconnect={startAuth}
                      onSyncClick={openSyncDialog}
                    />
                  ))}
                </div>
              )}
              
              {integrations && integrations.length > 0 && (
                <div className="flex justify-center mt-6">
                  <Button onClick={startAuth} className="bg-facebook hover:bg-facebook/90 text-white">
                    <Facebook className="mr-2 h-4 w-4" />
                    Conectar Outra Conta Facebook
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Sync confirmation dialog */}
      <SyncConfirmDialog 
        open={syncDialog}
        onOpenChange={setSyncDialog}
        selectedAccount={selectedAccount}
        onConfirm={startSync}
      />
    </div>
  );
};

export default FacebookIntegrationPage;
