/**
 * AI Enhanced Query Library
 *
 * CRUD operations for AI Enhanced Tools:
 * - AI Tools (10 functions)
 * - Statistics (2 functions)
 *
 * Total: 12 functions
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError } from '@/lib/types/database'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AIToolType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'data' | 'assistant' | 'automation'
export type AIToolCategory = 'content' | 'design' | 'development' | 'analytics' | 'productivity' | 'creative'
export type AIToolStatus = 'active' | 'inactive' | 'training' | 'maintenance'
export type PricingTier = 'free' | 'basic' | 'pro' | 'enterprise'
export type PerformanceLevel = 'excellent' | 'good' | 'fair' | 'poor'

export interface AIEnhancedTool {
  id: string
  user_id: string
  name: string
  type: AIToolType
  category: AIToolCategory
  description: string
  model: string
  provider: string
  status: AIToolStatus
  pricing_tier: PricingTier
  performance: PerformanceLevel
  usage_count: number
  success_rate: number
  avg_response_time: number
  features: string[]
  tags: string[]
  is_popular: boolean
  is_favorite: boolean
  version: string
  last_used: string | null
  created_at: string
  updated_at: string
}

export interface AIToolStatistics {
  total_tools: number
  active_tools: number
  favorite_tools: number
  popular_tools: number
  total_usage: number
  avg_success_rate: number
  avg_response_time: number
  by_type: Record<string, number>
  by_category: Record<string, number>
  by_provider: Record<string, number>
}

// ============================================================================
// AI TOOLS (10 functions)
// ============================================================================

export async function getAIEnhancedTools(
  userId: string,
  filters?: {
    type?: AIToolType
    category?: AIToolCategory
    status?: AIToolStatus
    is_favorite?: boolean
    is_popular?: boolean
    search?: string
  }
): Promise<{ data: AIEnhancedTool[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_enhanced_tools')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite)
  }
  if (filters?.is_popular !== undefined) {
    query = query.eq('is_popular', filters.is_popular)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error: error ? toDbError(error) : null }
}

export async function getAIEnhancedTool(
  toolId: string
): Promise<{ data: AIEnhancedTool | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .select('*')
    .eq('id', toolId)
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function createAIEnhancedTool(
  userId: string,
  tool: {
    name: string
    type: AIToolType
    category: AIToolCategory
    description: string
    model: string
    provider: string
    status?: AIToolStatus
    pricing_tier?: PricingTier
    performance?: PerformanceLevel
    features?: string[]
    tags?: string[]
    version?: string
  }
): Promise<{ data: AIEnhancedTool | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .insert({
      user_id: userId,
      ...tool
    })
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateAIEnhancedTool(
  toolId: string,
  updates: Partial<Omit<AIEnhancedTool, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: AIEnhancedTool | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .update(updates)
    .eq('id', toolId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function deleteAIEnhancedTool(
  toolId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_enhanced_tools')
    .delete()
    .eq('id', toolId)

  return { error: error ? toDbError(error) : null }
}

export async function toggleFavorite(
  toolId: string,
  isFavorite: boolean
): Promise<{ data: AIEnhancedTool | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .update({ is_favorite: isFavorite })
    .eq('id', toolId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function incrementUsageCount(
  toolId: string
): Promise<{ data: AIEnhancedTool | null; error: DatabaseError | null }> {
  const supabase = createClient()

  // Get current count
  const { data: currentTool } = await supabase
    .from('ai_enhanced_tools')
    .select('usage_count')
    .eq('id', toolId)
    .single()

  if (!currentTool) {
    return { data: null, error: toDbError(new Error('Tool not found')) }
  }

  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .update({
      usage_count: currentTool.usage_count + 1,
      last_used: new Date().toISOString()
    })
    .eq('id', toolId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function updateToolPerformance(
  toolId: string,
  metrics: {
    success_rate?: number
    avg_response_time?: number
    performance?: PerformanceLevel
  }
): Promise<{ data: AIEnhancedTool | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .update(metrics)
    .eq('id', toolId)
    .select()
    .single()

  return { data, error: error ? toDbError(error) : null }
}

export async function bulkDeleteTools(
  toolIds: string[]
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_enhanced_tools')
    .delete()
    .in('id', toolIds)

  return { error: error ? toDbError(error) : null }
}

export async function searchToolsByTags(
  userId: string,
  tags: string[]
): Promise<{ data: AIEnhancedTool[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', tags)
    .order('usage_count', { ascending: false })

  return { data, error: error ? toDbError(error) : null }
}

// ============================================================================
// STATISTICS (2 functions)
// ============================================================================

export async function getToolStatistics(
  userId: string
): Promise<{ data: AIToolStatistics | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    return { data: null, error: toDbError(error) }
  }

  const stats: AIToolStatistics = {
    total_tools: data.length,
    active_tools: data.filter((t: AIEnhancedTool) => t.status === 'active').length,
    favorite_tools: data.filter((t: AIEnhancedTool) => t.is_favorite).length,
    popular_tools: data.filter((t: AIEnhancedTool) => t.is_popular).length,
    total_usage: data.reduce((sum: number, t: AIEnhancedTool) => sum + t.usage_count, 0),
    avg_success_rate: data.length > 0 ? data.reduce((sum: number, t: AIEnhancedTool) => sum + t.success_rate, 0) / data.length : 0,
    avg_response_time: data.length > 0 ? data.reduce((sum: number, t: AIEnhancedTool) => sum + t.avg_response_time, 0) / data.length : 0,
    by_type: data.reduce((acc: Record<string, number>, t: AIEnhancedTool) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_category: data.reduce((acc: Record<string, number>, t: AIEnhancedTool) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_provider: data.reduce((acc: Record<string, number>, t: AIEnhancedTool) => {
      acc[t.provider] = (acc[t.provider] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { data: stats, error: null }
}

export async function getTopPerformingTools(
  userId: string,
  limit: number = 10
): Promise<{ data: AIEnhancedTool[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_enhanced_tools')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('success_rate', { ascending: false })
    .order('usage_count', { ascending: false })
    .limit(limit)

  return { data, error: error ? toDbError(error) : null }
}
