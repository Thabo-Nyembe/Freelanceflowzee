import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type CampaignType = 'email' | 'sms' | 'social' | 'display' | 'search' | 'video' | 'influencer' | 'affiliate' | 'content' | 'multi_channel'
export type CampaignStatus = 'draft' | 'planned' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'archived'

export interface Campaign {
  id: string
  user_id: string
  campaign_name: string
  description?: string
  campaign_type: CampaignType
  status: CampaignStatus
  phase: string
  start_date?: string
  end_date?: string
  launched_at?: string
  completed_at?: string
  duration_days?: number
  budget_total: number
  budget_spent: number
  budget_remaining: number
  cost_per_lead?: number
  cost_per_acquisition?: number
  roi_percentage?: number
  currency: string
  goal_type?: string
  target_audience?: string
  target_reach?: number
  target_conversions?: number
  target_revenue?: number
  audience_size: number
  segment_ids?: string[]
  segment_criteria: any
  targeting_config: any
  content: any
  creative_assets: any
  landing_page_url?: string
  tracking_urls: any
  channels?: string[]
  primary_channel?: string
  channel_config: any
  impressions: number
  clicks: number
  conversions: number
  leads_generated: number
  sales_generated: number
  revenue_generated: number
  engagement_rate?: number
  click_through_rate?: number
  conversion_rate?: number
  bounce_rate?: number
  unsubscribe_rate?: number
  likes_count: number
  shares_count: number
  comments_count: number
  followers_gained: number
  emails_sent: number
  emails_delivered: number
  emails_opened: number
  emails_clicked: number
  open_rate?: number
  click_rate?: number
  is_ab_test: boolean
  ab_test_config: any
  winning_variant?: string
  is_automated: boolean
  automation_id?: string
  automation_config: any
  owner_id?: string
  team_members?: string[]
  assigned_to?: string
  requires_approval: boolean
  approved: boolean
  approved_at?: string
  approved_by?: string
  tags?: string[]
  category?: string
  industry?: string
  product_ids?: string[]
  external_campaign_id?: string
  external_platform?: string
  sync_status?: string
  last_synced_at?: string
  notes?: string
  learnings?: string
  success_factors?: string
  created_by?: string
  updated_by?: string
  metadata: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseCampaignsOptions {
  campaignType?: CampaignType | 'all'
  status?: CampaignStatus | 'all'
  limit?: number
}

export function useCampaigns(options: UseCampaignsOptions = {}) {
  const { campaignType, status, limit } = options

  const filters: Record<string, any> = {}
  if (campaignType && campaignType !== 'all') filters.campaign_type = campaignType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'campaigns',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Campaign>(queryOptions)

  const { mutate: create } = useSupabaseMutation<Campaign>({
    table: 'campaigns',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<Campaign>({
    table: 'campaigns',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<Campaign>({
    table: 'campaigns',
    operation: 'delete'
  })

  return {
    campaigns: data,
    loading,
    error,
    createCampaign: create,
    updateCampaign: update,
    deleteCampaign: remove,
    refetch
  }
}
