/**
 * Directory Connection Detail API
 *
 * GET /api/auth/directory/connections/[id] - Get connection details
 * PUT /api/auth/directory/connections/[id] - Update connection
 * DELETE /api/auth/directory/connections/[id] - Delete connection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('directory-connection')

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Get directory connection details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get connection
    const { data: connection, error: connError } = await supabase
      .from('directory_connections')
      .select(`
        *,
        directory_sync_logs (
          id,
          operation,
          status,
          details,
          error_message,
          users_synced,
          groups_synced,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (connError || !connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user has access
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

    // Get sync statistics
    const { data: stats } = await supabase.rpc('get_directory_sync_stats', {
      p_connection_id: id,
      p_days: 30
    })

    // Get attribute mappings
    const { data: mappings } = await supabase
      .from('directory_attribute_mappings')
      .select('*')
      .eq('connection_id', id)

    // Mask sensitive config values
    const safeConnection = {
      ...connection,
      config: maskSensitiveConfig(connection.config),
      stats,
      attributeMappings: mappings || []
    }

    return NextResponse.json({
      success: true,
      connection: safeConnection
    })
  } catch (error) {
    logger.error('Get directory connection error', { error })
    return NextResponse.json(
      { error: 'Failed to get directory connection' },
      { status: 500 }
    )
  }
}

/**
 * Update directory connection
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get existing connection
    const { data: connection, error: connError } = await supabase
      .from('directory_connections')
      .select('*')
      .eq('id', id)
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

    const body = await request.json()
    const { name, config, syncOptions, isActive } = body

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name
    if (isActive !== undefined) updates.is_active = isActive
    if (syncOptions !== undefined) updates.sync_options = syncOptions

    // Merge config updates (don't overwrite sensitive values if not provided)
    if (config !== undefined) {
      updates.config = {
        ...connection.config,
        ...config
      }
    }

    // Update connection
    const { data: updated, error: updateError } = await supabase
      .from('directory_connections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log the update
    await supabase.from('directory_sync_logs').insert({
      connection_id: id,
      organization_id: connection.organization_id,
      operation: 'connection_updated',
      status: 'success',
      details: {
        updated_fields: Object.keys(updates).filter(k => k !== 'updated_at'),
        updated_by: user.id
      }
    })

    return NextResponse.json({
      success: true,
      connection: {
        ...updated,
        config: maskSensitiveConfig(updated.config)
      }
    })
  } catch (error) {
    logger.error('Update directory connection error', { error })
    return NextResponse.json(
      { error: 'Failed to update directory connection' },
      { status: 500 }
    )
  }
}

/**
 * Delete directory connection
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get existing connection
    const { data: connection, error: connError } = await supabase
      .from('directory_connections')
      .select('*')
      .eq('id', id)
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

    // Delete the connection (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('directory_connections')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    // Log the deletion (in a separate audit table that doesn't cascade)
    await supabase.from('audit_logs').insert({
      organization_id: connection.organization_id,
      user_id: user.id,
      action: 'directory_connection_deleted',
      resource_type: 'directory_connection',
      resource_id: id,
      details: {
        provider: connection.provider,
        name: connection.name
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Directory connection deleted'
    })
  } catch (error) {
    logger.error('Delete directory connection error', { error })
    return NextResponse.json(
      { error: 'Failed to delete directory connection' },
      { status: 500 }
    )
  }
}

/**
 * Mask sensitive configuration values
 */
function maskSensitiveConfig(config: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    'clientSecret',
    'apiToken',
    'serviceAccountKey',
    'bindPassword',
    'password',
    'secret',
    'token'
  ]

  const masked = { ...config }

  for (const key of sensitiveKeys) {
    if (masked[key]) {
      masked[key] = '********'
    }
  }

  return masked
}
