import { Product } from '@/types/product.types';
import { ProductCard } from './product-card';

interface IProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: IProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <p className="text-muted-foreground text-xl font-semibold font-display">
          Nenhum produto encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
