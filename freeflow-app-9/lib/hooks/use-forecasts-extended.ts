'use client'

/**
 * Extended Forecasts Hooks
 * Tables: forecasts, forecast_models, forecast_predictions, forecast_accuracy, forecast_scenarios
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useForecast(forecastId?: string) {
  const [forecast, setForecast] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forecastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forecasts').select('*, forecast_predictions(*), forecast_accuracy(*)').eq('id', forecastId).single(); setForecast(data) } finally { setIsLoading(false) }
  }, [forecastId])
  useEffect(() => { fetch() }, [fetch])
  return { forecast, isLoading, refresh: fetch }
}

export function useForecasts(options?: { type?: string; status?: string; created_by?: string; target_metric?: string; limit?: number }) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forecasts').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.created_by) query = query.eq('created_by', options.created_by)
      if (options?.target_metric) query = query.eq('target_metric', options.target_metric)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setForecasts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.status, options?.created_by, options?.target_metric, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { forecasts, isLoading, refresh: fetch }
}

export function useForecastModels(options?: { type?: string; is_active?: boolean }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('forecast_models').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('created_at', { ascending: false })
      setModels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { models, isLoading, refresh: fetch }
}

export function useForecastPredictions(forecastId?: string, options?: { from_date?: string; to_date?: string }) {
  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forecastId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('forecast_predictions').select('*').eq('forecast_id', forecastId)
      if (options?.from_date) query = query.gte('date', options.from_date)
      if (options?.to_date) query = query.lte('date', options.to_date)
      const { data } = await query.order('date', { ascending: true })
      setPredictions(data || [])
    } finally { setIsLoading(false) }
  }, [forecastId, options?.from_date, options?.to_date, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { predictions, isLoading, refresh: fetch }
}

export function useForecastAccuracy(forecastId?: string) {
  const [accuracy, setAccuracy] = useState<{ records: any[]; avgError: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forecastId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('forecast_accuracy').select('*').eq('forecast_id', forecastId).order('date', { ascending: true })
      const avgError = data?.length ? data.reduce((sum, a) => sum + Math.abs(a.error_percentage), 0) / data.length : 0
      setAccuracy({ records: data || [], avgError })
    } finally { setIsLoading(false) }
  }, [forecastId])
  useEffect(() => { fetch() }, [fetch])
  return { accuracy, isLoading, refresh: fetch }
}

export function useForecastScenarios(forecastId?: string) {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!forecastId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('forecast_scenarios').select('*').eq('forecast_id', forecastId).order('created_at', { ascending: false }); setScenarios(data || []) } finally { setIsLoading(false) }
  }, [forecastId])
  useEffect(() => { fetch() }, [fetch])
  return { scenarios, isLoading, refresh: fetch }
}

export function useRecentForecasts(limit?: number) {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('forecasts').select('*').order('created_at', { ascending: false }).limit(limit || 10); setForecasts(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { forecasts, isLoading, refresh: fetch }
}

export function useForecastsByType() {
  const [byType, setByType] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('forecasts').select('*').order('created_at', { ascending: false })
      const grouped: Record<string, any[]> = {}
      data?.forEach(f => { if (!grouped[f.type]) grouped[f.type] = []; grouped[f.type].push(f) })
      setByType(grouped)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { byType, isLoading, refresh: fetch }
}
