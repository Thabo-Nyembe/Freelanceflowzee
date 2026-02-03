'use client'

/**
 * Extended Team Hooks - Covers all 19 Team-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useTeamActivity(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_activity').select('*').eq('team_id', teamId).order('created_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamAnalytics(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_analytics').select('*').eq('team_id', teamId); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamAnnouncements(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_announcements').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamComments(taskId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!taskId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [taskId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamCommunicationRecipients(communicationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!communicationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_communication_recipients').select('*').eq('communication_id', communicationId); setData(result || []) } finally { setIsLoading(false) }
  }, [communicationId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamCommunications(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_communications').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamInvitations(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_invitations').select('*').eq('team_id', teamId).eq('status', 'pending'); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamMeetingAttendees(meetingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_meeting_attendees').select('*').eq('meeting_id', meetingId); setData(result || []) } finally { setIsLoading(false) }
  }, [meetingId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamMeetings(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_meetings').select('*').eq('team_id', teamId).order('scheduled_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamPerformance(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_performance').select('*').eq('team_id', teamId); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamPerformanceMetrics(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_performance_metrics').select('*').eq('team_id', teamId).order('date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamPermissions(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_permissions').select('*').eq('team_id', teamId); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamProjectMembers(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_project_members').select('*').eq('project_id', projectId); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamProjects(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_projects').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamShares(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_shares').select('*').eq('team_id', teamId); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamSkills(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_skills').select('*').eq('team_id', teamId); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamStats(teamId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_stats').select('*').eq('team_id', teamId).single(); setData(result) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamTasks(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_tasks').select('*').eq('team_id', teamId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeamTimeTracking(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('team_time_tracking').select('*').eq('team_id', teamId).order('started_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [teamId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useTeams(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('teams').select('*').eq('owner_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
