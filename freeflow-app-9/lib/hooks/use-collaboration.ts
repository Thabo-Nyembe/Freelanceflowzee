'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type SessionType = 'document' | 'whiteboard' | 'code' | 'design' | 'video' | 'audio' | 'screen_share' | 'meeting'
export type SessionStatus = 'active' | 'scheduled' | 'in_progress' | 'paused' | 'ended' | 'archived'
export type AccessType = 'public' | 'invite_only' | 'password_protected' | 'restricted'
export type UserRole = 'owner' | 'editor' | 'commenter' | 'viewer'

export interface CollaborationSession {
  id: string
  user_id: string
  session_name: string
  description?: string
  session_type: SessionType
  host_id: string
  participants?: any[]
  participant_count: number
  max_participants: number
  active_participants: number
  access_type: AccessType
  access_code?: string
  invite_link?: string
  password_hash?: string
  permissions?: any
  default_role: UserRole
  can_invite_others: boolean
  can_edit: boolean
  can_comment: boolean
  is_active: boolean
  started_at?: string
  ended_at?: string
  duration_seconds?: number
  active_users?: any[]
  user_cursors?: any
  user_selections?: any
  content_type?: string
  content_id?: string
  content_data?: any
  content_url?: string
  changes?: any[]
  change_count: number
  version: number
  version_history?: any[]
  comments?: any[]
  comment_count: number
  annotations?: any[]
  annotation_count: number
  chat_enabled: boolean
  chat_messages?: any[]
  message_count: number
  video_enabled: boolean
  audio_enabled: boolean
  screen_share_enabled: boolean
  recording_enabled: boolean
  is_recording: boolean
  recording_url?: string
  recording_duration_seconds?: number
  recording_size_bytes?: number
  notify_on_join: boolean
  notify_on_change: boolean
  notify_on_comment: boolean
  notification_settings?: any
  last_activity_at?: string
  activity_log?: any[]
  total_edits: number
  total_comments: number
  conflict_resolution_strategy: string
  has_conflicts: boolean
  conflicts?: any[]
  integrated_tools?: string[]
  webhook_url?: string
  api_enabled: boolean
  scheduled_start?: string
  scheduled_end?: string
  is_scheduled: boolean
  status: SessionStatus
  settings?: any
  theme?: string
  language: string
  tags?: string[]
  category?: string
  priority?: string
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCollaborationOptions {
  sessionType?: SessionType | 'all'
  status?: SessionStatus | 'all'
  limit?: number
}

export function useCollaboration(options: UseCollaborationOptions = {}) {
  const { sessionType, status, limit } = options

  const filters: Record<string, any> = {}
  if (sessionType && sessionType !== 'all') filters.session_type = sessionType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'collaboration',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<CollaborationSession>(queryOptions)

  const { mutate: createSession } = useSupabaseMutation({
    table: 'collaboration',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateSession } = useSupabaseMutation({
    table: 'collaboration',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteSession } = useSupabaseMutation({
    table: 'collaboration',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    sessions: data,
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    refetch
  }
}
