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

// Placeholder data for demo
const placeholderSales: SaleWithRelations[] = [
  {
    id: '1',
    sale_date: new Date().toISOString().split('T')[0],
    customer_id: null,
    service_id: '1',
    custom_description: null,
    quantity: 1,
    unit_price: 200,
    subtotal: 200,
    vat_amount: 10,
    total_amount: 210,
    payment_method: 'cash',
    payment_status: 'paid',
    deposit_amount: 0,
    notes: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    synced_at: null,
    service: {
      id: '1',
      name_en: 'Abaya Making',
      name_tr: 'Abaya Dikimi',
      default_price: 200,
      min_price: null,
      max_price: null,
      is_variable_price: false,
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
    },
    customer: null,
  },
  {
    id: '2',
    sale_date: new Date().toISOString().split('T')[0],
    customer_id: '1',
    service_id: '2',
    custom_description: null,
    quantity: 2,
    unit_price: 40,
    subtotal: 80,
    vat_amount: 4,
    total_amount: 84,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    deposit_amount: 0,
    notes: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    synced_at: null,
    service: {
      id: '2',
      name_en: 'Dress Cutting',
      name_tr: 'Elbise Kesimi',
      default_price: 40,
      min_price: null,
      max_price: null,
      is_variable_price: false,
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    customer: {
      id: '1',
      name: 'Fatima Al Mansouri',
      phone: '+971501234567',
      email: null,
      customer_type: 'individual',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    sale_date: new Date().toISOString().split('T')[0],
    customer_id: '2',
    service_id: '3',
    custom_description: 'Wedding dress alterations',
    quantity: 1,
    unit_price: 500,
    subtotal: 500,
    vat_amount: 25,
    total_amount: 525,
    payment_method: 'card',
    payment_status: 'partial',
    deposit_amount: 250,
    notes: null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    synced_at: null,
    service: {
      id: '3',
      name_en: 'Wedding Dress Work',
      name_tr: 'Gelinlik Dikimi',
      default_price: 400,
      min_price: 400,
      max_price: 2000,
      is_variable_price: true,
      is_active: true,
      sort_order: 8,
      created_at: new Date().toISOString(),
    },
    customer: {
      id: '2',
      name: 'Mariam Hassan',
      phone: '+971509876543',
      email: null,
      customer_type: 'individual',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export function RecentSales({ sales = placeholderSales }: RecentSalesProps) {
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
