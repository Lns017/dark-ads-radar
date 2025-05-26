
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  otp: z.string().min(6, 'O código OTP deve ter 6 dígitos'),
});

type FormValues = z.infer<typeof formSchema>;

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    // Extract email from location state or query params
    const searchParams = new URLSearchParams(location.search);
    const emailFromParams = searchParams.get('email');
    const emailFromState = location.state?.email;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromParams) {
      setEmail(emailFromParams);
    } else {
      // If no email is found, redirect to auth page
      navigate('/auth');
    }
  }, [location, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (!email) {
      toast.error('Email não encontrado. Por favor, tente novamente.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: values.otp,
        type: 'email'
      });

      if (error) {
        throw error;
      }

      toast.success('Email verificado com sucesso!');
      // Redirect to dashboard after successful verification
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao verificar email:', error);
      toast.error(error.message || 'Código incorreto ou expirado. Por favor, verifique e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email não encontrado. Por favor, tente novamente.');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        throw error;
      }

      toast.success('Um novo código foi enviado para o seu email.');
    } catch (error: any) {
      console.error('Erro ao reenviar código:', error);
      toast.error(error.message || 'Não foi possível enviar um novo código. Por favor, tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">PixelTrack</h1>
          <p className="text-muted-foreground mt-2">
            Verifique seu email para continuar
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-lg border border-border">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Verificação de Email</h2>
            <p className="text-muted-foreground text-sm">
              Enviamos um código de 6 dígitos para{' '}
              <span className="font-medium text-primary">{email}</span>.
              Por favor, insira o código abaixo para verificar sua conta.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="mx-auto">
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup className="gap-2 justify-center">
                          <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                          <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Verificando...
                    </>
                  ) : (
                    'Verificar Código'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isResending}
                  onClick={handleResendCode}
                >
                  {isResending ? (
                    <>
                      <span className="animate-spin mr-2">◌</span>
                      Reenviando...
                    </>
                  ) : (
                    'Reenviar Código'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="text-center mt-4">
          <Button
            variant="link"
            onClick={() => navigate('/auth')}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Voltar para a tela de login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
