
import React from 'react';
import { Check, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { SyncProgress } from '@/types/facebook';

interface SyncStatusIndicatorProps {
  syncProgress: SyncProgress | undefined;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ syncProgress }) => {
  if (!syncProgress) return null;

  if (syncProgress.status === 'loading') {
    return (
      <div className="flex items-center text-muted-foreground">
        <LoadingSpinner size="sm" withText={false} className="mr-2" />
        {syncProgress.message}
      </div>
    );
  }

  if (syncProgress.status === 'success') {
    return (
      <div className="flex items-center text-green-500">
        <Check className="h-4 w-4 mr-1" />
        {syncProgress.message}
      </div>
    );
  }

  if (syncProgress.status === 'error') {
    return (
      <div className="flex items-center text-red-500">
        <X className="h-4 w-4 mr-1" />
        {syncProgress.message}
      </div>
    );
  }

  return null;
};

export default SyncStatusIndicator;
