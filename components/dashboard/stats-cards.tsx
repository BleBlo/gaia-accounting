'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  Calendar,
  CalendarDays,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'warning'
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <Card className={cn(
      'overflow-hidden border-neutral-200',
      variant === 'warning' && 'border-neutral-300 bg-neutral-50'
    )}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-neutral-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-neutral-500">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                <TrendingUp className={cn(
                  'h-3 w-3',
                  !trend.isPositive && 'rotate-180'
                )} />
                {trend.value}% vs last week
              </div>
            )}
          </div>
          <div className={cn(
            'p-2 rounded-lg',
            variant === 'warning' ? 'bg-neutral-200' : 'bg-black'
          )}>
            <Icon className={cn(
              'h-5 w-5',
              variant === 'warning' ? 'text-neutral-700' : 'text-white'
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  todaySales: number
  todayCount: number
  weekSales: number
  monthSales: number
  pendingReceivables: number
}

export function StatsCards({
  todaySales = 0,
  todayCount = 0,
  weekSales = 0,
  monthSales = 0,
  pendingReceivables = 3400,
}: Partial<StatsCardsProps>) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Today's Sales"
        value={formatCurrency(todaySales)}
        subtitle={`${todayCount} transactions`}
        icon={Calendar}
      />
      <StatsCard
        title="This Week"
        value={formatCurrency(weekSales)}
        icon={CalendarDays}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="This Month"
        value={formatCurrency(monthSales)}
        icon={TrendingUp}
      />
      <StatsCard
        title="Receivables"
        value={formatCurrency(pendingReceivables)}
        subtitle="Pending payments"
        icon={AlertCircle}
        variant="warning"
      />
    </div>
  )
}
