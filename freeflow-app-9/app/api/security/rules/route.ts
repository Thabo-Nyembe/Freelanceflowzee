/**
 * Security Anomaly Rules API
 *
 * GET /api/security/rules - List anomaly detection rules
 * POST /api/security/rules - Create a custom rule
 * PUT /api/security/rules - Update a rule
 * DELETE /api/security/rules - Delete a rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('security-rules')

/**
 * List anomaly detection rules
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
    const organizationId = searchParams.get('organizationId')
    const includeSystem = searchParams.get('includeSystem') === 'true'

    // Verify admin access
    if (organizationId) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single()

      if (!membership || !['admin', 'owner'].includes(membership.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Build query
    let query = supabase
      .from('anomaly_rules')
      .select('*')
      .order('name')

    if (organizationId) {
      if (includeSystem) {
        query = query.or(`organization_id.eq.${organizationId},is_system.eq.true`)
      } else {
        query = query.eq('organization_id', organizationId)
      }
    } else if (includeSystem) {
      query = query.eq('is_system', true)
    }

    const { data: rules, error: queryError } = await query

    if (queryError) {
      throw queryError
    }

    return NextResponse.json({
      success: true,
      rules
    })
  } catch (error) {
    logger.error('List anomaly rules error', { error })
    return NextResponse.json(
      { error: 'Failed to list anomaly rules' },
      { status: 500 }
    )
  }
}

/**
 * Create a custom anomaly detection rule
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
    const {
      organization_id,
      name,
      description,
      rule_type,
      conditions,
      actions,
      severity,
      is_active = true,
      cooldown_minutes = 60
    } = body

    // Validate required fields
    if (!organization_id || !name || !rule_type || !conditions || !actions || !severity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Validate conditions structure
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return NextResponse.json(
        { error: 'Conditions must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate actions structure
    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { error: 'Actions must be a non-empty array' },
        { status: 400 }
      )
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical']
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { error: `Invalid severity. Valid values: ${validSeverities.join(', ')}` },
        { status: 400 }
      )
    }

    // Create rule
    const { data: rule, error: createError } = await supabase
      .from('anomaly_rules')
      .insert({
        organization_id,
        name,
        description: description || '',
        rule_type,
        conditions,
        actions,
        severity,
        is_active,
        cooldown_minutes,
        is_system: false,
        created_by: user.id
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({
      success: true,
      rule
    }, { status: 201 })
  } catch (error) {
    logger.error('Create anomaly rule error', { error })
    return NextResponse.json(
      { error: 'Failed to create anomaly rule' },
      { status: 500 }
    )
  }
}

/**
 * Update an anomaly detection rule
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    // Get existing rule
    const { data: existingRule, error: ruleError } = await supabase
      .from('anomaly_rules')
      .select('*')
      .eq('id', id)
      .single()

    if (ruleError || !existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }

    // Cannot modify system rules
    if (existingRule.is_system) {
      return NextResponse.json(
        { error: 'Cannot modify system rules' },
        { status: 403 }
      )
    }

    // Verify admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', existingRule.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Prepare update object
    const allowedFields = [
      'name', 'description', 'rule_type', 'conditions',
      'actions', 'severity', 'is_active', 'cooldown_minutes'
    ]

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Update rule
    const { data: rule, error: updateError } = await supabase
      .from('anomaly_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      rule
    })
  } catch (error) {
    logger.error('Update anomaly rule error', { error })
    return NextResponse.json(
      { error: 'Failed to update anomaly rule' },
      { status: 500 }
    )
  }
}

/**
 * Delete an anomaly detection rule
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      )
    }

    // Get existing rule
    const { data: existingRule, error: ruleError } = await supabase
      .from('anomaly_rules')
      .select('*')
      .eq('id', id)
      .single()

    if (ruleError || !existingRule) {
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      )
    }

    // Cannot delete system rules
    if (existingRule.is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system rules' },
        { status: 403 }
      )
    }

    // Verify admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', existingRule.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete rule
    const { error: deleteError } = await supabase
      .from('anomaly_rules')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Rule deleted'
    })
  } catch (error) {
    logger.error('Delete anomaly rule error', { error })
    return NextResponse.json(
      { error: 'Failed to delete anomaly rule' },
      { status: 500 }
    )
  }
}
