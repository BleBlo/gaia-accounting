'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Sale, SaleInsert, SaleWithRelations } from '@/types/database'

interface UseSalesOptions {
  dateRange?: 'today' | 'week' | 'month'
  startDate?: string
  endDate?: string
  customerId?: string
  paymentMethod?: string
  paymentStatus?: 'paid' | 'partial' | 'pending'
  searchQuery?: string
}

interface SaleTotals {
  total: number
  vat: number
  paid: number
  pending: number
  cash: number
  bank: number
  card: number
  count: number
}

export function useSales(options: UseSalesOptions = {}) {
  const [sales, setSales] = useState<SaleWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totals, setTotals] = useState<SaleTotals>({
    total: 0,
    vat: 0,
    paid: 0,
    pending: 0,
    cash: 0,
    bank: 0,
    card: 0,
    count: 0,
  })

  const supabase = createClient()

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          service:services(*)
        `)
        .order('sale_date', { ascending: false })

      // Apply date range filter
      if (options.dateRange) {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        let startDate: string

        switch (options.dateRange) {
          case 'today':
            startDate = todayStr
            query = query.eq('sale_date', todayStr)
            break
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            startDate = weekAgo.toISOString().split('T')[0]
            query = query.gte('sale_date', startDate)
            break
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            startDate = monthAgo.toISOString().split('T')[0]
            query = query.gte('sale_date', startDate)
            break
        }
      } else {
        if (options.startDate) {
          query = query.gte('sale_date', options.startDate)
        }
        if (options.endDate) {
          query = query.lte('sale_date', options.endDate)
        }
      }

      if (options.customerId) {
        query = query.eq('customer_id', options.customerId)
      }
      if (options.paymentMethod) {
        query = query.eq('payment_method', options.paymentMethod)
      }
      if (options.paymentStatus) {
        query = query.eq('payment_status', options.paymentStatus)
      }

      const { data, error } = await query

      if (error) throw error

      let filteredData = data || []

      // Apply search filter client-side
      if (options.searchQuery) {
        const search = options.searchQuery.toLowerCase()
        filteredData = filteredData.filter(
          (sale) =>
            sale.custom_description?.toLowerCase().includes(search) ||
            sale.service?.name_en?.toLowerCase().includes(search) ||
            sale.customer?.name?.toLowerCase().includes(search)
        )
      }

      setSales(filteredData as SaleWithRelations[])

      // Calculate totals
      const calculatedTotals = filteredData.reduce(
        (acc, sale) => {
          const total = Number(sale.total_amount) || 0
          const vat = Number(sale.vat_amount) || 0
          const deposit = Number(sale.deposit_amount) || 0

          return {
            total: acc.total + total,
            vat: acc.vat + vat,
            paid:
              acc.paid +
              (sale.payment_status === 'paid'
                ? total
                : sale.payment_status === 'partial'
                ? deposit
                : 0),
            pending:
              acc.pending +
              (sale.payment_status === 'pending'
                ? total
                : sale.payment_status === 'partial'
                ? total - deposit
                : 0),
            cash: acc.cash + (sale.payment_method === 'cash' ? total : 0),
            bank: acc.bank + (sale.payment_method === 'bank_transfer' ? total : 0),
            card: acc.card + (sale.payment_method === 'card' ? total : 0),
            count: acc.count + 1,
          }
        },
        { total: 0, vat: 0, paid: 0, pending: 0, cash: 0, bank: 0, card: 0, count: 0 }
      )

      setTotals(calculatedTotals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }, [
    options.dateRange,
    options.startDate,
    options.endDate,
    options.customerId,
    options.paymentMethod,
    options.paymentStatus,
    options.searchQuery,
  ])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const addSale = async (sale: SaleInsert): Promise<Sale | null> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single()

      if (error) throw error
      await fetchSales()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sale')
      return null
    }
  }

  const updateSale = async (id: string, updates: Partial<Sale>): Promise<Sale | null> => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchSales()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale')
      return null
    }
  }

  const deleteSale = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id)

      if (error) throw error
      await fetchSales()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sale')
      return false
    }
  }

  return {
    sales,
    loading,
    error,
    totals,
    addSale,
    updateSale,
    deleteSale,
    refetch: fetchSales,
  }
}
