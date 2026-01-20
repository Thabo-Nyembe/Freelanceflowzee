import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

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
  } catch (error: any) {
    logger.error('File download failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
