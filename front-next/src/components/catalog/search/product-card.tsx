// ========================================
// Arquivo: src/components/catalog/search/product-card.tsx
// Descrição: Card de produto para resultados de busca do catálogo
// ========================================

import Image from 'next/image';
import Link from 'next/link';
import { Package, ShoppingCart, Building2 } from 'lucide-react';

import { Product } from '@/types/product.types';
import { formatCurrency } from '@/lib/utils/format-currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQty === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/products/${product.id}`}>
        {/* Imagem do Produto */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Badge de Estoque Esgotado */}
          {isOutOfStock && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive" className="shadow-sm">
                Esgotado
              </Badge>
            </div>
          )}

          {/* Badge de Categoria */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="shadow-sm bg-white/95 backdrop-blur-sm">
              {product.category}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        {/* Nome e Descrição */}
        <div className="space-y-1.5">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Organização */}
        {product.organization && (
          <div className="flex items-center gap-2">
            {product.organization.logoUrl ? (
              <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={product.organization.logoUrl}
                  alt={product.organization.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
            ) : (
              <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
            )}
            <Link
              href={`/organizations/${product.organization.slug}`}
              className="text-xs text-gray-600 hover:text-primary transition-colors truncate"
            >
              {product.organization.name}
            </Link>
          </div>
        )}

        {/* Preço e Estoque */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(product.price))}
              </p>
              <p className="text-xs text-gray-500">
                {product.stockQty} {product.stockQty === 1 ? 'unidade' : 'unidades'}{' '}
                {isOutOfStock ? 'esgotadas' : 'disponíveis'}
              </p>
            </div>
            <Button
              size="icon"
              disabled={isOutOfStock}
              className="h-10 w-10"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ========================================
// Notas de Implementação:
// - Lazy loading de imagens para performance
// - Placeholder quando não há imagem
// - Badge de categoria e estoque
// - Link para página de detalhes e organização
// - Botão de adicionar ao carrinho (desabilitado se esgotado)
// - Hover effects suaves
// - Informações de estoque visíveis
// - Acessível com ARIA labels
// - Responsivo com Card shadcn/ui
// ========================================
