'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch {
      // Error handled by auth context
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
              placeholder="••••••••"
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
