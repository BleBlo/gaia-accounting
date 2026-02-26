'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service, ServiceInsert } from '@/types/database'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const addService = async (service: ServiceInsert): Promise<Service | null> => {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add service')
    }
    setServices((prev) => [...prev, data])
    return data
  }

  const updateService = async (id: string, updates: Partial<ServiceInsert>): Promise<boolean> => {
    const res = await fetch('/api/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    if (!res.ok) {
      const data = await res.json()
      console.error('Error updating service:', data.error)
      return false
    }
    await fetchServices()
    return true
  }

  const deleteService = async (id: string): Promise<boolean> => {
    const res = await fetch('/api/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      const data = await res.json()
      console.error('Error deleting service:', data.error)
      return false
    }
    setServices((prev) => prev.filter((s) => s.id !== id))
    return true
  }

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    refresh: fetchServices,
  }
}
