'use client'

/**
 * Extended Wasabi Hooks
 * Tables: wasabi_buckets, wasabi_objects, wasabi_uploads, wasabi_access_keys
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWasabiBucket(bucketId?: string) {
  const [bucket, setBucket] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!bucketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('wasabi_buckets').select('*').eq('id', bucketId).single(); setBucket(data) } finally { setIsLoading(false) }
  }, [bucketId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { bucket, isLoading, refresh: fetch }
}

export function useWasabiBuckets(options?: { user_id?: string; is_public?: boolean; status?: string; limit?: number }) {
  const [buckets, setBuckets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('wasabi_buckets').select('*')
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('name', { ascending: true }).limit(options?.limit || 50)
      setBuckets(data || [])
    } finally { setIsLoading(false) }
  }, [options?.user_id, options?.is_public, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { buckets, isLoading, refresh: fetch }
}

export function useWasabiObjects(bucketId?: string, options?: { prefix?: string; limit?: number }) {
  const [objects, setObjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!bucketId) { setIsLoading(false); return }
    setIsLoading(true)
    try { let query = supabase.from('wasabi_objects').select('*').eq('bucket_id', bucketId); if (options?.prefix) query = query.like('key', `${options.prefix}%`); const { data } = await query.order('key', { ascending: true }).limit(options?.limit || 100); setObjects(data || []) } finally { setIsLoading(false) }
  }, [bucketId, options?.prefix, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { objects, isLoading, refresh: fetch }
}

export function useWasabiUploads(options?: { bucket_id?: string; user_id?: string; status?: string; limit?: number }) {
  const [uploads, setUploads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('wasabi_uploads').select('*')
      if (options?.bucket_id) query = query.eq('bucket_id', options.bucket_id)
      if (options?.user_id) query = query.eq('user_id', options.user_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setUploads(data || [])
    } finally { setIsLoading(false) }
  }, [options?.bucket_id, options?.user_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { uploads, isLoading, refresh: fetch }
}

export function useWasabiAccessKeys(userId?: string) {
  const [accessKeys, setAccessKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('wasabi_access_keys').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setAccessKeys(data || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { accessKeys, isLoading, refresh: fetch }
}
