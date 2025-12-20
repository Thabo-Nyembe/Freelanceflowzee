'use server'

/**
 * Extended Routes Server Actions
 * Tables: routes, route_stops, route_schedules, route_vehicles, route_drivers, route_tracking
 */

import { createClient } from '@/lib/supabase/server'

export async function getRoute(routeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('routes').select('*, route_stops(*), route_schedules(*), route_vehicles(*), route_drivers(*)').eq('id', routeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRoute(routeData: { name: string; code?: string; description?: string; type?: string; origin_id?: string; destination_id?: string; distance?: number; estimated_duration?: number; stops?: { location_id: string; stop_order: number; duration?: number }[]; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { stops, ...routeInfo } = routeData; const routeCode = routeData.code || `RT-${Date.now()}`; const { data: route, error: routeError } = await supabase.from('routes').insert({ ...routeInfo, code: routeCode, is_active: routeInfo.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (routeError) throw routeError; if (stops && stops.length > 0) { const stopsData = stops.map(s => ({ route_id: route.id, ...s, created_at: new Date().toISOString() })); await supabase.from('route_stops').insert(stopsData) } return { success: true, data: route } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRoute(routeId: string, updates: Partial<{ name: string; description: string; type: string; distance: number; estimated_duration: number; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('routes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', routeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRoute(routeId: string) {
  try { const supabase = await createClient(); await supabase.from('route_stops').delete().eq('route_id', routeId); await supabase.from('route_schedules').delete().eq('route_id', routeId); const { error } = await supabase.from('routes').delete().eq('id', routeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRoutes(options?: { type?: string; origin_id?: string; destination_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('routes').select('*, route_stops(count), route_schedules(count)'); if (options?.type) query = query.eq('type', options.type); if (options?.origin_id) query = query.eq('origin_id', options.origin_id); if (options?.destination_id) query = query.eq('destination_id', options.destination_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRouteStop(routeId: string, stopData: { location_id: string; stop_order: number; name?: string; duration?: number; is_pickup?: boolean; is_dropoff?: boolean; coordinates?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_stops').insert({ route_id: routeId, ...stopData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRouteStops(routeId: string, stops: { id?: string; location_id: string; stop_order: number; duration?: number }[]) {
  try { const supabase = await createClient(); await supabase.from('route_stops').delete().eq('route_id', routeId); const stopsData = stops.map(s => ({ route_id: routeId, ...s, created_at: new Date().toISOString() })); const { error } = await supabase.from('route_stops').insert(stopsData); if (error) throw error; await supabase.from('routes').update({ updated_at: new Date().toISOString() }).eq('id', routeId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRouteStops(routeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_stops').select('*, locations(*)').eq('route_id', routeId).order('stop_order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRouteSchedule(scheduleData: { route_id: string; vehicle_id?: string; driver_id?: string; departure_time: string; arrival_time?: string; days_of_week?: number[]; effective_from?: string; effective_until?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_schedules').insert({ ...scheduleData, is_active: scheduleData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRouteSchedules(routeId: string, options?: { is_active?: boolean; from_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('route_schedules').select('*, route_vehicles(*), route_drivers(*), vehicles(*), users(*)').eq('route_id', routeId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.from_date) query = query.or(`effective_until.is.null,effective_until.gte.${options.from_date}`); const { data, error } = await query.order('departure_time', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignVehicleToRoute(routeId: string, vehicleId: string, assignedBy: string, effectiveFrom?: string, effectiveUntil?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_vehicles').insert({ route_id: routeId, vehicle_id: vehicleId, assigned_by: assignedBy, assigned_at: new Date().toISOString(), effective_from: effectiveFrom || new Date().toISOString(), effective_until: effectiveUntil, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignDriverToRoute(routeId: string, driverId: string, assignedBy: string, effectiveFrom?: string, effectiveUntil?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_drivers').insert({ route_id: routeId, driver_id: driverId, assigned_by: assignedBy, assigned_at: new Date().toISOString(), effective_from: effectiveFrom || new Date().toISOString(), effective_until: effectiveUntil, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackRoute(trackingData: { route_id: string; schedule_id?: string; vehicle_id: string; driver_id?: string; current_stop_id?: string; coordinates: any; speed?: number; heading?: number; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('route_tracking').insert({ ...trackingData, tracked_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRouteTracking(routeId: string, options?: { from_time?: string; to_time?: string; vehicle_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('route_tracking').select('*, route_stops(*), vehicles(*)').eq('route_id', routeId); if (options?.vehicle_id) query = query.eq('vehicle_id', options.vehicle_id); if (options?.from_time) query = query.gte('tracked_at', options.from_time); if (options?.to_time) query = query.lte('tracked_at', options.to_time); const { data, error } = await query.order('tracked_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActiveRoutes(options?: { type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('routes').select('*, route_tracking(count)').eq('is_active', true); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function optimizeRoute(routeId: string) {
  try { const supabase = await createClient(); const { data: stops } = await supabase.from('route_stops').select('*, locations(*)').eq('route_id', routeId).order('stop_order', { ascending: true }); return { success: true, data: { original: stops, optimized: stops } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

