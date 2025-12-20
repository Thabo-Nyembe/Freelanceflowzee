'use client'

/**
 * Extended Service Hooks
 * Tables: services, service_instances, service_health, service_dependencies
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useService(serviceId?: string) {
  const [service, setService] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('services').select('*').eq('id', serviceId).single(); setService(data) } finally { setIsLoading(false) }
  }, [serviceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { service, isLoading, refresh: fetch }
}

export function useServices(options?: { status?: string; type?: string; limit?: number }) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('services').select('*')
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setServices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.status, options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}

export function useServiceInstances(serviceId?: string, options?: { status?: string }) {
  const [instances, setInstances] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('service_instances').select('*').eq('service_id', serviceId); if (options?.status) query = query.eq('status', options.status); const { data } = await query.order('created_at', { ascending: false }); setInstances(data || []) } finally { setIsLoading(false) }
  }, [serviceId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { instances, isLoading, refresh: fetch }
}

export function useServiceHealth(serviceId?: string) {
  const [health, setHealth] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('service_health').select('*').eq('service_id', serviceId).order('checked_at', { ascending: false }).limit(1).single(); setHealth(data) } finally { setIsLoading(false) }
  }, [serviceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { health, isLoading, refresh: fetch }
}

export function useServiceDependencies(serviceId?: string) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!serviceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('service_dependencies').select('*').eq('service_id', serviceId); setDependencies(data || []) } finally { setIsLoading(false) }
  }, [serviceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dependencies, isLoading, refresh: fetch }
}

export function useActiveServices() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('services').select('*').eq('status', 'active').order('name', { ascending: true }); setServices(data || []) } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { services, isLoading, refresh: fetch }
}
