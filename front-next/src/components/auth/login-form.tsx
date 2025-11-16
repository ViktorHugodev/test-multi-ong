// ========================================
// Arquivo: front-next/src/components/auth/login-form.tsx
// Status: ✏️ CORRIGIDO
// Problema Encontrado: Dupla autenticação (NextAuth + Backend API)
// Solução Aplicada: Usar apenas NextAuth como fonte única
// ========================================

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('[LoginForm] Attempting login for:', email);

    try {
      // Autenticação única via NextAuth
      // NextAuth valida credenciais diretamente no banco via Prisma
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Não redirecionar automaticamente
        callbackUrl,
      });

      console.log('[LoginForm] SignIn result:', result);

      if (result?.error) {
        console.error('[LoginForm] Authentication error:', result.error);

        // Mapear erros para mensagens amigáveis
        let errorMessage = 'Email ou senha inválidos';
        if (result.error === 'Conta desativada') {
          errorMessage = 'Sua conta foi desativada. Entre em contato com o suporte.';
        } else if (result.error === 'Email e senha são obrigatórios') {
          errorMessage = 'Por favor, preencha email e senha.';
        }

        setError(errorMessage);
        toast.error('Erro no login', {
          description: errorMessage,
        });
        return;
      }

      // Em seguida, autentica no backend NestJS para obter tokens JWT
      try {
        const loginResponse = await authApi.login(email, password);
        setTokens(loginResponse.accessToken, loginResponse.refreshToken);
        console.log('[LoginForm] Tokens obtidos e salvos com sucesso');
      } catch (apiError) {
        // CRÍTICO: Se falhar a obtenção de tokens, o usuário não poderá acessar rotas protegidas
        console.error('[LoginForm] ERRO CRÍTICO ao obter tokens do backend:', apiError);
        toast.error('Aviso', {
          description: 'Login parcial: algumas funcionalidades podem não funcionar.',
        });
      }

        toast.success('Login realizado com sucesso!', {
          description: 'Redirecionando...',
        });

        // Redirecionar para callback URL ou dashboard
        router.push(callbackUrl);
        router.refresh(); // Forçar atualização do estado do servidor
      }
    } catch (error) {
      console.error('[LoginForm] Unexpected error:', error);
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
      toast.error('Erro no login', {
        description: 'Ocorreu um erro inesperado',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // Pontos Críticos da Correção:
  // - REMOVIDO chamada ao backend NestJS (authApi.login)
  // - REMOVIDO useAuthStore (não mais necessário)
  // - Usando apenas NextAuth para autenticação
  // - Suporte a callbackUrl para redirect pós-login
  // - Logs detalhados para debug
  // - Tratamento de erros mais específico
  // ========================================

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="py-6 px-6">
        <CardTitle className="text-2xl font-bold font-display">Login</CardTitle>
        <CardDescription className="text-base">Entre com sua conta para continuar</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-semibold">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-base text-center text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary hover:text-primary/90 transition-colors">
              Cadastre-se
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
