'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/stores/auth-store';

export function LoginForm() {
  const router = useRouter();
  const { setTokens } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[LoginForm] Iniciando login com NextAuth...');
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('[LoginForm] Resultado:', result);

      if (result?.error) {
        console.error('[LoginForm] Erro:', result.error);
        setError('Email ou senha inválidos');
        toast.error('Erro no login', {
          description: 'Verifique suas credenciais e tente novamente',
        });
        return;
      }

      if (result?.ok) {
        console.log('[LoginForm] ✅ Login bem-sucedido!');
        toast.success('Login realizado com sucesso!');
        
        // Redirecionar para dashboard
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      console.error('[LoginForm] Erro inesperado:', error);
      setError('Ocorreu um erro ao fazer login');
      toast.error('Erro no login', {
        description: 'Ocorreu um erro inesperado',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
