/**
 * Client Portal API - Single Resource Routes
 *
 * GET - Get single client, project, milestones, risks, communications, files, invoices, activities, metrics
 * PUT - Update client, project, communication, file, invoice, milestone, risk
 * DELETE - Delete client, project, communication, file, invoice, milestone, risk
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getClient,
  updateClient,
  deleteClient,
  updateClientHealthScore,
  updateLastContact,
  getProject,
  updateProject,
  deleteProject,
  updateProjectProgress,
  updateProjectBudget,
  toggleProjectStar,
  getClientProjects,
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  completeMilestone,
  deleteMilestone,
  getProjectRisks,
  createRisk,
  updateRisk,
  closeRisk,
  deleteRisk,
  getClientCommunications,
  updateCommunication,
  deleteCommunication,
  getClientFiles,
  updateFile,
  deleteFile,
  getFileVersions,
  incrementFileDownloadCount,
  getClientInvoices,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  getClientActivities,
  getClientMetrics,
  recordClientMetrics,
  exportClientDataToCSV
} from '@/lib/client-portal-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'client'
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (type) {
      case 'client': {
        const data = await getClient(id)
        if (!data) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'project': {
        const data = await getProject(id)
        if (!data) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'client-projects': {
        // id here is client_id
        const data = await getClientProjects(id)
        return NextResponse.json({ data })
      }

      case 'milestones': {
        // id here is project_id
        const data = await getProjectMilestones(id)
        return NextResponse.json({ data })
      }

      case 'risks': {
        // id here is project_id
        const data = await getProjectRisks(id)
        return NextResponse.json({ data })
      }

      case 'client-communications': {
        // id here is client_id
        const data = await getClientCommunications(id)
        return NextResponse.json({ data })
      }

      case 'client-files': {
        // id here is client_id
        const data = await getClientFiles(id)
        return NextResponse.json({ data })
      }

      case 'file-versions': {
        // id here is file_id
        const data = await getFileVersions(id)
        return NextResponse.json({ data })
      }

      case 'client-invoices': {
        // id here is client_id
        const data = await getClientInvoices(id)
        return NextResponse.json({ data })
      }

      case 'client-activities': {
        // id here is client_id
        const data = await getClientActivities(id, limit)
        return NextResponse.json({ data })
      }

      case 'client-metrics': {
        // id here is client_id
        const data = await getClientMetrics(id, days)
        return NextResponse.json({ data })
      }

      case 'export': {
        // id here is client_id
        const data = await exportClientDataToCSV(id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Client Portal API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'client': {
        if (action === 'update-health-score') {
          await updateClientHealthScore(id, updates.health_score)
          return NextResponse.json({ success: true })
        } else if (action === 'update-last-contact') {
          await updateLastContact(id)
          return NextResponse.json({ success: true })
        } else {
          await updateClient(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'project': {
        if (action === 'update-progress') {
          await updateProjectProgress(id, updates.progress)
          return NextResponse.json({ success: true })
        } else if (action === 'update-budget') {
          await updateProjectBudget(id, updates.spent)
          return NextResponse.json({ success: true })
        } else if (action === 'toggle-star') {
          const starred = await toggleProjectStar(id)
          return NextResponse.json({ data: { is_starred: starred } })
        } else {
          await updateProject(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'milestone': {
        if (action === 'complete') {
          await completeMilestone(id)
          return NextResponse.json({ success: true })
        } else {
          await updateMilestone(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'risk': {
        if (action === 'close') {
          await closeRisk(id)
          return NextResponse.json({ success: true })
        } else {
          await updateRisk(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'communication': {
        await updateCommunication(id, updates)
        return NextResponse.json({ success: true })
      }

      case 'file': {
        if (action === 'increment-download') {
          await incrementFileDownloadCount(id)
          return NextResponse.json({ success: true })
        } else {
          await updateFile(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      case 'invoice': {
        if (action === 'mark-paid') {
          await markInvoiceAsPaid(id)
          return NextResponse.json({ success: true })
        } else {
          await updateInvoice(id, updates)
          return NextResponse.json({ success: true })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Client Portal API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'client'

    switch (type) {
      case 'client': {
        await deleteClient(id)
        return NextResponse.json({ success: true })
      }

      case 'project': {
        await deleteProject(id)
        return NextResponse.json({ success: true })
      }

      case 'milestone': {
        await deleteMilestone(id)
        return NextResponse.json({ success: true })
      }

      case 'risk': {
        await deleteRisk(id)
        return NextResponse.json({ success: true })
      }

      case 'communication': {
        await deleteCommunication(id)
        return NextResponse.json({ success: true })
      }

      case 'file': {
        await deleteFile(id)
        return NextResponse.json({ success: true })
      }

      case 'invoice': {
        await deleteInvoice(id)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Client Portal API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
