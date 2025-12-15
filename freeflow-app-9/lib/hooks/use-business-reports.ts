'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface BusinessReport {
  id: string
  user_id: string
  title: string
  description: string | null
  report_type: 'financial' | 'operational' | 'custom' | 'analytics' | 'sales'
  status: 'draft' | 'generating' | 'ready' | 'scheduled' | 'failed'
  schedule: 'on-demand' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  views_count: number
  downloads_count: number
  shares_count: number
  file_url: string | null
  file_format: string
  data_range_start: string | null
  data_range_end: string | null
  filters: Record<string, any>
  metadata: Record<string, any>
  last_generated_at: string | null
  next_scheduled_at: string | null
  created_at: string
  updated_at: string
}

export interface ReportStats {
  total: number
  ready: number
  generating: number
  scheduled: number
  totalViews: number
  totalDownloads: number
  totalShares: number
  avgGenerationTime: number
}

export interface ReportInput {
  title: string
  description?: string
  report_type?: 'financial' | 'operational' | 'custom' | 'analytics' | 'sales'
  schedule?: 'on-demand' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  file_format?: string
  data_range_start?: string
  data_range_end?: string
  filters?: Record<string, any>
}

export function useBusinessReports(initialReports: BusinessReport[] = [], initialStats: ReportStats) {
  const [reports, setReports] = useState<BusinessReport[]>(initialReports)
  const [stats, setStats] = useState<ReportStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Calculate stats from reports
  const calculateStats = useCallback((reps: BusinessReport[]): ReportStats => {
    return {
      total: reps.length,
      ready: reps.filter(r => r.status === 'ready').length,
      generating: reps.filter(r => r.status === 'generating').length,
      scheduled: reps.filter(r => r.schedule !== 'on-demand').length,
      totalViews: reps.reduce((sum, r) => sum + r.views_count, 0),
      totalDownloads: reps.reduce((sum, r) => sum + r.downloads_count, 0),
      totalShares: reps.reduce((sum, r) => sum + r.shares_count, 0),
      avgGenerationTime: 2.4 // Placeholder - would need actual timing data
    }
  }, [])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('business-reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'business_reports' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReports(prev => {
              const updated = [payload.new as BusinessReport, ...prev]
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => {
              const updated = prev.map(r => r.id === payload.new.id ? payload.new as BusinessReport : r)
              setStats(calculateStats(updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setReports(prev => {
              const updated = prev.filter(r => r.id !== payload.old.id)
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

  const createReport = useCallback(async (input: ReportInput) => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('business_reports')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          report_type: input.report_type || 'custom',
          schedule: input.schedule || 'on-demand',
          file_format: input.file_format || 'pdf',
          data_range_start: input.data_range_start || null,
          data_range_end: input.data_range_end || null,
          filters: input.filters || {}
        })
        .select()
        .single()

      if (insertError) throw insertError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const updateReport = useCallback(async (id: string, updates: Partial<ReportInput>) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('business_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report')
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const deleteReport = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('business_reports')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const generateReport = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      // Set status to generating
      const { error: updateError } = await supabase
        .from('business_reports')
        .update({
          status: 'generating',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError

      // Simulate report generation (in real app, this would call an API)
      setTimeout(async () => {
        await supabase
          .from('business_reports')
          .update({
            status: 'ready',
            last_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      }, 3000)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const viewReport = useCallback(async (id: string) => {
    const report = reports.find(r => r.id === id)
    if (!report) return null

    const { data, error: updateError } = await supabase
      .from('business_reports')
      .update({ views_count: report.views_count + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase, reports])

  const downloadReport = useCallback(async (id: string) => {
    const report = reports.find(r => r.id === id)
    if (!report) return null

    const { data, error: updateError } = await supabase
      .from('business_reports')
      .update({ downloads_count: report.downloads_count + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase, reports])

  const shareReport = useCallback(async (id: string) => {
    const report = reports.find(r => r.id === id)
    if (!report) return null

    const { data, error: updateError } = await supabase
      .from('business_reports')
      .update({ shares_count: report.shares_count + 1 })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }
    return data
  }, [supabase, reports])

  return {
    reports,
    stats,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    viewReport,
    downloadReport,
    shareReport
  }
}
