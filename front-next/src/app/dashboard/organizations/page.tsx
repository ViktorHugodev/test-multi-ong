'use client';

import { useQuery } from '@tanstack/react-query';
import { organizationsApi } from '@/lib/api/organizations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function OrganizationsPage() {
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationsApi.getAll,
  });

  if (isLoading) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizações</h1>
        <Link href="/dashboard/organizations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Organização
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations?.map((org: any) => (
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {org.slug}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {org.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {org.description}
                </p>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{org.email}</span>
                </div>
                {org.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{org.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {organizations?.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma organização encontrada
                </p>
                <Link href="/dashboard/organizations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Organização
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
