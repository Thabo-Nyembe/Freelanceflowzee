'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthUserId } from './use-auth-user-id'
import { toast } from 'sonner'

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  position: string | null
  avatar: string | null
  status: 'active' | 'inactive' | 'prospect' | 'lead' | 'churned' | 'vip'
  type: 'individual' | 'business' | 'enterprise' | 'agency' | 'nonprofit'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  timezone: string | null
  website: string | null
  industry: string | null
  company_size: string | null
  total_revenue: number
  lifetime_value: number
  average_project_value: number
  currency: string
  projects_count: number
  completed_projects: number
  active_projects: number
  health_score: number
  lead_score: number
  satisfaction_score: number
  last_contact: string | null
  next_follow_up: string | null
  communication_frequency: number
  tags: string[]
  categories: string[]
  linkedin_url: string | null
  twitter_url: string | null
  facebook_url: string | null
  notes: string | null
  internal_notes: string | null
  created_at: string
  updated_at: string
  last_activity_at: string | null
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
      // Fetch via API (uses service role key, bypasses RLS)
      const response = await fetch('/api/clients', { credentials: 'include' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch clients')
      }

      // Handle demo mode
      if (result.demo) {
        setClients([])
        return
      }

      setClients(result.clients || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Failed to fetch clients:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addClient = async (client: Partial<Client>) => {
    try {
      const userId = await getUserId()
      if (!userId) {
        toast.error('You must be logged in to create a client')
        throw new Error('User not authenticated')
      }

      // Explicitly map fields to match DB schema exactly
      const clientData = {
        user_id: userId,
        name: client.name || 'New Client',
        email: client.email || '',
        phone: client.phone || null,
        company: client.company || null,
        position: client.position || null,
        avatar: client.avatar || null,
        status: client.status || 'lead',
        type: client.type || 'individual',
        priority: client.priority || 'medium',
        address: client.address || null,
        city: client.city || null,
        state: client.state || null,
        country: client.country || null,
        postal_code: client.postal_code || null,
        timezone: client.timezone || null,
        website: client.website || null,
        industry: client.industry || null,
        company_size: client.company_size || null,
        total_revenue: client.total_revenue || 0,
        lifetime_value: client.lifetime_value || 0,
        average_project_value: client.average_project_value || 0,
        currency: client.currency || 'USD',
        projects_count: client.projects_count || 0,
        health_score: client.health_score || 50,
        lead_score: client.lead_score || 50,
        satisfaction_score: client.satisfaction_score || 0,
        last_contact: client.last_contact || null,
        next_follow_up: client.next_follow_up || null,
        tags: client.tags || [],
        categories: client.categories || [],
        linkedin_url: client.linkedin_url || null,
        twitter_url: client.twitter_url || null,
        facebook_url: client.facebook_url || null,
        notes: client.notes || null,
        internal_notes: client.internal_notes || null,
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create client')
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update client')
      throw err
    }
  }

  const archiveClient = async (id: string) => {
    try {
      const result = await updateClient(id, { status: 'churned' })
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete client')
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
    totalProjects: clients.reduce((sum, c) => sum + (c.projects_count || 0), 0)
  }

  return {
    clients,
    stats,
    isLoading,
    error,
    fetchClients,
    addClient,
    createClient: addClient,
    updateClient,
    archiveClient,
    deleteClient
  }
}
