'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SaleWithRelations } from '@/types/database'

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [sale, setSale] = useState<SaleWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchSale = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('sales')
        .select(`*, customer:customers(*), service:services(*)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/sales')
        return
      }
      setSale(data as SaleWithRelations)
      setLoading(false)
    }

    fetchSale()
  }, [id, router])

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('sales').delete().eq('id', id)
    router.push('/sales')
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':    return 'bg-green-100 text-green-700'
      case 'partial': return 'bg-yellow-100 text-yellow-700'
      case 'pending': return 'bg-red-100 text-red-700'
      default:        return 'bg-neutral-100 text-neutral-700'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer'
      case 'card':          return 'Card'
      default:              return 'Cash'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (!sale) return null

  const title = sale.service?.name_en || sale.custom_description || 'Sale'
  const remaining = sale.payment_status === 'partial'
    ? sale.total_amount - (sale.deposit_amount || 0)
    : 0

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sales">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-500">
              {format(new Date(sale.sale_date), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sale</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this sale? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Payment Summary */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-neutral-700">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Status</span>
            <Badge className={cn('text-xs capitalize', getStatusColor(sale.payment_status))}>
              {sale.payment_status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Payment Method</span>
            <span className="text-sm font-medium text-neutral-900">
              {getPaymentMethodLabel(sale.payment_method)}
            </span>
          </div>
          <div className="border-t border-neutral-100 pt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Subtotal</span>
              <span className="text-sm text-neutral-900">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">VAT</span>
              <span className="text-sm text-neutral-900">{formatCurrency(sale.vat_amount)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-neutral-100 pt-2">
              <span className="text-sm font-semibold text-neutral-900">Total</span>
              <span className="text-lg font-bold text-neutral-900">{formatCurrency(sale.total_amount)}</span>
            </div>
            {sale.payment_status === 'partial' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Deposit Paid</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(sale.deposit_amount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">Remaining</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sale Details */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-neutral-700">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sale.service && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Service</span>
              <span className="text-sm font-medium text-neutral-900">{sale.service.name_en}</span>
            </div>
          )}
          {sale.custom_description && !sale.service && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Description</span>
              <span className="text-sm font-medium text-neutral-900">{sale.custom_description}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Quantity</span>
            <span className="text-sm font-medium text-neutral-900">{sale.quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Unit Price</span>
            <span className="text-sm font-medium text-neutral-900">{formatCurrency(sale.unit_price)}</span>
          </div>
          {sale.customer && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Customer</span>
              <span className="text-sm font-medium text-neutral-900">{sale.customer.name}</span>
            </div>
          )}
          {sale.notes && (
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-neutral-500 shrink-0">Notes</span>
              <span className="text-sm text-neutral-900 text-right">{sale.notes}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
            <span className="text-sm text-neutral-500">Recorded</span>
            <span className="text-sm text-neutral-500">
              {format(new Date(sale.created_at), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
