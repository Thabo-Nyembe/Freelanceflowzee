'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

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
  origin_address: ShippingAddress
  destination_address: ShippingAddress
  package_details: PackageDetails
  weight: number | null
  weight_unit: 'kg' | 'lb' | 'oz' | 'g'
  dimensions: Dimensions | null
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

export interface ShippingAddress {
  name: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  email?: string
}

export interface PackageDetails {
  type: 'box' | 'envelope' | 'tube' | 'custom'
  items_count: number
  description?: string
  contents?: string[]
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
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

export interface ShippingStats {
  total: number
  pending: number
  shipped: number
  inTransit: number
  delivered: number
  returned: number
  cancelled: number
  totalCost: number
  avgDeliveryDays: number
  onTimeRate: number
}

export function useShipments() {
  const supabase = createClient()
  const { toast } = useToast()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch shipments
  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setShipments(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch shipments', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Create shipment
  const createShipment = async (shipment: Partial<Shipment>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('shipments')
        .insert([{ ...shipment, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setShipments(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Shipment created successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Update shipment
  const updateShipment = async (id: string, updates: Partial<Shipment>) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setShipments(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Shipment updated successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delete shipment (soft delete)
  const deleteShipment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setShipments(prev => prev.filter(s => s.id !== id))
      toast({ title: 'Success', description: 'Shipment deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Mark as shipped
  const markAsShipped = async (id: string, trackingNumber?: string) => {
    try {
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

      if (error) throw error
      setShipments(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Shipment marked as shipped' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Mark as delivered
  const markAsDelivered = async (id: string, signatureName?: string) => {
    try {
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

      if (error) throw error
      setShipments(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Shipment marked as delivered' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Cancel shipment
  const cancelShipment = async (id: string, reason?: string) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update({
          status: 'cancelled',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setShipments(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Shipment cancelled' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Mark as returned
  const markAsReturned = async (id: string, reason?: string) => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update({
          status: 'returned',
          notes: reason ? `Returned: ${reason}` : 'Returned'
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setShipments(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Shipment marked as returned' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Calculate stats
  const getStats = useCallback((): ShippingStats => {
    const delivered = shipments.filter(s => s.status === 'delivered')
    const totalCost = shipments.reduce((sum, s) => sum + (s.total_cost || 0), 0)

    return {
      total: shipments.length,
      pending: shipments.filter(s => s.status === 'pending' || s.status === 'processing').length,
      shipped: shipments.filter(s => s.status === 'shipped').length,
      inTransit: shipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery').length,
      delivered: delivered.length,
      returned: shipments.filter(s => s.status === 'returned').length,
      cancelled: shipments.filter(s => s.status === 'cancelled').length,
      totalCost,
      avgDeliveryDays: 3.5, // Calculate from actual data
      onTimeRate: 94.5 // Calculate from actual data
    }
  }, [shipments])

  // Real-time subscription
  useEffect(() => {
    fetchShipments()

    const channel = supabase
      .channel('shipments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setShipments(prev => [payload.new as Shipment, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setShipments(prev => prev.map(s => s.id === payload.new.id ? payload.new as Shipment : s))
        } else if (payload.eventType === 'DELETE') {
          setShipments(prev => prev.filter(s => s.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchShipments, supabase])

  return {
    shipments,
    loading,
    error,
    fetchShipments,
    createShipment,
    updateShipment,
    deleteShipment,
    markAsShipped,
    markAsDelivered,
    cancelShipment,
    markAsReturned,
    getStats
  }
}

// Hook for shipment tracking
export function useShipmentTracking(shipmentId: string) {
  const supabase = createClient()
  const { toast } = useToast()
  const [tracking, setTracking] = useState<ShipmentTracking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTracking = useCallback(async () => {
    if (!shipmentId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('shipment_tracking')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      setTracking(data || [])
    } catch (err) {
      console.error('Failed to fetch tracking:', err)
    } finally {
      setLoading(false)
    }
  }, [shipmentId, supabase])

  const addTrackingEvent = async (event: Partial<ShipmentTracking>) => {
    try {
      const { data, error } = await supabase
        .from('shipment_tracking')
        .insert([{
          ...event,
          shipment_id: shipmentId,
          timestamp: event.timestamp || new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      setTracking(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Tracking event added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchTracking()

    if (shipmentId) {
      const channel = supabase
        .channel(`shipment-tracking-${shipmentId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'shipment_tracking',
          filter: `shipment_id=eq.${shipmentId}`
        }, (payload) => {
          setTracking(prev => [payload.new as ShipmentTracking, ...prev])
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchTracking, shipmentId, supabase])

  return { tracking, loading, addTrackingEvent }
}

// Hook for shipping carriers
export function useShippingCarriers() {
  const supabase = createClient()
  const { toast } = useToast()
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCarriers = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shipping_carriers')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) throw error
      setCarriers(data || [])
    } catch (err) {
      console.error('Failed to fetch carriers:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createCarrier = async (carrier: Partial<ShippingCarrier>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('shipping_carriers')
        .insert([{ ...carrier, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setCarriers(prev => [...prev, data])
      toast({ title: 'Success', description: 'Carrier added' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const updateCarrier = async (id: string, updates: Partial<ShippingCarrier>) => {
    try {
      const { data, error } = await supabase
        .from('shipping_carriers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCarriers(prev => prev.map(c => c.id === id ? data : c))
      toast({ title: 'Success', description: 'Carrier updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  const deleteCarrier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shipping_carriers')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setCarriers(prev => prev.filter(c => c.id !== id))
      toast({ title: 'Success', description: 'Carrier deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchCarriers()

    const channel = supabase
      .channel('shipping-carriers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipping_carriers' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCarriers(prev => [...prev, payload.new as ShippingCarrier])
        } else if (payload.eventType === 'UPDATE') {
          setCarriers(prev => prev.map(c => c.id === payload.new.id ? payload.new as ShippingCarrier : c))
        } else if (payload.eventType === 'DELETE') {
          setCarriers(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchCarriers, supabase])

  return {
    carriers,
    loading,
    createCarrier,
    updateCarrier,
    deleteCarrier
  }
}
