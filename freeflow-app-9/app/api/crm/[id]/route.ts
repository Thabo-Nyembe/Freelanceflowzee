/**
 * CRM API - Single Resource Routes
 *
 * GET - Get single contact, lead, deal
 * PUT - Update contact, lead, deal, activity
 * DELETE - Delete contact, lead, deal, activity, note
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('crm-resource')
import {

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}
  updateCRMContact,
  deleteCRMContact,
  updateCRMLead,
  deleteCRMLead,
  convertLeadToDeal,
  updateCRMDeal,
  deleteCRMDeal,
  closeDeal,
  updateCRMActivity,
  deleteCRMActivity,
  completeActivity,
  toggleNotePin,
  deleteCRMNote
} from '@/lib/crm-queries'

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

    let result

    switch (type) {
      case 'contact':
        result = await updateCRMContact(id, updates)
        break

      case 'lead':
        if (action === 'convert') {
          result = await convertLeadToDeal(id, updates.dealId)
        } else {
          result = await updateCRMLead(id, updates)
        }
        break

      case 'deal':
        if (action === 'close') {
          result = await closeDeal(id, updates.stage, updates.reason)
        } else {
          result = await updateCRMDeal(id, updates)
        }
        break

      case 'activity':
        if (action === 'complete') {
          result = await completeActivity(id, updates.outcome)
        } else {
          result = await updateCRMActivity(id, updates)
        }
        break

      case 'note':
        if (action === 'toggle-pin') {
          result = await toggleNotePin(id, updates.isPinned)
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (result?.error) throw result.error

    return NextResponse.json({ data: result?.data })
  } catch (error) {
    logger.error('CRM API error', { error })
    return NextResponse.json(
      { error: 'Failed to update CRM record' },
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
    const type = searchParams.get('type')

    let error

    switch (type) {
      case 'contact':
        ({ error } = await deleteCRMContact(id))
        break

      case 'lead':
        ({ error } = await deleteCRMLead(id))
        break

      case 'deal':
        ({ error } = await deleteCRMDeal(id))
        break

      case 'activity':
        ({ error } = await deleteCRMActivity(id))
        break

      case 'note':
        ({ error } = await deleteCRMNote(id))
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('CRM API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete CRM record' },
      { status: 500 }
    )
  }
}
