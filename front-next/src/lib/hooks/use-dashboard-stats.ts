import { useQuery } from '@tanstack/react-query';
import { createDashboardApi } from '@/lib/api/dashboard';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activities: (limit?: number) => [...dashboardKeys.all, 'activities', limit] as const,
  recentOrders: (limit?: number) => [...dashboardKeys.all, 'recent-orders', limit] as const,
};

// Hook para buscar estatísticas do dashboard
export function useDashboardStats() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const api = useMemo(() => createDashboardApi(accessToken), [accessToken]);

  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => api.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!accessToken,
  });
}

// Hook para buscar atividades recentes
export function useRecentActivities(limit: number = 5) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const api = useMemo(() => createDashboardApi(accessToken), [accessToken]);

  return useQuery({
    queryKey: dashboardKeys.activities(limit),
    queryFn: () => api.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: !!accessToken,
  });
}

// Hook para buscar pedidos recentes
export function useRecentOrders(limit: number = 5) {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  const api = useMemo(() => createDashboardApi(accessToken), [accessToken]);

  return useQuery({
    queryKey: dashboardKeys.recentOrders(limit),
    queryFn: () => api.getRecentOrders(limit),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: !!accessToken,
  });
}
