'use client'

/**
 * Extended Variables Hooks
 * Tables: variables, variable_values, variable_groups, variable_history
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVariable(variableId?: string) {
  const [variable, setVariable] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!variableId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('variables').select('*').eq('id', variableId).single(); setVariable(data) } finally { setIsLoading(false) }
  }, [variableId])
  useEffect(() => { fetch() }, [fetch])
  return { variable, isLoading, refresh: fetch }
}

export function useVariables(options?: { group_id?: string; type?: string; is_active?: boolean; limit?: number }) {
  const [variables, setVariables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('variables').select('*')
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setVariables(data || [])
    } finally { setIsLoading(false) }
  }, [options?.group_id, options?.type, options?.is_active, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { variables, isLoading, refresh: fetch }
}

export function useVariableGroups(options?: { limit?: number }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('variable_groups').select('*, variables(*)').order('name', { ascending: true }).limit(options?.limit || 50); setGroups(data || []) } finally { setIsLoading(false) }
  }, [options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useVariableHistory(variableId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!variableId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('variable_history').select('*').eq('variable_id', variableId).order('changed_at', { ascending: false }).limit(options?.limit || 50); setHistory(data || []) } finally { setIsLoading(false) }
  }, [variableId, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { history, isLoading, refresh: fetch }
}

export function useVariableValues(variableId?: string) {
  const [values, setValues] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!variableId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('variable_values').select('*').eq('variable_id', variableId).order('created_at', { ascending: false }); setValues(data || []) } finally { setIsLoading(false) }
  }, [variableId])
  useEffect(() => { fetch() }, [fetch])
  return { values, isLoading, refresh: fetch }
}

export function useActiveVariables(groupId?: string) {
  const [variables, setVariables] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('variables').select('*').eq('is_active', true)
      if (groupId) query = query.eq('group_id', groupId)
      const { data } = await query.order('name', { ascending: true })
      setVariables(data || [])
    } finally { setIsLoading(false) }
  }, [groupId])
  useEffect(() => { fetch() }, [fetch])
  return { variables, isLoading, refresh: fetch }
}
