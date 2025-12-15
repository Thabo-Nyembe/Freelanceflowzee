import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MarketingClient from './marketing-client'

export const dynamic = 'force-dynamic'

export default async function MarketingV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let campaigns: any[] = []
  let channels: any[] = []

  if (user) {
    const [campaignsResult, channelsResult] = await Promise.all([
      supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      supabase
        .from('marketing_channels')
        .select('*')
        .eq('user_id', user.id)
        .order('total_reach', { ascending: false })
    ])

    campaigns = campaignsResult.data || []
    channels = channelsResult.data || []
  }

  return <MarketingClient initialCampaigns={campaigns} initialChannels={channels} />
}
