'use client'

import { useState } from 'react'
import { Plus, Search, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { useServices } from '@/lib/hooks/use-services'
import type { Service, ServiceInsert } from '@/types/database'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ServicesPage() {
  const { services, loading, error: serviceError, addService, updateService, deleteService } = useServices()
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name_en: '',
    name_tr: '',
    default_price: 0,
    is_variable_price: false,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredServices = services.filter(
    (service) =>
      service.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.name_tr?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name_en: service.name_en,
        name_tr: service.name_tr || '',
        default_price: service.default_price,
        is_variable_price: service.is_variable_price,
      })
    } else {
      setEditingService(null)
      setFormData({
        name_en: '',
        name_tr: '',
        default_price: 0,
        is_variable_price: false,
      })
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name_en.trim()) {
      toast.error('Please enter a service name')
      return
    }

    setSaving(true)

    const serviceData: ServiceInsert = {
      name_en: formData.name_en.trim(),
      name_tr: formData.name_tr.trim() || null,
      default_price: formData.default_price,
      is_variable_price: formData.is_variable_price,
    }

    let success: boolean
    if (editingService) {
      success = await updateService(editingService.id, serviceData)
      if (success) toast.success('Service updated successfully')
    } else {
      const result = await addService(serviceData)
      success = !!result
      if (success) toast.success('Service added successfully')
    }

    setSaving(false)

    if (success) {
      setDialogOpen(false)
    } else {
      toast.error(serviceError || 'Failed to save service')
    }
  }

  const handleDelete = async () => {
    if (!deletingService) return

    const success = await deleteService(deletingService.id)
    if (success) {
      toast.success('Service deleted successfully')
    } else {
      toast.error('Failed to delete service')
    }
    setDeleteDialogOpen(false)
    setDeletingService(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Services</h1>
          <p className="text-sm text-neutral-500">
            {services.length} services available
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-black hover:bg-neutral-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 border-neutral-300"
        />
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">
            {searchQuery ? 'No services found' : 'No services yet'}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => handleOpenDialog()}
              variant="outline"
              className="mt-4 border-neutral-300"
            >
              Add your first service
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="border-neutral-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">
                      {service.name_en}
                    </p>
                    {service.name_tr && (
                      <p className="text-sm text-neutral-500 truncate">
                        {service.name_tr}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(service)}
                    >
                      <Pencil className="h-4 w-4 text-neutral-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setDeletingService(service)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatCurrency(service.default_price)}
                  </p>
                  {service.is_variable_price && (
                    <Badge variant="secondary" className="text-xs">
                      Variable
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name_en">Name (English) *</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name_en: e.target.value }))
                }
                placeholder="e.g., Wedding Dress Alteration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_tr">Name (Turkish)</Label>
              <Input
                id="name_tr"
                value={formData.name_tr}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name_tr: e.target.value }))
                }
                placeholder="e.g., Gelinlik Tadilat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_price">Default Price (AED)</Label>
              <Input
                id="default_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.default_price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    default_price: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_variable_price">Variable Price</Label>
                <p className="text-sm text-neutral-500">
                  Price can be adjusted per sale
                </p>
              </div>
              <Switch
                id="is_variable_price"
                checked={formData.is_variable_price}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_variable_price: checked }))
                }
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
              {saving ? 'Saving...' : editingService ? 'Update' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingService?.name_en}"? This
              action cannot be undone.
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
