'use client'

/**
 * Extended Forecast Hooks
 * Tables: forecasts, forecast_models, forecast_scenarios, forecast_adjustments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useForecast(forecastId?: string) {
  const [forecast, setForecast] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!forecastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forecasts').select('*').eq('id', forecastId).single(); setForecast(data) } finally { setIsLoading(false) }
  }, [forecastId])
  useEffect(() => { loadData() }, [loadData])
  return { forecast, isLoading, refresh: loadData }
}

export function useForecasts(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forecasts').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setForecasts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { forecasts, isLoading, refresh: loadData }
}

export function useForecastModels(options?: { type?: string; is_active?: boolean }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forecast_models').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setModels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { models, isLoading, refresh: loadData }
}

export function useForecastScenarios(forecastId?: string) {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!forecastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forecast_scenarios').select('*').eq('forecast_id', forecastId).order('name', { ascending: true }); setScenarios(data || []) } finally { setIsLoading(false) }
  }, [forecastId])
  useEffect(() => { loadData() }, [loadData])
  return { scenarios, isLoading, refresh: loadData }
}

export function useRecentForecasts(userId?: string, options?: { limit?: number }) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forecasts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 10); setForecasts(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { forecasts, isLoading, refresh: loadData }
}
