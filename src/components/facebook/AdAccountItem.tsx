
import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AdAccount, SyncProgress } from '@/types/facebook';
import SyncStatusIndicator from './SyncStatusIndicator';

interface AdAccountItemProps {
  account: AdAccount;
  syncProgress: SyncProgress[];
  onSyncClick: (account: AdAccount) => void;
}

const AdAccountItem: React.FC<AdAccountItemProps> = ({ account, syncProgress, onSyncClick }) => {
  const navigate = useNavigate();
  const currentSyncProgress = syncProgress.find(p => p.accountId === account.id);

  return (
    <div className="bg-card border border-border p-4 rounded-md flex items-center justify-between">
      <div>
        <p className="font-medium">{account.name}</p>
        <p className="text-sm text-muted-foreground">
          ID da conta: {account.account_id}
        </p>
        {account.business_name && (
          <p className="text-xs text-muted-foreground">
            Business: {account.business_name}
          </p>
        )}
      </div>
      <div className="flex items-center">
        {currentSyncProgress ? (
          <div className="text-sm mr-2">
            <SyncStatusIndicator syncProgress={currentSyncProgress} />
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            className="ml-2"
            onClick={() => onSyncClick(account)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar Dados
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          className="ml-2"
          onClick={() => navigate('/pixels')}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Ver Pixels
        </Button>
      </div>
    </div>
  );
};

export default AdAccountItem;
