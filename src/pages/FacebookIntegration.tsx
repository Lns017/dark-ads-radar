
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Facebook, RefreshCw, Check, X, ArrowRight } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FacebookIntegration, AdAccount, SyncProgress } from '@/types/facebook';

const FacebookIntegrationPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [syncDialog, setSyncDialog] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress[]>([]);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Verificar se estamos voltando do processo de OAuth com status
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

  // Consultar integrações do Facebook existentes
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['facebook-integrations'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('facebook_integrations')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as FacebookIntegration[];
    },
    enabled: !!user
  });

  // Iniciar autenticação OAuth do Facebook
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
      
      // Redirecionar para a URL de autorização do Facebook
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erro ao iniciar autenticação:', error);
      toast.error('Não foi possível conectar ao Facebook. Tente novamente mais tarde.');
    }
  };

  // Buscar dados do Facebook
  const fetchFacebookData = async (accountId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Usuário não autenticado');
      }
      
      // Atualizar o progresso
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
      
      // Sincronizar os dados com o banco de dados
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
      
      // Invalidar as queries relacionadas para que sejam atualizadas
      queryClient.invalidateQueries({ queryKey: ['pixels'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      
      toast.success('Dados sincronizados com sucesso!');
      
      // Limpar o progresso após alguns segundos
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
  
  // Exibir diálogo de sincronização
  const openSyncDialog = (account: AdAccount) => {
    setSelectedAccount(account);
    setSyncDialog(true);
  };
  
  // Iniciar sincronização
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
                <div className="text-center bg-card p-8 rounded-lg border border-border">
                  <Facebook className="mx-auto h-16 w-16 text-facebook mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Conecte sua conta do Facebook Ads</h2>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Conecte sua conta do Facebook para importar automaticamente dados de campanhas e pixels,
                    permitindo monitorar o desempenho diretamente no dashboard.
                  </p>
                  <Button onClick={startAuth} className="bg-facebook hover:bg-facebook/90 text-white">
                    <Facebook className="mr-2 h-4 w-4" />
                    Conectar Facebook Ads
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {integrations.map((integration) => (
                    <Card key={integration.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Facebook className="h-10 w-10 text-facebook mr-4" />
                          <div>
                            <h3 className="text-lg font-semibold">{integration.facebook_user_name}</h3>
                            <p className="text-sm text-muted-foreground">{integration.facebook_user_email}</p>
                          </div>
                        </div>
                        <div>
                          <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                            {integration.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-2">Contas de Anúncios Disponíveis</h4>
                        {integration.ad_accounts && integration.ad_accounts.length > 0 ? (
                          <div className="grid gap-4">
                            {integration.ad_accounts.map((account) => (
                              <div key={account.id} className="bg-card border border-border p-4 rounded-md flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{account.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ID da conta: {account.account_id}
                                  </p>
                                  {account.business_name && (
                                    <p className="text-xs text-muted-foreground">
                                      Business: {account.business_name}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  {syncProgress.find(p => p.accountId === account.id) ? (
                                    <div className="text-sm mr-2">
                                      {syncProgress.find(p => p.accountId === account.id)?.status === 'loading' && (
                                        <div className="flex items-center text-muted-foreground">
                                          <LoadingSpinner size="sm" withText={false} className="mr-2" />
                                          {syncProgress.find(p => p.accountId === account.id)?.message}
                                        </div>
                                      )}
                                      {syncProgress.find(p => p.accountId === account.id)?.status === 'success' && (
                                        <div className="flex items-center text-green-500">
                                          <Check className="h-4 w-4 mr-1" />
                                          {syncProgress.find(p => p.accountId === account.id)?.message}
                                        </div>
                                      )}
                                      {syncProgress.find(p => p.accountId === account.id)?.status === 'error' && (
                                        <div className="flex items-center text-red-500">
                                          <X className="h-4 w-4 mr-1" />
                                          {syncProgress.find(p => p.accountId === account.id)?.message}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="ml-2"
                                      onClick={() => openSyncDialog(account)}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      Sincronizar Dados
                                    </Button>
                                  )}
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="ml-2"
                                    onClick={() => navigate('/pixels')}
                                  >
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Ver Pixels
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Nenhuma conta de anúncios encontrada.</p>
                        )}
                      </div>
                      
                      <div className="flex justify-between border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">
                          Conectado em {new Date(integration.connected_at).toLocaleDateString('pt-BR')}
                        </p>
                        <Button variant="outline" size="sm" onClick={startAuth}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reconectar
                        </Button>
                      </div>
                    </Card>
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

      {/* Diálogo de confirmação de sincronização */}
      <Dialog open={syncDialog} onOpenChange={setSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronizar Dados do Facebook</DialogTitle>
            <DialogDescription>
              Esta ação vai buscar todos os pixels e campanhas da conta {selectedAccount?.name} e importar para o seu dashboard.
              Este processo pode levar alguns segundos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={startSync}>
              Iniciar Sincronização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacebookIntegrationPage;
