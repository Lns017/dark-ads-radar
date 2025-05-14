
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { FacebookIntegration, AdAccount, SyncProgress } from '@/types/facebook';
import { fetchFacebookIntegrations, startFacebookAuth, fetchFacebookAdData } from '@/services/facebookIntegrationService';

export const useFacebookIntegration = () => {
  const [syncDialog, setSyncDialog] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<AdAccount | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress[]>([]);
  
  const { user } = useAuth();
  
  // Fetch Facebook integrations
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['facebook-integrations'],
    queryFn: async () => {
      if (!user) return [];
      return await fetchFacebookIntegrations(user.id);
    },
    enabled: !!user
  });

  // Begin OAuth flow
  const initiateAuth = async () => {
    const authUrl = await startFacebookAuth();
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  // Update sync progress
  const updateSyncProgress = (accountId: string, status: 'idle' | 'loading' | 'success' | 'error', message: string) => {
    setSyncProgress(prev => [
      ...prev.filter(p => p.accountId !== accountId),
      { accountId, status, message }
    ]);
    
    // Clear success/error messages after a delay
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setSyncProgress(prev => prev.filter(p => p.accountId !== accountId));
      }, 5000);
    }
  };
  
  // Fetch Facebook data and sync it
  const syncFacebookData = async (accountId: string) => {
    return fetchFacebookAdData(accountId, updateSyncProgress);
  };
  
  // Open sync dialog
  const openSyncDialog = (account: AdAccount) => {
    setSelectedAccount(account);
    setSyncDialog(true);
  };
  
  // Start sync process
  const startSync = async () => {
    if (selectedAccount) {
      await syncFacebookData(selectedAccount.id);
      setSyncDialog(false);
    }
  };

  return {
    integrations,
    isLoading,
    syncDialog,
    setSyncDialog,
    selectedAccount,
    syncProgress,
    initiateAuth,
    openSyncDialog,
    startSync
  };
};
