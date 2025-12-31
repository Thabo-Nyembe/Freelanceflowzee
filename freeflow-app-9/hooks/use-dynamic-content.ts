'use client'

import { useState, useEffect } from 'react'

interface MarketingContent {
  id: string
  slug: string
  title: string
  subtitle?: string
  content?: string
  image_url?: string
  category: string
  is_featured: boolean
  display_order: number
  metadata: Record<string, unknown>
}

interface BusinessMetric {
  id: string
  metric_name: string
  metric_key: string
  current_value: number
  previous_value?: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change_percentage?: number
  category: string
}

interface PlatformStat {
  id: string
  stat_key: string
  stat_value: number
  stat_label: string
  icon?: string
  color: string
}

interface DynamicContent {
  marketing: MarketingContent[]
  metrics: BusinessMetric[]
  stats: PlatformStat[]
}

interface Activity {
  id: string
  activity_type: string
  title: string
  description?: string
  icon?: string
  metadata: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export function useDynamicContent(type?: string, category?: string) {
  const [content, setContent] = useState<DynamicContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (type) params.set('type', type)
        if (category) params.set('category', category)

        const response = await fetch(`/api/content?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch content')

        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [type, category])

  return { content, loading, error }
}

export function useActivityFeed(limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const response = await fetch(`/api/activity?limit=${limit}`)
        if (!response.ok) throw new Error('Failed to fetch activities')

        const data = await response.json()
        setActivities(data.activities || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [limit])

  const logActivity = async (activity: Omit<Activity, 'id' | 'is_read' | 'created_at'>) => {
    try {
      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      })

      if (!response.ok) throw new Error('Failed to log activity')

      const data = await response.json()
      setActivities(prev => [data.activity, ...prev])
      return data.activity
    } catch (err) {
      console.error('Failed to log activity:', err)
      return null
    }
  }

  return { activities, loading, error, logActivity }
}

export function useBusinessMetrics() {
  const { content, loading, error } = useDynamicContent('metrics')
  return {
    metrics: content?.metrics || [],
    loading,
    error
  }
}

export function usePlatformStats() {
  const { content, loading, error } = useDynamicContent('stats')
  return {
    stats: content?.stats || [],
    loading,
    error
  }
}

export function useMarketingContent(category?: string) {
  const { content, loading, error } = useDynamicContent('marketing', category)
  return {
    content: content?.marketing || [],
    loading,
    error
  }
}
