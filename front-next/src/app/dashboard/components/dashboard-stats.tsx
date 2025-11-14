import { TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardStats as DashboardStatsType } from '@/types/dashboard.types';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const metrics = [
    {
      title: 'Receita Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(stats.totalRevenue),
      change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%`,
      trend: stats.revenueChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Total de Pedidos',
      value: stats.totalOrders.toString(),
      change: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}%`,
      trend: stats.ordersChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Novos Clientes',
      value: stats.newCustomers.toString(),
      change: `${stats.customersChange >= 0 ? '+' : ''}${stats.customersChange.toFixed(1)}%`,
      trend: stats.customersChange >= 0 ? 'up' : 'down',
    },
    {
      title: 'Produtos Vendidos',
      value: stats.productsSold.toString(),
      change: `${stats.productsSoldChange >= 0 ? '+' : ''}${stats.productsSoldChange.toFixed(1)}%`,
      trend: stats.productsSoldChange >= 0 ? 'up' : 'down',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <div key={metric.title} className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{metric.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
