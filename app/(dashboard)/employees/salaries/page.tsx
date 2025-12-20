'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEmployees, useSalaryPayments } from '@/lib/hooks/use-employees'
import type { SalaryPayment, SalaryPaymentInsert } from '@/types/database'
import { toast } from 'sonner'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function SalaryPaymentsPage() {
  const { employees } = useEmployees()
  const { payments, loading, addPayment, deletePayment } = useSalaryPayments()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPayment, setDeletingPayment] = useState<SalaryPayment | null>(null)
  const [saving, setSaving] = useState(false)

  const currentDate = new Date()
  const [formData, setFormData] = useState({
    employee_id: '',
    period_month: currentDate.getMonth() + 1,
    period_year: currentDate.getFullYear(),
    base_salary: 0,
    deductions: 0,
    advances: 0,
    payment_method: 'cash' as 'cash' | 'bank_transfer',
    notes: '',
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    setFormData(prev => ({
      ...prev,
      employee_id: employeeId,
      base_salary: employee?.salary_amount || 0,
    }))
  }

  const netAmount = formData.base_salary - formData.deductions - formData.advances

  const handleSubmit = async () => {
    if (!formData.employee_id) {
      toast.error('Please select an employee')
      return
    }

    setSaving(true)

    const paymentData: SalaryPaymentInsert = {
      employee_id: formData.employee_id,
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      period_month: formData.period_month,
      period_year: formData.period_year,
      base_salary: formData.base_salary,
      deductions: formData.deductions,
      advances: formData.advances,
      net_amount: netAmount,
      payment_method: formData.payment_method,
      notes: formData.notes.trim() || null,
    }

    const result = await addPayment(paymentData)
    setSaving(false)

    if (result) {
      toast.success('Salary payment recorded')
      setDialogOpen(false)
      setFormData({
        employee_id: '',
        period_month: currentDate.getMonth() + 1,
        period_year: currentDate.getFullYear(),
        base_salary: 0,
        deductions: 0,
        advances: 0,
        payment_method: 'cash',
        notes: '',
      })
    } else {
      toast.error('Failed to record payment')
    }
  }

  const handleDelete = async () => {
    if (!deletingPayment) return

    const success = await deletePayment(deletingPayment.id)
    if (success) {
      toast.success('Payment deleted')
    } else {
      toast.error('Failed to delete payment')
    }
    setDeleteDialogOpen(false)
    setDeletingPayment(null)
  }

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown'
  }

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + p.net_amount, 0)
  const thisMonthPayments = payments.filter(
    p => p.period_month === currentDate.getMonth() + 1 && p.period_year === currentDate.getFullYear()
  )
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + p.net_amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/employees">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">Salary Payments</h1>
          <p className="text-sm text-neutral-500">Track employee salary payments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-black hover:bg-neutral-800">
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">This Month</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              {formatCurrency(thisMonthTotal)}
            </p>
            <p className="text-xs text-neutral-500">{thisMonthPayments.length} payments</p>
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardContent className="pt-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Paid</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-xs text-neutral-500">{payments.length} payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No salary payments recorded yet</p>
          <Button
            onClick={() => setDialogOpen(true)}
            variant="outline"
            className="mt-4 border-neutral-300"
          >
            Record first payment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-neutral-900">
                        {getEmployeeName(payment.employee_id)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {months[payment.period_month - 1]} {payment.period_year}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                      <span>Paid: {format(new Date(payment.payment_date), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                      {payment.deductions > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-500">-{formatCurrency(payment.deductions)} deductions</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <p className="font-semibold text-neutral-900">
                      {formatCurrency(payment.net_amount)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setDeletingPayment(payment)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Salary Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Employee *</Label>
              <Select value={formData.employee_id} onValueChange={handleEmployeeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select
                  value={formData.period_month.toString()}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, period_month: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={formData.period_year.toString()}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, period_year: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Base Salary (AED)</Label>
              <Input
                type="number"
                min="0"
                value={formData.base_salary}
                onChange={(e) => setFormData((prev) => ({ ...prev, base_salary: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deductions</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.deductions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deductions: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Advances</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.advances}
                  onChange={(e) => setFormData((prev) => ({ ...prev, advances: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, payment_method: v as 'cash' | 'bank_transfer' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="border-neutral-200 bg-neutral-50">
              <CardContent className="pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Amount</span>
                  <span>{formatCurrency(netAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-black hover:bg-neutral-800"
            >
              {saving ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this salary payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
