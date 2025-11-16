'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usersApi, UpdateUserDto } from '@/lib/api/users';
import { organizationsApi } from '@/lib/api/organizations';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Shield, Building2, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  role: z.enum(['admin', 'ong_manager', 'ong_staff', 'customer']).optional(),
  organizationId: z.string().uuid().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrentUser,
  });

  // Fetch available roles
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: usersApi.getAvailableRoles,
  });

  // Fetch available organizations
  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getAll,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: currentUser?.role,
      organizationId: currentUser?.organizationId || undefined,
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserDto) => {
      return usersApi.updateCurrentUser(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      toast.success('Perfil atualizado!', {
        description: 'Suas informações foram atualizadas com sucesso.',
      });

      // IMPORTANTE: Após trocar organization, talvez precise recarregar app
      if (data.organizationId !== currentUser?.organizationId) {
        toast.success('Organização alterada', {
          description: 'Recarregando aplicação...',
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error('Erro ao atualizar perfil', {
        description:
          error.response?.data?.message ||
          'Ocorreu um erro ao atualizar seu perfil',
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateUserMutation.mutate(data);
  };

  if (isLoadingUser || isLoadingRoles || isLoadingOrgs) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-none shadow-lg">
          <CardContent className="py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="text-center text-muted-foreground font-medium">Carregando seu perfil...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
          Visão Geral
        </Link>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">Meu Perfil</span>
      </nav>

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Meu Perfil
        </h1>
        <p className="text-gray-600">
          Gerencie suas informações e preferências
        </p>
      </div>

      {/* Asymmetric Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info (2/3) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Current Info Card */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0 self-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-2xl font-display leading-tight">Informações Pessoais</CardTitle>
                      <CardDescription className="text-sm mt-1.5 leading-relaxed">
                        Seus dados cadastrados no sistema
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </div>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <p className="text-xs font-medium uppercase tracking-wide leading-none">Email</p>
                    </div>
                    <p className="text-base font-semibold text-foreground break-words">
                      {currentUser?.email}
                    </p>
                  </div>

                  {/* Nome */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <p className="text-xs font-medium uppercase tracking-wide leading-none">Nome Completo</p>
                    </div>
                    <p className="text-base font-semibold text-foreground break-words">
                      {currentUser?.fullName || 'Não informado'}
                    </p>
                  </div>

                  {/* Função */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4 flex-shrink-0" />
                      <p className="text-xs font-medium uppercase tracking-wide leading-none">Função</p>
                    </div>
                    <p className="text-base font-semibold text-foreground break-words">
                      {currentUser?.role || 'Não definido'}
                    </p>
                  </div>

                  {/* Organização */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <p className="text-xs font-medium uppercase tracking-wide leading-none">Organização</p>
                    </div>
                    <p className="text-base font-semibold text-foreground break-words">
                      {currentUser?.organization?.name || 'Nenhuma organização'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Form Card */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b">
                <CardHeader className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <CardTitle className="text-2xl font-display leading-tight">Alterar Informações</CardTitle>
                      <CardDescription className="text-sm mt-1.5 leading-relaxed">
                        Atualize sua função ou organização
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </div>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Role Select */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-base font-bold flex items-center gap-2 leading-tight">
                            <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                            Nova Função
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 border-border/50 hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Selecione uma função" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles?.map((role: string) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm">
                            Sua função determina suas permissões no sistema.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Organization Select */}
                    <FormField
                      control={form.control}
                      name="organizationId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-base font-bold flex items-center gap-2 leading-tight">
                            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                            Nova Organização
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 border-border/50 hover:border-primary/50 transition-colors">
                                <SelectValue placeholder="Selecione uma organização" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {organizations?.map((org: { id: string; name: string }) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm">
                            A organização à qual você pertence. Trocar de organização
                            recarregará a aplicação.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4" />

                    <Button
                      type="submit"
                      disabled={updateUserMutation.isPending}
                      className="w-full h-12 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      size="lg"
                    >
                      {updateUserMutation.isPending
                        ? 'Salvando...'
                        : 'Salvar Alterações'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats (1/3) */}
          <div className="space-y-6">
            {/* Account Status Card */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-b border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2 leading-tight p-6">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                    Status da Conta
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4 flex flex-col">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">Status</span>
                    <span className="text-sm font-bold text-green-600">Ativa</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium">Tipo</span>
                    <span className="text-sm font-bold">{currentUser?.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border-none shadow-lg overflow-hidden ">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
                <CardTitle className="text-lg font-display leading-tight text-center pt-4">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 flex flex-col">
                  <Button variant="outline" className="w-full justify-center h-11" disabled>
                    <Shield className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </Button>
                  <Button variant="outline" className="w-full justify-center h-11" disabled>
                    <User className="mr-2 h-4 w-4" />
                    Editar Perfil
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Em breve mais opções
                </p>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-lg overflow-hidden bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 flex-shrink-0 self-center">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0 p-4">
                    <p className="text-sm font-bold leading-tight">Dica</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Mantenha suas informações sempre atualizadas para melhor experiência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
