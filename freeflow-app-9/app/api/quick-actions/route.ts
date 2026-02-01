/**
 * Quick Actions API
 * Handle common dashboard micro-actions with database persistence
 * Full implementation with demo mode fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'
import { randomBytes } from 'crypto'

const logger = createFeatureLogger('quick-actions-api')

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

type ActionType =
  | 'create-project'
  | 'create-folder'
  | 'send-message'
  | 'create-task'
  | 'bookmark-item'
  | 'share-file'
  | 'export-data'
  | 'generate-invoice'
  | 'schedule-meeting'
  | 'quick-note'

interface QuickActionRequest {
  action: ActionType
  data: Record<string, any>
}

interface QuickActionResponse {
  success: boolean
  action: ActionType
  result?: any
  message: string
  id?: string
  demo?: boolean
}

/**
 * POST - Handle quick actions with database persistence
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null
    let userName = 'User'

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
      userName = session.user.name || 'User'
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
      userName = 'Demo User'
    } else {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: QuickActionRequest = await request.json()

    if (!body.action) {
      return NextResponse.json({
        success: false,
        message: 'Action type is required'
      }, { status: 400 })
    }

    logger.info('Quick action received', { action: body.action, userId: effectiveUserId, demoMode })

    // Handle different action types
    switch (body.action) {
      case 'create-project':
        return handleCreateProject(supabase, effectiveUserId, userName, body.data, demoMode)

      case 'create-folder':
        return handleCreateFolder(supabase, effectiveUserId, body.data, demoMode)

      case 'send-message':
        return handleSendMessage(supabase, effectiveUserId, userName, body.data, demoMode)

      case 'create-task':
        return handleCreateTask(supabase, effectiveUserId, body.data, demoMode)

      case 'bookmark-item':
        return handleBookmarkItem(supabase, effectiveUserId, body.data, demoMode)

      case 'share-file':
        return handleShareFile(supabase, effectiveUserId, body.data, demoMode)

      case 'export-data':
        return handleExportData(supabase, effectiveUserId, body.data, demoMode)

      case 'generate-invoice':
        return handleGenerateInvoice(supabase, effectiveUserId, body.data, demoMode)

      case 'schedule-meeting':
        return handleScheduleMeeting(supabase, effectiveUserId, userName, body.data, demoMode)

      case 'quick-note':
        return handleQuickNote(supabase, effectiveUserId, body.data, demoMode)

      default:
        return NextResponse.json({
          success: false,
          message: `Unknown action: ${body.action}`
        }, { status: 400 })
    }

  } catch (error) {
    logger.error('Quick action error', { error: error.message })
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to process action'
    }, { status: 500 })
  }
}

/**
 * Create a new project
 */
async function handleCreateProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userName: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: data.title || 'Untitled Project',
        description: data.description || null,
        client_id: data.clientId || null,
        client_name: data.client || null,
        status: 'active',
        progress: 0,
        budget: data.budget || null,
        start_date: new Date().toISOString(),
        due_date: data.endDate || null,
        priority: data.priority || 'medium'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create project', { error })

      if (demoMode) {
        const mockId = `proj_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'create-project',
          result: {
            id: mockId,
            title: data.title || 'Untitled Project',
            description: data.description || '',
            status: 'active',
            progress: 0,
            createdAt: new Date().toISOString()
          },
          message: `Project created (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Project created via quick action', { projectId: project.id })

    return NextResponse.json({
      success: true,
      action: 'create-project',
      result: project,
      message: `Project "${project.name}" created successfully`,
      id: project.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Create project error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'create-project',
      message: error.message || 'Failed to create project'
    }, { status: 500 })
  }
}

/**
 * Create a new folder
 */
async function handleCreateFolder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const folderPath = data.parent === 'root' ? `/${data.name}/` : `${data.parent}${data.name}/`

    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        name: data.name || 'New Folder',
        path: folderPath,
        parent_id: data.parentId || null,
        color: data.color || null,
        file_count: 0,
        total_size: 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create folder', { error })

      if (demoMode) {
        const mockId = `folder_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'create-folder',
          result: {
            id: mockId,
            name: data.name || 'New Folder',
            path: folderPath,
            itemCount: 0,
            createdAt: new Date().toISOString()
          },
          message: `Folder created (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Folder created via quick action', { folderId: folder.id })

    return NextResponse.json({
      success: true,
      action: 'create-folder',
      result: folder,
      message: `Folder "${folder.name}" created successfully`,
      id: folder.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Create folder error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'create-folder',
      message: error.message || 'Failed to create folder'
    }, { status: 500 })
  }
}

/**
 * Send a message
 */
async function handleSendMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userName: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    // Try client_messages table first, fall back to messages
    const { data: message, error } = await supabase
      .from('client_messages')
      .insert({
        user_id: userId,
        sender_id: userId,
        sender_name: userName,
        recipient_email: data.to,
        subject: data.subject || null,
        content: data.body || '',
        message_type: 'text',
        status: 'sent',
        is_read: false
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send message', { error })

      if (demoMode) {
        const mockId = `msg_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'send-message',
          result: {
            id: mockId,
            to: data.to,
            subject: data.subject,
            body: data.body,
            sentAt: new Date().toISOString()
          },
          message: `Message sent (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Message sent via quick action', { messageId: message.id })

    return NextResponse.json({
      success: true,
      action: 'send-message',
      result: message,
      message: `Message sent to ${data.to}`,
      id: message.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Send message error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'send-message',
      message: error.message || 'Failed to send message'
    }, { status: 500 })
  }
}

/**
 * Create a task
 */
async function handleCreateTask(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: data.title || 'New Task',
        description: data.description || null,
        project_id: data.project || data.projectId || null,
        assigned_to: data.assignee === 'me' ? userId : data.assignee || null,
        priority: data.priority || 'medium',
        due_date: data.dueDate || null,
        status: 'todo'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create task', { error })

      if (demoMode) {
        const mockId = `task_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'create-task',
          result: {
            id: mockId,
            title: data.title || 'New Task',
            status: 'todo',
            priority: data.priority || 'medium',
            createdAt: new Date().toISOString()
          },
          message: `Task created (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Task created via quick action', { taskId: task.id })

    return NextResponse.json({
      success: true,
      action: 'create-task',
      result: task,
      message: `Task "${task.title}" created successfully`,
      id: task.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Create task error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'create-task',
      message: error.message || 'Failed to create task'
    }, { status: 500 })
  }
}

/**
 * Bookmark an item
 */
async function handleBookmarkItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        item_id: data.itemId,
        item_type: data.itemType || 'unknown',
        title: data.title || 'Untitled',
        url: data.url || null,
        tags: data.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create bookmark', { error })

      if (demoMode) {
        const mockId = `bookmark_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'bookmark-item',
          result: {
            id: mockId,
            itemId: data.itemId,
            itemType: data.itemType,
            title: data.title,
            createdAt: new Date().toISOString()
          },
          message: `Bookmarked (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Bookmark created via quick action', { bookmarkId: bookmark.id })

    return NextResponse.json({
      success: true,
      action: 'bookmark-item',
      result: bookmark,
      message: `Bookmarked "${bookmark.title}"`,
      id: bookmark.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Bookmark item error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'bookmark-item',
      message: error.message || 'Failed to bookmark item'
    }, { status: 500 })
  }
}

/**
 * Share a file
 */
async function handleShareFile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const shareId = randomBytes(16).toString('hex')
    const shareUrl = `https://kazi.app/share/${shareId}`

    const { data: share, error } = await supabase
      .from('file_shares')
      .insert({
        file_id: data.fileId,
        shared_by: userId,
        shared_with: data.sharedWith?.[0] || null,
        permission: data.permissions || 'view',
        expires_at: data.expiresAt || null
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to share file', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          action: 'share-file',
          result: {
            id: shareId,
            fileId: data.fileId,
            fileName: data.fileName,
            shareUrl,
            sharedWith: data.sharedWith || [],
            createdAt: new Date().toISOString()
          },
          message: `File shared (demo mode)`,
          id: shareId,
          demo: true
        })
      }

      throw error
    }

    // Update file shared flag
    await supabase
      .from('files')
      .update({ shared: true })
      .eq('id', data.fileId)

    logger.info('File shared via quick action', { shareId: share.id })

    return NextResponse.json({
      success: true,
      action: 'share-file',
      result: { ...share, shareUrl },
      message: `File "${data.fileName}" shared successfully`,
      id: share.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Share file error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'share-file',
      message: error.message || 'Failed to share file'
    }, { status: 500 })
  }
}

/**
 * Export data
 */
async function handleExportData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const exportId = randomBytes(8).toString('hex')

    const { data: exportJob, error } = await supabase
      .from('export_jobs')
      .insert({
        user_id: userId,
        export_type: data.type || 'csv',
        format: data.format || 'csv',
        date_range: data.dateRange || 'all',
        filters: data.filters || {},
        status: 'processing'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create export job', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          action: 'export-data',
          result: {
            id: exportId,
            type: data.type || 'csv',
            status: 'processing',
            estimatedCompletion: new Date(Date.now() + 30000).toISOString(),
            downloadUrl: null
          },
          message: `Export started (demo mode)`,
          id: exportId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Export job created via quick action', { exportId: exportJob.id })

    return NextResponse.json({
      success: true,
      action: 'export-data',
      result: {
        ...exportJob,
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(),
        downloadUrl: null
      },
      message: `Export started. You'll be notified when ready.`,
      id: exportJob.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Export data error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'export-data',
      message: error.message || 'Failed to start export'
    }, { status: 500 })
  }
}

/**
 * Generate an invoice
 */
async function handleGenerateInvoice(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    // Generate invoice number
    const { count } = await supabase
      .from('invoices')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(6, '0')}`

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        invoice_number: invoiceNumber,
        client_id: data.clientId || null,
        client_name: data.client || 'Unnamed Client',
        project_id: data.project || null,
        items: data.items || [],
        subtotal: data.subtotal || 0,
        tax_amount: data.tax || 0,
        total_amount: data.total || 0,
        due_date: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create invoice', { error })

      if (demoMode) {
        const mockId = `inv_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'generate-invoice',
          result: {
            id: mockId,
            invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
            client: data.client,
            total: data.total || 0,
            status: 'draft',
            createdAt: new Date().toISOString()
          },
          message: `Invoice generated (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Invoice created via quick action', { invoiceId: invoice.id })

    return NextResponse.json({
      success: true,
      action: 'generate-invoice',
      result: invoice,
      message: `Invoice ${invoice.invoice_number} generated successfully`,
      id: invoice.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Generate invoice error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'generate-invoice',
      message: error.message || 'Failed to generate invoice'
    }, { status: 500 })
  }
}

/**
 * Schedule a meeting
 */
async function handleScheduleMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userName: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const meetingId = randomBytes(8).toString('hex')
    const meetingLink = `https://meet.kazi.app/${meetingId}`
    const passcode = randomBytes(4).toString('hex').toUpperCase()

    // Parse date and time
    const startDateTime = new Date(data.startTime)
    const scheduledDate = startDateTime.toISOString().split('T')[0]
    const scheduledTime = startDateTime.toTimeString().split(' ')[0]

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        user_id: userId,
        title: data.title || 'New Meeting',
        description: data.description || null,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration: data.duration || 60,
        type: 'video',
        status: 'scheduled',
        host_id: userId,
        host_name: userName,
        max_participants: 25,
        meeting_link: meetingLink,
        passcode,
        recurrence: 'none'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule meeting', { error })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          action: 'schedule-meeting',
          result: {
            id: meetingId,
            title: data.title || 'New Meeting',
            startTime: data.startTime,
            duration: data.duration || 60,
            meetingUrl: meetingLink,
            createdAt: new Date().toISOString()
          },
          message: `Meeting scheduled (demo mode)`,
          id: meetingId,
          demo: true
        })
      }

      throw error
    }

    // Add participants if provided
    if (data.participants && data.participants.length > 0) {
      const participantInserts = data.participants.map((p: any) => ({
        meeting_id: meeting.id,
        name: p.name || p.email,
        email: p.email,
        role: 'participant',
        is_host: false
      }))

      await supabase.from('meeting_participants').insert(participantInserts)
    }

    logger.info('Meeting scheduled via quick action', { meetingId: meeting.id })

    return NextResponse.json({
      success: true,
      action: 'schedule-meeting',
      result: { ...meeting, passcode },
      message: `Meeting "${meeting.title}" scheduled successfully`,
      id: meeting.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Schedule meeting error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'schedule-meeting',
      message: error.message || 'Failed to schedule meeting'
    }, { status: 500 })
  }
}

/**
 * Create a quick note
 */
async function handleQuickNote(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: any,
  demoMode: boolean
): Promise<NextResponse> {
  try {
    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title: data.title || 'Quick Note',
        content: data.content || '',
        tags: data.tags || [],
        project_id: data.project || null,
        is_pinned: data.isPinned || false,
        color: data.color || '#FBBF24'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create note', { error })

      if (demoMode) {
        const mockId = `note_${Date.now()}_${randomBytes(4).toString('hex')}`
        return NextResponse.json({
          success: true,
          action: 'quick-note',
          result: {
            id: mockId,
            title: data.title || 'Quick Note',
            content: data.content || '',
            createdAt: new Date().toISOString()
          },
          message: `Note saved (demo mode)`,
          id: mockId,
          demo: true
        })
      }

      throw error
    }

    logger.info('Note created via quick action', { noteId: note.id })

    return NextResponse.json({
      success: true,
      action: 'quick-note',
      result: note,
      message: `Note "${note.title}" saved successfully`,
      id: note.id,
      demo: demoMode
    })
  } catch (error) {
    logger.error('Quick note error', { error: error.message })
    return NextResponse.json({
      success: false,
      action: 'quick-note',
      message: error.message || 'Failed to save note'
    }, { status: 500 })
  }
}

/**
 * GET - List available actions
 */
export async function GET(): Promise<NextResponse> {
  const actions = [
    {
      id: 'create-project',
      name: 'Create Project',
      description: 'Create a new project',
      requiredFields: ['title'],
      optionalFields: ['description', 'client', 'clientId', 'budget', 'endDate', 'priority']
    },
    {
      id: 'create-folder',
      name: 'Create Folder',
      description: 'Create a new folder in Files Hub',
      requiredFields: ['name'],
      optionalFields: ['parent', 'parentId', 'color']
    },
    {
      id: 'send-message',
      name: 'Send Message',
      description: 'Send a message to a user or team',
      requiredFields: ['to', 'body'],
      optionalFields: ['subject', 'priority']
    },
    {
      id: 'create-task',
      name: 'Create Task',
      description: 'Create a new task',
      requiredFields: ['title'],
      optionalFields: ['description', 'project', 'projectId', 'assignee', 'priority', 'dueDate']
    },
    {
      id: 'bookmark-item',
      name: 'Bookmark Item',
      description: 'Bookmark a file, project, or page',
      requiredFields: ['itemId', 'itemType', 'title'],
      optionalFields: ['url', 'tags']
    },
    {
      id: 'share-file',
      name: 'Share File',
      description: 'Share a file with others',
      requiredFields: ['fileId', 'fileName'],
      optionalFields: ['sharedWith', 'permissions', 'expiresAt', 'password']
    },
    {
      id: 'export-data',
      name: 'Export Data',
      description: 'Export data to CSV, PDF, or Excel',
      requiredFields: ['type'],
      optionalFields: ['format', 'dateRange', 'filters']
    },
    {
      id: 'generate-invoice',
      name: 'Generate Invoice',
      description: 'Generate a new invoice',
      requiredFields: ['client', 'items', 'total'],
      optionalFields: ['clientId', 'project', 'dueDate', 'tax', 'subtotal']
    },
    {
      id: 'schedule-meeting',
      name: 'Schedule Meeting',
      description: 'Schedule a new meeting',
      requiredFields: ['title', 'startTime'],
      optionalFields: ['description', 'duration', 'participants', 'location']
    },
    {
      id: 'quick-note',
      name: 'Quick Note',
      description: 'Create a quick note',
      requiredFields: ['content'],
      optionalFields: ['title', 'tags', 'project', 'isPinned', 'color']
    }
  ]

  return NextResponse.json({
    success: true,
    actions,
    documentation: {
      endpoint: '/api/quick-actions',
      method: 'POST',
      example: {
        action: 'create-project',
        data: {
          title: 'New Website Project',
          client: 'Acme Corp',
          budget: 5000
        }
      }
    }
  })
}
