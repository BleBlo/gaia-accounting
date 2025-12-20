'use client'

import { useState, useEffect } from 'react'
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
import { ServiceSelector } from './service-selector'
import { CustomerSelector } from './customer-selector'
import { useServices } from '@/lib/hooks/use-services'
import { useCustomers } from '@/lib/hooks/use-customers'
import { useSales } from '@/lib/hooks/use-sales'
import { calculateSaleVAT } from '@/lib/utils/currency'
import type { Service, SaleInsert } from '@/types/database'
import { toast } from 'sonner'

type PaymentMethod = 'cash' | 'bank_transfer' | 'card'
type PaymentStatus = 'paid' | 'partial' | 'pending'

export function SaleForm() {
  const router = useRouter()
  const { services, loading: servicesLoading } = useServices()
  const { customers, addCustomer } = useCustomers()
  const { addSale } = useSales()

  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [customDescription, setCustomDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid')
  const [depositAmount, setDepositAmount] = useState(0)
  const [notes, setNotes] = useState('')

  // Update unit price when service changes
  useEffect(() => {
    if (selectedService) {
      setUnitPrice(selectedService.default_price)
    }
  }, [selectedService])

  // Calculate totals
  const subtotal = unitPrice * quantity
  const { vat, total } = calculateSaleVAT(subtotal)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleSubmit = async (saveAndNew: boolean = false) => {
    if (!selectedService && !customDescription) {
      toast.error('Please select a service or add a description')
      return
    }

    if (unitPrice <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setSaving(true)

    const saleData: SaleInsert = {
      sale_date: format(date, 'yyyy-MM-dd'),
      service_id: selectedService?.id || null,
      custom_description: customDescription || null,
      customer_id: customerId,
      quantity,
      unit_price: unitPrice,
      subtotal,
      vat_amount: vat,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      deposit_amount: paymentStatus === 'partial' ? depositAmount : 0,
      notes: notes || null,
    }

    const result = await addSale(saleData)
    setSaving(false)

    if (result) {
      toast.success('Sale recorded successfully')

      if (saveAndNew) {
        // Reset form for new entry
        setSelectedService(null)
        setCustomDescription('')
        setQuantity(1)
        setUnitPrice(0)
        setCustomerId(null)
        setPaymentStatus('paid')
        setDepositAmount(0)
        setNotes('')
      } else {
        router.push('/sales')
      }
    } else {
      toast.error('Failed to record sale')
    }
  }

  if (servicesLoading) {
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

      {/* Service */}
      <div className="space-y-2">
        <Label>Service *</Label>
        <ServiceSelector
          services={services}
          value={selectedService?.id || null}
          onSelect={setSelectedService}
        />
      </div>

      {/* Custom Description (for variable price services) */}
      {(selectedService?.is_variable_price || selectedService?.name_en === 'Custom Work') && (
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="Describe the work..."
          />
        </div>
      )}

      {/* Quantity and Unit Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="border-neutral-300"
          />
        </div>
        <div className="space-y-2">
          <Label>Unit Price (AED)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
            className="border-neutral-300"
          />
        </div>
      </div>

      {/* Customer */}
      <div className="space-y-2">
        <Label>Customer (optional)</Label>
        <CustomerSelector
          customers={customers}
          value={customerId}
          onSelect={setCustomerId}
          onAddCustomer={addCustomer}
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

      {/* Payment Status */}
      <div className="space-y-2">
        <Label>Payment Status</Label>
        <div className="grid grid-cols-3 gap-2">
          {(['paid', 'partial', 'pending'] as PaymentStatus[]).map((status) => (
            <Button
              key={status}
              type="button"
              variant={paymentStatus === status ? 'default' : 'outline'}
              onClick={() => setPaymentStatus(status)}
              className={cn(
                'capitalize',
                paymentStatus === status
                  ? 'bg-black hover:bg-neutral-800'
                  : 'border-neutral-300'
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Deposit Amount (for partial payments) */}
      {paymentStatus === 'partial' && (
        <div className="space-y-2">
          <Label>Deposit Amount (AED)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
            className="border-neutral-300"
          />
        </div>
      )}

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

      {/* Totals */}
      <Card className="border-neutral-200 bg-neutral-50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">VAT (5%)</span>
              <span>{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {paymentStatus === 'partial' && depositAmount > 0 && (
              <div className="flex justify-between text-sm text-neutral-600 pt-2">
                <span>Balance Due</span>
                <span>{formatCurrency(total - depositAmount)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          className="flex-1 border-neutral-300"
          onClick={() => router.push('/sales')}
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
