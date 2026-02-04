/**
 * Hyperswitch Routing API
 *
 * Configure smart payment routing rules for multi-processor orchestration
 *
 * POST /api/hyperswitch/routing - Create routing rule
 * GET /api/hyperswitch/routing - List routing rules
 * PUT /api/hyperswitch/routing - Update/activate routing rule
 * DELETE /api/hyperswitch/routing - Delete routing rule
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type RoutingRule } from '@/lib/payments/hyperswitch'
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

const logger = createSimpleLogger('hyperswitch-api')

// Check admin permission
async function checkAdminPermission(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['admin', 'owner'])
    .single()

  return !!membership
}

/**
 * Create a new routing rule
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

    // Check admin permission
    const isAdmin = await checkAdminPermission(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin permission required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, algorithm, connectors, conditions, priority } = body

    // Validate required fields
    if (!name || !algorithm || !connectors || connectors.length === 0) {
      return NextResponse.json(
        { error: 'name, algorithm, and connectors are required' },
        { status: 400 }
      )
    }

    // Validate algorithm
    const validAlgorithms = ['volume_split', 'priority', 'round_robin', 'cost_based', 'success_rate']
    if (!validAlgorithms.includes(algorithm)) {
      return NextResponse.json(
        { error: `Invalid algorithm. Use: ${validAlgorithms.join(', ')}` },
        { status: 400 }
      )
    }

    // Create routing rule
    const rule = await hyperswitchPayment.createRoutingRule({
      name,
      description,
      algorithm,
      connectors,
      conditions,
      priority: priority || 0,
      is_active: false, // Start inactive
    })

    // Store in database
    await supabase.from('payment_routing_rules').insert({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      algorithm: rule.algorithm,
      connectors: rule.connectors,
      conditions: rule.conditions,
      priority: rule.priority,
      is_active: rule.is_active,
      created_by: user.id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      rule,
    }, { status: 201 })
  } catch (error) {
    logger.error('Create routing rule error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create routing rule' },
      { status: 500 }
    )
  }
}

/**
 * Get routing rules
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

    // Check admin permission
    const isAdmin = await checkAdminPermission(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin permission required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const ruleId = searchParams.get('id')
    const activeOnly = searchParams.get('active') === 'true'

    if (ruleId) {
      // Get specific rule
      const rule = await hyperswitchPayment.getRoutingRule(ruleId)
      return NextResponse.json({
        success: true,
        rule,
      })
    }

    // List rules from database
    let query = supabase
      .from('payment_routing_rules')
      .select('*')
      .order('priority', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data: rules, error } = await query

    if (error) throw error

    // Get analytics for each rule
    const rulesWithAnalytics = await Promise.all(
      (rules || []).map(async (rule) => {
        try {
          const analytics = await hyperswitchPayment.getPaymentAnalytics({
            routing_rule_id: rule.id,
          })
          return {
            ...rule,
            analytics: {
              total_payments: analytics.total_payments,
              successful_payments: analytics.successful_payments,
              success_rate: analytics.success_rate,
            },
          }
        } catch {
          return rule
        }
      })
    )

    return NextResponse.json({
      success: true,
      rules: rulesWithAnalytics,
    })
  } catch (error) {
    logger.error('Get routing rules error', { error })
    return NextResponse.json(
      { error: 'Failed to get routing rules' },
      { status: 500 }
    )
  }
}

/**
 * Update or activate routing rule
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

    // Check admin permission
    const isAdmin = await checkAdminPermission(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin permission required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rule_id, action, name, description, algorithm, connectors, conditions, priority } = body

    if (!rule_id) {
      return NextResponse.json(
        { error: 'rule_id is required' },
        { status: 400 }
      )
    }

    // Verify rule exists
    const { data: existingRule } = await supabase
      .from('payment_routing_rules')
      .select('*')
      .eq('id', rule_id)
      .single()

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Routing rule not found' },
        { status: 404 }
      )
    }

    let updatedRule: RoutingRule

    if (action === 'activate') {
      // Deactivate other rules first (only one active at a time)
      await supabase
        .from('payment_routing_rules')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .neq('id', rule_id)

      // Activate this rule
      updatedRule = await hyperswitchPayment.activateRoutingRule(rule_id)

      await supabase
        .from('payment_routing_rules')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', rule_id)
    } else if (action === 'deactivate') {
      updatedRule = await hyperswitchPayment.deactivateRoutingRule(rule_id)

      await supabase
        .from('payment_routing_rules')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', rule_id)
    } else {
      // Update rule configuration
      updatedRule = await hyperswitchPayment.updateRoutingRule(rule_id, {
        name: name || existingRule.name,
        description: description ?? existingRule.description,
        algorithm: algorithm || existingRule.algorithm,
        connectors: connectors || existingRule.connectors,
        conditions: conditions || existingRule.conditions,
        priority: priority ?? existingRule.priority,
        is_active: existingRule.is_active,
      })

      await supabase
        .from('payment_routing_rules')
        .update({
          name: updatedRule.name,
          description: updatedRule.description,
          algorithm: updatedRule.algorithm,
          connectors: updatedRule.connectors,
          conditions: updatedRule.conditions,
          priority: updatedRule.priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rule_id)
    }

    return NextResponse.json({
      success: true,
      rule: updatedRule,
    })
  } catch (error) {
    logger.error('Update routing rule error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update routing rule' },
      { status: 500 }
    )
  }
}

/**
 * Delete routing rule
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

    // Check admin permission
    const isAdmin = await checkAdminPermission(supabase, user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin permission required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Verify rule exists and is not active
    const { data: existingRule } = await supabase
      .from('payment_routing_rules')
      .select('is_active')
      .eq('id', ruleId)
      .single()

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Routing rule not found' },
        { status: 404 }
      )
    }

    if (existingRule.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active routing rule. Deactivate it first.' },
        { status: 400 }
      )
    }

    // Delete from Hyperswitch
    await hyperswitchPayment.deleteRoutingRule(ruleId)

    // Delete from database
    await supabase
      .from('payment_routing_rules')
      .delete()
      .eq('id', ruleId)

    return NextResponse.json({
      success: true,
      message: 'Routing rule deleted',
    })
  } catch (error) {
    logger.error('Delete routing rule error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete routing rule' },
      { status: 500 }
    )
  }
}
