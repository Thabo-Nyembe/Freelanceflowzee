// Project Templates - Supabase Queries
// Reusable project templates with tasks, milestones, deliverables, and pricing

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type TemplateCategory =
  | 'branding'
  | 'web-development'
  | 'mobile-development'
  | 'mobile-design'
  | 'marketing'
  | 'video-production'
  | 'photography'
  | 'graphic-design'
  | 'content-writing'
  | 'seo'
  | 'consulting'
  | 'other'

export type TemplateType = 'free' | 'standard' | 'premium' | 'enterprise'
export type ComplexityLevel = 'simple' | 'moderate' | 'advanced' | 'expert'
export type TemplateStatus = 'draft' | 'published' | 'archived'

export interface ProjectTemplate {
  id: string
  user_id?: string
  name: string
  description: string
  slug: string
  category: TemplateCategory
  type: TemplateType
  complexity: ComplexityLevel
  status: TemplateStatus
  thumbnail_url?: string
  cover_image_url?: string
  preview_images?: string[]
  duration_min?: number
  duration_max?: number
  duration_text?: string
  price_min?: number
  price_max?: number
  price_text?: string
  currency: string
  features?: string[]
  deliverables?: string[]
  tags?: string[]
  keywords?: string[]
  requirements?: string[]
  prerequisites?: string[]
  overview?: string
  process_steps?: any
  workflow?: any
  usage_count: number
  favorites_count: number
  rating_average: number
  rating_count: number
  views_count: number
  is_featured: boolean
  is_popular: boolean
  is_verified: boolean
  is_customizable: boolean
  metadata?: any
  created_at: string
  updated_at: string
  published_at?: string
}

export interface TemplateTask {
  id: string
  template_id: string
  title: string
  description?: string
  category?: string
  estimated_hours?: number
  start_day?: number
  duration_days?: number
  role?: string
  skill_level?: string
  depends_on?: string[]
  is_milestone: boolean
  is_optional: boolean
  display_order: number
  metadata?: any
  created_at: string
}

export interface TemplateMilestone {
  id: string
  template_id: string
  title: string
  description?: string
  target_day: number
  target_percentage?: number
  deliverables?: string[]
  payment_percentage?: number
  display_order: number
  created_at: string
}

export interface TemplateDeliverable {
  id: string
  template_id: string
  milestone_id?: string
  title: string
  description?: string
  category?: string
  file_format?: string
  due_day?: number
  requirements?: string[]
  acceptance_criteria?: string[]
  display_order: number
  created_at: string
}

export interface TemplatePricing {
  id: string
  template_id: string
  tier_name: string
  tier_description?: string
  price: number
  currency: string
  features?: string[]
  deliverables?: string[]
  revisions_included?: number
  support_duration?: number
  is_recommended: boolean
  display_order: number
  created_at: string
}

export interface TemplateUsage {
  id: string
  template_id: string
  user_id?: string
  project_id?: string
  customizations?: any
  used_at: string
}

export interface TemplateFavorite {
  id: string
  template_id: string
  user_id: string
  folder?: string
  notes?: string
  created_at: string
}

export interface TemplateReview {
  id: string
  template_id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
  project_type?: string
  project_size?: string
  helpful_count: number
  created_at: string
  updated_at: string
}

export interface TemplateFilters {
  category?: TemplateCategory
  type?: TemplateType
  complexity?: ComplexityLevel
  min_rating?: number
  max_price?: number
  tags?: string[]
  search?: string
  is_featured?: boolean
  is_popular?: boolean
}

export interface PopularTemplate {
  template_id: string
  template_name: string
  usage_count: number
  rating_average: number
  rank: number
}

// ============================================================================
// TEMPLATE QUERIES
// ============================================================================

/**
 * Get all templates
 */
export async function getTemplates(
  filters?: TemplateFilters,
  sortBy: 'recent' | 'popular' | 'rating' = 'recent',
  limit: number = 50
) {
  const supabase = createClient()

  let query = supabase
    .from('project_templates')
    .select('*')
    .eq('status', 'published')
    .limit(limit)

  // Apply filters
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.complexity) {
    query = query.eq('complexity', filters.complexity)
  }

  if (filters?.min_rating) {
    query = query.gte('rating_average', filters.min_rating)
  }

  if (filters?.max_price) {
    query = query.lte('price_max', filters.max_price)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  if (filters?.is_featured !== undefined) {
    query = query.eq('is_featured', filters.is_featured)
  }

  if (filters?.is_popular !== undefined) {
    query = query.eq('is_popular', filters.is_popular)
  }

  if (filters?.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  // Apply sorting
  switch (sortBy) {
    case 'popular':
      query = query.order('usage_count', { ascending: false })
      break
    case 'rating':
      query = query.order('rating_average', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProjectTemplate[]
}

/**
 * Get template by ID
 */
export async function getTemplateById(templateId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error

  // Increment view count
  await supabase
    .from('project_templates')
    .update({ views_count: data.views_count + 1 })
    .eq('id', templateId)

  return data as ProjectTemplate
}

/**
 * Get template by slug
 */
export async function getTemplateBySlug(slug: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as ProjectTemplate
}

/**
 * Create template
 */
export async function createTemplate(templateData: Partial<ProjectTemplate>) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('project_templates')
    .insert({
      ...templateData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data as ProjectTemplate
}

/**
 * Update template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<ProjectTemplate>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data as ProjectTemplate
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('project_templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
}

/**
 * Get featured templates
 */
export async function getFeaturedTemplates(limit: number = 10) {
  return getTemplates({ is_featured: true }, 'recent', limit)
}

/**
 * Get popular templates
 */
export async function getPopularTemplatesQuery(
  category?: TemplateCategory,
  limit: number = 10
): Promise<PopularTemplate[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_popular_templates', {
      p_category: category || null,
      p_limit: limit
    })

  if (error) throw error
  return data as PopularTemplate[]
}

/**
 * Get user's templates
 */
export async function getUserTemplates(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProjectTemplate[]
}

/**
 * Duplicate template
 */
export async function duplicateTemplate(
  templateId: string,
  newName?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .rpc('duplicate_template', {
      p_template_id: templateId,
      p_user_id: user.id,
      p_new_name: newName || null
    })

  if (error) throw error
  return data
}

/**
 * Search templates
 */
export async function searchTemplates(query: string, limit: number = 50) {
  return getTemplates({ search: query }, 'recent', limit)
}

// ============================================================================
// TEMPLATE TASKS QUERIES
// ============================================================================

/**
 * Get template tasks
 */
export async function getTemplateTasks(templateId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_tasks')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order')

  if (error) throw error
  return data as TemplateTask[]
}

/**
 * Create template task
 */
export async function createTemplateTask(taskData: Partial<TemplateTask>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update template task
 */
export async function updateTemplateTask(
  taskId: string,
  updates: Partial<TemplateTask>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete template task
 */
export async function deleteTemplateTask(taskId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('template_tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}

// ============================================================================
// TEMPLATE MILESTONES QUERIES
// ============================================================================

/**
 * Get template milestones
 */
export async function getTemplateMilestones(templateId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_milestones')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order')

  if (error) throw error
  return data as TemplateMilestone[]
}

/**
 * Create template milestone
 */
export async function createTemplateMilestone(
  milestoneData: Partial<TemplateMilestone>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_milestones')
    .insert(milestoneData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update template milestone
 */
export async function updateTemplateMilestone(
  milestoneId: string,
  updates: Partial<TemplateMilestone>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete template milestone
 */
export async function deleteTemplateMilestone(milestoneId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('template_milestones')
    .delete()
    .eq('id', milestoneId)

  if (error) throw error
}

// ============================================================================
// TEMPLATE DELIVERABLES QUERIES
// ============================================================================

/**
 * Get template deliverables
 */
export async function getTemplateDeliverables(templateId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_deliverables')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order')

  if (error) throw error
  return data as TemplateDeliverable[]
}

/**
 * Create template deliverable
 */
export async function createTemplateDeliverable(
  deliverableData: Partial<TemplateDeliverable>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_deliverables')
    .insert(deliverableData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update template deliverable
 */
export async function updateTemplateDeliverable(
  deliverableId: string,
  updates: Partial<TemplateDeliverable>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_deliverables')
    .update(updates)
    .eq('id', deliverableId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete template deliverable
 */
export async function deleteTemplateDeliverable(deliverableId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('template_deliverables')
    .delete()
    .eq('id', deliverableId)

  if (error) throw error
}

// ============================================================================
// TEMPLATE PRICING QUERIES
// ============================================================================

/**
 * Get template pricing tiers
 */
export async function getTemplatePricing(templateId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_pricing')
    .select('*')
    .eq('template_id', templateId)
    .order('display_order')

  if (error) throw error
  return data as TemplatePricing[]
}

/**
 * Create pricing tier
 */
export async function createPricingTier(pricingData: Partial<TemplatePricing>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_pricing')
    .insert(pricingData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update pricing tier
 */
export async function updatePricingTier(
  tierId: string,
  updates: Partial<TemplatePricing>
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_pricing')
    .update(updates)
    .eq('id', tierId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete pricing tier
 */
export async function deletePricingTier(tierId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('template_pricing')
    .delete()
    .eq('id', tierId)

  if (error) throw error
}

// ============================================================================
// TEMPLATE USAGE QUERIES
// ============================================================================

/**
 * Apply template to create project
 */
export async function applyTemplateToProject(
  templateId: string,
  projectId?: string,
  customizations?: any
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .rpc('use_template', {
      p_template_id: templateId,
      p_user_id: user?.id || null,
      p_project_id: projectId || null,
      p_customizations: customizations || {}
    })

  if (error) throw error
  return data
}

/**
 * Get template usage history
 */
export async function getTemplateUsage(
  templateId: string,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_usage')
    .select('*')
    .eq('template_id', templateId)
    .order('used_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as TemplateUsage[]
}

/**
 * Get user's template usage
 */
export async function getUserTemplateUsage(userId: string, limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_usage')
    .select(`
      *,
      template:template_id (*)
    `)
    .eq('user_id', userId)
    .order('used_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// ============================================================================
// TEMPLATE FAVORITES QUERIES
// ============================================================================

/**
 * Favorite template
 */
export async function favoriteTemplate(
  templateId: string,
  folder?: string,
  notes?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('template_favorites')
    .insert({
      template_id: templateId,
      user_id: user.id,
      folder,
      notes
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Remove favorite
 */
export async function removeFavorite(templateId: string, userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('template_favorites')
    .delete()
    .eq('template_id', templateId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Get user's favorites
 */
export async function getUserFavorites(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_favorites')
    .select(`
      *,
      template:template_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Check if template is favorited
 */
export async function isTemplateFavorited(
  templateId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()

  const { count } = await supabase
    .from('template_favorites')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', templateId)
    .eq('user_id', userId)

  return (count || 0) > 0
}

// ============================================================================
// TEMPLATE REVIEWS QUERIES
// ============================================================================

/**
 * Review template
 */
export async function reviewTemplate(
  templateId: string,
  rating: number,
  title?: string,
  comment?: string,
  projectType?: string,
  projectSize?: string
) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('template_reviews')
    .upsert({
      template_id: templateId,
      user_id: user.id,
      rating,
      title,
      comment,
      project_type: projectType,
      project_size: projectSize,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get template reviews
 */
export async function getTemplateReviews(
  templateId: string,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_reviews')
    .select('*')
    .eq('template_id', templateId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as TemplateReview[]
}

/**
 * Get user's review for template
 */
export async function getUserReview(templateId: string, userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('template_reviews')
    .select('*')
    .eq('template_id', templateId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as TemplateReview | null
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get template library stats
 */
export async function getTemplateLibraryStats() {
  const supabase = createClient()

  const { count: totalTemplates } = await supabase
    .from('project_templates')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const { count: totalUsages } = await supabase
    .from('template_usage')
    .select('*', { count: 'exact', head: true })

  const { count: totalFavorites } = await supabase
    .from('template_favorites')
    .select('*', { count: 'exact', head: true })

  const { count: totalReviews } = await supabase
    .from('template_reviews')
    .select('*', { count: 'exact', head: true })

  return {
    total_templates: totalTemplates || 0,
    total_usages: totalUsages || 0,
    total_favorites: totalFavorites || 0,
    total_reviews: totalReviews || 0
  }
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(category: TemplateCategory) {
  return getTemplates({ category }, 'popular', 100)
}

// ============================================================================
// COMPLETE TEMPLATE DATA
// ============================================================================

/**
 * Get complete template with all related data
 */
export async function getCompleteTemplate(templateId: string) {
  const [template, tasks, milestones, deliverables, pricing, reviews] =
    await Promise.all([
      getTemplateById(templateId),
      getTemplateTasks(templateId),
      getTemplateMilestones(templateId),
      getTemplateDeliverables(templateId),
      getTemplatePricing(templateId),
      getTemplateReviews(templateId, 10)
    ])

  return {
    template,
    tasks,
    milestones,
    deliverables,
    pricing,
    reviews
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export templates to CSV
 */
export async function exportTemplates(filters?: TemplateFilters) {
  const templates = await getTemplates(filters, 'recent', 10000)

  const headers = [
    'Name',
    'Category',
    'Type',
    'Complexity',
    'Duration',
    'Price',
    'Usage Count',
    'Rating',
    'Created'
  ]

  const rows = templates.map(t => [
    t.name,
    t.category,
    t.type,
    t.complexity,
    t.duration_text || '',
    t.price_text || '',
    t.usage_count.toString(),
    t.rating_average.toString(),
    t.created_at
  ])

  return { headers, rows }
}
