'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, Search, Loader2, Pencil, Trash2, Phone, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import { useEmployees } from '@/lib/hooks/use-employees'
import type { Employee, EmployeeInsert } from '@/types/database'
import { toast } from 'sonner'

export default function EmployeesPage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    phone: '',
    salary_amount: 0,
    salary_day: 1,
    start_date: '',
    visa_expiry_date: '',
    emirates_id: '',
    notes: '',
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        job_title: employee.job_title,
        phone: employee.phone || '',
        salary_amount: employee.salary_amount,
        salary_day: employee.salary_day,
        start_date: employee.start_date || '',
        visa_expiry_date: employee.visa_expiry_date || '',
        emirates_id: employee.emirates_id || '',
        notes: employee.notes || '',
      })
    } else {
      setEditingEmployee(null)
      setFormData({
        name: '',
        job_title: '',
        phone: '',
        salary_amount: 0,
        salary_day: 1,
        start_date: '',
        visa_expiry_date: '',
        emirates_id: '',
        notes: '',
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter employee name')
      return
    }
    if (!formData.job_title.trim()) {
      toast.error('Please enter job title')
      return
    }

    setSaving(true)

    const employeeData: EmployeeInsert = {
      name: formData.name.trim(),
      job_title: formData.job_title.trim(),
      phone: formData.phone.trim() || null,
      salary_amount: formData.salary_amount,
      salary_day: formData.salary_day,
      start_date: formData.start_date || null,
      visa_expiry_date: formData.visa_expiry_date || null,
      emirates_id: formData.emirates_id.trim() || null,
      notes: formData.notes.trim() || null,
    }

    let success: boolean
    if (editingEmployee) {
      success = await updateEmployee(editingEmployee.id, employeeData)
      if (success) toast.success('Employee updated successfully')
    } else {
      const result = await addEmployee(employeeData)
      success = !!result
      if (success) toast.success('Employee added successfully')
    }

    setSaving(false)

    if (success) {
      setDialogOpen(false)
    } else {
      toast.error('Failed to save employee')
    }
  }

  const handleDelete = async () => {
    if (!deletingEmployee) return

    const success = await deleteEmployee(deletingEmployee.id)
    if (success) {
      toast.success('Employee removed successfully')
    } else {
      toast.error('Failed to remove employee')
    }
    setDeleteDialogOpen(false)
    setDeletingEmployee(null)
  }

  const isVisaExpiringSoon = (date: string | null) => {
    if (!date) return false
    const expiryDate = new Date(date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isVisaExpired = (date: string | null) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Employees</h1>
          <p className="text-sm text-neutral-500">
            {employees.length} employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-neutral-300">
            <Link href="/employees/salaries">Salary Payments</Link>
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-black hover:bg-neutral-800">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-neutral-300"
        />
      </div>

      {/* Employees List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">
            {searchQuery ? 'No employees found' : 'No employees yet'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4 border-neutral-300"
            >
              Add your first employee
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-neutral-900">{employee.name}</p>
                      {isVisaExpired(employee.visa_expiry_date) && (
                        <Badge variant="destructive" className="text-xs">Visa Expired</Badge>
                      )}
                      {isVisaExpiringSoon(employee.visa_expiry_date) && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-700">Visa Expiring</Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-2">{employee.job_title}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                      {employee.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(employee.salary_amount)}/month
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Payday: {employee.salary_day}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(employee)}
                    >
                      <Pencil className="h-4 w-4 text-neutral-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setDeletingEmployee(employee)
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Employee name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => setFormData((prev) => ({ ...prev, job_title: e.target.value }))}
                placeholder="e.g., Tailor, Seamstress"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 123 4567"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_amount">Salary (AED)</Label>
                <Input
                  id="salary_amount"
                  type="number"
                  min="0"
                  value={formData.salary_amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, salary_amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_day">Payday</Label>
                <Select
                  value={formData.salary_day.toString()}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, salary_day: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visa_expiry_date">Visa Expiry Date</Label>
              <Input
                id="visa_expiry_date"
                type="date"
                value={formData.visa_expiry_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, visa_expiry_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emirates_id">Emirates ID</Label>
              <Input
                id="emirates_id"
                value={formData.emirates_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, emirates_id: e.target.value }))}
                placeholder="784-XXXX-XXXXXXX-X"
              />
            </div>
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
              {saving ? 'Saving...' : editingEmployee ? 'Update' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deletingEmployee?.name}"? This will hide them from the list but keep their payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
