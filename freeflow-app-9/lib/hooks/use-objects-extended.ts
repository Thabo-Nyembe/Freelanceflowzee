'use client'

/**
 * Extended Objects Hooks
 * Tables: objects, object_types, object_properties, object_relationships, object_versions, object_permissions
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useObject(objectId?: string) {
  const [object, setObject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('objects').select('*, object_types(*), object_properties(*), object_relationships(*)').eq('id', objectId).single(); setObject(data) } finally { setIsLoading(false) }
  }, [objectId])
  useEffect(() => { loadData() }, [loadData])
  return { object, isLoading, refresh: loadData }
}

export function useObjects(options?: { type_id?: string; owner_id?: string; organization_id?: string; status?: string; search?: string; limit?: number }) {
  const [objects, setObjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('objects').select('*, object_types(*)')
      if (options?.type_id) query = query.eq('type_id', options.type_id)
      if (options?.owner_id) query = query.eq('owner_id', options.owner_id)
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setObjects(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type_id, options?.owner_id, options?.organization_id, options?.status, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { objects, isLoading, refresh: loadData }
}

export function useObjectTypes(options?: { is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('object_types').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useObjectProperties(objectId?: string) {
  const [properties, setProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('object_properties').select('*').eq('object_id', objectId); setProperties(data || []) } finally { setIsLoading(false) }
  }, [objectId])
  useEffect(() => { loadData() }, [loadData])
  return { properties, isLoading, refresh: loadData }
}

export function useObjectRelationships(objectId?: string, options?: { direction?: 'source' | 'target' | 'both'; type?: string }) {
  const [relationships, setRelationships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('object_relationships').select('*, source:objects!source_id(*), target:objects!target_id(*)')
      const direction = options?.direction || 'both'
      if (direction === 'source') query = query.eq('source_id', objectId)
      else if (direction === 'target') query = query.eq('target_id', objectId)
      else query = query.or(`source_id.eq.${objectId},target_id.eq.${objectId}`)
      if (options?.type) query = query.eq('relationship_type', options.type)
      const { data } = await query
      setRelationships(data || [])
    } finally { setIsLoading(false) }
  }, [objectId, options?.direction, options?.type])
  useEffect(() => { loadData() }, [loadData])
  return { relationships, isLoading, refresh: loadData }
}

export function useObjectVersions(objectId?: string, options?: { limit?: number }) {
  const [versions, setVersions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('object_versions').select('*').eq('object_id', objectId).order('version', { ascending: false }).limit(options?.limit || 20); setVersions(data || []) } finally { setIsLoading(false) }
  }, [objectId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { versions, isLoading, refresh: loadData }
}

export function useObjectPermissions(objectId?: string) {
  const [permissions, setPermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('object_permissions').select('*').eq('object_id', objectId); setPermissions(data || []) } finally { setIsLoading(false) }
  }, [objectId])
  useEffect(() => { loadData() }, [loadData])
  return { permissions, isLoading, refresh: loadData }
}

export function useObjectsByType(typeSlug?: string, options?: { organization_id?: string; limit?: number }) {
  const [objects, setObjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeSlug) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: type } = await supabase.from('object_types').select('id').eq('slug', typeSlug).single()
      if (!type) { setObjects([]); setIsLoading(false); return }
      let query = supabase.from('objects').select('*, object_types(*)').eq('type_id', type.id).eq('status', 'active')
      if (options?.organization_id) query = query.eq('organization_id', options.organization_id)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setObjects(data || [])
    } finally { setIsLoading(false) }
  }, [typeSlug, options?.organization_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { objects, isLoading, refresh: loadData }
}

export function useRelatedObjects(objectId?: string, relationshipType?: string) {
  const [related, setRelated] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('object_relationships').select('*, target:objects!target_id(*, object_types(*))').eq('source_id', objectId)
      if (relationshipType) query = query.eq('relationship_type', relationshipType)
      const { data } = await query
      setRelated(data?.map(r => ({ ...r.target, relationship: r })) || [])
    } finally { setIsLoading(false) }
  }, [objectId, relationshipType])
  useEffect(() => { loadData() }, [loadData])
  return { related, isLoading, refresh: loadData }
}
