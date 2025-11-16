import { apiClient, createAuthenticatedClient } from './client';
import { Product, PaginatedResponse, ProductFilters } from '@/types/product.types';
import { CreateProductDto, UpdateProductDto } from '@/lib/validations/product.schema';
import { AxiosInstance } from 'axios';

// ========================================
// Factory para criar API de produtos com autenticação
// ========================================
export function createProductsApi(accessToken?: string) {
  const client = accessToken ? createAuthenticatedClient(accessToken) : apiClient;

  return {
    // Public endpoints (não precisam de autenticação)
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

    // Private endpoints (ONG) - usam cliente autenticado
    // Note: orgId is automatically extracted from JWT token by the backend
    getMyProducts: async (filters?: ProductFilters) => {
      const response = await client.get<PaginatedResponse<Product>>('/products', {
        params: filters,
      });
      return response.data;
    },

    getMyProductById: async (id: string) => {
      const response = await client.get<Product>(`/products/${id}`);
      return response.data;
    },

    createProduct: async (data: CreateProductDto) => {
      const response = await client.post<Product>('/products', data);
      return response.data;
    },

    updateProduct: async (id: string, data: UpdateProductDto) => {
      const response = await client.patch<Product>(`/products/${id}`, data);
      return response.data;
    },

    deleteProduct: async (id: string) => {
      const response = await client.delete(`/products/${id}`);
      return response.data;
    },
  };
}

// ========================================
// API padrão (retrocompatibilidade)
// DEPRECATED: Use createProductsApi(accessToken) para endpoints autenticados
// ========================================
export const productsApi = createProductsApi();
