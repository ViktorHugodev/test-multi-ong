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
  { value: 'apparel', label: 'Apparel' },
  { value: 'home-goods', label: 'Home Goods' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'food-drink', label: 'Food & Drink' },
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Filter Products</h3>
      
      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Categories</h4>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.category === category.value}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    category: e.target.checked ? category.value : undefined,
                  })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
              />
              <span className="text-sm text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Price Range</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">$10</span>
            <input
              type="range"
              min="10"
              max="150"
              value={localFilters.priceMin ?? 10}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  priceMin: Number(e.target.value),
                })
              }
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-gray-600">$150+</span>
          </div>
        </div>
      </div>

      {/* Cause - placeholder for future implementation */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Cause</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
            />
            <span className="text-sm text-gray-700">Environment</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
            />
            <span className="text-sm text-gray-700">Education</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/50"
            />
            <span className="text-sm text-gray-700">Animal Welfare</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button onClick={handleApplyFilters} className="w-full">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
