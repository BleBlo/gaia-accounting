'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, Search, Filter, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSales } from '@/lib/hooks/use-sales'
import { cn } from '@/lib/utils'

type PaymentStatusFilter = 'all' | 'paid' | 'partial' | 'pending'
type DateRangeFilter = 'today' | 'week' | 'month' | 'all'

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('month')

  const { sales, loading, totals } = useSales({
    dateRange: dateFilter === 'all' ? undefined : dateFilter,
    paymentStatus: statusFilter === 'all' ? undefined : statusFilter,
    searchQuery: searchQuery || undefined,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'partial':
        return 'bg-yellow-100 text-yellow-700'
      case 'pending':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank'
      default:
        return method.charAt(0).toUpperCase() + method.slice(1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Sales</h1>
          <p className="text-sm text-neutral-500">
            {sales.length} transactions
          </p>
        </div>
        <Button asChild className="bg-black hover:bg-neutral-800">
          <Link href="/sales/new">
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Sales</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              {formatCurrency(totals.total)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">VAT Collected</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              {formatCurrency(totals.vat)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Received</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              {formatCurrency(totals.paid)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Pending</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">
              {formatCurrency(totals.pending)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search sales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-neutral-300"
          />
        </div>
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateRangeFilter)}>
          <SelectTrigger className="w-full sm:w-[140px] border-neutral-300">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatusFilter)}>
          <SelectTrigger className="w-full sm:w-[140px] border-neutral-300">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No sales found</p>
          <Button asChild variant="outline" className="mt-4 border-neutral-300">
            <Link href="/sales/new">Record your first sale</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <Link key={sale.id} href={`/sales/${sale.id}`}>
              <Card className="border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-neutral-900 truncate">
                          {sale.service?.name_en || sale.custom_description || 'Sale'}
                        </p>
                        <Badge className={cn('text-xs', getStatusColor(sale.payment_status))}>
                          {sale.payment_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <span>{format(new Date(sale.sale_date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{getPaymentMethodLabel(sale.payment_method)}</span>
                        {sale.customer && (
                          <>
                            <span>•</span>
                            <span className="truncate">{sale.customer.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900">
                          {formatCurrency(sale.total_amount)}
                        </p>
                        {sale.payment_status === 'partial' && (
                          <p className="text-xs text-neutral-500">
                            Paid: {formatCurrency(sale.deposit_amount || 0)}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
