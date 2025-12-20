'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, subDays, subMonths } from 'date-fns'

export interface ReportData {
  sales: {
    total: number
    vat: number
    count: number
    byPaymentMethod: Record<string, number>
    byService: { name: string; total: number; count: number }[]
  }
  expenses: {
    total: number
    count: number
    byCategory: { name: string; total: number }[]
  }
  salaries: {
    total: number
    count: number
  }
  profit: number
}

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom'

export function useReports() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReportData | null>(null)
  const supabase = createClient()

  const getDateRange = (range: DateRange, customStart?: Date, customEnd?: Date) => {
    const now = new Date()
    switch (range) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return {
          start: customStart || startOfMonth(now),
          end: customEnd || endOfMonth(now),
        }
    }
  }

  const fetchReport = useCallback(async (range: DateRange, customStart?: Date, customEnd?: Date) => {
    setLoading(true)

    const { start, end } = getDateRange(range, customStart, customEnd)
    const startStr = format(start, 'yyyy-MM-dd')
    const endStr = format(end, 'yyyy-MM-dd')

    try {
      // Fetch sales
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          *,
          service:services(name_en)
        `)
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(name_en)
        `)
        .gte('expense_date', startStr)
        .lte('expense_date', endStr)

      // Fetch salary payments
      const { data: salariesData } = await supabase
        .from('salary_payments')
        .select('*')
        .gte('payment_date', startStr)
        .lte('payment_date', endStr)

      // Process sales data
      const salesTotal = (salesData || []).reduce((sum, s) => sum + (s.total_amount || 0), 0)
      const salesVat = (salesData || []).reduce((sum, s) => sum + (s.vat_amount || 0), 0)
      const salesByPaymentMethod: Record<string, number> = {}
      const salesByServiceMap: Record<string, { total: number; count: number }> = {}

      ;(salesData || []).forEach((sale) => {
        // By payment method
        const method = sale.payment_method || 'unknown'
        salesByPaymentMethod[method] = (salesByPaymentMethod[method] || 0) + (sale.total_amount || 0)

        // By service
        const serviceName = sale.service?.name_en || sale.custom_description || 'Other'
        if (!salesByServiceMap[serviceName]) {
          salesByServiceMap[serviceName] = { total: 0, count: 0 }
        }
        salesByServiceMap[serviceName].total += sale.total_amount || 0
        salesByServiceMap[serviceName].count += 1
      })

      const salesByService = Object.entries(salesByServiceMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.total - a.total)

      // Process expenses data
      const expensesTotal = (expensesData || []).reduce((sum, e) => sum + (e.amount || 0), 0)
      const expensesByCategoryMap: Record<string, number> = {}

      ;(expensesData || []).forEach((expense) => {
        const catName = expense.category?.name_en || 'Other'
        expensesByCategoryMap[catName] = (expensesByCategoryMap[catName] || 0) + (expense.amount || 0)
      })

      const expensesByCategory = Object.entries(expensesByCategoryMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)

      // Process salaries
      const salariesTotal = (salariesData || []).reduce((sum, s) => sum + (s.net_amount || 0), 0)

      // Calculate profit
      const profit = salesTotal - expensesTotal - salariesTotal

      setData({
        sales: {
          total: salesTotal,
          vat: salesVat,
          count: (salesData || []).length,
          byPaymentMethod: salesByPaymentMethod,
          byService: salesByService,
        },
        expenses: {
          total: expensesTotal,
          count: (expensesData || []).length,
          byCategory: expensesByCategory,
        },
        salaries: {
          total: salariesTotal,
          count: (salariesData || []).length,
        },
        profit,
      })
    } catch (error) {
      console.error('Error fetching report:', error)
    }

    setLoading(false)
  }, [])

  return { data, loading, fetchReport }
}

export function useVatReport() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    salesVat: number
    // For future: expenseVat if you track input VAT
    netVat: number
    salesTotal: number
    salesCount: number
  } | null>(null)
  const supabase = createClient()

  const fetchVatReport = useCallback(async (month: number, year: number) => {
    setLoading(true)

    const startDate = new Date(year, month - 1, 1)
    const endDate = endOfMonth(startDate)
    const startStr = format(startDate, 'yyyy-MM-dd')
    const endStr = format(endDate, 'yyyy-MM-dd')

    try {
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount, vat_amount')
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)

      const salesVat = (salesData || []).reduce((sum, s) => sum + (s.vat_amount || 0), 0)
      const salesTotal = (salesData || []).reduce((sum, s) => sum + (s.total_amount || 0), 0)

      setData({
        salesVat,
        netVat: salesVat, // For now, just output VAT collected
        salesTotal,
        salesCount: (salesData || []).length,
      })
    } catch (error) {
      console.error('Error fetching VAT report:', error)
    }

    setLoading(false)
  }, [])

  return { data, loading, fetchVatReport }
}

export function useReportExportData() {
  const [salesData, setSalesData] = useState<any[]>([])
  const [expensesData, setExpensesData] = useState<any[]>([])
  const supabase = createClient()

  const getDateRange = (range: 'today' | 'week' | 'month' | 'year') => {
    const now = new Date()
    switch (range) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) }
    }
  }

  const fetchExportData = useCallback(async (range: 'today' | 'week' | 'month' | 'year') => {
    const { start, end } = getDateRange(range)
    const startStr = format(start, 'yyyy-MM-dd')
    const endStr = format(end, 'yyyy-MM-dd')

    try {
      // Fetch full sales data with relations for export
      const { data: sales } = await supabase
        .from('sales')
        .select(`
          *,
          service:services(name_en),
          customer:customers(name)
        `)
        .gte('sale_date', startStr)
        .lte('sale_date', endStr)
        .order('sale_date', { ascending: false })

      // Fetch full expenses data with relations for export
      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(name_en),
          supplier:suppliers(name)
        `)
        .gte('expense_date', startStr)
        .lte('expense_date', endStr)
        .order('expense_date', { ascending: false })

      setSalesData(sales || [])
      setExpensesData(expenses || [])
    } catch (error) {
      console.error('Error fetching export data:', error)
    }
  }, [])

  return { salesData, expensesData, fetchExportData }
}
