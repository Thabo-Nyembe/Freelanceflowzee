/**
 * Tax Address Validation API
 *
 * Validate and normalize addresses for tax purposes
 *
 * POST /api/tax/validate-address - Validate address
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'
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

const logger = createFeatureLogger('tax-api')

/**
 * Validate address for tax purposes
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
    const { line1, line2, city, state, postalCode, country } = body

    // Validate required fields
    if (!city || !state || !postalCode || !country) {
      return NextResponse.json(
        { error: 'city, state, postalCode, and country are required' },
        { status: 400 }
      )
    }

    // Validate address
    const result = await taxService.validateAddress({
      line1: line1 || '',
      line2: line2 || '',
      city,
      state,
      postal_code: postalCode,
      country
    })

    return NextResponse.json({
      success: true,
      validation: {
        isValid: result.isValid,
        normalizedAddress: {
          line1: result.normalizedAddress.line1 || '',
          line2: result.normalizedAddress.line2 || '',
          city: result.normalizedAddress.city,
          state: result.normalizedAddress.state,
          postalCode: result.normalizedAddress.postal_code,
          country: result.normalizedAddress.country
        },
        suggestions: result.suggestions?.map(addr => ({
          line1: addr.line1 || '',
          line2: addr.line2 || '',
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country
        }))
      }
    })
  } catch (error) {
    logger.error('Address validation error', { error })
    return NextResponse.json(
      { error: 'Failed to validate address' },
      { status: 500 }
    )
  }
}
