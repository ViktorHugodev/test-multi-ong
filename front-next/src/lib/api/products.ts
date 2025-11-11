import { apiClient } from './client';
import { Product, PaginatedResponse, ProductFilters } from '@/types/product.types';
import { CreateProductDto, UpdateProductDto } from '@/lib/validations/product.schema';

export const productsApi = {
  // Public endpoints
  getPublicProducts: async (filters?: ProductFilters) => {
    const response = await apiClient.get<PaginatedResponse<Product>>('/public/products', {
      params: filters,
    });
    return response.data;
  },

  getPublicProductById: async (id: string) => {
    const response = await apiClient.get<Product>(`/public/products/${id}`);
    return response.data;
  },

  // Private endpoints (ONG)
  // Note: orgId is automatically extracted from JWT token by the backend
  getMyProducts: async (filters?: ProductFilters) => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      '/products',
      { params: filters }
    );
    return response.data;
  },

  getMyProductById: async (id: string) => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductDto) => {
    const response = await apiClient.post<Product>(
      '/products',
      data
    );
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductDto) => {
    const response = await apiClient.patch<Product>(
      `/products/${id}`,
      data
    );
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
