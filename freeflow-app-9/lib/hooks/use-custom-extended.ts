'use client'

/**
 * Extended Custom Hooks - Covers all Custom field/attribute tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCustomField(fieldId?: string) {
  const [field, setField] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!fieldId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('custom_fields').select('*').eq('id', fieldId).single()
      setField(data)
    } finally { setIsLoading(false) }
  }, [fieldId])
  useEffect(() => { loadData() }, [loadData])
  return { field, isLoading, refresh: loadData }
}

export function useCustomFields(entityType?: string, workspaceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('custom_fields').select('*').eq('entity_type', entityType)
      if (workspaceId) query = query.eq('workspace_id', workspaceId)
      const { data: result } = await query.order('display_order', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, workspaceId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useCustomFieldValues(entityType?: string, entityId?: string) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('custom_field_values').select('field_id, value').eq('entity_type', entityType).eq('entity_id', entityId)
      const valuesMap = data?.reduce((acc, v) => ({ ...acc, [v.field_id]: v.value }), {}) || {}
      setValues(valuesMap)
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { values, isLoading, refresh: loadData }
}

export function useEntityWithCustomFields(entityType?: string, entityId?: string) {
  const [data, setData] = useState<{ fields: any[]; values: Record<string, any> }>({ fields: [], values: {} })
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [fieldsResult, valuesResult] = await Promise.all([
        supabase.from('custom_fields').select('*').eq('entity_type', entityType).order('display_order', { ascending: true }),
        supabase.from('custom_field_values').select('field_id, value').eq('entity_type', entityType).eq('entity_id', entityId)
      ])
      const valuesMap = valuesResult.data?.reduce((acc, v) => ({ ...acc, [v.field_id]: v.value }), {}) || {}
      setData({ fields: fieldsResult.data || [], values: valuesMap })
    } finally { setIsLoading(false) }
  }, [entityType, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { ...data, isLoading, refresh: loadData }
}
