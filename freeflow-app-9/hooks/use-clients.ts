'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'churned'
export type ClientTier = 'standard' | 'premium' | 'enterprise'

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  address?: ClientAddress
  status: ClientStatus
  tier: ClientTier
  avatar?: string
  tags: string[]
  notes?: string
  totalRevenue: number
  projectCount: number
  invoiceCount: number
  lastActivityAt?: string
  createdAt: string
  updatedAt: string
}

export interface ClientAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface ClientContact {
  id: string
  clientId: string
  name: string
  email: string
  phone?: string
  role: string
  isPrimary: boolean
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  totalRevenue: number
  averageRevenue: number
  newThisMonth: number
  churnRate: number
}

// ============================================================================
// EMPTY DEFAULTS
// ============================================================================

const emptyStats: ClientStats = {
  totalClients: 0,
  activeClients: 0,
  totalRevenue: 0,
  averageRevenue: 0,
  newThisMonth: 0,
  churnRate: 0
}

// ============================================================================
// HOOK
// ============================================================================

interface UseClientsOptions {
  status?: ClientStatus
}

export function useClients(options: UseClientsOptions = {}) {
  const {  status } = options

  const [clients, setClients] = useState<Client[]>([])
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [contacts, setContacts] = useState<ClientContact[]>([])
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchClients = useCallback(async (filters?: { status?: string; tier?: string; search?: string; tags?: string[] }) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.status || status) params.set('status', filters?.status || status || '')
      if (filters?.tier) params.set('tier', filters.tier)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.tags?.length) params.set('tags', filters.tags.join(','))

      const response = await fetch(`/api/clients?${params}`)
      const result = await response.json()
      if (result.success) {
        setClients(Array.isArray(result.clients) ? result.clients : [])
        setStats(result.stats || emptyStats)
        return result.clients || []
      }
      setClients([])
      setStats(emptyStats)
      return []
    } catch (err) {
      setClients([])
      setStats(emptyStats)
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [status])

  const createClient = useCallback(async (data: Omit<Client, 'id' | 'totalRevenue' | 'projectCount' | 'invoiceCount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchClients()
        return { success: true, client: result.client }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newClient: Client = { ...data, id: `client-${Date.now()}`, totalRevenue: 0, projectCount: 0, invoiceCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setClients(prev => [newClient, ...prev])
      return { success: true, client: newClient }
    }
  }, [fetchClients])

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
      }
      return result
    } catch (err) {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c))
      return { success: true }
    }
  }, [])

  const deleteClient = useCallback(async (clientId: string) => {
    try {
      await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      setClients(prev => prev.filter(c => c.id !== clientId))
      return { success: true }
    } catch (err) {
      setClients(prev => prev.filter(c => c.id !== clientId))
      return { success: true }
    }
  }, [])

  const addContact = useCallback(async (clientId: string, contact: Omit<ClientContact, 'id' | 'clientId'>) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      })
      const result = await response.json()
      if (result.success) {
        setContacts(prev => [...prev, result.contact])
      }
      return result
    } catch (err) {
      const newContact: ClientContact = { ...contact, id: `contact-${Date.now()}`, clientId }
      setContacts(prev => [...prev, newContact])
      return { success: true, contact: newContact }
    }
  }, [])

  const updateClientStatus = useCallback(async (clientId: string, newStatus: ClientStatus) => {
    return updateClient(clientId, { status: newStatus })
  }, [updateClient])

  const updateClientTier = useCallback(async (clientId: string, newTier: ClientTier) => {
    return updateClient(clientId, { tier: newTier })
  }, [updateClient])

  const addTag = useCallback(async (clientId: string, tag: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client && !client.tags.includes(tag)) {
      return updateClient(clientId, { tags: [...client.tags, tag] })
    }
    return { success: false, error: 'Tag already exists or client not found' }
  }, [clients, updateClient])

  const removeTag = useCallback(async (clientId: string, tag: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      return updateClient(clientId, { tags: client.tags.filter(t => t !== tag) })
    }
    return { success: false, error: 'Client not found' }
  }, [clients, updateClient])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchClients({ search: query })
  }, [fetchClients])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchClients()
  }, [fetchClients])

  useEffect(() => { refresh() }, [refresh])

  const activeClients = useMemo(() => clients.filter(c => c.status === 'active'), [clients])
  const prospectClients = useMemo(() => clients.filter(c => c.status === 'prospect'), [clients])
  const enterpriseClients = useMemo(() => clients.filter(c => c.tier === 'enterprise'), [clients])
  const topClients = useMemo(() => [...clients].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10), [clients])
  const recentClients = useMemo(() => [...clients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5), [clients])
  const clientsByTier = useMemo(() => {
    const grouped: Record<string, Client[]> = { standard: [], premium: [], enterprise: [] }
    clients.forEach(c => grouped[c.tier].push(c))
    return grouped
  }, [clients])
  const allTags = useMemo(() => [...new Set(clients.flatMap(c => c.tags))], [clients])

  return {
    clients, currentClient, contacts, stats, activeClients, prospectClients, enterpriseClients, topClients, recentClients, clientsByTier, allTags,
    isLoading, error, searchQuery,
    refresh, fetchClients, createClient, updateClient, deleteClient, addContact, updateClientStatus, updateClientTier, addTag, removeTag, search,
    setCurrentClient
  }
}

export default useClients
