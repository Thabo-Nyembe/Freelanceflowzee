/**
 * Advanced Settings API Routes
 *
 * REST endpoints for Advanced Settings:
 * GET - Data exports, settings backups, sync history, deletion request, cache logs, stats
 * POST - Create exports, backups, sync records, deletion requests, cache logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('advanced-settings')
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
  getUserDataExports,
  createUserDataExport,
  getSettingsBackups,
  createSettingsBackup,
  getSettingsSyncHistory,
  createSettingsSyncRecord,
  getDeviceSyncHistory,
  getAccountDeletionRequest,
  createAccountDeletionRequest,
  getPendingDeletionRequests,
  getCacheClearLogs,
  createCacheClearLog,
  getAdvancedSettingsStats,
  getRecentActivity
} from '@/lib/advanced-settings-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'stats'
    const exportType = searchParams.get('export_type') as string | null
    const exportStatus = searchParams.get('export_status') as string | null
    const backupType = searchParams.get('backup_type') as string | null
    const isAutomatic = searchParams.get('is_automatic')
    const syncStatus = searchParams.get('sync_status') as string | null
    const deviceId = searchParams.get('device_id')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    switch (type) {
      case 'exports': {
        const filters: any = {}
        if (exportType) filters.export_type = exportType
        if (exportStatus) filters.export_status = exportStatus
        const result = await getUserDataExports(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'backups': {
        const filters: any = {}
        if (backupType) filters.backup_type = backupType
        if (isAutomatic !== null) filters.is_automatic = isAutomatic === 'true'
        const result = await getSettingsBackups(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'sync-history': {
        const filters: any = { limit }
        if (syncStatus) filters.sync_status = syncStatus
        if (deviceId) filters.device_id = deviceId
        const result = await getSettingsSyncHistory(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'device-sync-history': {
        if (!deviceId) {
          return NextResponse.json({ error: 'device_id required' }, { status: 400 })
        }
        const result = await getDeviceSyncHistory(user.id, deviceId)
        return NextResponse.json({ data: result.data })
      }

      case 'deletion-request': {
        const result = await getAccountDeletionRequest(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'pending-deletion-requests': {
        const result = await getPendingDeletionRequests()
        return NextResponse.json({ data: result.data })
      }

      case 'cache-logs': {
        const result = await getCacheClearLogs(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getAdvancedSettingsStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'recent-activity': {
        const result = await getRecentActivity(user.id, limit)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Advanced Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Advanced Settings data' },
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
      case 'create-export': {
        const result = await createUserDataExport(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-backup': {
        const result = await createSettingsBackup(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-sync-record': {
        const result = await createSettingsSyncRecord(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-deletion-request': {
        const result = await createAccountDeletionRequest(user.id, payload.reason, payload.grace_period_days)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'create-cache-log': {
        const result = await createCacheClearLog(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Advanced Settings API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Advanced Settings request' },
      { status: 500 }
    )
  }
}
