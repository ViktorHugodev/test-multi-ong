'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export function RegisterForm() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'customer' as 'customer' | 'ong_manager',
    orgName: '',
    orgDescription: '',
    orgEmail: '',
    orgPhone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        ...(formData.role === 'ong_manager' && {
          organization: {
            name: formData.orgName,
            description: formData.orgDescription || undefined,
            email: formData.orgEmail,
            phone: formData.orgPhone || undefined,
          },
        }),
      });
    } catch {
      // Error handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="py-6 px-6">
        <CardTitle className="text-2xl font-bold font-display">Cadastro</CardTitle>
        <CardDescription className="text-base">Crie sua conta para começar</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-base font-semibold">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="João Silva"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="role" className="text-base font-semibold">Tipo de Conta</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'customer' | 'ong_manager') =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="ong_manager">Gestor de ONG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.role === 'ong_manager' && (
            <>
              <div className="border-t border-border pt-6">
                <h3 className="text-xl font-bold font-display mb-6">Dados da Organização</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="orgName" className="text-base font-semibold">Nome da ONG</Label>
                      <Input
                        id="orgName"
                        type="text"
                        placeholder="Minha ONG"
                        value={formData.orgName}
                        onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="orgEmail" className="text-base font-semibold">Email da ONG</Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        placeholder="contato@minhaong.org"
                        value={formData.orgEmail}
                        onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="orgPhone" className="text-base font-semibold">Telefone (opcional)</Label>
                    <Input
                      id="orgPhone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.orgPhone}
                      onChange={(e) => setFormData({ ...formData, orgPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="orgDescription" className="text-base font-semibold">Descrição (opcional)</Label>
                    <Textarea
                      id="orgDescription"
                      placeholder="Conte um pouco sobre sua organização..."
                      value={formData.orgDescription}
                      onChange={(e) => setFormData({ ...formData, orgDescription: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          <p className="text-base text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:text-primary/90 transition-colors">
              Faça login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
