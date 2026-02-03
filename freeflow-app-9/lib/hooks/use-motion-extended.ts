'use client'

/**
 * Extended Motion Hooks
 * Tables: motions, motion_frames, motion_animations, motion_presets
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMotion(motionId?: string) {
  const [motion, setMotion] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!motionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('motions').select('*').eq('id', motionId).single(); setMotion(data) } finally { setIsLoading(false) }
  }, [motionId])
  useEffect(() => { loadData() }, [loadData])
  return { motion, isLoading, refresh: loadData }
}

export function useMotions(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  const [motions, setMotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('motions').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('updated_at', { ascending: false }).limit(options?.limit || 50)
      setMotions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.type, options?.status, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { motions, isLoading, refresh: loadData }
}

export function useMotionFrames(motionId?: string) {
  const [frames, setFrames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!motionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('motion_frames').select('*').eq('motion_id', motionId).order('frame_number', { ascending: true }); setFrames(data || []) } finally { setIsLoading(false) }
  }, [motionId])
  useEffect(() => { loadData() }, [loadData])
  return { frames, isLoading, refresh: loadData }
}

export function useMotionPresets(options?: { type?: string }) {
  const [presets, setPresets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('motion_presets').select('*')
      if (options?.type) query = query.eq('type', options.type)
      const { data } = await query.order('name', { ascending: true })
      setPresets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.type])
  useEffect(() => { loadData() }, [loadData])
  return { presets, isLoading, refresh: loadData }
}

export function useMyMotions(userId?: string, options?: { limit?: number }) {
  const [motions, setMotions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('motions').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(options?.limit || 50); setMotions(data || []) } finally { setIsLoading(false) }
  }, [userId, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { motions, isLoading, refresh: loadData }
}
