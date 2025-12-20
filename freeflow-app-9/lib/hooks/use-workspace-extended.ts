'use client'

/**
 * Extended Workspace Hooks - Covers all Workspace-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWorkspace(workspaceId?: string) {
  const [workspace, setWorkspace] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!workspaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('workspaces').select('*').eq('id', workspaceId).single()
      setWorkspace(data)
    } finally { setIsLoading(false) }
  }, [workspaceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { workspace, isLoading, refresh: fetch }
}

export function useWorkspaces(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('workspace_members').select('workspace_id, role, workspaces(*)').eq('user_id', userId)
      setData(result?.map(wm => ({ ...wm.workspaces, role: wm.role })) || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkspaceMembers(workspaceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!workspaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('workspace_members').select('*, users(id, email, full_name, avatar_url)').eq('workspace_id', workspaceId).order('joined_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [workspaceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkspaceInvitations(workspaceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!workspaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('workspace_invitations').select('*').eq('workspace_id', workspaceId).eq('status', 'pending').order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [workspaceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWorkspaceSettings(workspaceId?: string) {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!workspaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('workspace_settings').select('key, value').eq('workspace_id', workspaceId)
      const settingsMap = data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
      setSettings(settingsMap)
    } finally { setIsLoading(false) }
  }, [workspaceId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}
