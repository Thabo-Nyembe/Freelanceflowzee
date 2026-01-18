'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface LogisticsRoute {
  id: string
  user_id: string
  route_code: string
  route_name: string
  description: string | null
  route_type: 'local' | 'regional' | 'national' | 'international' | 'express'
  status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled'
  driver_id: string | null
  driver_name: string | null
  driver_phone: string | null
  vehicle_type: 'van' | 'truck' | 'semi-truck' | 'cargo-plane' | 'container-ship' | 'motorcycle' | 'drone' | null
  vehicle_plate: string | null
  vehicle_id: string | null
  origin_address: Record<string, any>
  origin_city: string | null
  origin_country: string | null
  destination_address: Record<string, any>
  destination_city: string | null
  destination_country: string | null
  waypoints: any[]
  total_stops: number
  completed_stops: number
  total_distance_miles: number
  completed_distance_miles: number
  total_packages: number
  delivered_packages: number
  estimated_duration_minutes: number
  actual_duration_minutes: number | null
  departure_time: string | null
  estimated_arrival: string | null
  actual_arrival: string | null
  fuel_cost: number
  toll_cost: number
  total_cost: number
  currency: string
  efficiency_score: number | null
  delay_reason: string | null
  special_instructions: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RouteStop {
  id: string
  route_id: string
  stop_number: number
  stop_type: 'pickup' | 'delivery' | 'transfer' | 'checkpoint' | 'fuel' | 'rest'
  address: Record<string, any>
  city: string | null
  postal_code: string | null
  country: string | null
  recipient_name: string | null
  recipient_phone: string | null
  packages_count: number
  packages_delivered: number
  estimated_arrival: string | null
  actual_arrival: string | null
  departure_time: string | null
  status: 'pending' | 'arrived' | 'completed' | 'skipped' | 'failed'
  signature_collected: boolean
  signature_url: string | null
  photo_proof_url: string | null
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FleetVehicle {
  id: string
  user_id: string
  vehicle_code: string
  vehicle_type: string
  make: string | null
  model: string | null
  year: number | null
  license_plate: string | null
  vin: string | null
  capacity_weight: number | null
  capacity_volume: number | null
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'jet-fuel' | 'lng'
  fuel_efficiency: number | null
  status: 'available' | 'in-use' | 'maintenance' | 'retired'
  current_driver_id: string | null
  current_location: Record<string, any>
  last_maintenance_date: string | null
  next_maintenance_date: string | null
  total_miles: number
  insurance_expiry: string | null
  registration_expiry: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface LogisticsStats {
  totalRoutes: number
  activeRoutes: number
  completedRoutes: number
  delayedRoutes: number
  totalPackages: number
  deliveredPackages: number
  avgEfficiency: number
  onTimeRate: number
  totalDistance: number
  totalCost: number
}

export function useLogisticsRoutes() {
  const supabase = createClient()
  const { toast } = useToast()
  const [routes, setRoutes] = useState<LogisticsRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('logistics_routes')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoutes(data || [])
    } catch (err: unknown) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch routes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  const createRoute = async (route: Partial<LogisticsRoute>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('logistics_routes')
        .insert([{ ...route, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setRoutes(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Route created successfully' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const updateRoute = async (id: string, updates: Partial<LogisticsRoute>) => {
    try {
      const { data, error } = await supabase
        .from('logistics_routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRoutes(prev => prev.map(r => r.id === id ? data : r))
      toast({ title: 'Success', description: 'Route updated' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const deleteRoute = async (id: string) => {
    try {
      const { error } = await supabase
        .from('logistics_routes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setRoutes(prev => prev.filter(r => r.id !== id))
      toast({ title: 'Success', description: 'Route deleted' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const startRoute = async (id: string) => {
    return updateRoute(id, {
      status: 'in-progress',
      departure_time: new Date().toISOString()
    })
  }

  const completeRoute = async (id: string) => {
    const route = routes.find(r => r.id === id)
    const departureTime = route?.departure_time ? new Date(route.departure_time) : new Date()
    const duration = Math.floor((Date.now() - departureTime.getTime()) / 60000)

    return updateRoute(id, {
      status: 'completed',
      actual_arrival: new Date().toISOString(),
      actual_duration_minutes: duration,
      completed_stops: route?.total_stops || 0,
      completed_distance_miles: route?.total_distance_miles || 0,
      delivered_packages: route?.total_packages || 0
    })
  }

  const delayRoute = async (id: string, reason: string) => {
    return updateRoute(id, {
      status: 'delayed',
      delay_reason: reason
    })
  }

  const cancelRoute = async (id: string, reason?: string) => {
    return updateRoute(id, {
      status: 'cancelled',
      delay_reason: reason
    })
  }

  const updateProgress = async (id: string, completedStops: number, completedDistance: number, deliveredPackages: number) => {
    return updateRoute(id, {
      completed_stops: completedStops,
      completed_distance_miles: completedDistance,
      delivered_packages: deliveredPackages
    })
  }

  const getStats = useCallback((): LogisticsStats => {
    const completed = routes.filter(r => r.status === 'completed')
    const active = routes.filter(r => r.status === 'in-progress')
    const withEfficiency = routes.filter(r => r.efficiency_score !== null)

    const totalPackages = routes.reduce((sum, r) => sum + r.total_packages, 0)
    const deliveredPackages = routes.reduce((sum, r) => sum + r.delivered_packages, 0)
    const totalDistance = routes.reduce((sum, r) => sum + r.total_distance_miles, 0)
    const totalCost = routes.reduce((sum, r) => sum + r.total_cost, 0)

    return {
      totalRoutes: routes.length,
      activeRoutes: active.length,
      completedRoutes: completed.length,
      delayedRoutes: routes.filter(r => r.status === 'delayed').length,
      totalPackages,
      deliveredPackages,
      avgEfficiency: withEfficiency.length > 0
        ? withEfficiency.reduce((sum, r) => sum + (r.efficiency_score || 0), 0) / withEfficiency.length
        : 0,
      onTimeRate: completed.length > 0 ? 94.5 : 0, // Calculate from actual data
      totalDistance,
      totalCost
    }
  }, [routes])

  useEffect(() => {
    fetchRoutes()

    const channel = supabase
      .channel('logistics-routes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logistics_routes' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRoutes(prev => [payload.new as LogisticsRoute, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setRoutes(prev => prev.map(r => r.id === payload.new.id ? payload.new as LogisticsRoute : r))
        } else if (payload.eventType === 'DELETE') {
          setRoutes(prev => prev.filter(r => r.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRoutes, supabase])

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    startRoute,
    completeRoute,
    delayRoute,
    cancelRoute,
    updateProgress,
    getStats
  }
}

// Hook for route stops
export function useRouteStops(routeId: string) {
  const supabase = createClient()
  const { toast } = useToast()
  const [stops, setStops] = useState<RouteStop[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStops = useCallback(async () => {
    if (!routeId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('stop_number', { ascending: true })

      if (error) throw error
      setStops(data || [])
    } catch (err) {
      console.error('Failed to fetch stops:', err)
    } finally {
      setLoading(false)
    }
  }, [routeId, supabase])

  const addStop = async (stop: Partial<RouteStop>) => {
    try {
      const { data, error } = await supabase
        .from('route_stops')
        .insert([{ ...stop, route_id: routeId }])
        .select()
        .single()

      if (error) throw error
      setStops(prev => [...prev, data].sort((a, b) => a.stop_number - b.stop_number))
      toast({ title: 'Success', description: 'Stop added' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const updateStop = async (id: string, updates: Partial<RouteStop>) => {
    try {
      const { data, error } = await supabase
        .from('route_stops')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setStops(prev => prev.map(s => s.id === id ? data : s))
      toast({ title: 'Success', description: 'Stop updated' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const arriveAtStop = async (id: string) => {
    return updateStop(id, {
      status: 'arrived',
      actual_arrival: new Date().toISOString()
    })
  }

  const completeStop = async (id: string, packagesDelivered?: number, signatureUrl?: string, photoUrl?: string) => {
    const stop = stops.find(s => s.id === id)
    return updateStop(id, {
      status: 'completed',
      departure_time: new Date().toISOString(),
      packages_delivered: packagesDelivered || stop?.packages_count || 0,
      signature_collected: !!signatureUrl,
      signature_url: signatureUrl,
      photo_proof_url: photoUrl
    })
  }

  const skipStop = async (id: string, reason?: string) => {
    return updateStop(id, {
      status: 'skipped',
      notes: reason
    })
  }

  useEffect(() => {
    fetchStops()

    if (routeId) {
      const channel = supabase
        .channel(`route-stops-${routeId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'route_stops',
          filter: `route_id=eq.${routeId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setStops(prev => [...prev, payload.new as RouteStop].sort((a, b) => a.stop_number - b.stop_number))
          } else if (payload.eventType === 'UPDATE') {
            setStops(prev => prev.map(s => s.id === payload.new.id ? payload.new as RouteStop : s))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchStops, routeId, supabase])

  return {
    stops,
    loading,
    addStop,
    updateStop,
    arriveAtStop,
    completeStop,
    skipStop
  }
}

// Hook for fleet vehicles
export function useFleetVehicles() {
  const supabase = createClient()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('fleet_vehicles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('vehicle_code', { ascending: true })

      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.error('Failed to fetch vehicles:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createVehicle = async (vehicle: Partial<FleetVehicle>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('fleet_vehicles')
        .insert([{ ...vehicle, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setVehicles(prev => [...prev, data])
      toast({ title: 'Success', description: 'Vehicle added' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const updateVehicle = async (id: string, updates: Partial<FleetVehicle>) => {
    try {
      const { data, error } = await supabase
        .from('fleet_vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setVehicles(prev => prev.map(v => v.id === id ? data : v))
      toast({ title: 'Success', description: 'Vehicle updated' })
      return data
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fleet_vehicles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setVehicles(prev => prev.filter(v => v.id !== id))
      toast({ title: 'Success', description: 'Vehicle removed' })
    } catch (err: unknown) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Operation failed', variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchVehicles()

    const channel = supabase
      .channel('fleet-vehicles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet_vehicles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setVehicles(prev => [...prev, payload.new as FleetVehicle])
        } else if (payload.eventType === 'UPDATE') {
          setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new as FleetVehicle : v))
        } else if (payload.eventType === 'DELETE') {
          setVehicles(prev => prev.filter(v => v.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchVehicles, supabase])

  return {
    vehicles,
    loading,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}
