'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface Bug {
  id: string
  user_id: string
  bug_code: string
  title: string
  description: string | null
  severity: string
  status: string
  priority: string
  assignee_name: string | null
  assignee_email: string | null
  reporter_name: string | null
  reporter_email: string | null
  created_date: string
  last_updated: string
  due_date: string | null
  resolved_date: string | null
  affected_version: string | null
  target_version: string | null
  category: string | null
  is_reproducible: boolean
  votes: number
  watchers: number
  steps_to_reproduce: string | null
  expected_behavior: string | null
  actual_behavior: string | null
  environment_details: Record<string, unknown>
  attachments: unknown[]
  related_bugs: unknown[]
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface BugComment {
  id: string
  user_id: string
  bug_id: string
  commenter_name: string
  commenter_email: string | null
  comment_text: string
  is_internal: boolean
  attachments: unknown[]
  created_at: string
  updated_at: string
}

export interface BugFilters {
  status?: string
  severity?: string
  priority?: string
  category?: string
  assignee?: string
}

export interface BugStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  critical: number
  high: number
  medium: number
  low: number
  avgResolutionDays: number
}

export function useBugs(initialBugs: Bug[] = [], filters: BugFilters = {}) {
  const queryKey = ['bugs', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('bugs')
      .select('*')
      .is('deleted_at', null)
      .order('created_date', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.assignee) {
      query = query.ilike('assignee_name', `%${filters.assignee}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as Bug[]
  }, [filters])

  const { data: bugs, isLoading, error, refetch } = useSupabaseQuery<Bug[]>(
    queryKey,
    queryFn,
    { initialData: initialBugs }
  )

  const stats: BugStats = useMemo(() => {
    const bugList = bugs || []
    const resolvedBugs = bugList.filter(b => b.status === 'resolved' && b.resolved_date)

    let totalResolutionDays = 0
    resolvedBugs.forEach(bug => {
      if (bug.resolved_date && bug.created_date) {
        const created = new Date(bug.created_date)
        const resolved = new Date(bug.resolved_date)
        totalResolutionDays += (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      }
    })

    return {
      total: bugList.length,
      open: bugList.filter(b => b.status === 'open').length,
      inProgress: bugList.filter(b => b.status === 'in-progress').length,
      resolved: bugList.filter(b => b.status === 'resolved').length,
      closed: bugList.filter(b => b.status === 'closed').length,
      critical: bugList.filter(b => b.severity === 'critical').length,
      high: bugList.filter(b => b.severity === 'high').length,
      medium: bugList.filter(b => b.severity === 'medium').length,
      low: bugList.filter(b => b.severity === 'low').length,
      avgResolutionDays: resolvedBugs.length > 0 ? totalResolutionDays / resolvedBugs.length : 0
    }
  }, [bugs])

  return { bugs: bugs || [], stats, isLoading, error, refetch }
}

export function useBugComments(bugId: string, initialComments: BugComment[] = []) {
  const queryKey = ['bug-comments', bugId]

  const queryFn = useCallback(async (supabase: any) => {
    const { data, error } = await supabase
      .from('bug_comments')
      .select('*')
      .eq('bug_id', bugId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as BugComment[]
  }, [bugId])

  const { data: comments, isLoading, error, refetch } = useSupabaseQuery<BugComment[]>(
    queryKey,
    queryFn,
    { initialData: initialComments }
  )

  return { comments: comments || [], isLoading, error, refetch }
}

export function useBugMutations() {
  const createMutation = useSupabaseMutation<Partial<Bug>, Bug>(
    async (supabase, bugData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const bugCode = `BUG-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('bugs')
        .insert({
          ...bugData,
          user_id: user.id,
          bug_code: bugCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['bugs']] }
  )

  const updateMutation = useSupabaseMutation<{ id: string; updates: Partial<Bug> }, Bug>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('bugs')
        .update({ ...updates, last_updated: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['bugs']] }
  )

  const deleteMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('bugs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['bugs']] }
  )

  const addCommentMutation = useSupabaseMutation<{ bugId: string; comment: Partial<BugComment> }, BugComment>(
    async (supabase, { bugId, comment }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('bug_comments')
        .insert({
          ...comment,
          user_id: user.id,
          bug_id: bugId
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['bug-comments']] }
  )

  return {
    createBug: createMutation.mutate,
    updateBug: updateMutation.mutate,
    deleteBug: deleteMutation.mutate,
    addComment: addCommentMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingComment: addCommentMutation.isPending
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'P0': return 'bg-red-100 text-red-800 border-red-200'
    case 'P1': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'P3': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'P4': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'wont-fix': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
