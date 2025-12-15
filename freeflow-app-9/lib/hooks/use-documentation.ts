'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Documentation {
  id: string
  user_id: string
  title: string
  description: string | null
  content: string | null
  status: 'published' | 'draft' | 'review' | 'archived'
  doc_type: 'guide' | 'api-reference' | 'tutorial' | 'concept' | 'quickstart' | 'troubleshooting'
  category: 'getting-started' | 'features' | 'integrations' | 'api' | 'sdk' | 'advanced'
  author: string | null
  version: string
  views_count: number
  likes_count: number
  comments_count: number
  helpful_count: number
  not_helpful_count: number
  read_time: number
  contributors_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface DocumentationStats {
  total: number
  published: number
  draft: number
  review: number
  totalViews: number
  avgHelpfulRate: number
}

export function useDocumentation(initialDocs: Documentation[], initialStats: DocumentationStats) {
  const [docs, setDocs] = useState<Documentation[]>(initialDocs)
  const [stats, setStats] = useState<DocumentationStats>(initialStats)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel('documentation_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documentation' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDocs(prev => [payload.new as Documentation, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setDocs(prev => prev.map(d => d.id === payload.new.id ? payload.new as Documentation : d))
        } else if (payload.eventType === 'DELETE') {
          setDocs(prev => prev.filter(d => d.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  useEffect(() => {
    const published = docs.filter(d => d.status === 'published').length
    const draft = docs.filter(d => d.status === 'draft').length
    const review = docs.filter(d => d.status === 'review').length
    const totalViews = docs.reduce((sum, d) => sum + (d.views_count || 0), 0)
    const avgHelpfulRate = docs.length > 0
      ? docs.reduce((sum, d) => {
          const total = (d.helpful_count || 0) + (d.not_helpful_count || 0)
          return sum + (total > 0 ? (d.helpful_count || 0) / total : 0)
        }, 0) / docs.length * 100
      : 0

    setStats({
      total: docs.length,
      published,
      draft,
      review,
      totalViews,
      avgHelpfulRate
    })
  }, [docs])

  return { docs, stats }
}
