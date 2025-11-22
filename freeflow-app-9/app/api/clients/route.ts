import { NextRequest, NextResponse } from 'next/server'

// Client Management API
// Supports: CRUD operations, status updates, bulk operations, analytics

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  location: string
  country: string
  timezone: string
  projects: number
  totalSpend: number
  rating: number
  status: 'vip' | 'active' | 'lead' | 'inactive' | 'prospect'
  industry?: string
  website?: string
  notes?: string
  tags?: string[]
  lastContact?: string
  nextFollowUp?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

interface ClientRequest {
  action: 'create' | 'update' | 'delete' | 'list' | 'get' | 'update-status' | 'bulk-delete'
  clientId?: string
  data?: Partial<Client>
  clientIds?: string[]
  filters?: {
    status?: string
    search?: string
    assignedTo?: string
  }
}

// Generate unique client ID
function generateClientId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `CL-${timestamp}-${random}`.toUpperCase()
}

// Create new client
async function handleCreateClient(data: Partial<Client>): Promise<NextResponse> {
  try {
    if (!data.name || !data.email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required'
      }, { status: 400 })
    }

    const newClient: Client = {
      id: generateClientId(),
      name: data.name,
      company: data.company || '',
      email: data.email,
      phone: data.phone || '',
      location: data.location || '',
      country: data.country || '',
      timezone: data.timezone || '',
      projects: 0,
      totalSpend: 0,
      rating: 0,
      status: data.status || 'lead',
      industry: data.industry,
      website: data.website,
      notes: data.notes,
      tags: data.tags || [],
      lastContact: new Date().toISOString(),
      nextFollowUp: data.nextFollowUp,
      assignedTo: data.assignedTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production: Save to database
    // await db.clients.create(newClient)

    return NextResponse.json({
      success: true,
      action: 'create',
      client: newClient,
      message: `Client ${newClient.name} created successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create client'
    }, { status: 500 })
  }
}

// Update existing client
async function handleUpdateClient(clientId: string, data: Partial<Client>): Promise<NextResponse> {
  try {
    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 })
    }

    const updatedClient = {
      ...data,
      id: clientId,
      updatedAt: new Date().toISOString()
    }

    // In production: Update in database
    // await db.clients.update(clientId, updatedClient)

    return NextResponse.json({
      success: true,
      action: 'update',
      client: updatedClient,
      message: `Client updated successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update client'
    }, { status: 500 })
  }
}

// Delete client
async function handleDeleteClient(clientId: string): Promise<NextResponse> {
  try {
    if (!clientId) {
      return NextResponse.json({
        success: false,
        error: 'Client ID is required'
      }, { status: 400 })
    }

    // In production: Delete from database
    // await db.clients.delete(clientId)

    return NextResponse.json({
      success: true,
      action: 'delete',
      clientId,
      message: 'Client deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete client'
    }, { status: 500 })
  }
}

// Update client status
async function handleUpdateStatus(clientId: string, status: Client['status']): Promise<NextResponse> {
  try {
    // In production: Update status in database
    // await db.clients.updateStatus(clientId, status)

    return NextResponse.json({
      success: true,
      action: 'update-status',
      clientId,
      status,
      message: `Client status updated to ${status}`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update status'
    }, { status: 500 })
  }
}

// Bulk delete clients
async function handleBulkDelete(clientIds: string[]): Promise<NextResponse> {
  try {
    if (!clientIds || clientIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No client IDs provided'
      }, { status: 400 })
    }

    // In production: Bulk delete from database
    // await db.clients.bulkDelete(clientIds)

    return NextResponse.json({
      success: true,
      action: 'bulk-delete',
      deletedCount: clientIds.length,
      message: `${clientIds.length} clients deleted successfully`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete clients'
    }, { status: 500 })
  }
}

// List clients with filters
async function handleListClients(filters?: any): Promise<NextResponse> {
  try {
    // Mock client data
    const mockClients: Client[] = [
      {
        id: 'CL-001',
        name: 'John Smith',
        company: 'Tech Corp',
        email: 'john@techcorp.com',
        phone: '+1 555-0101',
        location: 'New York, NY',
        country: 'USA',
        timezone: 'EST',
        projects: 5,
        totalSpend: 125000,
        rating: 5,
        status: 'vip',
        industry: 'Technology',
        website: 'https://techcorp.com',
        tags: ['enterprise', 'technology'],
        assignedTo: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    let filteredClients = mockClients

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      filteredClients = filteredClients.filter(c => c.status === filters.status)
    }
    if (filters?.search) {
      filteredClients = filteredClients.filter(c =>
        c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.company.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      clients: filteredClients,
      total: filteredClients.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list clients'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ClientRequest = await request.json()

    switch (body.action) {
      case 'create':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Client data required'
          }, { status: 400 })
        }
        return handleCreateClient(body.data)

      case 'update':
        if (!body.clientId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Client ID and data required'
          }, { status: 400 })
        }
        return handleUpdateClient(body.clientId, body.data)

      case 'delete':
        if (!body.clientId) {
          return NextResponse.json({
            success: false,
            error: 'Client ID required'
          }, { status: 400 })
        }
        return handleDeleteClient(body.clientId)

      case 'update-status':
        if (!body.clientId || !body.data?.status) {
          return NextResponse.json({
            success: false,
            error: 'Client ID and status required'
          }, { status: 400 })
        }
        return handleUpdateStatus(body.clientId, body.data.status)

      case 'bulk-delete':
        if (!body.clientIds) {
          return NextResponse.json({
            success: false,
            error: 'Client IDs required'
          }, { status: 400 })
        }
        return handleBulkDelete(body.clientIds)

      case 'list':
        return handleListClients(body.filters)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    return handleListClients({ status, search })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch clients'
    }, { status: 500 })
  }
}
