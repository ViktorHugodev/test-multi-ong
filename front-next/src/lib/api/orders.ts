import { apiClient } from './client';
import { Order, CreateOrderDto, PaginatedResponse } from '@/types/order.types';

export const ordersApi = {
  createOrder: async (data: CreateOrderDto) => {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
  },

  getMyOrders: async (page = 1, pageSize = 20) => {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', {
      params: { page, pageSize },
    });
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<Order>(`/orders/${id}`);
    return response.data;
  },

  getOrganizationOrders: async (orgId: string, page = 1, pageSize = 20) => {
    const response = await apiClient.get<PaginatedResponse<Order>>(
      `/organizations/${orgId}/orders`,
      { params: { page, pageSize } }
    );
    return response.data;
  },
};
