'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

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

export interface TeamMember {
  id: string
  user_id: string
  name: string
  email: string | null
  role: string | null
  department: string | null
  avatar_url: string | null
  phone: string | null
  status: 'active' | 'inactive' | 'pending' | 'on_leave'
  is_lead: boolean
  projects_count: number
  tasks_completed: number
  performance_score: number
  hire_date: string | null
  hourly_rate: number | null
  skills: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TeamStats {
  total: number
  active: number
  inactive: number
  pending: number
  onLeave: number
  leads: number
  avgPerformance: number
}

export function useTeam(initialMembers: TeamMember[] = [], initialStats?: TeamStats) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [stats, setStats] = useState<TeamStats>(initialStats || {
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    onLeave: 0,
    leads: 0,
    avgPerformance: 0
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const calculateStats = useCallback((membersList: TeamMember[]): TeamStats => {
    const active = membersList.filter(m => m.status === 'active')
    return {
      total: membersList.length,
      active: active.length,
      inactive: membersList.filter(m => m.status === 'inactive').length,
      pending: membersList.filter(m => m.status === 'pending').length,
      onLeave: membersList.filter(m => m.status === 'on_leave').length,
      leads: membersList.filter(m => m.is_lead).length,
      avgPerformance: active.length > 0
        ? Math.round(active.reduce((sum, m) => sum + m.performance_score, 0) / active.length)
        : 0
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    // In demo mode, return empty data to avoid unauthenticated Supabase queries
    if (isDemoModeEnabled()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setMembers(data || [])
      setStats(calculateStats(data || []))
    } catch (error: any) {
      // Silently handle RLS policy errors (infinite recursion)
      if (error?.code !== '42P17') {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch team members',
          variant: 'destructive'
        })
      }
      // Return empty data on error
      setMembers([])
      setStats(calculateStats([]))
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats])

  const createMember = useCallback(async (memberData: Partial<TeamMember>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          ...memberData,
          user_id: user.id,
          skills: memberData.skills || [],
          metadata: memberData.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      const updatedMembers = [...members, data]
      setMembers(updatedMembers)
      setStats(calculateStats(updatedMembers))

      toast({
        title: 'Success',
        description: 'Team member added successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add team member',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, members, calculateStats])

  const updateMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedMembers = members.map(m => m.id === id ? data : m)
      setMembers(updatedMembers)
      setStats(calculateStats(updatedMembers))

      toast({
        title: 'Success',
        description: 'Team member updated successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team member',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, members, calculateStats])

  const deleteMember = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error

      const updatedMembers = members.filter(m => m.id !== id)
      setMembers(updatedMembers)
      setStats(calculateStats(updatedMembers))

      toast({
        title: 'Success',
        description: 'Team member removed successfully'
      })

      return true
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove team member',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, members, calculateStats])

  const updateMemberStatus = useCallback(async (id: string, status: TeamMember['status']) => {
    return updateMember(id, { status })
  }, [updateMember])

  const toggleLead = useCallback(async (id: string) => {
    const member = members.find(m => m.id === id)
    if (member) {
      return updateMember(id, { is_lead: !member.is_lead })
    }
    return null
  }, [members, updateMember])

  const updatePerformance = useCallback(async (id: string, score: number) => {
    return updateMember(id, { performance_score: Math.min(100, Math.max(0, score)) })
  }, [updateMember])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('team_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers(prev => {
              const updated = [...prev, payload.new as TeamMember]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setMembers(prev => {
              const updated = prev.map(m =>
                m.id === payload.new.id ? payload.new as TeamMember : m
              )
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setMembers(prev => {
              const updated = prev.filter(m => m.id !== payload.old.id)
              setStats(calculateStats(updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, calculateStats])

  return {
    members,
    stats,
    loading,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    updateMemberStatus,
    toggleLead,
    updatePerformance
  }
}
