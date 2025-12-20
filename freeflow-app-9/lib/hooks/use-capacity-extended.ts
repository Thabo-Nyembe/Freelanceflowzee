'use client'

/**
 * Extended Capacity Hooks
 * Tables: capacity_plans, capacity_resources, capacity_allocations, capacity_forecasts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCapacityPlan(planId?: string) {
  const [plan, setPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('capacity_plans').select('*, capacity_resources(*), capacity_allocations(*)').eq('id', planId).single(); setPlan(data) } finally { setIsLoading(false) }
  }, [planId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plan, isLoading, refresh: fetch }
}

export function useCapacityPlans(options?: { user_id?: string; status?: string; limit?: number }) {
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('capacity_plans').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('start_date', { ascending: true }).limit(options?.limit || 50)
      setPlans(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { plans, isLoading, refresh: fetch }
}

export function useCapacityResources(planId?: string) {
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('capacity_resources').select('*').eq('plan_id', planId).order('name', { ascending: true }); setResources(data || []) } finally { setIsLoading(false) }
  }, [planId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { resources, isLoading, refresh: fetch }
}

export function useCapacityAllocations(planId?: string, options?: { resource_id?: string; project_id?: string; status?: string }) {
  const [allocations, setAllocations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('capacity_allocations').select('*').eq('plan_id', planId)
      if (options?.resource_id) query = query.eq('resource_id', options.resource_id)
      if (options?.project_id) query = query.eq('project_id', options.project_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('start_date', { ascending: true })
      setAllocations(data || [])
    } finally { setIsLoading(false) }
  }, [planId, options?.resource_id, options?.project_id, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { allocations, isLoading, refresh: fetch }
}

export function useCapacityForecasts(planId?: string, options?: { date_from?: string; date_to?: string }) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('capacity_forecasts').select('*').eq('plan_id', planId)
      if (options?.date_from) query = query.gte('date', options.date_from)
      if (options?.date_to) query = query.lte('date', options.date_to)
      const { data } = await query.order('date', { ascending: true })
      setForecasts(data || [])
    } finally { setIsLoading(false) }
  }, [planId, options?.date_from, options?.date_to, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { forecasts, isLoading, refresh: fetch }
}

export function useCapacityUtilization(planId?: string) {
  const [utilization, setUtilization] = useState<{ total: number; used: number; available: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!planId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: plan } = await supabase.from('capacity_plans').select('total_capacity, used_capacity').eq('id', planId).single()
      if (!plan) { setUtilization(null); return }
      const total = plan.total_capacity || 0
      const used = plan.used_capacity || 0
      const available = total - used
      const percentage = total > 0 ? (used / total) * 100 : 0
      setUtilization({ total, used, available, percentage })
    } finally { setIsLoading(false) }
  }, [planId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { utilization, isLoading, refresh: fetch }
}

export function useResourceAvailability(resourceId?: string, options?: { date_from?: string; date_to?: string }) {
  const [availability, setAvailability] = useState<{ capacity: number; allocated: number; available: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!resourceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: resource } = await supabase.from('capacity_resources').select('capacity, allocated').eq('id', resourceId).single()
      if (!resource) { setAvailability(null); return }
      setAvailability({
        capacity: resource.capacity || 0,
        allocated: resource.allocated || 0,
        available: (resource.capacity || 0) - (resource.allocated || 0)
      })
    } finally { setIsLoading(false) }
  }, [resourceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { availability, isLoading, refresh: fetch }
}
