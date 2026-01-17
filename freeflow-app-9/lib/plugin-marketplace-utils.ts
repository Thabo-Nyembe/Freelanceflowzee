/**
 * Plugin Marketplace Utilities
 * Helper functions and mock data for plugin ecosystem
 */

import {
  Plugin,
  PluginCategory,
  InstalledPlugin,
  PluginReview,
  PluginCollection,
  PluginMarketplaceStats,
  PluginPricingType
} from './plugin-marketplace-types'

export const PLUGIN_CATEGORIES: Array<{ id: PluginCategory; name: string; icon: string; count: number }> = [
  { id: 'productivity', name: 'Productivity', icon: '⚡', count: 45 },
  { id: 'creative', name: 'Creative', icon: '🎨', count: 38 },
  { id: 'analytics', name: 'Analytics', icon: '📊', count: 29 },
  { id: 'communication', name: 'Communication', icon: '💬', count: 32 },
  { id: 'integration', name: 'Integration', icon: '🔗', count: 56 },
  { id: 'automation', name: 'Automation', icon: '🤖', count: 41 },
  { id: 'ai', name: 'AI & ML', icon: '🧠', count: 27 },
  { id: 'security', name: 'Security', icon: '🔒', count: 22 },
  { id: 'finance', name: 'Finance', icon: '💰', count: 19 },
  { id: 'marketing', name: 'Marketing', icon: '📢', count: 34 }
]

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_PLUGINS: Plugin[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_INSTALLED_PLUGINS: InstalledPlugin[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_PLUGIN_REVIEWS: PluginReview[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_COLLECTIONS: PluginCollection[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_MARKETPLACE_STATS: PluginMarketplaceStats = {
  totalPlugins: 0,
  totalInstalls: 0,
  totalDevelopers: 0,
  avgRating: 0,
  categoryCounts: {
    productivity: 0,
    creative: 0,
    analytics: 0,
    communication: 0,
    integration: 0,
    automation: 0,
    ai: 0,
    security: 0,
    finance: 0,
    marketing: 0
  },
  recentUpdates: 0,
  trendingPlugins: 0
}

// Helper Functions
export function formatInstalls(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

export function formatPrice(pricing: Plugin['pricing']): string {
  if (pricing.type === 'free') return 'Free'
  if (pricing.type === 'freemium') return 'Freemium'

  const price = pricing.price || 0
  const currency = pricing.currency || 'USD'

  if (pricing.type === 'one-time') {
    return `$${price.toFixed(2)}`
  }

  const period = pricing.billingPeriod === 'yearly' ? '/yr' : '/mo'
  return `$${price.toFixed(2)}${period}`
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'green'
  if (rating >= 4.0) return 'blue'
  if (rating >= 3.5) return 'yellow'
  if (rating >= 3.0) return 'orange'
  return 'red'
}

export function getCompatibilityBadge(compatibility: Plugin['compatibility']): {
  label: string
  color: string
} {
  const badges = {
    compatible: { label: 'Compatible', color: 'green' },
    'requires-update': { label: 'Update Required', color: 'yellow' },
    incompatible: { label: 'Incompatible', color: 'red' }
  }

  return badges[compatibility]
}

export function calculateAverageRating(reviews: PluginReview[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}

export function filterPlugins(
  plugins: Plugin[],
  filters: {
    category?: PluginCategory
    pricing?: PluginPricingType
    search?: string
    featured?: boolean
    verified?: boolean
  }
): Plugin[] {
  return plugins.filter(plugin => {
    if (filters.category && plugin.category !== filters.category) return false
    if (filters.pricing && plugin.pricing.type !== filters.pricing) return false
    if (filters.featured && !plugin.isFeatured) return false
    if (filters.verified && !plugin.isVerified) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        plugin.name.toLowerCase().includes(search) ||
        plugin.description.toLowerCase().includes(search) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }
    return true
  })
}

export function sortPlugins(
  plugins: Plugin[],
  sortBy: 'popular' | 'recent' | 'rating' | 'name'
): Plugin[] {
  const sorted = [...plugins]

  switch (sortBy) {
    case 'popular':
      return sorted.sort((a, b) => b.installCount - a.installCount)
    case 'recent':
      return sorted.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return sorted
  }
}

export function isPluginInstalled(pluginId: string, installed: InstalledPlugin[]): boolean {
  return installed.some(p => p.pluginId === pluginId)
}

export function getInstalledPlugin(pluginId: string, installed: InstalledPlugin[]): InstalledPlugin | undefined {
  return installed.find(p => p.pluginId === pluginId)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export function getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)

  return { full, half, empty }
}

export function estimateInstallTime(fileSize: number): string {
  // Rough estimate: 1MB per second
  const seconds = Math.ceil(fileSize / (1024 * 1024))

  if (seconds < 60) return `${seconds}s`
  return `${Math.ceil(seconds / 60)}m`
}
