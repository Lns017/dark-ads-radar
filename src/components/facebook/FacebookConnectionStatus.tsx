
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import FacebookApiStatus from './FacebookApiStatus';

const FacebookConnectionStatus = ({ 
  onConnectionChange 
}: { 
  onConnectionChange: (hasConnection: boolean | null, apiError: string | null) => void
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    const hasConnection = !!integration;
    
    // Notify parent component about connection state and errors
    onConnectionChange(hasConnection, apiError);
    
    // Check API status if we have an integration
    if (integration) {
      checkApiStatus();
    }
  }, [integration, apiError, checkApiStatus, onConnectionChange]);

  return (
    <>
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
    </>
  );
};

export default FacebookConnectionStatus;
