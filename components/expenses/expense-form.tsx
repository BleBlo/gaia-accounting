'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CategorySelector } from './category-selector'
import { SupplierSelector } from './supplier-selector'
import { useExpenses, useExpenseCategories } from '@/lib/hooks/use-expenses'
import { useSuppliers } from '@/lib/hooks/use-suppliers'
import type { ExpenseCategory, ExpenseInsert } from '@/types/database'
import { toast } from 'sonner'

type PaymentMethod = 'cash' | 'bank_transfer' | 'card'

export function ExpenseForm() {
  const router = useRouter()
  const { categories, loading: categoriesLoading } = useExpenseCategories()
  const { suppliers, addSupplier } = useSuppliers()
  const { addExpense } = useExpenses()

  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amt)
  }

  const handleSubmit = async (saveAndNew: boolean = false) => {
    if (!selectedCategory) {
      toast.error('Please select a category')
      return
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSaving(true)

    const expenseData: ExpenseInsert = {
      expense_date: format(date, 'yyyy-MM-dd'),
      category_id: selectedCategory.id,
      supplier_id: supplierId,
      description: description || null,
      amount,
      payment_method: paymentMethod,
      reference_number: reference || null,
      notes: notes || null,
    }

    try {
      const result = await addExpense(expenseData)
      setSaving(false)

      if (result) {
        toast.success('Expense recorded successfully')

        if (saveAndNew) {
          setSelectedCategory(null)
          setSupplierId(null)
          setDescription('')
          setAmount(0)
          setReference('')
          setNotes('')
        } else {
          router.push('/expenses')
        }
      }
    } catch (err) {
      setSaving(false)
      toast.error(err instanceof Error ? err.message : 'Failed to record expense')
    }
  }

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal border-neutral-300',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <CategorySelector
          categories={categories}
          value={selectedCategory?.id || null}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label>Amount (AED) *</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="border-neutral-300 text-lg"
          placeholder="0.00"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this expense for?"
          className="border-neutral-300"
        />
      </div>

      {/* Supplier */}
      <div className="space-y-2">
        <Label>Supplier (optional)</Label>
        <SupplierSelector
          suppliers={suppliers}
          value={supplierId}
          onSelect={setSupplierId}
          onAddSupplier={addSupplier}
        />
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['cash', 'bank_transfer', 'card'] as PaymentMethod[]).map((method) => (
            <Button
              key={method}
              type="button"
              variant={paymentMethod === method ? 'default' : 'outline'}
              onClick={() => setPaymentMethod(method)}
              className={cn(
                'capitalize',
                paymentMethod === method
                  ? 'bg-black hover:bg-neutral-800'
                  : 'border-neutral-300'
              )}
            >
              {method === 'bank_transfer' ? 'Bank' : method}
            </Button>
          ))}
        </div>
      </div>

      {/* Reference Number */}
      <div className="space-y-2">
        <Label>Reference / Invoice Number</Label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="INV-001"
          className="border-neutral-300"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          className="border-neutral-300"
        />
      </div>

      {/* Total */}
      <Card className="border-neutral-200 bg-neutral-50">
        <CardContent className="pt-6">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1 border-neutral-300"
          onClick={() => router.push('/expenses')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-neutral-300"
          onClick={() => handleSubmit(false)}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save & Close'}
        </Button>
        <Button
          className="flex-1 bg-black hover:bg-neutral-800"
          onClick={() => handleSubmit(true)}
          disabled={saving}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save & New'}
        </Button>
      </div>
    </div>
  )
}
