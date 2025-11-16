'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { X, Search, Filter, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProductFilters as IProductFilters } from '@/types/product.types';

interface ProductFiltersProps {
  categories?: string[];
  filters?: IProductFilters;
  onFiltersChange?: (newFilters: IProductFilters) => void;
}

export function ProductFilters({ categories = [] }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados locais para os filtros
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');

  // Aplicar filtros
  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (category && category !== 'all') params.set('category', category);
    if (priceMin) params.set('price_min', priceMin);
    if (priceMax) params.set('price_max', priceMax);

    router.push(`/products?${params.toString()}`);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setPriceMin('');
    setPriceMax('');
    router.push('/products');
  };

  // Detectar se há filtros ativos
  const hasActiveFilters = search || (category && category !== 'all') || priceMin || priceMax;

  return (
    <Card className="sticky top-4 overflow-hidden border-none shadow-lg pb-4">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b">
        <CardHeader className="space-y-4 py-6 text-center">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 ">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold justify-center align-center">Filtros</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Refine sua busca
                </p>
              </div>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 px-3 text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <X className="mr-1.5 h-4 w-4" />
                Limpar
              </Button>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {search && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium">
                  <Search className="h-3 w-3" />
                  {search}
                </Badge>
              )}
              {category && category !== 'all' && (
                <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-medium">
                  <Tag className="h-3 w-3" />
                  {category}
                </Badge>
              )}
              {(priceMin || priceMax) && (
                <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                  R$ {priceMin || '0'} - {priceMax || '∞'}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </div>
      <CardContent className="space-y-6 pt-6 flex flex-col justify-center items-center">
        {/* Campo de Busca - Destaque */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
          <Label htmlFor="search" className="flex items-center gap-2 text-sm font-bold text-foreground">
            <div className="p-1 rounded bg-primary/10">
              <Search className="h-3.5 w-3.5 text-primary" />
            </div>
            Buscar Produto
          </Label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="search"
              type="text"
              placeholder="Ex: chocolate, artesanal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilters();
                }
              }}
              className="pl-10 h-11 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <kbd className="px-2 py-1 text-[10px] font-mono bg-background border border-border rounded shadow-sm">Enter</kbd>
            <span>para buscar rapidamente</span>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">Filtros Avançados</span>
          </div>
        </div>

        {/* Filtro de Categoria */}
        <div className="space-y-3">
          <Label htmlFor="category" className="text-sm font-bold flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-primary" />
            Categoria
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="h-11 border-border/50 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Faixa de Preço */}
        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <span className="text-lg">💰</span>
            Faixa de Preço
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price-min" className="text-xs text-muted-foreground font-medium">Mínimo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="0,00"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  min="0"
                  step="0.01"
                  className="pl-9 h-11 border-border/50 hover:border-primary/50 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-max" className="text-xs text-muted-foreground font-medium">Máximo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="999,99"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  min="0"
                  step="0.01"
                  className="pl-9 h-11 border-border/50 hover:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 " />

        {/* Botão Aplicar */}
        <Button 
          onClick={handleApplyFilters} 
          className="w-full h-12 text-base flex font-bold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          size="lg"
        >
          <Filter className="mr-2 h-5 w-5 " />
          Aplicar Filtros
        </Button>
      </CardContent>
    </Card>
  );
}
