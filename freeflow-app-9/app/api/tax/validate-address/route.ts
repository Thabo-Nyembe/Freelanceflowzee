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
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('tax-api')

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
