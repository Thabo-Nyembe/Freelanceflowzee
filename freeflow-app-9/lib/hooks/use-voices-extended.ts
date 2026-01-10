'use client'

/**
 * Extended Voices Hooks
 * Tables: voices, voice_samples, voice_settings, voice_generations
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useVoice(voiceId?: string) {
  const [voice, setVoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!voiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('voices').select('*, voice_samples(*)').eq('id', voiceId).single(); setVoice(data) } finally { setIsLoading(false) }
  }, [voiceId])
  useEffect(() => { fetch() }, [fetch])
  return { voice, isLoading, refresh: fetch }
}

export function useVoices(options?: { user_id?: string; type?: string; language?: string; status?: string; limit?: number }) {
  const [voices, setVoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('voices').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.language) query = query.eq('language', options.language)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setVoices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.language, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { voices, isLoading, refresh: fetch }
}

export function useVoiceSamples(voiceId?: string) {
  const [samples, setSamples] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!voiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('voice_samples').select('*').eq('voice_id', voiceId).order('created_at', { ascending: false }); setSamples(data || []) } finally { setIsLoading(false) }
  }, [voiceId])
  useEffect(() => { fetch() }, [fetch])
  return { samples, isLoading, refresh: fetch }
}

export function useVoiceSettings(voiceId?: string) {
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!voiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('voice_settings').select('*').eq('voice_id', voiceId).single(); setSettings(data) } finally { setIsLoading(false) }
  }, [voiceId])
  useEffect(() => { fetch() }, [fetch])
  return { settings, isLoading, refresh: fetch }
}

export function useVoiceGenerations(options?: { voice_id?: string; user_id?: string; limit?: number }) {
  const [generations, setGenerations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('voice_generations').select('*')
      if (options?.voice_id) query = query.eq('voice_id', options.voice_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setGenerations(data || [])
    } finally { setIsLoading(false) }
  }, [options?.voice_id, options?.user_id, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { generations, isLoading, refresh: fetch }
}
