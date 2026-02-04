/**
 * Messaging Messages API
 *
 * Industry-leading message management with:
 * - Rich text formatting (Markdown, mentions, links)
 * - File attachments with preview
 * - Message editing and deletion
 * - Message reactions
 * - Thread replies
 * - Search and filtering
 * - Real-time updates via SSE
 * - Message pinning
 * - Read receipts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('messaging-messages')

// ============================================================================
// Types
// ============================================================================

export interface Message {
  id: string
  channelId: string
  threadId?: string
  parentId?: string
  userId: string
  type: 'text' | 'system' | 'file' | 'image' | 'video' | 'audio' | 'link' | 'code'
  content: string
  formattedContent?: string
  attachments?: Attachment[]
  mentions?: Mention[]
  links?: LinkPreview[]
  reactions?: Reaction[]
  replyCount?: number
  isPinned: boolean
  isEdited: boolean
  isDeleted: boolean
  deletedAt?: string
  editedAt?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
  readBy?: string[]
}

export interface Attachment {
  id: string
  type: 'file' | 'image' | 'video' | 'audio'
  name: string
  url: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  width?: number
  height?: number
  duration?: number
}

export interface Mention {
  type: 'user' | 'channel' | 'everyone' | 'here'
  id?: string
  name: string
  startIndex: number
  endIndex: number
}

export interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
  favicon?: string
}

export interface Reaction {
  emoji: string
  count: number
  users: string[]
  isMe?: boolean
}

export interface ReadReceipt {
  userId: string
  messageId: string
  readAt: string
}

// ============================================================================
// Storage
// ============================================================================

const messages: Map<string, Message> = new Map()
const channelMessages: Map<string, string[]> = new Map() // channelId -> messageIds
const readReceipts: Map<string, ReadReceipt[]> = new Map()
let messageIdCounter = 0

// ============================================================================
// Utilities
// ============================================================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}_${Math.random().toString(36).substr(2, 9)}`
}

function parseContent(content: string): {
  formattedContent: string
  mentions: Mention[]
  links: LinkPreview[]
} {
  const mentions: Mention[] = []
  const links: LinkPreview[] = []
  let formattedContent = content

  // Parse @mentions
  const mentionRegex = /@(\w+)/g
  let match
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      type: match[1] === 'everyone' || match[1] === 'here' ? match[1] : 'user',
      name: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  // Parse URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  while ((match = urlRegex.exec(content)) !== null) {
    links.push({
      url: match[0],
    })
  }

  // Basic markdown parsing
  formattedContent = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')

  return { formattedContent, mentions, links }
}

// ============================================================================
// POST - Create message or perform actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action = 'send', ...params } = body

    switch (action) {
      case 'send':
        return handleSendMessage(params, user.id)
      case 'edit':
        return handleEditMessage(params, user.id)
      case 'delete':
        return handleDeleteMessage(params, user.id)
      case 'react':
        return handleReaction(params, user.id)
      case 'unreact':
        return handleRemoveReaction(params, user.id)
      case 'pin':
        return handlePinMessage(params, user.id)
      case 'unpin':
        return handleUnpinMessage(params, user.id)
      case 'reply':
        return handleReply(params, user.id)
      case 'forward':
        return handleForwardMessage(params, user.id)
      case 'mark-read':
        return handleMarkMessageRead(params, user.id)
      case 'search':
        return handleSearchMessages(params, user.id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Message error', { error })
    return NextResponse.json(
      { error: 'Failed to process message request' },
      { status: 500 }
    )
  }
}

// Send message
async function handleSendMessage(params: {
  channelId: string
  content: string
  type?: Message['type']
  attachments?: Attachment[]
  threadId?: string
  parentId?: string
}, userId: string): Promise<NextResponse> {
  const { channelId, content, type = 'text', attachments, threadId, parentId } = params

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
  }

  if (!content && (!attachments || attachments.length === 0)) {
    return NextResponse.json({ error: 'Message content or attachments required' }, { status: 400 })
  }

  const { formattedContent, mentions, links } = parseContent(content || '')

  const message: Message = {
    id: generateMessageId(),
    channelId,
    threadId,
    parentId,
    userId,
    type,
    content: content || '',
    formattedContent,
    attachments,
    mentions,
    links,
    reactions: [],
    replyCount: 0,
    isPinned: false,
    isEdited: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readBy: [userId],
  }

  messages.set(message.id, message)

  // Add to channel messages
  const msgIds = channelMessages.get(channelId) || []
  msgIds.push(message.id)
  channelMessages.set(channelId, msgIds)

  // Update parent message reply count
  if (parentId) {
    const parentMsg = messages.get(parentId)
    if (parentMsg) {
      parentMsg.replyCount = (parentMsg.replyCount || 0) + 1
      messages.set(parentId, parentMsg)
    }
  }

  return NextResponse.json({
    success: true,
    message,
  })
}

// Edit message
async function handleEditMessage(params: {
  messageId: string
  content: string
}, userId: string): Promise<NextResponse> {
  const { messageId, content } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  if (message.userId !== userId) {
    return NextResponse.json({ error: 'Cannot edit another user\'s message' }, { status: 403 })
  }

  if (message.isDeleted) {
    return NextResponse.json({ error: 'Cannot edit deleted message' }, { status: 400 })
  }

  const { formattedContent, mentions, links } = parseContent(content)

  message.content = content
  message.formattedContent = formattedContent
  message.mentions = mentions
  message.links = links
  message.isEdited = true
  message.editedAt = new Date().toISOString()
  message.updatedAt = new Date().toISOString()

  messages.set(messageId, message)

  return NextResponse.json({
    success: true,
    message,
  })
}

// Delete message
async function handleDeleteMessage(params: {
  messageId: string
  hardDelete?: boolean
}, userId: string): Promise<NextResponse> {
  const { messageId, hardDelete = false } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  if (message.userId !== userId) {
    // Check if user has moderator permissions (simplified)
    return NextResponse.json({ error: 'Cannot delete another user\'s message' }, { status: 403 })
  }

  if (hardDelete) {
    messages.delete(messageId)
    const msgIds = channelMessages.get(message.channelId) || []
    channelMessages.set(message.channelId, msgIds.filter(id => id !== messageId))
  } else {
    message.isDeleted = true
    message.deletedAt = new Date().toISOString()
    message.content = ''
    message.formattedContent = ''
    message.attachments = []
    messages.set(messageId, message)
  }

  // Update parent reply count
  if (message.parentId) {
    const parentMsg = messages.get(message.parentId)
    if (parentMsg && parentMsg.replyCount) {
      parentMsg.replyCount--
      messages.set(message.parentId, parentMsg)
    }
  }

  return NextResponse.json({
    success: true,
    deleted: true,
  })
}

// Add reaction
async function handleReaction(params: {
  messageId: string
  emoji: string
}, userId: string): Promise<NextResponse> {
  const { messageId, emoji } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  message.reactions = message.reactions || []

  const existingReaction = message.reactions.find(r => r.emoji === emoji)
  if (existingReaction) {
    if (!existingReaction.users.includes(userId)) {
      existingReaction.users.push(userId)
      existingReaction.count++
    }
  } else {
    message.reactions.push({
      emoji,
      count: 1,
      users: [userId],
    })
  }

  messages.set(messageId, message)

  return NextResponse.json({
    success: true,
    reactions: message.reactions.map(r => ({
      ...r,
      isMe: r.users.includes(userId),
    })),
  })
}

// Remove reaction
async function handleRemoveReaction(params: {
  messageId: string
  emoji: string
}, userId: string): Promise<NextResponse> {
  const { messageId, emoji } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  message.reactions = message.reactions || []

  const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji)
  if (reactionIndex !== -1) {
    const reaction = message.reactions[reactionIndex]
    reaction.users = reaction.users.filter(u => u !== userId)
    reaction.count = reaction.users.length

    if (reaction.count === 0) {
      message.reactions.splice(reactionIndex, 1)
    }
  }

  messages.set(messageId, message)

  return NextResponse.json({
    success: true,
    reactions: message.reactions.map(r => ({
      ...r,
      isMe: r.users.includes(userId),
    })),
  })
}

// Pin message
async function handlePinMessage(params: {
  messageId: string
}, userId: string): Promise<NextResponse> {
  const { messageId } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  message.isPinned = true
  message.updatedAt = new Date().toISOString()
  messages.set(messageId, message)

  return NextResponse.json({
    success: true,
    message,
  })
}

// Unpin message
async function handleUnpinMessage(params: {
  messageId: string
}, userId: string): Promise<NextResponse> {
  const { messageId } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  message.isPinned = false
  message.updatedAt = new Date().toISOString()
  messages.set(messageId, message)

  return NextResponse.json({
    success: true,
    message,
  })
}

// Reply to message
async function handleReply(params: {
  channelId: string
  parentId: string
  content: string
  attachments?: Attachment[]
}, userId: string): Promise<NextResponse> {
  const parentMsg = messages.get(params.parentId)
  if (!parentMsg) {
    return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
  }

  return handleSendMessage({
    ...params,
    threadId: parentMsg.threadId || parentMsg.id,
  }, userId)
}

// Forward message
async function handleForwardMessage(params: {
  messageId: string
  targetChannelIds: string[]
  comment?: string
}, userId: string): Promise<NextResponse> {
  const { messageId, targetChannelIds, comment } = params

  const originalMessage = messages.get(messageId)
  if (!originalMessage) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  const forwardedMessages: Message[] = []

  for (const channelId of targetChannelIds) {
    const forwardedContent = comment
      ? `${comment}\n\n---\nForwarded message:\n${originalMessage.content}`
      : `Forwarded message:\n${originalMessage.content}`

    const message: Message = {
      id: generateMessageId(),
      channelId,
      userId,
      type: originalMessage.type,
      content: forwardedContent,
      formattedContent: forwardedContent,
      attachments: originalMessage.attachments,
      mentions: [],
      links: originalMessage.links,
      reactions: [],
      replyCount: 0,
      isPinned: false,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readBy: [userId],
    }

    messages.set(message.id, message)

    const msgIds = channelMessages.get(channelId) || []
    msgIds.push(message.id)
    channelMessages.set(channelId, msgIds)

    forwardedMessages.push(message)
  }

  return NextResponse.json({
    success: true,
    messages: forwardedMessages,
  })
}

// Mark message as read
async function handleMarkMessageRead(params: {
  messageId: string
}, userId: string): Promise<NextResponse> {
  const { messageId } = params

  const message = messages.get(messageId)
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  message.readBy = message.readBy || []
  if (!message.readBy.includes(userId)) {
    message.readBy.push(userId)
  }
  messages.set(messageId, message)

  // Store read receipt
  const receipts = readReceipts.get(message.channelId) || []
  receipts.push({
    userId,
    messageId,
    readAt: new Date().toISOString(),
  })
  readReceipts.set(message.channelId, receipts)

  return NextResponse.json({
    success: true,
    readAt: new Date().toISOString(),
  })
}

// Search messages
async function handleSearchMessages(params: {
  channelId?: string
  query: string
  userId?: string
  startDate?: string
  endDate?: string
  hasAttachments?: boolean
  limit?: number
  offset?: number
}, searchingUserId: string): Promise<NextResponse> {
  const {
    channelId,
    query,
    userId,
    startDate,
    endDate,
    hasAttachments,
    limit = 50,
    offset = 0,
  } = params

  let results: Message[] = []

  for (const [, message] of messages) {
    // Skip deleted messages
    if (message.isDeleted) continue

    // Channel filter
    if (channelId && message.channelId !== channelId) continue

    // User filter
    if (userId && message.userId !== userId) continue

    // Date filters
    if (startDate && new Date(message.createdAt) < new Date(startDate)) continue
    if (endDate && new Date(message.createdAt) > new Date(endDate)) continue

    // Attachment filter
    if (hasAttachments !== undefined) {
      const hasAtt = message.attachments && message.attachments.length > 0
      if (hasAttachments !== hasAtt) continue
    }

    // Text search
    if (query && !message.content.toLowerCase().includes(query.toLowerCase())) continue

    results.push(message)
  }

  // Sort by date descending
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total = results.length
  results = results.slice(offset, offset + limit)

  return NextResponse.json({
    success: true,
    results,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  })
}

// ============================================================================
// GET - Get messages
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const channelId = searchParams.get('channelId')
    const threadId = searchParams.get('threadId')
    const before = searchParams.get('before') // message ID for pagination
    const after = searchParams.get('after')
    const limit = parseInt(searchParams.get('limit') || '50')
    const pinned = searchParams.get('pinned') === 'true'

    // Get single message
    if (messageId) {
      const message = messages.get(messageId)
      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: {
          ...message,
          reactions: message.reactions?.map(r => ({
            ...r,
            isMe: r.users.includes(user.id),
          })),
        },
      })
    }

    // Get channel messages
    if (channelId) {
      const msgIds = channelMessages.get(channelId) || []
      let channelMsgs: Message[] = msgIds
        .map(id => messages.get(id))
        .filter((m): m is Message => m !== undefined && !m.isDeleted)

      // Filter by thread
      if (threadId) {
        channelMsgs = channelMsgs.filter(m => m.threadId === threadId || m.id === threadId)
      } else {
        // Only show top-level messages (no thread replies)
        channelMsgs = channelMsgs.filter(m => !m.parentId)
      }

      // Filter pinned
      if (pinned) {
        channelMsgs = channelMsgs.filter(m => m.isPinned)
      }

      // Sort by date ascending (oldest first for chat)
      channelMsgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      // Handle before/after pagination
      if (before) {
        const idx = channelMsgs.findIndex(m => m.id === before)
        if (idx > 0) {
          channelMsgs = channelMsgs.slice(Math.max(0, idx - limit), idx)
        }
      } else if (after) {
        const idx = channelMsgs.findIndex(m => m.id === after)
        if (idx >= 0) {
          channelMsgs = channelMsgs.slice(idx + 1, idx + 1 + limit)
        }
      } else {
        // Get latest messages
        channelMsgs = channelMsgs.slice(-limit)
      }

      // Add user reaction indicator
      channelMsgs = channelMsgs.map(m => ({
        ...m,
        reactions: m.reactions?.map(r => ({
          ...r,
          isMe: r.users.includes(user.id),
        })),
      }))

      return NextResponse.json({
        success: true,
        messages: channelMsgs,
        hasMore: {
          before: msgIds.length > channelMsgs.length,
          after: false, // Simplified
        },
      })
    }

    return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
  } catch (error) {
    logger.error('Error fetching messages', { error })
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete message
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    return handleDeleteMessage({ messageId }, user.id)
  } catch (error) {
    logger.error('Error deleting message', { error })
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update message
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, content } = body

    if (!messageId || !content) {
      return NextResponse.json({ error: 'Message ID and content required' }, { status: 400 })
    }

    return handleEditMessage({ messageId, content }, user.id)
  } catch (error) {
    logger.error('Error updating message', { error })
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}
