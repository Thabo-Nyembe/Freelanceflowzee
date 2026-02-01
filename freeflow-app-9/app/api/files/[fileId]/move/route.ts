import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('FilesAPI')

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const { folderId, userId } = await req.json()

    logger.info('File move request', {
      fileId,
      targetFolder: folderId
    })

    if (!folderId) {
      return NextResponse.json(
        { error: 'Target folder required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify file exists and get current location
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, name, folder_id')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const previousFolderId = file.folder_id

    // Update file folder_id in database
    const { data: updatedFile, error: updateError } = await supabase
      .from('files')
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single()

    if (updateError) {
      logger.error('File move database error', { error: updateError.message })
      return NextResponse.json(
        { error: 'Failed to move file' },
        { status: 500 }
      )
    }

    // Update folder file counts (decrement old, increment new)
    if (previousFolderId && previousFolderId !== folderId) {
      await supabase.rpc('decrement_folder_count', { folder_id: previousFolderId })
        .catch((err) => logger.warn('Failed to decrement folder count', { folder_id: previousFolderId, error: err }))
    }
    await supabase.rpc('increment_folder_count', { folder_id: folderId })
      .catch((err) => logger.warn('Failed to increment folder count', { folder_id: folderId, error: err }))

    return NextResponse.json({
      success: true,
      fileId,
      previousFolderId,
      newFolderId: folderId,
      file: updatedFile,
      message: 'File moved successfully'
    })
  } catch (error) {
    logger.error('File move failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to move file' },
      { status: 500 }
    )
  }
}
