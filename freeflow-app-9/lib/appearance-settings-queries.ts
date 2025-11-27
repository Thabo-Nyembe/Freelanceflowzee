/**
 * Appearance Settings Query Library
 */

import { createClient } from '@/lib/supabase/client'

export type ThemePresetCategory = 'minimal' | 'modern' | 'classic' | 'bold' | 'professional' | 'creative' | 'custom'
export type CustomizationType = 'theme' | 'color' | 'font' | 'spacing' | 'layout' | 'component' | 'css'
export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'lato' | 'montserrat' | 'poppins' | 'system' | 'custom'
export type ColorSchemeType = 'monochrome' | 'analogous' | 'complementary' | 'triadic' | 'custom'

export interface ThemeCustomization {
  id: string
  user_id: string
  customization_name: string
  customization_type: CustomizationType
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  border_color?: string
  font_family: FontFamily
  font_size_base: number
  line_height: number
  letter_spacing: number
  spacing_unit: number
  border_radius: number
  sidebar_width: number
  max_content_width: number
  custom_properties: Record<string, any>
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ThemePreset {
  id: string
  user_id?: string
  preset_name: string
  preset_category: ThemePresetCategory
  description?: string
  config: Record<string, any>
  thumbnail_url?: string
  author?: string
  usage_count: number
  favorite_count: number
  is_public: boolean
  is_verified: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface CustomCSSSnippet {
  id: string
  user_id: string
  snippet_name: string
  description?: string
  css_code: string
  target_selector?: string
  target_component?: string
  is_enabled: boolean
  is_validated: boolean
  order_index: number
  error_message?: string
  created_at: string
  updated_at: string
}

export interface ColorScheme {
  id: string
  user_id: string
  scheme_name: string
  scheme_type: ColorSchemeType
  description?: string
  colors: any[]
  is_light_mode: boolean
  contrast_ratio?: number
  is_active: boolean
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface FontPreference {
  id: string
  user_id: string
  font_name: string
  font_family: FontFamily
  font_url?: string
  used_for: string[]
  fallback_fonts: string[]
  is_active: boolean
  is_web_font: boolean
  created_at: string
  updated_at: string
}

export interface CustomizationHistory {
  id: string
  user_id: string
  customization_type: CustomizationType
  changed_property: string
  old_value?: string
  new_value?: string
  customization_id?: string
  applied_at: string
  change_reason?: string
  created_at: string
}

// THEME CUSTOMIZATIONS
export async function getThemeCustomizations(userId: string, filters?: { customization_type?: CustomizationType; is_active?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('theme_customizations').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.customization_type) query = query.eq('customization_type', filters.customization_type)
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  return await query
}

export async function getActiveThemeCustomization(userId: string) {
  const supabase = createClient()
  return await supabase.from('theme_customizations').select('*').eq('user_id', userId).eq('is_active', true).single()
}

export async function getThemeCustomization(customizationId: string) {
  const supabase = createClient()
  return await supabase.from('theme_customizations').select('*').eq('id', customizationId).single()
}

export async function createThemeCustomization(userId: string, customization: Partial<ThemeCustomization>) {
  const supabase = createClient()
  return await supabase.from('theme_customizations').insert({ user_id: userId, ...customization }).select().single()
}

export async function updateThemeCustomization(customizationId: string, updates: Partial<ThemeCustomization>) {
  const supabase = createClient()
  return await supabase.from('theme_customizations').update(updates).eq('id', customizationId).select().single()
}

export async function activateThemeCustomization(customizationId: string) {
  const supabase = createClient()
  return await supabase.from('theme_customizations').update({ is_active: true }).eq('id', customizationId).select().single()
}

export async function deleteThemeCustomization(customizationId: string) {
  const supabase = createClient()
  return await supabase.from('theme_customizations').delete().eq('id', customizationId)
}

// THEME PRESETS
export async function getThemePresets(filters?: { preset_category?: ThemePresetCategory; is_public?: boolean; is_system?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('theme_presets').select('*').order('usage_count', { ascending: false })
  if (filters?.preset_category) query = query.eq('preset_category', filters.preset_category)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  if (filters?.is_system !== undefined) query = query.eq('is_system', filters.is_system)
  return await query
}

export async function getUserThemePresets(userId: string) {
  const supabase = createClient()
  return await supabase.from('theme_presets').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function getThemePreset(presetId: string) {
  const supabase = createClient()
  return await supabase.from('theme_presets').select('*').eq('id', presetId).single()
}

export async function createThemePreset(userId: string | undefined, preset: Partial<ThemePreset>) {
  const supabase = createClient()
  return await supabase.from('theme_presets').insert({ user_id: userId, ...preset }).select().single()
}

export async function updateThemePreset(presetId: string, updates: Partial<ThemePreset>) {
  const supabase = createClient()
  return await supabase.from('theme_presets').update(updates).eq('id', presetId).select().single()
}

export async function deleteThemePreset(presetId: string) {
  const supabase = createClient()
  return await supabase.from('theme_presets').delete().eq('id', presetId)
}

export async function getPopularThemePresets(limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('theme_presets').select('*').eq('is_public', true).order('usage_count', { ascending: false }).limit(limit)
}

// CUSTOM CSS SNIPPETS
export async function getCustomCSSSnippets(userId: string, filters?: { is_enabled?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('custom_css_snippets').select('*').eq('user_id', userId).order('order_index')
  if (filters?.is_enabled !== undefined) query = query.eq('is_enabled', filters.is_enabled)
  return await query
}

export async function getCustomCSSSnippet(snippetId: string) {
  const supabase = createClient()
  return await supabase.from('custom_css_snippets').select('*').eq('id', snippetId).single()
}

export async function createCustomCSSSnippet(userId: string, snippet: Partial<CustomCSSSnippet>) {
  const supabase = createClient()
  return await supabase.from('custom_css_snippets').insert({ user_id: userId, ...snippet }).select().single()
}

export async function updateCustomCSSSnippet(snippetId: string, updates: Partial<CustomCSSSnippet>) {
  const supabase = createClient()
  return await supabase.from('custom_css_snippets').update(updates).eq('id', snippetId).select().single()
}

export async function toggleCustomCSSSnippet(snippetId: string, enabled: boolean) {
  const supabase = createClient()
  return await supabase.from('custom_css_snippets').update({ is_enabled: enabled }).eq('id', snippetId).select().single()
}

export async function reorderCustomCSSSnippets(userId: string, snippetIds: string[]) {
  const supabase = createClient()
  const updates = snippetIds.map((id, index) => ({
    id,
    order_index: index
  }))

  const promises = updates.map(update =>
    supabase.from('custom_css_snippets').update({ order_index: update.order_index }).eq('id', update.id).eq('user_id', userId)
  )

  return await Promise.all(promises)
}

export async function deleteCustomCSSSnippet(snippetId: string) {
  const supabase = createClient()
  return await supabase.from('custom_css_snippets').delete().eq('id', snippetId)
}

// COLOR SCHEMES
export async function getColorSchemes(userId: string, filters?: { scheme_type?: ColorSchemeType; is_active?: boolean; is_favorite?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('color_schemes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.scheme_type) query = query.eq('scheme_type', filters.scheme_type)
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  if (filters?.is_favorite !== undefined) query = query.eq('is_favorite', filters.is_favorite)
  return await query
}

export async function getActiveColorScheme(userId: string) {
  const supabase = createClient()
  return await supabase.from('color_schemes').select('*').eq('user_id', userId).eq('is_active', true).single()
}

export async function getColorScheme(schemeId: string) {
  const supabase = createClient()
  return await supabase.from('color_schemes').select('*').eq('id', schemeId).single()
}

export async function createColorScheme(userId: string, scheme: Partial<ColorScheme>) {
  const supabase = createClient()
  return await supabase.from('color_schemes').insert({ user_id: userId, ...scheme }).select().single()
}

export async function updateColorScheme(schemeId: string, updates: Partial<ColorScheme>) {
  const supabase = createClient()
  return await supabase.from('color_schemes').update(updates).eq('id', schemeId).select().single()
}

export async function activateColorScheme(schemeId: string) {
  const supabase = createClient()
  return await supabase.from('color_schemes').update({ is_active: true }).eq('id', schemeId).select().single()
}

export async function toggleColorSchemeFavorite(schemeId: string, favorite: boolean) {
  const supabase = createClient()
  return await supabase.from('color_schemes').update({ is_favorite: favorite }).eq('id', schemeId).select().single()
}

export async function deleteColorScheme(schemeId: string) {
  const supabase = createClient()
  return await supabase.from('color_schemes').delete().eq('id', schemeId)
}

// FONT PREFERENCES
export async function getFontPreferences(userId: string, filters?: { is_active?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('font_preferences').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)
  return await query
}

export async function getActiveFontPreference(userId: string) {
  const supabase = createClient()
  return await supabase.from('font_preferences').select('*').eq('user_id', userId).eq('is_active', true).single()
}

export async function getFontPreference(preferenceId: string) {
  const supabase = createClient()
  return await supabase.from('font_preferences').select('*').eq('id', preferenceId).single()
}

export async function createFontPreference(userId: string, preference: Partial<FontPreference>) {
  const supabase = createClient()
  return await supabase.from('font_preferences').insert({ user_id: userId, ...preference }).select().single()
}

export async function updateFontPreference(preferenceId: string, updates: Partial<FontPreference>) {
  const supabase = createClient()
  return await supabase.from('font_preferences').update(updates).eq('id', preferenceId).select().single()
}

export async function activateFontPreference(preferenceId: string) {
  const supabase = createClient()
  return await supabase.from('font_preferences').update({ is_active: true }).eq('id', preferenceId).select().single()
}

export async function deleteFontPreference(preferenceId: string) {
  const supabase = createClient()
  return await supabase.from('font_preferences').delete().eq('id', preferenceId)
}

// CUSTOMIZATION HISTORY
export async function getCustomizationHistory(userId: string, filters?: { customization_type?: CustomizationType; limit?: number }) {
  const supabase = createClient()
  let query = supabase.from('customization_history').select('*').eq('user_id', userId).order('applied_at', { ascending: false })
  if (filters?.customization_type) query = query.eq('customization_type', filters.customization_type)
  if (filters?.limit) query = query.limit(filters.limit)
  return await query
}

export async function createCustomizationHistory(userId: string, history: Partial<CustomizationHistory>) {
  const supabase = createClient()
  return await supabase.from('customization_history').insert({ user_id: userId, ...history }).select().single()
}

export async function getRecentCustomizations(userId: string, limit: number = 10) {
  const supabase = createClient()
  return await supabase.from('customization_history').select('*').eq('user_id', userId).order('applied_at', { ascending: false }).limit(limit)
}

// STATS
export async function getAppearanceStats(userId: string) {
  const supabase = createClient()
  const [customizationsResult, presetsResult, snippetsResult, schemesResult, fontsResult, historyResult] = await Promise.all([
    supabase.from('theme_customizations').select('id, customization_type, is_active').eq('user_id', userId),
    supabase.from('theme_presets').select('id, preset_category, usage_count').eq('user_id', userId),
    supabase.from('custom_css_snippets').select('id, is_enabled', { count: 'exact' }).eq('user_id', userId),
    supabase.from('color_schemes').select('id, scheme_type, is_active, is_favorite').eq('user_id', userId),
    supabase.from('font_preferences').select('id, is_active', { count: 'exact' }).eq('user_id', userId),
    supabase.from('customization_history').select('id, customization_type').eq('user_id', userId)
  ])

  const activeCustomizations = customizationsResult.data?.filter(c => c.is_active).length || 0
  const enabledSnippets = snippetsResult.data?.filter(s => s.is_enabled).length || 0
  const activeSchemes = schemesResult.data?.filter(s => s.is_active).length || 0
  const favoriteSchemes = schemesResult.data?.filter(s => s.is_favorite).length || 0
  const activeFonts = fontsResult.data?.filter(f => f.is_active).length || 0
  const totalPresetUsage = presetsResult.data?.reduce((sum, p) => sum + (p.usage_count || 0), 0) || 0

  // Customization type breakdown
  const customizationTypeBreakdown = customizationsResult.data?.reduce((acc, c) => {
    acc[c.customization_type] = (acc[c.customization_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Preset category breakdown
  const presetCategoryBreakdown = presetsResult.data?.reduce((acc, p) => {
    acc[p.preset_category] = (acc[p.preset_category] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // History type breakdown
  const historyTypeBreakdown = historyResult.data?.reduce((acc, h) => {
    acc[h.customization_type] = (acc[h.customization_type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    data: {
      total_customizations: customizationsResult.count || 0,
      active_customizations: activeCustomizations,
      customization_type_breakdown: customizationTypeBreakdown,
      total_presets: presetsResult.count || 0,
      preset_category_breakdown: presetCategoryBreakdown,
      total_preset_usage: totalPresetUsage,
      total_css_snippets: snippetsResult.count || 0,
      enabled_snippets: enabledSnippets,
      total_color_schemes: schemesResult.count || 0,
      active_schemes: activeSchemes,
      favorite_schemes: favoriteSchemes,
      total_fonts: fontsResult.count || 0,
      active_fonts: activeFonts,
      total_changes: historyResult.count || 0,
      history_type_breakdown: historyTypeBreakdown
    },
    error: customizationsResult.error || presetsResult.error || snippetsResult.error || schemesResult.error || fontsResult.error || historyResult.error
  }
}

export async function getAppearanceDashboard(userId: string) {
  const supabase = createClient()
  const [statsResult, activeCustomization, activeScheme, enabledSnippets, recentHistory] = await Promise.all([
    getAppearanceStats(userId),
    getActiveThemeCustomization(userId),
    getActiveColorScheme(userId),
    supabase.from('custom_css_snippets').select('*').eq('user_id', userId).eq('is_enabled', true).order('order_index'),
    getRecentCustomizations(userId, 10)
  ])

  return {
    data: {
      stats: statsResult.data,
      active_customization: activeCustomization.data,
      active_color_scheme: activeScheme.data,
      enabled_snippets: enabledSnippets.data || [],
      recent_history: recentHistory.data || []
    },
    error: statsResult.error || activeCustomization.error || activeScheme.error || enabledSnippets.error || recentHistory.error
  }
}
