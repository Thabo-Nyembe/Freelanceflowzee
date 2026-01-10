'use client'

/**
 * Extended Modules Hooks
 * Tables: modules, module_versions, module_installations, module_dependencies, module_configs, module_permissions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useModule(moduleId?: string) {
  const [module, setModule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('modules').select('*, module_versions(*), module_dependencies(*), module_configs(*)').eq('id', moduleId).single(); setModule(data) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { module, isLoading, refresh: fetch }
}

export function useModules(options?: { category?: string; status?: string; is_published?: boolean; author_id?: string; search?: string; limit?: number }) {
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('modules').select('*')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.is_published !== undefined) query = query.eq('is_published', options.is_published)
      if (options?.author_id) query = query.eq('author_id', options.author_id)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setModules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.status, options?.is_published, options?.author_id, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { modules, isLoading, refresh: fetch }
}

export function useModuleVersions(moduleId?: string) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('module_versions').select('*').eq('module_id', moduleId).order('created_at', { ascending: false }); setVersions(data || []) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { versions, isLoading, refresh: fetch }
}

export function useModuleInstallations(options?: { organization_id?: string; user_id?: string; status?: string }) {
  const [installations, setInstallations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('module_installations').select('*, modules(*), module_versions(*)')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('installed_at', { ascending: false })
      setInstallations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.organization_id, options?.user_id, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { installations, isLoading, refresh: fetch }
}

export function useModuleDependencies(moduleId?: string) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('module_dependencies').select('*, modules!depends_on_id(*)').eq('module_id', moduleId); setDependencies(data || []) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { dependencies, isLoading, refresh: fetch }
}

export function useModuleConfig(installationId?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!installationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('module_configs').select('*').eq('installation_id', installationId).single(); setConfig(data) } finally { setIsLoading(false) }
  }, [installationId])
  useEffect(() => { fetch() }, [fetch])
  return { config, isLoading, refresh: fetch }
}

export function useModulePermissions(moduleId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('module_permissions').select('*').eq('module_id', moduleId); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { permissions, isLoading, refresh: fetch }
}

export function useInstalledModules(userId?: string, organizationId?: string) {
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId && !organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('module_installations').select('*, modules(*), module_versions(*)').eq('status', 'active')
      if (userId) query = query.eq('user_id', userId)
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data } = await query.order('installed_at', { ascending: false })
      setModules(data || [])
    } finally { setIsLoading(false) }
  }, [userId, organizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { modules, isLoading, refresh: fetch }
}

export function usePublishedModules(options?: { category?: string; limit?: number }) {
  const [modules, setModules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('modules').select('*').eq('is_published', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50)
      setModules(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { modules, isLoading, refresh: fetch }
}

export function useModuleStats(moduleId?: string) {
  const [stats, setStats] = useState<{ totalInstalls: number; activeInstalls: number; versions: number; avgRating: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!moduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [installsRes, versionsRes] = await Promise.all([
        supabase.from('module_installations').select('status').eq('module_id', moduleId),
        supabase.from('module_versions').select('id').eq('module_id', moduleId)
      ])
      const totalInstalls = installsRes.data?.length || 0
      const activeInstalls = installsRes.data?.filter(i => i.status === 'active').length || 0
      const versions = versionsRes.data?.length || 0
      setStats({ totalInstalls, activeInstalls, versions, avgRating: 0 })
    } finally { setIsLoading(false) }
  }, [moduleId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}

export function useModuleCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('modules').select('category').eq('is_published', true).not('category', 'is', null)
      const uniqueCategories = [...new Set(data?.map(m => m.category) || [])]
      setCategories(uniqueCategories.sort())
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}
