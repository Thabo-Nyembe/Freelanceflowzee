/**
 * AI Design Studio Query Library
 *
 * Complete CRUD operations for AI Design Studio:
 * - AI Design Projects (9 functions)
 * - Design Outputs (5 functions)
 * - Design Templates (6 functions)
 * - AI Tools (4 functions)
 * - Color Palettes (5 functions)
 * - Project Analytics (3 functions)
 * - Tool Reviews (4 functions)
 * - Statistics (3 functions)
 *
 * Total: 39 functions
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AIToolType = 'logo' | 'color-palette' | 'style-transfer' | 'image-enhance' | 'auto-layout' | 'background-removal' | 'smart-crop' | 'batch-generate'
export type AIModel = 'gpt-4-vision' | 'dall-e-3' | 'midjourney-v6' | 'stable-diffusion' | 'ai-upscaler' | 'remove-bg' | 'vision-ai'
export type DesignCategory = 'logo' | 'branding' | 'social-media' | 'print' | 'web' | 'marketing' | 'illustration' | 'ui-ux'
export type ProjectStatus = 'draft' | 'generating' | 'active' | 'review' | 'completed' | 'archived'
export type ExportFormat = 'svg' | 'png' | 'jpg' | 'pdf' | 'webp'

export interface AIDesignProject {
  id: string
  user_id: string
  name: string
  type: AIToolType
  status: ProjectStatus
  progress: number
  tool_id: string
  template_id: string | null
  generated_at: string | null
  completed_at: string | null
  model: AIModel
  variations: number
  selected_variation: number | null
  prompt: string | null
  parameters: any
  quality_score: number | null
  feedback: string | null
  created_at: string
  updated_at: string
}

export interface DesignOutput {
  id: string
  project_id: string
  variation_number: number
  url: string
  thumbnail: string
  format: ExportFormat
  width: number
  height: number
  file_size: number
  quality_score: number
  is_selected: boolean
  downloads: number
  created_at: string
}

export interface DesignTemplate {
  id: string
  name: string
  description: string
  category: DesignCategory
  thumbnail: string
  uses: number
  rating: number
  review_count: number
  ai_ready: boolean
  is_premium: boolean
  width: number
  height: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface AITool {
  id: string
  type: AIToolType
  name: string
  description: string
  model: AIModel
  icon: string
  uses: number
  rating: number
  review_count: number
  is_premium: boolean
  estimated_time: number
  max_variations: number
  supported_formats: ExportFormat[]
  features: string[]
  created_at: string
  updated_at: string
}

export interface ColorPalette {
  id: string
  user_id: string | null
  name: string
  colors: string[]
  description: string
  wcag_compliant: boolean
  contrast_ratios: number[]
  mood: string
  usage: string[]
  uses: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ProjectAnalytics {
  id: string
  project_id: string
  date: string
  views: number
  downloads: number
  shares: number
  generation_time: number | null
  created_at: string
  updated_at: string
}

export interface ToolReview {
  id: string
  tool_id: string
  user_id: string
  rating: number
  comment: string
  helpful: number
  created_at: string
  updated_at: string
}

// ============================================================================
// AI DESIGN PROJECTS (9 functions)
// ============================================================================

/**
 * Get all design projects for a user with optional filters
 */
export async function getDesignProjects(
  userId: string,
  filters?: {
    type?: AIToolType
    status?: ProjectStatus
    model?: AIModel
    search?: string
  }
): Promise<{ data: AIDesignProject[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_design_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.model) {
    query = query.eq('model', filters.model)
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

/**
 * Get a single design project by ID
 */
export async function getDesignProject(
  projectId: string
): Promise<{ data: AIDesignProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_design_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  return { data, error }
}

/**
 * Create a new design project
 */
export async function createDesignProject(
  userId: string,
  project: {
    name: string
    type: AIToolType
    model: AIModel
    tool_id: string
    template_id?: string
    prompt?: string
    parameters?: any
    variations?: number
  }
): Promise<{ data: AIDesignProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_design_projects')
    .insert({
      user_id: userId,
      name: project.name,
      type: project.type,
      model: project.model,
      tool_id: project.tool_id,
      template_id: project.template_id || null,
      prompt: project.prompt || null,
      parameters: project.parameters || {},
      variations: project.variations || 1,
      status: 'draft'
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update a design project
 */
export async function updateDesignProject(
  projectId: string,
  updates: Partial<Omit<AIDesignProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: AIDesignProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_design_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  return { data, error }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  progress?: number
): Promise<{ data: AIDesignProject | null; error: any }> {
  const supabase = createClient()
  const updates: any = { status }
  if (progress !== undefined) {
    updates.progress = progress
  }
  if (status === 'generating') {
    updates.generated_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('ai_design_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  return { data, error }
}

/**
 * Set selected variation for a project
 */
export async function setSelectedVariation(
  projectId: string,
  variationNumber: number
): Promise<{ data: AIDesignProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_design_projects')
    .update({ selected_variation: variationNumber })
    .eq('id', projectId)
    .select()
    .single()

  return { data, error }
}

/**
 * Add quality score to a project
 */
export async function addProjectQualityScore(
  projectId: string,
  qualityScore: number,
  feedback?: string
): Promise<{ data: AIDesignProject | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_design_projects')
    .update({
      quality_score: qualityScore,
      feedback: feedback || null
    })
    .eq('id', projectId)
    .select()
    .single()

  return { data, error }
}

/**
 * Archive a design project
 */
export async function archiveDesignProject(
  projectId: string
): Promise<{ data: AIDesignProject | null; error: any }> {
  return updateProjectStatus(projectId, 'archived')
}

/**
 * Delete a design project
 */
export async function deleteDesignProject(
  projectId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_design_projects')
    .delete()
    .eq('id', projectId)

  return { error }
}

// ============================================================================
// DESIGN OUTPUTS (5 functions)
// ============================================================================

/**
 * Get all outputs for a project
 */
export async function getDesignOutputs(
  projectId: string
): Promise<{ data: DesignOutput[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_outputs')
    .select('*')
    .eq('project_id', projectId)
    .order('variation_number', { ascending: true })

  return { data, error }
}

/**
 * Create a design output
 */
export async function createDesignOutput(
  output: {
    project_id: string
    variation_number: number
    url: string
    thumbnail: string
    format: ExportFormat
    width: number
    height: number
    file_size: number
    quality_score: number
  }
): Promise<{ data: DesignOutput | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_outputs')
    .insert(output)
    .select()
    .single()

  return { data, error }
}

/**
 * Select a design output as the primary variation
 */
export async function selectDesignOutput(
  projectId: string,
  variationNumber: number
): Promise<{ error: any }> {
  const supabase = createClient()

  // First, deselect all outputs for this project
  await supabase
    .from('design_outputs')
    .update({ is_selected: false })
    .eq('project_id', projectId)

  // Then select the specified variation
  const { error } = await supabase
    .from('design_outputs')
    .update({ is_selected: true })
    .eq('project_id', projectId)
    .eq('variation_number', variationNumber)

  return { error }
}

/**
 * Increment download count for an output
 */
export async function incrementOutputDownloads(
  outputId: string
): Promise<{ data: DesignOutput | null; error: any }> {
  const supabase = createClient()

  // Get current count
  const { data: currentOutput } = await supabase
    .from('design_outputs')
    .select('downloads')
    .eq('id', outputId)
    .single()

  if (!currentOutput) {
    return { data: null, error: new Error('Output not found') }
  }

  const { data, error } = await supabase
    .from('design_outputs')
    .update({ downloads: currentOutput.downloads + 1 })
    .eq('id', outputId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a design output
 */
export async function deleteDesignOutput(
  outputId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('design_outputs')
    .delete()
    .eq('id', outputId)

  return { error }
}

// ============================================================================
// DESIGN TEMPLATES (6 functions)
// ============================================================================

/**
 * Get all design templates with optional filters
 */
export async function getDesignTemplates(
  filters?: {
    category?: DesignCategory
    ai_ready?: boolean
    is_premium?: boolean
    search?: string
  }
): Promise<{ data: DesignTemplate[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('design_templates')
    .select('*')
    .order('uses', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.ai_ready !== undefined) {
    query = query.eq('ai_ready', filters.ai_ready)
  }
  if (filters?.is_premium !== undefined) {
    query = query.eq('is_premium', filters.is_premium)
  }
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

/**
 * Get a single design template by ID
 */
export async function getDesignTemplate(
  templateId: string
): Promise<{ data: DesignTemplate | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  return { data, error }
}

/**
 * Get popular templates
 */
export async function getPopularTemplates(
  limit: number = 6
): Promise<{ data: DesignTemplate[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')
    .order('uses', { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * Get AI-ready templates
 */
export async function getAIReadyTemplates(): Promise<{ data: DesignTemplate[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')
    .eq('ai_ready', true)
    .order('rating', { ascending: false })

  return { data, error }
}

/**
 * Increment template uses
 */
export async function incrementTemplateUses(
  templateId: string
): Promise<{ data: DesignTemplate | null; error: any }> {
  const supabase = createClient()

  // Get current count
  const { data: currentTemplate } = await supabase
    .from('design_templates')
    .select('uses')
    .eq('id', templateId)
    .single()

  if (!currentTemplate) {
    return { data: null, error: new Error('Template not found') }
  }

  const { data, error } = await supabase
    .from('design_templates')
    .update({ uses: currentTemplate.uses + 1 })
    .eq('id', templateId)
    .select()
    .single()

  return { data, error }
}

/**
 * Search templates by tags
 */
export async function searchTemplatesByTags(
  tags: string[]
): Promise<{ data: DesignTemplate[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')
    .contains('tags', tags)
    .order('rating', { ascending: false })

  return { data, error }
}

// ============================================================================
// AI TOOLS (4 functions)
// ============================================================================

/**
 * Get all AI tools
 */
export async function getAITools(): Promise<{ data: AITool[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_tools')
    .select('*')
    .order('uses', { ascending: false })

  return { data, error }
}

/**
 * Get a single AI tool by type
 */
export async function getAITool(
  toolType: AIToolType
): Promise<{ data: AITool | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('type', toolType)
    .single()

  return { data, error }
}

/**
 * Increment AI tool uses
 */
export async function incrementToolUses(
  toolType: AIToolType
): Promise<{ data: AITool | null; error: any }> {
  const supabase = createClient()

  // Get current tool
  const { data: currentTool } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('type', toolType)
    .single()

  if (!currentTool) {
    return { data: null, error: new Error('Tool not found') }
  }

  const { data, error } = await supabase
    .from('ai_tools')
    .update({ uses: currentTool.uses + 1 })
    .eq('type', toolType)
    .select()
    .single()

  return { data, error }
}

/**
 * Get popular AI tools
 */
export async function getPopularAITools(
  limit: number = 8
): Promise<{ data: AITool[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_tools')
    .select('*')
    .order('uses', { ascending: false })
    .limit(limit)

  return { data, error }
}

// ============================================================================
// COLOR PALETTES (5 functions)
// ============================================================================

/**
 * Get all color palettes with optional filters
 */
export async function getColorPalettes(
  userId?: string,
  filters?: {
    mood?: string
    wcag_compliant?: boolean
    is_public?: boolean
  }
): Promise<{ data: ColorPalette[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('color_palettes')
    .select('*')
    .order('uses', { ascending: false })

  if (userId) {
    query = query.or(`user_id.eq.${userId},is_public.eq.true`)
  } else {
    query = query.eq('is_public', true)
  }

  if (filters?.mood) {
    query = query.eq('mood', filters.mood)
  }
  if (filters?.wcag_compliant !== undefined) {
    query = query.eq('wcag_compliant', filters.wcag_compliant)
  }

  const { data, error } = await query
  return { data, error }
}

/**
 * Get a single color palette by ID
 */
export async function getColorPalette(
  paletteId: string
): Promise<{ data: ColorPalette | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('color_palettes')
    .select('*')
    .eq('id', paletteId)
    .single()

  return { data, error }
}

/**
 * Create a new color palette
 */
export async function createColorPalette(
  userId: string,
  palette: {
    name: string
    colors: string[]
    description: string
    wcag_compliant?: boolean
    contrast_ratios?: number[]
    mood: string
    usage?: string[]
    is_public?: boolean
  }
): Promise<{ data: ColorPalette | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('color_palettes')
    .insert({
      user_id: userId,
      name: palette.name,
      colors: palette.colors,
      description: palette.description,
      wcag_compliant: palette.wcag_compliant || false,
      contrast_ratios: palette.contrast_ratios || [],
      mood: palette.mood,
      usage: palette.usage || [],
      is_public: palette.is_public || false
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Increment palette uses
 */
export async function incrementPaletteUses(
  paletteId: string
): Promise<{ data: ColorPalette | null; error: any }> {
  const supabase = createClient()

  // Get current count
  const { data: currentPalette } = await supabase
    .from('color_palettes')
    .select('uses')
    .eq('id', paletteId)
    .single()

  if (!currentPalette) {
    return { data: null, error: new Error('Palette not found') }
  }

  const { data, error } = await supabase
    .from('color_palettes')
    .update({ uses: currentPalette.uses + 1 })
    .eq('id', paletteId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a color palette
 */
export async function deleteColorPalette(
  paletteId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('color_palettes')
    .delete()
    .eq('id', paletteId)

  return { error }
}

// ============================================================================
// PROJECT ANALYTICS (3 functions)
// ============================================================================

/**
 * Get analytics for a project
 */
export async function getProjectAnalytics(
  projectId: string,
  dateRange?: { from: string; to: string }
): Promise<{ data: ProjectAnalytics[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('project_analytics')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })

  if (dateRange) {
    query = query.gte('date', dateRange.from).lte('date', dateRange.to)
  }

  const { data, error } = await query
  return { data, error }
}

/**
 * Track project analytics
 */
export async function trackProjectAnalytics(
  projectId: string,
  analytics: {
    views?: number
    downloads?: number
    shares?: number
    generation_time?: number
  }
): Promise<{ data: ProjectAnalytics | null; error: any }> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  // Try to get existing analytics for today
  const { data: existing } = await supabase
    .from('project_analytics')
    .select('*')
    .eq('project_id', projectId)
    .eq('date', today)
    .single()

  if (existing) {
    // Update existing record
    const { data, error } = await supabase
      .from('project_analytics')
      .update({
        views: existing.views + (analytics.views || 0),
        downloads: existing.downloads + (analytics.downloads || 0),
        shares: existing.shares + (analytics.shares || 0),
        generation_time: analytics.generation_time || existing.generation_time
      })
      .eq('id', existing.id)
      .select()
      .single()

    return { data, error }
  } else {
    // Create new record
    const { data, error } = await supabase
      .from('project_analytics')
      .insert({
        project_id: projectId,
        date: today,
        views: analytics.views || 0,
        downloads: analytics.downloads || 0,
        shares: analytics.shares || 0,
        generation_time: analytics.generation_time || null
      })
      .select()
      .single()

    return { data, error }
  }
}

/**
 * Get total analytics for a user's projects
 */
export async function getUserProjectAnalytics(
  userId: string
): Promise<{ data: any; error: any }> {
  const supabase = createClient()

  // Get all user projects
  const { data: projects } = await supabase
    .from('ai_design_projects')
    .select('id')
    .eq('user_id', userId)

  if (!projects || projects.length === 0) {
    return {
      data: {
        total_views: 0,
        total_downloads: 0,
        total_shares: 0,
        avg_generation_time: 0
      },
      error: null
    }
  }

  const projectIds = projects.map(p => p.id)

  const { data, error } = await supabase
    .from('project_analytics')
    .select('*')
    .in('project_id', projectIds)

  if (error) {
    return { data: null, error }
  }

  // Aggregate totals
  const totals = data.reduce(
    (acc, record) => ({
      total_views: acc.total_views + record.views,
      total_downloads: acc.total_downloads + record.downloads,
      total_shares: acc.total_shares + record.shares,
      generation_time_sum: acc.generation_time_sum + (record.generation_time || 0),
      generation_count: record.generation_time ? acc.generation_count + 1 : acc.generation_count
    }),
    { total_views: 0, total_downloads: 0, total_shares: 0, generation_time_sum: 0, generation_count: 0 }
  )

  return {
    data: {
      total_views: totals.total_views,
      total_downloads: totals.total_downloads,
      total_shares: totals.total_shares,
      avg_generation_time: totals.generation_count > 0 ? totals.generation_time_sum / totals.generation_count : 0
    },
    error: null
  }
}

// ============================================================================
// TOOL REVIEWS (4 functions)
// ============================================================================

/**
 * Get reviews for a tool
 */
export async function getToolReviews(
  toolId: string
): Promise<{ data: ToolReview[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tool_reviews')
    .select('*')
    .eq('tool_id', toolId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Create a tool review
 */
export async function createToolReview(
  toolId: string,
  userId: string,
  review: {
    rating: number
    comment: string
  }
): Promise<{ data: ToolReview | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tool_reviews')
    .insert({
      tool_id: toolId,
      user_id: userId,
      rating: review.rating,
      comment: review.comment
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update a tool review
 */
export async function updateToolReview(
  reviewId: string,
  updates: {
    rating?: number
    comment?: string
  }
): Promise<{ data: ToolReview | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tool_reviews')
    .update(updates)
    .eq('id', reviewId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a tool review
 */
export async function deleteToolReview(
  reviewId: string
): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('tool_reviews')
    .delete()
    .eq('id', reviewId)

  return { error }
}

// ============================================================================
// STATISTICS (3 functions)
// ============================================================================

/**
 * Get design project statistics for a user
 */
export async function getDesignProjectStats(
  userId: string
): Promise<{ data: any; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_design_projects')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    return { data: null, error }
  }

  const stats = {
    total_projects: data.length,
    completed_projects: data.filter(p => p.status === 'completed').length,
    active_projects: data.filter(p => p.status === 'active').length,
    avg_quality_score: data.filter(p => p.quality_score !== null).reduce((sum, p) => sum + (p.quality_score || 0), 0) / data.filter(p => p.quality_score !== null).length || 0,
    total_variations: data.reduce((sum, p) => sum + p.variations, 0),
    by_tool_type: data.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    by_model: data.reduce((acc, p) => {
      acc[p.model] = (acc[p.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { data: stats, error: null }
}

/**
 * Get template statistics
 */
export async function getTemplateStats(): Promise<{ data: any; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('design_templates')
    .select('*')

  if (error) {
    return { data: null, error }
  }

  const stats = {
    total_templates: data.length,
    ai_ready_templates: data.filter(t => t.ai_ready).length,
    premium_templates: data.filter(t => t.is_premium).length,
    total_uses: data.reduce((sum, t) => sum + t.uses, 0),
    avg_rating: data.reduce((sum, t) => sum + (t.rating || 0), 0) / data.length || 0,
    by_category: data.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { data: stats, error: null }
}

/**
 * Get AI tool statistics
 */
export async function getAIToolStats(): Promise<{ data: any; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_tools')
    .select('*')

  if (error) {
    return { data: null, error }
  }

  const stats = {
    total_tools: data.length,
    premium_tools: data.filter(t => t.is_premium).length,
    total_uses: data.reduce((sum, t) => sum + t.uses, 0),
    avg_rating: data.reduce((sum, t) => sum + (t.rating || 0), 0) / data.length || 0,
    avg_estimated_time: data.reduce((sum, t) => sum + t.estimated_time, 0) / data.length || 0,
    by_model: data.reduce((acc, t) => {
      acc[t.model] = (acc[t.model] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  return { data: stats, error: null }
}
