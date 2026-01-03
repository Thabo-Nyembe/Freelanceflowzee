'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export interface Report {
  id: string
  user_id: string
  report_number: string | null
  name: string
  description: string | null
  type: 'financial' | 'sales' | 'analytics' | 'performance' | 'custom'
  status: 'draft' | 'generating' | 'ready' | 'scheduled' | 'archived'
  data_points: number
  file_size_mb: number | null
  file_url: string | null
  is_recurring: boolean
  schedule_cron: string | null
  next_run_at: string | null
  last_run_at: string | null
  date_from: string | null
  date_to: string | null
  config: Record<string, any>
  filters: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  generated_at: string | null
}

export interface RevenueEntry {
  id: string
  user_id: string
  amount: number
  currency: string
  type: 'income' | 'expense' | 'refund'
  category: string | null
  source: string | null
  source_id: string | null
  client_id: string | null
  project_id: string | null
  invoice_id: string | null
  entry_date: string
  description: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface ReportStats {
  total: number
  draft: number
  ready: number
  scheduled: number
  archived: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

export function useReports(initialReports: Report[] = [], initialStats?: ReportStats) {
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([])
  const [stats, setStats] = useState<ReportStats>(initialStats || {
    total: 0,
    draft: 0,
    ready: 0,
    scheduled: 0,
    archived: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const calculateStats = useCallback((reportsList: Report[], revenue: RevenueEntry[]): ReportStats => {
    const income = revenue.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
    const expenses = revenue.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
    const refunds = revenue.filter(r => r.type === 'refund').reduce((sum, r) => sum + r.amount, 0)

    return {
      total: reportsList.length,
      draft: reportsList.filter(r => r.status === 'draft').length,
      ready: reportsList.filter(r => r.status === 'ready').length,
      scheduled: reportsList.filter(r => r.status === 'scheduled').length,
      archived: reportsList.filter(r => r.status === 'archived').length,
      totalRevenue: income,
      totalExpenses: expenses + refunds,
      netIncome: income - expenses - refunds
    }
  }, [])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
      setStats(calculateStats(data || [], revenueEntries))
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch reports',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats, revenueEntries])

  const fetchRevenueEntries = useCallback(async (dateFrom?: string, dateTo?: string) => {
    setLoading(true)
    try {
      let query = supabase
        .from('revenue_entries')
        .select('*')
        .order('entry_date', { ascending: false })

      if (dateFrom) query = query.gte('entry_date', dateFrom)
      if (dateTo) query = query.lte('entry_date', dateTo)

      const { data, error } = await query

      if (error) throw error
      setRevenueEntries(data || [])
      setStats(calculateStats(reports, data || []))
      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch revenue entries',
        variant: 'destructive'
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, calculateStats, reports])

  const createReport = useCallback(async (reportData: Partial<Report>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...reportData,
          user_id: user.id,
          config: reportData.config || {},
          filters: reportData.filters || {},
          metadata: reportData.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      const updatedReports = [data, ...reports]
      setReports(updatedReports)
      setStats(calculateStats(updatedReports, revenueEntries))

      toast({
        title: 'Success',
        description: 'Report created successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create report',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, reports, revenueEntries, calculateStats])

  const updateReport = useCallback(async (id: string, updates: Partial<Report>) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedReports = reports.map(r => r.id === id ? data : r)
      setReports(updatedReports)
      setStats(calculateStats(updatedReports, revenueEntries))

      toast({
        title: 'Success',
        description: 'Report updated successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update report',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, reports, revenueEntries, calculateStats])

  const deleteReport = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)

      if (error) throw error

      const updatedReports = reports.filter(r => r.id !== id)
      setReports(updatedReports)
      setStats(calculateStats(updatedReports, revenueEntries))

      toast({
        title: 'Success',
        description: 'Report deleted successfully'
      })

      return true
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete report',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, reports, revenueEntries, calculateStats])

  const generateReport = useCallback(async (id: string) => {
    // Update status to generating
    await updateReport(id, { status: 'generating' })

    // Simulate report generation (in production, this would be a server action)
    setTimeout(async () => {
      await updateReport(id, {
        status: 'ready',
        generated_at: new Date().toISOString(),
        data_points: Math.floor(Math.random() * 1000) + 100
      })
    }, 2000)

    return true
  }, [updateReport])

  const archiveReport = useCallback(async (id: string) => {
    return updateReport(id, { status: 'archived' })
  }, [updateReport])

  const scheduleReport = useCallback(async (id: string, cronExpression: string) => {
    return updateReport(id, {
      status: 'scheduled',
      is_recurring: true,
      schedule_cron: cronExpression,
      next_run_at: new Date().toISOString() // Would calculate based on cron
    })
  }, [updateReport])

  const createRevenueEntry = useCallback(async (entryData: Partial<RevenueEntry>) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('revenue_entries')
        .insert({
          ...entryData,
          user_id: user.id,
          metadata: entryData.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      const updatedEntries = [data, ...revenueEntries]
      setRevenueEntries(updatedEntries)
      setStats(calculateStats(reports, updatedEntries))

      toast({
        title: 'Success',
        description: 'Revenue entry added successfully'
      })

      return data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add revenue entry',
        variant: 'destructive'
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, reports, revenueEntries, calculateStats])

  // Real-time subscriptions
  useEffect(() => {
    const reportsChannel = supabase
      .channel('reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReports(prev => {
              const updated = [payload.new as Report, ...prev]
              setStats(calculateStats(updated, revenueEntries))
              return updated
            })
          } else if (payload.eventType === 'UPDATE') {
            setReports(prev => {
              const updated = prev.map(r =>
                r.id === payload.new.id ? payload.new as Report : r
              )
              setStats(calculateStats(updated, revenueEntries))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setReports(prev => {
              const updated = prev.filter(r => r.id !== payload.old.id)
              setStats(calculateStats(updated, revenueEntries))
              return updated
            })
          }
        }
      )
      .subscribe()

    const revenueChannel = supabase
      .channel('revenue_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'revenue_entries'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRevenueEntries(prev => {
              const updated = [payload.new as RevenueEntry, ...prev]
              setStats(calculateStats(reports, updated))
              return updated
            })
          } else if (payload.eventType === 'DELETE') {
            setRevenueEntries(prev => {
              const updated = prev.filter(r => r.id !== payload.old.id)
              setStats(calculateStats(reports, updated))
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(reportsChannel)
      supabase.removeChannel(revenueChannel)
    }
  }, [supabase, calculateStats, reports, revenueEntries])

  return {
    reports,
    revenueEntries,
    stats,
    loading,
    fetchReports,
    fetchRevenueEntries,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    archiveReport,
    scheduleReport,
    createRevenueEntry
  }
}
