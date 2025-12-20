'use client'

/**
 * Extended Customization Hooks
 * Tables: customizations, customization_options, customization_presets, user_customizations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCustomization(customizationId?: string) {
  const [customization, setCustomization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('customizations').select('*, customization_options(*)').eq('id', customizationId).single(); setCustomization(data) } finally { setIsLoading(false) }
  }, [customizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customization, isLoading, refresh: fetch }
}

export function useCustomizations(options?: { type?: string; is_global?: boolean; is_active?: boolean }) {
  const [customizations, setCustomizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('customizations').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_global !== undefined) query = query.eq('is_global', options.is_global)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setCustomizations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_global, options?.is_active, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customizations, isLoading, refresh: fetch }
}

export function useCustomizationPresets(options?: { type?: string; is_default?: boolean }) {
  const [presets, setPresets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('customization_presets').select('*')
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default)
      const { data } = await query.order('name', { ascending: true })
      setPresets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.is_default, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { presets, isLoading, refresh: fetch }
}

export function useUserCustomizations(userId?: string) {
  const [customizations, setCustomizations] = useState<any[]>([])
  const [valuesMap, setValuesMap] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('user_customizations').select('*, customizations(*)').eq('user_id', userId)
      setCustomizations(data || [])
      const map: Record<string, any> = {}
      data?.forEach(c => { if (c.customization_id) map[c.customization_id] = c.value })
      setValuesMap(map)
    } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { customizations, valuesMap, isLoading, refresh: fetch }
}

export function useCustomizationValue(userId?: string, customizationId?: string) {
  const [value, setValue] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId || !customizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: userValue } = await supabase.from('user_customizations').select('value').eq('user_id', userId).eq('customization_id', customizationId).single()
      if (userValue) { setValue(userValue.value); return }
      const { data: defaultValue } = await supabase.from('customizations').select('default_value').eq('id', customizationId).single()
      setValue(defaultValue?.default_value || null)
    } finally { setIsLoading(false) }
  }, [userId, customizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { value, isLoading, refresh: fetch }
}

export function useCustomizationOptions(customizationId?: string) {
  const [options, setOptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!customizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('customization_options').select('*').eq('customization_id', customizationId).order('order', { ascending: true }); setOptions(data || []) } finally { setIsLoading(false) }
  }, [customizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { options, isLoading, refresh: fetch }
}

export function useCustomizationTypes() {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await supabase.from('customizations').select('type')
      const uniqueTypes = [...new Set(data?.map(c => c.type).filter(Boolean))]
      setTypes(uniqueTypes as string[])
    } finally { setIsLoading(false) }
  }, [supabase])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}

export function useDefaultPreset(type?: string) {
  const [preset, setPreset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!type) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('customization_presets').select('*').eq('type', type).eq('is_default', true).single(); setPreset(data) } finally { setIsLoading(false) }
  }, [type, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { preset, isLoading, refresh: fetch }
}
