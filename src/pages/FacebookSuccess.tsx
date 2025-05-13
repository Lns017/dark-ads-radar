
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, AlertCircle } from 'lucide-react';

const FacebookSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    
    // Redirecionar automaticamente após alguns segundos
    const timer = setTimeout(() => {
      navigate('/facebook-integration');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [location, navigate]);

  // Extrair parâmetros da URL
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg border border-border text-center">
        {status === 'success' ? (
          <>
            <div className="bg-success/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Conexão Bem-sucedida!</h1>
            <p className="text-muted-foreground mb-4">
              Sua conta do Facebook foi conectada com sucesso. Você será redirecionado automaticamente...
            </p>
          </>
        ) : (
          <>
            <div className="bg-destructive/20 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Erro na Conexão</h1>
            <p className="text-muted-foreground mb-4">
              {message || 'Não foi possível conectar sua conta do Facebook. Tente novamente mais tarde.'}
            </p>
          </>
        )}
        <div className="animate-pulse text-sm text-muted-foreground">
          Redirecionando em alguns segundos...
        </div>
      </div>
    </div>
  );
};

export default FacebookSuccess;
