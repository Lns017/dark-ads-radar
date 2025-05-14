
import { Calendar, MessageSquare, Image } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FacebookPost } from '@/types/facebook';

interface FacebookPostCardProps {
  post: FacebookPost;
}

const FacebookPostCard = ({ post }: FacebookPostCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };

  return (
    <div className="border rounded-md p-3">
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
  );
};

export default FacebookPostCard;
