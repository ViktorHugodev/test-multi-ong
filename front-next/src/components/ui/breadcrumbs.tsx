'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {showHome && (
        <>
          <Link
            href="/"
            className="hover:text-gray-900 transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          {items.length > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
        </>
      )}
      {items.map((item, index) => (
        <Fragment key={item.href}>
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <>
              <Link
                href={item.href}
                className="hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
