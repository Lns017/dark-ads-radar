
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, LogIn, Sparkles, Play } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAuth = async (values: AuthFormValues) => {
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (error) throw error;
        
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        // Sign up with OTP verification flow
        const { error, data } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              email_confirm_method: 'otp'
            }
          },
        });
        
        if (error) throw error;

        if (data.user?.identities?.length === 0) {
          toast.error('Este email já está cadastrado. Por favor faça login.');
        } else {
          // Redirect to verification page
          toast.success('Conta criada! Verifique seu email para o código de confirmação.');
          navigate('/verify', { state: { email: values.email } });
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      toast.error(error.message || 'Ocorreu um erro durante a autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    
    try {
      // Create a demo account with timestamp to ensure uniqueness
      const timestamp = Date.now();
      const demoEmail = `demo${timestamp}@pixeltrack.demo`;
      const demoPassword = 'demo123456';
      
      // First try to sign up the demo user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            email_confirm_method: 'auto_confirm'
          }
        },
      });
      
      if (signUpError) {
        // If signup fails, try to login (user might already exist)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPassword,
        });
        
        if (signInError) throw signInError;
      }
      
      toast.success('Conta demo criada e logada com sucesso!');
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao criar conta demo:', error);
      toast.error('Erro ao criar conta demo. Tente novamente.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-2">
            PixelTrack
          </h1>
          <p className="text-gray-300">
            {authMode === 'login' ? 'Bem-vindo de volta' : 'Comece sua jornada'}
          </p>
        </div>

        {/* Demo Button */}
        <div className="mb-6">
          <Button 
            onClick={handleDemoLogin}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
            disabled={isDemoLoading || isLoading}
          >
            {isDemoLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                Criando conta demo...
              </span>
            ) : (
              <span className="flex items-center">
                <Play className="mr-2 h-4 w-4" />
                Testar com Conta Demo
              </span>
            )}
          </Button>
          <p className="text-center text-gray-400 text-xs mt-2">
            Acesso instantâneo sem cadastro
          </p>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-300">ou</span>
          </div>
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl animate-scale-in">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {authMode === 'login' ? 'Entrar' : 'Criar Conta'}
            </h2>
            <p className="text-gray-300 text-sm">
              {authMode === 'login' 
                ? 'Acesse seu dashboard de analytics' 
                : 'Monitore seus pixels em tempo real'
              }
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com" 
                        className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all duration-300" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20 transition-all duration-300" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {authMode === 'login' ? (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Criar Conta
                      </>
                    )}
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="w-full text-center text-gray-300 text-sm hover:text-white transition-colors duration-300 group"
            >
              {authMode === 'login'
                ? (
                  <>
                    Não tem uma conta? 
                    <span className="text-purple-300 ml-1 group-hover:text-purple-200">
                      Cadastre-se
                    </span>
                  </>
                )
                : (
                  <>
                    Já possui uma conta? 
                    <span className="text-purple-300 ml-1 group-hover:text-purple-200">
                      Entre
                    </span>
                  </>
                )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">
            Protegido por criptografia de ponta a ponta
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
