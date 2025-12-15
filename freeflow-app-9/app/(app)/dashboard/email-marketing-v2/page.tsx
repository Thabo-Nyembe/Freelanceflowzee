import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import EmailMarketingClient from './email-marketing-client'

export const dynamic = 'force-dynamic'

export default async function EmailMarketingV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let campaigns: any[] = []
  let subscribers: any[] = []
  let templates: any[] = []

  if (user) {
    const [campaignsResult, subscribersResult, templatesResult] = await Promise.all([
      supabase
        .from('email_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      supabase
        .from('email_subscribers')
        .select('*')
        .eq('user_id', user.id)
        .order('subscribed_at', { ascending: false })
        .limit(100),
      supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
    ])

    campaigns = campaignsResult.data || []
    subscribers = subscribersResult.data || []
    templates = templatesResult.data || []
  }

  return (
    <EmailMarketingClient
      initialCampaigns={campaigns}
      initialSubscribers={subscribers}
      initialTemplates={templates}
    />
  )
}
