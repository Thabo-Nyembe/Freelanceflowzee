'use client'

/**
 * Extended Churn Hooks
 * Tables: churn_predictions, churn_indicators, churn_analysis, churn_interventions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useChurnPrediction(predictionId?: string) {
  const [prediction, setPrediction] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!predictionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('churn_predictions').select('*, churn_indicators(*)').eq('id', predictionId).single(); setPrediction(data) } finally { setIsLoading(false) }
  }, [predictionId])
  useEffect(() => { fetch() }, [fetch])
  return { prediction, isLoading, refresh: fetch }
}

export function useChurnPredictions(options?: { risk_level?: string; status?: string; min_score?: number; limit?: number }) {
  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('churn_predictions').select('*')
      if (options?.risk_level) query = query.eq('risk_level', options.risk_level)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.min_score) query = query.gte('risk_score', options.min_score)
      const { data } = await query.order('risk_score', { ascending: false }).limit(options?.limit || 50)
      setPredictions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.risk_level, options?.status, options?.min_score, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { predictions, isLoading, refresh: fetch }
}

export function useHighRiskCustomers(threshold?: number, limit?: number) {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('churn_predictions').select('*').eq('status', 'active').gte('risk_score', threshold || 70).order('risk_score', { ascending: false }).limit(limit || 50); setCustomers(data || []) } finally { setIsLoading(false) }
  }, [threshold, limit])
  useEffect(() => { fetch() }, [fetch])
  return { customers, isLoading, refresh: fetch }
}

export function useChurnIndicators(predictionId?: string) {
  const [indicators, setIndicators] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!predictionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('churn_indicators').select('*').eq('prediction_id', predictionId).order('weight', { ascending: false }); setIndicators(data || []) } finally { setIsLoading(false) }
  }, [predictionId])
  useEffect(() => { fetch() }, [fetch])
  return { indicators, isLoading, refresh: fetch }
}

export function useChurnInterventions(options?: { customer_id?: string; status?: string; limit?: number }) {
  const [interventions, setInterventions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('churn_interventions').select('*')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInterventions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.status, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { interventions, isLoading, refresh: fetch }
}

export function useChurnStats() {
  const [stats, setStats] = useState<{ total: number; highRisk: number; mediumRisk: number; lowRisk: number; avgScore: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('churn_predictions').select('risk_level, risk_score').eq('status', 'active')
      if (!data) { setStats(null); return }
      const total = data.length
      const highRisk = data.filter(p => p.risk_level === 'high').length
      const mediumRisk = data.filter(p => p.risk_level === 'medium').length
      const lowRisk = data.filter(p => p.risk_level === 'low').length
      const avgScore = total > 0 ? data.reduce((sum, p) => sum + p.risk_score, 0) / total : 0
      setStats({ total, highRisk, mediumRisk, lowRisk, avgScore })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useChurnAnalysis(options?: { date_from?: string; date_to?: string }) {
  const [analysis, setAnalysis] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('churn_analysis').select('*')
      if (options?.date_from) query = query.gte('analysis_date', options.date_from)
      if (options?.date_to) query = query.lte('analysis_date', options.date_to)
      const { data } = await query.order('analysis_date', { ascending: false })
      setAnalysis(data || [])
    } finally { setIsLoading(false) }
  }, [options?.date_from, options?.date_to])
  useEffect(() => { fetch() }, [fetch])
  return { analysis, isLoading, refresh: fetch }
}
