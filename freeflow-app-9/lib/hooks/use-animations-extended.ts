'use client'

/**
 * Extended Animations Hooks
 * Tables: animations, animation_presets, animation_keyframes
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAnimation(animationId?: string) {
  const [animation, setAnimation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!animationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('animations').select('*, animation_keyframes(*)').eq('id', animationId).single(); setAnimation(data) } finally { setIsLoading(false) }
  }, [animationId])
  useEffect(() => { fetch() }, [fetch])
  return { animation, isLoading, refresh: fetch }
}

export function useAnimations(options?: { user_id?: string; type?: string; is_public?: boolean; search?: string; limit?: number }) {
  const [animations, setAnimations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('animations').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAnimations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.is_public, options?.search, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { animations, isLoading, refresh: fetch }
}

export function useAnimationPresets(options?: { type?: string; limit?: number }) {
  const [presets, setPresets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('animation_presets').select('*')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setPresets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { presets, isLoading, refresh: fetch }
}

export function usePublicAnimations(options?: { type?: string; limit?: number }) {
  const [animations, setAnimations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('animations').select('*').eq('is_public', true)
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setAnimations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { animations, isLoading, refresh: fetch }
}

export function useAnimationTypes() {
  const [types, setTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try { const { data } = await supabase.from('animations').select('type'); const unique = [...new Set((data || []).map(a => a.type).filter(Boolean))]; setTypes(unique) } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { types, isLoading, refresh: fetch }
}
