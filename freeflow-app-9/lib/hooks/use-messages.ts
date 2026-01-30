// Hook for Messages management
// Created: December 14, 2024

import { useState, useEffect, useCallback } from 'react'
import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

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

// Demo messages data
function getDemoMessages(): Message[] {
  const demoUserId = '00000000-0000-0000-0000-000000000001'
  const now = new Date()
  return [
    {
      id: 'msg-demo-1',
      user_id: demoUserId,
      organization_id: null,
      sender_id: 'sender-1',
      recipient_id: demoUserId,
      thread_id: null,
      parent_message_id: null,
      subject: 'Project Update - Q1 Goals',
      body: 'Hi team, I wanted to share our progress on the Q1 objectives. We\'ve completed 80% of the planned milestones and are on track for the deadline.',
      message_type: 'direct',
      status: 'delivered',
      priority: 'normal',
      is_read: true,
      read_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      delivered_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      sent_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      attachments: null,
      has_attachments: false,
      attachment_count: 0,
      is_pinned: false,
      is_starred: true,
      is_important: false,
      is_spam: false,
      reply_to_message_id: null,
      forwarded_from_message_id: null,
      is_forwarded: false,
      labels: ['work', 'q1'],
      category: 'work',
      folder: 'inbox',
      recipients: null,
      cc_recipients: null,
      bcc_recipients: null,
      reactions: null,
      reaction_count: 0,
      is_encrypted: false,
      encryption_key_id: null,
      scheduled_for: null,
      is_scheduled: false,
      expires_at: null,
      auto_delete_after_days: null,
      metadata: null,
      user_agent: null,
      ip_address: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      deleted_at: null
    },
    {
      id: 'msg-demo-2',
      user_id: demoUserId,
      organization_id: null,
      sender_id: 'sender-2',
      recipient_id: demoUserId,
      thread_id: null,
      parent_message_id: null,
      subject: 'Invoice #INV-2024-0125 Approved',
      body: 'Your invoice has been approved and payment will be processed within 5 business days. Thank you for your work!',
      message_type: 'system',
      status: 'delivered',
      priority: 'high',
      is_read: false,
      read_at: null,
      delivered_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      sent_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      attachments: null,
      has_attachments: false,
      attachment_count: 0,
      is_pinned: false,
      is_starred: false,
      is_important: true,
      is_spam: false,
      reply_to_message_id: null,
      forwarded_from_message_id: null,
      is_forwarded: false,
      labels: ['finance'],
      category: 'finance',
      folder: 'inbox',
      recipients: null,
      cc_recipients: null,
      bcc_recipients: null,
      reactions: null,
      reaction_count: 0,
      is_encrypted: false,
      encryption_key_id: null,
      scheduled_for: null,
      is_scheduled: false,
      expires_at: null,
      auto_delete_after_days: null,
      metadata: null,
      user_agent: null,
      ip_address: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      deleted_at: null
    },
    {
      id: 'msg-demo-3',
      user_id: demoUserId,
      organization_id: null,
      sender_id: 'sender-3',
      recipient_id: demoUserId,
      thread_id: null,
      parent_message_id: null,
      subject: 'New Feature Request - Client Portal',
      body: 'We\'d like to add a self-service portal for clients to track their project progress. Can we schedule a call to discuss requirements?',
      message_type: 'direct',
      status: 'delivered',
      priority: 'normal',
      is_read: true,
      read_at: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      delivered_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
      sent_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
      attachments: null,
      has_attachments: false,
      attachment_count: 0,
      is_pinned: true,
      is_starred: false,
      is_important: false,
      is_spam: false,
      reply_to_message_id: null,
      forwarded_from_message_id: null,
      is_forwarded: false,
      labels: ['feature-request'],
      category: 'work',
      folder: 'inbox',
      recipients: null,
      cc_recipients: null,
      bcc_recipients: null,
      reactions: null,
      reaction_count: 0,
      is_encrypted: false,
      encryption_key_id: null,
      scheduled_for: null,
      is_scheduled: false,
      expires_at: null,
      auto_delete_after_days: null,
      metadata: null,
      user_agent: null,
      ip_address: null,
      created_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
      updated_at: new Date(now.getTime() - 1000 * 60 * 240).toISOString(),
      deleted_at: null
    }
  ]
}

export function useMessages(options: UseMessagesOptions = {}) {
  const { status, messageType, folder, limit } = options
  const isDemo = isDemoModeEnabled()

  // Demo mode state
  const [demoData, setDemoData] = useState<Message[]>([])
  const [demoLoading, setDemoLoading] = useState(isDemo)

  // Demo mode effect
  useEffect(() => {
    if (!isDemo) return
    setDemoLoading(true)
    // Simulate API fetch
    setTimeout(() => {
      setDemoData(getDemoMessages())
      setDemoLoading(false)
    }, 100)
  }, [isDemo])

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (messageType && messageType !== 'all') filters.message_type = messageType
  if (folder && folder !== 'all') filters.folder = folder

  const queryOptions: any = {
    table: 'messages',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: !isDemo, // Disable realtime for demo mode
    softDelete: false, // messages table doesn't have deleted_at column
    enabled: !isDemo // Skip query in demo mode
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Message>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'messages',
    onSuccess: refetch
  })

  // Demo mode handlers
  const demoCreateMessage = useCallback(async (newMessage: Partial<Message>) => {
    const msg: Message = {
      id: `msg-demo-${Date.now()}`,
      user_id: '00000000-0000-0000-0000-000000000001',
      organization_id: null,
      sender_id: '00000000-0000-0000-0000-000000000001',
      recipient_id: newMessage.recipient_id || 'recipient-1',
      thread_id: null,
      parent_message_id: null,
      subject: newMessage.subject || 'New Message',
      body: newMessage.body || '',
      message_type: newMessage.message_type || 'direct',
      status: 'sent',
      priority: newMessage.priority || 'normal',
      is_read: false,
      read_at: null,
      delivered_at: null,
      sent_at: new Date().toISOString(),
      attachments: null,
      has_attachments: false,
      attachment_count: 0,
      is_pinned: false,
      is_starred: false,
      is_important: false,
      is_spam: false,
      reply_to_message_id: null,
      forwarded_from_message_id: null,
      is_forwarded: false,
      labels: [],
      category: null,
      folder: 'sent',
      recipients: null,
      cc_recipients: null,
      bcc_recipients: null,
      reactions: null,
      reaction_count: 0,
      is_encrypted: false,
      encryption_key_id: null,
      scheduled_for: null,
      is_scheduled: false,
      expires_at: null,
      auto_delete_after_days: null,
      metadata: null,
      user_agent: null,
      ip_address: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
    setDemoData(prev => [msg, ...prev])
    return msg
  }, [])

  if (isDemo) {
    return {
      messages: demoData,
      loading: demoLoading,
      error: null,
      mutating: false,
      createMessage: demoCreateMessage,
      updateMessage: async () => {},
      deleteMessage: async () => {},
      refetch: () => {}
    }
  }

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
