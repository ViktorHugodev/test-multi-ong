'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  alert?: boolean;
  description?: string;
}

export function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  alert = false,
  description,
}: MetricCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-md",
      alert && "border-orange-200 bg-orange-50/50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={cn(
              "text-3xl font-bold tracking-tight",
              alert ? "text-orange-600" : "text-gray-900"
            )}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-3",
            alert ? "bg-orange-100" : "bg-gray-100"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              alert ? "text-orange-600" : "text-gray-600"
            )} />
          </div>
        </div>

        {change && trend && (
          <div className="mt-4 flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5",
                trend === 'up'
                  ? "text-green-700 bg-green-100"
                  : "text-red-700 bg-red-100"
              )}
            >
              {trend === 'up' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>{change}</span>
            </div>
            <span className="text-xs text-gray-500">vs. mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
