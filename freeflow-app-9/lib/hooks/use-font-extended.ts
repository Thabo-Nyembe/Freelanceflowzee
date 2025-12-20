'use client'

/**
 * Extended Font Hooks
 * Tables: fonts, font_families, font_usage, font_licenses
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFont(fontId?: string) {
  const [font, setFont] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fontId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('fonts').select('*').eq('id', fontId).single(); setFont(data) } finally { setIsLoading(false) }
  }, [fontId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { font, isLoading, refresh: fetch }
}

export function useFonts(options?: { family_id?: string; style?: string; is_active?: boolean; limit?: number }) {
  const [fonts, setFonts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('fonts').select('*')
      if (options?.family_id) query = query.eq('family_id', options.family_id)
      if (options?.style) query = query.eq('style', options.style)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setFonts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.family_id, options?.style, options?.is_active, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { fonts, isLoading, refresh: fetch }
}

export function useFontFamilies(options?: { category?: string; limit?: number }) {
  const [families, setFamilies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('font_families').select('*, fonts(*)')
      if (options?.category) query = query.eq('category', options.category)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setFamilies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { families, isLoading, refresh: fetch }
}

export function useFontUsage(fontId?: string) {
  const [usage, setUsage] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!fontId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('font_usage').select('*').eq('font_id', fontId).order('used_at', { ascending: false }); setUsage(data || []) } finally { setIsLoading(false) }
  }, [fontId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { usage, isLoading, refresh: fetch }
}

export function useActiveFonts(options?: { limit?: number }) {
  const [fonts, setFonts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try { const { data } = await supabase.from('fonts').select('*, font_families(name)').eq('is_active', true).order('name', { ascending: true }).limit(options?.limit || 100); setFonts(data || []) } finally { setIsLoading(false) }
  }, [options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { fonts, isLoading, refresh: fetch }
}
