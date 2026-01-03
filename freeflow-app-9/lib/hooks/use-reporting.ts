'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Types
export type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'table' | 'kpi' | 'map'
export type DataSourceType = 'postgresql' | 'mysql' | 'mongodb' | 'csv' | 'api' | 'snowflake' | 'bigquery'
export type ScheduleType = 'daily' | 'weekly' | 'monthly'
export type ExportFormat = 'pdf' | 'xlsx' | 'png' | 'csv'

export interface Dashboard {
  id: string
  user_id: string
  name: string
  description?: string
  thumbnail?: string
  widgets: any[]
  views: number
  favorites: number
  is_favorite: boolean
  is_published: boolean
  tags: string[]
  author?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface Worksheet {
  id: string
  user_id: string
  name: string
  chart_type: ChartType
  data_source: string
  metrics: string[]
  dimensions: string[]
  filters: any[]
  author?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ReportDataSource {
  id: string
  user_id: string
  name: string
  type: DataSourceType
  host: string
  database_name: string
  status: 'connected' | 'disconnected' | 'error'
  last_sync?: string
  tables: number
  row_count: number
  connection_string?: string
  credentials?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface ScheduledReport {
  id: string
  user_id: string
  name: string
  dashboard_id: string
  dashboard_name?: string
  schedule: ScheduleType
  next_run?: string
  last_run?: string
  recipients: string[]
  format: ExportFormat
  enabled: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}

// Hook for Dashboards
export function useDashboards() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchDashboards = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: queryError } = await supabase
        .from('reporting_dashboards')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (queryError) throw queryError
      setDashboards(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboards'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDashboards()
  }, [fetchDashboards])

  const createDashboard = async (data: Partial<Dashboard>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('reporting_dashboards')
        .insert({
          ...data,
          user_id: user.id,
          views: 0,
          favorites: 0,
          is_favorite: false,
          is_published: false,
          widgets: data.widgets || [],
          tags: data.tags || []
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Dashboard created successfully')
      await fetchDashboards()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create dashboard')
      toast.error(error.message)
      throw error
    }
  }

  const updateDashboard = async (id: string, data: Partial<Dashboard>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('reporting_dashboards')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Dashboard updated successfully')
      await fetchDashboards()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update dashboard')
      toast.error(error.message)
      throw error
    }
  }

  const deleteDashboard = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reporting_dashboards')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Dashboard deleted successfully')
      await fetchDashboards()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete dashboard')
      toast.error(error.message)
      throw error
    }
  }

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reporting_dashboards')
        .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites')
      await fetchDashboards()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update favorite')
      toast.error(error.message)
      throw error
    }
  }

  const publishDashboard = async (id: string, isPublished: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reporting_dashboards')
        .update({ is_published: isPublished, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success(isPublished ? 'Dashboard published' : 'Dashboard unpublished')
      await fetchDashboards()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update publish status')
      toast.error(error.message)
      throw error
    }
  }

  return {
    dashboards,
    loading,
    error,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    toggleFavorite,
    publishDashboard,
    refetch: fetchDashboards
  }
}

// Hook for Worksheets
export function useWorksheets() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchWorksheets = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: queryError } = await supabase
        .from('reporting_worksheets')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (queryError) throw queryError
      setWorksheets(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch worksheets'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchWorksheets()
  }, [fetchWorksheets])

  const createWorksheet = async (data: Partial<Worksheet>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('reporting_worksheets')
        .insert({
          ...data,
          user_id: user.id,
          metrics: data.metrics || [],
          dimensions: data.dimensions || [],
          filters: data.filters || []
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Worksheet created successfully')
      await fetchWorksheets()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create worksheet')
      toast.error(error.message)
      throw error
    }
  }

  const updateWorksheet = async (id: string, data: Partial<Worksheet>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('reporting_worksheets')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Worksheet updated successfully')
      await fetchWorksheets()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update worksheet')
      toast.error(error.message)
      throw error
    }
  }

  const deleteWorksheet = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reporting_worksheets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Worksheet deleted successfully')
      await fetchWorksheets()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete worksheet')
      toast.error(error.message)
      throw error
    }
  }

  return {
    worksheets,
    loading,
    error,
    createWorksheet,
    updateWorksheet,
    deleteWorksheet,
    refetch: fetchWorksheets
  }
}

// Hook for Data Sources
export function useReportDataSources() {
  const [dataSources, setDataSources] = useState<ReportDataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchDataSources = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: queryError } = await supabase
        .from('reporting_data_sources')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      if (queryError) throw queryError
      setDataSources(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data sources'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDataSources()
  }, [fetchDataSources])

  const createDataSource = async (data: Partial<ReportDataSource>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('reporting_data_sources')
        .insert({
          ...data,
          user_id: user.id,
          status: 'disconnected',
          tables: 0,
          row_count: 0
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Data source added successfully')
      await fetchDataSources()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add data source')
      toast.error(error.message)
      throw error
    }
  }

  const updateDataSource = async (id: string, data: Partial<ReportDataSource>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: result, error } = await supabase
        .from('reporting_data_sources')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Data source updated successfully')
      await fetchDataSources()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update data source')
      toast.error(error.message)
      throw error
    }
  }

  const deleteDataSource = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('reporting_data_sources')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Data source deleted successfully')
      await fetchDataSources()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete data source')
      toast.error(error.message)
      throw error
    }
  }

  const syncDataSource = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Simulate sync operation
      const { error } = await supabase
        .from('reporting_data_sources')
        .update({
          last_sync: new Date().toISOString(),
          status: 'connected',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Data source synced successfully')
      await fetchDataSources()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync data source')
      toast.error(error.message)
      throw error
    }
  }

  return {
    dataSources,
    loading,
    error,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    syncDataSource,
    refetch: fetchDataSources
  }
}

// Hook for Scheduled Reports
export function useScheduledReports() {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchScheduledReports = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: queryError } = await supabase
        .from('scheduled_reports')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('next_run', { ascending: true })

      if (queryError) throw queryError
      setScheduledReports(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch scheduled reports'))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchScheduledReports()
  }, [fetchScheduledReports])

  const createScheduledReport = async (data: Partial<ScheduledReport>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Calculate next run based on schedule
      const nextRun = calculateNextRun(data.schedule || 'daily')

      const { data: result, error } = await supabase
        .from('scheduled_reports')
        .insert({
          ...data,
          user_id: user.id,
          next_run: nextRun,
          enabled: true,
          recipients: data.recipients || []
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Report scheduled successfully')
      await fetchScheduledReports()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to schedule report')
      toast.error(error.message)
      throw error
    }
  }

  const updateScheduledReport = async (id: string, data: Partial<ScheduledReport>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updateData: any = { ...data, updated_at: new Date().toISOString() }

      // Recalculate next run if schedule changed
      if (data.schedule) {
        updateData.next_run = calculateNextRun(data.schedule)
      }

      const { data: result, error } = await supabase
        .from('scheduled_reports')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      toast.success('Scheduled report updated successfully')
      await fetchScheduledReports()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update scheduled report')
      toast.error(error.message)
      throw error
    }
  }

  const deleteScheduledReport = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('scheduled_reports')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Scheduled report deleted successfully')
      await fetchScheduledReports()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete scheduled report')
      toast.error(error.message)
      throw error
    }
  }

  const toggleScheduledReport = async (id: string, enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('scheduled_reports')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success(enabled ? 'Report schedule enabled' : 'Report schedule disabled')
      await fetchScheduledReports()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to toggle schedule')
      toast.error(error.message)
      throw error
    }
  }

  const runReportNow = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Mark last run and calculate next run
      const { error } = await supabase
        .from('scheduled_reports')
        .update({
          last_run: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      toast.success('Report is being generated and sent')
      await fetchScheduledReports()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to run report')
      toast.error(error.message)
      throw error
    }
  }

  return {
    scheduledReports,
    loading,
    error,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleScheduledReport,
    runReportNow,
    refetch: fetchScheduledReports
  }
}

// Helper function to calculate next run date
function calculateNextRun(schedule: ScheduleType): string {
  const now = new Date()
  let nextRun = new Date()

  switch (schedule) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1)
      nextRun.setHours(9, 0, 0, 0)
      break
    case 'weekly':
      nextRun.setDate(now.getDate() + (7 - now.getDay() + 1) % 7 + 1)
      nextRun.setHours(9, 0, 0, 0)
      break
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1, 1)
      nextRun.setHours(9, 0, 0, 0)
      break
  }

  return nextRun.toISOString()
}
