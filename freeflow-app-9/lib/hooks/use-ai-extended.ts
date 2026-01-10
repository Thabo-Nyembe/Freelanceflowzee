'use client'

/**
 * Extended AI Hooks - Covers all 69 AI-related tables
 * Auto-generated for comprehensive table coverage
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ============================================
// AI ANALYSIS & ANALYTICS
// ============================================

export function useAIAnalysis(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, error: err } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refresh: fetch }
}

export function useAIAnalytics(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, error: err } = await supabase
        .from('ai_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refresh: fetch }
}

// ============================================
// AI API KEYS
// ============================================

export function useAIApiKeys(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, error: err } = await supabase
        .from('ai_api_keys')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (input: any) => {
    try {
      const { data: result, error: err } = await supabase
        .from('ai_api_keys')
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      if (err) throw err
      setData(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
      return null
    }
  }, [userId])

  const remove = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('ai_api_keys')
        .delete()
        .eq('id', id)
      if (err) throw err
      setData(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }, [])

  return { data, isLoading, error, create, remove, refresh: fetch }
}

// ============================================
// AI ASSETS
// ============================================

export function useAIAssetCollections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, error: err } = await supabase
        .from('ai_asset_collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const create = useCallback(async (input: any) => {
    try {
      const { data: result, error: err } = await supabase
        .from('ai_asset_collections')
        .insert({ ...input, user_id: userId })
        .select()
        .single()
      if (err) throw err
      setData(prev => [result, ...prev])
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create')
      return null
    }
  }, [userId])

  return { data, isLoading, error, create, refresh: fetch }
}

export function useAIAssetDownloads(assetId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!assetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_asset_downloads')
        .select('*')
        .eq('asset_id', assetId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [assetId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIAssetLikes(assetId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!assetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_asset_likes')
        .select('*')
        .eq('asset_id', assetId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [assetId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIAssetVersions(assetId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!assetId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_asset_versions')
        .select('*')
        .eq('asset_id', assetId)
        .order('version', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [assetId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI BRAND
// ============================================

export function useAIBrandAssets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result, error: err } = await supabase
        .from('ai_brand_assets')
        .select('*')
        .eq('user_id', userId)
      if (err) throw err
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refresh: fetch }
}

export function useAIBrandGuidelines(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_brand_guidelines')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIBrandVoices(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_brand_voices')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI CHAT & CONVERSATIONS
// ============================================

export function useAIChatHistory(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIConversationBookmarks(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_conversation_bookmarks')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIConversationShares(conversationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!conversationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_conversation_shares')
        .select('*')
        .eq('conversation_id', conversationId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI CODE
// ============================================

export function useAICodeStats(userId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_code_stats')
        .select('*')
        .eq('user_id', userId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI COLLABORATION
// ============================================

export function useAICollaboration(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_collaboration')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI COLLECTIONS
// ============================================

export function useAICollectionAssets(collectionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!collectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_collection_assets')
        .select('*')
        .eq('collection_id', collectionId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [collectionId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICollectionImages(collectionId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!collectionId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_collection_images')
        .select('*')
        .eq('collection_id', collectionId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [collectionId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI COLOR PALETTES
// ============================================

export function useAIColorPalettes(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_color_palettes')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI CONFIGS
// ============================================

export function useAIConfigs(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_configs')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI CONTENT
// ============================================

export function useAIContentTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ai_content_templates').select('*')
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIContentVariations(contentId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!contentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_content_variations')
        .select('*')
        .eq('content_id', contentId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [contentId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI CREATE SYSTEM
// ============================================

export function useAICreateApiKeys(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_api_keys')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateAssets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateCollaborationSessions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_collaboration_sessions')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateCostTracking(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_cost_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateFavorites(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_favorites')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateFileUploads(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_file_uploads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateGenerationHistory(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_generation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateGenerations(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateModelUsage(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_model_usage')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreatePreferences(userId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_create_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAICreateTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ai_create_templates').select('*')
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI DESIGN
// ============================================

export function useAIDesignConcepts(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_design_concepts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIDesignProjects(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_design_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI EMAIL
// ============================================

export function useAIEmailSequences(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_email_sequences')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI ENHANCED TOOLS
// ============================================

export function useAIEnhancedTools() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_enhanced_tools')
        .select('*')
        .eq('is_active', true)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI FEATURES
// ============================================

export function useAIFeatureUsage(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_feature_usage')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIFeatures() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_features')
        .select('*')
        .eq('is_active', true)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI GENERATED CONTENT
// ============================================

export function useAIGeneratedAssets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_generated_assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIGeneratedContent(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_generated_content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIGeneratedCopy(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_generated_copy')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIGeneratedImages(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_generated_images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIGenerationHistory(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_generation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI IMAGE
// ============================================

export function useAIImageCollections(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_image_collections')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIImagePresets(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ai_image_presets').select('*')
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI INSIGHTS & RECOMMENDATIONS
// ============================================

export function useAIInsights(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIRecommendations(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI MESSAGES
// ============================================

export function useAIMessageAttachments(messageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_message_attachments')
        .select('*')
        .eq('message_id', messageId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [messageId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIMessageFeedback(messageId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!messageId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_message_feedback')
        .select('*')
        .eq('message_id', messageId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [messageId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI MODELS
// ============================================

export function useAIModelConfigs() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_model_configs')
        .select('*')
        .eq('is_active', true)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIModels() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI OPERATIONS
// ============================================

export function useAIOperations(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_operations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI PROJECT ANALYSES
// ============================================

export function useAIProjectAnalyses(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_project_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI PROMPTS
// ============================================

export function useAIPromptTemplates(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ai_prompt_templates').select('*')
      if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      const { data: result } = await query.order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI PROVIDERS
// ============================================

export function useAIProviders() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI QUICK ACTIONS
// ============================================

export function useAIQuickActions(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('ai_quick_actions').select('*')
      if (userId) query = query.or(`user_id.eq.${userId},is_global.eq.true`)
      const { data: result } = await query
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI SWIPE FILE
// ============================================

export function useAISwipeFile(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_swipe_file')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI TOOLS
// ============================================

export function useAIToolFavorites(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_tool_favorites')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIToolMetrics() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_tool_metrics')
        .select('*')
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIToolReviews(toolId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!toolId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_tool_reviews')
        .select('*')
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [toolId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIToolUsage(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_tool_usage')
        .select('*')
        .eq('user_id', userId)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAITools() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('is_active', true)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI USAGE
// ============================================

export function useAIUsageDaily(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_usage_daily')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIUsageLogs(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100)
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIUsageRecords(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_usage_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIUsageStats(userId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_usage_stats')
        .select('*')
        .eq('user_id', userId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI VOICE
// ============================================

export function useAIVoiceSettings(userId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_voice_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

// ============================================
// AI WORKFLOWS
// ============================================

export function useAIWorkflowSteps(workflowId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!workflowId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [workflowId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}

export function useAIWorkflows(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {

  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase
        .from('ai_workflows')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setData(result || [])
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, refresh: fetch }
}
