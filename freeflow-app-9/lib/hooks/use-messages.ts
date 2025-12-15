// Hook for Messages management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type MessageType = 'direct' | 'group' | 'broadcast' | 'system' | 'automated'
export type MessageStatus = 'draft' | 'sent' | 'delivered' | 'read' | 'archived' | 'deleted' | 'failed'
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Message {
  id: string
  user_id: string
  organization_id: string | null
  sender_id: string
  recipient_id: string
  thread_id: string | null
  parent_message_id: string | null
  subject: string | null
  body: string
  message_type: MessageType
  status: MessageStatus
  priority: MessagePriority
  is_read: boolean
  read_at: string | null
  delivered_at: string | null
  sent_at: string | null
  attachments: any
  has_attachments: boolean
  attachment_count: number
  is_pinned: boolean
  is_starred: boolean
  is_important: boolean
  is_spam: boolean
  reply_to_message_id: string | null
  forwarded_from_message_id: string | null
  is_forwarded: boolean
  labels: any
  category: string | null
  folder: string
  recipients: any
  cc_recipients: any
  bcc_recipients: any
  reactions: any
  reaction_count: number
  is_encrypted: boolean
  encryption_key_id: string | null
  scheduled_for: string | null
  is_scheduled: boolean
  expires_at: string | null
  auto_delete_after_days: number | null
  metadata: any
  user_agent: string | null
  ip_address: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseMessagesOptions {
  status?: MessageStatus | 'all'
  messageType?: MessageType | 'all'
  folder?: string | 'all'
  limit?: number
}

export function useMessages(options: UseMessagesOptions = {}) {
  const { status, messageType, folder, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (messageType && messageType !== 'all') filters.message_type = messageType
  if (folder && folder !== 'all') filters.folder = folder

  const queryOptions: any = {
    table: 'messages',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Message>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'messages',
    onSuccess: refetch
  })

  return {
    messages: data,
    loading,
    error,
    mutating,
    createMessage: create,
    updateMessage: update,
    deleteMessage: remove,
    refetch
  }
}
