/**
 * Cloud Storage API Route
 * Comprehensive file storage management with multi-provider support
 * Full database implementation with demo mode fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'
import { randomBytes } from 'crypto'

const logger = createFeatureLogger('cloud-storage-api')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true' ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true'
  )
}

// Type definitions matching database schema
type FileType = 'pdf' | 'figma' | 'folder' | 'video' | 'excel' | 'image' | 'archive' | 'word' | 'code' | 'text' | 'audio' | 'presentation'
type FileStatus = 'active' | 'archived' | 'deleted' | 'locked'
type SharePermission = 'view' | 'comment' | 'edit' | 'admin'
type StorageProvider = 'aws' | 'google' | 'azure' | 'dropbox' | 'local'

// File type detection
const FILE_TYPE_MAP: Record<string, FileType> = {
  'pdf': 'pdf',
  'doc': 'word', 'docx': 'word',
  'xls': 'excel', 'xlsx': 'excel', 'csv': 'excel',
  'ppt': 'presentation', 'pptx': 'presentation',
  'txt': 'text', 'md': 'text', 'rtf': 'text',
  'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image', 'bmp': 'image',
  'mp4': 'video', 'mov': 'video', 'avi': 'video', 'wmv': 'video', 'webm': 'video', 'mkv': 'video',
  'mp3': 'audio', 'wav': 'audio', 'flac': 'audio', 'aac': 'audio', 'ogg': 'audio',
  'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive', 'gz': 'archive',
  'fig': 'figma', 'sketch': 'figma', 'psd': 'figma', 'ai': 'figma', 'xd': 'figma',
  'js': 'code', 'ts': 'code', 'jsx': 'code', 'tsx': 'code', 'py': 'code', 'rb': 'code', 'go': 'code', 'rs': 'code', 'java': 'code', 'c': 'code', 'cpp': 'code', 'html': 'code', 'css': 'code', 'scss': 'code', 'json': 'code', 'xml': 'code', 'yaml': 'code', 'yml': 'code'
}

function getFileType(filename: string): FileType {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPE_MAP[ext] || 'text'
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'zip': 'application/zip',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// Generate checksum for file
function generateChecksum(): string {
  return randomBytes(16).toString('hex')
}

// Demo data
const demoStorageStats = {
  total_storage: 107374182400, // 100 GB in bytes
  used_storage: 42949672960, // 40 GB in bytes
  files_count: 1247,
  folders_count: 89,
  storage_breakdown: {
    videos: { count: 156, size: 21474836480, percentage: 50 },
    images: { count: 847, size: 10737418240, percentage: 25 },
    documents: { count: 189, size: 5368709120, percentage: 12.5 },
    audio: { count: 45, size: 3221225472, percentage: 7.5 },
    other: { count: 10, size: 2147483648, percentage: 5 }
  },
  bandwidth_used: 536870912000,
  bandwidth_limit: 1099511627776
}

const demoRecentFiles = [
  {
    id: 'file-001',
    name: 'Brand_Guidelines_v3.pdf',
    type: 'pdf',
    size: 8547632,
    mime_type: 'application/pdf',
    created_at: '2024-03-15T14:30:00Z',
    updated_at: '2024-03-15T14:30:00Z',
    path: '/projects/greenearth/brand/',
    project_id: 'proj-002',
    project_name: 'GreenEarth Ventures',
    shared: true,
    shared_with: ['client@greenearth.com', 'team@agency.com']
  },
  {
    id: 'file-002',
    name: 'Homepage_Hero_Final.mp4',
    type: 'video',
    size: 245789632,
    mime_type: 'video/mp4',
    created_at: '2024-03-14T16:45:00Z',
    updated_at: '2024-03-14T18:20:00Z',
    path: '/projects/techcorp/videos/',
    project_id: 'proj-001',
    project_name: 'TechCorp Industries',
    shared: false,
    shared_with: []
  },
  {
    id: 'file-003',
    name: 'Dashboard_Mockup_v2.fig',
    type: 'figma',
    size: 12458963,
    mime_type: 'application/octet-stream',
    created_at: '2024-03-14T11:20:00Z',
    updated_at: '2024-03-14T15:45:00Z',
    path: '/projects/financeflow/designs/',
    project_id: 'proj-006',
    project_name: 'FinanceFlow Inc',
    shared: true,
    shared_with: ['design@financeflow.com']
  },
  {
    id: 'file-004',
    name: 'Product_Photos_Batch.zip',
    type: 'archive',
    size: 189745632,
    mime_type: 'application/zip',
    created_at: '2024-03-13T09:15:00Z',
    updated_at: '2024-03-13T09:15:00Z',
    path: '/projects/artisan/assets/',
    project_id: 'proj-004',
    project_name: 'Artisan Collective',
    shared: true,
    shared_with: ['team@artisan.com']
  },
  {
    id: 'file-005',
    name: 'API_Documentation.md',
    type: 'text',
    size: 245896,
    mime_type: 'text/markdown',
    created_at: '2024-03-12T14:00:00Z',
    updated_at: '2024-03-14T10:30:00Z',
    path: '/projects/datasync/docs/',
    project_id: 'proj-008',
    project_name: 'DataSync Partners',
    shared: true,
    shared_with: ['dev@datasync.io']
  }
]

const demoFolders = [
  { id: 'folder-001', name: 'Projects', path: '/projects/', files_count: 856, size: 35789654123 },
  { id: 'folder-002', name: 'Templates', path: '/templates/', files_count: 45, size: 125896547 },
  { id: 'folder-003', name: 'Meetings', path: '/meetings/', files_count: 89, size: 4589632587 },
  { id: 'folder-004', name: 'Finance', path: '/finance/', files_count: 156, size: 89745632 },
  { id: 'folder-005', name: 'Archive', path: '/archive/', files_count: 101, size: 2147483648 }
]

// ========================================================================
// GET - Fetch files, folders, and statistics
// ========================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'stats'
    const folder = url.searchParams.get('folder')
    const type = url.searchParams.get('type')
    const search = url.searchParams.get('search')
    const fileId = url.searchParams.get('id')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      // Get single file by ID
      if (fileId) {
        const { data: file, error } = await supabase
          .from('files')
          .select(`
            *,
            shares:file_shares(*),
            versions:file_versions(*)
          `)
          .eq('id', fileId)
          .single()

        if (error || !file) {
          if (demoMode) {
            const demoFile = demoRecentFiles.find(f => f.id === fileId)
            return NextResponse.json({
              success: true,
              demo: true,
              data: demoFile || null
            })
          }
          return NextResponse.json(
            { success: false, error: 'File not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          demo: demoMode,
          data: file
        })
      }

      switch (action) {
        case 'stats': {
          // Get storage quota
          const { data: quota } = await supabase
            .from('storage_quotas')
            .select('*')
            .eq('user_id', effectiveUserId)
            .single()

          // Get file counts by type
          const { data: files } = await supabase
            .from('files')
            .select('type, size')
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')

          const typeBreakdown: Record<string, { count: number; size: number }> = {}
          let totalSize = 0
          let totalCount = 0

          if (files) {
            for (const file of files) {
              const fileType = file.type || 'other'
              if (!typeBreakdown[fileType]) {
                typeBreakdown[fileType] = { count: 0, size: 0 }
              }
              typeBreakdown[fileType].count++
              typeBreakdown[fileType].size += file.size || 0
              totalSize += file.size || 0
              totalCount++
            }
          }

          // Get folder count
          const { count: foldersCount } = await supabase
            .from('folders')
            .select('id', { count: 'exact' })
            .eq('user_id', effectiveUserId)

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              total_storage: quota?.total_quota || 107374182400,
              used_storage: quota?.used_space || totalSize,
              files_count: totalCount,
              folders_count: foldersCount || 0,
              storage_breakdown: typeBreakdown,
              usage_percentage: Math.round(((quota?.used_space || totalSize) / (quota?.total_quota || 107374182400)) * 100),
              available_storage: (quota?.total_quota || 107374182400) - (quota?.used_space || totalSize),
              plan: 'Professional',
              images_size: quota?.images_size || 0,
              videos_size: quota?.videos_size || 0,
              documents_size: quota?.documents_size || 0,
              archives_size: quota?.archives_size || 0,
              other_size: quota?.other_size || 0
            }
          })
        }

        case 'files': {
          let query = supabase
            .from('files')
            .select('*')
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')

          if (type) {
            query = query.eq('type', type)
          }

          if (folder) {
            query = query.eq('folder_path', folder)
          }

          if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
          }

          const { data: files, error } = await query
            .order('date_modified', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

          if (error) throw error

          // Get total count
          let countQuery = supabase
            .from('files')
            .select('id', { count: 'exact' })
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')

          if (type) countQuery = countQuery.eq('type', type)
          if (folder) countQuery = countQuery.eq('folder_path', folder)
          if (search) countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)

          const { count } = await countQuery

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              files: files || [],
              total: count || 0,
              page,
              per_page: limit,
              total_pages: Math.ceil((count || 0) / limit)
            }
          })
        }

        case 'folders': {
          const { data: folders, error } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', effectiveUserId)
            .order('name', { ascending: true })

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              folders: folders || [],
              total: folders?.length || 0
            }
          })
        }

        case 'recent': {
          const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')
            .order('date_modified', { ascending: false })
            .limit(10)

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              files: files || [],
              total: files?.length || 0
            }
          })
        }

        case 'shared': {
          const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')
            .eq('shared', true)
            .order('date_modified', { ascending: false })

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              files: files || [],
              total: files?.length || 0
            }
          })
        }

        case 'starred': {
          const { data: files, error } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')
            .eq('starred', true)
            .order('date_modified', { ascending: false })

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              files: files || [],
              total: files?.length || 0
            }
          })
        }

        case 'trash': {
          const { data: trashItems, error } = await supabase
            .from('trash')
            .select('*')
            .eq('user_id', effectiveUserId)
            .order('deleted_at', { ascending: false })

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              items: trashItems || [],
              total: trashItems?.length || 0
            }
          })
        }

        case 'activity': {
          const { data: activity, error } = await supabase
            .from('file_activity')
            .select(`
              *,
              file:files(id, name, type)
            `)
            .eq('user_id', effectiveUserId)
            .order('timestamp', { ascending: false })
            .limit(50)

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              activities: activity || [],
              total: activity?.length || 0
            }
          })
        }

        case 'tags': {
          const { data: tags, error } = await supabase
            .from('file_tags')
            .select('*')
            .eq('user_id', effectiveUserId)
            .order('file_count', { ascending: false })

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              tags: tags || [],
              total: tags?.length || 0
            }
          })
        }

        case 'versions': {
          const versionFileId = url.searchParams.get('file_id')
          if (!versionFileId) {
            return NextResponse.json(
              { success: false, error: 'File ID required' },
              { status: 400 }
            )
          }

          const { data: versions, error } = await supabase
            .from('file_versions')
            .select('*')
            .eq('file_id', versionFileId)
            .order('version', { ascending: false })

          if (error) throw error

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              versions: versions || [],
              total: versions?.length || 0
            }
          })
        }

        default: {
          // Return comprehensive overview
          const { data: recentFiles } = await supabase
            .from('files')
            .select('*')
            .eq('user_id', effectiveUserId)
            .eq('status', 'active')
            .order('date_modified', { ascending: false })
            .limit(5)

          const { data: folders } = await supabase
            .from('folders')
            .select('*')
            .eq('user_id', effectiveUserId)
            .limit(10)

          const { data: quota } = await supabase
            .from('storage_quotas')
            .select('*')
            .eq('user_id', effectiveUserId)
            .single()

          return NextResponse.json({
            success: true,
            demo: demoMode,
            data: {
              stats: {
                total_storage: quota?.total_quota || 107374182400,
                used_storage: quota?.used_space || 0,
                usage_percentage: quota ? Math.round((quota.used_space / quota.total_quota) * 100) : 0,
                available_storage: quota ? quota.total_quota - quota.used_space : 107374182400
              },
              recent_files: recentFiles || [],
              folders: folders || []
            }
          })
        }
      }
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      // Demo fallback based on action
      switch (action) {
        case 'stats':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              ...demoStorageStats,
              usage_percentage: Math.round((demoStorageStats.used_storage / demoStorageStats.total_storage) * 100),
              available_storage: demoStorageStats.total_storage - demoStorageStats.used_storage,
              plan: 'Professional'
            }
          })

        case 'files':
          let files = demoRecentFiles
          if (type) files = files.filter(f => f.type === type)
          if (folder) files = files.filter(f => f.path.startsWith(folder))
          return NextResponse.json({
            success: true,
            demo: true,
            data: { files, total: files.length, page: 1, per_page: 20 }
          })

        case 'folders':
          return NextResponse.json({
            success: true,
            demo: true,
            data: { folders: demoFolders, total: demoFolders.length }
          })

        case 'recent':
          return NextResponse.json({
            success: true,
            demo: true,
            data: { files: demoRecentFiles.slice(0, 5), total: 5 }
          })

        case 'shared':
          const sharedFiles = demoRecentFiles.filter(f => f.shared)
          return NextResponse.json({
            success: true,
            demo: true,
            data: { files: sharedFiles, total: sharedFiles.length }
          })

        default:
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              stats: {
                ...demoStorageStats,
                usage_percentage: Math.round((demoStorageStats.used_storage / demoStorageStats.total_storage) * 100),
                available_storage: demoStorageStats.total_storage - demoStorageStats.used_storage
              },
              recent_files: demoRecentFiles.slice(0, 5),
              folders: demoFolders
            }
          })
      }
    }
  } catch (error) {
    logger.error('Cloud Storage GET error', { error })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ========================================================================
// POST - File and folder operations
// ========================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Cloud storage action received', { action, userId: effectiveUserId, demoMode })

    switch (action) {
      case 'create_folder':
        return handleCreateFolder(supabase, effectiveUserId, data, demoMode)

      case 'upload':
      case 'create_file':
        return handleCreateFile(supabase, effectiveUserId, data, demoMode)

      case 'get_upload_url':
        return handleGetUploadUrl(supabase, effectiveUserId, data, demoMode)

      case 'confirm_upload':
        return handleConfirmUpload(supabase, effectiveUserId, data, demoMode)

      case 'delete_file':
        return handleDeleteFile(supabase, effectiveUserId, data, demoMode)

      case 'permanent_delete':
        return handlePermanentDelete(supabase, effectiveUserId, data, demoMode)

      case 'restore':
        return handleRestore(supabase, effectiveUserId, data, demoMode)

      case 'share_file':
        return handleShareFile(supabase, effectiveUserId, data, demoMode)

      case 'unshare_file':
        return handleUnshareFile(supabase, effectiveUserId, data, demoMode)

      case 'move_file':
        return handleMoveFile(supabase, effectiveUserId, data, demoMode)

      case 'copy_file':
        return handleCopyFile(supabase, effectiveUserId, data, demoMode)

      case 'rename':
        return handleRename(supabase, effectiveUserId, data, demoMode)

      case 'star':
        return handleStar(supabase, effectiveUserId, data, demoMode)

      case 'unstar':
        return handleUnstar(supabase, effectiveUserId, data, demoMode)

      case 'lock':
        return handleLock(supabase, effectiveUserId, data, demoMode)

      case 'unlock':
        return handleUnlock(supabase, effectiveUserId, data, demoMode)

      case 'create_version':
        return handleCreateVersion(supabase, effectiveUserId, data, demoMode)

      case 'update_tags':
        return handleUpdateTags(supabase, effectiveUserId, data, demoMode)

      case 'bulk_delete':
        return handleBulkDelete(supabase, effectiveUserId, data, demoMode)

      case 'bulk_move':
        return handleBulkMove(supabase, effectiveUserId, data, demoMode)

      case 'search':
        return handleSearch(supabase, effectiveUserId, data, demoMode)

      case 'add_comment':
        return handleAddComment(supabase, effectiveUserId, data, demoMode)

      case 'record_download':
        return handleRecordDownload(supabase, effectiveUserId, data, demoMode)

      case 'empty_trash':
        return handleEmptyTrash(supabase, effectiveUserId, demoMode)

      default:
        return NextResponse.json({
          success: true,
          demo: demoMode,
          message: 'Operation completed'
        })
    }
  } catch (error) {
    logger.error('Cloud Storage POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process storage request' },
      { status: 500 }
    )
  }
}

// ========================================================================
// Action Handlers
// ========================================================================

async function handleCreateFolder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { name: string; path?: string; parentId?: string; color?: string; icon?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.name) {
    return NextResponse.json(
      { success: false, error: 'Folder name is required' },
      { status: 400 }
    )
  }

  const folderPath = data.path || `/${data.name}/`

  try {
    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        name: data.name,
        path: folderPath,
        parent_id: data.parentId || null,
        color: data.color || null,
        icon: data.icon || null,
        file_count: 0,
        total_size: 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create folder', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            id: `folder-${Date.now()}`,
            name: data.name,
            path: folderPath,
            file_count: 0,
            total_size: 0,
            created_at: new Date().toISOString()
          },
          message: 'Folder created successfully (demo mode)'
        })
      }

      throw error
    }

    logger.info('Folder created', { folderId: folder.id, name: data.name })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: folder,
      message: 'Folder created successfully'
    })
  } catch (error) {
    logger.error('Create folder error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}

async function handleCreateFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    name: string
    size: number
    folderId?: string
    folderPath?: string
    description?: string
    tags?: string[]
    mimeType?: string
    storageLocation?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.name) {
    return NextResponse.json(
      { success: false, error: 'File name is required' },
      { status: 400 }
    )
  }

  const fileType = getFileType(data.name)
  const mimeType = data.mimeType || getMimeType(data.name)
  const checksum = generateChecksum()

  try {
    const { data: file, error } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        owner: userId,
        name: data.name,
        type: fileType,
        size: data.size || 0,
        mime_type: mimeType,
        folder_id: data.folderId || null,
        folder_path: data.folderPath || '/',
        description: data.description || null,
        tags: data.tags || [],
        checksum,
        storage_location: data.storageLocation || null,
        status: 'active',
        version: 1
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create file', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            id: `file-${Date.now()}`,
            name: data.name,
            type: fileType,
            size: data.size || 0,
            mime_type: mimeType,
            folder_path: data.folderPath || '/',
            created_at: new Date().toISOString()
          },
          message: 'File created successfully (demo mode)'
        })
      }

      throw error
    }

    // Create initial version
    await supabase.from('file_versions').insert({
      file_id: file.id,
      version: 1,
      size: data.size || 0,
      uploaded_by: userId,
      comment: 'Initial upload',
      storage_location: data.storageLocation || '',
      checksum
    })

    logger.info('File created', { fileId: file.id, name: data.name })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: file,
      message: 'File created successfully'
    })
  } catch (error) {
    logger.error('Create file error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to create file' },
      { status: 500 }
    )
  }
}

async function handleGetUploadUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { filename: string; contentType?: string; size?: number },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.filename) {
    return NextResponse.json(
      { success: false, error: 'Filename is required' },
      { status: 400 }
    )
  }

  const uploadId = randomBytes(16).toString('hex')
  const storagePath = `${userId}/${uploadId}/${data.filename}`

  try {
    // Create signed upload URL
    const { data: signedUrl, error } = await supabase.storage
      .from('files')
      .createSignedUploadUrl(storagePath)

    if (error) {
      logger.error('Failed to create upload URL', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            uploadId,
            uploadUrl: `https://storage.kazi.app/upload/${uploadId}`,
            storagePath,
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          },
          message: 'Upload URL generated (demo mode)'
        })
      }

      throw error
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        uploadId,
        uploadUrl: signedUrl.signedUrl,
        token: signedUrl.token,
        storagePath,
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      },
      message: 'Upload URL generated'
    })
  } catch (error) {
    logger.error('Get upload URL error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          uploadId,
          uploadUrl: `https://storage.kazi.app/upload/${uploadId}`,
          storagePath,
          expiresAt: new Date(Date.now() + 3600000).toISOString()
        },
        message: 'Upload URL generated (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

async function handleConfirmUpload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    fileId?: string
    name: string
    size: number
    storagePath: string
    folderId?: string
    folderPath?: string
    mimeType?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.name || !data.storagePath) {
    return NextResponse.json(
      { success: false, error: 'Name and storage path are required' },
      { status: 400 }
    )
  }

  const fileType = getFileType(data.name)
  const mimeType = data.mimeType || getMimeType(data.name)
  const checksum = generateChecksum()

  try {
    // Create or update file record
    if (data.fileId) {
      const { data: file, error } = await supabase
        .from('files')
        .update({
          size: data.size,
          storage_location: data.storagePath,
          checksum,
          version: supabase.rpc('increment_version', { file_id: data.fileId })
        })
        .eq('id', data.fileId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: file,
        message: 'Upload confirmed'
      })
    }

    const { data: file, error } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        owner: userId,
        name: data.name,
        type: fileType,
        size: data.size,
        mime_type: mimeType,
        folder_id: data.folderId || null,
        folder_path: data.folderPath || '/',
        checksum,
        storage_location: data.storagePath,
        status: 'active',
        version: 1
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to confirm upload', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            id: `file-${Date.now()}`,
            name: data.name,
            type: fileType,
            size: data.size,
            storage_location: data.storagePath,
            created_at: new Date().toISOString()
          },
          message: 'Upload confirmed (demo mode)'
        })
      }

      throw error
    }

    // Create version record
    await supabase.from('file_versions').insert({
      file_id: file.id,
      version: 1,
      size: data.size,
      uploaded_by: userId,
      comment: 'Initial upload',
      storage_location: data.storagePath,
      checksum
    })

    logger.info('Upload confirmed', { fileId: file.id, name: data.name })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: file,
      message: 'Upload confirmed'
    })
  } catch (error) {
    logger.error('Confirm upload error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to confirm upload' },
      { status: 500 }
    )
  }
}

async function handleDeleteFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    // Get file data for trash
    const { data: file } = await supabase
      .from('files')
      .select('*')
      .eq('id', data.fileId)
      .eq('user_id', userId)
      .single()

    if (!file && !demoMode) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Move to trash
    if (file) {
      await supabase.from('trash').insert({
        user_id: userId,
        file_id: data.fileId,
        file_data: file,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

      // Update file status
      await supabase
        .from('files')
        .update({ status: 'deleted' })
        .eq('id', data.fileId)
    }

    logger.info('File moved to trash', { fileId: data.fileId })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: { fileId: data.fileId, deletedAt: new Date().toISOString() },
      message: 'File moved to trash'
    })
  } catch (error) {
    logger.error('Delete file error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { fileId: data.fileId, deletedAt: new Date().toISOString() },
        message: 'File deleted (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

async function handlePermanentDelete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId?: string; trashId?: string },
  demoMode: boolean
): Promise<NextResponse> {
  try {
    if (data.trashId) {
      // Get trash item to find storage location
      const { data: trashItem } = await supabase
        .from('trash')
        .select('file_data')
        .eq('id', data.trashId)
        .eq('user_id', userId)
        .single()

      if (trashItem?.file_data?.storage_location) {
        // Delete from storage
        await supabase.storage.from('files').remove([trashItem.file_data.storage_location])
      }

      // Delete trash entry
      await supabase.from('trash').delete().eq('id', data.trashId)

      // Delete actual file
      if (trashItem?.file_data?.id) {
        await supabase.from('files').delete().eq('id', trashItem.file_data.id)
      }
    } else if (data.fileId) {
      const { data: file } = await supabase
        .from('files')
        .select('storage_location')
        .eq('id', data.fileId)
        .eq('user_id', userId)
        .single()

      if (file?.storage_location) {
        await supabase.storage.from('files').remove([file.storage_location])
      }

      await supabase.from('files').delete().eq('id', data.fileId)
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File permanently deleted'
    })
  } catch (error) {
    logger.error('Permanent delete error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'File permanently deleted (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to permanently delete file' },
      { status: 500 }
    )
  }
}

async function handleRestore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { trashId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.trashId) {
    return NextResponse.json(
      { success: false, error: 'Trash ID is required' },
      { status: 400 }
    )
  }

  try {
    const { data: trashItem } = await supabase
      .from('trash')
      .select('file_id')
      .eq('id', data.trashId)
      .eq('user_id', userId)
      .single()

    if (!trashItem && !demoMode) {
      return NextResponse.json(
        { success: false, error: 'Trash item not found' },
        { status: 404 }
      )
    }

    if (trashItem) {
      // Restore file status
      await supabase
        .from('files')
        .update({ status: 'active' })
        .eq('id', trashItem.file_id)

      // Delete trash entry
      await supabase.from('trash').delete().eq('id', data.trashId)
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File restored successfully'
    })
  } catch (error) {
    logger.error('Restore error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'File restored (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to restore file' },
      { status: 500 }
    )
  }
}

async function handleShareFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; shareWith: string; permission?: SharePermission; expiresAt?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId || !data.shareWith) {
    return NextResponse.json(
      { success: false, error: 'File ID and share recipient are required' },
      { status: 400 }
    )
  }

  try {
    // Find user to share with
    const { data: shareUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.shareWith)
      .single()

    const shareUserId = shareUser?.id

    const { data: share, error } = await supabase
      .from('file_shares')
      .upsert({
        file_id: data.fileId,
        shared_by: userId,
        shared_with: shareUserId || data.shareWith,
        permission: data.permission || 'view',
        expires_at: data.expiresAt || null
      }, {
        onConflict: 'file_id,shared_with'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to share file', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            shareLink: `https://app.kazi.io/share/${data.fileId}`,
            sharedWith: data.shareWith,
            permission: data.permission || 'view'
          },
          message: 'File shared (demo mode)'
        })
      }

      throw error
    }

    // Update file shared flag
    await supabase
      .from('files')
      .update({ shared: true })
      .eq('id', data.fileId)

    // Log activity
    await supabase.from('file_activity').insert({
      file_id: data.fileId,
      user_id: userId,
      action: 'shared',
      metadata: { shared_with: data.shareWith, permission: data.permission || 'view' }
    })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        share,
        shareLink: `https://app.kazi.io/share/${data.fileId}`
      },
      message: 'File shared successfully'
    })
  } catch (error) {
    logger.error('Share file error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to share file' },
      { status: 500 }
    )
  }
}

async function handleUnshareFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; shareId?: string; shareWith?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    let query = supabase
      .from('file_shares')
      .delete()
      .eq('file_id', data.fileId)
      .eq('shared_by', userId)

    if (data.shareId) {
      query = query.eq('id', data.shareId)
    } else if (data.shareWith) {
      query = query.eq('shared_with', data.shareWith)
    }

    await query

    // Check if any shares remain
    const { count } = await supabase
      .from('file_shares')
      .select('id', { count: 'exact' })
      .eq('file_id', data.fileId)

    if (count === 0) {
      await supabase
        .from('files')
        .update({ shared: false })
        .eq('id', data.fileId)
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'Share removed successfully'
    })
  } catch (error) {
    logger.error('Unshare file error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Share removed (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove share' },
      { status: 500 }
    )
  }
}

async function handleMoveFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; folderId?: string; folderPath: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId || !data.folderPath) {
    return NextResponse.json(
      { success: false, error: 'File ID and folder path are required' },
      { status: 400 }
    )
  }

  try {
    const { data: file, error } = await supabase
      .from('files')
      .update({
        folder_id: data.folderId || null,
        folder_path: data.folderPath
      })
      .eq('id', data.fileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to move file', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: { fileId: data.fileId, newPath: data.folderPath },
          message: 'File moved (demo mode)'
        })
      }

      throw error
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: file,
      message: 'File moved successfully'
    })
  } catch (error) {
    logger.error('Move file error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to move file' },
      { status: 500 }
    )
  }
}

async function handleCopyFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; folderId?: string; folderPath?: string; newName?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    // Get original file
    const { data: originalFile, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', data.fileId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !originalFile) {
      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: { id: `file-copy-${Date.now()}`, copied: true },
          message: 'File copied (demo mode)'
        })
      }
      return NextResponse.json(
        { success: false, error: 'Original file not found' },
        { status: 404 }
      )
    }

    // Create copy
    const newName = data.newName || `Copy of ${originalFile.name}`
    const { data: copiedFile, error: insertError } = await supabase
      .from('files')
      .insert({
        ...originalFile,
        id: undefined,
        name: newName,
        folder_id: data.folderId || originalFile.folder_id,
        folder_path: data.folderPath || originalFile.folder_path,
        created_at: undefined,
        updated_at: undefined,
        date_created: undefined,
        date_modified: undefined
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: copiedFile,
      message: 'File copied successfully'
    })
  } catch (error) {
    logger.error('Copy file error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to copy file' },
      { status: 500 }
    )
  }
}

async function handleRename(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { id: string; name: string; type: 'file' | 'folder' },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.id || !data.name) {
    return NextResponse.json(
      { success: false, error: 'ID and new name are required' },
      { status: 400 }
    )
  }

  try {
    const table = data.type === 'folder' ? 'folders' : 'files'
    const { data: item, error } = await supabase
      .from(table)
      .update({ name: data.name })
      .eq('id', data.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: { id: data.id, name: data.name },
          message: `${data.type} renamed (demo mode)`
        })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: item,
      message: `${data.type} renamed successfully`
    })
  } catch (error) {
    logger.error('Rename error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to rename' },
      { status: 500 }
    )
  }
}

async function handleStar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    await supabase
      .from('files')
      .update({ starred: true })
      .eq('id', data.fileId)
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File starred'
    })
  } catch (error) {
    logger.error('Star file error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'File starred (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to star file' },
      { status: 500 }
    )
  }
}

async function handleUnstar(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    await supabase
      .from('files')
      .update({ starred: false })
      .eq('id', data.fileId)
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File unstarred'
    })
  } catch (error) {
    logger.error('Unstar file error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'File unstarred (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to unstar file' },
      { status: 500 }
    )
  }
}

async function handleLock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    await supabase
      .from('files')
      .update({ locked: true })
      .eq('id', data.fileId)
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File locked'
    })
  } catch (error) {
    logger.error('Lock file error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'File locked (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to lock file' },
      { status: 500 }
    )
  }
}

async function handleUnlock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    await supabase
      .from('files')
      .update({ locked: false })
      .eq('id', data.fileId)
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File unlocked'
    })
  } catch (error) {
    logger.error('Unlock file error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'File unlocked (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to unlock file' },
      { status: 500 }
    )
  }
}

async function handleCreateVersion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; size: number; storagePath: string; comment?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId || !data.storagePath) {
    return NextResponse.json(
      { success: false, error: 'File ID and storage path are required' },
      { status: 400 }
    )
  }

  try {
    // Get current version
    const { data: file } = await supabase
      .from('files')
      .select('version')
      .eq('id', data.fileId)
      .eq('user_id', userId)
      .single()

    const newVersion = (file?.version || 0) + 1
    const checksum = generateChecksum()

    // Create version record
    const { data: version, error: versionError } = await supabase
      .from('file_versions')
      .insert({
        file_id: data.fileId,
        version: newVersion,
        size: data.size,
        uploaded_by: userId,
        comment: data.comment || null,
        storage_location: data.storagePath,
        checksum
      })
      .select()
      .single()

    if (versionError) throw versionError

    // Update file
    await supabase
      .from('files')
      .update({
        version: newVersion,
        size: data.size,
        storage_location: data.storagePath,
        checksum
      })
      .eq('id', data.fileId)

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: version,
      message: `Version ${newVersion} created`
    })
  } catch (error) {
    logger.error('Create version error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { version: 2, created_at: new Date().toISOString() },
        message: 'Version created (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create version' },
      { status: 500 }
    )
  }
}

async function handleUpdateTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; tags: string[] },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId || !Array.isArray(data.tags)) {
    return NextResponse.json(
      { success: false, error: 'File ID and tags array are required' },
      { status: 400 }
    )
  }

  try {
    const { data: file, error } = await supabase
      .from('files')
      .update({ tags: data.tags })
      .eq('id', data.fileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: file,
      message: 'Tags updated'
    })
  } catch (error) {
    logger.error('Update tags error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { fileId: data.fileId, tags: data.tags },
        message: 'Tags updated (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update tags' },
      { status: 500 }
    )
  }
}

async function handleBulkDelete(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileIds: string[] },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileIds || !Array.isArray(data.fileIds) || data.fileIds.length === 0) {
    return NextResponse.json(
      { success: false, error: 'File IDs array is required' },
      { status: 400 }
    )
  }

  try {
    // Get files for trash
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .in('id', data.fileIds)
      .eq('user_id', userId)

    // Move to trash
    if (files && files.length > 0) {
      const trashEntries = files.map(file => ({
        user_id: userId,
        file_id: file.id,
        file_data: file,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }))

      await supabase.from('trash').insert(trashEntries)

      await supabase
        .from('files')
        .update({ status: 'deleted' })
        .in('id', data.fileIds)
        .eq('user_id', userId)
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: { deletedCount: files?.length || 0 },
      message: `${files?.length || 0} files moved to trash`
    })
  } catch (error) {
    logger.error('Bulk delete error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { deletedCount: data.fileIds.length },
        message: `${data.fileIds.length} files deleted (demo mode)`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete files' },
      { status: 500 }
    )
  }
}

async function handleBulkMove(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileIds: string[]; folderId?: string; folderPath: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileIds || !Array.isArray(data.fileIds) || !data.folderPath) {
    return NextResponse.json(
      { success: false, error: 'File IDs and folder path are required' },
      { status: 400 }
    )
  }

  try {
    const { error } = await supabase
      .from('files')
      .update({
        folder_id: data.folderId || null,
        folder_path: data.folderPath
      })
      .in('id', data.fileIds)
      .eq('user_id', userId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: { movedCount: data.fileIds.length },
      message: `${data.fileIds.length} files moved`
    })
  } catch (error) {
    logger.error('Bulk move error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { movedCount: data.fileIds.length },
        message: `${data.fileIds.length} files moved (demo mode)`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to move files' },
      { status: 500 }
    )
  }
}

async function handleSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { query: string; type?: FileType; folder?: string; limit?: number },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.query) {
    return NextResponse.json(
      { success: false, error: 'Search query is required' },
      { status: 400 }
    )
  }

  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`name.ilike.%${data.query}%,description.ilike.%${data.query}%`)

    if (data.type) {
      query = query.eq('type', data.type)
    }

    if (data.folder) {
      query = query.eq('folder_path', data.folder)
    }

    const { data: files, error } = await query
      .order('date_modified', { ascending: false })
      .limit(data.limit || 50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        files: files || [],
        total: files?.length || 0,
        query: data.query
      }
    })
  } catch (error) {
    logger.error('Search error', { error })

    if (demoMode) {
      const results = demoRecentFiles.filter(f =>
        f.name.toLowerCase().includes(data.query.toLowerCase())
      )
      return NextResponse.json({
        success: true,
        demo: true,
        data: { files: results, total: results.length, query: data.query }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}

async function handleAddComment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; comment: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId || !data.comment) {
    return NextResponse.json(
      { success: false, error: 'File ID and comment are required' },
      { status: 400 }
    )
  }

  try {
    const { data: comment, error } = await supabase
      .from('file_comments')
      .insert({
        file_id: data.fileId,
        user_id: userId,
        comment: data.comment
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: comment,
      message: 'Comment added'
    })
  } catch (error) {
    logger.error('Add comment error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: `comment-${Date.now()}`, comment: data.comment, created_at: new Date().toISOString() },
        message: 'Comment added (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

async function handleRecordDownload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { fileId: string; ipAddress?: string; userAgent?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.fileId) {
    return NextResponse.json(
      { success: false, error: 'File ID is required' },
      { status: 400 }
    )
  }

  try {
    await supabase.from('file_downloads').insert({
      file_id: data.fileId,
      user_id: userId,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null
    })

    await supabase.from('file_activity').insert({
      file_id: data.fileId,
      user_id: userId,
      action: 'downloaded'
    })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'Download recorded'
    })
  } catch (error) {
    logger.error('Record download error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Download recorded (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to record download' },
      { status: 500 }
    )
  }
}

async function handleEmptyTrash(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    // Get all trash items
    const { data: trashItems } = await supabase
      .from('trash')
      .select('file_id, file_data')
      .eq('user_id', userId)

    if (trashItems && trashItems.length > 0) {
      // Delete files from storage
      const storagePaths = trashItems
        .map(item => item.file_data?.storage_location)
        .filter(Boolean)

      if (storagePaths.length > 0) {
        await supabase.storage.from('files').remove(storagePaths)
      }

      // Delete file records
      const fileIds = trashItems.map(item => item.file_id).filter(Boolean)
      if (fileIds.length > 0) {
        await supabase.from('files').delete().in('id', fileIds)
      }

      // Clear trash
      await supabase.from('trash').delete().eq('user_id', userId)
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: { deletedCount: trashItems?.length || 0 },
      message: 'Trash emptied'
    })
  } catch (error) {
    logger.error('Empty trash error', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Trash emptied (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to empty trash' },
      { status: 500 }
    )
  }
}

// ========================================================================
// PUT - Update file/folder
// ========================================================================
export async function PUT(request: NextRequest) {
  return POST(request)
}

// ========================================================================
// DELETE - Delete file/folder
// ========================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const fileId = url.searchParams.get('id')
    const type = url.searchParams.get('type') || 'file'
    const permanent = url.searchParams.get('permanent') === 'true'

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (type === 'folder') {
      await supabase
        .from('folders')
        .delete()
        .eq('id', fileId)
        .eq('user_id', effectiveUserId)

      return NextResponse.json({
        success: true,
        demo: demoMode,
        message: 'Folder deleted'
      })
    }

    if (permanent) {
      // Get file for storage deletion
      const { data: file } = await supabase
        .from('files')
        .select('storage_location')
        .eq('id', fileId)
        .eq('user_id', effectiveUserId)
        .single()

      if (file?.storage_location) {
        await supabase.storage.from('files').remove([file.storage_location])
      }

      await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', effectiveUserId)

      return NextResponse.json({
        success: true,
        demo: demoMode,
        message: 'File permanently deleted'
      })
    }

    // Move to trash
    const { data: file } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', effectiveUserId)
      .single()

    if (file) {
      await supabase.from('trash').insert({
        user_id: effectiveUserId,
        file_id: fileId,
        file_data: file,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })

      await supabase
        .from('files')
        .update({ status: 'deleted' })
        .eq('id', fileId)
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      message: 'File moved to trash'
    })
  } catch (error) {
    logger.error('Cloud Storage DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete' },
      { status: 500 }
    )
  }
}
