'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthUserId } from './use-auth-user-id'
import { toast } from 'sonner'

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
  const supabase = createClient()
  const { getUserId } = useAuthUserId()

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
      console.error('Failed to fetch clients:', err)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const addClient = async (client: Partial<Client>) => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to create a client')
        throw new Error('User not authenticated')
      }

      const clientData = {
        ...client,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single()

      if (error) throw error
      setClients(prev => [data, ...prev])
      toast.success('Client created successfully')
      return data
    } catch (err: any) {
      toast.error(err.message || 'Failed to create client')
      throw err
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setClients(prev => prev.map(c => c.id === id ? data : c))
      toast.success('Client updated successfully')
      return data
    } catch (err: any) {
      toast.error(err.message || 'Failed to update client')
      throw err
    }
  }

  const archiveClient = async (id: string) => {
    try {
      const result = await updateClient(id, { status: 'archived' })
      toast.success('Client archived')
      return result
    } catch (err) {
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClients(prev => prev.filter(c => c.id !== id))
      toast.success('Client deleted')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete client')
      throw err
    }
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
    addClient,
    createClient: addClient, // Alias for backward compatibility
    updateClient,
    archiveClient,
    deleteClient
  }
}
