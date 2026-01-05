/**
 * File Download API - Secure file access with verification
 *
 * POST /api/files/delivery/[id]/download
 *
 * Features:
 * - Password verification
 * - Payment verification
 * - Escrow status check
 * - Download limit enforcement
 * - Expiration check
 * - Access logging
 * - Signed URL generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createWasabiClient } from '@/lib/storage/wasabi-client'
import {
  verifyFilePassword,
  verifyAccessToken,
  generateAccessToken
} from '@/lib/security/file-password'

export interface DownloadRequest {
  password?: string
  accessToken?: string
}

export interface DownloadResponse {
  success: boolean
  downloadUrl?: string
  expiresIn?: number
  error?: string
  requiresPassword?: boolean
  requiresPayment?: boolean
  paymentStatus?: string
}

/**
 * Handle file download with verification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliveryId } = await params
    const body: DownloadRequest = await request.json()
    const { password, accessToken } = body

    const supabase = await createClient()

    // Get delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('secure_file_deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Check if delivery has expired
    if (delivery.expires_at && new Date(delivery.expires_at) < new Date()) {
      await supabase
        .from('secure_file_deliveries')
        .update({ status: 'expired' })
        .eq('id', deliveryId)

      return NextResponse.json(
        { success: false, error: 'This delivery has expired' },
        { status: 410 }
      )
    }

    // Check download limit
    if (
      delivery.max_downloads &&
      delivery.download_count >= delivery.max_downloads
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Download limit reached for this delivery'
        },
        { status: 403 }
      )
    }

    // Get client IP for logging
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Verify access based on delivery type
    let userId: string | undefined

    // Check if access token provided
    if (accessToken) {
      try {
        const tokenPayload = await verifyAccessToken(accessToken)
        userId = tokenPayload.userId
      } catch (error: any) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired access token' },
          { status: 401 }
        )
      }
    }

    // Password verification
    if (delivery.password_hash) {
      if (!password && !accessToken) {
        return NextResponse.json(
          {
            success: false,
            requiresPassword: true,
            error: 'Password required'
          },
          { status: 401 }
        )
      }

      if (password) {
        const verification = await verifyFilePassword(
          deliveryId,
          password,
          clientIp
        )

        if (!verification.success) {
          return NextResponse.json(
            {
              success: false,
              requiresPassword: true,
              error:
                verification.remainingAttempts === 0
                  ? 'Too many failed attempts. Please try again later.'
                  : `Incorrect password. ${verification.remainingAttempts} attempts remaining.`,
              remainingAttempts: verification.remainingAttempts
            },
            { status: 401 }
          )
        }

        // Generate access token for future requests
        const newAccessToken = verification.accessToken
        // We'll return this in the response
      }
    }

    // Payment verification
    if (delivery.requires_payment) {
      if (delivery.escrow_enabled) {
        // Check escrow status
        if (delivery.status !== 'released') {
          return NextResponse.json(
            {
              success: false,
              requiresPayment: true,
              paymentStatus: delivery.status,
              error:
                'File is locked in escrow. Payment must be released by seller.'
            },
            { status: 402 }
          )
        }
      } else if (delivery.status !== 'paid' && delivery.status !== 'released') {
        // Check payment status
        const { data: transaction } = await supabase
          .from('file_download_transactions')
          .select('*')
          .eq('delivery_id', deliveryId)
          .eq('status', 'completed')
          .limit(1)
          .single()

        if (!transaction) {
          return NextResponse.json(
            {
              success: false,
              requiresPayment: true,
              paymentAmount: delivery.payment_amount,
              error: 'Payment required to access this file'
            },
            { status: 402 }
          )
        }
      }
    }

    // Get current user for logging
    const {
      data: { user }
    } = await supabase.auth.getUser()
    userId = userId || user?.id

    // Generate signed download URL
    const wasabi = createWasabiClient()
    const downloadUrl = await wasabi.getSignedUrl(
      delivery.storage_key,
      3600 // 1 hour expiry
    )

    // Increment download count
    await supabase
      .from('secure_file_deliveries')
      .update({
        download_count: delivery.download_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', deliveryId)

    // Log access
    await supabase.from('file_access_logs').insert({
      delivery_id: deliveryId,
      user_id: userId,
      action: 'download',
      ip_address: clientIp,
      user_agent: request.headers.get('user-agent') || undefined,
      metadata: {
        downloadCount: delivery.download_count + 1,
        timestamp: new Date().toISOString()
      }
    })

    // Generate new access token if this was password verification
    let newAccessToken: string | undefined
    if (password && !accessToken) {
      newAccessToken = await generateAccessToken(deliveryId, userId)
    }

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
      accessToken: newAccessToken
    })
  } catch (error: any) {
    console.error('Download error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate download URL'
      },
      { status: 500 }
    )
  }
}

/**
 * Get download status/requirements
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deliveryId } = await params
    const supabase = await createClient()

    const { data: delivery, error } = await supabase
      .from('secure_file_deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (error || !delivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery not found' },
        { status: 404 }
      )
    }

    // Check expiration
    const isExpired =
      delivery.expires_at && new Date(delivery.expires_at) < new Date()

    // Check download limit
    const limitReached =
      delivery.max_downloads && delivery.download_count >= delivery.max_downloads

    return NextResponse.json({
      success: true,
      delivery: {
        id: delivery.id,
        fileName: delivery.file_name,
        fileSize: delivery.file_size,
        fileType: delivery.file_type,
        requiresPassword: !!delivery.password_hash,
        requiresPayment: delivery.requires_payment,
        paymentAmount: delivery.payment_amount,
        escrowEnabled: delivery.escrow_enabled,
        status: delivery.status,
        downloadCount: delivery.download_count,
        maxDownloads: delivery.max_downloads,
        expiresAt: delivery.expires_at,
        isExpired,
        limitReached,
        canDownload: !isExpired && !limitReached
      }
    })
  } catch (error: any) {
    console.error('Get download status error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get download status'
      },
      { status: 500 }
    )
  }
}
