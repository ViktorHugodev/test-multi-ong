export interface DashboardMetric {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  productsSold: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsSoldChange: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'review' | 'stock' | 'customer';
  icon: string;
  title: string;
  description?: string;
  time: string;
  createdAt: string;
}

export interface RecentOrder {
  id: string;
  customer: string;
  customerEmail?: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}
