'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, User, Building2 } from 'lucide-react';

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    disabled: false,
  },
  {
    icon: Package,
    label: 'Products',
    href: '/dashboard/products',
    disabled: false,
  },
  {
    icon: ShoppingCart,
    label: 'Orders',
    href: '/dashboard/orders',
    disabled: false,
  },
  {
    icon: Building2,
    label: 'Organizations',
    href: '/dashboard/organizations',
    disabled: false,
  },
  {
    icon: BarChart3,
    label: 'Catalogo',
    href: '/dashboard/catalogo',
    disabled: false,

  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/settings',
    disabled: true,
    badge: 'Em breve',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">
              volunteer_activism
            </span>
          </div>
          <div>
            <h1 className="font-bold text-base">Multi-ONG</h1>
            <p className="text-xs text-gray-600">Marketplace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.disabled ? '#' : item.href}
                onClick={(e) => item.disabled && e.preventDefault()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed opacity-60'
                    : isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs text-gray-400 font-medium">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Profile</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
