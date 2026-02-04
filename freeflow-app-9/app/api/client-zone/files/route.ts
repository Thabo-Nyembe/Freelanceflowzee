/**
 * Client Zone Files API Route
 * Full CRUD operations for client project files
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'
import { randomBytes } from 'crypto'

const logger = createSimpleLogger('client-zone-files-api')

// Demo mode check
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'
}

// File type categories
const FILE_TYPE_MAP: Record<string, string> = {
  // Documents
  'pdf': 'document',
  'doc': 'document',
  'docx': 'document',
  'txt': 'document',
  'rtf': 'document',
  // Spreadsheets
  'xls': 'spreadsheet',
  'xlsx': 'spreadsheet',
  'csv': 'spreadsheet',
  // Presentations
  'ppt': 'presentation',
  'pptx': 'presentation',
  'key': 'presentation',
  // Images
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'svg': 'image',
  'webp': 'image',
  // Videos
  'mp4': 'video',
  'mov': 'video',
  'avi': 'video',
  'webm': 'video',
  // Audio
  'mp3': 'audio',
  'wav': 'audio',
  'ogg': 'audio',
  // Design
  'fig': 'design',
  'sketch': 'design',
  'psd': 'design',
  'ai': 'design',
  'xd': 'design',
  // Archives
  'zip': 'archive',
  'rar': 'archive',
  'tar': 'archive',
  'gz': 'archive',
  // Code
  'js': 'code',
  'ts': 'code',
  'jsx': 'code',
  'tsx': 'code',
  'html': 'code',
  'css': 'code',
  'json': 'code',
  'py': 'code',
  'rb': 'code',
  'go': 'code',
  'rs': 'code',
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPE_MAP[ext] || 'other'
}

interface ClientFile {
  id: string
  project_id: string
  uploaded_by: string
  name: string
  original_name: string
  file_type: string
  file_size: number
  mime_type: string | null
  storage_path: string
  storage_bucket: string
  description: string | null
  tags: string[]
  version: number
  is_public: boolean
  download_count: number
  created_at: string
  updated_at: string
}

// Demo data
const demoFiles: ClientFile[] = [
  {
    id: 'file-001',
    project_id: 'proj-001',
    uploaded_by: DEMO_USER_ID,
    name: 'design-mockup.fig',
    original_name: 'design-mockup.fig',
    file_type: 'design',
    file_size: 2500000,
    mime_type: 'application/octet-stream',
    storage_path: 'projects/proj-001/design-mockup.fig',
    storage_bucket: 'client-files',
    description: 'Main design mockup for website redesign',
    tags: ['design', 'mockup', 'figma'],
    version: 2,
    is_public: false,
    download_count: 5,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'file-002',
    project_id: 'proj-001',
    uploaded_by: DEMO_USER_ID,
    name: 'brand-guide.pdf',
    original_name: 'brand-guide.pdf',
    file_type: 'document',
    file_size: 1200000,
    mime_type: 'application/pdf',
    storage_path: 'projects/proj-001/brand-guide.pdf',
    storage_bucket: 'client-files',
    description: 'Brand guidelines document',
    tags: ['brand', 'guidelines', 'document'],
    version: 1,
    is_public: false,
    download_count: 3,
    created_at: '2024-01-14T14:00:00Z',
    updated_at: '2024-01-14T14:00:00Z'
  },
  {
    id: 'file-003',
    project_id: 'proj-001',
    uploaded_by: 'client-001',
    name: 'logo-final.png',
    original_name: 'logo-final.png',
    file_type: 'image',
    file_size: 450000,
    mime_type: 'image/png',
    storage_path: 'projects/proj-001/logo-final.png',
    storage_bucket: 'client-files',
    description: 'Final approved logo',
    tags: ['logo', 'branding', 'approved'],
    version: 1,
    is_public: true,
    download_count: 12,
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-13T09:00:00Z'
  },
  {
    id: 'file-004',
    project_id: 'proj-002',
    uploaded_by: DEMO_USER_ID,
    name: 'app-wireframes.fig',
    original_name: 'app-wireframes.fig',
    file_type: 'design',
    file_size: 3200000,
    mime_type: 'application/octet-stream',
    storage_path: 'projects/proj-002/app-wireframes.fig',
    storage_bucket: 'client-files',
    description: 'Mobile app wireframes',
    tags: ['mobile', 'wireframes', 'design'],
    version: 1,
    is_public: false,
    download_count: 2,
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-12T11:00:00Z'
  }
]

/**
 * GET /api/client-zone/files
 * Retrieves files for a project or all projects
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    const projectId = searchParams.get('project_id')
    const fileType = searchParams.get('file_type')
    const uploadedBy = searchParams.get('uploaded_by')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Fetching client zone files', { userId, projectId, fileId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Single file fetch
      if (fileId) {
        const { data: file, error } = await supabase
          .from('client_files')
          .select(`
            *,
            uploader:uploaded_by(id, email, full_name, avatar_url),
            project:project_id(id, name, user_id, client_id)
          `)
          .eq('id', fileId)
          .single()

        if (error) throw error

        if (!file) {
          return NextResponse.json(
            { success: false, error: 'File not found' },
            { status: 404 }
          )
        }

        // Verify access
        const project = file.project as { id: string; name: string; user_id: string; client_id: string }
        if (project.user_id !== userId && project.client_id !== userId && !file.is_public) {
          return NextResponse.json(
            { success: false, error: 'Not authorized to view this file' },
            { status: 403 }
          )
        }

        // Generate download URL if needed
        let downloadUrl = null
        if (file.storage_path) {
          const { data: urlData } = await supabase.storage
            .from(file.storage_bucket)
            .createSignedUrl(file.storage_path, 3600) // 1 hour expiry

          downloadUrl = urlData?.signedUrl
        }

        return NextResponse.json({
          success: true,
          data: {
            ...file,
            downloadUrl
          }
        })
      }

      // Get user's accessible projects
      const { data: accessibleProjects } = await supabase
        .from('client_projects')
        .select('id')
        .or(`user_id.eq.${userId},client_id.eq.${userId}`)

      const projectIds = accessibleProjects?.map(p => p.id) || []

      if (projectIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, limit, offset, hasMore: false }
        })
      }

      // Build query
      let query = supabase
        .from('client_files')
        .select(`
          *,
          uploader:uploaded_by(id, email, full_name, avatar_url),
          project:project_id(id, name)
        `, { count: 'exact' })
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })

      // Apply filters
      if (projectId) {
        if (!projectIds.includes(projectId)) {
          return NextResponse.json(
            { success: false, error: 'Not authorized to view files in this project' },
            { status: 403 }
          )
        }
        query = query.eq('project_id', projectId)
      }

      if (fileType) {
        query = query.eq('file_type', fileType)
      }

      if (uploadedBy) {
        query = query.eq('uploaded_by', uploadedBy)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data: files, error, count } = await query

      if (error) throw error

      // Get storage stats
      const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0

      // Count by type
      const typeStats: Record<string, number> = {}
      for (const file of files || []) {
        typeStats[file.file_type] = (typeStats[file.file_type] || 0) + 1
      }

      return NextResponse.json({
        success: true,
        data: files || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        },
        stats: {
          totalFiles: count || 0,
          totalSize,
          byType: typeStats
        }
      })
    } catch (dbError) {
      logger.warn('Database error, using demo data', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      if (fileId) {
        const file = demoFiles.find(f => f.id === fileId)
        if (!file) {
          return NextResponse.json(
            { success: false, error: 'File not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          data: {
            ...file,
            downloadUrl: `/demo/files/${file.name}`
          }
        })
      }

      let filteredFiles = [...demoFiles]

      if (projectId) {
        filteredFiles = filteredFiles.filter(f => f.project_id === projectId)
      }

      if (fileType) {
        filteredFiles = filteredFiles.filter(f => f.file_type === fileType)
      }

      if (uploadedBy) {
        filteredFiles = filteredFiles.filter(f => f.uploaded_by === uploadedBy)
      }

      if (search) {
        const searchLower = search.toLowerCase()
        filteredFiles = filteredFiles.filter(
          f => f.name.toLowerCase().includes(searchLower) ||
               f.description?.toLowerCase().includes(searchLower)
        )
      }

      const paginatedFiles = filteredFiles.slice(offset, offset + limit)
      const totalSize = filteredFiles.reduce((sum, f) => sum + f.file_size, 0)

      const typeStats: Record<string, number> = {}
      for (const file of filteredFiles) {
        typeStats[file.file_type] = (typeStats[file.file_type] || 0) + 1
      }

      return NextResponse.json({
        success: true,
        data: paginatedFiles,
        pagination: {
          total: filteredFiles.length,
          limit,
          offset,
          hasMore: filteredFiles.length > offset + limit
        },
        stats: {
          totalFiles: filteredFiles.length,
          totalSize,
          byType: typeStats
        }
      })
    }
  } catch (error) {
    logger.error('Error fetching files', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client-zone/files
 * Upload a new file or perform file actions
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      return handleFileUpload(request)
    }

    // Handle JSON actions
    const body = await request.json()
    const { action = 'create-metadata', ...data } = body

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Client zone files action', { action, userId })

    switch (action) {
      case 'create-metadata':
        return handleCreateMetadata(userId, data)
      case 'get-upload-url':
        return handleGetUploadUrl(userId, data)
      case 'confirm-upload':
        return handleConfirmUpload(userId, data)
      case 'create-version':
        return handleCreateVersion(userId, data)
      case 'share':
        return handleShareFile(userId, data)
      case 'unshare':
        return handleUnshareFile(userId, data)
      case 'move':
        return handleMoveFile(userId, data)
      case 'copy':
        return handleCopyFile(userId, data)
      case 'increment-download':
        return handleIncrementDownload(userId, data)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Error in files action', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process file action' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/client-zone/files
 * Update file metadata
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'File ID required' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Updating file', { fileId: id, userId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify ownership
      const { data: file, error: fetchError } = await supabase
        .from('client_files')
        .select('uploaded_by, project:project_id(user_id)')
        .eq('id', id)
        .single()

      if (fetchError || !file) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        )
      }

      const project = file.project as { user_id: string }
      const canEdit = file.uploaded_by === userId || project.user_id === userId

      if (!canEdit) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to update this file' },
          { status: 403 }
        )
      }

      // Filter allowed fields
      const allowedFields = ['name', 'description', 'tags', 'is_public']
      const filteredData: Record<string, unknown> = {}
      for (const key of Object.keys(updateData)) {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key]
        }
      }
      filteredData.updated_at = new Date().toISOString()

      const { data: updatedFile, error } = await supabase
        .from('client_files')
        .update(filteredData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: updatedFile,
        message: 'File updated successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const fileIndex = demoFiles.findIndex(f => f.id === id)
      if (fileIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        )
      }

      const updatedFile = {
        ...demoFiles[fileIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: updatedFile,
        message: 'File updated successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error updating file', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/client-zone/files
 * Delete a file
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID required' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Deleting file', { fileId, userId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify ownership
      const { data: file, error: fetchError } = await supabase
        .from('client_files')
        .select('uploaded_by, storage_path, storage_bucket, project:project_id(user_id)')
        .eq('id', fileId)
        .single()

      if (fetchError || !file) {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        )
      }

      const project = file.project as { user_id: string }
      const canDelete = file.uploaded_by === userId || project.user_id === userId

      if (!canDelete) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to delete this file' },
          { status: 403 }
        )
      }

      // Delete from storage
      if (file.storage_path) {
        await supabase.storage
          .from(file.storage_bucket)
          .remove([file.storage_path])
      }

      // Delete metadata
      const { error } = await supabase
        .from('client_files')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        message: 'File deleted successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error deleting file', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleFileUpload(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('project_id') as string | null
    const description = formData.get('description') as string | null
    const tags = formData.get('tags') as string | null

    if (!file || !projectId) {
      return NextResponse.json(
        { success: false, error: 'File and project_id are required' },
        { status: 400 }
      )
    }

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify project access
      const { data: project, error: projectError } = await supabase
        .from('client_projects')
        .select('user_id, client_id')
        .eq('id', projectId)
        .single()

      if (projectError || !project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }

      if (project.user_id !== userId && project.client_id !== userId) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to upload to this project' },
          { status: 403 }
        )
      }

      // Generate unique filename
      const uniqueId = randomBytes(8).toString('hex')
      const extension = file.name.split('.').pop() || ''
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `projects/${projectId}/${uniqueId}-${safeName}`

      // Upload to storage
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('client-files')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) throw uploadError

      // Create file record
      const fileRecord = {
        project_id: projectId,
        uploaded_by: userId,
        name: file.name,
        original_name: file.name,
        file_type: getFileType(file.name),
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        storage_bucket: 'client-files',
        description: description || null,
        tags: tags ? JSON.parse(tags) : [],
        version: 1,
        is_public: false,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdFile, error } = await supabase
        .from('client_files')
        .insert(fileRecord)
        .select()
        .single()

      if (error) throw error

      // Notify other project participant
      const notifyUserId = project.user_id === userId ? project.client_id : project.user_id
      await supabase
        .from('client_notifications')
        .insert({
          user_id: notifyUserId,
          notification_type: 'new_file',
          title: 'New File Uploaded',
          message: `A new file "${file.name}" has been uploaded`,
          project_id: projectId,
          related_entity_type: 'file',
          related_entity_id: createdFile.id,
          action_url: `/client-zone/projects/${projectId}/files`
        })

      return NextResponse.json({
        success: true,
        data: createdFile,
        message: 'File uploaded successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const newFile: ClientFile = {
        id: `file-${Date.now()}`,
        project_id: projectId,
        uploaded_by: userId,
        name: file.name,
        original_name: file.name,
        file_type: getFileType(file.name),
        file_size: file.size,
        mime_type: file.type,
        storage_path: `projects/${projectId}/${file.name}`,
        storage_bucket: 'client-files',
        description: description || null,
        tags: tags ? JSON.parse(tags) : [],
        version: 1,
        is_public: false,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: newFile,
        message: 'File uploaded successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error uploading file', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

async function handleCreateMetadata(userId: string, data: Record<string, unknown>) {
  const {
    project_id,
    name,
    original_name,
    file_size,
    mime_type,
    storage_path,
    description,
    tags = []
  } = data as {
    project_id: string
    name: string
    original_name: string
    file_size: number
    mime_type?: string
    storage_path: string
    description?: string
    tags?: string[]
  }

  if (!project_id || !name || !storage_path) {
    return NextResponse.json(
      { success: false, error: 'Project ID, name, and storage_path are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify project access
    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .select('user_id, client_id')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.user_id !== userId && project.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const fileRecord = {
      project_id,
      uploaded_by: userId,
      name,
      original_name: original_name || name,
      file_type: getFileType(name),
      file_size: file_size || 0,
      mime_type: mime_type || null,
      storage_path,
      storage_bucket: 'client-files',
      description: description || null,
      tags,
      version: 1,
      is_public: false,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdFile, error } = await supabase
      .from('client_files')
      .insert(fileRecord)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: createdFile,
      message: 'File metadata created successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    const newFile: ClientFile = {
      id: `file-${Date.now()}`,
      project_id: project_id as string,
      uploaded_by: userId,
      name: name as string,
      original_name: (original_name as string) || name as string,
      file_type: getFileType(name as string),
      file_size: (file_size as number) || 0,
      mime_type: (mime_type as string) || null,
      storage_path: storage_path as string,
      storage_bucket: 'client-files',
      description: (description as string) || null,
      tags: (tags as string[]) || [],
      version: 1,
      is_public: false,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newFile,
      message: 'File metadata created successfully (demo)'
    })
  }
}

async function handleGetUploadUrl(userId: string, data: Record<string, unknown>) {
  const { project_id, filename, content_type } = data as {
    project_id: string
    filename: string
    content_type?: string
  }

  if (!project_id || !filename) {
    return NextResponse.json(
      { success: false, error: 'Project ID and filename are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify project access
    const { data: project, error: projectError } = await supabase
      .from('client_projects')
      .select('user_id, client_id')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.user_id !== userId && project.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Generate unique path
    const uniqueId = randomBytes(8).toString('hex')
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `projects/${project_id}/${uniqueId}-${safeName}`

    // Create signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('client-files')
      .createSignedUploadUrl(storagePath)

    if (uploadError) throw uploadError

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: uploadData.signedUrl,
        storagePath,
        token: uploadData.token
      }
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    // Demo fallback
    const uniqueId = randomBytes(8).toString('hex')
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `projects/${project_id}/${uniqueId}-${safeName}`

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: `/demo/upload/${storagePath}`,
        storagePath,
        token: 'demo-token'
      }
    })
  }
}

async function handleConfirmUpload(userId: string, data: Record<string, unknown>) {
  const { file_id, storage_path, file_size } = data as {
    file_id?: string
    storage_path: string
    file_size?: number
  }

  if (!storage_path) {
    return NextResponse.json(
      { success: false, error: 'Storage path is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    if (file_id) {
      // Update existing file record
      const { data: updatedFile, error } = await supabase
        .from('client_files')
        .update({
          file_size: file_size || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', file_id)
        .eq('uploaded_by', userId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: updatedFile,
        message: 'Upload confirmed'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Upload confirmed'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: 'Upload confirmed (demo)'
    })
  }
}

async function handleCreateVersion(userId: string, data: Record<string, unknown>) {
  const { file_id, storage_path, file_size } = data as {
    file_id: string
    storage_path: string
    file_size?: number
  }

  if (!file_id || !storage_path) {
    return NextResponse.json(
      { success: false, error: 'File ID and storage path are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get existing file
    const { data: existingFile, error: fetchError } = await supabase
      .from('client_files')
      .select('*, project:project_id(user_id)')
      .eq('id', file_id)
      .single()

    if (fetchError || !existingFile) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const project = existingFile.project as { user_id: string }
    if (existingFile.uploaded_by !== userId && project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Update file with new version
    const { data: updatedFile, error } = await supabase
      .from('client_files')
      .update({
        storage_path,
        file_size: file_size || existingFile.file_size,
        version: existingFile.version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', file_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedFile,
      message: `Version ${updatedFile.version} created`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: file_id, version: 2 },
      message: 'New version created (demo)'
    })
  }
}

async function handleShareFile(userId: string, data: Record<string, unknown>) {
  const { file_id } = data as { file_id: string }

  if (!file_id) {
    return NextResponse.json(
      { success: false, error: 'File ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: file, error: fetchError } = await supabase
      .from('client_files')
      .select('uploaded_by, project:project_id(user_id)')
      .eq('id', file_id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const project = file.project as { user_id: string }
    if (file.uploaded_by !== userId && project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const { data: updatedFile, error } = await supabase
      .from('client_files')
      .update({
        is_public: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', file_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedFile,
      message: 'File is now public'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: file_id, is_public: true },
      message: 'File is now public (demo)'
    })
  }
}

async function handleUnshareFile(userId: string, data: Record<string, unknown>) {
  const { file_id } = data as { file_id: string }

  if (!file_id) {
    return NextResponse.json(
      { success: false, error: 'File ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: file, error: fetchError } = await supabase
      .from('client_files')
      .select('uploaded_by, project:project_id(user_id)')
      .eq('id', file_id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const project = file.project as { user_id: string }
    if (file.uploaded_by !== userId && project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      )
    }

    const { data: updatedFile, error } = await supabase
      .from('client_files')
      .update({
        is_public: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', file_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedFile,
      message: 'File is now private'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: file_id, is_public: false },
      message: 'File is now private (demo)'
    })
  }
}

async function handleMoveFile(userId: string, data: Record<string, unknown>) {
  const { file_id, target_project_id } = data as {
    file_id: string
    target_project_id: string
  }

  if (!file_id || !target_project_id) {
    return NextResponse.json(
      { success: false, error: 'File ID and target project ID are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify file ownership
    const { data: file, error: fetchError } = await supabase
      .from('client_files')
      .select('uploaded_by, project:project_id(user_id)')
      .eq('id', file_id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const project = file.project as { user_id: string }
    if (file.uploaded_by !== userId && project.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to move this file' },
        { status: 403 }
      )
    }

    // Verify target project access
    const { data: targetProject, error: targetError } = await supabase
      .from('client_projects')
      .select('user_id, client_id')
      .eq('id', target_project_id)
      .single()

    if (targetError || !targetProject) {
      return NextResponse.json(
        { success: false, error: 'Target project not found' },
        { status: 404 }
      )
    }

    if (targetProject.user_id !== userId && targetProject.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to move to target project' },
        { status: 403 }
      )
    }

    const { data: updatedFile, error } = await supabase
      .from('client_files')
      .update({
        project_id: target_project_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', file_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedFile,
      message: 'File moved successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: file_id, project_id: target_project_id },
      message: 'File moved successfully (demo)'
    })
  }
}

async function handleCopyFile(userId: string, data: Record<string, unknown>) {
  const { file_id, target_project_id } = data as {
    file_id: string
    target_project_id: string
  }

  if (!file_id || !target_project_id) {
    return NextResponse.json(
      { success: false, error: 'File ID and target project ID are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get source file
    const { data: sourceFile, error: fetchError } = await supabase
      .from('client_files')
      .select('*, project:project_id(user_id, client_id)')
      .eq('id', file_id)
      .single()

    if (fetchError || !sourceFile) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const sourceProject = sourceFile.project as { user_id: string; client_id: string }
    if (sourceProject.user_id !== userId && sourceProject.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to copy this file' },
        { status: 403 }
      )
    }

    // Verify target project access
    const { data: targetProject, error: targetError } = await supabase
      .from('client_projects')
      .select('user_id, client_id')
      .eq('id', target_project_id)
      .single()

    if (targetError || !targetProject) {
      return NextResponse.json(
        { success: false, error: 'Target project not found' },
        { status: 404 }
      )
    }

    if (targetProject.user_id !== userId && targetProject.client_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to copy to target project' },
        { status: 403 }
      )
    }

    // Create new storage path
    const uniqueId = randomBytes(8).toString('hex')
    const newStoragePath = `projects/${target_project_id}/${uniqueId}-${sourceFile.name}`

    // Copy file in storage
    if (sourceFile.storage_path) {
      await supabase.storage
        .from(sourceFile.storage_bucket)
        .copy(sourceFile.storage_path, newStoragePath)
    }

    // Create new file record
    const newFile = {
      project_id: target_project_id,
      uploaded_by: userId,
      name: sourceFile.name,
      original_name: sourceFile.original_name,
      file_type: sourceFile.file_type,
      file_size: sourceFile.file_size,
      mime_type: sourceFile.mime_type,
      storage_path: newStoragePath,
      storage_bucket: sourceFile.storage_bucket,
      description: sourceFile.description,
      tags: sourceFile.tags,
      version: 1,
      is_public: false,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdFile, error } = await supabase
      .from('client_files')
      .insert(newFile)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: createdFile,
      message: 'File copied successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { id: `file-copy-${Date.now()}`, project_id: target_project_id },
      message: 'File copied successfully (demo)'
    })
  }
}

async function handleIncrementDownload(userId: string, data: Record<string, unknown>) {
  const { file_id } = data as { file_id: string }

  if (!file_id) {
    return NextResponse.json(
      { success: false, error: 'File ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current download count and increment
    const { data: file, error: fetchError } = await supabase
      .from('client_files')
      .select('download_count')
      .eq('id', file_id)
      .single()

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    const { data: updatedFile, error } = await supabase
      .from('client_files')
      .update({
        download_count: (file.download_count || 0) + 1
      })
      .eq('id', file_id)
      .select('download_count')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: { download_count: updatedFile.download_count }
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { download_count: 1 }
    })
  }
}
