'use client'

/**
 * Extended Deployments Hooks
 * Tables: deployments, deployment_logs, deployment_environments, deployment_rollbacks
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDeployment(deploymentId?: string) {
  const [deployment, setDeployment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!deploymentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('deployments').select('*, deployment_logs(*), deployment_environments(*)').eq('id', deploymentId).single(); setDeployment(data) } finally { setIsLoading(false) }
  }, [deploymentId])
  useEffect(() => { loadData() }, [loadData])
  return { deployment, isLoading, refresh: loadData }
}

export function useProjectDeployments(projectId?: string, options?: { environment_id?: string; status?: string; limit?: number }) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('deployments').select('*').eq('project_id', projectId)
      if (options?.environment_id) query = query.eq('environment_id', options.environment_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50)
      setDeployments(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.environment_id, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { deployments, isLoading, refresh: loadData }
}

export function useDeploymentLogs(deploymentId?: string, options?: { level?: string }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!deploymentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('deployment_logs').select('*').eq('deployment_id', deploymentId)
      if (options?.level) query = query.eq('level', options.level)
      const { data } = await query.order('logged_at', { ascending: true })
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [deploymentId, options?.level])
  useEffect(() => { loadData() }, [loadData])
  return { logs, isLoading, refresh: loadData }
}

export function useEnvironments(projectId?: string) {
  const [environments, setEnvironments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('deployment_environments').select('*')
      if (projectId) query = query.eq('project_id', projectId)
      const { data } = await query.order('name', { ascending: true })
      setEnvironments(data || [])
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { environments, isLoading, refresh: loadData }
}

export function useLatestDeployment(projectId?: string, environmentId?: string) {
  const [deployment, setDeployment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId || !environmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('deployments').select('*').eq('project_id', projectId).eq('environment_id', environmentId).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).single(); setDeployment(data) } finally { setIsLoading(false) }
  }, [projectId, environmentId])
  useEffect(() => { loadData() }, [loadData])
  return { deployment, isLoading, refresh: loadData }
}

export function useDeploymentRollbacks(deploymentId?: string) {
  const [rollbacks, setRollbacks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!deploymentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('deployment_rollbacks').select('*').eq('deployment_id', deploymentId).order('rolled_back_at', { ascending: false }); setRollbacks(data || []) } finally { setIsLoading(false) }
  }, [deploymentId])
  useEffect(() => { loadData() }, [loadData])
  return { rollbacks, isLoading, refresh: loadData }
}

export function useDeploymentStats(projectId?: string, options?: { days?: number }) {
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number; avgDuration: number; byEnvironment: Record<string, number> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (options?.days || 30))
      const { data } = await supabase.from('deployments').select('status, environment_id, duration_seconds').eq('project_id', projectId).gte('started_at', startDate.toISOString())
      if (!data) { setStats(null); return }
      const total = data.length
      const successful = data.filter(d => d.status === 'completed').length
      const failed = data.filter(d => d.status === 'failed').length
      const durations = data.filter(d => d.duration_seconds).map(d => d.duration_seconds)
      const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
      const byEnvironment = data.reduce((acc: Record<string, number>, d) => { acc[d.environment_id] = (acc[d.environment_id] || 0) + 1; return acc }, {})
      setStats({ total, successful, failed, avgDuration, byEnvironment })
    } finally { setIsLoading(false) }
  }, [projectId, options?.days])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useActiveDeployments(projectId?: string) {
  const [deployments, setDeployments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('deployments').select('*').eq('project_id', projectId).in('status', ['pending', 'in_progress']).order('started_at', { ascending: false }); setDeployments(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { loadData() }, [loadData])
  return { deployments, isLoading, refresh: loadData }
}
