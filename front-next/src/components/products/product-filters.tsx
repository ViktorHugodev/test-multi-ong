'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { ProductFilters as IProductFilters } from '@/types/product.types';

interface IProductFiltersProps {
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
}

const CATEGORIES = [
  'Alimentação',
  'Artesanato',
  'Vestuário',
  'Acessórios',
  'Decoração',
  'Outros',
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Mais Recentes' },
  { value: 'createdAt-asc', label: 'Mais Antigos' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'name-asc', label: 'Nome (A-Z)' },
  { value: 'name-desc', label: 'Nome (Z-A)' },
];

export function ProductFilters({ filters, onFiltersChange }: IProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IProductFilters>(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: IProductFilters = {
      page: 1,
      pageSize: filters.pageSize,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setLocalFilters({
      ...localFilters,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    });
  };

  const getCurrentSortValue = () => {
    if (localFilters.sortBy && localFilters.sortOrder) {
      return `${localFilters.sortBy}-${localFilters.sortOrder}`;
    }
    return 'createdAt-desc';
  };

  return (
    <Card className="border border-border shadow-sm rounded-lg sticky top-24">
      <CardHeader className="py-6 px-6">
        <CardTitle className="text-xl font-bold font-display">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6">
        <div className="space-y-3">
          <Label htmlFor="category" className="text-base font-semibold">
            Categoria
          </Label>
          <Select
            value={localFilters.category || ''}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, category: value || undefined })
            }
          >
            <SelectTrigger id="category" className="h-11">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as categorias</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Faixa de Preço</Label>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Mín"
                min={0}
                className="h-11"
                value={localFilters.priceMin ?? ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <span className="text-muted-foreground font-medium">até</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Máx"
                min={0}
                className="h-11"
                value={localFilters.priceMax ?? ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceMax: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="sort" className="text-base font-semibold">
            Ordenar por
          </Label>
          <Select value={getCurrentSortValue()} onValueChange={handleSortChange}>
            <SelectTrigger id="sort" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleApplyFilters} className="flex-1 h-11">
            Aplicar Filtros
          </Button>
          <Button onClick={handleClearFilters} variant="outline" size="icon" className="h-11 w-11">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
