import { apiClient, createAuthenticatedClient } from './client';
import { DashboardStats, RecentActivity, RecentOrder } from '@/types/dashboard.types';

// ========================================
// Factory para criar API de dashboard com autenticação
// ========================================
export function createDashboardApi(accessToken?: string) {
  const client = accessToken ? createAuthenticatedClient(accessToken) : apiClient;

  return {
    // Buscar estatísticas do dashboard
    // Nota: Se o endpoint não existir no backend, será necessário implementá-lo
    // Endpoint esperado: GET /dashboard/stats
    getStats: async () => {
      try {
        const response = await client.get<DashboardStats>('/dashboard/stats');
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
        const response = await client.get<RecentActivity[]>('/dashboard/activities', {
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
        const response = await client.get<RecentOrder[]>('/dashboard/recent-orders', {
          params: { limit },
        });
        return response.data;
      } catch (error) {
        console.warn('Dashboard recent orders endpoint não disponível');
        return [] as RecentOrder[];
      }
    },
  };
}

// ========================================
// API padrão (retrocompatibilidade)
// DEPRECATED: Use createDashboardApi(accessToken) para endpoints autenticados
// ========================================
export const dashboardApi = createDashboardApi();
