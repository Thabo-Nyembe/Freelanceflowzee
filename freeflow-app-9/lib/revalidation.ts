/**
 * Modern Next.js 14 Revalidation Utilities
 *
 * Server Actions for on-demand revalidation following Next.js 14 patterns:
 * - revalidateTag() for selective cache invalidation
 * - revalidatePath() for route-based invalidation
 * - Type-safe revalidation helpers
 */

'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Revalidation')

/**
 * Revalidate user data after profile updates
 */
export async function revalidateUser(userId: string) {
  logger.info('Revalidating user data', { userId })

  try {
    revalidateTag(`user-${userId}`)
    logger.debug('User data revalidated', { userId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate user', { userId, error })
    return { success: false, error: 'Failed to revalidate user data' }
  }
}

/**
 * Revalidate project data after updates
 */
export async function revalidateProject(projectId: string) {
  logger.info('Revalidating project', { projectId })

  try {
    revalidateTag(`project-${projectId}`)
    revalidateTag('projects') // Also invalidate projects list
    logger.debug('Project revalidated', { projectId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate project', { projectId, error })
    return { success: false, error: 'Failed to revalidate project' }
  }
}

/**
 * Revalidate all projects for a user
 */
export async function revalidateUserProjects(userId: string) {
  logger.info('Revalidating user projects', { userId })

  try {
    revalidateTag(`projects-${userId}`)
    logger.debug('User projects revalidated', { userId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate user projects', { userId, error })
    return { success: false, error: 'Failed to revalidate projects' }
  }
}

/**
 * Revalidate client data including projects
 */
export async function revalidateClient(clientId: string) {
  logger.info('Revalidating client data', { clientId })

  try {
    revalidateTag(`client-${clientId}`)
    revalidateTag('client-projects')
    logger.debug('Client data revalidated', { clientId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate client', { clientId, error })
    return { success: false, error: 'Failed to revalidate client data' }
  }
}

/**
 * Revalidate team data
 */
export async function revalidateTeam(teamId: string) {
  logger.info('Revalidating team data', { teamId })

  try {
    revalidateTag(`team-${teamId}`)
    revalidateTag('team-members')
    logger.debug('Team data revalidated', { teamId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate team', { teamId, error })
    return { success: false, error: 'Failed to revalidate team data' }
  }
}

/**
 * Revalidate app configuration
 */
export async function revalidateAppConfig() {
  logger.info('Revalidating app configuration')

  try {
    revalidateTag('app-config')
    logger.debug('App config revalidated')
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate app config', { error })
    return { success: false, error: 'Failed to revalidate app configuration' }
  }
}

/**
 * Revalidate dashboard page
 */
export async function revalidateDashboard() {
  logger.info('Revalidating dashboard')

  try {
    revalidatePath('/dashboard', 'page')
    logger.debug('Dashboard revalidated')
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate dashboard', { error })
    return { success: false, error: 'Failed to revalidate dashboard' }
  }
}

/**
 * Revalidate all dashboard pages (layout and nested pages)
 */
export async function revalidateDashboardLayout() {
  logger.info('Revalidating dashboard layout')

  try {
    revalidatePath('/dashboard', 'layout')
    logger.debug('Dashboard layout revalidated')
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate dashboard layout', { error })
    return { success: false, error: 'Failed to revalidate dashboard layout' }
  }
}

/**
 * Revalidate specific project page
 */
export async function revalidateProjectPage(projectId: string) {
  logger.info('Revalidating project page', { projectId })

  try {
    revalidatePath(`/projects/${projectId}`, 'page')
    revalidateTag(`project-${projectId}`)
    logger.debug('Project page revalidated', { projectId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate project page', { projectId, error })
    return { success: false, error: 'Failed to revalidate project page' }
  }
}

/**
 * Revalidate all data on the site (use sparingly)
 */
export async function revalidateAll() {
  logger.warn('Revalidating all site data')

  try {
    revalidatePath('/', 'layout')
    logger.debug('All site data revalidated')
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate all', { error })
    return { success: false, error: 'Failed to revalidate all data' }
  }
}

/**
 * Revalidate multiple tags at once
 */
export async function revalidateTags(tags: string[]) {
  logger.info('Revalidating multiple tags', { tags })

  try {
    tags.forEach(tag => revalidateTag(tag))
    logger.debug('Tags revalidated', { count: tags.length })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate tags', { tags, error })
    return { success: false, error: 'Failed to revalidate tags' }
  }
}

/**
 * Revalidate analytics data
 */
export async function revalidateAnalytics(userId: string) {
  logger.info('Revalidating analytics', { userId })

  try {
    revalidateTag(`analytics-${userId}`)
    revalidatePath('/dashboard/analytics', 'page')
    logger.debug('Analytics revalidated', { userId })
    return { success: true }
  } catch (error) {
    logger.error('Failed to revalidate analytics', { userId, error })
    return { success: false, error: 'Failed to revalidate analytics' }
  }
}
