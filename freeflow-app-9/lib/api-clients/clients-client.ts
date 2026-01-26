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
   */
  async getClients(
    page: number = 1,
    pageSize: number = 10,
    filters?: ClientFilters
  ) {
    const supabase = createClient()

    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type)
      }

      if (filters.industry && filters.industry.length > 0) {
        query = query.in('industry', filters.industry)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`
        )
      }

      if (filters.minLifetimeValue !== undefined) {
        query = query.gte('lifetime_value', filters.minLifetimeValue)
      }

      if (filters.maxLifetimeValue !== undefined) {
        query = query.lte('lifetime_value', filters.maxLifetimeValue)
      }

      if (filters.hasOutstandingBalance) {
        query = query.gt('outstanding_balance', 0)
      }
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        data: data as Client[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      },
      error: null
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
