/**
 * Escrow Release API
 *
 * POST /api/files/escrow/release
 *
 * Allows seller to release escrowed payment for file delivery
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { releaseFileEscrow } from '@/lib/payments/file-payment'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('files-escrow')

export interface ReleaseEscrowRequest {
  deliveryId: string
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ReleaseEscrowRequest = await request.json()
    const { deliveryId } = body

    if (!deliveryId) {
      return NextResponse.json(
        { success: false, error: 'Delivery ID is required' },
        { status: 400 }
      )
    }

    // Release escrow
    const result = await releaseFileEscrow(deliveryId, user.id)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Escrow released successfully. File is now accessible to buyer.'
    })
  } catch (error: any) {
    logger.error('Escrow release error', { error })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to release escrow'
      },
      { status: 500 }
    )
  }
}

/**
 * Get escrow status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deliveryId = searchParams.get('deliveryId')

    if (!deliveryId) {
      return NextResponse.json(
        { success: false, error: 'Delivery ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get delivery with escrow info
    const { data: delivery, error: deliveryError } = await supabase
      .from('secure_file_deliveries')
      .select('*, escrow_deposits(*)')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      )
    }

    if (!delivery.escrow_enabled) {
      return NextResponse.json({
        success: true,
        escrowEnabled: false
      })
    }

    return NextResponse.json({
      success: true,
      escrowEnabled: true,
      escrowStatus: delivery.escrow_deposits?.status,
      escrowAmount: delivery.payment_amount,
      canRelease: delivery.status === 'escrowed',
      deliveryStatus: delivery.status
    })
  } catch (error: any) {
    logger.error('Get escrow status error', { error })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get escrow status'
      },
      { status: 500 }
    )
  }
}
