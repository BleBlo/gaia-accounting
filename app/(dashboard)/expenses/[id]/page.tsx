'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import type { ExpenseWithRelations } from '@/types/database'

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [expense, setExpense] = useState<ExpenseWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchExpense = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('expenses')
        .select(`*, category:expense_categories(id, name_en), supplier:suppliers(id, name)`)
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/expenses')
        return
      }
      setExpense(data as ExpenseWithRelations)
      setLoading(false)
    }

    fetchExpense()
  }, [id, router])

  const handleDelete = async () => {
    setDeleting(true)
    await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.push('/expenses')
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount)

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

  if (!expense) return null

  const title = expense.description || expense.category?.name_en || 'Expense'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/expenses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            <p className="text-sm text-neutral-500">
              {format(new Date(expense.expense_date), 'MMMM d, yyyy')}
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
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense? This action cannot be undone.
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

      {/* Amount Summary */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-neutral-700">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Payment Method</span>
            <span className="text-sm font-medium text-neutral-900">
              {getPaymentMethodLabel(expense.payment_method)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
            <span className="text-sm font-semibold text-neutral-900">Total</span>
            <span className="text-lg font-bold text-neutral-900">
              {formatCurrency(expense.total_amount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-neutral-700">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expense.category && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Category</span>
              <span className="text-sm font-medium text-neutral-900">{expense.category.name_en}</span>
            </div>
          )}
          {expense.description && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Description</span>
              <span className="text-sm font-medium text-neutral-900">{expense.description}</span>
            </div>
          )}
          {expense.supplier && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Supplier</span>
              <span className="text-sm font-medium text-neutral-900">{expense.supplier.name}</span>
            </div>
          )}
          {expense.reference_number && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Reference</span>
              <span className="text-sm font-medium text-neutral-900">{expense.reference_number}</span>
            </div>
          )}
          {expense.notes && (
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm text-neutral-500 shrink-0">Notes</span>
              <span className="text-sm text-neutral-900 text-right">{expense.notes}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-neutral-100 pt-3">
            <span className="text-sm text-neutral-500">Recorded</span>
            <span className="text-sm text-neutral-500">
              {format(new Date(expense.created_at), 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
