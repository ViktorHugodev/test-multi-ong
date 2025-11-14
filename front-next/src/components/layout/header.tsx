'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCart } from '@/lib/hooks/use-cart';
import { ShoppingCart, Heart, Search, User, Package } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const cartItems = useCart((state) => state.items);
  const [mounted, setMounted] = useState(false);

  // Evita erro de hidratação ao carregar o valor do localStorage apenas no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-8 md:gap-12">
          <Link
            href="/"
            className="flex items-center gap-3 transition-colors hover:text-primary"
          >
            <Package className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl md:text-2xl font-display">
              Marketplace ONG
            </span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/"
              className="text-base font-medium transition-colors hover:text-primary"
            >
              Produtos
            </Link>
            {isAuthenticated && (
              <Link
                href="/my-orders"
                className="text-base font-medium transition-colors hover:text-primary"
              >
                Meus Pedidos
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <ShoppingCart className="h-6 w-6" />
              {mounted && cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {!mounted ? (
            // Placeholder durante SSR para evitar erro de hidratação
            <div className="flex items-center gap-3">
              <div className="w-12 h-8" />
              <div className="w-20 h-8" />
            </div>
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {(user?.role === 'ong_manager' || user?.role === 'ong_staff') && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/my-orders" className="cursor-pointer">
                    Meus Pedidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
