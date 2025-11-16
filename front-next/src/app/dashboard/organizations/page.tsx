'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { organizationsApi } from '@/lib/api/organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { EmptyState } from '../components/empty-state';
import { Building2, Plus, Mail, Phone, Globe } from 'lucide-react';

export default function OrganizationsPage() {
  const { data: organizations, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getAll,
  });

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Visão Geral', href: '/dashboard' },
          { label: 'Minha ONG', href: '/dashboard/organizations' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minha Organização</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as informações da sua ONG
          </p>
        </div>
        <Button size="lg" className="gap-2" asChild>
          <Link href="/dashboard/organizations/new">
            <Plus className="h-5 w-5" />
            Nova Organização
          </Link>
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Building2}
              title="Erro ao carregar organizações"
              description="Não foi possível carregar as informações das organizações. Verifique sua conexão e tente novamente."
              action={
                <Button onClick={() => refetch()}>Tentar Novamente</Button>
              }
            />
          </CardContent>
        </Card>
      ) : organizations && organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org: {
            id: string;
            name: string;
            slug: string;
            description?: string;
            email: string;
            phone?: string;
            website?: string;
          }) => (
            <Card
              key={org.id}
              className="hover:shadow-lg transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold truncate">
                      {org.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 font-mono">
                      /{org.slug}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {org.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {org.description}
                  </p>
                )}

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 truncate">{org.email}</span>
                  </div>
                  {org.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{org.phone}</span>
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {org.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/organizations/${org.id}`}>
                      Editar Organização
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Building2}
              title="Nenhuma organização encontrada"
              description="Crie sua primeira organização para começar a cadastrar produtos e receber pedidos no marketplace."
              action={
                <Button size="lg" asChild>
                  <Link href="/dashboard/organizations/new" className="gap-2">
                    <Plus className="h-5 w-5" />
                    Criar Primeira Organização
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
