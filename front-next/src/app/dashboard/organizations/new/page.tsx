'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const organizationSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  slug: z
    .string()
    .min(3, 'Slug deve ter no mínimo 3 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens'
    ),
  description: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function NewOrganizationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      email: '',
      phone: '',
      logoUrl: '',
    },
  });

  const createOrganizationMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const response = await apiClient.post('/organizations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      toast.success('Organização criada!', {
        description: 'A organização foi criada com sucesso.',
      });

      router.push('/dashboard/organizations');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar organização', {
        description:
          error.response?.data?.message ||
          'Ocorreu um erro ao criar a organização',
      });
    },
  });

  const onSubmit = (data: OrganizationFormData) => {
    createOrganizationMutation.mutate(data);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    form.setValue('slug', slug);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/organizations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Organizations
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Organização *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: ONG Esperança"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Nome público da organização
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: ong-esperanca"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Identificador único da organização (gerado automaticamente)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contato@organizacao.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Email principal da organização
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Telefone de contato (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a missão e objetivos da organização..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Descrição sobre a organização (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL da imagem do logo (opcional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/organizations')}
                  disabled={createOrganizationMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createOrganizationMutation.isPending}
                >
                  {createOrganizationMutation.isPending
                    ? 'Criando...'
                    : 'Criar Organização'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
