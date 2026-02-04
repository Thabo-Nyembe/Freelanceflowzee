import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

const logger = createFeatureLogger('FilesAPI')

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params

    logger.info('File download request', { fileId })

    const supabase = await createClient()

    // Get file metadata from database
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, name, storage_path, mime_type, size, download_count')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for Supabase Storage download
    const storagePath = file.storage_path || `files/${fileId}`
    const { data: signedUrl, error: urlError } = await supabase
      .storage
      .from('files')
      .createSignedUrl(storagePath, 3600) // 1 hour expiry

    // Increment download counter
    await supabase
      .from('files')
      .update({
        download_count: (file.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', fileId)

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      mimeType: file.mime_type,
      size: file.size,
      downloadUrl: signedUrl?.signedUrl || `/api/files/${fileId}/content`,
      message: 'Download prepared'
    })
  } catch (error) {
    logger.error('File download failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
