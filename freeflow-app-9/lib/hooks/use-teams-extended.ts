'use client'

/**
 * Extended Teams Hooks
 * Tables: teams, team_members, team_roles, team_invitations, team_settings, team_activities
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useTeam(teamId?: string) {
  const [team, setTeam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('teams').select('*, team_members(*, users(*)), team_roles(*), team_settings(*)').eq('id', teamId).single(); setTeam(data) } finally { setIsLoading(false) }
  }, [teamId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { team, isLoading, refresh: fetch }
}

export function useTeams(options?: { team_type?: string; owner_id?: string; is_private?: boolean; search?: string; limit?: number }) {
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('teams').select('*, team_members(count)')
      if (options?.team_type) query = query.eq('team_type', options.team_type)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.is_private !== undefined) query = query.eq('is_private', options.is_private)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setTeams(data || [])
    } finally { setIsLoading(false) }
  }, [options?.team_type, options?.owner_id, options?.is_private, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { teams, isLoading, refresh: fetch }
}

export function useTeamMembers(teamId?: string, options?: { role?: string; is_active?: boolean }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('team_members').select('*, users(*)').eq('team_id', teamId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('joined_at', { ascending: true })
      setMembers(data || [])
    } finally { setIsLoading(false) }
  }, [teamId, options?.role, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useUserTeams(userId?: string, options?: { role?: string; is_active?: boolean }) {
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('team_members').select('*, teams(*)').eq('user_id', userId)
      if (options?.role) query = query.eq('role', options.role)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('joined_at', { ascending: false })
      setTeams((data || []).map(m => ({ ...m.teams, membership: m })))
    } finally { setIsLoading(false) }
  }, [userId, options?.role, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { teams, isLoading, refresh: fetch }
}

export function useTeamMembership(teamId?: string, userId?: string) {
  const [membership, setMembership] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId || !userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('team_members').select('*').eq('team_id', teamId).eq('user_id', userId).single()
      setMembership(data)
    } finally { setIsLoading(false) }
  }, [teamId, userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { membership, isMember: !!membership, role: membership?.role, isLoading, refresh: fetch }
}

export function useTeamInvitations(teamId?: string, options?: { status?: string }) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('team_invitations').select('*, users(*)').eq('team_id', teamId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setInvitations(data || [])
    } finally { setIsLoading(false) }
  }, [teamId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invitations, isLoading, refresh: fetch }
}

export function useTeamSettings(teamId?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('team_settings').select('*').eq('team_id', teamId)
      const settingsMap: Record<string, any> = {}
      data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value })
      setSettings(settingsMap)
    } finally { setIsLoading(false) }
  }, [teamId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useTeamActivities(teamId?: string, options?: { activity_type?: string; user_id?: string; limit?: number }) {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('team_activities').select('*, users(*)').eq('team_id', teamId)
      if (options?.activity_type) query = query.eq('activity_type', options.activity_type)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setActivities(data || [])
    } finally { setIsLoading(false) }
  }, [teamId, options?.activity_type, options?.user_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { activities, isLoading, refresh: fetch }
}

export function useTeamRoles(teamId?: string) {
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('team_roles').select('*').eq('team_id', teamId).order('name', { ascending: true }); setRoles(data || []) } finally { setIsLoading(false) }
  }, [teamId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { roles, isLoading, refresh: fetch }
}

export function useMyPendingInvitations(email?: string) {
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!email) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('team_invitations').select('*, teams(*)').eq('email', email).eq('status', 'pending').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false })
      setInvitations(data || [])
    } finally { setIsLoading(false) }
  }, [email, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invitations, isLoading, refresh: fetch }
}

