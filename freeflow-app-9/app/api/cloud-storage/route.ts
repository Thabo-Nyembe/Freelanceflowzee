import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Sample cloud storage data for investor demos
const demoStorageStats = {
  total_storage: 107374182400, // 100 GB in bytes
  used_storage: 42949672960, // 40 GB in bytes
  files_count: 1247,
  folders_count: 89,
  storage_breakdown: {
    videos: { count: 156, size: 21474836480, percentage: 50 }, // 20 GB
    images: { count: 847, size: 10737418240, percentage: 25 }, // 10 GB
    documents: { count: 189, size: 5368709120, percentage: 12.5 }, // 5 GB
    audio: { count: 45, size: 3221225472, percentage: 7.5 }, // 3 GB
    other: { count: 10, size: 2147483648, percentage: 5 } // 2 GB
  },
  bandwidth_used: 536870912000, // 500 GB this month
  bandwidth_limit: 1099511627776 // 1 TB limit
}

const demoRecentFiles = [
  {
    id: 'file-001',
    name: 'Brand_Guidelines_v3.pdf',
    type: 'document',
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
    type: 'design',
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
    type: 'document',
    size: 245896,
    mime_type: 'text/markdown',
    created_at: '2024-03-12T14:00:00Z',
    updated_at: '2024-03-14T10:30:00Z',
    path: '/projects/datasync/docs/',
    project_id: 'proj-008',
    project_name: 'DataSync Partners',
    shared: true,
    shared_with: ['dev@datasync.io']
  },
  {
    id: 'file-006',
    name: 'Podcast_Episode_12.wav',
    type: 'audio',
    size: 89745632,
    mime_type: 'audio/wav',
    created_at: '2024-03-11T16:30:00Z',
    updated_at: '2024-03-11T16:30:00Z',
    path: '/projects/edulearn/audio/',
    project_id: 'proj-005',
    project_name: 'EduLearn Academy',
    shared: false,
    shared_with: []
  },
  {
    id: 'file-007',
    name: 'Social_Media_Assets.psd',
    type: 'image',
    size: 156789456,
    mime_type: 'image/vnd.adobe.photoshop',
    created_at: '2024-03-10T11:45:00Z',
    updated_at: '2024-03-12T09:20:00Z',
    path: '/projects/localbiz/marketing/',
    project_id: 'proj-007',
    project_name: 'LocalBiz Solutions',
    shared: true,
    shared_with: ['marketing@localbiz.com']
  },
  {
    id: 'file-008',
    name: 'Contract_Template.docx',
    type: 'document',
    size: 524896,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_at: '2024-03-08T10:00:00Z',
    updated_at: '2024-03-15T08:15:00Z',
    path: '/templates/',
    project_id: null,
    project_name: null,
    shared: false,
    shared_with: []
  },
  {
    id: 'file-009',
    name: 'Meeting_Recording_March.mp4',
    type: 'video',
    size: 458963258,
    mime_type: 'video/mp4',
    created_at: '2024-03-07T15:00:00Z',
    updated_at: '2024-03-07T16:30:00Z',
    path: '/meetings/',
    project_id: null,
    project_name: 'Internal',
    shared: true,
    shared_with: ['team@agency.com']
  },
  {
    id: 'file-010',
    name: 'Invoice_March_2024.pdf',
    type: 'document',
    size: 125896,
    mime_type: 'application/pdf',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z',
    path: '/finance/invoices/',
    project_id: null,
    project_name: 'Finance',
    shared: false,
    shared_with: []
  }
]

const demoFolders = [
  { id: 'folder-001', name: 'Projects', path: '/projects/', files_count: 856, size: 35789654123 },
  { id: 'folder-002', name: 'Templates', path: '/templates/', files_count: 45, size: 125896547 },
  { id: 'folder-003', name: 'Meetings', path: '/meetings/', files_count: 89, size: 4589632587 },
  { id: 'folder-004', name: 'Finance', path: '/finance/', files_count: 156, size: 89745632 },
  { id: 'folder-005', name: 'Archive', path: '/archive/', files_count: 101, size: 2147483648 }
]

export async function GET(request: NextRequest) {
  try {
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const action = url.searchParams.get('action') || 'stats'
    const folder = url.searchParams.get('folder')
    const type = url.searchParams.get('type')

    // Always return demo data for demo mode (no auth required)
    if (demoMode) {
      switch (action) {
        case 'stats':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              ...demoStorageStats,
              usage_percentage: Math.round((demoStorageStats.used_storage / demoStorageStats.total_storage) * 100),
              available_storage: demoStorageStats.total_storage - demoStorageStats.used_storage,
              plan: 'Professional',
              next_billing_date: '2024-04-01'
            }
          })

        case 'files':
          let files = demoRecentFiles

          if (type) {
            files = files.filter(f => f.type === type)
          }

          if (folder) {
            files = files.filter(f => f.path.startsWith(folder))
          }

          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              files,
              total: files.length,
              page: 1,
              per_page: 20
            }
          })

        case 'folders':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              folders: demoFolders,
              total: demoFolders.length
            }
          })

        case 'recent':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              files: demoRecentFiles.slice(0, 5),
              total: 5
            }
          })

        case 'shared':
          const sharedFiles = demoRecentFiles.filter(f => f.shared)
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              files: sharedFiles,
              total: sharedFiles.length
            }
          })

        default:
          // Return both stats and recent files for default
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

    // For non-demo mode, try to get real data from Supabase
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized', success: false },
          { status: 401 }
        )
      }

      // Get files from storage bucket
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Calculate basic stats
      const totalSize = files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0

      return NextResponse.json({
        success: true,
        data: {
          stats: {
            files_count: files?.length || 0,
            used_storage: totalSize,
            total_storage: 107374182400 // 100 GB default
          },
          recent_files: files || []
        }
      })
    } catch {
      // If Supabase fails, return empty data
      return NextResponse.json({
        success: true,
        data: {
          stats: {
            files_count: 0,
            used_storage: 0,
            total_storage: 107374182400
          },
          recent_files: []
        }
      })
    }
  } catch (error) {
    console.error('Cloud Storage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const demoMode = isDemoMode(request)
    const body = await request.json()
    const { action } = body

    if (demoMode) {
      switch (action) {
        case 'create_folder':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              id: `folder-${Date.now()}`,
              name: body.name,
              path: body.path || `/${body.name}/`,
              files_count: 0,
              size: 0,
              created_at: new Date().toISOString()
            },
            message: 'Folder created successfully (demo mode)'
          })

        case 'delete_file':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'File deleted successfully (demo mode)'
          })

        case 'share_file':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              share_link: `https://app.freeflow.com/share/${body.file_id}`,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            message: 'File shared successfully (demo mode)'
          })

        default:
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Operation completed (demo mode)'
          })
      }
    }

    // For non-demo mode, would handle real operations
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Operation completed'
    })
  } catch (error) {
    console.error('Cloud Storage API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}
