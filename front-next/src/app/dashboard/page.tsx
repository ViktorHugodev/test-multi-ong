'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

const metrics = [
  {
    title: 'Total Revenue',
    value: '$12,450',
    change: '+5.2%',
    trend: 'up',
  },
  {
    title: 'Total Orders',
    value: '312',
    change: '+2.1%',
    trend: 'up',
  },
  {
    title: 'New Customers',
    value: '45',
    change: '+10.5%',
    trend: 'up',
  },
  {
    title: 'Products Sold',
    value: '890',
    change: '-1.8%',
    trend: 'down',
  },
];

const recentActivity = [
  {
    icon: 'shopping_cart',
    title: 'New order #8452 placed by John D.',
    time: '5 minutes ago',
  },
  {
    icon: 'star',
    title: 'Product "Handmade Scarf" received a 5-star review.',
    time: '1 hour ago',
  },
  {
    icon: 'inventory',
    title: 'Stock for "Eco-friendly Water Bottle" is low.',
    time: '3 hours ago',
  },
  {
    icon: 'shopping_cart',
    title: 'New order #8451 placed by Jane S.',
    time: 'Yesterday',
  },
];

const recentOrders = [
  {
    id: '#8452',
    customer: 'John Doe',
    date: '2023-10-27',
    status: 'Shipped',
    total: '$120.50',
  },
  {
    id: '#8451',
    customer: 'Jane Smith',
    date: '2023-10-26',
    status: 'Processing',
    total: '$89.99',
  },
  {
    id: '#8450',
    customer: 'Mike Johnson',
    date: '2023-10-26',
    status: 'Shipped',
    total: '$250.00',
  },
  {
    id: '#8449',
    customer: 'Emily White',
    date: '2023-10-25',
    status: 'Cancelled',
    total: '$45.75',
  },
  {
    id: '#8448',
    customer: 'Chris Brown',
    date: '2023-10-24',
    status: 'Shipped',
    total: '$310.20',
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Home</span>
            <span>/</span>
            <span>Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">View key performance metrics at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add New Product
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.title} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Trend</h2>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
            <div className="relative w-full h-full p-8">
              {/* Simple line chart placeholder */}
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <polyline
                  points="0,150 50,120 100,130 150,90 200,100 250,60 300,70 350,40 400,50"
                  fill="none"
                  stroke="#0891b2"
                  strokeWidth="3"
                />
                <circle cx="400" cy="50" r="4" fill="#0891b2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {activity.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-primary">{order.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{order.customer}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">{order.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Shipped' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">{order.total}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
