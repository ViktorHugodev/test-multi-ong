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
  getMyProducts: async (orgId: string, filters?: ProductFilters) => {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      `/organizations/${orgId}/products`,
      { params: filters }
    );
    return response.data;
  },

  createProduct: async (orgId: string, data: CreateProductDto) => {
    const response = await apiClient.post<Product>(
      `/organizations/${orgId}/products`,
      data
    );
    return response.data;
  },

  updateProduct: async (orgId: string, id: string, data: UpdateProductDto) => {
    const response = await apiClient.put<Product>(
      `/organizations/${orgId}/products/${id}`,
      data
    );
    return response.data;
  },

  deleteProduct: async (orgId: string, id: string) => {
    const response = await apiClient.delete(`/organizations/${orgId}/products/${id}`);
    return response.data;
  },
};
