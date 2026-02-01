/**
 * Route Utilities
 * Helper functions for route management and prefetching
 */

/**
 * Prefetch route on hover
 * Use with Link components for faster navigation
 */
export function prefetchOnHover(href: string) {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as Record<string, unknown>).connection

    // Don't prefetch on slow connections
    if (connection?.saveData || connection?.effectiveType === 'slow-2g') {
      return
    }
  }

  // Use Next.js router to prefetch
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Get route depth
 * Returns the depth level of current route
 */
export function getRouteDepth(pathname: string): number {
  return pathname.split('/').filter(Boolean).length
}

/**
 * Get route parent
 * Returns the parent route path
 */
export function getParentRoute(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  segments.pop()
  return '/' + segments.join('/')
}

/**
 * Is route active
 * Check if given path matches current route (including children)
 */
export function isRouteActive(currentPath: string, checkPath: string, exact = false): boolean {
  if (exact) {
    return currentPath === checkPath
  }
  return currentPath.startsWith(checkPath)
}

/**
 * Get route segments
 * Split pathname into segments with labels
 */
export function getRouteSegments(pathname: string) {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      path: '/' + arr.slice(0, index + 1).join('/'),
      label: segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      segment
    }))
}

/**
 * Format route title
 * Convert route segment to readable title
 */
export function formatRouteTitle(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Route labels map
 * Common route segments and their display labels
 */
export const ROUTE_LABELS: Record<string, string> = {
  // Dashboard
  dashboard: 'Dashboard',
  'projects-hub': 'Projects Hub',
  'video-studio': 'Video Studio',
  'ai-create': 'AI Create',
  'ai-design': 'AI Design',
  'my-day': 'My Day',
  'client-zone': 'Client Zone',
  'files-hub': 'Files Hub',
  'financial-hub': 'Financial Hub',
  'community-hub': 'Community Hub',

  // Actions
  create: 'Create New',
  edit: 'Edit',
  view: 'View',
  settings: 'Settings',

  // Common
  analytics: 'Analytics',
  messages: 'Messages',
  notifications: 'Notifications',
  calendar: 'Calendar',
  team: 'Team',
  clients: 'Clients',
  invoices: 'Invoices',
  bookings: 'Bookings',
  gallery: 'Gallery',
  profile: 'Profile',
  escrow: 'Escrow',
  collaboration: 'Collaboration',

  // Marketing
  features: 'Features',
  pricing: 'Pricing',
  contact: 'Contact',
  about: 'About',
  blog: 'Blog',
  docs: 'Documentation'
}

/**
 * Get route label
 * Get display label for route segment
 */
export function getRouteLabel(segment: string): string {
  return ROUTE_LABELS[segment] || formatRouteTitle(segment)
}

export default {
  prefetchOnHover,
  getRouteDepth,
  getParentRoute,
  isRouteActive,
  getRouteSegments,
  formatRouteTitle,
  getRouteLabel,
  ROUTE_LABELS
}
