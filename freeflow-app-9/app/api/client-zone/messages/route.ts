/**
 * Client Zone Messages API Route
 * Full CRUD operations for client-freelancer messaging
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('client-zone-messages-api')

// Demo mode check
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'
}

// Message types matching database schema
type MessageType = 'text' | 'system' | 'notification'

interface MessageAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

interface ClientMessage {
  id: string
  project_id: string | null
  sender_id: string
  recipient_id: string
  message: string
  message_type: MessageType
  read: boolean
  read_at: string | null
  attachments: MessageAttachment[]
  reply_to: string | null
  created_at: string
  updated_at: string
}

// Demo data for fallback
const demoMessages: ClientMessage[] = [
  {
    id: 'msg-001',
    project_id: 'proj-001',
    sender_id: 'client-001',
    recipient_id: DEMO_USER_ID,
    message: 'Great progress on the project! The designs look fantastic.',
    message_type: 'text',
    read: true,
    read_at: '2024-01-15T10:35:00Z',
    attachments: [],
    reply_to: null,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'msg-002',
    project_id: 'proj-001',
    sender_id: DEMO_USER_ID,
    recipient_id: 'client-001',
    message: 'Thank you! Here are the updated designs with the revisions you requested.',
    message_type: 'text',
    read: true,
    read_at: '2024-01-15T11:05:00Z',
    attachments: [
      { id: 'att-001', name: 'designs-v2.fig', url: '/files/designs-v2.fig', type: 'design', size: 2500000 }
    ],
    reply_to: 'msg-001',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'msg-003',
    project_id: 'proj-001',
    sender_id: 'client-001',
    recipient_id: DEMO_USER_ID,
    message: 'Can we schedule a call to discuss the next phase?',
    message_type: 'text',
    read: false,
    read_at: null,
    attachments: [],
    reply_to: null,
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z'
  },
  {
    id: 'msg-004',
    project_id: 'proj-002',
    sender_id: 'client-002',
    recipient_id: DEMO_USER_ID,
    message: 'Hi! Just checking in on the mobile app progress.',
    message_type: 'text',
    read: false,
    read_at: null,
    attachments: [],
    reply_to: null,
    created_at: '2024-01-16T09:00:00Z',
    updated_at: '2024-01-16T09:00:00Z'
  },
  {
    id: 'msg-005',
    project_id: null,
    sender_id: 'system',
    recipient_id: DEMO_USER_ID,
    message: 'Your project "Website Redesign" has been marked as completed.',
    message_type: 'system',
    read: true,
    read_at: '2024-01-14T16:00:00Z',
    attachments: [],
    reply_to: null,
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z'
  }
]

/**
 * GET /api/client-zone/messages
 * Retrieves messages for the current user
 * Query params: project_id, sender_id, recipient_id, unread_only, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const senderId = searchParams.get('sender_id')
    const recipientId = searchParams.get('recipient_id')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const conversationWith = searchParams.get('conversation_with')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const messageId = searchParams.get('id')

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    // Demo mode fallback
    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Fetching client zone messages', { userId, projectId, unreadOnly, messageId })

    // Try database first
    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Single message fetch
      if (messageId) {
        const { data: message, error } = await supabase
          .from('client_messages')
          .select(`
            *,
            sender:sender_id(id, email, full_name, avatar_url),
            recipient:recipient_id(id, email, full_name, avatar_url),
            project:project_id(id, name)
          `)
          .eq('id', messageId)
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .single()

        if (error) throw error

        return NextResponse.json({ success: true, data: message })
      }

      // Build query for message list
      let query = supabase
        .from('client_messages')
        .select(`
          *,
          sender:sender_id(id, email, full_name, avatar_url),
          recipient:recipient_id(id, email, full_name, avatar_url),
          project:project_id(id, name)
        `, { count: 'exact' })
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      // Apply filters
      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      if (senderId) {
        query = query.eq('sender_id', senderId)
      }

      if (recipientId) {
        query = query.eq('recipient_id', recipientId)
      }

      if (unreadOnly) {
        query = query.eq('read', false).eq('recipient_id', userId)
      }

      // Conversation filter - get messages between user and specific person
      if (conversationWith) {
        query = query.or(
          `and(sender_id.eq.${userId},recipient_id.eq.${conversationWith}),and(sender_id.eq.${conversationWith},recipient_id.eq.${userId})`
        )
      }

      // Pagination
      query = query.range(offset, offset + limit - 1)

      const { data: messages, error, count } = await query

      if (error) throw error

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('client_messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false)

      return NextResponse.json({
        success: true,
        data: messages || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        },
        unreadCount: unreadCount || 0
      })
    } catch (dbError) {
      logger.warn('Database error, using demo data', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      let filteredMessages = [...demoMessages]

      if (projectId) {
        filteredMessages = filteredMessages.filter(m => m.project_id === projectId)
      }

      if (senderId) {
        filteredMessages = filteredMessages.filter(m => m.sender_id === senderId)
      }

      if (recipientId) {
        filteredMessages = filteredMessages.filter(m => m.recipient_id === recipientId)
      }

      if (unreadOnly) {
        filteredMessages = filteredMessages.filter(m => !m.read && m.recipient_id === userId)
      }

      if (conversationWith) {
        filteredMessages = filteredMessages.filter(
          m => (m.sender_id === userId && m.recipient_id === conversationWith) ||
               (m.sender_id === conversationWith && m.recipient_id === userId)
        )
      }

      if (messageId) {
        const message = demoMessages.find(m => m.id === messageId)
        return NextResponse.json({ success: true, data: message || null })
      }

      const paginatedMessages = filteredMessages.slice(offset, offset + limit)
      const unreadCount = demoMessages.filter(m => !m.read && m.recipient_id === userId).length

      return NextResponse.json({
        success: true,
        data: paginatedMessages,
        pagination: {
          total: filteredMessages.length,
          limit,
          offset,
          hasMore: filteredMessages.length > offset + limit
        },
        unreadCount
      })
    }
  } catch (error) {
    logger.error('Error fetching messages', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/client-zone/messages
 * Create a new message or perform message actions
 * Actions: send, mark-read, mark-unread, delete, bulk-mark-read
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'send', ...data } = body

    // Get user session
    const session = await getServerSession(authOptions)
    let userId = session?.user?.id

    // Demo mode fallback
    if (!userId && isDemoMode()) {
      userId = DEMO_USER_ID
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Client zone messages action', { action, userId })

    switch (action) {
      case 'send':
        return handleSendMessage(userId, data)
      case 'mark-read':
        return handleMarkRead(userId, data)
      case 'mark-unread':
        return handleMarkUnread(userId, data)
      case 'delete':
        return handleDeleteMessage(userId, data)
      case 'bulk-mark-read':
        return handleBulkMarkRead(userId, data)
      case 'reply':
        return handleReplyMessage(userId, data)
      case 'get-conversations':
        return handleGetConversations(userId)
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Error in messages action', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process message action' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/client-zone/messages
 * Update a message
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, message, attachments } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID required' },
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

    logger.info('Updating message', { messageId: id, userId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify ownership
      const { data: existingMessage, error: fetchError } = await supabase
        .from('client_messages')
        .select('sender_id')
        .eq('id', id)
        .single()

      if (fetchError || !existingMessage) {
        return NextResponse.json(
          { success: false, error: 'Message not found' },
          { status: 404 }
        )
      }

      if (existingMessage.sender_id !== userId) {
        return NextResponse.json(
          { success: false, error: 'Can only edit your own messages' },
          { status: 403 }
        )
      }

      // Update message
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (message !== undefined) updateData.message = message
      if (attachments !== undefined) updateData.attachments = attachments

      const { data: updatedMessage, error } = await supabase
        .from('client_messages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: updatedMessage,
        message: 'Message updated successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      // Demo fallback
      const messageIndex = demoMessages.findIndex(m => m.id === id)
      if (messageIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Message not found' },
          { status: 404 }
        )
      }

      const updatedMessage = {
        ...demoMessages[messageIndex],
        message: message || demoMessages[messageIndex].message,
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: updatedMessage,
        message: 'Message updated successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error updating message', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/client-zone/messages
 * Delete a message
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID required' },
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

    logger.info('Deleting message', { messageId, userId })

    try {
      const supabase = createRouteHandlerClient({ cookies })

      // Verify ownership
      const { data: message, error: fetchError } = await supabase
        .from('client_messages')
        .select('sender_id')
        .eq('id', messageId)
        .single()

      if (fetchError || !message) {
        return NextResponse.json(
          { success: false, error: 'Message not found' },
          { status: 404 }
        )
      }

      if (message.sender_id !== userId) {
        return NextResponse.json(
          { success: false, error: 'Can only delete your own messages' },
          { status: 403 }
        )
      }

      // Delete message
      const { error } = await supabase
        .from('client_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully'
      })
    } catch (dbError) {
      logger.warn('Database error', { error: dbError })

      if (!isDemoMode()) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully (demo)'
      })
    }
  } catch (error) {
    logger.error('Error deleting message', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleSendMessage(userId: string, data: Record<string, unknown>) {
  const { recipient_id, project_id, message, message_type = 'text', attachments = [] } = data as {
    recipient_id: string
    project_id?: string
    message: string
    message_type?: MessageType
    attachments?: MessageAttachment[]
  }

  if (!recipient_id || !message) {
    return NextResponse.json(
      { success: false, error: 'Recipient ID and message are required' },
      { status: 400 }
    )
  }

  logger.info('Sending message', { from: userId, to: recipient_id, projectId: project_id })

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify recipient exists and user has permission (part of same project)
    if (project_id) {
      const { data: project, error: projectError } = await supabase
        .from('client_projects')
        .select('id, user_id, client_id')
        .eq('id', project_id)
        .single()

      if (projectError || !project) {
        return NextResponse.json(
          { success: false, error: 'Project not found' },
          { status: 404 }
        )
      }

      // Verify both users are part of the project
      const isUserInProject = project.user_id === userId || project.client_id === userId
      const isRecipientInProject = project.user_id === recipient_id || project.client_id === recipient_id

      if (!isUserInProject || !isRecipientInProject) {
        return NextResponse.json(
          { success: false, error: 'Both parties must be part of the project' },
          { status: 403 }
        )
      }
    }

    // Create message
    const newMessage = {
      sender_id: userId,
      recipient_id,
      project_id: project_id || null,
      message,
      message_type,
      attachments,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdMessage, error } = await supabase
      .from('client_messages')
      .insert(newMessage)
      .select(`
        *,
        sender:sender_id(id, email, full_name, avatar_url),
        recipient:recipient_id(id, email, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Create notification for recipient
    await supabase
      .from('client_notifications')
      .insert({
        user_id: recipient_id,
        notification_type: 'new_message',
        title: 'New Message',
        message: `You have a new message${project_id ? ' regarding your project' : ''}`,
        project_id: project_id || null,
        related_entity_type: 'message',
        related_entity_id: createdMessage.id,
        action_url: `/client-zone/messages?id=${createdMessage.id}`
      })

    return NextResponse.json({
      success: true,
      data: createdMessage,
      message: 'Message sent successfully'
    })
  } catch (dbError) {
    logger.warn('Database error, using demo fallback', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    // Demo fallback
    const newMessage: ClientMessage = {
      id: `msg-${Date.now()}`,
      sender_id: userId,
      recipient_id: recipient_id as string,
      project_id: (project_id as string) || null,
      message: message as string,
      message_type: (message_type as MessageType) || 'text',
      attachments: (attachments as MessageAttachment[]) || [],
      read: false,
      read_at: null,
      reply_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully (demo)'
    })
  }
}

async function handleMarkRead(userId: string, data: Record<string, unknown>) {
  const { message_id } = data as { message_id: string }

  if (!message_id) {
    return NextResponse.json(
      { success: false, error: 'Message ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: updatedMessage, error } = await supabase
      .from('client_messages')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', message_id)
      .eq('recipient_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedMessage,
      message: 'Message marked as read'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as read (demo)'
    })
  }
}

async function handleMarkUnread(userId: string, data: Record<string, unknown>) {
  const { message_id } = data as { message_id: string }

  if (!message_id) {
    return NextResponse.json(
      { success: false, error: 'Message ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: updatedMessage, error } = await supabase
      .from('client_messages')
      .update({
        read: false,
        read_at: null
      })
      .eq('id', message_id)
      .eq('recipient_id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: updatedMessage,
      message: 'Message marked as unread'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: 'Message marked as unread (demo)'
    })
  }
}

async function handleDeleteMessage(userId: string, data: Record<string, unknown>) {
  const { message_id } = data as { message_id: string }

  if (!message_id) {
    return NextResponse.json(
      { success: false, error: 'Message ID required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify ownership
    const { data: message, error: fetchError } = await supabase
      .from('client_messages')
      .select('sender_id')
      .eq('id', message_id)
      .single()

    if (fetchError || !message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.sender_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Can only delete your own messages' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('client_messages')
      .delete()
      .eq('id', message_id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully (demo)'
    })
  }
}

async function handleBulkMarkRead(userId: string, data: Record<string, unknown>) {
  const { message_ids, project_id, mark_all } = data as {
    message_ids?: string[]
    project_id?: string
    mark_all?: boolean
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    let query = supabase
      .from('client_messages')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .eq('recipient_id', userId)
      .eq('read', false)

    if (message_ids && message_ids.length > 0) {
      query = query.in('id', message_ids)
    } else if (project_id) {
      query = query.eq('project_id', project_id)
    } else if (!mark_all) {
      return NextResponse.json(
        { success: false, error: 'Provide message_ids, project_id, or mark_all=true' },
        { status: 400 }
      )
    }

    const { data: updatedMessages, error } = await query.select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: { count: updatedMessages?.length || 0 },
      message: `${updatedMessages?.length || 0} messages marked as read`
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    return NextResponse.json({
      success: true,
      data: { count: 0 },
      message: 'Messages marked as read (demo)'
    })
  }
}

async function handleReplyMessage(userId: string, data: Record<string, unknown>) {
  const { reply_to, message, attachments = [] } = data as {
    reply_to: string
    message: string
    attachments?: MessageAttachment[]
  }

  if (!reply_to || !message) {
    return NextResponse.json(
      { success: false, error: 'Reply_to message ID and message are required' },
      { status: 400 }
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get original message to determine recipient
    const { data: originalMessage, error: fetchError } = await supabase
      .from('client_messages')
      .select('*')
      .eq('id', reply_to)
      .single()

    if (fetchError || !originalMessage) {
      return NextResponse.json(
        { success: false, error: 'Original message not found' },
        { status: 404 }
      )
    }

    // Determine recipient (the other party in the conversation)
    const recipientId = originalMessage.sender_id === userId
      ? originalMessage.recipient_id
      : originalMessage.sender_id

    // Create reply
    const newMessage = {
      sender_id: userId,
      recipient_id: recipientId,
      project_id: originalMessage.project_id,
      message,
      message_type: 'text' as MessageType,
      attachments,
      read: false,
      reply_to,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: createdMessage, error } = await supabase
      .from('client_messages')
      .insert(newMessage)
      .select(`
        *,
        sender:sender_id(id, email, full_name, avatar_url),
        recipient:recipient_id(id, email, full_name, avatar_url),
        original:reply_to(id, message, sender_id)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: createdMessage,
      message: 'Reply sent successfully'
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    const newMessage: ClientMessage = {
      id: `msg-${Date.now()}`,
      sender_id: userId,
      recipient_id: 'client-001',
      project_id: 'proj-001',
      message: message as string,
      message_type: 'text',
      attachments: (attachments as MessageAttachment[]) || [],
      read: false,
      read_at: null,
      reply_to: reply_to as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Reply sent successfully (demo)'
    })
  }
}

async function handleGetConversations(userId: string) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get unique conversations (grouped by other party)
    const { data: messages, error } = await supabase
      .from('client_messages')
      .select(`
        *,
        sender:sender_id(id, email, full_name, avatar_url),
        recipient:recipient_id(id, email, full_name, avatar_url),
        project:project_id(id, name)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group by conversation partner
    const conversationsMap = new Map<string, {
      partnerId: string
      partner: unknown
      lastMessage: unknown
      unreadCount: number
      project: unknown
    }>()

    for (const msg of messages || []) {
      const partnerId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
      const partner = msg.sender_id === userId ? msg.recipient : msg.sender

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: msg.recipient_id === userId && !msg.read ? 1 : 0,
          project: msg.project
        })
      } else {
        const conv = conversationsMap.get(partnerId)!
        if (msg.recipient_id === userId && !msg.read) {
          conv.unreadCount++
        }
      }
    }

    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json({
      success: true,
      data: conversations
    })
  } catch (dbError) {
    logger.warn('Database error', { error: dbError })

    if (!isDemoMode()) {
      throw dbError
    }

    // Demo fallback
    const conversations = [
      {
        partnerId: 'client-001',
        partner: { id: 'client-001', full_name: 'Acme Corp', email: 'contact@acme.com' },
        lastMessage: demoMessages[2],
        unreadCount: 1,
        project: { id: 'proj-001', name: 'Website Redesign' }
      },
      {
        partnerId: 'client-002',
        partner: { id: 'client-002', full_name: 'TechStart Inc', email: 'hello@techstart.io' },
        lastMessage: demoMessages[3],
        unreadCount: 1,
        project: { id: 'proj-002', name: 'Mobile App' }
      }
    ]

    return NextResponse.json({
      success: true,
      data: conversations
    })
  }
}
