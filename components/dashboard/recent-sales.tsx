'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Banknote, CreditCard, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SaleWithRelations } from '@/types/database'

const paymentIcons = {
  cash: Banknote,
  bank_transfer: Building2,
  card: CreditCard,
}

const paymentLabels = {
  cash: 'Cash',
  bank_transfer: 'Bank',
  card: 'Card',
}

const statusColors = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  pending: 'bg-red-100 text-red-700',
}

interface RecentSalesProps {
  sales?: SaleWithRelations[]
}

export function RecentSales({ sales = [] }: RecentSalesProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Sales</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sales" className="flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sales.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No sales recorded yet
            </div>
          ) : (
            sales.map((sale) => {
              const PaymentIcon = paymentIcons[sale.payment_method]
              return (
                <Link
                  key={sale.id}
                  href={`/sales/${sale.id}`}
                  className="block p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate">
                          {sale.service?.name_en || sale.custom_description || 'Custom Work'}
                        </p>
                        {sale.payment_status !== 'paid' && (
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', statusColors[sale.payment_status])}
                          >
                            {sale.payment_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500">
                          {sale.customer?.name || 'Walk-in'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-400">
                          {formatTime(sale.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(sale.total_amount)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <PaymentIcon className="h-3 w-3" />
                          {paymentLabels[sale.payment_method]}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
