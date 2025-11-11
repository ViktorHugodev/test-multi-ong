export interface Product {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  price: string | number;
  category: string;
  imageUrl?: string;
  stockQty: number;
  weightGrams: number;
  sku?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
