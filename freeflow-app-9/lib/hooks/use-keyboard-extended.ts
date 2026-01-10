'use client'

/**
 * Extended Keyboard Hooks
 * Tables: keyboard_shortcuts, keyboard_layouts, keyboard_bindings, keyboard_profiles, keyboard_macros
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useKeyboardShortcut(shortcutId?: string) {
  const [shortcut, setShortcut] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!shortcutId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('keyboard_shortcuts').select('*').eq('id', shortcutId).single(); setShortcut(data) } finally { setIsLoading(false) }
  }, [shortcutId])
  useEffect(() => { fetch() }, [fetch])
  return { shortcut, isLoading, refresh: fetch }
}

export function useUserShortcuts(userId?: string, options?: { context?: string; is_enabled?: boolean }) {
  const [shortcuts, setShortcuts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('keyboard_shortcuts').select('*').eq('user_id', userId)
      if (options?.context) query = query.eq('context', options.context)
      if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled)
      const { data } = await query.order('key_combination', { ascending: true })
      setShortcuts(data || [])
    } finally { setIsLoading(false) }
  }, [userId, options?.context, options?.is_enabled, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { shortcuts, isLoading, refresh: fetch }
}

export function useKeyboardLayouts() {
  const [layouts, setLayouts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('keyboard_layouts').select('*').order('name', { ascending: true }); setLayouts(data || []) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { layouts, isLoading, refresh: fetch }
}

export function useKeyboardProfile(userId?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('keyboard_profiles').select('*, keyboard_layouts(*)').eq('user_id', userId).single(); setProfile(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { profile, isLoading, refresh: fetch }
}

export function useKeyboardMacros(userId?: string) {
  const [macros, setMacros] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('keyboard_macros').select('*').eq('user_id', userId).order('name', { ascending: true }); setMacros(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { macros, isLoading, refresh: fetch }
}

export function useDefaultShortcuts(context?: string) {
  const [shortcuts, setShortcuts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('keyboard_shortcuts').select('*').eq('is_global', true)
      if (context) query = query.eq('context', context)
      const { data } = await query.order('key_combination', { ascending: true })
      setShortcuts(data || [])
    } finally { setIsLoading(false) }
  }, [context])
  useEffect(() => { fetch() }, [fetch])
  return { shortcuts, isLoading, refresh: fetch }
}

export function useKeyboardBindings(profileId?: string) {
  const [bindings, setBindings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!profileId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('keyboard_bindings').select('*').eq('profile_id', profileId).order('key', { ascending: true }); setBindings(data || []) } finally { setIsLoading(false) }
  }, [profileId])
  useEffect(() => { fetch() }, [fetch])
  return { bindings, isLoading, refresh: fetch }
}
