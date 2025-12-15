import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SalesClient from './sales-client'

export const dynamic = 'force-dynamic'

export default async function SalesV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let deals: any[] = []
  let stages: any[] = []

  if (user) {
    const [dealsResult, stagesResult] = await Promise.all([
      supabase
        .from('sales_deals')
        .select('*')
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
      supabase
        .from('sales_pipeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('stage_order', { ascending: true })
    ])

    deals = dealsResult.data || []
    stages = stagesResult.data || []
  }

  return <SalesClient initialDeals={deals} initialStages={stages} />
}
