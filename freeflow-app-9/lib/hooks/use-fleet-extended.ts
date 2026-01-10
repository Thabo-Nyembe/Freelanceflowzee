'use client'

/**
 * Extended Fleet Hooks
 * Tables: fleet_vehicles, fleet_drivers, fleet_trips, fleet_maintenance, fleet_fuel_logs, fleet_routes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVehicle(vehicleId?: string) {
  const [vehicle, setVehicle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vehicleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('fleet_vehicles').select('*, fleet_drivers(*), fleet_maintenance(*)').eq('id', vehicleId).single(); setVehicle(data) } finally { setIsLoading(false) }
  }, [vehicleId])
  useEffect(() => { fetch() }, [fetch])
  return { vehicle, isLoading, refresh: fetch }
}

export function useVehicles(options?: { status?: string; type?: string; driver_id?: string; limit?: number }) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('fleet_vehicles').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.driver_id) query = query.eq('assigned_driver_id', options.driver_id)
      const { data } = await query.order('registration_number', { ascending: true }).limit(options?.limit || 100)
      setVehicles(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.type, options?.driver_id, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { vehicles, isLoading, refresh: fetch }
}

export function useDriver(driverId?: string) {
  const [driver, setDriver] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!driverId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('fleet_drivers').select('*, fleet_vehicles(*), fleet_trips(*)').eq('id', driverId).single(); setDriver(data) } finally { setIsLoading(false) }
  }, [driverId])
  useEffect(() => { fetch() }, [fetch])
  return { driver, isLoading, refresh: fetch }
}

export function useDrivers(options?: { status?: string; license_type?: string; limit?: number }) {
  const [drivers, setDrivers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('fleet_drivers').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.license_type) query = query.eq('license_type', options.license_type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100)
      setDrivers(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.license_type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { drivers, isLoading, refresh: fetch }
}

export function useTrips(options?: { vehicle_id?: string; driver_id?: string; status?: string; from_date?: string; to_date?: string; limit?: number }) {
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('fleet_trips').select('*, fleet_vehicles(*), fleet_drivers(*)')
      if (options?.vehicle_id) query = query.eq('vehicle_id', options.vehicle_id)
      if (options?.driver_id) query = query.eq('driver_id', options.driver_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.from_date) query = query.gte('scheduled_start', options.from_date)
      if (options?.to_date) query = query.lte('scheduled_start', options.to_date)
      const { data } = await query.order('scheduled_start', { ascending: false }).limit(options?.limit || 50)
      setTrips(data || [])
    } finally { setIsLoading(false) }
  }, [options?.vehicle_id, options?.driver_id, options?.status, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { trips, isLoading, refresh: fetch }
}

export function useVehicleTrips(vehicleId?: string, options?: { status?: string; limit?: number }) {
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vehicleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('fleet_trips').select('*, fleet_drivers(*)').eq('vehicle_id', vehicleId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('scheduled_start', { ascending: false }).limit(options?.limit || 20)
      setTrips(data || [])
    } finally { setIsLoading(false) }
  }, [vehicleId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { trips, isLoading, refresh: fetch }
}

export function useMaintenanceRecords(vehicleId?: string, options?: { status?: string; limit?: number }) {
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vehicleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('fleet_maintenance').select('*').eq('vehicle_id', vehicleId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('scheduled_date', { ascending: false }).limit(options?.limit || 20)
      setRecords(data || [])
    } finally { setIsLoading(false) }
  }, [vehicleId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refresh: fetch }
}

export function useFuelLogs(vehicleId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!vehicleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('fleet_fuel_logs').select('*').eq('vehicle_id', vehicleId)
      if (options?.from_date) query = query.gte('logged_at', options.from_date)
      if (options?.to_date) query = query.lte('logged_at', options.to_date)
      const { data } = await query.order('logged_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [vehicleId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { logs, isLoading, refresh: fetch }
}

export function useAvailableVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('fleet_vehicles').select('*').eq('status', 'available').order('registration_number', { ascending: true }); setVehicles(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { vehicles, isLoading, refresh: fetch }
}

export function useUpcomingMaintenance(limit?: number) {
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('fleet_maintenance').select('*, fleet_vehicles(*)').eq('status', 'scheduled').gte('scheduled_date', new Date().toISOString()).order('scheduled_date', { ascending: true }).limit(limit || 10); setRecords(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { records, isLoading, refresh: fetch }
}
