'use client'

/**
 * Extended Dependencies Hooks
 * Tables: dependencies, dependency_versions, dependency_vulnerabilities, dependency_licenses
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDependency(dependencyId?: string) {
  const [dependency, setDependency] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dependencyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dependencies').select('*, dependency_versions(*), dependency_vulnerabilities(*)').eq('id', dependencyId).single(); setDependency(data) } finally { setIsLoading(false) }
  }, [dependencyId])
  useEffect(() => { fetch() }, [fetch])
  return { dependency, isLoading, refresh: fetch }
}

export function useProjectDependencies(projectId?: string, options?: { type?: string; is_dev?: boolean }) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('dependencies').select('*').eq('project_id', projectId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_dev !== undefined) query = query.eq('is_dev', options.is_dev)
      const { data } = await query.order('name', { ascending: true })
      setDependencies(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.type, options?.is_dev, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { dependencies, isLoading, refresh: fetch }
}

export function useDependencyVulnerabilities(dependencyId?: string) {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dependencyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dependency_vulnerabilities').select('*').eq('dependency_id', dependencyId).order('severity', { ascending: false }); setVulnerabilities(data || []) } finally { setIsLoading(false) }
  }, [dependencyId])
  useEffect(() => { fetch() }, [fetch])
  return { vulnerabilities, isLoading, refresh: fetch }
}

export function useProjectVulnerabilities(projectId?: string, options?: { severity?: string; status?: string }) {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: deps } = await supabase.from('dependencies').select('id').eq('project_id', projectId)
      if (!deps?.length) { setVulnerabilities([]); return }
      let query = supabase.from('dependency_vulnerabilities').select('*, dependencies:dependency_id(name, version)').in('dependency_id', deps.map(d => d.id))
      if (options?.severity) query = query.eq('severity', options.severity)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('severity', { ascending: false })
      setVulnerabilities(data || [])
    } finally { setIsLoading(false) }
  }, [projectId, options?.severity, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { vulnerabilities, isLoading, refresh: fetch }
}

export function useDependencyVersions(dependencyId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!dependencyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dependency_versions').select('*').eq('dependency_id', dependencyId).order('released_at', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [dependencyId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useOutdatedDependencies(projectId?: string) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('dependencies').select('*').eq('project_id', projectId).eq('is_outdated', true); setDependencies(data || []) } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { dependencies, isLoading, refresh: fetch }
}

export function useDependencyLicenses(projectId?: string) {
  const [licenses, setLicenses] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('dependencies').select('name, license').eq('project_id', projectId)
      const licenseMap: Record<string, string[]> = {}
      data?.forEach(d => { if (d.license) { if (!licenseMap[d.license]) licenseMap[d.license] = []; licenseMap[d.license].push(d.name) } })
      setLicenses(licenseMap)
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { licenses, isLoading, refresh: fetch }
}

export function useDependencyStats(projectId?: string) {
  const [stats, setStats] = useState<{ total: number; dev: number; production: number; outdated: number; vulnerabilities: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('dependencies').select('id, is_dev, is_outdated').eq('project_id', projectId)
      if (!data) { setStats(null); return }
      const total = data.length
      const dev = data.filter(d => d.is_dev).length
      const production = total - dev
      const outdated = data.filter(d => d.is_outdated).length
      const { count: vulnerabilities } = await supabase.from('dependency_vulnerabilities').select('*', { count: 'exact', head: true }).in('dependency_id', data.map(d => d.id)).eq('status', 'open')
      setStats({ total, dev, production, outdated, vulnerabilities: vulnerabilities || 0 })
    } finally { setIsLoading(false) }
  }, [projectId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
