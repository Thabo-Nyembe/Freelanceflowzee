'use client'

/**
 * Extended Machine Hooks
 * Tables: machine_learning_models, machine_predictions, machine_training_jobs, machine_datasets, machine_features, machine_deployments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMLModel(modelId?: string) {
  const [model, setModel] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_learning_models').select('*, machine_features(*), machine_deployments(*)').eq('id', modelId).single(); setModel(data) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { model, isLoading, refresh: loadData }
}

export function useMLModels(options?: { model_type?: string; status?: string; organization_id?: string; limit?: number }) {
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('machine_learning_models').select('*')
      if (options?.model_type) query = query.eq('model_type', options.model_type)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setModels(data || [])
    } finally { setIsLoading(false) }
  }, [options?.model_type, options?.status, options?.organization_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { models, isLoading, refresh: loadData }
}

export function useTrainingJobs(modelId?: string, options?: { status?: string; limit?: number }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('machine_training_jobs').select('*, machine_datasets(*)').eq('model_id', modelId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 20)
      setJobs(data || [])
    } finally { setIsLoading(false) }
  }, [modelId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { jobs, isLoading, refresh: loadData }
}

export function useTrainingJob(jobId?: string) {
  const [job, setJob] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!jobId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_training_jobs').select('*, machine_datasets(*), machine_learning_models(*)').eq('id', jobId).single(); setJob(data) } finally { setIsLoading(false) }
  }, [jobId])
  useEffect(() => { loadData() }, [loadData])
  return { job, isLoading, refresh: loadData }
}

export function useDatasets(options?: { organization_id?: string; status?: string; limit?: number }) {
  const [datasets, setDatasets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('machine_datasets').select('*')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setDatasets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { datasets, isLoading, refresh: loadData }
}

export function useDataset(datasetId?: string) {
  const [dataset, setDataset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!datasetId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_datasets').select('*').eq('id', datasetId).single(); setDataset(data) } finally { setIsLoading(false) }
  }, [datasetId])
  useEffect(() => { loadData() }, [loadData])
  return { dataset, isLoading, refresh: loadData }
}

export function useModelFeatures(modelId?: string) {
  const [features, setFeatures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_features').select('*').eq('model_id', modelId).order('importance', { ascending: false }); setFeatures(data || []) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { features, isLoading, refresh: loadData }
}

export function useModelDeployments(modelId?: string) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_deployments').select('*').eq('model_id', modelId).order('deployed_at', { ascending: false }); setDeployments(data || []) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { deployments, isLoading, refresh: loadData }
}

export function usePredictions(modelId?: string, options?: { limit?: number }) {
  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_predictions').select('*').eq('model_id', modelId).order('created_at', { ascending: false }).limit(options?.limit || 100); setPredictions(data || []) } finally { setIsLoading(false) }
  }, [modelId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { predictions, isLoading, refresh: loadData }
}

export function useActiveDeployment(modelId?: string) {
  const [deployment, setDeployment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('machine_deployments').select('*').eq('model_id', modelId).eq('status', 'active').order('deployed_at', { ascending: false }).limit(1).single(); setDeployment(data) } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { deployment, isLoading, refresh: loadData }
}

export function useModelMetrics(modelId?: string) {
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!modelId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: latestJob } = await supabase.from('machine_training_jobs').select('metrics').eq('model_id', modelId).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).single()
      setMetrics(latestJob?.metrics || null)
    } finally { setIsLoading(false) }
  }, [modelId])
  useEffect(() => { loadData() }, [loadData])
  return { metrics, isLoading, refresh: loadData }
}
