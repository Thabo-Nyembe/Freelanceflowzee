'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Client {
  id: string
  user_id: string
  client_code: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  website: string | null
  address: string | null
  city: string | null
  country: string | null
  status: 'active' | 'inactive' | 'prospect' | 'archived'
  type: 'individual' | 'business' | 'enterprise'
  industry: string | null
  notes: string | null
  avatar_url: string | null
  tags: string[]
  total_revenue: number
  total_projects: number
  rating: number | null
  metadata: Record<string, any>
  last_contact_at: string | null
  created_at: string
  updated_at: string
}

export function useClients(initialClients: Client[] = []) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .neq('status', 'archived')
        .order('name', { ascending: true })

      if (error) throw error
      setClients(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const createClient = async (client: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()

    if (error) throw error
    setClients(prev => [data, ...prev])
    return data
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setClients(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const archiveClient = async (id: string) => {
    return updateClient(id, { status: 'archived' })
  }

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
    setClients(prev => prev.filter(c => c.id !== id))
  }

  useEffect(() => {
    const channel = supabase
      .channel('clients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' },
        () => fetchClients()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchClients])

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    prospects: clients.filter(c => c.status === 'prospect').length,
    totalRevenue: clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
    totalProjects: clients.reduce((sum, c) => sum + (c.total_projects || 0), 0)
  }

  return {
    clients,
    stats,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    archiveClient,
    deleteClient
  }
}
