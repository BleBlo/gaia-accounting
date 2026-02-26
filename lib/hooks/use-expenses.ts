'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ExpenseInsert, ExpenseCategory, ExpenseWithRelations } from '@/types/database'

interface UseExpensesOptions {
  dateRange?: 'today' | 'week' | 'month'
  categoryId?: string
  searchQuery?: string
}

interface ExpenseTotals {
  total: number
  byCategory: Record<string, number>
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState<ExpenseTotals>({ total: 0, byCategory: {} })

  const supabase = createClient()

  const fetchExpenses = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('expenses')
      .select(`
        *,
        category:expense_categories(id, name_en, name_tr),
        supplier:suppliers(id, name)
      `)
      .order('expense_date', { ascending: false })

    // Apply date filter (use local date to match how expense_date is stored)
    const localDate = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }

    if (options.dateRange) {
      const now = new Date()
      let startDate: Date

      switch (options.dateRange) {
        case 'today':
          startDate = now
          break
        case 'week':
          startDate = new Date(now)
          startDate.setDate(startDate.getDate() - 6)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        default:
          startDate = now
      }

      query = query.gte('expense_date', localDate(startDate))
    }

    // Apply category filter
    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching expenses:', error)
      setExpenses([])
    } else {
      let filteredData = data || []

      // Apply search filter client-side
      if (options.searchQuery) {
        const search = options.searchQuery.toLowerCase()
        filteredData = filteredData.filter(
          (expense) =>
            expense.description?.toLowerCase().includes(search) ||
            expense.category?.name_en?.toLowerCase().includes(search) ||
            expense.supplier?.name?.toLowerCase().includes(search)
        )
      }

      setExpenses(filteredData as ExpenseWithRelations[])

      // Calculate totals
      const total = filteredData.reduce((sum, e) => sum + (e.amount || 0), 0)
      const byCategory: Record<string, number> = {}
      filteredData.forEach((e) => {
        const catName = e.category?.name_en || 'Other'
        byCategory[catName] = (byCategory[catName] || 0) + (e.amount || 0)
      })
      setTotals({ total, byCategory })
    }

    setLoading(false)
  }, [options.dateRange, options.categoryId, options.searchQuery])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (expense: ExpenseInsert): Promise<ExpenseWithRelations | null> => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('Error adding expense:', data.error)
      return null
    }
    setExpenses((prev) => [data as ExpenseWithRelations, ...prev])
    return data as ExpenseWithRelations
  }

  const updateExpense = async (id: string, updates: Partial<ExpenseInsert>): Promise<boolean> => {
    const res = await fetch('/api/expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    if (!res.ok) {
      const data = await res.json()
      console.error('Error updating expense:', data.error)
      return false
    }
    await fetchExpenses()
    return true
  }

  const deleteExpense = async (id: string): Promise<boolean> => {
    const res = await fetch('/api/expenses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json()
      console.error('Error deleting expense:', data.error)
      return false
    }
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    return true
  }

  return {
    expenses,
    loading,
    totals,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: fetchExpenses,
  }
}

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name_en')

      if (error) {
        console.error('Error fetching expense categories:', error)
      } else {
        setCategories(data || [])
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  return { categories, loading }
}
