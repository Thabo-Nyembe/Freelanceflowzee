'use client'

/**
 * Extended Rule Hooks - Covers all Rule-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRule(ruleId?: string) {
  const [rule, setRule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ruleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('rules').select('*').eq('id', ruleId).single()
      setRule(data)
    } finally { setIsLoading(false) }
  }, [ruleId])
  useEffect(() => { loadData() }, [loadData])
  return { rule, isLoading, refresh: loadData }
}

export function useRules(options?: { ruleType?: string; entityType?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rules').select('*')
      if (options?.ruleType) query = query.eq('rule_type', options.ruleType)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('priority', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.ruleType, options?.entityType, options?.isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useRuleExecutions(ruleId?: string, limit = 20) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!ruleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('rule_executions').select('*').eq('rule_id', ruleId).order('executed_at', { ascending: false }).limit(limit)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [ruleId, limit])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useActiveRules(entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('rules').select('*').eq('is_active', true)
      if (entityType) query = query.eq('entity_type', entityType)
      const { data: result } = await query.order('priority', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
