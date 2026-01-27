/**
 * Clients API Client
 *
 * Provides typed API access to client/customer management
 * Replaces setTimeout mock data patterns with real Supabase queries
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  status: 'active' | 'inactive' | 'lead' | 'archived'
  type: 'individual' | 'company' | 'agency'
  industry: string | null
  notes: string | null
  tags: string[] | null
  lifetime_value: number
  total_projects: number
  total_invoices: number
  outstanding_balance: number
  payment_terms: number | null // days
  tax_id: string | null
  preferred_contact: 'email' | 'phone' | 'both' | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  last_contact_at: string | null
}

export interface CreateClientData {
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  status?: 'active' | 'inactive' | 'lead' | 'archived'
  type?: 'individual' | 'company' | 'agency'
  industry?: string
  notes?: string
  tags?: string[]
  payment_terms?: number
  tax_id?: string
  preferred_contact?: 'email' | 'phone' | 'both'
}

export interface UpdateClientData extends Partial<CreateClientData> {
  lifetime_value?: number
  total_projects?: number
  total_invoices?: number
  outstanding_balance?: number
  last_contact_at?: string
}

export interface ClientFilters {
  status?: ('active' | 'inactive' | 'lead' | 'archived')[]
  type?: ('individual' | 'company' | 'agency')[]
  industry?: string[]
  tags?: string[]
  search?: string // Search by name, email, company
  minLifetimeValue?: number
  maxLifetimeValue?: number
  hasOutstandingBalance?: boolean
}

export interface ClientStats {
  total: number
  active: number
  inactive: number
  leads: number
  archived: number
  totalLifetimeValue: number
  averageLifetimeValue: number
  totalOutstandingBalance: number
  clientsByType: {
    individual: number
    company: number
    agency: number
  }
  topClients: Array<{
    id: string
    name: string
    company: string | null
    lifetime_value: number
    total_projects: number
  }>
  recentActivity: Array<{
    client_id: string
    client_name: string
    activity_type: 'project_created' | 'invoice_sent' | 'payment_received' | 'note_added'
    timestamp: string
  }>
}

class ClientsApiClient extends BaseApiClient {
  /**
   * Get all clients with pagination and filters
   * Fetches via API to bypass RLS (uses service role key on server)
   */
  async getClients(
    page: number = 1,
    pageSize: number = 10,
    filters?: ClientFilters
  ) {
    try {
      // Build query params
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(pageSize))

      if (filters) {
        if (filters.status && filters.status.length > 0) {
          params.set('status', filters.status.join(','))
        }
        if (filters.type && filters.type.length > 0) {
          params.set('type', filters.type.join(','))
        }
        if (filters.industry && filters.industry.length > 0) {
          params.set('industry', filters.industry.join(','))
        }
        if (filters.search) {
          params.set('search', filters.search)
        }
      }

      // Fetch via API (uses service role key, bypasses RLS)
      const response = await fetch(`/api/clients?${params.toString()}`, {
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to fetch clients',
          data: null
        }
      }

      // Handle demo mode - pass through the demo data
      if (result.demo) {
        const demoClients = result.clients || []
        const demoPagination = result.pagination || { page: 1, limit: pageSize, total: demoClients.length, totalPages: 1 }
        return {
          success: true,
          data: {
            data: demoClients as Client[],
            pagination: {
              page: demoPagination.page,
              pageSize: demoPagination.limit || pageSize,
              total: demoPagination.total || demoClients.length,
              totalPages: demoPagination.totalPages || Math.ceil((demoPagination.total || demoClients.length) / pageSize)
            }
          },
          error: null
        }
      }

      const clients = result.clients || []
      const pagination = result.pagination || { page, limit: pageSize, total: clients.length, totalPages: 1 }

      return {
        success: true,
        data: {
          data: clients as Client[],
          pagination: {
            page: pagination.page,
            pageSize: pagination.limit || pageSize,
            total: pagination.total || clients.length,
            totalPages: pagination.totalPages || Math.ceil((pagination.total || clients.length) / pageSize)
          }
        },
        error: null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  }

  /**
   * Get single client by ID
   */
  async getClient(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Client,
      error: null
    }
  }

  /**
   * Create new client
   */
  async createClient(clientData: CreateClientData) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        user_id: user.id,
        lifetime_value: 0,
        total_projects: 0,
        total_invoices: 0,
        outstanding_balance: 0,
        status: clientData.status || 'lead',
        type: clientData.type || 'individual'
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Client,
      error: null
    }
  }

  /**
   * Update existing client
   */
  async updateClient(id: string, updates: UpdateClientData) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Client,
      error: null
    }
  }

  /**
   * Delete client
   */
  async deleteClient(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Get client statistics
   */
  async getClientStats() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get all clients for current user
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Fetch recent activity logs related to clients
    const clientIds = clients.map(c => c.id)
    let recentActivity: ClientStats['recentActivity'] = []

    if (clientIds.length > 0) {
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('resource_id, resource_name, activity_type, created_at')
        .eq('resource_type', 'client')
        .in('resource_id', clientIds)
        .order('created_at', { ascending: false })
        .limit(20)

      if (activityData) {
        recentActivity = activityData.map(activity => {
          // Map activity_type to our expected format
          let activityType: 'project_created' | 'invoice_sent' | 'payment_received' | 'note_added' = 'note_added'
          if (activity.activity_type === 'create' && activity.resource_name?.toLowerCase().includes('project')) {
            activityType = 'project_created'
          } else if (activity.activity_type === 'create' && activity.resource_name?.toLowerCase().includes('invoice')) {
            activityType = 'invoice_sent'
          } else if (activity.activity_type === 'update' && activity.resource_name?.toLowerCase().includes('payment')) {
            activityType = 'payment_received'
          }

          const client = clients.find(c => c.id === activity.resource_id)
          return {
            client_id: activity.resource_id || '',
            client_name: client?.name || activity.resource_name || 'Unknown Client',
            activity_type: activityType,
            timestamp: activity.created_at
          }
        })
      }
    }

    // Calculate statistics
    const stats: ClientStats = {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      inactive: clients.filter(c => c.status === 'inactive').length,
      leads: clients.filter(c => c.status === 'lead').length,
      archived: clients.filter(c => c.status === 'archived').length,
      totalLifetimeValue: clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0),
      averageLifetimeValue: clients.length > 0
        ? clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / clients.length
        : 0,
      totalOutstandingBalance: clients.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0),
      clientsByType: {
        individual: clients.filter(c => c.type === 'individual').length,
        company: clients.filter(c => c.type === 'company').length,
        agency: clients.filter(c => c.type === 'agency').length
      },
      topClients: clients
        .sort((a, b) => (b.lifetime_value || 0) - (a.lifetime_value || 0))
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          name: c.name,
          company: c.company,
          lifetime_value: c.lifetime_value || 0,
          total_projects: c.total_projects || 0
        })),
      recentActivity
    }

    return {
      success: true,
      data: stats,
      error: null
    }
  }

  /**
   * Record client contact
   */
  async recordContact(clientId: string) {
    return this.updateClient(clientId, {
      last_contact_at: new Date().toISOString()
    })
  }

  /**
   * Update client financial metrics
   */
  async updateFinancials(
    clientId: string,
    metrics: {
      lifetime_value?: number
      total_projects?: number
      total_invoices?: number
      outstanding_balance?: number
    }
  ) {
    return this.updateClient(clientId, metrics)
  }
}

export const clientsClient = new ClientsApiClient()
