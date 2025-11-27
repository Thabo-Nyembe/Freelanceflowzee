/**
 * AI Voice Synthesis Query Library
 *
 * CRUD operations for AI Voice Synthesis:
 * - Voices (10 functions)
 * - Voice Syntheses (10 functions)
 * - Voice Clones (6 functions)
 * - Voice Projects (6 functions)
 * - Voice Scripts (6 functions)
 * - Analytics (3 functions)
 *
 * Total: 41 functions
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type VoiceGender = 'male' | 'female' | 'neutral'
export type VoiceAge = 'child' | 'young-adult' | 'adult' | 'senior'
export type VoiceStyle = 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic' | 'friendly' | 'authoritative'
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'flac'
export type AudioQuality = 'low' | 'medium' | 'high' | 'ultra'
export type CloneStatus = 'training' | 'ready' | 'failed'
export type ProjectStatus = 'draft' | 'processing' | 'completed'

export interface Voice {
  id: string
  user_id: string | null
  name: string
  display_name: string
  language: string
  language_code: string
  gender: VoiceGender
  age: VoiceAge
  accent: string | null
  description: string
  preview_url: string | null
  is_premium: boolean
  is_new: boolean
  is_public: boolean
  popularity: number
  usage_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface VoiceSynthesis {
  id: string
  user_id: string
  voice_id: string
  text: string
  audio_url: string | null
  style: VoiceStyle | null
  speed: number
  pitch: number
  volume: number
  format: AudioFormat
  quality: AudioQuality
  duration: number
  file_size: number
  character_count: number
  processing_time: number
  cost: number
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface VoiceClone {
  id: string
  user_id: string
  name: string
  description: string | null
  language: string
  sample_count: number
  status: CloneStatus
  progress: number
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface VoiceProject {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  total_duration: number
  script_count: number
  created_at: string
  updated_at: string
}

export interface VoiceScript {
  id: string
  project_id: string
  voice_id: string
  text: string
  style: VoiceStyle | null
  speed: number
  pitch: number
  volume: number
  order_index: number
  duration: number | null
  audio_url: string | null
  created_at: string
  updated_at: string
}

export interface VoiceAnalytics {
  id: string
  user_id: string
  date: string
  total_syntheses: number
  total_characters: number
  total_duration: number
  total_cost: number
  voice_usage: Record<string, number>
  created_at: string
  updated_at: string
}

// ============================================================================
// VOICES (10 functions)
// ============================================================================

export async function getVoices(
  filters?: {
    user_id?: string
    language?: string
    gender?: VoiceGender
    is_premium?: boolean
    is_public?: boolean
    search?: string
  }
): Promise<{ data: Voice[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('voices')
    .select('*')
    .order('popularity', { ascending: false })

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id)
  }
  if (filters?.language) {
    query = query.eq('language', filters.language)
  }
  if (filters?.gender) {
    query = query.eq('gender', filters.gender)
  }
  if (filters?.is_premium !== undefined) {
    query = query.eq('is_premium', filters.is_premium)
  }
  if (filters?.is_public !== undefined) {
    query = query.eq('is_public', filters.is_public)
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getVoice(
  voiceId: string
): Promise<{ data: Voice | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .eq('id', voiceId)
    .single()

  return { data, error }
}

export async function createVoice(
  voice: {
    user_id?: string
    name: string
    display_name: string
    language: string
    language_code: string
    gender: VoiceGender
    age: VoiceAge
    accent?: string
    description: string
    preview_url?: string
    is_premium?: boolean
    is_public?: boolean
    tags?: string[]
  }
): Promise<{ data: Voice | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .insert(voice)
    .select()
    .single()

  return { data, error }
}

export async function updateVoice(
  voiceId: string,
  updates: Partial<Omit<Voice, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Voice | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .update(updates)
    .eq('id', voiceId)
    .select()
    .single()

  return { data, error }
}

export async function deleteVoice(
  voiceId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voices')
    .delete()
    .eq('id', voiceId)

  return { error }
}

export async function getPopularVoices(
  limit: number = 10
): Promise<{ data: Voice[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .eq('is_public', true)
    .order('popularity', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getNewVoices(
  limit: number = 10
): Promise<{ data: Voice[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .eq('is_public', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function searchVoicesByTags(
  tags: string[]
): Promise<{ data: Voice[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .contains('tags', tags)
    .eq('is_public', true)
    .order('popularity', { ascending: false })

  return { data, error }
}

export async function getVoicesByLanguage(
  language: string
): Promise<{ data: Voice[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voices')
    .select('*')
    .eq('language', language)
    .eq('is_public', true)
    .order('popularity', { ascending: false })

  return { data, error }
}

export async function bulkDeleteVoices(
  voiceIds: string[]
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voices')
    .delete()
    .in('id', voiceIds)

  return { error }
}

// ============================================================================
// VOICE SYNTHESES (10 functions)
// ============================================================================

export async function getVoiceSyntheses(
  userId: string,
  filters?: {
    voice_id?: string
    is_favorite?: boolean
    search?: string
  }
): Promise<{ data: VoiceSynthesis[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('voice_syntheses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.voice_id) {
    query = query.eq('voice_id', filters.voice_id)
  }
  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite)
  }
  if (filters?.search) {
    query = query.ilike('text', `%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getVoiceSynthesis(
  synthesisId: string
): Promise<{ data: VoiceSynthesis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_syntheses')
    .select('*')
    .eq('id', synthesisId)
    .single()

  return { data, error }
}

export async function createVoiceSynthesis(
  userId: string,
  synthesis: {
    voice_id: string
    text: string
    style?: VoiceStyle
    speed?: number
    pitch?: number
    volume?: number
    format?: AudioFormat
    quality?: AudioQuality
  }
): Promise<{ data: VoiceSynthesis | null; error: any }> {
  const supabase = createClient()

  // Calculate character count
  const character_count = synthesis.text.length

  const { data, error } = await supabase
    .from('voice_syntheses')
    .insert({
      user_id: userId,
      character_count,
      ...synthesis
    })
    .select()
    .single()

  return { data, error }
}

export async function updateVoiceSynthesis(
  synthesisId: string,
  updates: Partial<Omit<VoiceSynthesis, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: VoiceSynthesis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_syntheses')
    .update(updates)
    .eq('id', synthesisId)
    .select()
    .single()

  return { data, error }
}

export async function deleteVoiceSynthesis(
  synthesisId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voice_syntheses')
    .delete()
    .eq('id', synthesisId)

  return { error }
}

export async function toggleSynthesisFavorite(
  synthesisId: string,
  isFavorite: boolean
): Promise<{ data: VoiceSynthesis | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_syntheses')
    .update({ is_favorite: isFavorite })
    .eq('id', synthesisId)
    .select()
    .single()

  return { data, error }
}

export async function getFavoriteSyntheses(
  userId: string,
  limit: number = 20
): Promise<{ data: VoiceSynthesis[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_syntheses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function getRecentSyntheses(
  userId: string,
  limit: number = 10
): Promise<{ data: VoiceSynthesis[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_syntheses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data, error }
}

export async function bulkDeleteSyntheses(
  synthesisIds: string[]
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voice_syntheses')
    .delete()
    .in('id', synthesisIds)

  return { error }
}

export async function getSynthesesByVoice(
  userId: string,
  voiceId: string
): Promise<{ data: VoiceSynthesis[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_syntheses')
    .select('*')
    .eq('user_id', userId)
    .eq('voice_id', voiceId)
    .order('created_at', { ascending: false })

  return { data, error }
}

// ============================================================================
// VOICE CLONES (6 functions)
// ============================================================================

export async function getVoiceClones(
  userId: string,
  filters?: {
    status?: CloneStatus
  }
): Promise<{ data: VoiceClone[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('voice_clones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getVoiceClone(
  cloneId: string
): Promise<{ data: VoiceClone | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_clones')
    .select('*')
    .eq('id', cloneId)
    .single()

  return { data, error }
}

export async function createVoiceClone(
  userId: string,
  clone: {
    name: string
    description?: string
    language: string
    sample_count: number
  }
): Promise<{ data: VoiceClone | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_clones')
    .insert({
      user_id: userId,
      ...clone
    })
    .select()
    .single()

  return { data, error }
}

export async function updateVoiceClone(
  cloneId: string,
  updates: Partial<Omit<VoiceClone, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at'>>
): Promise<{ data: VoiceClone | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_clones')
    .update(updates)
    .eq('id', cloneId)
    .select()
    .single()

  return { data, error }
}

export async function deleteVoiceClone(
  cloneId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voice_clones')
    .delete()
    .eq('id', cloneId)

  return { error }
}

export async function updateCloneProgress(
  cloneId: string,
  progress: number,
  status?: CloneStatus
): Promise<{ data: VoiceClone | null; error: any }> {
  const supabase = createClient()
  const updates: any = { progress }
  if (status) {
    updates.status = status
  }

  const { data, error } = await supabase
    .from('voice_clones')
    .update(updates)
    .eq('id', cloneId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// VOICE PROJECTS (6 functions)
// ============================================================================

export async function getVoiceProjects(
  userId: string,
  filters?: {
    status?: ProjectStatus
  }
): Promise<{ data: VoiceProject[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('voice_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getVoiceProject(
  projectId: string
): Promise<{ data: VoiceProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  return { data, error }
}

export async function createVoiceProject(
  userId: string,
  project: {
    name: string
    description?: string
    status?: ProjectStatus
  }
): Promise<{ data: VoiceProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_projects')
    .insert({
      user_id: userId,
      ...project
    })
    .select()
    .single()

  return { data, error }
}

export async function updateVoiceProject(
  projectId: string,
  updates: Partial<Omit<VoiceProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: VoiceProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  return { data, error }
}

export async function deleteVoiceProject(
  projectId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voice_projects')
    .delete()
    .eq('id', projectId)

  return { error }
}

export async function bulkDeleteProjects(
  projectIds: string[]
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voice_projects')
    .delete()
    .in('id', projectIds)

  return { error }
}

// ============================================================================
// VOICE SCRIPTS (6 functions)
// ============================================================================

export async function getVoiceScripts(
  projectId: string
): Promise<{ data: VoiceScript[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_scripts')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  return { data, error }
}

export async function getVoiceScript(
  scriptId: string
): Promise<{ data: VoiceScript | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_scripts')
    .select('*')
    .eq('id', scriptId)
    .single()

  return { data, error }
}

export async function createVoiceScript(
  script: {
    project_id: string
    voice_id: string
    text: string
    style?: VoiceStyle
    speed?: number
    pitch?: number
    volume?: number
    order_index: number
  }
): Promise<{ data: VoiceScript | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_scripts')
    .insert(script)
    .select()
    .single()

  return { data, error }
}

export async function updateVoiceScript(
  scriptId: string,
  updates: Partial<Omit<VoiceScript, 'id' | 'project_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: VoiceScript | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_scripts')
    .update(updates)
    .eq('id', scriptId)
    .select()
    .single()

  return { data, error }
}

export async function deleteVoiceScript(
  scriptId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('voice_scripts')
    .delete()
    .eq('id', scriptId)

  return { error }
}

export async function reorderVoiceScripts(
  projectId: string,
  scriptOrders: { id: string; order_index: number }[]
): Promise<{ error: any }> {
  const supabase = createClient()

  // Update each script's order
  const updates = scriptOrders.map(({ id, order_index }) =>
    supabase
      .from('voice_scripts')
      .update({ order_index })
      .eq('id', id)
      .eq('project_id', projectId)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  return { error: errors.length > 0 ? errors[0].error : null }
}

// ============================================================================
// ANALYTICS (3 functions)
// ============================================================================

export async function getVoiceAnalytics(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: VoiceAnalytics[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('voice_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (startDate) {
    query = query.gte('date', startDate)
  }
  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query
  return { data, error }
}

export async function createVoiceAnalytics(
  userId: string,
  analytics: {
    date?: string
    total_syntheses?: number
    total_characters?: number
    total_duration?: number
    total_cost?: number
    voice_usage?: Record<string, number>
  }
): Promise<{ data: VoiceAnalytics | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('voice_analytics')
    .insert({
      user_id: userId,
      ...analytics
    })
    .select()
    .single()

  return { data, error }
}

export async function getUserVoiceStats(
  userId: string
): Promise<{ data: any; error: any }> {
  const supabase = createClient()

  // Get all syntheses
  const { data: syntheses, error: synthesesError } = await supabase
    .from('voice_syntheses')
    .select('*')
    .eq('user_id', userId)

  if (synthesesError) {
    return { data: null, error: synthesesError }
  }

  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('voice_projects')
    .select('*')
    .eq('user_id', userId)

  if (projectsError) {
    return { data: null, error: projectsError }
  }

  // Get all clones
  const { data: clones, error: clonesError } = await supabase
    .from('voice_clones')
    .select('*')
    .eq('user_id', userId)

  if (clonesError) {
    return { data: null, error: clonesError }
  }

  const stats = {
    total_syntheses: syntheses?.length || 0,
    total_characters: syntheses?.reduce((sum, s) => sum + s.character_count, 0) || 0,
    total_duration: syntheses?.reduce((sum, s) => sum + s.duration, 0) || 0,
    total_cost: syntheses?.reduce((sum, s) => sum + s.cost, 0) || 0,
    favorite_syntheses: syntheses?.filter(s => s.is_favorite).length || 0,
    total_projects: projects?.length || 0,
    completed_projects: projects?.filter(p => p.status === 'completed').length || 0,
    total_clones: clones?.length || 0,
    ready_clones: clones?.filter(c => c.status === 'ready').length || 0,
    by_voice: syntheses?.reduce((acc, s) => {
      acc[s.voice_id] = (acc[s.voice_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
  }

  return { data: stats, error: null }
}
