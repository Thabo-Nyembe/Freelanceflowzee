'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
export interface Shipment {
  id: string
  user_id: string
  shipment_code: string
  order_id: string | null
  order_number: string | null
  carrier_id: string | null
  carrier_name: string | null
  tracking_number: string | null
  tracking_url: string | null
  status: 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'
  shipping_method: string | null
  service_type: string | null
  origin_address: any
  destination_address: any
  package_details: any
  weight: number | null
  weight_unit: 'kg' | 'lb' | 'oz' | 'g'
  dimensions: any | null
  shipping_cost: number
  insurance_cost: number
  total_cost: number
  currency: string
  estimated_delivery: string | null
  actual_delivery: string | null
  shipped_at: string | null
  delivered_at: string | null
  signature_required: boolean
  signature_name: string | null
  insurance_value: number | null
  customs_declaration: Record<string, any> | null
  special_instructions: string | null
  labels: string[]
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ShipmentTracking {
  id: string
  shipment_id: string
  status: string
  status_detail: string | null
  location: string | null
  location_detail: string | null
  carrier_status_code: string | null
  timestamp: string
  is_exception: boolean
  exception_type: string | null
  signed_by: string | null
  created_at: string
}

export interface ShippingCarrier {
  id: string
  user_id: string
  name: string
  code: string
  logo_url: string | null
  tracking_url_template: string | null
  website: string | null
  phone: string | null
  is_active: boolean
  supports_international: boolean
  supports_tracking: boolean
  supports_insurance: boolean
  account_number: string | null
  api_key: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Fetch all shipments
export async function fetchShipments() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create shipment
export async function createShipment(shipment: Partial<Shipment>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('shipments')
    .insert([{ ...shipment, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Update shipment
export async function updateShipment(id: string, updates: Partial<Shipment>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Delete shipment (soft delete)
export async function deleteShipment(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from('shipments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, success: true }
}

// Mark as shipped
export async function markAsShipped(id: string, trackingNumber?: string) {
  const supabase = createServerActionClient({ cookies })

  const updates: Partial<Shipment> = {
    status: 'shipped',
    shipped_at: new Date().toISOString()
  }
  if (trackingNumber) {
    updates.tracking_number = trackingNumber
  }

  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Mark as delivered
export async function markAsDelivered(id: string, signatureName?: string) {
  const supabase = createServerActionClient({ cookies })

  const updates: Partial<Shipment> = {
    status: 'delivered',
    delivered_at: new Date().toISOString(),
    actual_delivery: new Date().toISOString()
  }
  if (signatureName) {
    updates.signature_name = signatureName
  }

  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Cancel shipment
export async function cancelShipment(id: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('shipments')
    .update({
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Mark as returned
export async function markAsReturned(id: string, reason?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('shipments')
    .update({
      status: 'returned',
      notes: reason ? `Returned: ${reason}` : 'Returned'
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Add tracking event
export async function addTrackingEvent(shipmentId: string, event: Partial<ShipmentTracking>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('shipment_tracking')
    .insert([{
      ...event,
      shipment_id: shipmentId,
      timestamp: event.timestamp || new Date().toISOString()
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Fetch tracking history
export async function fetchTrackingHistory(shipmentId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('shipment_tracking')
    .select('*')
    .eq('shipment_id', shipmentId)
    .order('timestamp', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Fetch all carriers
export async function fetchCarriers() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('shipping_carriers')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create carrier
export async function createCarrier(carrier: Partial<ShippingCarrier>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('shipping_carriers')
    .insert([{ ...carrier, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Update carrier
export async function updateCarrier(id: string, updates: Partial<ShippingCarrier>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('shipping_carriers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, data }
}

// Delete carrier (soft delete)
export async function deleteCarrier(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from('shipping_carriers')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/shipping-v2')
  return { error: null, success: true }
}
