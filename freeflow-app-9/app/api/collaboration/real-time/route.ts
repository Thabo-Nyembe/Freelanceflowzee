import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface CommentRequest {
  fileId: string
  content: string
  type: 'comment' | 'note' | 'suggestion' | 'issue'
  timestamp?: number
  position?: { x: number; y: number }
  mentions?: string[]
}

interface ApprovalRequest {
  fileId: string
  status: 'approved' | 'rejected' | 'revision_requested'
  message?: string
  conditions?: string[]
}

interface NotificationRequest {
  userId: string
  type: string
  title: string
  message: string
  data?: any
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const action = body.action

    switch (action) {
      case 'add_comment':
        return handleAddComment(body as CommentRequest, supabase, user)
      
      case 'add_approval':
        return handleAddApproval(body as ApprovalRequest, supabase, user)
      
      case 'send_notification':
        return handleSendNotification(body as NotificationRequest, supabase, user)
      
      case 'update_file_status':
        return handleUpdateFileStatus(body, supabase, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Real-time collaboration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleAddComment(
  commentData: CommentRequest,
  supabase: any,
  user: any
) {
  try {
    // Validate file exists
    const { data: file, error: fileError } = await supabase
      .from('media_files')
      .select('id, name, project_id')
      .eq('id', commentData.fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        file_id: commentData.fileId,
        user_id: user.id,
        content: commentData.content,
        type: commentData.type,
        timestamp: commentData.timestamp,
        position: commentData.position,
        mentions: commentData.mentions || [],
        is_resolved: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (commentError) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Send notifications to mentioned users
    if (commentData.mentions && commentData.mentions.length > 0) {
      for (const mentionedUserId of commentData.mentions) {
        await supabase.from('notifications').insert({
          user_id: mentionedUserId,
          type: 'mention',
          title: 'You were mentioned in a comment',
          message: `${user.email} mentioned you in a ${commentData.type} on ${file.name}`,
          data: {
            comment_id: comment.id,
            file_id: commentData.fileId,
            project_id: file.project_id
          },
          priority: commentData.type === 'issue' ? 'high' : 'medium'
        })
      }
    }

    // Create general notification for file activity
    await createFileActivityNotification(supabase, {
      fileId: commentData.fileId,
      projectId: file.project_id,
      userId: user.id,
      action: 'comment_added',
      details: {
        commentType: commentData.type,
        content: commentData.content.substring(0, 100)
      }
    })

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment added successfully'
    })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

async function handleAddApproval(
  approvalData: ApprovalRequest,
  supabase: any,
  user: any
) {
  try {
    // Validate file exists
    const { data: file, error: fileError } = await supabase
      .from('media_files')
      .select('id, name, project_id, status')
      .eq('id', approvalData.fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Create approval record
    const { data: approval, error: approvalError } = await supabase
      .from('approvals')
      .insert({
        file_id: approvalData.fileId,
        user_id: user.id,
        status: approvalData.status,
        message: approvalData.message,
        conditions: approvalData.conditions || [],
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (approvalError) {
      return NextResponse.json(
        { error: 'Failed to create approval' },
        { status: 500 }
      )
    }

    // Update file status based on approval
    let newFileStatus = file.status
    switch (approvalData.status) {
      case 'approved':
        newFileStatus = 'approved'
        break
      case 'rejected':
        newFileStatus = 'rejected'
        break
      case 'revision_requested':
        newFileStatus = 'revision_requested'
        break
    }

    await supabase
      .from('media_files')
      .update({ status: newFileStatus })
      .eq('id', approvalData.fileId)

    // Check if this completes a workflow step
    await checkWorkflowProgression(supabase, file.project_id, approvalData.status)

    // Send notifications
    await createApprovalNotification(supabase, {
      fileId: approvalData.fileId,
      projectId: file.project_id,
      approverId: user.id,
      status: approvalData.status,
      message: approvalData.message
    })

    return NextResponse.json({
      success: true,
      approval,
      newFileStatus,
      message: `File ${approvalData.status.replace('_', ' ')} successfully`
    })
  } catch (error) {
    console.error('Add approval error:', error)
    return NextResponse.json(
      { error: 'Failed to add approval' },
      { status: 500 }
    )
  }
}

async function handleSendNotification(
  notificationData: NotificationRequest,
  supabase: any,
  user: any
) {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        priority: notificationData.priority || 'medium',
        is_read: false,
        created_at: new Date().toISOString(),
        sent_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    // In a real app, trigger WebSocket/real-time notification here
    await triggerRealTimeNotification(notification)

    return NextResponse.json({
      success: true,
      notification,
      message: 'Notification sent successfully'
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

async function handleUpdateFileStatus(
  statusData: any,
  supabase: any,
  user: any
) {
  try {
    const { fileId, status, metadata } = statusData

    const { data: updatedFile, error } = await supabase
      .from('media_files')
      .update({
        status,
        metadata: metadata || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', fileId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update file status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      file: updatedFile,
      message: 'File status updated successfully'
    })
  } catch (error) {
    console.error('Update file status error:', error)
    return NextResponse.json(
      { error: 'Failed to update file status' },
      { status: 500 }
    )
  }
}

// Helper functions
async function createFileActivityNotification(supabase: any, data: any) {
  try {
    // Get project collaborators
    const { data: project } = await supabase
      .from('projects')
      .select('id, name, collaborators, created_by')
      .eq('id', data.projectId)
      .single()

    if (project) {
      const collaborators = project.collaborators || []
      const allUsers = [project.created_by, ...collaborators].filter(
        (id: string) => id !== data.userId
      )

      // Create notifications for all project members except the actor
      for (const userId of allUsers) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'file_activity',
          title: 'New file activity',
          message: `New ${data.action.replace('_', ' ')} in project "${project.name}"`,
          data: {
            file_id: data.fileId,
            project_id: data.projectId,
            action: data.action,
            details: data.details
          },
          priority: 'medium'
        })
      }
    }
  } catch (error) {
    console.error('Failed to create file activity notification:', error)
  }
}

async function createApprovalNotification(supabase: any, data: any) {
  try {
    // Get project owner and file uploader
    const { data: file } = await supabase
      .from('media_files')
      .select('uploaded_by, projects(created_by, name)')
      .eq('id', data.fileId)
      .single()

    if (file) {
      const usersToNotify = [file.uploaded_by, file.projects.created_by].filter(
        (id: string) => id !== data.approverId
      )

      for (const userId of usersToNotify) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'approval_status',
          title: `File ${data.status.replace('_', ' ')}`,
          message: data.message || `Your file has been ${data.status.replace('_', ' ')}`,
          data: {
            file_id: data.fileId,
            project_id: data.projectId,
            approval_status: data.status,
            approver_id: data.approverId
          },
          priority: data.status === 'rejected' ? 'high' : 'medium'
        })
      }
    }
  } catch (error) {
    console.error('Failed to create approval notification:', error)
  }
}

async function checkWorkflowProgression(supabase: any, projectId: string, approvalStatus: string) {
  try {
    if (approvalStatus === 'approved') {
      // Check if this approval completes a workflow step
      const { data: workflow } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_completed', false)
        .order('order')
        .limit(1)
        .single()

      if (workflow && workflow.auto_advance) {
        // Mark step as completed
        await supabase
          .from('workflow_steps')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', workflow.id)

        // Notify about workflow progression
        await supabase.from('notifications').insert({
          user_id: workflow.assignee_id,
          type: 'workflow_progress',
          title: 'Workflow step completed',
          message: `"${workflow.name}" has been completed and workflow has progressed`,
          data: {
            project_id: projectId,
            workflow_step_id: workflow.id
          },
          priority: 'medium'
        })
      }
    }
  } catch (error) {
    console.error('Failed to check workflow progression:', error)
  }
}

async function triggerRealTimeNotification(notification: any) {
  // In a real application, this would trigger WebSocket or server-sent events
  // For now, we'll just log it
  console.log('Real-time notification triggered:', {
    userId: notification.user_id,
    type: notification.type,
    title: notification.title,
    timestamp: notification.created_at
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const fileId = searchParams.get('fileId')
    const projectId = searchParams.get('projectId')
    const userId = searchParams.get('userId')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'comments':
        return getComments(supabase, fileId, user)
      
      case 'approvals':
        return getApprovals(supabase, fileId, user)
      
      case 'notifications':
        return getNotifications(supabase, userId || user.id, user)
      
      case 'activity':
        return getProjectActivity(supabase, projectId, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Real-time collaboration GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getComments(supabase: any, fileId: string | null, user: any) {
  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID required' },
      { status: 400 }
    )
  }

  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url),
      replies:comments!parent_id(*),
      reactions(*)
    `)
    .eq('file_id', fileId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    comments: comments || [],
    total: comments?.length || 0
  })
}

async function getApprovals(supabase: any, fileId: string | null, user: any) {
  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID required' },
      { status: 400 }
    )
  }

  const { data: approvals, error } = await supabase
    .from('approvals')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url)
    `)
    .eq('file_id', fileId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    approvals: approvals || [],
    total: approvals?.length || 0
  })
}

async function getNotifications(supabase: any, userId: string, user: any) {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  return NextResponse.json({
    notifications: notifications || [],
    unreadCount,
    total: notifications?.length || 0
  })
}

async function getProjectActivity(supabase: any, projectId: string | null, user: any) {
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }

  const { data: activity, error } = await supabase
    .from('project_activity')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch project activity' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    activity: activity || [],
    total: activity?.length || 0
  })
} 