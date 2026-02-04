/**
 * Audit Trail API - Single Resource Routes
 *
 * GET - Get single audit log, compliance report
 * DELETE - Delete audit log, compliance report, old logs (admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('audit-trail')
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
  getAuditLogById,
  deleteAuditLog,
  deleteOldLogs,
  getComplianceReport,
  deleteComplianceReport,
  getLogsByEntity
} from '@/lib/audit-trail-queries'

export async function GET(
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
    const type = searchParams.get('type') || 'log'
    const entityType = searchParams.get('entity_type') as string | null
    const limit = parseInt(searchParams.get('limit') || '50')

    switch (type) {
      case 'log': {
        const data = await getAuditLogById(id)
        if (!data) {
          return NextResponse.json({ error: 'Audit log not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'compliance-report': {
        const data = await getComplianceReport(id)
        if (!data) {
          return NextResponse.json({ error: 'Compliance report not found' }, { status: 404 })
        }
        return NextResponse.json({ data })
      }

      case 'entity-logs': {
        // id here is entity_id
        if (!entityType) {
          return NextResponse.json({ error: 'entity_type required' }, { status: 400 })
        }
        const data = await getLogsByEntity(user.id, entityType, id, limit)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Audit Trail API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
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
    const type = searchParams.get('type') || 'log'
    const olderThanDays = parseInt(searchParams.get('older_than_days') || '365')

    switch (type) {
      case 'log': {
        await deleteAuditLog(id)
        return NextResponse.json({ success: true })
      }

      case 'compliance-report': {
        await deleteComplianceReport(id)
        return NextResponse.json({ success: true })
      }

      case 'old-logs': {
        // id here is user_id (or use current user)
        await deleteOldLogs(id === 'me' ? user.id : id, olderThanDays)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Audit Trail API error', { error })
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
