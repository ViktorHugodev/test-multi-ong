import { Package } from 'lucide-react';
import { Product } from '@/types/product.types';
import { ProductCard } from './product-card';
import { EmptyState } from './empty-state';
import { AddProductDialog } from './add-product-dialog';

interface ProductListProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto cadastrado"
        description="Comece adicionando seu primeiro produto ao catálogo da sua organização."
        action={<AddProductDialog />}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
