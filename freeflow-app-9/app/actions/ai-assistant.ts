'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getConversations(options?: {
  mode?: string
  isArchived?: boolean
  isStarred?: boolean
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  return { data }
}

export async function getConversation(conversationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createConversation(conversationData: {
  title?: string
  mode?: string
  model?: string
  system_prompt?: string
  tags?: string[]
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { data }
}

export async function updateConversation(
  conversationId: string,
  updates: {
    title?: string
    mode?: string
    model?: string
    system_prompt?: string
    is_archived?: boolean
    is_starred?: boolean
    tags?: string[]
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { data }
}

export async function deleteConversation(conversationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('ai_conversations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { success: true }
}

export async function getMessages(conversationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function sendMessage(messageData: {
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  prompt_tokens?: number
  completion_tokens?: number
  latency_ms?: number
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { data }
}

export async function toggleStar(conversationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current state
  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('is_starred')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conversation) {
    return { error: 'Conversation not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { data }
}

export async function toggleArchive(conversationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current state
  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('is_archived')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conversation) {
    return { error: 'Conversation not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { data }
}

export async function getConversationStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('status, is_archived, is_starred, message_count, total_tokens, total_cost, mode')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!conversations) {
    return { data: null }
  }

  const stats = {
    totalConversations: conversations.length,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    archivedConversations: conversations.filter(c => c.is_archived).length,
    starredConversations: conversations.filter(c => c.is_starred).length,
    totalMessages: conversations.reduce((sum, c) => sum + c.message_count, 0),
    totalTokens: conversations.reduce((sum, c) => sum + c.total_tokens, 0),
    totalCost: conversations.reduce((sum, c) => sum + c.total_cost, 0),
    byMode: conversations.reduce((acc, c) => {
      acc[c.mode] = (acc[c.mode] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    avgMessagesPerConversation: conversations.length > 0
      ? conversations.reduce((sum, c) => sum + c.message_count, 0) / conversations.length
      : 0
  }

  return { data: stats }
}

export async function clearConversation(conversationId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Delete all messages in conversation
  const { error: messagesError } = await supabase
    .from('ai_messages')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  if (messagesError) {
    return { error: messagesError.message }
  }

  // Reset conversation stats
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
    return { error: conversationError.message }
  }

  revalidatePath('/dashboard/ai-assistant-v2')
  return { success: true }
}
