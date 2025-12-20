import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentSales } from '@/components/dashboard/recent-sales'
import { RevenueChart } from '@/components/dashboard/revenue-chart'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here&apos;s your business overview.</p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        todaySales={1250}
        todayCount={5}
        weekSales={8900}
        monthSales={32500}
        pendingReceivables={3400}
      />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart />
        <RecentSales />
      </div>
    </div>
  )
}
