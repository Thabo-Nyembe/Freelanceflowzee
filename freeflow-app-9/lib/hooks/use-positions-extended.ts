'use client'

/**
 * Extended Positions Hooks
 * Tables: positions, position_applications, position_requirements, position_interviews, position_offers, position_assignments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePosition(positionId?: string) {
  const [position, setPosition] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!positionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('positions').select('*, position_requirements(*), position_applications(count)').eq('id', positionId).single(); setPosition(data) } finally { setIsLoading(false) }
  }, [positionId])
  useEffect(() => { fetch() }, [fetch])
  return { position, isLoading, refresh: fetch }
}

export function usePositions(options?: { organization_id?: string; department_id?: string; status?: string; type?: string; search?: string; limit?: number }) {
  const [positions, setPositions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('positions').select('*, position_applications(count)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.department_id) query = query.eq('department_id', options.department_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.search) query = query.ilike('title', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPositions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.department_id, options?.status, options?.type, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { positions, isLoading, refresh: fetch }
}

export function usePositionRequirements(positionId?: string) {
  const [requirements, setRequirements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!positionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('position_requirements').select('*').eq('position_id', positionId).order('order', { ascending: true }); setRequirements(data || []) } finally { setIsLoading(false) }
  }, [positionId])
  useEffect(() => { fetch() }, [fetch])
  return { requirements, isLoading, refresh: fetch }
}

export function usePositionApplications(positionId?: string, options?: { status?: string; limit?: number }) {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!positionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('position_applications').select('*, users(*)').eq('position_id', positionId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('applied_at', { ascending: false }).limit(options?.limit || 50)
      setApplications(data || [])
    } finally { setIsLoading(false) }
  }, [positionId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { applications, isLoading, refresh: fetch }
}

export function useApplication(applicationId?: string) {
  const [application, setApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!applicationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('position_applications').select('*, positions(*), users(*), position_interviews(*), position_offers(*)').eq('id', applicationId).single(); setApplication(data) } finally { setIsLoading(false) }
  }, [applicationId])
  useEffect(() => { fetch() }, [fetch])
  return { application, isLoading, refresh: fetch }
}

export function useMyApplications(userId?: string, options?: { status?: string; limit?: number }) {
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('position_applications').select('*, positions(*)').eq('applicant_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('applied_at', { ascending: false }).limit(options?.limit || 50)
      setApplications(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { applications, isLoading, refresh: fetch }
}

export function usePositionInterviews(positionId?: string, options?: { status?: string }) {
  const [interviews, setInterviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!positionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('position_interviews').select('*, position_applications(*, users(*))').eq('position_id', positionId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('scheduled_at', { ascending: true })
      setInterviews(data || [])
    } finally { setIsLoading(false) }
  }, [positionId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { interviews, isLoading, refresh: fetch }
}

export function usePositionOffers(positionId?: string, options?: { status?: string }) {
  const [offers, setOffers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!positionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('position_offers').select('*, position_applications(*, users(*))').eq('position_id', positionId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setOffers(data || [])
    } finally { setIsLoading(false) }
  }, [positionId, options?.status])
  useEffect(() => { fetch() }, [fetch])
  return { offers, isLoading, refresh: fetch }
}

export function useOpenPositions(options?: { organization_id?: string; department_id?: string; type?: string; limit?: number }) {
  const [positions, setPositions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('positions').select('*, position_requirements(*)').eq('status', 'open')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.department_id) query = query.eq('department_id', options.department_id)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('published_at', { ascending: false }).limit(options?.limit || 50)
      setPositions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.department_id, options?.type, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { positions, isLoading, refresh: fetch }
}

export function usePositionAssignments(positionId?: string) {
  const [assignments, setAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!positionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('position_assignments').select('*, users(*)').eq('position_id', positionId).order('assigned_at', { ascending: false }); setAssignments(data || []) } finally { setIsLoading(false) }
  }, [positionId])
  useEffect(() => { fetch() }, [fetch])
  return { assignments, isLoading, refresh: fetch }
}

export function usePositionStats(organizationId?: string) {
  const [stats, setStats] = useState<{ openPositions: number; totalApplications: number; pendingInterviews: number; pendingOffers: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let positionsQuery = supabase.from('positions').select('id, status')
      if (organizationId) positionsQuery = positionsQuery.eq('organization_id', organizationId)
      const { data: positions } = await positionsQuery
      const positionIds = positions?.map(p => p.id) || []
      const openPositions = positions?.filter(p => p.status === 'open').length || 0
      let totalApplications = 0, pendingInterviews = 0, pendingOffers = 0
      if (positionIds.length > 0) {
        const [appsRes, interviewsRes, offersRes] = await Promise.all([
          supabase.from('position_applications').select('id', { count: 'exact' }).in('position_id', positionIds),
          supabase.from('position_interviews').select('id', { count: 'exact' }).in('position_id', positionIds).eq('status', 'scheduled'),
          supabase.from('position_offers').select('id', { count: 'exact' }).in('position_id', positionIds).eq('status', 'pending')
        ])
        totalApplications = appsRes.count || 0
        pendingInterviews = interviewsRes.count || 0
        pendingOffers = offersRes.count || 0
      }
      setStats({ openPositions, totalApplications, pendingInterviews, pendingOffers })
    } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
