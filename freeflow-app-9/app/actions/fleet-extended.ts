'use server'

/**
 * Extended Fleet Server Actions
 * Tables: fleet_vehicles, fleet_drivers, fleet_trips, fleet_maintenance, fleet_fuel_logs, fleet_routes
 */

import { createClient } from '@/lib/supabase/server'

export async function getVehicle(vehicleId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_vehicles').select('*, fleet_drivers(*), fleet_maintenance(*)').eq('id', vehicleId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVehicle(vehicleData: { registration_number: string; make: string; model: string; year: number; vin?: string; type?: string; capacity?: number; fuel_type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_vehicles').insert({ ...vehicleData, status: 'available', mileage: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVehicle(vehicleId: string, updates: Partial<{ registration_number: string; status: string; mileage: number; assigned_driver_id: string; insurance_expiry: string; license_expiry: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_vehicles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', vehicleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVehicles(options?: { status?: string; type?: string; driver_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fleet_vehicles').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); if (options?.driver_id) query = query.eq('assigned_driver_id', options.driver_id); const { data, error } = await query.order('registration_number', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDriver(driverId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_drivers').select('*, fleet_vehicles(*), fleet_trips(*)').eq('id', driverId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDriver(driverData: { user_id: string; license_number: string; license_type: string; license_expiry: string; phone?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_drivers').insert({ ...driverData, status: 'active', total_trips: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDrivers(options?: { status?: string; license_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fleet_drivers').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.license_type) query = query.eq('license_type', options.license_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTrip(tripData: { vehicle_id: string; driver_id: string; start_location: string; end_location: string; scheduled_start: string; purpose?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_trips').insert({ ...tripData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrip(tripId: string, updates: Partial<{ status: string; actual_start: string; actual_end: string; start_mileage: number; end_mileage: number; notes: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_trips').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', tripId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrips(options?: { vehicle_id?: string; driver_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fleet_trips').select('*, fleet_vehicles(*), fleet_drivers(*)'); if (options?.vehicle_id) query = query.eq('vehicle_id', options.vehicle_id); if (options?.driver_id) query = query.eq('driver_id', options.driver_id); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('scheduled_start', options.from_date); if (options?.to_date) query = query.lte('scheduled_start', options.to_date); const { data, error } = await query.order('scheduled_start', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMaintenanceRecord(maintenanceData: { vehicle_id: string; type: string; description: string; scheduled_date: string; cost?: number; service_provider?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_maintenance').insert({ ...maintenanceData, status: 'scheduled', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMaintenanceRecords(vehicleId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fleet_maintenance').select('*').eq('vehicle_id', vehicleId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('scheduled_date', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFuelLog(fuelData: { vehicle_id: string; driver_id: string; liters: number; cost: number; mileage: number; station?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fleet_fuel_logs').insert({ ...fuelData, logged_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('fleet_vehicles').update({ mileage: fuelData.mileage }).eq('id', fuelData.vehicle_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFuelLogs(vehicleId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fleet_fuel_logs').select('*').eq('vehicle_id', vehicleId); if (options?.from_date) query = query.gte('logged_at', options.from_date); if (options?.to_date) query = query.lte('logged_at', options.to_date); const { data, error } = await query.order('logged_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
