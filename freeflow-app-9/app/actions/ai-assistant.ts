'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('ai-assistant')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ConversationFilters {
  mode?: string
  isArchived?: boolean
  isStarred?: boolean
}

interface ConversationData {
  title?: string
  mode?: string
  model?: string
  system_prompt?: string
  tags?: string[]
}

interface ConversationUpdates {
  title?: string
  mode?: string
  model?: string
  system_prompt?: string
  is_archived?: boolean
  is_starred?: boolean
  tags?: string[]
}

interface MessageData {
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  prompt_tokens?: number
  completion_tokens?: number
  latency_ms?: number
}

interface ConversationStats {
  totalConversations: number
  activeConversations: number
  archivedConversations: number
  starredConversations: number
  totalMessages: number
  totalTokens: number
  totalCost: number
  byMode: Record<string, number>
  avgMessagesPerConversation: number
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function getConversations(
  options?: ConversationFilters
): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getConversations')
      return actionError('Not authenticated')
    }

    let query = supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })

    if (options?.mode) {
      query = query.eq('mode', options.mode)
    }
    if (options?.isArchived !== undefined) {
      query = query.eq('is_archived', options.isArchived)
    }
    if (options?.isStarred !== undefined) {
      query = query.eq('is_starred', options.isStarred)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      logger.error('Failed to fetch conversations', { error, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Conversations fetched successfully', { userId: user.id, count: data?.length })
    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error in getConversations', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function getConversation(conversationId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getConversation', { conversationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch conversation', { error, conversationId, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Conversation fetched successfully', { conversationId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in getConversation', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}

export async function createConversation(
  conversationData: ConversationData
): Promise<ActionResult<unknown>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to createConversation')
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: conversationData.title || 'New Conversation',
        mode: conversationData.mode || 'chat',
        model: conversationData.model || 'gpt-4',
        system_prompt: conversationData.system_prompt,
        tags: conversationData.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create conversation', { error, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Conversation created successfully', { conversationId: data.id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in createConversation', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function updateConversation(
  conversationId: string,
  updates: ConversationUpdates
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to updateConversation', { conversationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update conversation', { error, conversationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Conversation updated successfully', { conversationId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in updateConversation', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}

export async function deleteConversation(conversationId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to deleteConversation', { conversationId })
      return actionError('Not authenticated')
    }

    const { error } = await supabase
      .from('ai_conversations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete conversation', { error, conversationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Conversation deleted successfully', { conversationId, userId: user.id })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in deleteConversation', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}

export async function getMessages(conversationId: string): Promise<ActionResult<unknown[]>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getMessages', { conversationId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch messages', { error, conversationId, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Messages fetched successfully', { conversationId, userId: user.id, count: data?.length })
    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error in getMessages', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}

export async function sendMessage(messageData: MessageData): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(messageData.conversation_id)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to sendMessage', { conversationId: messageData.conversation_id })
      return actionError('Not authenticated')
    }

    const totalTokens = (messageData.prompt_tokens || 0) + (messageData.completion_tokens || 0)

    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: messageData.conversation_id,
        user_id: user.id,
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        prompt_tokens: messageData.prompt_tokens || 0,
        completion_tokens: messageData.completion_tokens || 0,
        total_tokens: totalTokens,
        latency_ms: messageData.latency_ms || 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send message', { error, conversationId: messageData.conversation_id, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Message sent successfully', { messageId: data.id, conversationId: messageData.conversation_id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in sendMessage', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function toggleStar(conversationId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to toggleStar', { conversationId })
      return actionError('Not authenticated')
    }

    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('is_starred')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      logger.warn('Conversation not found', { conversationId, userId: user.id })
      return actionError('Conversation not found')
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({
        is_starred: !conversation.is_starred,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle star', { error, conversationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Star toggled successfully', { conversationId, userId: user.id, is_starred: data.is_starred })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in toggleStar', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}

export async function toggleArchive(conversationId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to toggleArchive', { conversationId })
      return actionError('Not authenticated')
    }

    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('is_archived')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (!conversation) {
      logger.warn('Conversation not found', { conversationId, userId: user.id })
      return actionError('Conversation not found')
    }

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({
        is_archived: !conversation.is_archived,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle archive', { error, conversationId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Archive toggled successfully', { conversationId, userId: user.id, is_archived: data.is_archived })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in toggleArchive', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}

export async function getConversationStats(): Promise<ActionResult<ConversationStats | null>> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getConversationStats')
      return actionError('Not authenticated')
    }

    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('status, is_archived, is_starred, message_count, total_tokens, total_cost, mode')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (!conversations) {
      logger.info('No conversations found for stats', { userId: user.id })
      return actionSuccess(null)
    }

    const stats: ConversationStats = {
      totalConversations: conversations.length,
      activeConversations: conversations.filter(c => c.status === 'active').length,
      archivedConversations: conversations.filter(c => c.is_archived).length,
      starredConversations: conversations.filter(c => c.is_starred).length,
      totalMessages: conversations.reduce((sum, c) => sum + (c.message_count || 0), 0),
      totalTokens: conversations.reduce((sum, c) => sum + (c.total_tokens || 0), 0),
      totalCost: conversations.reduce((sum, c) => sum + (c.total_cost || 0), 0),
      byMode: conversations.reduce((acc, c) => {
        acc[c.mode] = (acc[c.mode] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      avgMessagesPerConversation: conversations.length > 0
        ? conversations.reduce((sum, c) => sum + (c.message_count || 0), 0) / conversations.length
        : 0
    }

    logger.info('Conversation stats fetched successfully', { userId: user.id })
    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error in getConversationStats', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function clearConversation(conversationId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(conversationId)
    if (!validationResult.success) {
      return actionError('Invalid conversation ID format')
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to clearConversation', { conversationId })
      return actionError('Not authenticated')
    }

    const { error: messagesError } = await supabase
      .from('ai_messages')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)

    if (messagesError) {
      logger.error('Failed to delete messages', { error: messagesError, conversationId, userId: user.id })
      return actionError(messagesError.message)
    }

    const { error: conversationError } = await supabase
      .from('ai_conversations')
      .update({
        message_count: 0,
        total_tokens: 0,
        total_cost: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (conversationError) {
      logger.error('Failed to reset conversation stats', { error: conversationError, conversationId, userId: user.id })
      return actionError(conversationError.message)
    }

    revalidatePath('/dashboard/ai-assistant-v2')
    logger.info('Conversation cleared successfully', { conversationId, userId: user.id })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in clearConversation', { error, conversationId })
    return actionError('An unexpected error occurred')
  }
}
