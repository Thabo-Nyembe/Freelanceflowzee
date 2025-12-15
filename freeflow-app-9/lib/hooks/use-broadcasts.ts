// Hook for Broadcasts management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type BroadcastType = 'email' | 'sms' | 'push' | 'in-app' | 'webhook' | 'multi-channel'
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'paused'
export type RecipientType = 'all' | 'segment' | 'custom' | 'tags' | 'individual'

export interface Broadcast {
  id: string
  user_id: string
  organization_id: string | null
  title: string
  message: string
  broadcast_type: BroadcastType
  status: BroadcastStatus
  scheduled_for: string | null
  sent_at: string | null
  recipient_type: RecipientType
  recipient_count: number
  recipient_list: any
  recipient_filters: any
  sender_name: string | null
  sender_email: string | null
  reply_to: string | null
  subject: string | null
  html_content: string | null
  plain_text_content: string | null
  template_id: string | null
  variables: any
  delivered_count: number
  opened_count: number
  clicked_count: number
  bounced_count: number
  failed_count: number
  unsubscribed_count: number
  open_rate: number
  click_rate: number
  bounce_rate: number
  is_ab_test: boolean
  ab_test_variants: any
  winning_variant: string | null
  track_opens: boolean
  track_clicks: boolean
  tracking_domain: string | null
  attachments: any
  estimated_cost: number | null
  actual_cost: number | null
  tags: any
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseBroadcastsOptions {
  status?: BroadcastStatus | 'all'
  broadcastType?: BroadcastType | 'all'
  limit?: number
}

export function useBroadcasts(options: UseBroadcastsOptions = {}) {
  const { status, broadcastType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (broadcastType && broadcastType !== 'all') filters.broadcast_type = broadcastType

  const queryOptions: any = {
    table: 'broadcasts',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Broadcast>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'broadcasts',
    onSuccess: refetch
  })

  return {
    broadcasts: data,
    loading,
    error,
    mutating,
    createBroadcast: create,
    updateBroadcast: update,
    deleteBroadcast: remove,
    refetch
  }
}
