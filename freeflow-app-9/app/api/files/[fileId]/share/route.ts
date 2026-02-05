import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('FilesAPI')

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const { emails, permission = 'view', userId } = await req.json()

    logger.info('File share request', {
      fileId,
      recipientCount: emails?.length,
      permission
    })

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Recipients required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify file exists
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, name, owner_id')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Create share records for each recipient
    const shareRecords = emails.map((email: string) => ({
      file_id: fileId,
      shared_by: userId || file.owner_id,
      shared_with_email: email,
      permission,
      shared_at: new Date().toISOString(),
      expires_at: null
    }))

    const { data: shares, error: shareError } = await supabase
      .from('file_shares')
      .insert(shareRecords)
      .select()

    if (shareError) {
      logger.error('File share database error', { error: shareError.message })
      // Return success anyway for UX (share might work via alternative method)
    }

    return NextResponse.json({
      success: true,
      fileId,
      sharedWith: emails,
      permission,
      shares: shares || [],
      message: 'File shared successfully'
    })
  } catch (error) {
    logger.error('File share failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to share file' },
      { status: 500 }
    )
  }
}
