/**
 * File List API - Get user's files or collection files
 *
 * GET /api/files/list
 *
 * Query parameters:
 * - collectionId: Get files from specific collection
 * - ownerId: Get files from specific user
 * - limit: Number of files to return
 * - offset: Pagination offset
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('files-list')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')
    const ownerId = searchParams.get('ownerId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()

    // Get current user
    const {
      data: { user }
    } = await supabase.auth.getUser()

    let query

    if (collectionId) {
      // Get files from collection
      const { data: collectionFiles, error: collectionError } = await supabase
        .from('collection_files')
        .select(
          `
          delivery_id,
          display_order,
          secure_file_deliveries (*)
        `
        )
        .eq('collection_id', collectionId)
        .order('display_order', { ascending: true })
        .range(offset, offset + limit - 1)

      if (collectionError) {
        throw new Error(`Failed to fetch collection files: ${collectionError.message}`)
      }

      const files = collectionFiles
        .map((cf: any) => cf.secure_file_deliveries)
        .filter(Boolean)

      return NextResponse.json({
        success: true,
        files,
        total: files.length
      })
    } else if (ownerId) {
      // Get files from specific user
      const { data: files, error } = await supabase
        .from('secure_file_deliveries')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error(`Failed to fetch user files: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        files,
        total: files.length
      })
    } else if (user) {
      // Get current user's files
      const { data: files, error } = await supabase
        .from('secure_file_deliveries')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw new Error(`Failed to fetch files: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        files,
        total: files.length
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
  } catch (error) {
    logger.error('File list error', { error })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch files'
      },
      { status: 500 }
    )
  }
}
