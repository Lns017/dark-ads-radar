
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { AdAccount } from '@/types/facebook';

interface SyncConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccount: AdAccount | null;
  onConfirm: () => void;
}

const SyncConfirmDialog: React.FC<SyncConfirmDialogProps> = ({ 
  open, onOpenChange, selectedAccount, onConfirm 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sincronizar Dados do Facebook</DialogTitle>
          <DialogDescription>
            Esta ação vai buscar todos os pixels e campanhas da conta {selectedAccount?.name} e importar para o seu dashboard.
            Este processo pode levar alguns segundos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>
            Iniciar Sincronização
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncConfirmDialog;
