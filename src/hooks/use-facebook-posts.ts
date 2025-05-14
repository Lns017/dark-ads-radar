
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FacebookPost } from '@/types/facebook';

export const useFacebookPosts = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['facebook-recent-posts'],
    queryFn: async () => {
      if (!user) return [];
      
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
          return [];
        }
        
        // Get posts from your edge function or API
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error('Usuário não autenticado');
        }
        
        const response = await fetch('/functions/v1/facebook-auth/get-recent-posts', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao buscar posts recentes');
        }
        
        const postsData = await response.json();
        return postsData.slice(0, 5) as FacebookPost[]; // Get only 5 most recent
      } catch (error: any) {
        console.error('Erro ao buscar posts recentes:', error);
        setError(error.message || 'Falha na obtenção dos posts');
        return [];
      }
    },
    enabled: !!user
  });

  return { posts, isLoading, error };
};
