
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-primary">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Página não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          A página que você está procurando não existe ou foi removida.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="inline-flex items-center"
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
