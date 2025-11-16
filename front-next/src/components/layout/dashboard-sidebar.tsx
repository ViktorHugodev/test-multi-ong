'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Building2,
  User,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Visão Geral',
    href: '/dashboard',
    disabled: false,
    badge: undefined as string | undefined,
  },
  {
    icon: Package,
    label: 'Meus Produtos',
    href: '/dashboard/products',
    disabled: false,
    badge: undefined as string | undefined,
  },
  {
    icon: ShoppingBag,
    label: 'Pedidos',
    href: '/dashboard/orders',
    disabled: false,
    badge: undefined as string | undefined,
  },
];

const secondaryMenuItems = [
  {
    icon: Building2,
    label: 'Minha ONG',
    href: '/dashboard/organizations',
    disabled: false,
    badge: undefined as string | undefined,
  },
  {
    icon: User,
    label: 'Meu Perfil',
    href: '/dashboard/profile',
    disabled: false,
    badge: undefined as string | undefined,
  },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/dashboard/settings',
    disabled: true,
    badge: 'Em breve' as string | undefined,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 flex-1">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">
              volunteer_activism
            </span>
          </div>
          <div>
            <h1 className="font-bold text-base">Multi-ONG</h1>
            <p className="text-xs text-gray-600">Painel de Gestão</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Principal
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : active
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
        </div>

        <Separator className="my-6" />

        {/* Secondary Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
            Configurações
          </p>
          <nav className="space-y-1">
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  onClick={(e) => item.disabled && e.preventDefault()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.disabled
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer - Back to Marketplace */}
      <div className="p-6 border-t border-gray-200">
        <Link
          href="/products"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="text-sm font-medium">Ver Marketplace</span>
        </Link>
      </div>
    </aside>
  );
}
