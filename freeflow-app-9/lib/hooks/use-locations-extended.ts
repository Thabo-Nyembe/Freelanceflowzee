'use client'

/**
 * Extended Locations Hooks
 * Tables: locations, location_types, location_hours, location_amenities, location_reviews, location_photos
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLocation(locationId?: string) {
  const [location, setLocation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!locationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('locations').select('*, location_types(*), location_hours(*), location_amenities(*), location_photos(*)').eq('id', locationId).single(); setLocation(data) } finally { setIsLoading(false) }
  }, [locationId])
  useEffect(() => { fetch() }, [fetch])
  return { location, isLoading, refresh: fetch }
}

export function useLocations(options?: { type_id?: string; city?: string; country?: string; is_active?: boolean; limit?: number }) {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('locations').select('*, location_types(*)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.city) query = query.ilike('city', `%${options.city}%`)
      if (options?.country) query = query.eq('country', options.country)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setLocations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.city, options?.country, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { locations, isLoading, refresh: fetch }
}

export function useLocationTypes() {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('location_types').select('*').order('name', { ascending: true }); setTypes(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useLocationHours(locationId?: string) {
  const [hours, setHours] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!locationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('location_hours').select('*').eq('location_id', locationId).order('day_of_week', { ascending: true }); setHours(data || []) } finally { setIsLoading(false) }
  }, [locationId])
  useEffect(() => { fetch() }, [fetch])
  return { hours, isLoading, refresh: fetch }
}

export function useLocationAmenities(locationId?: string) {
  const [amenities, setAmenities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!locationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('location_amenities').select('*').eq('location_id', locationId); setAmenities(data || []) } finally { setIsLoading(false) }
  }, [locationId])
  useEffect(() => { fetch() }, [fetch])
  return { amenities, isLoading, refresh: fetch }
}

export function useLocationReviews(locationId?: string, options?: { limit?: number }) {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!locationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('location_reviews').select('*').eq('location_id', locationId).order('created_at', { ascending: false }).limit(options?.limit || 20); setReviews(data || []) } finally { setIsLoading(false) }
  }, [locationId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { reviews, isLoading, refresh: fetch }
}

export function useLocationPhotos(locationId?: string) {
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!locationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('location_photos').select('*').eq('location_id', locationId).order('is_primary', { ascending: false }); setPhotos(data || []) } finally { setIsLoading(false) }
  }, [locationId])
  useEffect(() => { fetch() }, [fetch])
  return { photos, isLoading, refresh: fetch }
}

export function useLocationSearch(query?: string, options?: { type_id?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const search = useCallback(async () => {
    if (!query || query.length < 2) { setResults([]); return }
    setIsLoading(true)
    try {
      let dbQuery = supabase.from('locations').select('*, location_types(*)').eq('is_active', true).or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
      if (options?.type_id) dbQuery = dbQuery.eq('type_id', options.type_id)
      const { data } = await dbQuery.order('rating', { ascending: false }).limit(options?.limit || 20)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [query, options?.type_id, options?.limit])
  useEffect(() => { search() }, [search])
  return { results, isLoading, search }
}

export function useNearbyLocations(latitude?: number, longitude?: number, options?: { radius_km?: number; type_id?: string; limit?: number }) {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!latitude || !longitude) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.rpc('get_nearby_locations', {
        lat: latitude,
        lng: longitude,
        radius_km: options?.radius_km || 10,
        location_type: options?.type_id,
        result_limit: options?.limit || 20
      })
      setLocations(data || [])
    } finally { setIsLoading(false) }
  }, [latitude, longitude, options?.radius_km, options?.type_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { locations, isLoading, refresh: fetch }
}

export function useTopRatedLocations(options?: { type_id?: string; limit?: number }) {
  const [locations, setLocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('locations').select('*, location_types(*)').eq('is_active', true).gte('review_count', 1)
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      const { data } = await query.order('rating', { ascending: false }).limit(options?.limit || 10)
      setLocations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { locations, isLoading, refresh: fetch }
}
