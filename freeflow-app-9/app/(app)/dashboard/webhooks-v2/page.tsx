import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import WebhooksClient from './webhooks-client'

export const dynamic = 'force-dynamic'

/**
 * Webhooks V2 - Groundbreaking Webhook Management
 * Server-side rendered with real-time client updates
 */
export default async function WebhooksV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let webhooks: any[] = []
  let eventTypes: any[] = []
  let stats = {
    total: 0,
    active: 0,
    paused: 0,
    failed: 0,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    avgSuccessRate: 100,
    avgResponseTime: 0
  }

  if (user) {
    // Fetch webhooks
    const { data: webhooksData } = await supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    // Fetch event types
    const { data: eventTypesData } = await supabase
      .from('webhook_event_types')
      .select('*')
      .eq('user_id', user.id)
      .order('total_deliveries', { ascending: false })
      .limit(20)

    webhooks = webhooksData || []
    eventTypes = eventTypesData || []

    if (webhooks.length > 0) {
      stats = {
        total: webhooks.length,
        active: webhooks.filter(w => w.status === 'active').length,
        paused: webhooks.filter(w => w.status === 'paused').length,
        failed: webhooks.filter(w => w.status === 'failed').length,
        totalDeliveries: webhooks.reduce((sum, w) => sum + (w.total_deliveries || 0), 0),
        successfulDeliveries: webhooks.reduce((sum, w) => sum + (w.successful_deliveries || 0), 0),
        avgSuccessRate: webhooks.reduce((sum, w) => sum + (w.success_rate || 100), 0) / webhooks.length,
        avgResponseTime: webhooks.reduce((sum, w) => sum + (w.avg_response_time_ms || 0), 0) / webhooks.length
      }
    }
  }

  return (
    <WebhooksClient
      initialWebhooks={webhooks}
      initialEventTypes={eventTypes}
      initialStats={stats}
    />
  )
}
