'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCart } from '@/lib/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

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
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs rounded-full">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-accent">
                  <User className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-4 py-3 text-base font-semibold">
                  {user?.fullName}
                </div>
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                {(user?.role === 'ong_manager' || user?.role === 'ong_staff') && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer py-3">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/my-orders" className="cursor-pointer py-3">
                    Meus Pedidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer py-3">
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Cadastrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
