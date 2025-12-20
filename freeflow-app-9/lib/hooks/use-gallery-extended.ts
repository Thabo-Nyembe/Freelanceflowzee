'use client'

/**
 * Extended Gallery Hooks - Covers all 15 Gallery-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGalleryAIMetadata(imageId?: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!imageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_ai_metadata').select('*').eq('image_id', imageId).single(); setData(result) } finally { setIsLoading(false) }
  }, [imageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryAlbums(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_albums').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryClientLinks(galleryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!galleryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_client_links').select('*').eq('gallery_id', galleryId); setData(result || []) } finally { setIsLoading(false) }
  }, [galleryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryCollectionImages(collectionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!collectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_collection_images').select('*').eq('collection_id', collectionId).order('order', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [collectionId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryComments(imageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!imageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_comments').select('*').eq('image_id', imageId).order('created_at', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [imageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryDownloads(galleryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!galleryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_downloads').select('*').eq('gallery_id', galleryId).order('downloaded_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [galleryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryEdits(imageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!imageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_edits').select('*').eq('image_id', imageId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [imageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryFavorites(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryImageTags(imageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!imageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_image_tags').select('*').eq('image_id', imageId); setData(result || []) } finally { setIsLoading(false) }
  }, [imageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryImages(galleryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!galleryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_images').select('*').eq('gallery_id', galleryId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [galleryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryLikes(imageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!imageId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_likes').select('*').eq('image_id', imageId); setData(result || []) } finally { setIsLoading(false) }
  }, [imageId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryProofingSelections(galleryId?: string, clientId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!galleryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('gallery_proofing_selections').select('*').eq('gallery_id', galleryId)
      if (clientId) query = query.eq('client_id', clientId)
      const { data: result } = await query.order('selected_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [galleryId, clientId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryShares(galleryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!galleryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_shares').select('*').eq('gallery_id', galleryId); setData(result || []) } finally { setIsLoading(false) }
  }, [galleryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryTags(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_tags').select('*').eq('user_id', userId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useGalleryViews(galleryId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!galleryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('gallery_views').select('*').eq('gallery_id', galleryId).order('viewed_at', { ascending: false }).limit(100); setData(result || []) } finally { setIsLoading(false) }
  }, [galleryId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
