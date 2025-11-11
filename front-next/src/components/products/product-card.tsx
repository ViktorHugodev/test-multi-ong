import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart } from 'lucide-react';

import { Product } from '@/types/product.types';
import { formatCurrency } from '@/lib/utils/format-currency';

interface IProductCardProps {
  product: Product;
}

export function ProductCard({ product }: IProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Product Image */}
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* NGO Badge */}
          {product.organization && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full border border-gray-200 shadow-sm">
                <span className="material-symbols-outlined text-sm">
                  volunteer_activism
                </span>
                {product.organization.name}
              </span>
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {product.stockQty === 0 && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              {product.category}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </p>
            <button className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
