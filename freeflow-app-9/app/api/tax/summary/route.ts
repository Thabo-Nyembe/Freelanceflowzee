/**
 * Tax Summary API
 *
 * Get comprehensive tax summary and analytics
 *
 * GET /api/tax/summary - Get tax summary for a year
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { taxService } from '@/lib/tax/tax-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tax-api')

/**
 * Get tax summary for a year
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get tax summary
    const summary = await taxService.getTaxSummary(user.id, year)

    // Get provider status
    const providerStatus = taxService.getProviderStatus()

    return NextResponse.json({
      success: true,
      summary: {
        year,
        ...summary
      },
      providers: providerStatus
    })

  } catch (error) {
    logger.error('Tax summary error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tax summary' },
      { status: 500 }
    )
  }
}
