import { apiClient, createAuthenticatedClient } from './client';
import { Order, CreateOrderDto, PaginatedResponse } from '@/types/order.types';

// ========================================
// Factory para criar API de pedidos com autenticação
// ========================================
export function createOrdersApi(accessToken?: string) {
  const client = accessToken ? createAuthenticatedClient(accessToken) : apiClient;

  return {
    createOrder: async (data: CreateOrderDto) => {
      const response = await client.post<Order>('/orders', data);
      return response.data;
    },

    getMyOrders: async (page = 1, pageSize = 20) => {
      const response = await client.get<PaginatedResponse<Order>>('/orders', {
        params: { page, pageSize },
      });
      return response.data;
    },

    getOrderById: async (id: string) => {
      const response = await client.get<Order>(`/orders/${id}`);
      return response.data;
    },

    getOrganizationOrders: async (orgId: string, page = 1, pageSize = 20) => {
      const response = await client.get<PaginatedResponse<Order>>(
        `/organizations/${orgId}/orders`,
        { params: { page, pageSize } }
      );
      return response.data;
    },
  };
}

// ========================================
// API padrão (retrocompatibilidade)
// DEPRECATED: Use createOrdersApi(accessToken) para endpoints autenticados
// ========================================
export const ordersApi = createOrdersApi();
