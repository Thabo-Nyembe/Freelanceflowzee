import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('GuestUpload:Download')

/**
 * GET /api/guest-upload/download/[uploadLink]
 *
 * Provides download information and URL for guest uploads
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadLink: string }> }
) {
  try {
    const { uploadLink } = await params

    if (!uploadLink) {
      return NextResponse.json(
        { error: 'Upload link is required' },
        { status: 400 }
      )
    }

    logger.info('Download request received', { uploadLink })

    const supabase = await createClient()

    // Get upload record
    const { data: payment, error: fetchError } = await supabase
      .from('guest_upload_payments')
      .select('*')
      .eq('upload_link', uploadLink)
      .single()

    if (fetchError || !payment) {
      logger.warn('Upload link not found', { uploadLink })
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    // Check payment status
    if (payment.payment_status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 402 }
      )
    }

    // Check if file was uploaded
    if (!payment.file_id) {
      return NextResponse.json(
        { error: 'File not yet uploaded' },
        { status: 404 }
      )
    }

    // Check expiration
    if (new Date(payment.expires_at) < new Date()) {
      logger.info('Download link expired', { uploadLink, expiresAt: payment.expires_at })
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 410 }
      )
    }

    // Check download limit
    if (payment.download_count >= payment.max_downloads) {
      logger.info('Download limit reached', {
        uploadLink,
        downloadCount: payment.download_count,
        maxDownloads: payment.max_downloads
      })
      return NextResponse.json(
        { error: 'Maximum downloads reached' },
        { status: 403 }
      )
    }

    // Increment download count using database function
    const { error: incrementError } = await supabase.rpc('increment_guest_download', {
      link: uploadLink
    })

    if (incrementError) {
      logger.error('Failed to increment download count', { error: incrementError.message })
      // Don't fail the download, just log the error
    }

    // Get signed URL for download
    const { MultiCloudStorage } = await import('@/lib/storage/multi-cloud-storage')
    const storage = new MultiCloudStorage()

    const signedUrl = await storage.getSignedUrl(payment.file_id, 3600) // 1 hour

    logger.info('Download authorized', {
      uploadLink,
      fileId: payment.file_id,
      downloadCount: payment.download_count + 1
    })

    return NextResponse.json({
      success: true,
      downloadUrl: signedUrl,
      fileName: payment.file_name,
      fileSize: payment.file_size,
      remainingDownloads: payment.max_downloads - payment.download_count - 1,
      expiresAt: payment.expires_at
    })

  } catch (error) {
    logger.error('Download request failed', { error: error.message, stack: error.stack })
    return NextResponse.json(
      { error: error.message || 'Failed to process download request' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/guest-upload/download/[uploadLink]
 *
 * Alternative method for initiating download
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uploadLink: string }> }
) {
  // Reuse GET logic
  return GET(request, { params })
}
