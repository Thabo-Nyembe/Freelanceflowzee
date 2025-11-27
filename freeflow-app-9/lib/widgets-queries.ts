// Widgets System - Supabase Queries
// Comprehensive queries for dashboard widgets, layouts, templates, and customization

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type WidgetType = 'metric' | 'chart' | 'table' | 'activity' | 'quick-actions' | 'calendar'
export type WidgetSize = 'small' | 'medium' | 'large' | 'full'
export type WidgetCategory = 'analytics' | 'productivity' | 'finance' | 'social' | 'custom'
export type LayoutType = 'grid' | 'masonry' | 'flex' | 'absolute'

export interface Widget {
  id: string
  user_id: string
  name: string
  type: WidgetType
  category: WidgetCategory
  size: WidgetSize
  icon?: string
  description?: string
  is_visible: boolean
  is_locked: boolean
  position_x: number
  position_y: number
  width: number
  height: number
  config: Record<string, any>
  data_source?: string
  refresh_interval?: number
  last_refreshed_at?: string
  usage_count: number
  created_at: string
  updated_at: string
}

export interface WidgetLayout {
  id: string
  user_id: string
  name: string
  description?: string
  layout_type: LayoutType
  columns: number
  gap: number
  is_active: boolean
  is_default: boolean
  widgets: string[] // Widget IDs
  created_at: string
  updated_at: string
}

export interface WidgetTemplate {
  id: string
  name: string
  description: string
  category: WidgetCategory
  preview_image_url?: string
  template_config: Record<string, any>
  default_size: WidgetSize
  is_published: boolean
  is_premium: boolean
  usage_count: number
  rating: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface WidgetData {
  id: string
  widget_id: string
  data: Record<string, any>
  cached_until?: string
  error_message?: string
  fetched_at: string
  created_at: string
}

export interface WidgetAnalytics {
  id: string
  widget_id: string
  user_id: string
  event_type: string // 'view', 'click', 'refresh', 'resize', 'move'
  event_data: Record<string, any>
  event_timestamp: string
  created_at: string
}

// ============================================================================
// WIDGETS - CRUD
// ============================================================================

export async function createWidget(userId: string, widgetData: Partial<Widget>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .insert({
      user_id: userId,
      ...widgetData
    })
    .select()
    .single()

  if (error) throw error
  return data as Widget
}

export async function getWidget(widgetId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', widgetId)
    .single()

  if (error) throw error
  return data as Widget
}

export async function getWidgetsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', userId)
    .order('position_y', { ascending: true })
    .order('position_x', { ascending: true })

  if (error) throw error
  return data as Widget[]
}

export async function updateWidget(widgetId: string, updates: Partial<Widget>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .update(updates)
    .eq('id', widgetId)
    .select()
    .single()

  if (error) throw error
  return data as Widget
}

export async function deleteWidget(widgetId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('widgets')
    .delete()
    .eq('id', widgetId)

  if (error) throw error
  return true
}

// ============================================================================
// WIDGETS - FILTERS & QUERIES
// ============================================================================

export async function getVisibleWidgets(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_visible', true)
    .order('position_y', { ascending: true })
    .order('position_x', { ascending: true })

  if (error) throw error
  return data as Widget[]
}

export async function getWidgetsByType(userId: string, type: WidgetType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Widget[]
}

export async function getWidgetsByCategory(userId: string, category: WidgetCategory) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Widget[]
}

export async function getWidgetsBySize(userId: string, size: WidgetSize) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', userId)
    .eq('size', size)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Widget[]
}

export async function toggleWidgetVisibility(widgetId: string) {
  const supabase = createClient()
  const widget = await getWidget(widgetId)
  return updateWidget(widgetId, { is_visible: !widget.is_visible })
}

export async function toggleWidgetLock(widgetId: string) {
  const supabase = createClient()
  const widget = await getWidget(widgetId)
  return updateWidget(widgetId, { is_locked: !widget.is_locked })
}

export async function updateWidgetPosition(widgetId: string, positionX: number, positionY: number) {
  return updateWidget(widgetId, { position_x: positionX, position_y: positionY })
}

export async function updateWidgetSize(widgetId: string, width: number, height: number, size: WidgetSize) {
  return updateWidget(widgetId, { width, height, size })
}

export async function refreshWidget(widgetId: string) {
  return updateWidget(widgetId, { last_refreshed_at: new Date().toISOString() })
}

export async function incrementWidgetUsage(widgetId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widgets')
    .update({ usage_count: supabase.raw('usage_count + 1') })
    .eq('id', widgetId)
    .select()
    .single()

  if (error) throw error
  return data as Widget
}

// ============================================================================
// WIDGET LAYOUTS - CRUD
// ============================================================================

export async function createLayout(userId: string, layoutData: Partial<WidgetLayout>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_layouts')
    .insert({
      user_id: userId,
      ...layoutData
    })
    .select()
    .single()

  if (error) throw error
  return data as WidgetLayout
}

export async function getLayout(layoutId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_layouts')
    .select('*')
    .eq('id', layoutId)
    .single()

  if (error) throw error
  return data as WidgetLayout
}

export async function getLayoutsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_layouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as WidgetLayout[]
}

export async function getActiveLayout(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_layouts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as WidgetLayout
}

export async function updateLayout(layoutId: string, updates: Partial<WidgetLayout>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_layouts')
    .update(updates)
    .eq('id', layoutId)
    .select()
    .single()

  if (error) throw error
  return data as WidgetLayout
}

export async function deleteLayout(layoutId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('widget_layouts')
    .delete()
    .eq('id', layoutId)

  if (error) throw error
  return true
}

export async function setActiveLayout(userId: string, layoutId: string) {
  const supabase = createClient()

  // Deactivate all layouts for this user
  await supabase
    .from('widget_layouts')
    .update({ is_active: false })
    .eq('user_id', userId)

  // Activate the selected layout
  return updateLayout(layoutId, { is_active: true })
}

export async function addWidgetToLayout(layoutId: string, widgetId: string) {
  const supabase = createClient()
  const layout = await getLayout(layoutId)
  const widgets = [...layout.widgets, widgetId]
  return updateLayout(layoutId, { widgets })
}

export async function removeWidgetFromLayout(layoutId: string, widgetId: string) {
  const supabase = createClient()
  const layout = await getLayout(layoutId)
  const widgets = layout.widgets.filter(id => id !== widgetId)
  return updateLayout(layoutId, { widgets })
}

// ============================================================================
// WIDGET TEMPLATES - CRUD
// ============================================================================

export async function createTemplate(templateData: Partial<WidgetTemplate>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .insert(templateData)
    .select()
    .single()

  if (error) throw error
  return data as WidgetTemplate
}

export async function getTemplate(templateId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data as WidgetTemplate
}

export async function getAllTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('is_published', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as WidgetTemplate[]
}

export async function updateTemplate(templateId: string, updates: Partial<WidgetTemplate>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data as WidgetTemplate
}

export async function deleteTemplate(templateId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('widget_templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
  return true
}

// ============================================================================
// WIDGET TEMPLATES - FILTERS & QUERIES
// ============================================================================

export async function getTemplatesByCategory(category: WidgetCategory) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as WidgetTemplate[]
}

export async function getPremiumTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('is_premium', true)
    .eq('is_published', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data as WidgetTemplate[]
}

export async function getFreeTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('is_premium', false)
    .eq('is_published', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as WidgetTemplate[]
}

export async function getTopRatedTemplates(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('is_published', true)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as WidgetTemplate[]
}

export async function getMostUsedTemplates(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .select('*')
    .eq('is_published', true)
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as WidgetTemplate[]
}

export async function incrementTemplateUsage(templateId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_templates')
    .update({ usage_count: supabase.raw('usage_count + 1') })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data as WidgetTemplate
}

export async function createWidgetFromTemplate(userId: string, templateId: string, customConfig?: Record<string, any>) {
  const template = await getTemplate(templateId)
  await incrementTemplateUsage(templateId)

  const widgetData: Partial<Widget> = {
    name: template.name,
    type: 'custom',
    category: template.category,
    size: template.default_size,
    description: template.description,
    config: { ...template.template_config, ...customConfig },
    position_x: 0,
    position_y: 0,
    width: template.default_size === 'small' ? 1 : template.default_size === 'medium' ? 2 : 3,
    height: template.default_size === 'small' ? 1 : template.default_size === 'medium' ? 2 : 3,
    is_visible: true,
    is_locked: false
  }

  return createWidget(userId, widgetData)
}

// ============================================================================
// WIDGET DATA - CACHING
// ============================================================================

export async function cacheWidgetData(widgetId: string, data: Record<string, any>, cacheDuration?: number) {
  const supabase = createClient()

  const cachedUntil = cacheDuration
    ? new Date(Date.now() + cacheDuration * 1000).toISOString()
    : undefined

  const { data: cached, error } = await supabase
    .from('widget_data')
    .upsert({
      widget_id: widgetId,
      data,
      cached_until: cachedUntil,
      fetched_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return cached as WidgetData
}

export async function getWidgetData(widgetId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_data')
    .select('*')
    .eq('widget_id', widgetId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as WidgetData | null
}

export async function getCachedWidgetData(widgetId: string) {
  const data = await getWidgetData(widgetId)

  if (!data) return null

  // Check if cache is still valid
  if (data.cached_until) {
    const now = new Date()
    const cacheExpiry = new Date(data.cached_until)
    if (now > cacheExpiry) {
      return null // Cache expired
    }
  }

  return data
}

export async function clearWidgetCache(widgetId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('widget_data')
    .delete()
    .eq('widget_id', widgetId)

  if (error) throw error
  return true
}

// ============================================================================
// WIDGET ANALYTICS - TRACKING
// ============================================================================

export async function trackWidgetEvent(widgetId: string, userId: string, eventType: string, eventData?: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('widget_analytics')
    .insert({
      widget_id: widgetId,
      user_id: userId,
      event_type: eventType,
      event_data: eventData || {},
      event_timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data as WidgetAnalytics
}

export async function getWidgetAnalytics(widgetId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('widget_analytics')
    .select('*')
    .eq('widget_id', widgetId)
    .gte('event_timestamp', startDate.toISOString())
    .order('event_timestamp', { ascending: true })

  if (error) throw error
  return data as WidgetAnalytics[]
}

export async function getUserWidgetAnalytics(userId: string, days: number = 30) {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('widget_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('event_timestamp', startDate.toISOString())
    .order('event_timestamp', { ascending: true })

  if (error) throw error
  return data as WidgetAnalytics[]
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export async function batchUpdateWidgetPositions(updates: Array<{ widgetId: string; positionX: number; positionY: number }>) {
  const promises = updates.map(({ widgetId, positionX, positionY }) =>
    updateWidgetPosition(widgetId, positionX, positionY)
  )
  return Promise.all(promises)
}

export async function batchUpdateWidgetVisibility(widgetIds: string[], isVisible: boolean) {
  const promises = widgetIds.map(widgetId =>
    updateWidget(widgetId, { is_visible: isVisible })
  )
  return Promise.all(promises)
}

export async function batchDeleteWidgets(widgetIds: string[]) {
  const promises = widgetIds.map(widgetId => deleteWidget(widgetId))
  return Promise.all(promises)
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getWidgetStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    visibleResult,
    lockedResult,
    byType,
    byCategory,
    bySize
  ] = await Promise.all([
    supabase.from('widgets').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('widgets').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_visible', true),
    supabase.from('widgets').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_locked', true),
    supabase.from('widgets').select('type').eq('user_id', userId),
    supabase.from('widgets').select('category').eq('user_id', userId),
    supabase.from('widgets').select('size').eq('user_id', userId)
  ])

  return {
    total_widgets: totalResult.count || 0,
    visible_widgets: visibleResult.count || 0,
    locked_widgets: lockedResult.count || 0,
    by_type: groupByField(byType.data || [], 'type'),
    by_category: groupByField(byCategory.data || [], 'category'),
    by_size: groupByField(bySize.data || [], 'size')
  }
}

export async function getLayoutStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    activeResult,
    defaultResult
  ] = await Promise.all([
    supabase.from('widget_layouts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('widget_layouts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
    supabase.from('widget_layouts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_default', true)
  ])

  return {
    total_layouts: totalResult.count || 0,
    active_layouts: activeResult.count || 0,
    default_layouts: defaultResult.count || 0
  }
}

export async function getTemplateStats() {
  const supabase = createClient()

  const [
    totalResult,
    publishedResult,
    premiumResult,
    freeResult
  ] = await Promise.all([
    supabase.from('widget_templates').select('id', { count: 'exact', head: true }),
    supabase.from('widget_templates').select('id', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('widget_templates').select('id', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('widget_templates').select('id', { count: 'exact', head: true }).eq('is_premium', false)
  ])

  return {
    total_templates: totalResult.count || 0,
    published_templates: publishedResult.count || 0,
    premium_templates: premiumResult.count || 0,
    free_templates: freeResult.count || 0
  }
}

// Helper function to group results by field
function groupByField(data: any[], field: string): Record<string, number> {
  return data.reduce((acc, item) => {
    const key = item[field] || 'unknown'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}
