
import React from 'react';
import { Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateConnectProps {
  onConnect: () => void;
}

const EmptyStateConnect: React.FC<EmptyStateConnectProps> = ({ onConnect }) => {
  return (
    <div className="text-center bg-card p-8 rounded-lg border border-border">
      <Facebook className="mx-auto h-16 w-16 text-facebook mb-4" />
      <h2 className="text-xl font-semibold mb-2">Conecte sua conta do Facebook Ads</h2>
      <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
        Conecte sua conta do Facebook para importar automaticamente dados de campanhas e pixels,
        permitindo monitorar o desempenho diretamente no dashboard.
      </p>
      <Button onClick={onConnect} className="bg-facebook hover:bg-facebook/90 text-white">
        <Facebook className="mr-2 h-4 w-4" />
        Conectar Facebook Ads
      </Button>
    </div>
  );
};

export default EmptyStateConnect;
