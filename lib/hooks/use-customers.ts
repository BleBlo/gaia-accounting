'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer, CustomerInsert } from '@/types/database'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCustomers((data as Customer[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const addCustomer = async (customer: CustomerInsert): Promise<Customer | null> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()

      if (error) throw error
      setCustomers(prev => [...prev, data as Customer].sort((a, b) => a.name.localeCompare(b.name)))
      return data as Customer
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer')
      return null
    }
  }

  const updateCustomer = async (id: string, updates: Partial<CustomerInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating customer:', error)
      return false
    }

    await fetchCustomers()
    return true
  }

  const deleteCustomer = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting customer:', error)
      return false
    }

    setCustomers((prev) => prev.filter((c) => c.id !== id))
    return true
  }

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  }
}
