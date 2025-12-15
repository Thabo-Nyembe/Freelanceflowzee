'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { ConversationType, MessageContentType } from '@/lib/hooks/use-messaging'

// =============================================
// CONVERSATION ACTIONS
// =============================================

export async function createConversation(data: {
  conversation_name?: string
  conversation_type?: ConversationType
  participant_ids?: string[]
  participant_emails?: string[]
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      conversation_name: data.conversation_name,
      conversation_type: data.conversation_type || 'direct',
      participant_ids: data.participant_ids ? [user.id, ...data.participant_ids] : [user.id],
      participant_emails: data.participant_emails ? [user.email, ...data.participant_emails] : [user.email],
      participant_count: (data.participant_ids?.length || 0) + 1,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function updateConversation(id: string, updates: {
  conversation_name?: string
  is_pinned?: boolean
  is_starred?: boolean
  is_muted?: boolean
  notification_enabled?: boolean
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function archiveConversation(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function unarchiveConversation(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ status: 'active' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function starConversation(id: string, starred: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ is_starred: starred })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function pinConversation(id: string, pinned: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({ is_pinned: pinned })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function markConversationAsRead(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversation, error } = await supabase
    .from('conversations')
    .update({
      unread_count: 0,
      last_read_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return conversation
}

export async function deleteConversation(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('conversations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return { success: true }
}

// =============================================
// MESSAGE ACTIONS
// =============================================

export async function sendMessage(data: {
  conversation_id: string
  content: string
  content_type?: MessageContentType
  recipient_id?: string
  recipient_email?: string
  attachments?: unknown[]
  reply_to_id?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error } = await supabase
    .from('direct_messages')
    .insert({
      user_id: user.id,
      conversation_id: data.conversation_id,
      content: data.content,
      content_type: data.content_type || 'text',
      sender_id: user.id,
      sender_name: user.email?.split('@')[0],
      sender_email: user.email,
      recipient_id: data.recipient_id,
      recipient_email: data.recipient_email,
      attachments: data.attachments || [],
      attachment_count: data.attachments?.length || 0,
      reply_to_id: data.reply_to_id,
      is_reply: !!data.reply_to_id,
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  // Update conversation's last message
  await supabase
    .from('conversations')
    .update({
      last_message_id: message.id,
      last_message_preview: data.content.substring(0, 500),
      last_message_at: message.sent_at,
      last_message_by: user.email
    })
    .eq('id', data.conversation_id)

  revalidatePath('/dashboard/messaging-v2')
  return message
}

export async function editMessage(id: string, content: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error } = await supabase
    .from('direct_messages')
    .update({
      content,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('sender_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return message
}

export async function markMessageAsRead(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error } = await supabase
    .from('direct_messages')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
      read_by: [user.id]
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return message
}

export async function addReaction(messageId: string, reaction: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current reactions
  const { data: message, error: fetchError } = await supabase
    .from('direct_messages')
    .select('reactions, reaction_count')
    .eq('id', messageId)
    .single()

  if (fetchError) throw fetchError

  const reactions = message.reactions || {}
  if (!reactions[reaction]) {
    reactions[reaction] = []
  }
  if (!reactions[reaction].includes(user.id)) {
    reactions[reaction].push(user.id)
  }

  const { data: updatedMessage, error } = await supabase
    .from('direct_messages')
    .update({
      reactions,
      reaction_count: Object.values(reactions).flat().length
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return updatedMessage
}

export async function removeReaction(messageId: string, reaction: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: message, error: fetchError } = await supabase
    .from('direct_messages')
    .select('reactions, reaction_count')
    .eq('id', messageId)
    .single()

  if (fetchError) throw fetchError

  const reactions = message.reactions || {}
  if (reactions[reaction]) {
    reactions[reaction] = reactions[reaction].filter((id: string) => id !== user.id)
    if (reactions[reaction].length === 0) {
      delete reactions[reaction]
    }
  }

  const { data: updatedMessage, error } = await supabase
    .from('direct_messages')
    .update({
      reactions,
      reaction_count: Object.values(reactions).flat().length
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return updatedMessage
}

export async function deleteMessage(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('direct_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('sender_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/messaging-v2')
  return { success: true }
}

// =============================================
// STATS & SEARCH
// =============================================

export async function getMessagingStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, unread_count, status, is_starred')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const { data: messages } = await supabase
    .from('direct_messages')
    .select('id, status')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const totalConversations = conversations?.length || 0
  const activeConversations = conversations?.filter(c => c.status === 'active').length || 0
  const totalUnread = conversations?.reduce((sum, c) => sum + (c.unread_count || 0), 0) || 0
  const totalMessages = messages?.length || 0
  const starredCount = conversations?.filter(c => c.is_starred).length || 0

  return {
    totalConversations,
    activeConversations,
    totalUnread,
    totalMessages,
    starredCount
  }
}

export async function searchMessages(query: string, conversationId?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  let queryBuilder = supabase
    .from('direct_messages')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .ilike('content', `%${query}%`)
    .order('sent_at', { ascending: false })

  if (conversationId) {
    queryBuilder = queryBuilder.eq('conversation_id', conversationId)
  }

  const { data, error } = await queryBuilder.limit(50)

  if (error) throw error
  return data
}
