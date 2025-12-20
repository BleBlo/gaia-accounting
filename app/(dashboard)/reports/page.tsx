'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Loader2, TrendingUp, TrendingDown, Receipt, CreditCard, Users, FileText, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useReports, useVatReport, useReportExportData } from '@/lib/hooks/use-reports'
import { exportSalesToPDF, exportExpensesToPDF, exportVATReportToPDF, exportSalesToExcel, exportExpensesToExcel, exportVATReportToExcel } from '@/lib/utils/export'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

type DateRange = 'today' | 'week' | 'month' | 'year'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const { data, loading, fetchReport } = useReports()
  const { data: vatData, loading: vatLoading, fetchVatReport } = useVatReport()
  const { salesData, expensesData, fetchExportData } = useReportExportData()

  const currentDate = new Date()
  const [vatMonth, setVatMonth] = useState(currentDate.getMonth() + 1)
  const [vatYear, setVatYear] = useState(currentDate.getFullYear())
  const [businessName, setBusinessName] = useState('GAIA Fashion House')
  const [trnNumber, setTrnNumber] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchReport(dateRange)
    fetchExportData(dateRange)
  }, [dateRange, fetchReport, fetchExportData])

  useEffect(() => {
    fetchVatReport(vatMonth, vatYear)
  }, [vatMonth, vatYear, fetchVatReport])

  // Load business settings
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'business')
        .single()

      if (data?.value) {
        const settings = data.value as any
        setBusinessName(settings.businessName || 'GAIA Fashion House')
        setTrnNumber(settings.trnNumber || '')
      }
    }
    loadSettings()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today':
        return format(new Date(), 'MMMM d, yyyy')
      case 'week':
        return 'This Week'
      case 'month':
        return format(new Date(), 'MMMM yyyy')
      case 'year':
        return format(new Date(), 'yyyy')
    }
  }

  const handleExportSalesPDF = () => {
    if (!salesData.length) {
      toast.error('No sales data to export')
      return
    }
    exportSalesToPDF(salesData, getDateRangeLabel(), {
      total: data?.sales.total || 0,
      vat: data?.sales.vat || 0,
    })
    toast.success('Sales report exported as PDF')
  }

  const handleExportSalesExcel = () => {
    if (!salesData.length) {
      toast.error('No sales data to export')
      return
    }
    exportSalesToExcel(salesData, getDateRangeLabel())
    toast.success('Sales report exported as Excel')
  }

  const handleExportExpensesPDF = () => {
    if (!expensesData.length) {
      toast.error('No expenses data to export')
      return
    }
    exportExpensesToPDF(expensesData, getDateRangeLabel(), data?.expenses.total || 0)
    toast.success('Expenses report exported as PDF')
  }

  const handleExportExpensesExcel = () => {
    if (!expensesData.length) {
      toast.error('No expenses data to export')
      return
    }
    exportExpensesToExcel(expensesData, getDateRangeLabel())
    toast.success('Expenses report exported as Excel')
  }

  const handleExportVATPDF = () => {
    if (!vatData) {
      toast.error('No VAT data to export')
      return
    }
    exportVATReportToPDF({
      period: `${months[vatMonth - 1]} ${vatYear}`,
      salesTotal: vatData.salesTotal,
      salesVat: vatData.salesVat,
      salesCount: vatData.salesCount,
      businessName,
      trnNumber,
    })
    toast.success('VAT report exported as PDF')
  }

  const handleExportVATExcel = () => {
    if (!vatData) {
      toast.error('No VAT data to export')
      return
    }
    exportVATReportToExcel({
      period: `${months[vatMonth - 1]} ${vatYear}`,
      salesTotal: vatData.salesTotal,
      salesVat: vatData.salesVat,
      salesCount: vatData.salesCount,
      businessName,
      trnNumber,
    })
    toast.success('VAT report exported as Excel')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
          <p className="text-sm text-neutral-500">Financial overview and analytics</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vat">VAT Report</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Date Range Selector & Export Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
                <SelectTrigger className="w-[180px] border-neutral-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-neutral-500">{getDateRangeLabel()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportSalesPDF} className="border-neutral-300">
                <Download className="h-4 w-4 mr-1" />
                Sales PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSalesExcel} className="border-neutral-300">
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Sales Excel
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-neutral-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="h-4 w-4 text-neutral-500" />
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Sales</p>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                      {formatCurrency(data.sales.total)}
                    </p>
                    <p className="text-xs text-neutral-500">{data.sales.count} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4 text-neutral-500" />
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Expenses</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(data.expenses.total)}
                    </p>
                    <p className="text-xs text-neutral-500">{data.expenses.count} transactions</p>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-neutral-500" />
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Salaries</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(data.salaries.total)}
                    </p>
                    <p className="text-xs text-neutral-500">{data.salaries.count} payments</p>
                  </CardContent>
                </Card>

                <Card className={cn(
                  "border-neutral-200",
                  data.profit >= 0 ? "bg-green-50" : "bg-red-50"
                )}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {data.profit >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">Net Profit</p>
                    </div>
                    <p className={cn(
                      "text-2xl font-bold",
                      data.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {formatCurrency(data.profit)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* VAT Summary */}
              <Card className="border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-lg">VAT Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Total VAT (5%)</span>
                    <span className="text-xl font-bold">{formatCurrency(data.sales.vat)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Payment Method */}
              <Card className="border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-lg">Sales by Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.sales.byPaymentMethod).map(([method, amount]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="capitalize text-neutral-600">
                          {method.replace('_', ' ')}
                        </span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    {Object.keys(data.sales.byPaymentMethod).length === 0 && (
                      <p className="text-neutral-500 text-sm">No sales data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Services */}
              <Card className="border-neutral-200">
                <CardHeader>
                  <CardTitle className="text-lg">Top Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.sales.byService.slice(0, 5).map((service) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <div>
                          <span className="text-neutral-900">{service.name}</span>
                          <span className="text-xs text-neutral-500 ml-2">({service.count} sales)</span>
                        </div>
                        <span className="font-medium">{formatCurrency(service.total)}</span>
                      </div>
                    ))}
                    {data.sales.byService.length === 0 && (
                      <p className="text-neutral-500 text-sm">No services data</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Expenses by Category */}
              <Card className="border-neutral-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Expenses by Category</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExpensesPDF} className="border-neutral-300">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportExpensesExcel} className="border-neutral-300">
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.expenses.byCategory.map((category) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span className="text-neutral-600">{category.name}</span>
                        <span className="font-medium text-red-600">{formatCurrency(category.total)}</span>
                      </div>
                    ))}
                    {data.expenses.byCategory.length === 0 && (
                      <p className="text-neutral-500 text-sm">No expenses data</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">No data available</p>
            </div>
          )}
        </TabsContent>

        {/* VAT Report Tab */}
        <TabsContent value="vat" className="space-y-6">
          {/* Month/Year Selector & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={vatMonth.toString()} onValueChange={(v) => setVatMonth(parseInt(v))}>
                <SelectTrigger className="w-[150px] border-neutral-300">
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
              <Select value={vatYear.toString()} onValueChange={(v) => setVatYear(parseInt(v))}>
                <SelectTrigger className="w-[100px] border-neutral-300">
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportVATPDF} className="border-neutral-300">
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportVATExcel} className="border-neutral-300">
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Export Excel
              </Button>
            </div>
          </div>

          {vatLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : vatData ? (
            <div className="space-y-6">
              {/* FTA-Style VAT Report */}
              <Card className="border-neutral-200">
                <CardHeader className="bg-black text-white rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    VAT Return - {months[vatMonth - 1]} {vatYear}
                  </CardTitle>
                  <p className="text-sm text-neutral-300">Federal Tax Authority - UAE</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Business Info */}
                  <div className="grid sm:grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase">Business Name</p>
                      <p className="font-medium">{businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase">Tax Registration Number (TRN)</p>
                      <p className="font-medium">{trnNumber || 'Not Registered'}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Sales Summary */}
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-4">1. Sales and Output VAT</h3>
                    <div className="space-y-3 pl-4">
                      <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-600">1a. Standard Rated Sales (5%)</span>
                        <span className="font-medium">{formatCurrency(vatData.salesTotal - vatData.salesVat)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-600">1b. VAT on Standard Rated Sales</span>
                        <span className="font-medium">{formatCurrency(vatData.salesVat)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-600">1c. Zero Rated Sales</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-600">1d. Exempt Sales</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-neutral-100 px-2 rounded">
                        <span className="font-semibold">Total Output VAT</span>
                        <span className="font-bold">{formatCurrency(vatData.salesVat)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Input VAT */}
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-4">2. Purchases and Input VAT</h3>
                    <div className="space-y-3 pl-4">
                      <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-600">2a. Standard Rated Purchases</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-neutral-100">
                        <span className="text-neutral-600">2b. VAT on Purchases (Recoverable)</span>
                        <span className="font-medium">{formatCurrency(0)}</span>
                      </div>
                      <div className="flex justify-between py-2 bg-neutral-100 px-2 rounded">
                        <span className="font-semibold">Total Input VAT</span>
                        <span className="font-bold">{formatCurrency(0)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Net VAT */}
                  <div className="p-4 bg-black text-white rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-neutral-300">Net VAT Due</p>
                        <p className="text-xs text-neutral-400">(Output VAT - Input VAT)</p>
                      </div>
                      <p className="text-3xl font-bold">{formatCurrency(vatData.netVat)}</p>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-500">Total Sales (incl. VAT)</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {formatCurrency(vatData.salesTotal)}
                      </p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-500">Number of Transactions</p>
                      <p className="text-xl font-bold text-neutral-900">
                        {vatData.salesCount}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 italic">
                    Note: This report is for reference only. UAE VAT rate is 5%.
                    Please consult with your accountant for input VAT credits and final FTA submission.
                    This system does not track input VAT on purchases.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">No VAT data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
