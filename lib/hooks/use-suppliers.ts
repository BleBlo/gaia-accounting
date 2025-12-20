'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Supplier, SupplierInsert } from '@/types/database'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchSuppliers() {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching suppliers:', error)
      } else {
        setSuppliers(data || [])
      }
      setLoading(false)
    }

    fetchSuppliers()
  }, [])

  const addSupplier = async (supplier: SupplierInsert): Promise<Supplier | null> => {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single()

    if (error) {
      console.error('Error adding supplier:', error)
      return null
    }

    setSuppliers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  return { suppliers, loading, addSupplier }
}
