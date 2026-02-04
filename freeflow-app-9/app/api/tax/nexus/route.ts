/**
 * Tax Nexus API
 *
 * Manage economic nexus tracking and compliance
 *
 * GET /api/tax/nexus - Get nexus states for user
 * POST /api/tax/nexus - Update nexus status
 * GET /api/tax/nexus/check - Check economic nexus thresholds
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'
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

const logger = createSimpleLogger('tax-api')

/**
 * Get nexus states for user
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
    const checkThresholds = searchParams.get('checkThresholds') === 'true'

    if (checkThresholds) {
      // Check economic nexus thresholds
      const results = await taxService.checkEconomicNexus(user.id)
      return NextResponse.json({
        success: true,
        nexusThresholds: results,
        statesExceedingThresholds: results.filter(r => r.hasNexus)
      })
    }

    // Get current nexus states
    const nexusStates = await taxService.getNexusStates(user.id)

    return NextResponse.json({
      success: true,
      nexusStates
    })
  } catch (error) {
    logger.error('Get nexus error', { error })
    return NextResponse.json(
      { error: 'Failed to get nexus states' },
      { status: 500 }
    )
  }
}

/**
 * Update nexus status
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
      state,
      country,
      hasNexus,
      nexusType,
      effectiveDate,
      salesThreshold,
      transactionThreshold
    } = body

    // Validate required fields
    if (!state || !country || hasNexus === undefined || !nexusType) {
      return NextResponse.json(
        { error: 'state, country, hasNexus, and nexusType are required' },
        { status: 400 }
      )
    }

    // Validate nexus type
    const validTypes = ['physical', 'economic', 'both']
    if (!validTypes.includes(nexusType)) {
      return NextResponse.json(
        { error: `Invalid nexusType. Use: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Update nexus status
    await taxService.updateNexusStatus({
      userId: user.id,
      state,
      country,
      hasNexus,
      nexusType,
      effectiveDate: effectiveDate || new Date().toISOString().split('T')[0],
      salesThreshold,
      transactionThreshold
    })

    return NextResponse.json({
      success: true,
      message: 'Nexus status updated'
    })
  } catch (error) {
    logger.error('Update nexus error', { error })
    return NextResponse.json(
      { error: 'Failed to update nexus status' },
      { status: 500 }
    )
  }
}

/**
 * Delete nexus status
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
    const state = searchParams.get('state')
    const country = searchParams.get('country')

    if (!state || !country) {
      return NextResponse.json(
        { error: 'state and country are required' },
        { status: 400 }
      )
    }

    // Delete nexus record
    await supabase
      .from('tax_nexus')
      .delete()
      .eq('user_id', user.id)
      .eq('state', state)
      .eq('country', country)

    return NextResponse.json({
      success: true,
      message: 'Nexus status removed'
    })
  } catch (error) {
    logger.error('Delete nexus error', { error })
    return NextResponse.json(
      { error: 'Failed to delete nexus status' },
      { status: 500 }
    )
  }
}
