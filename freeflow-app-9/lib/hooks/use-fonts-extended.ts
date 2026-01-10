'use client'

/**
 * Extended Fonts Hooks
 * Tables: fonts, font_families, font_uploads, font_licenses, user_fonts
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useFont(fontId?: string) {
  const [font, setFont] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!fontId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('fonts').select('*, font_families(*), font_licenses(*)').eq('id', fontId).single(); setFont(data) } finally { setIsLoading(false) }
  }, [fontId])
  useEffect(() => { fetch() }, [fetch])
  return { font, isLoading, refresh: fetch }
}

export function useFonts(options?: { family_id?: string; style?: string; is_active?: boolean; search?: string; limit?: number }) {
  const [fonts, setFonts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('fonts').select('*, font_families(*)')
      if (options?.family_id) query = query.eq('family_id', options.family_id)
      if (options?.style) query = query.eq('style', options.style)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 100)
      setFonts(data || [])
    } finally { setIsLoading(false) }
  }, [options?.family_id, options?.style, options?.is_active, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { fonts, isLoading, refresh: fetch }
}

export function useFontFamilies(options?: { category?: string; search?: string; limit?: number }) {
  const [families, setFamilies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('font_families').select('*, fonts(*)')
      if (options?.category) query = query.eq('category', options.category)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setFamilies(data || [])
    } finally { setIsLoading(false) }
  }, [options?.category, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { families, isLoading, refresh: fetch }
}

export function useFontFamily(familyId?: string) {
  const [family, setFamily] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!familyId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('font_families').select('*, fonts(*)').eq('id', familyId).single(); setFamily(data) } finally { setIsLoading(false) }
  }, [familyId])
  useEffect(() => { fetch() }, [fetch])
  return { family, isLoading, refresh: fetch }
}

export function useUserFonts(userId?: string) {
  const [fonts, setFonts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('user_fonts').select('*, fonts(*, font_families(*))').eq('user_id', userId).order('added_at', { ascending: false }); setFonts(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { fonts, isLoading, refresh: fetch }
}

export function useUserFontUploads(userId?: string, options?: { status?: string; limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('font_uploads').select('*').eq('user_id', userId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('uploaded_at', { ascending: false }).limit(options?.limit || 20)
      setUploads(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function usePopularFonts(limit?: number) {
  const [fonts, setFonts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('fonts').select('*, font_families(*)').eq('is_active', true).order('download_count', { ascending: false }).limit(limit || 20); setFonts(data || []) } finally { setIsLoading(false) }
  }, [limit])
  useEffect(() => { fetch() }, [fetch])
  return { fonts, isLoading, refresh: fetch }
}

export function useFontCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('font_families').select('category')
      const uniqueCategories = [...new Set(data?.map(f => f.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { categories, isLoading, refresh: fetch }
}

export function useHasUserFont(userId?: string, fontId?: string) {
  const [hasFont, setHasFont] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !fontId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('user_fonts').select('id').eq('user_id', userId).eq('font_id', fontId).single(); setHasFont(!!data) } finally { setIsLoading(false) }
  }, [userId, fontId, supabase])
  useEffect(() => { check() }, [check])
  return { hasFont, isLoading, recheck: check }
}
