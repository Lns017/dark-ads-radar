
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WifiHigh, WifiOff } from 'lucide-react';

const FacebookApiStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const { user } = useAuth();

  // Check if we have an active Facebook integration
  const { data: integration, isLoading } = useQuery({
    queryKey: ['facebook-connection-status'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('facebook_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  useEffect(() => {
    // Set connection status based on integration data
    if (isLoading) return;
    setIsOnline(!!integration);
  }, [integration, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center text-sm font-medium text-muted-foreground animate-pulse">
        <div className="h-2 w-2 rounded-full bg-gray-300 mr-2"></div>
        Verificando conexão...
      </div>
    );
  }

  return (
    <div className={`flex items-center text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
      {isOnline ? (
        <>
          <WifiHigh className="h-4 w-4 mr-1.5" />
          <span>API Facebook conectada</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 mr-1.5" />
          <span>API Facebook offline</span>
        </>
      )}
    </div>
  );
};

export default FacebookApiStatus;
