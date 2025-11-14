import { apiClient } from './client';
import { DashboardStats, RecentActivity, RecentOrder } from '@/types/dashboard.types';

export const dashboardApi = {
  // Buscar estatísticas do dashboard
  // Nota: Se o endpoint não existir no backend, será necessário implementá-lo
  // Endpoint esperado: GET /dashboard/stats
  getStats: async () => {
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      // Se o endpoint não existir, retornar dados padrão
      // Em produção, o backend deve implementar este endpoint
      console.warn('Dashboard stats endpoint não disponível, usando dados padrão');
      return {
        totalRevenue: 0,
        totalOrders: 0,
        newCustomers: 0,
        productsSold: 0,
        revenueChange: 0,
        ordersChange: 0,
        customersChange: 0,
        productsSoldChange: 0,
      } as DashboardStats;
    }
  },

  // Buscar atividades recentes
  // Endpoint esperado: GET /dashboard/activities
  getRecentActivities: async (limit: number = 5) => {
    try {
      const response = await apiClient.get<RecentActivity[]>('/dashboard/activities', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.warn('Dashboard activities endpoint não disponível');
      return [] as RecentActivity[];
    }
  },

  // Buscar pedidos recentes
  // Endpoint esperado: GET /dashboard/recent-orders
  getRecentOrders: async (limit: number = 5) => {
    try {
      const response = await apiClient.get<RecentOrder[]>('/dashboard/recent-orders', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.warn('Dashboard recent orders endpoint não disponível');
      return [] as RecentOrder[];
    }
  },
};
