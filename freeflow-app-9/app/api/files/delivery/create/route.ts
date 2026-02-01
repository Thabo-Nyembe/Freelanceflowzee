/**
 * Delivery Creation API - Create secure file deliveries
 *
 * POST /api/files/delivery/create
 *
 * Features:
 * - Password protection
 * - Payment gating
 * - Escrow integration
 * - Download limits
 * - Expiration dates
 * - Batch recipient delivery
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/security/file-password'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('files-delivery')

export interface CreateDeliveryRequest {
  fileId: string
  recipientEmail?: string
  recipientEmails?: string[]
  password?: string
  requiresPayment: boolean
  paymentAmount?: number
  escrowEnabled: boolean
  maxDownloads?: number
  expiresAt?: string
  isPublic?: boolean
  collectionId?: string
  metadata?: Record<string, any>
}

export interface CreateDeliveryResponse {
  success: boolean
  delivery?: {
    id: string
    accessUrl: string
    expiresAt?: string
    requiresPassword: boolean
    requiresPayment: boolean
    escrowEnabled: boolean
  }
  error?: string
}

/**
 * Create a new file delivery
 */
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

    // Parse request body
    const body: CreateDeliveryRequest = await request.json()
    const {
      fileId,
      recipientEmail,
      recipientEmails,
      password,
      requiresPayment,
      paymentAmount,
      escrowEnabled,
      maxDownloads,
      expiresAt,
      isPublic,
      collectionId,
      metadata
    } = body

    // Validate required fields
    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Verify file ownership
    const { data: file, error: fileError } = await supabase
      .from('secure_file_deliveries')
      .select('*')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { success: false, error: 'File not found or access denied' },
        { status: 404 }
      )
    }

    // Validate payment settings
    if (requiresPayment && (!paymentAmount || paymentAmount <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Payment amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Hash password if provided
    let passwordHash: string | null = null
    if (password) {
      try {
        passwordHash = await hashPassword(password)
      } catch (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }
    }

    // Determine access type
    let accessType: string
    if (isPublic) {
      accessType = 'public'
    } else if (password) {
      accessType = 'password'
    } else if (requiresPayment) {
      accessType = escrowEnabled ? 'escrow' : 'payment'
    } else {
      accessType = 'private'
    }

    // Create or update delivery record
    const deliveryData = {
      owner_id: user.id,
      file_name: file.file_name,
      file_size: file.file_size,
      file_type: file.file_type,
      storage_key: file.storage_key,
      storage_provider: file.storage_provider,
      access_type: accessType,
      password_hash: passwordHash,
      requires_payment: requiresPayment,
      payment_amount: paymentAmount,
      escrow_enabled: escrowEnabled,
      max_downloads: maxDownloads || null,
      download_count: 0,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      status: requiresPayment ? 'pending_payment' : 'draft',
      metadata: {
        ...file.metadata,
        ...metadata,
        deliveryCreatedAt: new Date().toISOString(),
        isPublic: isPublic || false
      }
    }

    let delivery
    if (file.status === 'draft' && !file.password_hash && !file.payment_amount) {
      // Update existing draft delivery
      const { data, error: updateError } = await supabase
        .from('secure_file_deliveries')
        .update(deliveryData)
        .eq('id', fileId)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update delivery: ${updateError.message}`)
      }

      delivery = data
    } else {
      // Create new delivery record
      const { data, error: insertError } = await supabase
        .from('secure_file_deliveries')
        .insert(deliveryData)
        .select()
        .single()

      if (insertError) {
        throw new Error(`Failed to create delivery: ${insertError.message}`)
      }

      delivery = data
    }

    // Add to collection if specified
    if (collectionId) {
      await supabase.from('collection_files').insert({
        collection_id: collectionId,
        delivery_id: delivery.id,
        display_order: 0
      })
    }

    // Handle recipients (batch delivery)
    const recipients = recipientEmails || (recipientEmail ? [recipientEmail] : [])
    if (recipients.length > 0) {
      const recipientRecords = recipients.map((email) => ({
        delivery_id: delivery.id,
        recipient_email: email,
        sent_at: null // Will be updated when email is sent
      }))

      await supabase.from('file_delivery_recipients').insert(recipientRecords)
    }

    // Generate access URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const accessUrl = `${baseUrl}/delivery/${delivery.id}`

    // Log delivery creation
    await supabase.from('file_access_logs').insert({
      delivery_id: delivery.id,
      user_id: user.id,
      action: 'delivery_created',
      metadata: {
        accessType,
        requiresPayment,
        escrowEnabled,
        recipientCount: recipients.length,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      delivery: {
        id: delivery.id,
        accessUrl,
        expiresAt: delivery.expires_at,
        requiresPassword: !!passwordHash,
        requiresPayment,
        escrowEnabled
      }
    })
  } catch (error) {
    logger.error('Delivery creation error', { error })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create delivery'
      },
      { status: 500 }
    )
  }
}

/**
 * Get delivery details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deliveryId = searchParams.get('id')

    if (!deliveryId) {
      return NextResponse.json(
        { success: false, error: 'Delivery ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get delivery
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

    // Get recipients
    const { data: recipients } = await supabase
      .from('file_delivery_recipients')
      .select('*')
      .eq('delivery_id', deliveryId)

    // Check if user is owner
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const isOwner = user?.id === delivery.owner_id

    // Return appropriate data based on ownership
    if (isOwner) {
      return NextResponse.json({
        success: true,
        delivery: {
          ...delivery,
          recipients: recipients || []
        }
      })
    } else {
      // Public view - hide sensitive data
      return NextResponse.json({
        success: true,
        delivery: {
          id: delivery.id,
          file_name: delivery.file_name,
          file_size: delivery.file_size,
          file_type: delivery.file_type,
          access_type: delivery.access_type,
          requires_payment: delivery.requires_payment,
          payment_amount: delivery.payment_amount,
          expires_at: delivery.expires_at,
          status: delivery.status,
          max_downloads: delivery.max_downloads,
          download_count: delivery.download_count
        }
      })
    }
  } catch (error) {
    logger.error('Get delivery error', { error })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get delivery'
      },
      { status: 500 }
    )
  }
}
