/**
 * CRM API Routes
 *
 * REST endpoints for CRM feature:
 * GET - List contacts, leads, deals, activities, notes, or stats
 * POST - Create contact, lead, deal, activity, or note
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('crm')
import {

  getCRMContacts,
  createCRMContact,
  getCRMLeads,
  createCRMLead,
  getCRMDeals,
  createCRMDeal,
  getCRMActivities,
  createCRMActivity,
  getCRMNotes,
  createCRMNote,
  getCRMStats
} from '@/lib/crm-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'contacts'
    const contactType = searchParams.get('contact_type') as string | null
    const status = searchParams.get('status') as string | null
    const stage = searchParams.get('stage') as string | null
    const assignedTo = searchParams.get('assigned_to') || undefined
    const contactId = searchParams.get('contact_id') || undefined
    const dealId = searchParams.get('deal_id') || undefined

    switch (type) {
      case 'contacts': {
        const { data, error } = await getCRMContacts(user.id, {
          type: contactType,
          status
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'leads': {
        const { data, error } = await getCRMLeads(user.id, {
          status,
          assignedTo
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'deals': {
        const { data, error } = await getCRMDeals(user.id, {
          stage,
          assignedTo
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'activities': {
        const { data, error } = await getCRMActivities(user.id, {
          contactId,
          dealId,
          status
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'notes': {
        const { data, error } = await getCRMNotes(user.id, {
          contactId,
          dealId
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getCRMStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('CRM API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch CRM data' },
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
      case 'create-contact': {
        const { data, error } = await createCRMContact(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-lead': {
        const { data, error } = await createCRMLead(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-deal': {
        const { data, error } = await createCRMDeal(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-activity': {
        const { data, error } = await createCRMActivity(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-note': {
        const { data, error } = await createCRMNote(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('CRM API error', { error })
    return NextResponse.json(
      { error: 'Failed to process CRM request' },
      { status: 500 }
    )
  }
}

// PATCH - Update CRM records
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'contacts'
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Remove protected fields
    const { id: _id, user_id: _userId, created_at: _createdAt, ...updateData } = body
    updateData.updated_at = new Date().toISOString()

    let tableName: string
    switch (type) {
      case 'contacts': tableName = 'crm_contacts'; break
      case 'leads': tableName = 'crm_leads'; break
      case 'deals': tableName = 'crm_deals'; break
      case 'activities': tableName = 'crm_activities'; break
      case 'notes': tableName = 'crm_notes'; break
      case 'companies': tableName = 'crm_companies'; break
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('CRM PATCH error', { error, type, id })
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 })
      }
      throw error
    }

    logger.info('CRM record updated', { type, id })
    return NextResponse.json({ data, message: `${type.slice(0, -1)} updated successfully` })
  } catch (error) {
    logger.error('CRM PATCH error', { error })
    return NextResponse.json(
      { error: 'Failed to update CRM record' },
      { status: 500 }
    )
  }
}

// DELETE - Delete CRM records
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'contacts'
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    let tableName: string
    switch (type) {
      case 'contacts': tableName = 'crm_contacts'; break
      case 'leads': tableName = 'crm_leads'; break
      case 'deals': tableName = 'crm_deals'; break
      case 'activities': tableName = 'crm_activities'; break
      case 'notes': tableName = 'crm_notes'; break
      case 'companies': tableName = 'crm_companies'; break
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    // For contacts and deals, soft delete by setting status
    if (type === 'contacts' || type === 'deals') {
      const { error } = await supabase
        .from(tableName)
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('CRM DELETE error', { error, type, id })
        throw error
      }
    } else {
      // Hard delete for activities and notes
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        logger.error('CRM DELETE error', { error, type, id })
        throw error
      }
    }

    logger.info('CRM record deleted', { type, id })
    return NextResponse.json({
      success: true,
      message: `${type.slice(0, -1)} deleted successfully`,
      id
    })
  } catch (error) {
    logger.error('CRM DELETE error', { error })
    return NextResponse.json(
      { error: 'Failed to delete CRM record' },
      { status: 500 }
    )
  }
}
