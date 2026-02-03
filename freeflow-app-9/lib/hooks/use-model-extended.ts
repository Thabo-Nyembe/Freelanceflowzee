'use client'

/**
 * Extended Model Hooks
 * Tables: models, model_versions, model_deployments, model_predictions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useModel(modelId?: string) {
  const [model, setModel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('models').select('*').eq('id', modelId).single(); setModel(data) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { model, isLoading, refresh: loadData }
}

export function useModels(options?: { user_id?: string; type?: string; framework?: string; status?: string; limit?: number }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('models').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.framework) query = query.eq('framework', options.framework)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setModels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.framework, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { models, isLoading, refresh: loadData }
}

export function useModelVersions(modelId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('model_versions').select('*').eq('model_id', modelId).order('created_at', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function useModelDeployments(modelId?: string) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('model_deployments').select('*').eq('model_id', modelId).order('deployed_at', { ascending: false }); setDeployments(data || []) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { deployments, isLoading, refresh: loadData }
}

export function useModelPredictions(modelId?: string, options?: { limit?: number }) {
  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('model_predictions').select('*').eq('model_id', modelId).order('created_at', { ascending: false }).limit(options?.limit || 100); setPredictions(data || []) } finally { setIsLoading(false) }
  }, [modelId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { predictions, isLoading, refresh: loadData }
}

export function useDeployedModels() {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('models').select('*').eq('status', 'deployed').order('name', { ascending: true }); setModels(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { models, isLoading, refresh: loadData }
}

export function useMyModels(userId?: string, options?: { limit?: number }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('models').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(options?.limit || 50); setModels(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { models, isLoading, refresh: loadData }
}
