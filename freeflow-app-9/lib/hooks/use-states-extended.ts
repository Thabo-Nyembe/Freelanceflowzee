'use client'

/**
 * Extended States Hooks
 * Tables: states, state_machines, state_transitions, state_history, state_rules, state_triggers
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useState_(stateId?: string) {
  const [state, setState] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!stateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('states').select('*, state_machines(*), state_transitions(*), state_rules(*)').eq('id', stateId).single(); setState(data) } finally { setIsLoading(false) }
  }, [stateId])
  useEffect(() => { loadData() }, [loadData])
  return { state, isLoading, refresh: loadData }
}

export function useStates(options?: { machine_id?: string; state_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [states, setStates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('states').select('*, state_machines(*)')
      if (options?.machine_id) query = query.eq('machine_id', options.machine_id)
      if (options?.state_type) query = query.eq('state_type', options.state_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setStates(data || [])
    } finally { setIsLoading(false) }
  }, [options?.machine_id, options?.state_type, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { states, isLoading, refresh: loadData }
}

export function useStateMachines(options?: { entity_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [machines, setMachines] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('state_machines').select('*, states(count)')
      if (options?.entity_type) query = query.eq('entity_type', options.entity_type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setMachines(data || [])
    } finally { setIsLoading(false) }
  }, [options?.entity_type, options?.is_active, options?.search, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { machines, isLoading, refresh: loadData }
}

export function useStateMachine(machineId?: string) {
  const [machine, setMachine] = useState<any>(null)
  const [states, setStates] = useState<any[]>([])
  const [transitions, setTransitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!machineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [machineRes, statesRes] = await Promise.all([
        supabase.from('state_machines').select('*').eq('id', machineId).single(),
        supabase.from('states').select('*').eq('machine_id', machineId).order('name', { ascending: true })
      ])
      setMachine(machineRes.data)
      setStates(statesRes.data || [])
      if (statesRes.data && statesRes.data.length > 0) {
        const stateIds = statesRes.data.map(s => s.id)
        const { data: transData } = await supabase.from('state_transitions').select('*, from_state:from_state_id(*), to_state:to_state_id(*)').in('from_state_id', stateIds)
        setTransitions(transData || [])
      }
    } finally { setIsLoading(false) }
  }, [machineId])
  useEffect(() => { loadData() }, [loadData])
  return { machine, states, transitions, isLoading, refresh: loadData }
}

export function useCurrentState(entityType?: string, entityId?: string, machineId?: string) {
  const [currentState, setCurrentState] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId || !machineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('state_history').select('*, states(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('machine_id', machineId).order('transitioned_at', { ascending: false }).limit(1).single()
      setCurrentState(data?.states || null)
    } finally { setIsLoading(false) }
  }, [entityType, entityId, machineId])
  useEffect(() => { loadData() }, [loadData])
  return { currentState, isLoading, refresh: loadData }
}

export function useStateHistory(entityType?: string, entityId?: string, machineId?: string, options?: { limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('state_history').select('*, states(*), from_state:from_state_id(*), users(*)').eq('entity_type', entityType).eq('entity_id', entityId)
      if (machineId) query = query.eq('machine_id', machineId)
      const { data } = await query.order('transitioned_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, machineId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useAvailableTransitions(entityType?: string, entityId?: string, machineId?: string) {
  const [transitions, setTransitions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !entityId || !machineId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: currentHistory } = await supabase.from('state_history').select('state_id').eq('entity_type', entityType).eq('entity_id', entityId).eq('machine_id', machineId).order('transitioned_at', { ascending: false }).limit(1).single()
      if (!currentHistory) { setTransitions([]); return }
      const { data } = await supabase.from('state_transitions').select('*, to_state:to_state_id(*)').eq('from_state_id', currentHistory.state_id).eq('is_active', true)
      setTransitions(data || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, machineId])
  useEffect(() => { loadData() }, [loadData])
  return { transitions, isLoading, refresh: loadData }
}

export function useStateRules(stateId?: string) {
  const [rules, setRules] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!stateId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('state_rules').select('*').eq('state_id', stateId).order('name', { ascending: true }); setRules(data || []) } finally { setIsLoading(false) }
  }, [stateId])
  useEffect(() => { loadData() }, [loadData])
  return { rules, isLoading, refresh: loadData }
}

