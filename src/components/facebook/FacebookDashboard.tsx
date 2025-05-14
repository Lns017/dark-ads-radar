
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import FacebookApiStatus from '@/components/facebook/FacebookApiStatus';
import FacebookPageSummary from '@/components/facebook/FacebookPageSummary';
import RecentPostsList from '@/components/facebook/RecentPostsList';
import EmptyStateConnect from '@/components/facebook/EmptyStateConnect';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const FacebookDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasConnection, setHasConnection] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check if we have an active Facebook integration
  const { data: integration, isLoading } = useQuery({
    queryKey: ['facebook-integration-status'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('facebook_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) {
        console.error('Erro ao verificar integração:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user
  });

  // Check API connectivity
  const { refetch: checkApiStatus } = useQuery({
    queryKey: ['facebook-api-health'],
    queryFn: async () => {
      if (!user || !integration) return { status: 'offline' };
      
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch('/functions/v1/facebook-auth/check-status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API não está respondendo corretamente');
        }
        
        return { status: 'online' };
      } catch (error: any) {
        console.error('Erro ao verificar status da API:', error);
        setApiError(error.message);
        return { status: 'error', message: error.message };
      }
    },
    enabled: false, // Don't run automatically
    retry: false,
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

  useEffect(() => {
    setHasConnection(!!integration);
    
    // Check API status if we have an integration
    if (integration) {
      checkApiStatus();
    }
  }, [integration, checkApiStatus]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-24 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // If no connection, show connect state
  if (!hasConnection) {
    return <EmptyStateConnect onConnect={startAuth} />;
  }

  return (
    <div className="space-y-6">
      {/* Status and API health */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold">Facebook Insights</h2>
        <FacebookApiStatus />
      </div>
      
      {/* API Error alert */}
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Erro na API do Facebook: {apiError}. 
            <button 
              onClick={() => navigate('/facebook-integration')} 
              className="ml-2 underline"
            >
              Verifique sua conexão
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <FacebookPageSummary />
        </div>
        <div className="md:col-span-2">
          <RecentPostsList />
        </div>
      </div>
    </div>
  );
};

export default FacebookDashboard;
