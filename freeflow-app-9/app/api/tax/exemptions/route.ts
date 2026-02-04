/**
 * Tax Exemptions API
 *
 * Manage tax exemption certificates
 *
 * POST /api/tax/exemptions - Create exemption certificate
 * GET /api/tax/exemptions - List exemption certificates
 * DELETE /api/tax/exemptions - Delete exemption certificate
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
 * Create exemption certificate
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
      certificateNumber,
      exemptionType,
      issuingState,
      validFrom,
      validUntil,
      documentUrl
    } = body

    // Validate required fields
    if (!certificateNumber || !exemptionType || !issuingState || !validFrom) {
      return NextResponse.json(
        { error: 'certificateNumber, exemptionType, issuingState, and validFrom are required' },
        { status: 400 }
      )
    }

    // Create certificate
    const certificate = await taxService.createExemptionCertificate({
      userId: user.id,
      certificateNumber,
      exemptionType,
      issuingState,
      validFrom,
      validUntil,
      documentUrl
    })

    return NextResponse.json({
      success: true,
      certificate
    }, { status: 201 })
  } catch (error) {
    logger.error('Create exemption error', { error })
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create exemption certificate' },
      { status: 500 }
    )
  }
}

/**
 * List exemption certificates
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
    const status = searchParams.get('status')

    // Get certificates
    let certificates = await taxService.getExemptionCertificates(user.id)

    // Filter by status if provided
    if (status) {
      certificates = certificates.filter(cert => cert.status === status)
    }

    return NextResponse.json({
      success: true,
      certificates
    })
  } catch (error) {
    logger.error('List exemptions error', { error })
    return NextResponse.json(
      { error: 'Failed to list exemption certificates' },
      { status: 500 }
    )
  }
}

/**
 * Delete or revoke exemption certificate
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
    const certificateId = searchParams.get('id')
    const action = searchParams.get('action') || 'delete' // 'delete' or 'revoke'

    if (!certificateId) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Verify certificate belongs to user
    const { data: certificate } = await supabase
      .from('tax_exemptions')
      .select('id')
      .eq('id', certificateId)
      .eq('user_id', user.id)
      .single()

    if (!certificate) {
      return NextResponse.json(
        { error: 'Exemption certificate not found' },
        { status: 404 }
      )
    }

    if (action === 'revoke') {
      // Just update status to revoked
      await supabase
        .from('tax_exemptions')
        .update({
          status: 'revoked',
          updated_at: new Date().toISOString()
        })
        .eq('id', certificateId)

      return NextResponse.json({
        success: true,
        message: 'Exemption certificate revoked'
      })
    }

    // Delete certificate
    await supabase
      .from('tax_exemptions')
      .delete()
      .eq('id', certificateId)

    return NextResponse.json({
      success: true,
      message: 'Exemption certificate deleted'
    })
  } catch (error) {
    logger.error('Delete exemption error', { error })
    return NextResponse.json(
      { error: 'Failed to delete exemption certificate' },
      { status: 500 }
    )
  }
}
