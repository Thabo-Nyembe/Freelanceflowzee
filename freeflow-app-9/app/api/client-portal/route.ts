/**
 * Client Portal API Routes
 *
 * REST endpoints for Client Portal:
 * GET - List clients, projects, communications, files, invoices, activities, stats
 * POST - Create client, project, communication, file, invoice, activity
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getClients,
  searchClients,
  getClientsByHealthStatus,
  getClientsByTier,
  getClientsNeedingFollowUp,
  createPortalClient,
  getClientStatistics,
  getProjects,
  getOverdueProjects,
  createProject,
  getCommunications,
  getCommunicationsNeedingFollowUp,
  createCommunication,
  getFiles,
  uploadFile,
  getInvoices,
  createInvoice,
  getRecentActivities,
  logClientActivity,
  getPortalStatistics,
  getDashboardOverview
} from '@/lib/client-portal-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'clients'
    const status = searchParams.get('status') as any
    const tier = searchParams.get('tier') as any
    const healthStatus = searchParams.get('health_status') as any
    const category = searchParams.get('category') as any
    const clientId = searchParams.get('client_id')
    const invoiceStatus = searchParams.get('invoice_status') as any
    const communicationType = searchParams.get('communication_type') as any
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    switch (type) {
      case 'clients': {
        let data
        if (search) {
          data = await searchClients(search)
        } else if (healthStatus) {
          data = await getClientsByHealthStatus(healthStatus)
        } else if (tier) {
          data = await getClientsByTier(tier)
        } else {
          data = await getClients({ status, tier, limit, offset })
        }
        return NextResponse.json({ data })
      }

      case 'clients-needing-follow-up': {
        const data = await getClientsNeedingFollowUp()
        return NextResponse.json({ data })
      }

      case 'client-stats': {
        const data = await getClientStatistics()
        return NextResponse.json({ data })
      }

      case 'projects': {
        const data = await getProjects({ status, client_id: clientId || undefined, limit })
        return NextResponse.json({ data })
      }

      case 'overdue-projects': {
        const data = await getOverdueProjects()
        return NextResponse.json({ data })
      }

      case 'communications': {
        const data = await getCommunications({
          type: communicationType,
          client_id: clientId || undefined,
          limit
        })
        return NextResponse.json({ data })
      }

      case 'communications-needing-follow-up': {
        const data = await getCommunicationsNeedingFollowUp()
        return NextResponse.json({ data })
      }

      case 'files': {
        const data = await getFiles({
          category,
          client_id: clientId || undefined,
          limit
        })
        return NextResponse.json({ data })
      }

      case 'invoices': {
        const data = await getInvoices({
          status: invoiceStatus,
          client_id: clientId || undefined,
          limit
        })
        return NextResponse.json({ data })
      }

      case 'recent-activities': {
        const data = await getRecentActivities(limit)
        return NextResponse.json({ data })
      }

      case 'portal-stats': {
        const data = await getPortalStatistics()
        return NextResponse.json({ data })
      }

      case 'dashboard': {
        const data = await getDashboardOverview()
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Client Portal API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Client Portal data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-client': {
        const data = await createPortalClient({
          company_name: payload.company_name,
          contact_person: payload.contact_person,
          email: payload.email,
          phone: payload.phone,
          website: payload.website,
          tier: payload.tier,
          industry: payload.industry,
          company_size: payload.company_size,
          address: payload.address,
          notes: payload.notes,
          tags: payload.tags
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-project': {
        const data = await createProject({
          client_id: payload.client_id,
          name: payload.name,
          description: payload.description,
          budget: payload.budget,
          start_date: payload.start_date,
          end_date: payload.end_date,
          deadline: payload.deadline,
          priority: payload.priority,
          category: payload.category,
          tags: payload.tags
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-communication': {
        const data = await createCommunication({
          client_id: payload.client_id,
          type: payload.type,
          subject: payload.subject,
          content: payload.content,
          summary: payload.summary,
          outcome: payload.outcome,
          follow_up_required: payload.follow_up_required,
          follow_up_date: payload.follow_up_date,
          attendees: payload.attendees,
          duration_minutes: payload.duration_minutes,
          attachments: payload.attachments
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'upload-file': {
        const data = await uploadFile({
          client_id: payload.client_id,
          name: payload.name,
          size: payload.size,
          type: payload.type,
          category: payload.category,
          url: payload.url,
          access_level: payload.access_level,
          description: payload.description,
          tags: payload.tags
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-invoice': {
        const data = await createInvoice({
          client_id: payload.client_id,
          invoice_number: payload.invoice_number,
          issue_date: payload.issue_date,
          due_date: payload.due_date,
          currency: payload.currency,
          notes: payload.notes,
          terms: payload.terms
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'log-activity': {
        const data = await logClientActivity({
          client_id: payload.client_id,
          activity_type: payload.activity_type,
          description: payload.description,
          metadata: payload.metadata
        })
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Client Portal API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Client Portal request' },
      { status: 500 }
    )
  }
}
