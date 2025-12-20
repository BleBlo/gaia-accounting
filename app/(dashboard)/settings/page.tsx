'use client'

import { useState, useEffect } from 'react'
import { Loader2, Check, Building2, Globe, Receipt, Scissors, FolderOpen, Plus, Pencil, Trash2, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { exportAllDataToExcel } from '@/lib/utils/export'
import { useI18n, type Locale } from '@/lib/i18n'

interface BusinessSettings {
  businessName: string
  businessNameAr: string
  phone: string
  email: string
  address: string
  trnNumber: string // Tax Registration Number
}

interface AppSettings {
  language: 'en' | 'tr'
  currency: string
  vatRate: number
  defaultPaymentMethod: 'cash' | 'bank_transfer' | 'card'
  showVatOnReceipts: boolean
}

interface Service {
  id: string
  name_en: string
  name_tr: string | null
  default_price: number
  is_active: boolean
}

interface ExpenseCategory {
  id: string
  name_en: string
  name_tr: string | null
  is_active: boolean
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [exporting, setExporting] = useState(false)
  const supabase = createClient()
  const { locale, setLocale, t } = useI18n()

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: 'GAIA Fashion House',
    businessNameAr: '',
    phone: '',
    email: '',
    address: 'Abu Dhabi, UAE',
    trnNumber: '',
  })

  const [appSettings, setAppSettings] = useState<AppSettings>({
    language: 'en',
    currency: 'AED',
    vatRate: 5,
    defaultPaymentMethod: 'cash',
    showVatOnReceipts: true,
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')

        if (data) {
          data.forEach((setting) => {
            if (setting.key === 'business') {
              setBusinessSettings(setting.value as BusinessSettings)
            } else if (setting.key === 'app') {
              setAppSettings(setting.value as AppSettings)
            }
          })
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
      setLoading(false)
    }

    async function loadServicesAndCategories() {
      const [servicesRes, categoriesRes] = await Promise.all([
        supabase.from('services').select('*').order('sort_order'),
        supabase.from('expense_categories').select('*').order('sort_order'),
      ])

      if (servicesRes.data) setServices(servicesRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    }

    loadSettings()
    loadServicesAndCategories()
  }, [])

  const handleSaveBusinessSettings = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'business',
          value: businessSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('Business settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    }
    setSaving(false)
  }

  const handleSaveAppSettings = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'app',
          value: appSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })

      if (error) throw error
      toast.success('App settings saved')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    }
    setSaving(false)
  }

  const handleSaveService = async () => {
    if (!editingService) return
    setSaving(true)
    try {
      if (editingService.id) {
        const { error } = await supabase
          .from('services')
          .update({
            name_en: editingService.name_en,
            name_tr: editingService.name_tr,
            default_price: editingService.default_price,
            is_active: editingService.is_active,
          })
          .eq('id', editingService.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            name_en: editingService.name_en,
            name_tr: editingService.name_tr,
            default_price: editingService.default_price,
            is_active: editingService.is_active,
          })
        if (error) throw error
      }
      const { data } = await supabase.from('services').select('*').order('sort_order')
      if (data) setServices(data)
      setShowServiceDialog(false)
      setEditingService(null)
      toast.success(editingService.id ? 'Service updated' : 'Service added')
    } catch (error) {
      toast.error('Failed to save service')
      console.error(error)
    }
    setSaving(false)
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      setServices(services.filter(s => s.id !== id))
      toast.success('Service deleted')
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  const handleSaveCategory = async () => {
    if (!editingCategory) return
    setSaving(true)
    try {
      if (editingCategory.id) {
        const { error } = await supabase
          .from('expense_categories')
          .update({
            name_en: editingCategory.name_en,
            name_tr: editingCategory.name_tr,
            is_active: editingCategory.is_active,
          })
          .eq('id', editingCategory.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('expense_categories')
          .insert({
            name_en: editingCategory.name_en,
            name_tr: editingCategory.name_tr,
            is_active: editingCategory.is_active,
          })
        if (error) throw error
      }
      const { data } = await supabase.from('expense_categories').select('*').order('sort_order')
      if (data) setCategories(data)
      setShowCategoryDialog(false)
      setEditingCategory(null)
      toast.success(editingCategory.id ? 'Category updated' : 'Category added')
    } catch (error) {
      toast.error('Failed to save category')
      console.error(error)
    }
    setSaving(false)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const { error } = await supabase.from('expense_categories').delete().eq('id', id)
      if (error) throw error
      setCategories(categories.filter(c => c.id !== id))
      toast.success('Category deleted')
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  const handleExportAllData = async () => {
    setExporting(true)
    try {
      const [salesRes, expensesRes, employeesRes, customersRes] = await Promise.all([
        supabase.from('sales').select('*, service:services(name_en), customer:customers(name)'),
        supabase.from('expenses').select('*, category:expense_categories(name_en)'),
        supabase.from('employees').select('*'),
        supabase.from('customers').select('*'),
      ])
      exportAllDataToExcel(
        salesRes.data || [],
        expensesRes.data || [],
        employeesRes.data || [],
        customersRes.data || []
      )
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
    setExporting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your business and app preferences</p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="app">App Settings</TabsTrigger>
        </TabsList>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">

      {/* Business Information */}
      <Card className="border-neutral-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-neutral-500" />
            <CardTitle>Business Information</CardTitle>
          </div>
          <CardDescription>Your business details for receipts and reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name (English)</Label>
              <Input
                id="businessName"
                value={businessSettings.businessName}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="GAIA Fashion House"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessNameAr">Business Name (Turkish)</Label>
              <Input
                id="businessNameAr"
                value={businessSettings.businessNameAr}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, businessNameAr: e.target.value }))}
                placeholder="GAIA Moda Evi"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={businessSettings.phone}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 2 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={businessSettings.email}
                onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="info@gaiafashion.ae"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={businessSettings.address}
              onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Abu Dhabi, UAE"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trnNumber">TRN (Tax Registration Number)</Label>
            <Input
              id="trnNumber"
              value={businessSettings.trnNumber}
              onChange={(e) => setBusinessSettings(prev => ({ ...prev, trnNumber: e.target.value }))}
              placeholder="100XXXXXXXXX"
            />
            <p className="text-xs text-neutral-500">Your UAE Tax Registration Number for VAT</p>
          </div>

          <Button
            onClick={handleSaveBusinessSettings}
            disabled={saving}
            className="bg-black hover:bg-neutral-800"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Business Info
          </Button>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card className="border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-neutral-500" />
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Manage your tailoring services</CardDescription>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingService({ id: '', name_en: '', name_tr: '', default_price: 0, is_active: true })
                  setShowServiceDialog(true)
                }}
                className="bg-black hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{service.name_en}</p>
                      {service.name_tr && (
                        <p className="text-sm text-neutral-500">{service.name_tr}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-neutral-600">
                        AED {service.default_price.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        service.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingService(service)
                          setShowServiceDialog(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <p className="text-center text-neutral-500 py-8">No services yet. Add your first service.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card className="border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-neutral-500" />
                <div>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>Manage expense categories</CardDescription>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingCategory({ id: '', name_en: '', name_tr: '', is_active: true })
                  setShowCategoryDialog(true)
                }}
                className="bg-black hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{category.name_en}</p>
                      {category.name_tr && (
                        <p className="text-sm text-neutral-500">{category.name_tr}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setShowCategoryDialog(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-center text-neutral-500 py-8">No categories yet. Add your first category.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings Tab */}
        <TabsContent value="app" className="space-y-6">

      {/* App Preferences */}
      <Card className="border-neutral-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-neutral-500" />
            <CardTitle>App Preferences</CardTitle>
          </div>
          <CardDescription>Customize how the app works for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={locale}
                onValueChange={(v) => {
                  setLocale(v as Locale)
                  toast.success(v === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500">Changes apply immediately</p>
            </div>

            <div className="space-y-2">
              <Label>Default Payment Method</Label>
              <Select
                value={appSettings.defaultPaymentMethod}
                onValueChange={(v) => setAppSettings(prev => ({ ...prev, defaultPaymentMethod: v as 'cash' | 'bank_transfer' | 'card' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              VAT Settings
            </h4>

            <div className="space-y-2">
              <Label htmlFor="vatRate">VAT Rate (%)</Label>
              <Input
                id="vatRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={appSettings.vatRate}
                onChange={(e) => setAppSettings(prev => ({ ...prev, vatRate: parseFloat(e.target.value) || 0 }))}
                className="w-24"
              />
              <p className="text-xs text-neutral-500">UAE standard VAT rate is 5%</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showVat">Show VAT on Receipts</Label>
                <p className="text-xs text-neutral-500">Display VAT breakdown on customer receipts</p>
              </div>
              <Switch
                id="showVat"
                checked={appSettings.showVatOnReceipts}
                onCheckedChange={(checked) => setAppSettings(prev => ({ ...prev, showVatOnReceipts: checked }))}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveAppSettings}
            disabled={saving}
            className="bg-black hover:bg-neutral-800"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-neutral-300"
              onClick={handleExportAllData}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Export All Data (Excel)
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            Export all sales, expenses, employees, and customers to an Excel spreadsheet.
          </p>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService?.id ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>
              {editingService?.id ? 'Update service details' : 'Add a new tailoring service'}
            </DialogDescription>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name (English)</Label>
                <Input
                  id="serviceName"
                  value={editingService.name_en}
                  onChange={(e) => setEditingService({ ...editingService, name_en: e.target.value })}
                  placeholder="e.g. Dress Alteration"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceNameTr">Service Name (Turkish)</Label>
                <Input
                  id="serviceNameTr"
                  value={editingService.name_tr || ''}
                  onChange={(e) => setEditingService({ ...editingService, name_tr: e.target.value })}
                  placeholder="e.g. Elbise Tadilat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicePrice">Default Price (AED)</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingService.default_price}
                  onChange={(e) => setEditingService({ ...editingService, default_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="serviceActive">Active</Label>
                <Switch
                  id="serviceActive"
                  checked={editingService.is_active}
                  onCheckedChange={(checked) => setEditingService({ ...editingService, is_active: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveService} disabled={saving} className="bg-black hover:bg-neutral-800">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory?.id ? 'Update category details' : 'Add a new expense category'}
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name (English)</Label>
                <Input
                  id="categoryName"
                  value={editingCategory.name_en}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_en: e.target.value })}
                  placeholder="e.g. Office Supplies"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryNameTr">Category Name (Turkish)</Label>
                <Input
                  id="categoryNameTr"
                  value={editingCategory.name_tr || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name_tr: e.target.value })}
                  placeholder="e.g. Ofis Malzemeleri"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="categoryActive">Active</Label>
                <Switch
                  id="categoryActive"
                  checked={editingCategory.is_active}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, is_active: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={saving} className="bg-black hover:bg-neutral-800">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
