'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('desktop-apps-actions')

export async function createDesktopApp(data: {
  app_name: string
  app_version: string
  platform: string
  build_number?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .insert({
        user_id: user.id,
        ...data,
        build_status: 'pending',
        build_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create desktop app', { error: error.message, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('Desktop app created successfully', { appId: app.id })
    return actionSuccess(app, 'Desktop app created successfully')
  } catch (error) {
    logger.error('Unexpected error creating desktop app', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordInstall(id: string, platform: 'windows' | 'macos' | 'linux'): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('desktop_apps')
      .select('total_installs, windows_installs, macos_installs, linux_installs, active_users')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const updateData: any = {
      total_installs: (current?.total_installs || 0) + 1,
      active_users: (current?.active_users || 0) + 1
    }

    if (platform === 'windows') {
      updateData.windows_installs = (current?.windows_installs || 0) + 1
    } else if (platform === 'macos') {
      updateData.macos_installs = (current?.macos_installs || 0) + 1
    } else if (platform === 'linux') {
      updateData.linux_installs = (current?.linux_installs || 0) + 1
    }

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record install', { error: error.message, id, platform })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('Install recorded successfully', { appId: id, platform })
    return actionSuccess(app, 'Install recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording install', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateBuildStatus(id: string, status: string, releaseNotes?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updateData: any = { build_status: status }

    if (status === 'stable') {
      updateData.release_date = new Date().toISOString()
    }

    if (releaseNotes) {
      updateData.release_notes = releaseNotes
    }

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update build status', { error: error.message, id, status })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('Build status updated successfully', { appId: id, status })
    return actionSuccess(app, 'Build status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating build status', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updatePerformanceMetrics(id: string, metrics: {
  startup_time_ms?: number
  memory_usage_mb?: number
  cpu_usage_percent?: number
  crash_rate?: number
}): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Calculate performance score based on metrics
    let performanceScore = 100

    if (metrics.startup_time_ms) {
      performanceScore -= Math.min(metrics.startup_time_ms / 100, 20)
    }

    if (metrics.memory_usage_mb) {
      performanceScore -= Math.min(metrics.memory_usage_mb / 50, 20)
    }

    if (metrics.crash_rate) {
      performanceScore -= Math.min(metrics.crash_rate * 1000, 30)
    }

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .update({
        ...metrics,
        performance_score: parseFloat(Math.max(performanceScore, 0).toFixed(2))
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update performance metrics', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('Performance metrics updated successfully', { appId: id })
    return actionSuccess(app, 'Performance metrics updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating performance metrics', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateUserRating(id: string, rating: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('desktop_apps')
      .select('user_rating, review_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const currentTotal = (current?.user_rating || 0) * (current?.review_count || 0)
    const newReviewCount = (current?.review_count || 0) + 1
    const newRating = parseFloat(((currentTotal + rating) / newReviewCount).toFixed(2))

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .update({
        user_rating: newRating,
        review_count: newReviewCount
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update user rating', { error: error.message, id, rating })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('User rating updated successfully', { appId: id, newRating })
    return actionSuccess(app, 'User rating updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating user rating', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function reportIssue(id: string, isCritical: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('desktop_apps')
      .select('known_issues, critical_bugs, open_tickets')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const updateData: any = {
      known_issues: (current?.known_issues || 0) + 1,
      open_tickets: (current?.open_tickets || 0) + 1
    }

    if (isCritical) {
      updateData.critical_bugs = (current?.critical_bugs || 0) + 1
    }

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to report issue', { error: error.message, id, isCritical })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('Issue reported successfully', { appId: id, isCritical })
    return actionSuccess(app, 'Issue reported successfully')
  } catch (error) {
    logger.error('Unexpected error reporting issue', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function trackActiveUsers(id: string, dailyActive: number, monthlyActive: number): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: current } = await supabase
      .from('desktop_apps')
      .select('total_installs')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    const adoptionRate = current?.total_installs
      ? parseFloat(((monthlyActive / current.total_installs) * 100).toFixed(2))
      : 0

    const retentionRate = monthlyActive > 0
      ? parseFloat(((dailyActive / monthlyActive) * 100).toFixed(2))
      : 0

    const { data: app, error } = await supabase
      .from('desktop_apps')
      .update({
        daily_active_users: dailyActive,
        monthly_active_users: monthlyActive,
        adoption_rate: adoptionRate,
        retention_rate: retentionRate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to track active users', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/desktop-app-v2')
    logger.info('Active users tracked successfully', { appId: id, dailyActive, monthlyActive })
    return actionSuccess(app, 'Active users tracked successfully')
  } catch (error) {
    logger.error('Unexpected error tracking active users', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
