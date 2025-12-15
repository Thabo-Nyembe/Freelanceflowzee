// Server Actions for Chat Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

interface SendChatMessageData {
  room_id: string
  room_name?: string
  room_type?: string
  message: string
  message_type?: string
  attachments?: any
  media_url?: string
  media_type?: string
  reply_to_message_id?: string
  mentioned_users?: any
  metadata?: any
}

interface UpdateChatMessageData extends Partial<SendChatMessageData> {
  id: string
}

// Send chat message
export async function sendChatMessage(data: SendChatMessageData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: chatMessage, error } = await supabase
    .from('chat')
    .insert({
      ...data,
      user_id: user.id,
      sender_id: user.id,
      status: 'sent'
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
  return chatMessage
}

// Update chat message
export async function updateChatMessage({ id, ...data }: UpdateChatMessageData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: chatMessage, error } = await supabase
    .from('chat')
    .update({
      ...data,
      is_edited: true,
      edited_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('sender_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
  return chatMessage
}

// Delete chat message
export async function deleteChatMessage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('chat')
    .update({
      deleted_at: new Date().toISOString(),
      status: 'deleted',
      message: '[Message deleted]'
    })
    .eq('id', id)
    .eq('sender_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
}

// Mark message as read
export async function markChatMessageAsRead(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: chatMessage, error } = await supabase
    .from('chat')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      status: 'read'
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
  return chatMessage
}

// Mark all messages in room as read
export async function markRoomMessagesAsRead(roomId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('chat')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      status: 'read'
    })
    .eq('room_id', roomId)
    .eq('is_read', false)
    .neq('sender_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
}

// Add reaction to message
export async function addReactionToChatMessage(messageId: string, reaction: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current reactions
  const { data: currentMessage } = await supabase
    .from('chat')
    .select('reactions, reaction_count')
    .eq('id', messageId)
    .single()

  if (!currentMessage) throw new Error('Message not found')

  const reactions = currentMessage.reactions || {}
  const userReactions = reactions[user.id] || []

  // Toggle reaction
  const newUserReactions = userReactions.includes(reaction)
    ? userReactions.filter((r: string) => r !== reaction)
    : [...userReactions, reaction]

  const newReactions = {
    ...reactions,
    [user.id]: newUserReactions
  }

  // Count total reactions
  const totalReactions = Object.values(newReactions).reduce(
    (sum: number, arr: any) => sum + arr.length,
    0
  )

  const { data: chatMessage, error } = await supabase
    .from('chat')
    .update({
      reactions: newReactions,
      reaction_count: totalReactions
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
  return chatMessage
}

// Pin/unpin message
export async function togglePinChatMessage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current state
  const { data: currentMessage } = await supabase
    .from('chat')
    .select('is_pinned')
    .eq('id', id)
    .single()

  if (!currentMessage) throw new Error('Message not found')

  const { data: chatMessage, error } = await supabase
    .from('chat')
    .update({ is_pinned: !currentMessage.is_pinned })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/chat-v2')
  return chatMessage
}

// Get chat statistics
export async function getChatStats(roomId?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('chat')
    .select('status, message_type, room_type, is_read')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (roomId) {
    query = query.eq('room_id', roomId)
  }

  const { data: messages, error } = await query

  if (error) throw error

  const stats = {
    total: messages?.length || 0,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byRoomType: {} as Record<string, number>,
    unread: 0,
    sent: 0
  }

  messages?.forEach(message => {
    stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1
    stats.byType[message.message_type] = (stats.byType[message.message_type] || 0) + 1
    stats.byRoomType[message.room_type] = (stats.byRoomType[message.room_type] || 0) + 1
    if (!message.is_read) stats.unread++
  })

  return stats
}
