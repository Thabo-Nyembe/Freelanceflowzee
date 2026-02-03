'use client'

/**
 * Extended Types Hooks
 * Tables: types, type_fields, type_values, type_hierarchies, type_mappings, type_validations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useType(typeId?: string) {
  const [type, setType] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('types').select('*, type_fields(*), type_values(count)').eq('id', typeId).single(); setType(data) } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { loadData() }, [loadData])
  return { type, isLoading, refresh: loadData }
}

export function useTypeByCode(code?: string) {
  const [type, setType] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!code) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('types').select('*, type_fields(*), type_values(*)').eq('code', code).single(); setType(data) } finally { setIsLoading(false) }
  }, [code])
  useEffect(() => { loadData() }, [loadData])
  return { type, isLoading, refresh: loadData }
}

export function useTypes(options?: { category?: string; parent_id?: string | null; is_system?: boolean; is_active?: boolean; search?: string; limit?: number }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('types').select('*, type_fields(count), type_values(count)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.parent_id) query = query.eq('parent_id', options.parent_id)
      else if (options?.parent_id === null) query = query.is('parent_id', null)
      if (options?.is_system !== undefined) query = query.eq('is_system', options.is_system)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.parent_id, options?.is_system, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useTypeFields(typeId?: string) {
  const [fields, setFields] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('type_fields').select('*').eq('type_id', typeId).order('order_index', { ascending: true }); setFields(data || []) } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { loadData() }, [loadData])
  return { fields, isLoading, refresh: loadData }
}

export function useTypeValues(typeId?: string, options?: { is_active?: boolean }) {
  const [values, setValues] = useState<any[]>([])
  const [defaultValue, setDefaultValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('type_values').select('*').eq('type_id', typeId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('order_index', { ascending: true })
      setValues(data || [])
      setDefaultValue(data?.find(v => v.is_default) || null)
    } finally { setIsLoading(false) }
  }, [typeId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { values, defaultValue, isLoading, refresh: loadData }
}

export function useTypeHierarchy(typeId?: string) {
  const [hierarchy, setHierarchy] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const result: any[] = []
      let currentId: string | null = typeId
      const visited = new Set<string>()
      while (currentId) {
        if (visited.has(currentId)) break // Cycle detected
        visited.add(currentId)
        const { data } = await supabase.from('types').select('*').eq('id', currentId).single()
        if (!data) break
        result.unshift(data)
        currentId = data.parent_id
      }
      setHierarchy(result)
    } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { loadData() }, [loadData])
  return { hierarchy, isLoading, refresh: loadData }
}

export function useChildTypes(typeId?: string) {
  const [children, setChildren] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('types').select('*').eq('parent_id', typeId).order('name', { ascending: true }); setChildren(data || []) } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { loadData() }, [loadData])
  return { children, isLoading, refresh: loadData }
}

export function useTypeMappings(typeId?: string) {
  const [mappings, setMappings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('type_mappings').select('*, source_type:types!source_type_id(*), target_type:types!target_type_id(*)').or(`source_type_id.eq.${typeId},target_type_id.eq.${typeId}`); setMappings(data || []) } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { loadData() }, [loadData])
  return { mappings, isLoading, refresh: loadData }
}

export function useTypeValidations(typeId?: string) {
  const [validations, setValidations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!typeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('type_validations').select('*, type_fields(*)').eq('type_id', typeId).order('created_at', { ascending: true }); setValidations(data || []) } finally { setIsLoading(false) }
  }, [typeId])
  useEffect(() => { loadData() }, [loadData])
  return { validations, isLoading, refresh: loadData }
}

export function useTypeCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('types').select('category').not('category', 'is', null)
      const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]
      setCategories(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useRootTypes(options?: { category?: string; is_active?: boolean }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('types').select('*, type_values(count)').is('parent_id', null)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useSystemTypes(options?: { category?: string }) {
  const [types, setTypes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('types').select('*, type_values(*)').eq('is_system', true).eq('is_active', true)
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true })
      setTypes(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}
