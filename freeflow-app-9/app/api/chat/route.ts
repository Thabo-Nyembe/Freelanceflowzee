import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('API-Chat')

/**
 * Real-Time Chat API
 *
 * Features:
 * - Direct messaging between users
 * - Group conversations
 * - Project-specific chat rooms
 * - File sharing within messages
 * - Read receipts and typing indicators
 * - Message reactions
 * - Search and history
 * - Notification integration
 */

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'image' | 'system' | 'reply'
  attachments: Attachment[]
  reply_to?: string
  reactions: Reaction[]
  read_by: string[]
  edited_at?: string
  deleted_at?: string
  created_at: string
}

interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size: number
  thumbnail_url?: string
}

interface Reaction {
  emoji: string
  user_id: string
  created_at: string
}

interface Conversation {
  id: string
  type: 'direct' | 'group' | 'project' | 'channel'
  name?: string
  participants: string[]
  last_message?: Message
  unread_count: number
  created_at: string
  updated_at: string
}

// GET - Retrieve conversations or messages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')
    const before = searchParams.get('before') // For pagination

    // Get messages from a conversation
    if (conversationId) {
      let query = supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url),
          reply_to_message:chat_messages(id, content, sender:profiles(id, full_name))
        `)
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (before) {
        query = query.lt('created_at', before)
      }

      const { data: messages, error } = await query

      if (error) {
        throw error
      }

      // Mark messages as read
      await supabase.rpc('mark_messages_read', {
        p_conversation_id: conversationId,
        p_user_id: user.id,
      })

      return NextResponse.json({
        success: true,
        data: messages?.reverse() || [],
      })
    }

    // Get user's conversations
    if (action === 'conversations') {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          participants:chat_participants(
            user:profiles(id, full_name, avatar_url)
          ),
          last_message:chat_messages(
            id,
            content,
            sender_id,
            created_at
          )
        `)
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: conversations || [],
      })
    }

    // Search messages
    if (action === 'search') {
      const query = searchParams.get('q')
      if (!query) {
        return NextResponse.json(
          { error: 'Search query is required' },
          { status: 400 }
        )
      }

      const { data: results, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(id, full_name, avatar_url),
          conversation:chat_conversations(id, name, type)
        `)
        .textSearch('content', query)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: results || [],
      })
    }

    // Get unread counts
    if (action === 'unread') {
      const { data: unread, error } = await supabase.rpc('get_unread_counts', {
        p_user_id: user.id,
      })

      if (error) {
        return NextResponse.json({
          success: true,
          data: { total: 0, byConversation: {} },
        })
      }

      return NextResponse.json({
        success: true,
        data: unread,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Chat API ready',
      endpoints: {
        'GET ?conversationId=xxx': 'Get messages from conversation',
        'GET ?action=conversations': 'Get user conversations',
        'GET ?action=search&q=xxx': 'Search messages',
        'GET ?action=unread': 'Get unread counts',
        'POST': 'Send message or create conversation',
        'PUT': 'Edit message or update conversation',
        'DELETE': 'Delete message',
      },
    })

  } catch (error) {
    logger.error('Chat GET failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to fetch chat data' },
      { status: 500 }
    )
  }
}

// POST - Send message or create conversation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, conversationId, content, messageType = 'text', attachments = [], replyTo, participants, name, type = 'direct', projectId } = body

    // Create new conversation
    if (action === 'create-conversation') {
      if (!participants || participants.length === 0) {
        return NextResponse.json(
          { error: 'Participants are required' },
          { status: 400 }
        )
      }

      // Add current user to participants
      const allParticipants = [...new Set([user.id, ...participants])]

      // Check for existing direct conversation
      if (type === 'direct' && allParticipants.length === 2) {
        const { data: existing } = await supabase
          .from('chat_conversations')
          .select('*')
          .eq('type', 'direct')
          .contains('participant_ids', allParticipants)
          .single()

        if (existing) {
          return NextResponse.json({
            success: true,
            action: 'conversation_exists',
            data: existing,
          })
        }
      }

      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          type: type,
          name: name || null,
          participant_ids: allParticipants,
          project_id: projectId || null,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Create participant records
      await supabase.from('chat_participants').insert(
        allParticipants.map(pid => ({
          conversation_id: conversation.id,
          user_id: pid,
          joined_at: new Date().toISOString(),
        }))
      )

      logger.info('Conversation created', {
        conversationId: conversation.id,
        type,
        participantCount: allParticipants.length,
      })

      return NextResponse.json({
        success: true,
        action: 'conversation_created',
        data: conversation,
      })
    }

    // Send message
    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'conversationId and content are required' },
        { status: 400 }
      )
    }

    // Verify user is in conversation
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .select('participant_ids')
      .eq('id', conversationId)
      .single()

    if (!conversation || !conversation.participant_ids.includes(user.id)) {
      return NextResponse.json(
        { error: 'Not a member of this conversation' },
        { status: 403 }
      )
    }

    // Create message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content,
        message_type: messageType,
        attachments: attachments,
        reply_to: replyTo || null,
        reactions: [],
        read_by: [user.id],
        created_at: new Date().toISOString(),
      })
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .single()

    if (error) {
      throw error
    }

    // Update conversation's last activity
    await supabase
      .from('chat_conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    // Create notifications for other participants
    const otherParticipants = conversation.participant_ids.filter((id: string) => id !== user.id)
    if (otherParticipants.length > 0) {
      const notifications = otherParticipants.map((userId: string) => ({
        user_id: userId,
        type: 'new_message',
        title: 'New message',
        content: content.substring(0, 100),
        reference_id: conversationId,
        reference_type: 'conversation',
        created_at: new Date().toISOString(),
      }))

      await supabase.from('notifications').insert(notifications)
    }

    logger.info('Message sent', {
      messageId: message.id,
      conversationId,
      senderId: user.id,
    })

    return NextResponse.json({
      success: true,
      action: 'message_sent',
      data: message,
    })

  } catch (error) {
    logger.error('Chat POST failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PUT - Edit message or add reaction
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, messageId, content, emoji } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    // Edit message
    if (action === 'edit') {
      if (!content) {
        return NextResponse.json(
          { error: 'content is required for editing' },
          { status: 400 }
        )
      }

      const { data: message, error } = await supabase
        .from('chat_messages')
        .update({
          content: content,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        action: 'message_edited',
        data: message,
      })
    }

    // Add/remove reaction
    if (action === 'react') {
      if (!emoji) {
        return NextResponse.json(
          { error: 'emoji is required' },
          { status: 400 }
        )
      }

      // Get current reactions
      const { data: message } = await supabase
        .from('chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single()

      if (!message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        )
      }

      let reactions = message.reactions || []
      const existingIndex = reactions.findIndex(
        (r: Reaction) => r.emoji === emoji && r.user_id === user.id
      )

      if (existingIndex >= 0) {
        // Remove reaction
        reactions.splice(existingIndex, 1)
      } else {
        // Add reaction
        reactions.push({
          emoji,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions })
        .eq('id', messageId)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        action: existingIndex >= 0 ? 'reaction_removed' : 'reaction_added',
        reactions,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    logger.error('Chat PUT failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE - Delete message
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      )
    }

    // Soft delete - mark as deleted
    const { error } = await supabase
      .from('chat_messages')
      .update({
        deleted_at: new Date().toISOString(),
        content: '[Message deleted]',
      })
      .eq('id', messageId)
      .eq('sender_id', user.id)

    if (error) {
      throw error
    }

    logger.info('Message deleted', { messageId, userId: user.id })

    return NextResponse.json({
      success: true,
      action: 'message_deleted',
    })

  } catch (error) {
    logger.error('Chat DELETE failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
