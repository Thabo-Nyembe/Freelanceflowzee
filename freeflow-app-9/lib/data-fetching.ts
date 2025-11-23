/**
 * Modern Next.js 14 Data Fetching Utilities
 *
 * Following latest patterns from Next.js 14.3.0 documentation:
 * - React.cache() for request memoization
 * - server-only for preventing client-side usage
 * - Preload pattern for early data fetching
 * - Type-safe with TypeScript
 */

import { cache } from 'react'
import 'server-only'
import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('DataFetching')

/**
 * Memoized user data fetcher
 * Uses React.cache() to deduplicate requests during a single render pass
 */
export const getUser = cache(async (userId: string) => {
  logger.info('Fetching user data', { userId })

  try {
    // Replace with your actual data source (database, API, etc.)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
      // Cache for 60 seconds, then revalidate
      next: { revalidate: 60, tags: [`user-${userId}`] }
    })

    if (!res.ok) {
      logger.error('Failed to fetch user', { userId, status: res.status })
      return null
    }

    const user = await res.json()
    logger.debug('User fetched successfully', { userId, hasData: !!user })

    return user
  } catch (error) {
    logger.error('Error fetching user', { userId, error })
    return null
  }
})

/**
 * Preload user data - starts fetching without awaiting
 * Call this early in your component tree to begin loading data
 */
export const preloadUser = (userId: string) => {
  void getUser(userId)
}

/**
 * Memoized project data fetcher with time-based revalidation
 */
export const getProject = cache(async (projectId: string) => {
  logger.info('Fetching project data', { projectId })

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
      // Revalidate every 30 seconds
      next: { revalidate: 30, tags: [`project-${projectId}`] }
    })

    if (!res.ok) {
      logger.error('Failed to fetch project', { projectId, status: res.status })
      return null
    }

    return await res.json()
  } catch (error) {
    logger.error('Error fetching project', { projectId, error })
    return null
  }
})

/**
 * Preload project data
 */
export const preloadProject = (projectId: string) => {
  void getProject(projectId)
}

/**
 * Memoized projects list fetcher for dashboard
 */
export const getProjects = cache(async (userId: string) => {
  logger.info('Fetching projects list', { userId })

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/projects`, {
      // Cache for 5 minutes
      next: { revalidate: 300, tags: [`projects-${userId}`] }
    })

    if (!res.ok) {
      logger.error('Failed to fetch projects', { userId, status: res.status })
      return []
    }

    const projects = await res.json()
    logger.debug('Projects fetched', { userId, count: projects.length })

    return projects
  } catch (error) {
    logger.error('Error fetching projects', { userId, error })
    return []
  }
})

/**
 * Fetch fresh data on every request (no caching)
 * Use for real-time data like notifications, messages
 */
export const getNotifications = cache(async (userId: string) => {
  logger.info('Fetching notifications', { userId })

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/notifications`, {
      // No caching - always fetch fresh
      cache: 'no-store'
    })

    if (!res.ok) {
      logger.error('Failed to fetch notifications', { userId, status: res.status })
      return []
    }

    return await res.json()
  } catch (error) {
    logger.error('Error fetching notifications', { userId, error })
    return []
  }
})

/**
 * Static data fetch - cached until manually invalidated
 * Use for rarely changing data like settings, configurations
 */
export const getAppConfig = cache(async () => {
  logger.info('Fetching app configuration')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/config`, {
      // Cache indefinitely until manually revalidated
      cache: 'force-cache',
      next: { tags: ['app-config'] }
    })

    if (!res.ok) {
      logger.error('Failed to fetch app config', { status: res.status })
      return null
    }

    return await res.json()
  } catch (error) {
    logger.error('Error fetching app config', { error })
    return null
  }
})

/**
 * Parallel data fetching example
 * Fetches multiple resources concurrently
 */
export async function getDashboardData(userId: string) {
  logger.info('Fetching dashboard data', { userId })

  // Start all fetches in parallel
  const userPromise = getUser(userId)
  const projectsPromise = getProjects(userId)
  const notificationsPromise = getNotifications(userId)

  // Wait for all to complete
  const [user, projects, notifications] = await Promise.all([
    userPromise,
    projectsPromise,
    notificationsPromise
  ])

  logger.debug('Dashboard data fetched', {
    userId,
    hasUser: !!user,
    projectCount: projects.length,
    notificationCount: notifications.length
  })

  return { user, projects, notifications }
}

/**
 * Database query example with React.cache()
 * For use with ORMs like Prisma, Drizzle, etc.
 */
export const getTeamMembers = cache(async (teamId: string) => {
  logger.info('Fetching team members', { teamId })

  try {
    // Example with a hypothetical database client
    // Replace with your actual database queries
    // const members = await db.teamMember.findMany({
    //   where: { teamId },
    //   include: { user: true }
    // })

    // Fallback fetch for demonstration
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${teamId}/members`, {
      next: { revalidate: 120, tags: [`team-${teamId}`, 'team-members'] }
    })

    if (!res.ok) {
      logger.error('Failed to fetch team members', { teamId, status: res.status })
      return []
    }

    return await res.json()
  } catch (error) {
    logger.error('Error fetching team members', { teamId, error })
    return []
  }
})

/**
 * Tagged fetch for selective revalidation
 * Use with revalidateTag() in Server Actions
 */
export const getClientProjects = cache(async (clientId: string) => {
  logger.info('Fetching client projects', { clientId })

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientId}/projects`, {
      next: {
        revalidate: 180,
        // Multiple tags for flexible revalidation
        tags: [`client-${clientId}`, 'client-projects', 'projects']
      }
    })

    if (!res.ok) {
      logger.error('Failed to fetch client projects', { clientId, status: res.status })
      return []
    }

    return await res.json()
  } catch (error) {
    logger.error('Error fetching client projects', { clientId, error })
    return []
  }
})
