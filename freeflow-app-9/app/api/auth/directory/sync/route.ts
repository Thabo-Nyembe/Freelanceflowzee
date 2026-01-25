/**
 * Directory Sync API
 *
 * POST /api/auth/directory/sync - Trigger directory sync
 * GET /api/auth/directory/sync - Get sync status/history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runDirectorySync } from '@/lib/auth/directory-sync'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('directory-sync')

/**
 * Get sync status and history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const connectionId = searchParams.get('connectionId')
    const organizationId = searchParams.get('organizationId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!connectionId && !organizationId) {
      return NextResponse.json(
        { error: 'Either connectionId or organizationId is required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('directory_sync_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (connectionId) {
      query = query.eq('connection_id', connectionId)
    }
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: logs, error: logsError, count } = await query

    if (logsError) {
      throw logsError
    }

    // Get running syncs
    const { data: runningSyncs } = await supabase
      .from('directory_connections')
      .select('id, name, sync_status, last_sync_started_at')
      .eq(connectionId ? 'id' : 'organization_id', connectionId || organizationId)
      .eq('sync_status', 'syncing')

    return NextResponse.json({
      success: true,
      logs,
      total: count,
      limit,
      offset,
      runningSyncs: runningSyncs || []
    })
  } catch (error) {
    logger.error('Get sync status error', { error })
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}

/**
 * Trigger a directory sync
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { connectionId, syncType = 'incremental' } = body

    if (!connectionId) {
      return NextResponse.json(
        { error: 'connectionId is required' },
        { status: 400 }
      )
    }

    // Validate sync type
    if (!['full', 'incremental'].includes(syncType)) {
      return NextResponse.json(
        { error: 'syncType must be "full" or "incremental"' },
        { status: 400 }
      )
    }

    // Get connection and verify access
    const { data: connection, error: connError } = await supabase
      .from('directory_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user has admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', connection.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check if connection is active
    if (!connection.is_active) {
      return NextResponse.json(
        { error: 'Connection is disabled' },
        { status: 400 }
      )
    }

    // Check if sync is already running
    if (connection.sync_status === 'syncing') {
      return NextResponse.json(
        { error: 'Sync already in progress' },
        { status: 409 }
      )
    }

    // Mark sync as started
    await supabase
      .from('directory_connections')
      .update({
        sync_status: 'syncing',
        last_sync_started_at: new Date().toISOString()
      })
      .eq('id', connectionId)

    // Run sync asynchronously (in production, this would be queued)
    // For now, we'll run it and return immediately with a job ID
    const jobId = crypto.randomUUID()

    // Start sync in background
    runDirectorySyncAsync(connectionId, syncType, jobId, user.id)

    return NextResponse.json({
      success: true,
      message: `${syncType === 'full' ? 'Full' : 'Incremental'} sync started`,
      jobId,
      connectionId
    }, { status: 202 })
  } catch (error) {
    logger.error('Trigger sync error', { error })
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    )
  }
}

/**
 * Run directory sync asynchronously
 */
async function runDirectorySyncAsync(
  connectionId: string,
  syncType: 'full' | 'incremental',
  jobId: string,
  triggeredBy: string
): Promise<void> {
  const supabase = await createClient()
  const startTime = Date.now()

  try {
    // Run the sync
    const result = await runDirectorySync(connectionId, syncType)

    // Update connection status
    await supabase
      .from('directory_connections')
      .update({
        sync_status: result.success ? 'idle' : 'error',
        last_sync_completed_at: new Date().toISOString(),
        last_sync_error: result.success ? null : result.errors?.join('; '),
        delta_link: result.deltaLink || null
      })
      .eq('id', connectionId)

    // Log the sync result
    await supabase.from('directory_sync_logs').insert({
      connection_id: connectionId,
      job_id: jobId,
      operation: `${syncType}_sync`,
      status: result.success ? 'success' : 'failure',
      users_synced: result.usersCreated + result.usersUpdated,
      users_created: result.usersCreated,
      users_updated: result.usersUpdated,
      users_deprovisioned: result.usersDeprovisioned,
      groups_synced: result.groupsCreated + result.groupsUpdated,
      groups_created: result.groupsCreated,
      groups_updated: result.groupsUpdated,
      duration_ms: Date.now() - startTime,
      error_message: result.errors?.join('; '),
      details: {
        triggered_by: triggeredBy,
        sync_type: syncType
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update connection status on error
    await supabase
      .from('directory_connections')
      .update({
        sync_status: 'error',
        last_sync_completed_at: new Date().toISOString(),
        last_sync_error: errorMessage
      })
      .eq('id', connectionId)

    // Log the error
    await supabase.from('directory_sync_logs').insert({
      connection_id: connectionId,
      job_id: jobId,
      operation: `${syncType}_sync`,
      status: 'failure',
      duration_ms: Date.now() - startTime,
      error_message: errorMessage,
      details: {
        triggered_by: triggeredBy,
        sync_type: syncType
      }
    })
  }
}
