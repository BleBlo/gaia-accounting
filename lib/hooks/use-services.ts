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
    const { data, error } = await supabase
      .from('services')
      .insert({ ...service, is_active: true })
      .select()
      .single()

    if (error) {
      console.error('Error adding service:', error)
      setError(error.message)
      return null
    }

    setServices((prev) => [...prev, data])
    return data
  }

  const updateService = async (id: string, updates: Partial<ServiceInsert>): Promise<boolean> => {
    const { error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating service:', error)
      return false
    }

    await fetchServices()
    return true
  }

  const deleteService = async (id: string): Promise<boolean> => {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting service:', error)
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
