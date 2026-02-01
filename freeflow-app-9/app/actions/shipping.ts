'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('shipping-actions')

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
export async function fetchShipments(): Promise<ActionResult<Shipment[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    return actionSuccess(data || [], 'Shipments fetched successfully')
  } catch (error) {
    logger.error('Error fetching shipments:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create shipment
export async function createShipment(shipment: Partial<Shipment>): Promise<ActionResult<Shipment>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('shipments')
      .insert([{ ...shipment, user_id: user.id }])
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Shipment created successfully')
  } catch (error) {
    logger.error('Error creating shipment:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update shipment
export async function updateShipment(id: string, updates: Partial<Shipment>): Promise<ActionResult<Shipment>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Shipment updated successfully')
  } catch (error) {
    logger.error('Error updating shipment:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete shipment (soft delete)
export async function deleteShipment(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('shipments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(undefined, 'Shipment deleted successfully')
  } catch (error) {
    logger.error('Error deleting shipment:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Mark as shipped
export async function markAsShipped(id: string, trackingNumber?: string): Promise<ActionResult<Shipment>> {
  try {
    const supabase = await createClient()

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Shipment marked as shipped successfully')
  } catch (error) {
    logger.error('Error marking shipment as shipped:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Mark as delivered
export async function markAsDelivered(id: string, signatureName?: string): Promise<ActionResult<Shipment>> {
  try {
    const supabase = await createClient()

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

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Shipment marked as delivered successfully')
  } catch (error) {
    logger.error('Error marking shipment as delivered:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Cancel shipment
export async function cancelShipment(id: string, reason?: string): Promise<ActionResult<Shipment>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shipments')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Shipment cancelled successfully')
  } catch (error) {
    logger.error('Error cancelling shipment:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Mark as returned
export async function markAsReturned(id: string, reason?: string): Promise<ActionResult<Shipment>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shipments')
      .update({
        status: 'returned',
        notes: reason ? `Returned: ${reason}` : 'Returned'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Shipment marked as returned successfully')
  } catch (error) {
    logger.error('Error marking shipment as returned:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Add tracking event
export async function addTrackingEvent(shipmentId: string, event: Partial<ShipmentTracking>): Promise<ActionResult<ShipmentTracking>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shipment_tracking')
      .insert([{
        ...event,
        shipment_id: shipmentId,
        timestamp: event.timestamp || new Date().toISOString()
      }])
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Tracking event added successfully')
  } catch (error) {
    logger.error('Error adding tracking event:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Fetch tracking history
export async function fetchTrackingHistory(shipmentId: string): Promise<ActionResult<ShipmentTracking[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shipment_tracking')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('timestamp', { ascending: false })

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    return actionSuccess(data || [], 'Tracking history fetched successfully')
  } catch (error) {
    logger.error('Error fetching tracking history:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Fetch all carriers
export async function fetchCarriers(): Promise<ActionResult<ShippingCarrier[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('shipping_carriers')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    return actionSuccess(data || [], 'Carriers fetched successfully')
  } catch (error) {
    logger.error('Error fetching carriers:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create carrier
export async function createCarrier(carrier: Partial<ShippingCarrier>): Promise<ActionResult<ShippingCarrier>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('shipping_carriers')
      .insert([{ ...carrier, user_id: user.id }])
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Carrier created successfully')
  } catch (error) {
    logger.error('Error creating carrier:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update carrier
export async function updateCarrier(id: string, updates: Partial<ShippingCarrier>): Promise<ActionResult<ShippingCarrier>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('shipping_carriers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(data, 'Carrier updated successfully')
  } catch (error) {
    logger.error('Error updating carrier:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete carrier (soft delete)
export async function deleteCarrier(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('shipping_carriers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return actionError(error.message, 'DATABASE_ERROR')

    revalidatePath('/dashboard/shipping-v2')
    return actionSuccess(undefined, 'Carrier deleted successfully')
  } catch (error) {
    logger.error('Error deleting carrier:', error)
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
