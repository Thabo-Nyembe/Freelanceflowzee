'use client'

/**
 * Extended Units Hooks
 * Tables: units, unit_conversions, unit_groups, unit_aliases, unit_formats, unit_preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnit(unitId?: string) {
  const [unit, setUnit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!unitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('units').select('*, unit_groups(*), unit_conversions(*), unit_aliases(*)').eq('id', unitId).single(); setUnit(data) } finally { setIsLoading(false) }
  }, [unitId])
  useEffect(() => { fetch() }, [fetch])
  return { unit, isLoading, refresh: fetch }
}

export function useUnitBySymbol(symbol?: string) {
  const [unit, setUnit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!symbol) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('units').select('*, unit_groups(*)').eq('symbol', symbol).single()
      if (data) { setUnit(data); return }
      const { data: aliasData } = await supabase.from('unit_aliases').select('units(*, unit_groups(*))').eq('alias', symbol).single()
      setUnit(aliasData?.units || null)
    } finally { setIsLoading(false) }
  }, [symbol])
  useEffect(() => { fetch() }, [fetch])
  return { unit, isLoading, refresh: fetch }
}

export function useUnits(options?: { group_id?: string; is_si?: boolean; is_active?: boolean; search?: string; limit?: number }) {
  const [units, setUnits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('units').select('*, unit_groups(*)')
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      if (options?.is_si !== undefined) query = query.eq('is_si', options.is_si)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.or(`name.ilike.%${options.search}%,symbol.ilike.%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setUnits(data || [])
    } finally { setIsLoading(false) }
  }, [options?.group_id, options?.is_si, options?.is_active, options?.search, options?.limit])
  useEffect(() => { fetch() }, [fetch])
  return { units, isLoading, refresh: fetch }
}

export function useUnitGroups(options?: { is_active?: boolean; search?: string }) {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('unit_groups').select('*, units(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true })
      setGroups(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active, options?.search])
  useEffect(() => { fetch() }, [fetch])
  return { groups, isLoading, refresh: fetch }
}

export function useUnitConversions(unitId?: string) {
  const [conversions, setConversions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!unitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('unit_conversions').select('*, from_unit:units!from_unit_id(*), to_unit:units!to_unit_id(*)').or(`from_unit_id.eq.${unitId},to_unit_id.eq.${unitId}`); setConversions(data || []) } finally { setIsLoading(false) }
  }, [unitId])
  useEffect(() => { fetch() }, [fetch])
  return { conversions, isLoading, refresh: fetch }
}

export function useUnitAliases(unitId?: string) {
  const [aliases, setAliases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!unitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('unit_aliases').select('*').eq('unit_id', unitId).order('alias', { ascending: true }); setAliases(data || []) } finally { setIsLoading(false) }
  }, [unitId])
  useEffect(() => { fetch() }, [fetch])
  return { aliases, isLoading, refresh: fetch }
}

export function useUnitFormat(unitId?: string, locale?: string) {
  const [format, setFormat] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!unitId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('unit_formats').select('*').eq('unit_id', unitId).eq('locale', locale || 'default').single(); setFormat(data) } finally { setIsLoading(false) }
  }, [unitId, locale])
  useEffect(() => { fetch() }, [fetch])
  return { format, isLoading, refresh: fetch }
}

export function useUnitPreferences(userId?: string) {
  const [preferences, setPreferences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('unit_preferences').select('*, unit_groups(*), units(*)').eq('user_id', userId); setPreferences(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { preferences, isLoading, refresh: fetch }
}

export function usePreferredUnit(userId?: string, groupId?: string) {
  const [unit, setUnit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !groupId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: pref } = await supabase.from('unit_preferences').select('units(*)').eq('user_id', userId).eq('group_id', groupId).single()
      if (pref?.units) { setUnit(pref.units); return }
      const { data: baseUnit } = await supabase.from('units').select('*').eq('group_id', groupId).eq('base_unit', true).single()
      setUnit(baseUnit || null)
    } finally { setIsLoading(false) }
  }, [userId, groupId])
  useEffect(() => { fetch() }, [fetch])
  return { unit, isLoading, refresh: fetch }
}

export function useUnitConversion(value: number, fromUnitId?: string, toUnitId?: string) {
  const [result, setResult] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const convert = useCallback(async () => {
    if (!fromUnitId || !toUnitId) { setIsLoading(false); return }
    if (fromUnitId === toUnitId) { setResult(value); setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: conversion } = await supabase.from('unit_conversions').select('*').eq('from_unit_id', fromUnitId).eq('to_unit_id', toUnitId).single()
      if (conversion) { setResult((value * conversion.factor) + (conversion.offset || 0)); return }
      const { data: reverseConversion } = await supabase.from('unit_conversions').select('*').eq('from_unit_id', toUnitId).eq('to_unit_id', fromUnitId).single()
      if (reverseConversion && reverseConversion.is_bidirectional) { setResult((value - (reverseConversion.offset || 0)) / reverseConversion.factor); return }
      const [fromUnit, toUnit] = await Promise.all([
        supabase.from('units').select('conversion_factor, group_id').eq('id', fromUnitId).single(),
        supabase.from('units').select('conversion_factor, group_id').eq('id', toUnitId).single()
      ])
      if (fromUnit.data && toUnit.data && fromUnit.data.group_id === toUnit.data.group_id) {
        const baseValue = value * fromUnit.data.conversion_factor
        setResult(baseValue / toUnit.data.conversion_factor)
      } else {
        setResult(null)
      }
    } finally { setIsLoading(false) }
  }, [value, fromUnitId, toUnitId])
  useEffect(() => { convert() }, [convert])
  return { result, isLoading, refresh: convert }
}

export function useBaseUnits(options?: { is_active?: boolean }) {
  const [units, setUnits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('units').select('*, unit_groups(*)').eq('base_unit', true)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setUnits(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { fetch() }, [fetch])
  return { units, isLoading, refresh: fetch }
}

export function useSIUnits(options?: { group_id?: string }) {
  const [units, setUnits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('units').select('*, unit_groups(*)').eq('is_si', true).eq('is_active', true)
      if (options?.group_id) query = query.eq('group_id', options.group_id)
      const { data } = await query.order('name', { ascending: true })
      setUnits(data || [])
    } finally { setIsLoading(false) }
  }, [options?.group_id])
  useEffect(() => { fetch() }, [fetch])
  return { units, isLoading, refresh: fetch }
}
