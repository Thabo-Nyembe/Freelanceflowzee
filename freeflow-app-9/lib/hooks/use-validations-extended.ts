'use client'

/**
 * Extended Validations Hooks
 * Tables: validations, validation_rules, validation_results, validation_schemas, validation_logs, validation_configs
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useValidation(validationId?: string) {
  const [validation, setValidation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('validations').select('*, validation_rules(*), validation_results(count)').eq('id', validationId).single(); setValidation(data) } finally { setIsLoading(false) }
  }, [validationId])
  useEffect(() => { loadData() }, [loadData])
  return { validation, isLoading, refresh: loadData }
}

export function useValidations(options?: { entity_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [validations, setValidations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('validations').select('*, validation_rules(count)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setValidations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { validations, isLoading, refresh: loadData }
}

export function useValidationRules(validationId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('validation_rules').select('*').eq('validation_id', validationId).eq('is_active', true).order('order_index', { ascending: true }); setRules(data || []) } finally { setIsLoading(false) }
  }, [validationId])
  useEffect(() => { loadData() }, [loadData])
  return { rules, isLoading, refresh: loadData }
}

export function useValidationResults(validationId?: string, options?: { is_valid?: boolean; entity_id?: string; limit?: number }) {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('validation_results').select('*').eq('validation_id', validationId)
      if (options?.is_valid !== undefined) query = query.eq('is_valid', options.is_valid)
      if (options?.entity_id) query = query.eq('entity_id', options.entity_id)
      const { data } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 50)
      setResults(data || [])
    } finally { setIsLoading(false) }
  }, [validationId, options?.is_valid, options?.entity_id, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { results, isLoading, refresh: loadData }
}

export function useValidationSchemas(options?: { is_active?: boolean; search?: string }) {
  const [schemas, setSchemas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('validation_schemas').select('*')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true })
      setSchemas(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.search])
  useEffect(() => { loadData() }, [loadData])
  return { schemas, isLoading, refresh: loadData }
}

export function useValidationLogs(validationId?: string, options?: { status?: string; limit?: number }) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('validation_logs').select('*, users(*)').eq('validation_id', validationId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50)
      setLogs(data || [])
    } finally { setIsLoading(false) }
  }, [validationId, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { logs, isLoading, refresh: loadData }
}

export function useValidationConfig(entityType?: string) {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('validation_configs').select('*').eq('entity_type', entityType).single(); setConfig(data) } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { config, isLoading, refresh: loadData }
}

export function useValidationStats(validationId?: string, options?: { from_date?: string; to_date?: string }) {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('validation_results').select('is_valid').eq('validation_id', validationId)
      if (options?.from_date) query = query.gte('executed_at', options.from_date)
      if (options?.to_date) query = query.lte('executed_at', options.to_date)
      const { data } = await query
      const results = data || []
      setStats({
        total: results.length,
        passed: results.filter(r => r.is_valid).length,
        failed: results.filter(r => !r.is_valid).length,
        pass_rate: results.length > 0 ? Math.round((results.filter(r => r.is_valid).length / results.length) * 100) : 0
      })
    } finally { setIsLoading(false) }
  }, [validationId, options?.from_date, options?.to_date])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

export function useEntityValidations(entityType?: string, options?: { is_active?: boolean }) {
  const [validations, setValidations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('validations').select('*, validation_rules(*)').eq('entity_type', entityType)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setValidations(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { validations, isLoading, refresh: loadData }
}

export function useEntityTypes() {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('validations').select('entity_type').not('entity_type', 'is', null)
      const unique = [...new Set(data?.map(v => v.entity_type).filter(Boolean))]
      setTypes(unique)
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { types, isLoading, refresh: loadData }
}

export function useRuleTypes() {
  const ruleTypes = [
    { type: 'required', label: 'Required', description: 'Field must have a value' },
    { type: 'min_length', label: 'Minimum Length', description: 'Minimum character length' },
    { type: 'max_length', label: 'Maximum Length', description: 'Maximum character length' },
    { type: 'min_value', label: 'Minimum Value', description: 'Minimum numeric value' },
    { type: 'max_value', label: 'Maximum Value', description: 'Maximum numeric value' },
    { type: 'pattern', label: 'Pattern', description: 'Regular expression pattern' },
    { type: 'email', label: 'Email', description: 'Valid email format' },
    { type: 'url', label: 'URL', description: 'Valid URL format' },
    { type: 'in_list', label: 'In List', description: 'Value must be in allowed list' },
    { type: 'type', label: 'Type', description: 'Value must be of specified type' }
  ]
  return { ruleTypes }
}

export function useLatestValidationResult(validationId?: string, entityId?: string) {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('validation_results').select('*').eq('validation_id', validationId)
      if (entityId) query = query.eq('entity_id', entityId)
      const { data } = await query.order('executed_at', { ascending: false }).limit(1).single()
      setResult(data)
    } finally { setIsLoading(false) }
  }, [validationId, entityId])
  useEffect(() => { loadData() }, [loadData])
  return { result, isLoading, refresh: loadData }
}
