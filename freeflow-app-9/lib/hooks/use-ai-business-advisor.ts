'use client'

/**
 * AI Business Advisor Hook
 * Provides backend persistence for insights and activity data
 * Uses Supabase for real-time data synchronization
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================

export interface AIBusinessInsight {
  id: string
  user_id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction' | 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  priority?: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
  confidence?: number
  action?: string
  category?: string
  status?: 'active' | 'dismissed' | 'completed'
  created_at?: string
  updated_at?: string
}

export interface AIBusinessActivity {
  id: string
  user_id: string
  user: string
  action: string
  target: string
  timestamp: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration' | 'success' | 'info' | 'warning' | 'error'
  avatar?: string
  metadata?: Record<string, unknown>
  created_at?: string
}

export interface CreateInsightInput {
  type: AIBusinessInsight['type']
  title: string
  description: string
  impact?: AIBusinessInsight['impact']
  priority?: AIBusinessInsight['priority']
  category?: string
  action?: string
}

export interface CreateActivityInput {
  user: string
  action: string
  target: string
  type: AIBusinessActivity['type']
  avatar?: string
  metadata?: Record<string, unknown>
}

// ============================================
// AI BUSINESS INSIGHTS HOOK
// ============================================

export function useAIBusinessInsights(userId?: string) {
  const [insights, setInsights] = useState<AIBusinessInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError
      setInsights(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights')
      console.error('Error fetching AI insights:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    fetchInsights()

    const supabase = createClient()
    const channel = supabase
      .channel('ai-insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_insights',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchInsights()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchInsights])

  const createInsight = useCallback(async (input: CreateInsightInput): Promise<AIBusinessInsight | null> => {
    if (!userId) return null

    const supabase = createClient()
    try {
      const { data, error: insertError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          type: input.type,
          title: input.title,
          description: input.description,
          impact: input.impact || 'medium',
          priority: input.priority || 'medium',
          category: input.category || 'general',
          action: input.action,
          status: 'active'
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Update local state
      setInsights(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create insight')
      console.error('Error creating AI insight:', err)
      return null
    }
  }, [userId])

  const updateInsight = useCallback(async (
    insightId: string,
    updates: Partial<AIBusinessInsight>
  ): Promise<boolean> => {
    const supabase = createClient()
    try {
      const { error: updateError } = await supabase
        .from('ai_insights')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', insightId)

      if (updateError) throw updateError

      // Update local state
      setInsights(prev => prev.map(insight =>
        insight.id === insightId ? { ...insight, ...updates } : insight
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update insight')
      console.error('Error updating AI insight:', err)
      return false
    }
  }, [])

  const dismissInsight = useCallback(async (insightId: string): Promise<boolean> => {
    return updateInsight(insightId, { status: 'dismissed' })
  }, [updateInsight])

  const deleteInsight = useCallback(async (insightId: string): Promise<boolean> => {
    const supabase = createClient()
    try {
      const { error: deleteError } = await supabase
        .from('ai_insights')
        .delete()
        .eq('id', insightId)

      if (deleteError) throw deleteError

      // Update local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete insight')
      console.error('Error deleting AI insight:', err)
      return false
    }
  }, [])

  return {
    insights,
    isLoading,
    error,
    refresh: fetchInsights,
    createInsight,
    updateInsight,
    dismissInsight,
    deleteInsight
  }
}

// ============================================
// AI BUSINESS ACTIVITY HOOK
// ============================================

export function useAIBusinessActivity(userId?: string) {
  const [activities, setActivities] = useState<AIBusinessActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Fetch from ai_usage_logs and transform to activity format
      const { data, error: fetchError } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      // Transform usage logs to activity format
      const transformedActivities: AIBusinessActivity[] = (data || []).map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        user: 'AI Business Advisor',
        action: log.action || log.feature || 'performed action',
        target: log.target || log.context || 'Business Analysis',
        timestamp: formatTimeAgo(new Date(log.created_at)),
        type: mapLogTypeToActivityType(log.type || log.action),
        metadata: log.metadata,
        created_at: log.created_at
      }))

      setActivities(transformedActivities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      console.error('Error fetching AI activities:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return

    fetchActivities()

    const supabase = createClient()
    const channel = supabase
      .channel('ai-activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_usage_logs',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchActivities])

  const logActivity = useCallback(async (input: CreateActivityInput): Promise<boolean> => {
    if (!userId) return false

    const supabase = createClient()
    try {
      const { error: insertError } = await supabase
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          action: input.action,
          target: input.target,
          type: input.type,
          context: input.target,
          feature: 'ai_business_advisor',
          metadata: input.metadata
        })

      if (insertError) throw insertError

      // Refresh activities
      await fetchActivities()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity')
      console.error('Error logging AI activity:', err)
      return false
    }
  }, [userId, fetchActivities])

  return {
    activities,
    isLoading,
    error,
    refresh: fetchActivities,
    logActivity
  }
}

// ============================================
// COMBINED HOOK FOR AI BUSINESS ADVISOR
// ============================================

export function useAIBusinessAdvisorData(userId?: string) {
  const {
    insights,
    isLoading: insightsLoading,
    error: insightsError,
    refresh: refreshInsights,
    createInsight,
    updateInsight,
    dismissInsight,
    deleteInsight
  } = useAIBusinessInsights(userId)

  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    refresh: refreshActivities,
    logActivity
  } = useAIBusinessActivity(userId)

  const isLoading = insightsLoading || activitiesLoading
  const error = insightsError || activitiesError

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshInsights(), refreshActivities()])
  }, [refreshInsights, refreshActivities])

  // Transform insights to match AIInsightsPanel interface
  const formattedInsights = insights.map(insight => ({
    id: insight.id,
    type: insight.type,
    title: insight.title,
    description: insight.description,
    impact: insight.impact,
    priority: insight.priority,
    metric: insight.metric,
    change: insight.change,
    confidence: insight.confidence,
    action: insight.action,
    category: insight.category,
    timestamp: insight.created_at,
    createdAt: insight.created_at ? new Date(insight.created_at) : undefined
  }))

  // Transform activities to match ActivityFeed interface
  const formattedActivities = activities.map(activity => ({
    id: activity.id,
    user: activity.user,
    action: activity.action,
    target: activity.target,
    timestamp: activity.timestamp,
    type: activity.type,
    avatar: activity.avatar
  }))

  return {
    insights: formattedInsights,
    activities: formattedActivities,
    rawInsights: insights,
    rawActivities: activities,
    isLoading,
    error,
    refreshAll,
    refreshInsights,
    refreshActivities,
    createInsight,
    updateInsight,
    dismissInsight,
    deleteInsight,
    logActivity
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

function mapLogTypeToActivityType(logType: string): AIBusinessActivity['type'] {
  const typeMap: Record<string, AIBusinessActivity['type']> = {
    'analysis': 'update',
    'report': 'create',
    'share': 'comment',
    'export': 'create',
    'insight': 'info',
    'recommendation': 'success',
    'alert': 'warning',
    'error': 'error'
  }
  return typeMap[logType?.toLowerCase()] || 'info'
}
