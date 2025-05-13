
import React from 'react';
import { Facebook, RefreshCw } from 'lucide-react';
import { FacebookIntegration } from '@/types/facebook';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import AdAccountItem from './AdAccountItem';
import { SyncProgress } from '@/types/facebook';

interface FacebookAccountCardProps {
  integration: FacebookIntegration;
  syncProgress: SyncProgress[];
  onReconnect: () => void;
  onSyncClick: (account: AdAccount) => void;
}

import { AdAccount } from '@/types/facebook';

const FacebookAccountCard: React.FC<FacebookAccountCardProps> = ({ 
  integration, syncProgress, onReconnect, onSyncClick 
}) => {
  return (
    <Card key={integration.id} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Facebook className="h-10 w-10 text-facebook mr-4" />
          <div>
            <h3 className="text-lg font-semibold">{integration.facebook_user_name}</h3>
            <p className="text-sm text-muted-foreground">{integration.facebook_user_email}</p>
          </div>
        </div>
        <div>
          <Badge variant={integration.is_active ? 'default' : 'secondary'}>
            {integration.is_active ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Contas de Anúncios Disponíveis</h4>
        {integration.ad_accounts && integration.ad_accounts.length > 0 ? (
          <div className="grid gap-4">
            {integration.ad_accounts.map((account) => (
              <AdAccountItem 
                key={account.id} 
                account={account} 
                syncProgress={syncProgress}
                onSyncClick={onSyncClick}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma conta de anúncios encontrada.</p>
        )}
      </div>
      
      <div className="flex justify-between border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Conectado em {new Date(integration.connected_at).toLocaleDateString('pt-BR')}
        </p>
        <Button variant="outline" size="sm" onClick={onReconnect}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reconectar
        </Button>
      </div>
    </Card>
  );
};

export default FacebookAccountCard;
