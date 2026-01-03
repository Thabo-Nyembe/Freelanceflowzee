'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('logistics-actions')

// Types
export interface LogisticsRouteInput {
  name: string
  description?: string
  route_type: 'local' | 'regional' | 'national' | 'international' | 'express'
  origin_address?: string
  origin_city?: string
  origin_state?: string
  origin_country?: string
  origin_postal_code?: string
  origin_lat?: number
  origin_lng?: number
  destination_address?: string
  destination_city?: string
  destination_state?: string
  destination_country?: string
  destination_postal_code?: string
  destination_lat?: number
  destination_lng?: number
  assigned_driver?: string
  assigned_vehicle?: string
  scheduled_start?: string
  scheduled_end?: string
  estimated_distance_km?: number
  estimated_duration_minutes?: number
  fuel_cost?: number
  labor_cost?: number
  toll_cost?: number
  other_costs?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface RouteStopInput {
  route_id: string
  stop_number: number
  stop_type: 'pickup' | 'delivery' | 'waypoint' | 'rest' | 'fuel'
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  lat?: number
  lng?: number
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  scheduled_arrival?: string
  scheduled_departure?: string
  time_window_start?: string
  time_window_end?: string
  service_time_minutes?: number
  notes?: string
  metadata?: Record<string, any>
}

export interface FleetVehicleInput {
  name: string
  description?: string
  vehicle_type: 'van' | 'truck' | 'semi' | 'pickup' | 'car' | 'motorcycle' | 'bicycle' | 'drone'
  make?: string
  model?: string
  year?: number
  license_plate?: string
  vin?: string
  color?: string
  capacity_weight_kg?: number
  capacity_volume_m3?: number
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng'
  fuel_efficiency?: number
  current_mileage?: number
  insurance_expiry?: string
  registration_expiry?: string
  last_maintenance?: string
  next_maintenance?: string
  gps_device_id?: string
  current_lat?: number
  current_lng?: number
  notes?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// Logistics Route Actions
export async function createLogisticsRoute(input: LogisticsRouteInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('logistics_routes')
      .insert([{
        ...input,
        user_id: user.id,
        status: 'planned',
        total_stops: 0,
        completed_stops: 0,
        total_packages: 0,
        delivered_packages: 0,
        actual_distance_km: 0,
        actual_duration_minutes: 0,
        total_cost: (input.fuel_cost || 0) + (input.labor_cost || 0) + (input.toll_cost || 0) + (input.other_costs || 0),
        progress_percent: 0
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create logistics route', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Logistics route created successfully', { routeId: data.id })
    revalidatePath('/dashboard/logistics-v2')
    return actionSuccess(data, 'Logistics route created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating logistics route', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateLogisticsRoute(id: string, updates: Partial<LogisticsRouteInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Recalculate total cost if any cost field is updated
    let totalCost: number | undefined
    if (updates.fuel_cost !== undefined || updates.labor_cost !== undefined ||
        updates.toll_cost !== undefined || updates.other_costs !== undefined) {
      const { data: current } = await supabase
        .from('logistics_routes')
        .select('fuel_cost, labor_cost, toll_cost, other_costs')
        .eq('id', id)
        .single()

      if (current) {
        totalCost = (updates.fuel_cost ?? current.fuel_cost ?? 0) +
                    (updates.labor_cost ?? current.labor_cost ?? 0) +
                    (updates.toll_cost ?? current.toll_cost ?? 0) +
                    (updates.other_costs ?? current.other_costs ?? 0)
      }
    }

    const { data, error } = await supabase
      .from('logistics_routes')
      .update({
        ...updates,
        ...(totalCost !== undefined ? { total_cost: totalCost } : {}),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update logistics route', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Logistics route updated successfully', { routeId: id })
    revalidatePath('/dashboard/logistics-v2')
    return actionSuccess(data, 'Logistics route updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating logistics route', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteLogisticsRoute(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('logistics_routes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete logistics route', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Logistics route deleted successfully', { routeId: id })
    revalidatePath('/dashboard/logistics-v2')
    return actionSuccess({ success: true }, 'Logistics route deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting logistics route', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startRoute(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('logistics_routes')
      .update({
        status: 'in-progress',
        actual_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start route', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Route started successfully', { routeId: id })
    revalidatePath('/dashboard/logistics-v2')
    return actionSuccess(data, 'Route started successfully')
  } catch (error: any) {
    logger.error('Unexpected error starting route', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeRoute(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get route to calculate actual duration
    const { data: route } = await supabase
      .from('logistics_routes')
      .select('actual_start, total_stops')
      .eq('id', id)
      .single()

    const actualStart = route?.actual_start ? new Date(route.actual_start) : new Date()
    const duration = Math.floor((Date.now() - actualStart.getTime()) / 60000)

    const { data, error } = await supabase
      .from('logistics_routes')
      .update({
        status: 'completed',
        actual_end: new Date().toISOString(),
        actual_duration_minutes: duration,
        completed_stops: route?.total_stops || 0,
        progress_percent: 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete route', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Route completed successfully', { routeId: id })
    revalidatePath('/dashboard/logistics-v2')
    return actionSuccess(data, 'Route completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error completing route', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function delayRoute(id: string, reason?: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('logistics_routes')
    .update({
      status: 'delayed',
      notes: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function cancelRoute(id: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('logistics_routes')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function updateRouteProgress(id: string, progress: number, distance?: number) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('logistics_routes')
    .update({
      progress_percent: Math.min(100, Math.max(0, progress)),
      ...(distance !== undefined ? { actual_distance_km: distance } : {}),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function getLogisticsRoutes() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('logistics_routes')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLogisticsRoute(id: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('logistics_routes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

// Route Stop Actions
export async function createRouteStop(input: RouteStopInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('route_stops')
    .insert([{
      ...input,
      status: 'pending',
      packages_to_pickup: 0,
      packages_to_deliver: 0,
      packages_picked_up: 0,
      packages_delivered: 0
    }])
    .select()
    .single()

  if (error) throw error

  // Update route total stops
  await supabase.rpc('increment_route_stops', { route_id: input.route_id })

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function updateRouteStop(id: string, updates: Partial<RouteStopInput>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('route_stops')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function arriveAtStop(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('route_stops')
    .update({
      status: 'arrived',
      actual_arrival: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function completeStop(id: string, notes?: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('route_stops')
    .update({
      status: 'completed',
      actual_departure: new Date().toISOString(),
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Update route completed stops
  if (data?.route_id) {
    await supabase.rpc('increment_completed_stops', { route_id: data.route_id })
  }

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function skipStop(id: string, reason?: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('route_stops')
    .update({
      status: 'skipped',
      notes: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function getRouteStops(routeId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('route_stops')
    .select('*')
    .eq('route_id', routeId)
    .order('stop_number', { ascending: true })

  if (error) throw error
  return data || []
}

// Fleet Vehicle Actions
export async function createFleetVehicle(input: FleetVehicleInput) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('fleet_vehicles')
    .insert([{
      ...input,
      user_id: user.id,
      status: 'available',
      total_trips: 0,
      total_distance_km: 0,
      total_hours: 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function updateFleetVehicle(id: string, updates: Partial<FleetVehicleInput>) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('fleet_vehicles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function deleteFleetVehicle(id: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('fleet_vehicles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return { success: true }
}

export async function updateVehicleStatus(
  id: string,
  status: 'available' | 'in-use' | 'maintenance' | 'out-of-service' | 'retired'
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('fleet_vehicles')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function updateVehicleLocation(id: string, lat: number, lng: number) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('fleet_vehicles')
    .update({
      current_lat: lat,
      current_lng: lng,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/logistics-v2')
  return data
}

export async function getFleetVehicles() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('fleet_vehicles')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getFleetVehicle(id: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('fleet_vehicles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}
