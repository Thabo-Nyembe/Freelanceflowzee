// Mobile App Management - Supabase Queries
// Comprehensive queries for mobile devices, screens, builds, templates, and testing

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type DeviceCategory = 'phone' | 'tablet' | 'wearable' | 'tv' | 'desktop'
export type OrientationType = 'portrait' | 'landscape' | 'auto'
export type BuildStatus = 'pending' | 'building' | 'success' | 'failed' | 'cancelled'
export type PlatformType = 'ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux'
export type TemplateCategory = 'social' | 'ecommerce' | 'finance' | 'productivity' | 'health' | 'music' | 'education' | 'travel' | 'food' | 'news'

export interface MobileDevice {
  id: string
  user_id: string
  device_name: string
  device_model: string
  device_category: DeviceCategory
  screen_width: number
  screen_height: number
  pixel_ratio: number
  aspect_ratio: string
  platform: PlatformType
  os_version?: string
  browser?: string
  browser_version?: string
  is_favorite: boolean
  default_orientation: OrientationType
  total_tests: number
  total_previews: number
  last_used_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MobileAppScreen {
  id: string
  user_id: string
  screen_name: string
  screen_type: string
  component_name: string
  background_color?: string
  theme: string
  layout_type?: string
  elements: any[]
  navigation: Record<string, any>
  data_binding: Record<string, any>
  preview_url?: string
  screenshot_url?: string
  orientation: OrientationType
  tags: string[]
  notes?: string
  preview_count: number
  export_count: number
  is_published: boolean
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface MobileAppBuild {
  id: string
  user_id: string
  build_name: string
  build_number: string
  version: string
  platform: PlatformType
  target_sdk?: string
  min_sdk?: string
  app_id: string
  app_name: string
  icon_url?: string
  splash_url?: string
  included_screens: string[]
  entry_screen?: string
  build_status: BuildStatus
  build_config: Record<string, any>
  build_output_url?: string
  build_size?: number
  build_log?: string
  error_message?: string
  build_started_at?: string
  build_completed_at?: string
  build_duration_seconds?: number
  is_distributed: boolean
  distribution_url?: string
  qr_code_url?: string
  download_count: number
  install_count: number
  created_at: string
  updated_at: string
}

export interface MobileAppTemplate {
  id: string
  user_id?: string
  template_name: string
  display_name: string
  description: string
  category: TemplateCategory
  preview_image_url?: string
  preview_video_url?: string
  demo_url?: string
  features: string[]
  screens: string[]
  default_config: Record<string, any>
  color_scheme: Record<string, any>
  typography: Record<string, any>
  supported_platforms: PlatformType[]
  is_published: boolean
  is_premium: boolean
  price?: number
  usage_count: number
  rating: number
  total_reviews: number
  tags: string[]
  author_name?: string
  license?: string
  created_at: string
  updated_at: string
}

export interface MobileAppTesting {
  id: string
  user_id: string
  test_name: string
  test_type: string
  screen_id?: string
  device_id?: string
  build_id?: string
  test_config: Record<string, any>
  test_steps: any[]
  status: string
  result: Record<string, any>
  duration_ms?: number
  passed_checks: number
  failed_checks: number
  warnings: number
  screenshots: string[]
  video_url?: string
  errors: any[]
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// MOBILE DEVICES - CRUD
// ============================================================================

export async function createDevice(userId: string, deviceData: Partial<MobileDevice>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .insert({
      user_id: userId,
      ...deviceData
    })
    .select()
    .single()

  if (error) throw error
  return data as MobileDevice
}

export async function getDevice(deviceId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .select('*')
    .eq('id', deviceId)
    .single()

  if (error) throw error
  return data as MobileDevice
}

export async function getDevicesByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_used_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as MobileDevice[]
}

export async function updateDevice(deviceId: string, updates: Partial<MobileDevice>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .update(updates)
    .eq('id', deviceId)
    .select()
    .single()

  if (error) throw error
  return data as MobileDevice
}

export async function deleteDevice(deviceId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('mobile_devices')
    .delete()
    .eq('id', deviceId)

  if (error) throw error
  return true
}

// ============================================================================
// MOBILE DEVICES - FILTERS & QUERIES
// ============================================================================

export async function getDevicesByCategory(userId: string, category: DeviceCategory) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('device_category', category)
    .order('device_name', { ascending: true })

  if (error) throw error
  return data as MobileDevice[]
}

export async function getDevicesByPlatform(userId: string, platform: PlatformType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .order('device_name', { ascending: true })

  if (error) throw error
  return data as MobileDevice[]
}

export async function getFavoriteDevices(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_devices')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('last_used_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as MobileDevice[]
}

export async function toggleDeviceFavorite(deviceId: string, isFavorite: boolean) {
  return updateDevice(deviceId, { is_favorite: isFavorite })
}

export async function incrementDevicePreview(deviceId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('increment', { row_id: deviceId, table_name: 'mobile_devices', column_name: 'total_previews' })

  if (error) throw error
  return data
}

// ============================================================================
// MOBILE APP SCREENS - CRUD
// ============================================================================

export async function createScreen(userId: string, screenData: Partial<MobileAppScreen>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .insert({
      user_id: userId,
      ...screenData
    })
    .select()
    .single()

  if (error) throw error
  return data as MobileAppScreen
}

export async function getScreen(screenId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .select('*')
    .eq('id', screenId)
    .single()

  if (error) throw error
  return data as MobileAppScreen
}

export async function getScreensByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppScreen[]
}

export async function updateScreen(screenId: string, updates: Partial<MobileAppScreen>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .update(updates)
    .eq('id', screenId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppScreen
}

export async function deleteScreen(screenId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('mobile_app_screens')
    .delete()
    .eq('id', screenId)

  if (error) throw error
  return true
}

// ============================================================================
// MOBILE APP SCREENS - FILTERS & QUERIES
// ============================================================================

export async function getScreensByType(userId: string, screenType: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .select('*')
    .eq('user_id', userId)
    .eq('screen_type', screenType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppScreen[]
}

export async function getPublishedScreens(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .select('*')
    .eq('user_id', userId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppScreen[]
}

export async function getScreenTemplates(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .select('*')
    .eq('user_id', userId)
    .eq('is_template', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppScreen[]
}

export async function searchScreensByTag(userId: string, tag: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', [tag])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppScreen[]
}

export async function incrementScreenPreview(screenId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .update({ preview_count: supabase.raw('preview_count + 1') })
    .eq('id', screenId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppScreen
}

export async function incrementScreenExport(screenId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_screens')
    .update({ export_count: supabase.raw('export_count + 1') })
    .eq('id', screenId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppScreen
}

// ============================================================================
// MOBILE APP BUILDS - CRUD
// ============================================================================

export async function createBuild(userId: string, buildData: Partial<MobileAppBuild>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .insert({
      user_id: userId,
      build_started_at: buildData.build_status === 'building' ? new Date().toISOString() : undefined,
      ...buildData
    })
    .select()
    .single()

  if (error) throw error
  return data as MobileAppBuild
}

export async function getBuild(buildId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .select('*')
    .eq('id', buildId)
    .single()

  if (error) throw error
  return data as MobileAppBuild
}

export async function getBuildsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppBuild[]
}

export async function updateBuild(buildId: string, updates: Partial<MobileAppBuild>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .update(updates)
    .eq('id', buildId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppBuild
}

export async function deleteBuild(buildId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('mobile_app_builds')
    .delete()
    .eq('id', buildId)

  if (error) throw error
  return true
}

// ============================================================================
// MOBILE APP BUILDS - STATUS & OPERATIONS
// ============================================================================

export async function startBuild(buildId: string) {
  return updateBuild(buildId, {
    build_status: 'building',
    build_started_at: new Date().toISOString()
  })
}

export async function completeBuild(buildId: string, outputUrl: string, buildSize: number) {
  return updateBuild(buildId, {
    build_status: 'success',
    build_output_url: outputUrl,
    build_size: buildSize,
    build_completed_at: new Date().toISOString()
  })
}

export async function failBuild(buildId: string, errorMessage: string, buildLog?: string) {
  return updateBuild(buildId, {
    build_status: 'failed',
    error_message: errorMessage,
    build_log: buildLog,
    build_completed_at: new Date().toISOString()
  })
}

export async function cancelBuild(buildId: string) {
  return updateBuild(buildId, {
    build_status: 'cancelled'
  })
}

export async function getBuildsByStatus(userId: string, status: BuildStatus) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('build_status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppBuild[]
}

export async function getBuildsByPlatform(userId: string, platform: PlatformType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppBuild[]
}

export async function getDistributedBuilds(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('is_distributed', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppBuild[]
}

export async function incrementBuildDownload(buildId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .update({ download_count: supabase.raw('download_count + 1') })
    .eq('id', buildId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppBuild
}

export async function incrementBuildInstall(buildId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_builds')
    .update({ install_count: supabase.raw('install_count + 1') })
    .eq('id', buildId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppBuild
}

// ============================================================================
// MOBILE APP TEMPLATES - CRUD
// ============================================================================

export async function createTemplate(templateData: Partial<MobileAppTemplate>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .insert(templateData)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppTemplate
}

export async function getTemplate(templateId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data as MobileAppTemplate
}

export async function getAllTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as MobileAppTemplate[]
}

export async function updateTemplate(templateId: string, updates: Partial<MobileAppTemplate>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppTemplate
}

export async function deleteTemplate(templateId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('mobile_app_templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
  return true
}

// ============================================================================
// MOBILE APP TEMPLATES - FILTERS & QUERIES
// ============================================================================

export async function getPublishedTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('is_published', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as MobileAppTemplate[]
}

export async function getTemplatesByCategory(category: TemplateCategory) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('category', category)
    .eq('is_published', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data as MobileAppTemplate[]
}

export async function getPremiumTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('is_premium', true)
    .eq('is_published', true)
    .order('rating', { ascending: false })

  if (error) throw error
  return data as MobileAppTemplate[]
}

export async function getFreeTemplates() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('is_premium', false)
    .eq('is_published', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as MobileAppTemplate[]
}

export async function getTopRatedTemplates(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('is_published', true)
    .order('rating', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as MobileAppTemplate[]
}

export async function getMostUsedTemplates(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_templates')
    .select('*')
    .eq('is_published', true)
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as MobileAppTemplate[]
}

// ============================================================================
// MOBILE APP TESTING - CRUD
// ============================================================================

export async function createTest(userId: string, testData: Partial<MobileAppTesting>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .insert({
      user_id: userId,
      ...testData
    })
    .select()
    .single()

  if (error) throw error
  return data as MobileAppTesting
}

export async function getTest(testId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('id', testId)
    .single()

  if (error) throw error
  return data as MobileAppTesting
}

export async function getTestsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppTesting[]
}

export async function updateTest(testId: string, updates: Partial<MobileAppTesting>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .update(updates)
    .eq('id', testId)
    .select()
    .single()

  if (error) throw error
  return data as MobileAppTesting
}

export async function deleteTest(testId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('mobile_app_testing')
    .delete()
    .eq('id', testId)

  if (error) throw error
  return true
}

// ============================================================================
// MOBILE APP TESTING - TEST OPERATIONS
// ============================================================================

export async function startTest(testId: string) {
  return updateTest(testId, {
    status: 'running',
    started_at: new Date().toISOString()
  })
}

export async function passTest(testId: string, passedChecks: number, result: Record<string, any>) {
  return updateTest(testId, {
    status: 'passed',
    passed_checks: passedChecks,
    result,
    completed_at: new Date().toISOString()
  })
}

export async function failTest(testId: string, failedChecks: number, errors: any[], result: Record<string, any>) {
  return updateTest(testId, {
    status: 'failed',
    failed_checks: failedChecks,
    errors,
    result,
    completed_at: new Date().toISOString()
  })
}

export async function getTestsByScreen(screenId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('screen_id', screenId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppTesting[]
}

export async function getTestsByDevice(deviceId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('device_id', deviceId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppTesting[]
}

export async function getTestsByBuild(buildId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('build_id', buildId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppTesting[]
}

export async function getTestsByType(userId: string, testType: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('user_id', userId)
    .eq('test_type', testType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppTesting[]
}

export async function getTestsByStatus(userId: string, status: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('mobile_app_testing')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as MobileAppTesting[]
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getMobileAppStats(userId: string) {
  const supabase = createClient()

  const [
    devicesResult,
    screensResult,
    buildsResult,
    testsResult
  ] = await Promise.all([
    supabase.from('mobile_devices').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_app_screens').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_app_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_app_testing').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  return {
    total_devices: devicesResult.count || 0,
    total_screens: screensResult.count || 0,
    total_builds: buildsResult.count || 0,
    total_tests: testsResult.count || 0
  }
}

export async function getDeviceStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    favoriteResult,
    byCategory,
    byPlatform
  ] = await Promise.all([
    supabase.from('mobile_devices').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_devices').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_favorite', true),
    supabase.from('mobile_devices').select('device_category').eq('user_id', userId),
    supabase.from('mobile_devices').select('platform').eq('user_id', userId)
  ])

  return {
    total_devices: totalResult.count || 0,
    favorite_devices: favoriteResult.count || 0,
    by_category: groupByField(byCategory.data || [], 'device_category'),
    by_platform: groupByField(byPlatform.data || [], 'platform')
  }
}

export async function getScreenStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    publishedResult,
    templatesResult,
    byType
  ] = await Promise.all([
    supabase.from('mobile_app_screens').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_app_screens').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_published', true),
    supabase.from('mobile_app_screens').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_template', true),
    supabase.from('mobile_app_screens').select('screen_type').eq('user_id', userId)
  ])

  return {
    total_screens: totalResult.count || 0,
    published_screens: publishedResult.count || 0,
    template_screens: templatesResult.count || 0,
    by_type: groupByField(byType.data || [], 'screen_type')
  }
}

export async function getBuildStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    successResult,
    failedResult,
    distributedResult,
    byPlatform,
    byStatus
  ] = await Promise.all([
    supabase.from('mobile_app_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_app_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('build_status', 'success'),
    supabase.from('mobile_app_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('build_status', 'failed'),
    supabase.from('mobile_app_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_distributed', true),
    supabase.from('mobile_app_builds').select('platform').eq('user_id', userId),
    supabase.from('mobile_app_builds').select('build_status').eq('user_id', userId)
  ])

  return {
    total_builds: totalResult.count || 0,
    successful_builds: successResult.count || 0,
    failed_builds: failedResult.count || 0,
    distributed_builds: distributedResult.count || 0,
    by_platform: groupByField(byPlatform.data || [], 'platform'),
    by_status: groupByField(byStatus.data || [], 'build_status')
  }
}

export async function getTestStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    passedResult,
    failedResult,
    byType,
    byStatus
  ] = await Promise.all([
    supabase.from('mobile_app_testing').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('mobile_app_testing').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'passed'),
    supabase.from('mobile_app_testing').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'failed'),
    supabase.from('mobile_app_testing').select('test_type').eq('user_id', userId),
    supabase.from('mobile_app_testing').select('status').eq('user_id', userId)
  ])

  return {
    total_tests: totalResult.count || 0,
    passed_tests: passedResult.count || 0,
    failed_tests: failedResult.count || 0,
    by_type: groupByField(byType.data || [], 'test_type'),
    by_status: groupByField(byStatus.data || [], 'status')
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
