// ========================================
// Arquivo: src/components/catalog/search/search-filters.tsx
// Descrição: Filtros manuais (categoria, preço) para complementar a busca
// ========================================

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

import { SearchFilters, CATEGORIES } from '@/components/catalog/types';
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

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function SearchFiltersComponent({
  filters,
  onFiltersChange,
  onClear,
  hasActiveFilters,
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCategoryChange = (value: string) => {
    const newFilters = {
      ...localFilters,
      category: value === 'all' ? undefined : value,
    };
    setLocalFilters(newFilters);
  };

  const handlePriceMinChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    setLocalFilters({
      ...localFilters,
      priceMin: numValue,
    });
  };

  const handlePriceMaxChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    setLocalFilters({
      ...localFilters,
      priceMax: numValue,
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({});
    onClear();
  };

  const isValid =
    (!localFilters.priceMin || localFilters.priceMin >= 0) &&
    (!localFilters.priceMax || localFilters.priceMax >= 0) &&
    (!localFilters.priceMin ||
      !localFilters.priceMax ||
      localFilters.priceMax >= localFilters.priceMin);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filtros Manuais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={localFilters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Faixa de Preço */}
        <div className="space-y-2">
          <Label>Faixa de Preço</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="priceMin" className="text-xs text-gray-600">
                Mínimo (R$)
              </Label>
              <Input
                id="priceMin"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={localFilters.priceMin ?? ''}
                onChange={(e) => handlePriceMinChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priceMax" className="text-xs text-gray-600">
                Máximo (R$)
              </Label>
              <Input
                id="priceMax"
                type="number"
                min="0"
                step="0.01"
                placeholder="999,99"
                value={localFilters.priceMax ?? ''}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
              />
            </div>
          </div>
          {!isValid && (
            <p className="text-xs text-red-600">
              Preço máximo deve ser maior que o mínimo
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApply}
            disabled={!isValid}
            className="flex-1"
            aria-label="Aplicar filtros"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            disabled={!hasActiveFilters}
            aria-label="Limpar filtros"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>

        {/* Indicador de Filtros Ativos */}
        {hasActiveFilters && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-600 mb-2">Filtros ativos:</p>
            <div className="flex flex-wrap gap-2">
              {localFilters.category && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {localFilters.category}
                </span>
              )}
              {localFilters.priceMin !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Min: R$ {localFilters.priceMin.toFixed(2)}
                </span>
              )}
              {localFilters.priceMax !== undefined && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  Max: R$ {localFilters.priceMax.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========================================
// Notas de Implementação:
// - Select de categoria com opção "Todas"
// - Inputs numéricos para faixa de preço
// - Validação em tempo real (preço max > min)
// - Estado local para edição sem aplicar imediatamente
// - Botão "Aplicar" para confirmar filtros
// - Botão "Limpar" para resetar
// - Indicador visual de filtros ativos
// - Labels e ARIA para acessibilidade
// - Responsivo com grid de 2 colunas
// ========================================
