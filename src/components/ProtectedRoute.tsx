import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, session } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated and email is confirmed
      const hasConfirmedEmail = session?.user?.email_confirmed_at !== null;
      setIsAuthorized(!!user && hasConfirmedEmail);
      
      // If user exists but email is not confirmed, redirect to verification
      if (user && !hasConfirmedEmail && location.pathname !== '/verify') {
        setIsAuthorized(false);
      }
    }
  }, [user, isLoading, session, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    // If user exists but email is not confirmed, redirect to verify
    if (user && session?.user?.email_confirmed_at === null) {
      return <Navigate to="/verify" state={{ email: user.email }} replace />;
    }
    // Otherwise redirect to auth
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
