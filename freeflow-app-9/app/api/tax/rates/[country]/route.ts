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

const logger = createSimpleLogger('tax-rates')

/**
 * GET /api/tax/rates/[country]
 * Get tax rates for a specific country
 * Optional query params:
 *   - state: filter by state/province
 *   - type: filter by tax type (vat, gst, sales_tax, etc.)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  try {
    const supabase = await createClient()
    const { country } = await params
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')
    const taxType = searchParams.get('type')

    // Build query
    let query = supabase
      .from('tax_rates')
      .select('*')
      .eq('country', country.toUpperCase())
      .eq('is_active', true)
      .order('rate', { ascending: false })

    // Add optional filters
    if (state) {
      query = query.eq('state', state.toUpperCase())
    }

    if (taxType) {
      query = query.eq('tax_type', taxType)
    }

    const { data: rates, error } = await query

    if (error) {
      logger.error('Tax rates fetch error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch tax rates' },
        { status: 500 }
      )
    }

    // If no rates found for specific state, try to get country-level rate
    if (!rates || rates.length === 0) {
      if (state) {
        const { data: fallbackRates } = await supabase
          .from('tax_rates')
          .select('*')
          .eq('country', country.toUpperCase())
          .is('state', null)
          .eq('is_active', true)
          .limit(1)

        return NextResponse.json({
          success: true,
          data: fallbackRates || [],
          note: 'No state-specific rates found, returning country-level rate'
        })
      }

      return NextResponse.json({
        success: true,
        data: [],
        note: `No tax rates found for ${country}`
      })
    }

    return NextResponse.json({
      success: true,
      data: rates,
      count: rates.length
    })
  } catch (error) {
    logger.error('Tax rates API error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
