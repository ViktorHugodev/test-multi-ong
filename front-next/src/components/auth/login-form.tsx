'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
<<<<<<< HEAD
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-2xl">
            volunteer_activism
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-600">
          Enter your credentials to access your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Password
          </label>
          <div className="relative">
            <input
=======
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
>>>>>>> 49a9e53cf178f1c56368740d47de586e26b29201
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
<<<<<<< HEAD
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#0066cc] font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
=======
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
>>>>>>> 49a9e53cf178f1c56368740d47de586e26b29201
  );
}
