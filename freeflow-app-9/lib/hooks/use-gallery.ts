'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export interface GalleryItem {
  id: string
  user_id: string
  title: string
  description: string | null
  file_url: string
  thumbnail_url: string | null
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other'
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  category: string | null
  collection_id: string | null
  project_id: string | null
  client_id: string | null
  is_public: boolean
  is_featured: boolean
  is_portfolio: boolean
  tags: string[]
  metadata: Record<string, any>
  view_count: number
  like_count: number
  download_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface GalleryCollection {
  id: string
  user_id: string
  name: string
  description: string | null
  cover_image: string | null
  is_public: boolean
  is_featured: boolean
  item_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export function useGalleryItems(collectionId?: string | null, initialItems: GalleryItem[] = []) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    setIsLoading(true)
    try {
      let query = supabase
        .from('gallery_items')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (collectionId) {
        query = query.eq('collection_id', collectionId)
      }

      const { data, error } = await query

      if (error) throw error
      setItems(data || [])
    } catch (err: unknown) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, collectionId])

  const createItem = async (item: Partial<GalleryItem>) => {
    const { data, error } = await supabase
      .from('gallery_items')
      .insert([item])
      .select()
      .single()

    if (error) throw error
    setItems(prev => [data, ...prev])
    return data
  }

  const updateItem = async (id: string, updates: Partial<GalleryItem>) => {
    const { data, error } = await supabase
      .from('gallery_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setItems(prev => prev.map(i => i.id === id ? data : i))
    return data
  }

  const toggleFeatured = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      return updateItem(id, { is_featured: !item.is_featured })
    }
  }

  const togglePortfolio = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (item) {
      return updateItem(id, { is_portfolio: !item.is_portfolio })
    }
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id)

    if (error) throw error
    setItems(prev => prev.filter(i => i.id !== id))
  }

  useEffect(() => {
    if (isDemoModeEnabled()) return
    const channel = supabase
      .channel('gallery_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' },
        () => fetchItems()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, fetchItems])

  const stats = {
    total: items.length,
    images: items.filter(i => i.file_type === 'image').length,
    videos: items.filter(i => i.file_type === 'video').length,
    featured: items.filter(i => i.is_featured).length,
    portfolio: items.filter(i => i.is_portfolio).length,
    totalViews: items.reduce((sum, i) => sum + (i.view_count || 0), 0)
  }

  return {
    items,
    stats,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    toggleFeatured,
    togglePortfolio,
    deleteItem
  }
}

export function useGalleryCollections(initialCollections: GalleryCollection[] = []) {
  const [collections, setCollections] = useState<GalleryCollection[]>(initialCollections)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const fetchCollections = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
    setIsLoading(true)
    const { data, error } = await supabase
      .from('gallery_collections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!error) setCollections(data || [])
    setIsLoading(false)
  }, [supabase])

  const createCollection = async (collection: Partial<GalleryCollection>) => {
    const { data, error } = await supabase
      .from('gallery_collections')
      .insert([collection])
      .select()
      .single()

    if (error) throw error
    setCollections(prev => [...prev, data])
    return data
  }

  const updateCollection = async (id: string, updates: Partial<GalleryCollection>) => {
    const { data, error } = await supabase
      .from('gallery_collections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setCollections(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const deleteCollection = async (id: string) => {
    const { error } = await supabase
      .from('gallery_collections')
      .delete()
      .eq('id', id)

    if (error) throw error
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  return {
    collections,
    isLoading,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection
  }
}
