
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MessageSquare, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
}

interface Post {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  metrics: PostMetrics;
  type: string;
  picture?: string;
}

const RecentPostsList = () => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Fetch recent posts
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
        return postsData.slice(0, 5) as Post[]; // Get only 5 most recent
      } catch (error: any) {
        console.error('Erro ao buscar posts recentes:', error);
        setError(error.message || 'Falha na obtenção dos posts');
        return [];
      }
    },
    enabled: !!user
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-md p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg">Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum post recente encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Posts Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-md p-3">
              <div className="flex items-center mb-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formatDate(post.created_time)}</span>
                {post.type && (
                  <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-xs">
                    {post.type === 'photo' ? (
                      <span className="flex items-center">
                        <Image className="h-3 w-3 mr-1" />
                        Foto
                      </span>
                    ) : post.type}
                  </span>
                )}
              </div>
              
              {post.message && (
                <p className="text-sm mb-3 line-clamp-2">{post.message}</p>
              )}
              
              {post.picture && (
                <div className="mb-3 h-32 overflow-hidden rounded">
                  <img 
                    src={post.picture} 
                    alt="Post preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex space-x-3">
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1 text-facebook" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 14a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5zm15.71 7.71a1 1 0 0 1-1.42 0l-4-4a1 1 0 0 1 1.42-1.42L20 19.59l3.29-3.3a1 1 0 0 1 1.42 1.42l-4 4z"/>
                    </svg>
                    {post.metrics.likes} curtidas
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {post.metrics.comments} comentários
                  </span>
                  <span className="flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 9v5a3 3 0 01-3 3h-5l-3 3v-3H6a3 3 0 01-3-3V9a3 3 0 013-3h9a3 3 0 013 3z"/>
                    </svg>
                    {post.metrics.shares} compartilhamentos
                  </span>
                </div>
                
                <a 
                  href={post.permalink_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Ver no Facebook
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPostsList;
