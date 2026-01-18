import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('FilesAPI')

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

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

    const supabase = getSupabase()

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
      await supabase.rpc('decrement_folder_count', { folder_id: previousFolderId }).catch(() => {})
    }
    await supabase.rpc('increment_folder_count', { folder_id: folderId }).catch(() => {})

    return NextResponse.json({
      success: true,
      fileId,
      previousFolderId,
      newFolderId: folderId,
      file: updatedFile,
      message: 'File moved successfully'
    })
  } catch (error: any) {
    logger.error('File move failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to move file' },
      { status: 500 }
    )
  }
}
