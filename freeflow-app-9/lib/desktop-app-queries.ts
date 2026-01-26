// Desktop App Management - Supabase Queries
// Comprehensive queries for desktop projects, builds, distributions, frameworks, and analytics

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type DesktopOS = 'windows' | 'macos' | 'linux' | 'cross_platform'
export type DesktopCategory = 'laptop' | 'desktop' | 'workstation' | 'all_in_one'
export type FrameworkType = 'electron' | 'tauri' | 'flutter' | 'native' | 'pwa' | 'qt' | 'swing' | 'wpf'
export type BuildType = 'development' | 'production' | 'beta' | 'alpha' | 'release_candidate'
export type DistributionChannel = 'app_store' | 'microsoft_store' | 'snap' | 'homebrew' | 'direct_download' | 'enterprise'

export interface DesktopProject {
  id: string
  user_id: string
  project_name: string
  display_name: string
  description?: string
  icon_url?: string
  target_os: DesktopOS
  supported_versions: string[]
  framework: FrameworkType
  framework_version?: string
  window_width: number
  window_height: number
  resizable: boolean
  fullscreen_capable: boolean
  always_on_top: boolean
  min_width?: number
  min_height?: number
  max_width?: number
  max_height?: number
  transparent: boolean
  frame: boolean
  app_id: string
  version: string
  license?: string
  source_url?: string
  entry_point?: string
  dependencies: Record<string, JsonValue>
  dev_dependencies: Record<string, JsonValue>
  build_config: Record<string, JsonValue>
  total_builds: number
  last_build_at?: string
  is_archived: boolean
  is_template: boolean
  tags: string[]
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface DesktopBuild {
  id: string
  user_id: string
  project_id: string
  build_number: string
  build_type: BuildType
  version: string
  target_os: DesktopOS
  architecture: string
  status: string
  output_path?: string
  output_size?: number
  installer_url?: string
  portable_url?: string
  is_signed: boolean
  signing_certificate?: string
  signature_timestamp?: string
  build_log?: string
  error_message?: string
  warnings: string[]
  started_at?: string
  completed_at?: string
  duration_seconds?: number
  build_machine?: string
  build_environment: Record<string, JsonValue>
  download_count: number
  install_count: number
  created_at: string
  updated_at: string
}

export interface DesktopDistribution {
  id: string
  user_id: string
  build_id: string
  channel: DistributionChannel
  channel_url?: string
  status: string
  submitted_at?: string
  review_notes?: string
  rejection_reason?: string
  published_at?: string
  is_active: boolean
  version: string
  release_notes?: string
  changelog?: string
  screenshots: string[]
  promotional_images: string[]
  app_description?: string
  keywords: string[]
  minimum_os_version?: string
  required_disk_space?: number
  required_ram?: number
  total_downloads: number
  total_installs: number
  active_users: number
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface DesktopFramework {
  id: string
  framework_name: FrameworkType
  display_name: string
  description: string
  official_url?: string
  documentation_url?: string
  latest_version: string
  stable_version: string
  min_version?: string
  supported_os: DesktopOS[]
  features: string[]
  requires_node: boolean
  requires_rust: boolean
  requires_python: boolean
  min_node_version?: string
  min_rust_version?: string
  starter_templates: JsonValue[]
  usage_count: number
  project_count: number
  github_stars?: number
  npm_downloads?: number
  is_active: boolean
  is_recommended: boolean
  created_at: string
  updated_at: string
}

export interface DesktopAnalytics {
  id: string
  user_id: string
  project_id?: string
  build_id?: string
  event_type: string
  event_name: string
  event_data: Record<string, JsonValue>
  session_id?: string
  session_duration_seconds?: number
  os_version?: string
  app_version?: string
  architecture?: string
  cpu_model?: string
  total_ram?: number
  screen_resolution?: string
  country?: string
  city?: string
  timezone?: string
  event_timestamp: string
  created_at: string
}

// ============================================================================
// DESKTOP PROJECTS - CRUD
// ============================================================================

export async function createProject(userId: string, projectData: Partial<DesktopProject>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .insert({
      user_id: userId,
      ...projectData
    })
    .select()
    .single()

  if (error) throw error
  return data as DesktopProject
}

export async function getProject(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data as DesktopProject
}

export async function getProjectsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DesktopProject[]
}

export async function updateProject(projectId: string, updates: Partial<DesktopProject>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data as DesktopProject
}

export async function deleteProject(projectId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('desktop_projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
  return true
}

// ============================================================================
// DESKTOP PROJECTS - FILTERS & QUERIES
// ============================================================================

export async function getProjectsByOS(userId: string, os: DesktopOS) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('target_os', os)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DesktopProject[]
}

export async function getProjectsByFramework(userId: string, framework: FrameworkType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('framework', framework)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DesktopProject[]
}

export async function getArchivedProjects(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', true)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DesktopProject[]
}

export async function getProjectTemplates(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_template', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopProject[]
}

export async function archiveProject(projectId: string) {
  return updateProject(projectId, { is_archived: true })
}

export async function unarchiveProject(projectId: string) {
  return updateProject(projectId, { is_archived: false })
}

export async function searchProjectsByTag(userId: string, tag: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_projects')
    .select('*')
    .eq('user_id', userId)
    .contains('tags', [tag])
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as DesktopProject[]
}

// ============================================================================
// DESKTOP BUILDS - CRUD
// ============================================================================

export async function createBuild(userId: string, buildData: Partial<DesktopBuild>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .insert({
      user_id: userId,
      started_at: buildData.status === 'building' ? new Date().toISOString() : undefined,
      ...buildData
    })
    .select()
    .single()

  if (error) throw error
  return data as DesktopBuild
}

export async function getBuild(buildId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('id', buildId)
    .single()

  if (error) throw error
  return data as DesktopBuild
}

export async function getBuildsByProject(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopBuild[]
}

export async function getBuildsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopBuild[]
}

export async function updateBuild(buildId: string, updates: Partial<DesktopBuild>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .update(updates)
    .eq('id', buildId)
    .select()
    .single()

  if (error) throw error
  return data as DesktopBuild
}

export async function deleteBuild(buildId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('desktop_builds')
    .delete()
    .eq('id', buildId)

  if (error) throw error
  return true
}

// ============================================================================
// DESKTOP BUILDS - BUILD OPERATIONS
// ============================================================================

export async function startBuild(buildId: string) {
  return updateBuild(buildId, {
    status: 'building',
    started_at: new Date().toISOString()
  })
}

export async function completeBuild(buildId: string, installerUrl: string, outputSize: number, portableUrl?: string) {
  return updateBuild(buildId, {
    status: 'success',
    installer_url: installerUrl,
    output_size: outputSize,
    portable_url: portableUrl,
    completed_at: new Date().toISOString()
  })
}

export async function failBuild(buildId: string, errorMessage: string, buildLog?: string) {
  return updateBuild(buildId, {
    status: 'failed',
    error_message: errorMessage,
    build_log: buildLog,
    completed_at: new Date().toISOString()
  })
}

export async function cancelBuild(buildId: string) {
  return updateBuild(buildId, {
    status: 'cancelled',
    completed_at: new Date().toISOString()
  })
}

export async function signBuild(buildId: string, certificate: string) {
  return updateBuild(buildId, {
    is_signed: true,
    signing_certificate: certificate,
    signature_timestamp: new Date().toISOString()
  })
}

export async function getBuildsByStatus(userId: string, status: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopBuild[]
}

export async function getBuildsByType(userId: string, buildType: BuildType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('build_type', buildType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopBuild[]
}

export async function getSuccessfulBuilds(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('project_id', projectId)
    .eq('status', 'success')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopBuild[]
}

export async function getSignedBuilds(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_builds')
    .select('*')
    .eq('user_id', userId)
    .eq('is_signed', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopBuild[]
}

// ============================================================================
// DESKTOP DISTRIBUTIONS - CRUD
// ============================================================================

export async function createDistribution(userId: string, distributionData: Partial<DesktopDistribution>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .insert({
      user_id: userId,
      ...distributionData
    })
    .select()
    .single()

  if (error) throw error
  return data as DesktopDistribution
}

export async function getDistribution(distributionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .select('*')
    .eq('id', distributionId)
    .single()

  if (error) throw error
  return data as DesktopDistribution
}

export async function getDistributionsByBuild(buildId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .select('*')
    .eq('build_id', buildId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopDistribution[]
}

export async function getDistributionsByUser(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopDistribution[]
}

export async function updateDistribution(distributionId: string, updates: Partial<DesktopDistribution>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .update(updates)
    .eq('id', distributionId)
    .select()
    .single()

  if (error) throw error
  return data as DesktopDistribution
}

export async function deleteDistribution(distributionId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('desktop_distributions')
    .delete()
    .eq('id', distributionId)

  if (error) throw error
  return true
}

// ============================================================================
// DESKTOP DISTRIBUTIONS - OPERATIONS
// ============================================================================

export async function submitDistribution(distributionId: string, reviewNotes?: string) {
  return updateDistribution(distributionId, {
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    review_notes: reviewNotes
  })
}

export async function approveDistribution(distributionId: string) {
  return updateDistribution(distributionId, {
    status: 'approved'
  })
}

export async function rejectDistribution(distributionId: string, reason: string) {
  return updateDistribution(distributionId, {
    status: 'rejected',
    rejection_reason: reason
  })
}

export async function publishDistribution(distributionId: string) {
  return updateDistribution(distributionId, {
    status: 'published',
    published_at: new Date().toISOString(),
    is_active: true
  })
}

export async function unpublishDistribution(distributionId: string) {
  return updateDistribution(distributionId, {
    is_active: false
  })
}

export async function getDistributionsByChannel(userId: string, channel: DistributionChannel) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .select('*')
    .eq('user_id', userId)
    .eq('channel', channel)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as DesktopDistribution[]
}

export async function getActiveDistributions(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as DesktopDistribution[]
}

export async function incrementDistributionDownload(distributionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .update({ total_downloads: supabase.raw('total_downloads + 1') })
    .eq('id', distributionId)
    .select()
    .single()

  if (error) throw error
  return data as DesktopDistribution
}

export async function incrementDistributionInstall(distributionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_distributions')
    .update({ total_installs: supabase.raw('total_installs + 1') })
    .eq('id', distributionId)
    .select()
    .single()

  if (error) throw error
  return data as DesktopDistribution
}

// ============================================================================
// DESKTOP FRAMEWORKS - CRUD
// ============================================================================

export async function createFramework(frameworkData: Partial<DesktopFramework>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .insert(frameworkData)
    .select()
    .single()

  if (error) throw error
  return data as DesktopFramework
}

export async function getFramework(frameworkName: FrameworkType) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .select('*')
    .eq('framework_name', frameworkName)
    .single()

  if (error) throw error
  return data as DesktopFramework
}

export async function getAllFrameworks() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as DesktopFramework[]
}

export async function updateFramework(frameworkName: FrameworkType, updates: Partial<DesktopFramework>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .update(updates)
    .eq('framework_name', frameworkName)
    .select()
    .single()

  if (error) throw error
  return data as DesktopFramework
}

export async function deleteFramework(frameworkName: FrameworkType) {
  const supabase = createClient()
  const { error } = await supabase
    .from('desktop_frameworks')
    .delete()
    .eq('framework_name', frameworkName)

  if (error) throw error
  return true
}

// ============================================================================
// DESKTOP FRAMEWORKS - QUERIES
// ============================================================================

export async function getRecommendedFrameworks() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .select('*')
    .eq('is_active', true)
    .eq('is_recommended', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as DesktopFramework[]
}

export async function getMostUsedFrameworks(limit: number = 10) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as DesktopFramework[]
}

export async function getFrameworksByOS(os: DesktopOS) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_frameworks')
    .select('*')
    .eq('is_active', true)
    .contains('supported_os', [os])
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data as DesktopFramework[]
}

// ============================================================================
// DESKTOP ANALYTICS - CRUD
// ============================================================================

export async function trackEvent(userId: string, eventData: Partial<DesktopAnalytics>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_analytics')
    .insert({
      user_id: userId,
      event_timestamp: new Date().toISOString(),
      ...eventData
    })
    .select()
    .single()

  if (error) throw error
  return data as DesktopAnalytics
}

export async function getAnalyticsByProject(projectId: string, limit: number = 100) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_analytics')
    .select('*')
    .eq('project_id', projectId)
    .order('event_timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as DesktopAnalytics[]
}

export async function getAnalyticsByEventType(projectId: string, eventType: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_analytics')
    .select('*')
    .eq('project_id', projectId)
    .eq('event_type', eventType)
    .order('event_timestamp', { ascending: false })

  if (error) throw error
  return data as DesktopAnalytics[]
}

export async function getAnalyticsBySession(sessionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('desktop_analytics')
    .select('*')
    .eq('session_id', sessionId)
    .order('event_timestamp', { ascending: true })

  if (error) throw error
  return data as DesktopAnalytics[]
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

export async function getDesktopAppStats(userId: string) {
  const supabase = createClient()

  const [
    projectsResult,
    buildsResult,
    distributionsResult,
    analyticsResult
  ] = await Promise.all([
    supabase.from('desktop_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_archived', false),
    supabase.from('desktop_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('desktop_distributions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('desktop_analytics').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  return {
    total_projects: projectsResult.count || 0,
    total_builds: buildsResult.count || 0,
    total_distributions: distributionsResult.count || 0,
    total_events: analyticsResult.count || 0
  }
}

export async function getProjectStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    archivedResult,
    templatesResult,
    byOS,
    byFramework
  ] = await Promise.all([
    supabase.from('desktop_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('desktop_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_archived', true),
    supabase.from('desktop_projects').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_template', true),
    supabase.from('desktop_projects').select('target_os').eq('user_id', userId),
    supabase.from('desktop_projects').select('framework').eq('user_id', userId)
  ])

  return {
    total_projects: totalResult.count || 0,
    archived_projects: archivedResult.count || 0,
    template_projects: templatesResult.count || 0,
    by_os: groupByField(byOS.data || [], 'target_os'),
    by_framework: groupByField(byFramework.data || [], 'framework')
  }
}

export async function getBuildStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    successResult,
    failedResult,
    signedResult,
    byType,
    byStatus
  ] = await Promise.all([
    supabase.from('desktop_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('desktop_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'success'),
    supabase.from('desktop_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'failed'),
    supabase.from('desktop_builds').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_signed', true),
    supabase.from('desktop_builds').select('build_type').eq('user_id', userId),
    supabase.from('desktop_builds').select('status').eq('user_id', userId)
  ])

  return {
    total_builds: totalResult.count || 0,
    successful_builds: successResult.count || 0,
    failed_builds: failedResult.count || 0,
    signed_builds: signedResult.count || 0,
    by_type: groupByField(byType.data || [], 'build_type'),
    by_status: groupByField(byStatus.data || [], 'status')
  }
}

export async function getDistributionStats(userId: string) {
  const supabase = createClient()

  const [
    totalResult,
    activeResult,
    publishedResult,
    byChannel,
    byStatus
  ] = await Promise.all([
    supabase.from('desktop_distributions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('desktop_distributions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_active', true),
    supabase.from('desktop_distributions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'published'),
    supabase.from('desktop_distributions').select('channel').eq('user_id', userId),
    supabase.from('desktop_distributions').select('status').eq('user_id', userId)
  ])

  return {
    total_distributions: totalResult.count || 0,
    active_distributions: activeResult.count || 0,
    published_distributions: publishedResult.count || 0,
    by_channel: groupByField(byChannel.data || [], 'channel'),
    by_status: groupByField(byStatus.data || [], 'status')
  }
}

// Helper function to group results by field
interface GroupableRecord {
  [key: string]: string | number | boolean | null | undefined
}

function groupByField(data: GroupableRecord[], field: string): Record<string, number> {
  return data.reduce<Record<string, number>>((acc, item) => {
    const key = String(item[field] ?? 'unknown')
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}
