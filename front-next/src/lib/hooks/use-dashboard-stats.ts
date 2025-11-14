import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activities: (limit?: number) => [...dashboardKeys.all, 'activities', limit] as const,
  recentOrders: (limit?: number) => [...dashboardKeys.all, 'recent-orders', limit] as const,
};

// Hook para buscar estatísticas do dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para buscar atividades recentes
export function useRecentActivities(limit: number = 5) {
  return useQuery({
    queryKey: dashboardKeys.activities(limit),
    queryFn: () => dashboardApi.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

// Hook para buscar pedidos recentes
export function useRecentOrders(limit: number = 5) {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(limit),
    queryFn: () => dashboardApi.getRecentOrders(limit),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}
