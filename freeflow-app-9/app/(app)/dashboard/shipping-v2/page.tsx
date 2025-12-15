import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ShippingClient from './shipping-client'

export const dynamic = 'force-dynamic'

/**
 * Shipping V2 - Shipment Management & Tracking
 * Server-side rendered with real-time client updates
 */
export default async function ShippingV2Page() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()

  let shipments: any[] = []
  let stats = {
    total: 0,
    pending: 0,
    shipped: 0,
    inTransit: 0,
    delivered: 0,
    returned: 0,
    cancelled: 0,
    totalCost: 0,
    avgDeliveryDays: 3.5,
    onTimeRate: 94.5
  }

  if (user) {
    // Fetch shipments
    const { data: shipmentsData } = await supabase
      .from('shipments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    shipments = shipmentsData || []

    if (shipments.length > 0) {
      stats = {
        total: shipments.length,
        pending: shipments.filter(s => s.status === 'pending' || s.status === 'processing').length,
        shipped: shipments.filter(s => s.status === 'shipped').length,
        inTransit: shipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery').length,
        delivered: shipments.filter(s => s.status === 'delivered').length,
        returned: shipments.filter(s => s.status === 'returned').length,
        cancelled: shipments.filter(s => s.status === 'cancelled').length,
        totalCost: shipments.reduce((sum, s) => sum + (s.total_cost || 0), 0),
        avgDeliveryDays: 3.5,
        onTimeRate: 94.5
      }
    }
  }

  return (
    <ShippingClient
      initialShipments={shipments}
      initialStats={stats}
    />
  )
}
