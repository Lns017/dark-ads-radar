
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import FacebookIntegrationContent from '@/components/facebook/FacebookIntegrationContent';
import SyncConfirmDialog from '@/components/facebook/SyncConfirmDialog';
import { useFacebookIntegration } from '@/hooks/useFacebookIntegration';

const FacebookIntegrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    integrations,
    isLoading,
    syncDialog,
    setSyncDialog,
    selectedAccount,
    syncProgress,
    initiateAuth,
    openSyncDialog,
    startSync
  } = useFacebookIntegration();
  
  // Handle OAuth callback parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    
    if (status === 'success') {
      toast.success('Conta do Facebook conectada com sucesso!');
      navigate('/facebook-integration', { replace: true });
    } else if (status === 'error') {
      toast.error(`Erro na conexão: ${message || 'Não foi possível conectar sua conta'}`);
      navigate('/facebook-integration', { replace: true });
    }
  }, [location, navigate]);

  return (
    <DashboardLayout title="Integração com Facebook Ads">
      <FacebookIntegrationContent
        isLoading={isLoading}
        integrations={integrations}
        syncProgress={syncProgress}
        onConnect={initiateAuth}
        onSyncClick={openSyncDialog}
      />

      {/* Sync confirmation dialog */}
      <SyncConfirmDialog 
        open={syncDialog}
        onOpenChange={setSyncDialog}
        selectedAccount={selectedAccount}
        onConfirm={startSync}
      />
    </DashboardLayout>
  );
};

export default FacebookIntegrationPage;
