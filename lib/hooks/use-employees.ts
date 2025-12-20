'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Employee, EmployeeInsert, SalaryPayment, SalaryPaymentInsert } from '@/types/database'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setEmployees((data as Employee[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const addEmployee = async (employee: EmployeeInsert): Promise<Employee | null> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single()

      if (error) throw error
      setEmployees(prev => [...prev, data as Employee].sort((a, b) => a.name.localeCompare(b.name)))
      return data as Employee
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee')
      return null
    }
  }

  const updateEmployee = async (id: string, updates: Partial<EmployeeInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating employee:', error)
      return false
    }

    await fetchEmployees()
    return true
  }

  const deleteEmployee = async (id: string): Promise<boolean> => {
    // Soft delete
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting employee:', error)
      return false
    }

    setEmployees((prev) => prev.filter((e) => e.id !== id))
    return true
  }

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  }
}

export function useSalaryPayments(employeeId?: string) {
  const [payments, setPayments] = useState<SalaryPayment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('salary_payments')
      .select('*')
      .order('payment_date', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching salary payments:', error)
    } else {
      setPayments((data as SalaryPayment[]) || [])
    }
    setLoading(false)
  }, [employeeId])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const addPayment = async (payment: SalaryPaymentInsert): Promise<SalaryPayment | null> => {
    const { data, error } = await supabase
      .from('salary_payments')
      .insert(payment)
      .select()
      .single()

    if (error) {
      console.error('Error adding salary payment:', error)
      return null
    }

    setPayments((prev) => [data as SalaryPayment, ...prev])
    return data as SalaryPayment
  }

  const deletePayment = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('salary_payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting salary payment:', error)
      return false
    }

    setPayments((prev) => prev.filter((p) => p.id !== id))
    return true
  }

  return {
    payments,
    loading,
    addPayment,
    deletePayment,
    refetch: fetchPayments,
  }
}
