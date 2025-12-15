'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface HelpDoc {
  id: string
  user_id: string
  title: string
  question: string | null
  answer: string | null
  status: 'published' | 'draft' | 'review' | 'outdated'
  category: 'faq' | 'how-to' | 'troubleshooting' | 'reference' | 'best-practices' | 'glossary'
  author: string | null
  views_count: number
  searches_count: number
  helpful_count: number
  not_helpful_count: number
  comments_count: number
  popularity_score: number
  related_docs: string[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface HelpDocsStats {
  total: number
  published: number
  draft: number
  review: number
  totalViews: number
  avgHelpfulness: number
}

export function useHelpDocs(initialDocs: HelpDoc[], initialStats: HelpDocsStats) {
  const [docs, setDocs] = useState<HelpDoc[]>(initialDocs)
  const [stats, setStats] = useState<HelpDocsStats>(initialStats)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel('help_docs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_docs' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDocs(prev => [payload.new as HelpDoc, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setDocs(prev => prev.map(d => d.id === payload.new.id ? payload.new as HelpDoc : d))
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
    const avgHelpfulness = docs.length > 0
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
      avgHelpfulness
    })
  }, [docs])

  return { docs, stats }
}
