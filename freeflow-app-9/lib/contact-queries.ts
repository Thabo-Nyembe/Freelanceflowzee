/**
 * Contact Form Query Library
 *
 * Handles contact form submissions and message management
 * Features: Create, Read, Update status, Delete messages
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError } from '@/lib/types/database'

const logger = createSimpleLogger('ContactQueries')

// ============================================================================
// TYPES
// ============================================================================

export type MessageStatus = 'new' | 'read' | 'replied' | 'archived'
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent'

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  subject?: string
  phone?: string
  company?: string
  status: MessageStatus
  priority: MessagePriority
  source: string // 'contact_form', 'support', 'sales', etc.
  ip_address?: string
  user_agent?: string
  referrer?: string
  assigned_to?: string
  replied_at?: string
  reply_message?: string
  created_at: string
  updated_at: string
}

export interface ContactMessageInput {
  name: string
  email: string
  message: string
  subject?: string
  phone?: string
  company?: string
  source?: string
}

// ============================================================================
// CREATE MESSAGE
// ============================================================================

export async function createContactMessage(
  input: ContactMessageInput,
  metadata?: {
    ip_address?: string
    user_agent?: string
    referrer?: string
  }
): Promise<{ data: ContactMessage | null; error: DatabaseError | null }> {
  const supabase = createClient()

  logger.info('Creating contact message', {
    email: input.email,
    source: input.source || 'contact_form'
  })

  const { data, error } = await supabase
    .from('contact_messages')
    .insert({
      name: input.name,
      email: input.email,
      message: input.message,
      subject: input.subject,
      phone: input.phone,
      company: input.company,
      source: input.source || 'contact_form',
      status: 'new',
      priority: 'normal',
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
      referrer: metadata?.referrer
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create contact message', { error, email: input.email })
    return { data: null, error }
  }

  logger.info('Contact message created successfully', {
    messageId: data.id,
    email: input.email
  })

  return { data, error: null }
}

// ============================================================================
// READ MESSAGES (Admin)
// ============================================================================

export async function getContactMessages(
  filters?: {
    status?: MessageStatus
    priority?: MessagePriority
    source?: string
    search?: string
    limit?: number
    offset?: number
  }
): Promise<{ data: ContactMessage[] | null; count: number; error: DatabaseError | null }> {
  const supabase = createClient()

  let query = supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  if (filters?.source) {
    query = query.eq('source', filters.source)
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,message.ilike.%${filters.search}%`
    )
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, count, error } = await query

  if (error) {
    logger.error('Failed to fetch contact messages', { error, filters })
    return { data: null, count: 0, error }
  }

  return { data, count: count || 0, error: null }
}

export async function getContactMessage(
  messageId: string
): Promise<{ data: ContactMessage | null; error: DatabaseError | null }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (error) {
    logger.error('Failed to fetch contact message', { error, messageId })
    return { data: null, error }
  }

  return { data, error: null }
}

// ============================================================================
// UPDATE MESSAGE STATUS
// ============================================================================

export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<{ data: ContactMessage | null; error: DatabaseError | null }> {
  const supabase = createClient()

  logger.info('Updating message status', { messageId, status })

  const { data, error } = await supabase
    .from('contact_messages')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update message status', { error, messageId })
    return { data: null, error }
  }

  return { data, error: null }
}

export async function replyToMessage(
  messageId: string,
  replyMessage: string,
  assignedTo?: string
): Promise<{ data: ContactMessage | null; error: DatabaseError | null }> {
  const supabase = createClient()

  logger.info('Replying to message', { messageId })

  const { data, error } = await supabase
    .from('contact_messages')
    .update({
      status: 'replied',
      reply_message: replyMessage,
      replied_at: new Date().toISOString(),
      assigned_to: assignedTo,
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to reply to message', { error, messageId })
    return { data: null, error }
  }

  logger.info('Message replied successfully', { messageId })
  return { data, error: null }
}

// ============================================================================
// DELETE MESSAGE
// ============================================================================

export async function deleteContactMessage(
  messageId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  const supabase = createClient()

  logger.info('Deleting contact message', { messageId })

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', messageId)

  if (error) {
    logger.error('Failed to delete contact message', { error, messageId })
    return { success: false, error }
  }

  logger.info('Contact message deleted', { messageId })
  return { success: true, error: null }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getContactStats(): Promise<{
  data: {
    total: number
    new: number
    read: number
    replied: number
    archived: number
    avgResponseTime?: number
  } | null
  error: DatabaseError | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('contact_messages')
    .select('status')

  if (error) {
    logger.error('Failed to fetch contact stats', { error })
    return { data: null, error }
  }

  const stats = {
    total: data?.length || 0,
    new: data?.filter(m => m.status === 'new').length || 0,
    read: data?.filter(m => m.status === 'read').length || 0,
    replied: data?.filter(m => m.status === 'replied').length || 0,
    archived: data?.filter(m => m.status === 'archived').length || 0
  }

  return { data: stats, error: null }
}
