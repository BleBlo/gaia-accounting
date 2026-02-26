'use client'

import { useSales } from '@/lib/hooks/use-sales'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

export default function DashboardPage() {
  const { sales } = useSales({ dateRange: 'month' })

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const todaySales = sales.filter((s) => s.sale_date === today)
  const weekSales = sales.filter((s) => s.sale_date >= weekAgo)

  const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.total_amount), 0)
  const weekTotal = weekSales.reduce((sum, s) => sum + Number(s.total_amount), 0)
  const monthTotal = sales.reduce((sum, s) => sum + Number(s.total_amount), 0)
  const pendingTotal = sales.reduce((sum, s) => {
    if (s.payment_status === 'pending') return sum + Number(s.total_amount)
    if (s.payment_status === 'partial') return sum + (Number(s.total_amount) - Number(s.deposit_amount || 0))
    return sum
  }, 0)

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('en-AE', { weekday: 'short' })
    const amount = sales
      .filter((s) => s.sale_date === dateStr)
      .reduce((sum, s) => sum + Number(s.total_amount), 0)
    return { date: dayLabel, amount }
  })

  const recentSales = sales.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here&apos;s your business overview.</p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        todaySales={todayTotal}
        todayCount={todaySales.length}
        weekSales={weekTotal}
        monthSales={monthTotal}
        pendingReceivables={pendingTotal}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart data={chartData} />
        <RecentSales sales={recentSales} />
      </div>
    </div>
  )
}
