// Hook for Chat management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type RoomType = 'direct' | 'group' | 'channel' | 'team' | 'support' | 'public' | 'private'
export type ChatMessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'link' | 'code' | 'system' | 'deleted'
export type ChatStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted' | 'edited'

export interface ChatMessage {
  id: string
  user_id: string
  organization_id: string | null
  room_id: string
  room_name: string | null
  room_type: RoomType
  sender_id: string
  sender_name: string | null
  sender_avatar: string | null
  message: string
  message_type: ChatMessageType
  status: ChatStatus
  is_read: boolean
  read_at: string | null
  read_by: any
  delivered_to: any
  attachments: any
  media_url: string | null
  media_type: string | null
  file_size: number | null
  thumbnail_url: string | null
  reply_to_message_id: string | null
  is_reply: boolean
  thread_message_count: number
  reactions: any
  reaction_count: number
  mentioned_users: any
  has_mentions: boolean
  is_edited: boolean
  edited_at: string | null
  edit_history: any
  is_pinned: boolean
  is_important: boolean
  is_system_message: boolean
  is_formatted: boolean
  formatting: any
  is_ephemeral: boolean
  expires_at: string | null
  auto_delete_after_seconds: number | null
  metadata: any
  client_id: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseChatOptions {
  roomId?: string
  roomType?: RoomType | 'all'
  status?: ChatStatus | 'all'
  limit?: number
}

export function useChat(options: UseChatOptions = {}) {
  const { roomId, roomType, status, limit } = options

  const filters: Record<string, any> = {}
  if (roomId) filters.room_id = roomId
  if (roomType && roomType !== 'all') filters.room_type = roomType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'chat',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<ChatMessage>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'chat',
    onSuccess: refetch
  })

  return {
    chatMessages: data,
    loading,
    error,
    mutating,
    sendMessage: create,
    updateMessage: update,
    deleteMessage: remove,
    refetch
  }
}
