
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import FacebookConnectionStatus from '@/components/facebook/FacebookConnectionStatus';
import FacebookPageSummary from '@/components/facebook/FacebookPageSummary';
import RecentPostsList from '@/components/facebook/RecentPostsList';
import EmptyStateConnect from '@/components/facebook/EmptyStateConnect';
import FacebookDashboardLoading from '@/components/facebook/FacebookDashboardLoading';
import { supabase } from '@/integrations/supabase/client';

const FacebookDashboard = () => {
  const { user } = useAuth();
  const [hasConnection, setHasConnection] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Handle connection status changes from the FacebookConnectionStatus component
  const handleConnectionChange = (
    connectionStatus: boolean | null, 
    connectionApiError: string | null
  ) => {
    setHasConnection(connectionStatus);
    setApiError(connectionApiError);
  };

  // Check if we have an active Facebook integration (for loading state only)
  const { isLoading } = useQuery({
    queryKey: ['facebook-integration-check'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .from('facebook_integrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      return data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return <FacebookDashboardLoading />;
  }

  // If no connection, show connect state
  if (!hasConnection) {
    return <EmptyStateConnect onConnect={startAuth} />;
  }

  return (
    <div className="space-y-6">
      {/* Status and API health */}
      <FacebookConnectionStatus onConnectionChange={handleConnectionChange} />
      
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
