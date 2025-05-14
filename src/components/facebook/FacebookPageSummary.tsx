
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FacebookPageData {
  id: string;
  name: string;
  likes: number;
  reach: number;
}

const FacebookPageSummary = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Fetch Facebook page data
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['facebook-page-data'],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        // First get the active integration
        const { data: integration, error: integrationError } = await supabase
          .from('facebook_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
          
        if (integrationError) throw integrationError;
        if (!integration) {
          setError('Nenhuma integração com Facebook encontrada');
          return null;
        }
        
        // Get the page data from your edge function or API
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch('/functions/v1/facebook-auth/get-page-data', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao buscar dados da página');
        }
        
        const pageData = await response.json();
        return pageData as FacebookPageData;
        
      } catch (error: any) {
        console.error('Erro ao buscar dados da página:', error);
        setError(error.message || 'Falha na obtenção dos dados');
        return null;
      }
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados da Página</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-red-500">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Erro ao carregar dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-sm mt-2">Verifique sua conexão com o Facebook ou reconecte sua conta.</p>
        </CardContent>
      </Card>
    );
  }

  if (!pageData) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg">Dados não disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Conecte sua página do Facebook para visualizar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dados da Página</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome da Página</p>
            <p className="font-medium">{pageData.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ID da Página</p>
            <p className="font-medium">{pageData.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Curtidas</p>
            <p className="font-medium">{pageData.likes.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Alcance</p>
            <p className="font-medium">{pageData.reach.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacebookPageSummary;
