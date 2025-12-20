'use server'

/**
 * Extended AI Server Actions - Covers all 69 AI-related tables
 * Auto-generated for comprehensive table coverage
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// AI ANALYSIS & ANALYTICS
// ============================================

export async function getAIAnalysis(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIAnalysis(userId: string, input: any) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_analysis')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIAnalytics(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_analytics')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI API KEYS
// ============================================

export async function getAIApiKeys(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_api_keys')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIApiKey(userId: string, input: { name: string; provider: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_api_keys')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function deleteAIApiKey(id: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI ASSETS
// ============================================

export async function getAIAssetCollections(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_asset_collections')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIAssetCollection(userId: string, input: { name: string; description?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_asset_collections')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIAssetDownloads(assetId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_asset_downloads')
      .select('*')
      .eq('asset_id', assetId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function recordAIAssetDownload(assetId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_asset_downloads')
      .insert({ asset_id: assetId, user_id: userId })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIAssetLikes(assetId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_asset_likes')
      .select('*')
      .eq('asset_id', assetId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function toggleAIAssetLike(assetId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('ai_asset_likes')
      .select('id')
      .eq('asset_id', assetId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase.from('ai_asset_likes').delete().eq('id', existing.id)
      return { success: true, liked: false }
    } else {
      await supabase.from('ai_asset_likes').insert({ asset_id: assetId, user_id: userId })
      return { success: true, liked: true }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIAssetVersions(assetId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_asset_versions')
      .select('*')
      .eq('asset_id', assetId)
      .order('version', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI BRAND
// ============================================

export async function getAIBrandAssets(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_brand_assets')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIBrandAsset(userId: string, input: any) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_brand_assets')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIBrandGuidelines(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_brand_guidelines')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIBrandVoices(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_brand_voices')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIBrandVoice(userId: string, input: { name: string; tone: string; style: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_brand_voices')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI CHAT & CONVERSATIONS
// ============================================

export async function getAIChatHistory(userId: string, limit = 50) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIConversationBookmarks(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_conversation_bookmarks')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIConversationBookmark(userId: string, conversationId: string, messageId?: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_conversation_bookmarks')
      .insert({ user_id: userId, conversation_id: conversationId, message_id: messageId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIConversationShares(conversationId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_conversation_shares')
      .select('*')
      .eq('conversation_id', conversationId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI CODE
// ============================================

export async function getAICodeStats(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_code_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI COLLABORATION
// ============================================

export async function getAICollaboration(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_collaboration')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI COLLECTIONS
// ============================================

export async function getAICollectionAssets(collectionId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_collection_assets')
      .select('*')
      .eq('collection_id', collectionId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICollectionImages(collectionId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_collection_images')
      .select('*')
      .eq('collection_id', collectionId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI COLOR PALETTES
// ============================================

export async function getAIColorPalettes(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_color_palettes')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIColorPalette(userId: string, input: { name: string; colors: string[] }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_color_palettes')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI CONFIGS
// ============================================

export async function getAIConfigs(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_configs')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function updateAIConfig(id: string, userId: string, updates: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_configs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI CONTENT
// ============================================

export async function getAIContentTemplates(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('ai_content_templates').select('*')
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIContentTemplate(userId: string, input: { name: string; content: string; category?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_content_templates')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIContentVariations(contentId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_content_variations')
      .select('*')
      .eq('content_id', contentId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI CREATE SYSTEM
// ============================================

export async function getAICreateApiKeys(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_api_keys')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateAssets(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateCollaborationSessions(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_collaboration_sessions')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateCostTracking(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_cost_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateFavorites(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_favorites')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function toggleAICreateFavorite(userId: string, assetId: string, assetType: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('ai_create_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('asset_id', assetId)
      .single()

    if (existing) {
      await supabase.from('ai_create_favorites').delete().eq('id', existing.id)
      return { success: true, favorited: false }
    } else {
      await supabase.from('ai_create_favorites').insert({ user_id: userId, asset_id: assetId, asset_type: assetType })
      return { success: true, favorited: true }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAICreateFileUploads(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_file_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateGenerationHistory(userId: string, limit = 50) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_generation_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateGenerations(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreateModelUsage(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_model_usage')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAICreatePreferences(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_create_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function updateAICreatePreferences(userId: string, preferences: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_create_preferences')
      .upsert({ user_id: userId, ...preferences }, { onConflict: 'user_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAICreateTemplates(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('ai_create_templates').select('*')
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI DESIGN
// ============================================

export async function getAIDesignConcepts(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_design_concepts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIDesignProjects(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_design_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI EMAIL
// ============================================

export async function getAIEmailSequences(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_email_sequences')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI ENHANCED TOOLS
// ============================================

export async function getAIEnhancedTools() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_enhanced_tools')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI FEATURES
// ============================================

export async function getAIFeatureUsage(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_feature_usage')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function trackAIFeatureUsage(userId: string, featureId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_feature_usage')
      .upsert({ user_id: userId, feature_id: featureId, last_used: new Date().toISOString() }, { onConflict: 'user_id,feature_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIFeatures() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_features')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI GENERATED CONTENT
// ============================================

export async function getAIGeneratedAssets(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_generated_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIGeneratedContent(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_generated_content')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIGeneratedCopy(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_generated_copy')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIGeneratedImages(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_generated_images')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIGenerationHistory(userId: string, limit = 100) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_generation_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI IMAGE
// ============================================

export async function getAIImageCollections(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_image_collections')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIImagePresets(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('ai_image_presets').select('*')
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI INSIGHTS & RECOMMENDATIONS
// ============================================

export async function getAIInsights(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIRecommendations(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI MESSAGES
// ============================================

export async function getAIMessageAttachments(messageId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_message_attachments')
      .select('*')
      .eq('message_id', messageId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIMessageFeedback(messageId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_message_feedback')
      .select('*')
      .eq('message_id', messageId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function submitAIMessageFeedback(userId: string, messageId: string, feedback: { rating: number; comment?: string }) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_message_feedback')
      .insert({ user_id: userId, message_id: messageId, ...feedback })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI MODELS
// ============================================

export async function getAIModelConfigs() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_model_configs')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIModels() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI OPERATIONS
// ============================================

export async function getAIOperations(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_operations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI PROJECT ANALYSES
// ============================================

export async function getAIProjectAnalyses(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_project_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI PROMPTS
// ============================================

export async function getAIPromptTemplates(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('ai_prompt_templates').select('*')
    if (userId) query = query.or(`user_id.eq.${userId},is_public.eq.true`)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIPromptTemplate(userId: string, input: { name: string; prompt: string; category?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI PROVIDERS
// ============================================

export async function getAIProviders() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI QUICK ACTIONS
// ============================================

export async function getAIQuickActions(userId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from('ai_quick_actions').select('*')
    if (userId) query = query.or(`user_id.eq.${userId},is_global.eq.true`)
    const { data, error } = await query
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI SWIPE FILE
// ============================================

export async function getAISwipeFile(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_swipe_file')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function addToAISwipeFile(userId: string, input: { content: string; category?: string; tags?: string[] }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_swipe_file')
      .insert({ ...input, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI TOOLS
// ============================================

export async function getAIToolFavorites(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_tool_favorites')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function toggleAIToolFavorite(userId: string, toolId: string) {
  try {
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('ai_tool_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single()

    if (existing) {
      await supabase.from('ai_tool_favorites').delete().eq('id', existing.id)
      return { success: true, favorited: false }
    } else {
      await supabase.from('ai_tool_favorites').insert({ user_id: userId, tool_id: toolId })
      return { success: true, favorited: true }
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIToolMetrics() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_tool_metrics')
      .select('*')
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIToolReviews(toolId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_tool_reviews')
      .select('*')
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIToolReview(userId: string, toolId: string, review: { rating: number; comment?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_tool_reviews')
      .insert({ user_id: userId, tool_id: toolId, ...review })
      .select()
      .single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getAIToolUsage(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_tool_usage')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAITools() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

// ============================================
// AI USAGE
// ============================================

export async function getAIUsageDaily(userId: string, days = 30) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_usage_daily')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(days)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIUsageLogs(userId: string, limit = 100) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIUsageRecords(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_usage_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIUsageStats(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_usage_stats')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI VOICE
// ============================================

export async function getAIVoiceSettings(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_voice_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function updateAIVoiceSettings(userId: string, settings: any) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('ai_voice_settings')
      .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

// ============================================
// AI WORKFLOWS
// ============================================

export async function getAIWorkflowSteps(workflowId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getAIWorkflows(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_workflows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createAIWorkflow(userId: string, input: { name: string; description?: string; steps?: any[] }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ai_workflows')
      .insert({ name: input.name, description: input.description, user_id: userId })
      .select()
      .single()
    if (error) throw error

    // Create steps if provided
    if (input.steps?.length) {
      await supabase.from('ai_workflow_steps').insert(
        input.steps.map((step, index) => ({
          workflow_id: data.id,
          step_order: index + 1,
          ...step
        }))
      )
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}
