// Server Actions for Messages Management
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

interface CreateMessageData {
  recipient_id: string
  subject?: string
  body: string
  message_type?: string
  priority?: string
  attachments?: any
  thread_id?: string
  parent_message_id?: string
  reply_to_message_id?: string
  labels?: any
  category?: string
  folder?: string
  scheduled_for?: string
  metadata?: any
}

interface UpdateMessageData extends Partial<CreateMessageData> {
  id: string
}

// Create new message
export async function createMessage(data: CreateMessageData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      ...data,
      user_id: user.id,
      sender_id: user.id,
      sent_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
  return message
}

// Update existing message
export async function updateMessage({ id, ...data }: UpdateMessageData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: message, error } = await supabase
    .from('messages')
    .update(data)
    .eq('id', id)
    .eq('sender_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
  return message
}

// Delete message (soft delete)
export async function deleteMessage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
    .eq('id', id)
    .eq('sender_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
}

// Mark message as read
export async function markMessageAsRead(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: message, error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
      status: 'read'
    })
    .eq('id', id)
    .eq('recipient_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
  return message
}

// Star/unstar message
export async function toggleStarMessage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get current state
  const { data: currentMessage } = await supabase
    .from('messages')
    .select('is_starred')
    .eq('id', id)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .single()

  if (!currentMessage) throw new Error('Message not found')

  const { data: message, error } = await supabase
    .from('messages')
    .update({ is_starred: !currentMessage.is_starred })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
  return message
}

// Archive message
export async function archiveMessage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: message, error } = await supabase
    .from('messages')
    .update({
      status: 'archived',
      folder: 'archive'
    })
    .eq('id', id)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
  return message
}

// Send scheduled message
export async function sendScheduledMessage(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: message, error } = await supabase
    .from('messages')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      is_scheduled: false
    })
    .eq('id', id)
    .eq('sender_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/messages-v2')
  return message
}

// Get message statistics
export async function getMessageStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('status, message_type, is_read, folder')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .is('deleted_at', null)

  if (error) throw error

  const stats = {
    total: messages?.length || 0,
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byFolder: {} as Record<string, number>,
    unread: 0,
    sent: 0,
    received: 0
  }

  messages?.forEach(message => {
    stats.byStatus[message.status] = (stats.byStatus[message.status] || 0) + 1
    stats.byType[message.message_type] = (stats.byType[message.message_type] || 0) + 1
    stats.byFolder[message.folder] = (stats.byFolder[message.folder] || 0) + 1
    if (!message.is_read) stats.unread++
  })

  return stats
}
