'use server'

/**
 * Extended Locations Server Actions
 * Tables: locations, location_types, location_hours, location_amenities, location_reviews, location_photos
 */

import { createClient } from '@/lib/supabase/server'

export async function getLocation(locationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locations').select('*, location_types(*), location_hours(*), location_amenities(*), location_photos(*)').eq('id', locationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLocation(locationData: { name: string; address: string; city?: string; state?: string; country?: string; postal_code?: string; latitude?: number; longitude?: number; type_id?: string; phone?: string; email?: string; website?: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locations').insert({ ...locationData, is_active: true, rating: 0, review_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLocation(locationId: string, updates: Partial<{ name: string; address: string; city: string; state: string; country: string; latitude: number; longitude: number; phone: string; email: string; website: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', locationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLocation(locationId: string) {
  try { const supabase = await createClient(); await supabase.from('location_hours').delete().eq('location_id', locationId); await supabase.from('location_amenities').delete().eq('location_id', locationId); await supabase.from('location_photos').delete().eq('location_id', locationId); const { error } = await supabase.from('locations').delete().eq('id', locationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocations(options?: { type_id?: string; city?: string; country?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('locations').select('*, location_types(*)'); if (options?.type_id) query = query.eq('type_id', options.type_id); if (options?.city) query = query.ilike('city', `%${options.city}%`); if (options?.country) query = query.eq('country', options.country); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,address.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getNearbyLocations(latitude: number, longitude: number, options?: { radius_km?: number; type_id?: string; limit?: number }) {
  try { const supabase = await createClient(); const radius = options?.radius_km || 10; const { data, error } = await supabase.rpc('get_nearby_locations', { lat: latitude, lng: longitude, radius_km: radius, location_type: options?.type_id, result_limit: options?.limit || 20 }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setLocationHours(locationId: string, hours: { day_of_week: number; open_time: string; close_time: string; is_closed?: boolean }[]) {
  try { const supabase = await createClient(); await supabase.from('location_hours').delete().eq('location_id', locationId); const hoursData = hours.map(h => ({ location_id: locationId, ...h, is_closed: h.is_closed ?? false })); const { error } = await supabase.from('location_hours').insert(hoursData); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocationHours(locationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('location_hours').select('*').eq('location_id', locationId).order('day_of_week', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLocationAmenity(locationId: string, amenity: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('location_amenities').insert({ location_id: locationId, amenity, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocationTypes() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('location_types').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLocationReview(reviewData: { location_id: string; user_id: string; rating: number; title?: string; content?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('location_reviews').insert({ ...reviewData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: reviews } = await supabase.from('location_reviews').select('rating').eq('location_id', reviewData.location_id); const avgRating = reviews?.reduce((sum, r) => sum + r.rating, 0) / (reviews?.length || 1); await supabase.from('locations').update({ rating: Math.round(avgRating * 10) / 10, review_count: reviews?.length || 0 }).eq('id', reviewData.location_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocationReviews(locationId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('location_reviews').select('*').eq('location_id', locationId).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLocationPhoto(photoData: { location_id: string; url: string; caption?: string; is_primary?: boolean; uploaded_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('location_photos').insert({ ...photoData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
