import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('GuestUpload:Upload')

/**
 * POST /api/guest-upload/upload
 *
 * Handles file upload after payment confirmation
 * For demo purposes, payment verification is simplified
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadLink = formData.get('uploadLink') as string

    if (!file || !uploadLink) {
      return NextResponse.json(
        { error: 'File and upload link are required' },
        { status: 400 }
      )
    }

    logger.info('File upload request', {
      fileName: file.name,
      fileSize: file.size,
      uploadLink
    })

    // Verify upload record exists
    const supabase = await createClient()
    const { data: payment, error: fetchError } = await supabase
      .from('guest_upload_payments')
      .select('*')
      .eq('upload_link', uploadLink)
      .single()

    if (fetchError || !payment) {
      logger.error('Upload link not found', { uploadLink })
      return NextResponse.json(
        { error: 'Invalid upload link' },
        { status: 404 }
      )
    }

    // Check if already uploaded
    if (payment.file_id) {
      return NextResponse.json(
        { error: 'File already uploaded for this link' },
        { status: 400 }
      )
    }

    // Check if free tier (auto-completed) or needs payment
    const isFree = payment.payment_amount === 0

    if (!isFree) {
      // Paid tier: Verify payment status
      // In production, check Stripe payment status here
      if (payment.payment_status !== 'completed') {
        // For demo: Auto-complete paid uploads
        // In production: return error if payment not completed
        await supabase
          .from('guest_upload_payments')
          .update({ payment_status: 'completed' })
          .eq('id', payment.id)
      }
    }
    // Free tier: Already marked as completed in create endpoint

    // Check expiration
    if (new Date(payment.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Upload link has expired' },
        { status: 410 }
      )
    }

    // Verify file size matches payment
    const sizeDiff = Math.abs(file.size - payment.file_size)
    const sizeTolerance = payment.file_size * 0.1 // 10% tolerance
    if (sizeDiff > sizeTolerance) {
      logger.warn('File size mismatch', {
        expected: payment.file_size,
        actual: file.size,
        diff: sizeDiff
      })
      return NextResponse.json(
        { error: 'File size does not match the paid amount' },
        { status: 400 }
      )
    }

    // Upload file to storage
    const buffer = Buffer.from(await file.arrayBuffer())

    // Use multi-cloud storage
    const { MultiCloudStorage } = await import('@/lib/storage/multi-cloud-storage')
    const storage = new MultiCloudStorage()

    const uploadedFile = await storage.uploadFile(
      buffer,
      file.name,
      file.type,
      {
        folder: 'guest-uploads',
        isPublic: false,
        metadata: {
          uploadLink: payment.upload_link,
          email: payment.email,
          paidAmount: payment.payment_amount.toString(),
          guestUpload: true
        }
      }
    )

    logger.info('File uploaded successfully', {
      fileId: uploadedFile.id,
      provider: uploadedFile.provider
    })

    // Update payment record with file ID
    await supabase
      .from('guest_upload_payments')
      .update({
        file_id: uploadedFile.id,
        metadata: {
          ...payment.metadata,
          file_uploaded_at: new Date().toISOString(),
          storage_provider: uploadedFile.provider
        }
      })
      .eq('id', payment.id)

    // Generate shareable download link
    const downloadLink = `${request.headers.get('origin')}/guest-download/${payment.upload_link}`

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      downloadLink,
      uploadLink: payment.upload_link,
      expiresAt: payment.expires_at,
      maxDownloads: payment.max_downloads,
      fileId: uploadedFile.id
    })

  } catch (error) {
    logger.error('File upload failed', { error: error.message, stack: error.stack })
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
