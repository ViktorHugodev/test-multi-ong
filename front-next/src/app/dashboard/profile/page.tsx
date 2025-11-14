'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usersApi, UpdateUserDto } from '@/lib/api/users';
import { organizationsApi } from '@/lib/api/organizations';
import { useAuthStore } from '@/stores/auth-store';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const profileSchema = z.object({
  role: z.enum(['admin', 'ong_manager', 'ong_staff', 'customer']).optional(),
  organizationId: z.string().uuid().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  // Fetch current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrentUser,
    initialData: user || undefined,
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
      setUser(data);
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
    onError: (error: any) => {
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
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* User Info (Read-only) */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.email}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Nome</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.fullName || 'Não informado'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Função Atual</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.role || 'Não definido'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Organização Atual</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.organization?.name || 'Nenhuma organização'}
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Alterar Informações</h3>

                {/* Role Select */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Nova Função (Role)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      <FormDescription>
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
                    <FormItem>
                      <FormLabel>Nova Organização</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma organização" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations?.map((org: any) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        A organização à qual você pertence. Trocar de organização
                        recarregará a aplicação.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="w-full"
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
  );
}
