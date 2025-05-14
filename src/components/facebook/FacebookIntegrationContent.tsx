
import React from 'react';
import { Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';
import FacebookAccountCard from '@/components/facebook/FacebookAccountCard';
import EmptyStateConnect from '@/components/facebook/EmptyStateConnect';
import { AdAccount, FacebookIntegration, SyncProgress } from '@/types/facebook';

interface FacebookIntegrationContentProps {
  isLoading: boolean;
  integrations: FacebookIntegration[] | undefined;
  syncProgress: SyncProgress[];
  onConnect: () => void;
  onSyncClick: (account: AdAccount) => void;
}

const FacebookIntegrationContent: React.FC<FacebookIntegrationContentProps> = ({
  isLoading,
  integrations,
  syncProgress,
  onConnect,
  onSyncClick
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {(!integrations || integrations.length === 0) ? (
        <EmptyStateConnect onConnect={onConnect} />
      ) : (
        <div className="space-y-6">
          {integrations.map((integration) => (
            <FacebookAccountCard 
              key={integration.id}
              integration={integration}
              syncProgress={syncProgress}
              onReconnect={onConnect}
              onSyncClick={onSyncClick}
            />
          ))}
        </div>
      )}
      
      {integrations && integrations.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button onClick={onConnect} className="bg-facebook hover:bg-facebook/90 text-white">
            <Facebook className="mr-2 h-4 w-4" />
            Conectar Outra Conta Facebook
          </Button>
        </div>
      )}
    </>
  );
};

export default FacebookIntegrationContent;
