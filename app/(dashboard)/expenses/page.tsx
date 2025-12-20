'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, Search, Filter, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useExpenses, useExpenseCategories } from '@/lib/hooks/use-expenses'
import { cn } from '@/lib/utils'

type DateRangeFilter = 'today' | 'week' | 'month' | 'all'

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('month')

  const { categories } = useExpenseCategories()
  const { expenses, loading, totals } = useExpenses({
    dateRange: dateFilter === 'all' ? undefined : dateFilter,
    categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    searchQuery: searchQuery || undefined,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank'
      default:
        return method.charAt(0).toUpperCase() + method.slice(1)
    }
  }

  // Get top 3 categories by spending
  const topCategories = Object.entries(totals.byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Expenses</h1>
          <p className="text-sm text-neutral-500">
            {expenses.length} transactions
          </p>
        </div>
        <Button asChild className="bg-black hover:bg-neutral-800">
          <Link href="/expenses/new">
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-neutral-200 col-span-2 lg:col-span-1">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Expenses</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              {formatCurrency(totals.total)}
            </p>
          </CardContent>
        </Card>
        {topCategories.map(([category, amount]) => (
          <Card key={category} className="border-neutral-200">
            <CardContent className="pt-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wide truncate">
                {category}
              </p>
              <p className="text-xl font-bold text-neutral-900 mt-1">
                {formatCurrency(amount)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search expenses..."
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px] border-neutral-300">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name_en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No expenses found</p>
          <Button asChild variant="outline" className="mt-4 border-neutral-300">
            <Link href="/expenses/new">Record your first expense</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Link key={expense.id} href={`/expenses/${expense.id}`}>
              <Card className="border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-neutral-900 truncate">
                          {expense.description || expense.category?.name_en || 'Expense'}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                          {expense.category?.name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-neutral-500">
                        <span>{format(new Date(expense.expense_date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{getPaymentMethodLabel(expense.payment_method)}</span>
                        {expense.supplier && (
                          <>
                            <span>•</span>
                            <span className="truncate">{expense.supplier.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <p className="font-semibold text-neutral-900">
                        {formatCurrency(expense.amount)}
                      </p>
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
