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

export const MOCK_PLUGINS: Plugin[] = [
  {
    id: 'plugin-1',
    name: 'AI Content Generator',
    slug: 'ai-content-generator',
    description: 'Generate high-quality content using advanced AI models',
    longDescription: 'Transform your content creation workflow with our AI-powered generator. Create blog posts, social media content, and more in seconds.',
    category: 'ai',
    version: '2.5.0',
    author: {
      id: 'author-1',
      name: 'TechCorp Inc',
      email: 'info@techcorp.com',
      verified: true,
      pluginCount: 8
    },
    pricing: {
      type: 'freemium',
      price: 29.99,
      currency: 'USD',
      billingPeriod: 'monthly',
      trialDays: 14,
      hasFreeVersion: true
    },
    rating: 4.8,
    reviewCount: 342,
    installCount: 12540,
    icon: '/plugins/ai-content.svg',
    features: [
      'Multiple AI models',
      'Custom templates',
      'Batch generation',
      '50+ languages',
      'SEO optimization'
    ],
    compatibility: 'compatible',
    minPlatformVersion: '1.0.0',
    fileSize: 2457600,
    lastUpdated: new Date(Date.now() - 86400000 * 3),
    releaseDate: new Date(Date.now() - 86400000 * 180),
    tags: ['ai', 'content', 'writing', 'seo'],
    isFeatured: true,
    isVerified: true,
    isTrending: true
  },
  {
    id: 'plugin-2',
    name: 'Analytics Pro',
    slug: 'analytics-pro',
    description: 'Advanced analytics and reporting dashboard',
    category: 'analytics',
    version: '3.1.2',
    author: {
      id: 'author-2',
      name: 'DataViz Solutions',
      email: 'support@dataviz.com',
      verified: true,
      pluginCount: 5
    },
    pricing: {
      type: 'subscription',
      price: 49.99,
      currency: 'USD',
      billingPeriod: 'monthly'
    },
    rating: 4.6,
    reviewCount: 218,
    installCount: 8420,
    icon: '/plugins/analytics.svg',
    features: [
      'Real-time analytics',
      'Custom dashboards',
      'Export reports',
      'Team collaboration',
      'API access'
    ],
    compatibility: 'compatible',
    minPlatformVersion: '1.2.0',
    fileSize: 3145728,
    lastUpdated: new Date(Date.now() - 86400000 * 7),
    releaseDate: new Date(Date.now() - 86400000 * 365),
    tags: ['analytics', 'reporting', 'data', 'insights'],
    isFeatured: true,
    isVerified: true
  },
  {
    id: 'plugin-3',
    name: 'Slack Integration',
    slug: 'slack-integration',
    description: 'Seamlessly integrate with Slack for team notifications',
    category: 'integration',
    version: '1.8.5',
    author: {
      id: 'author-3',
      name: 'IntegrationHub',
      email: 'hello@integrationhub.com',
      verified: true,
      pluginCount: 12
    },
    pricing: {
      type: 'free'
    },
    rating: 4.9,
    reviewCount: 562,
    installCount: 24580,
    icon: '/plugins/slack.svg',
    features: [
      'Real-time notifications',
      'Channel mapping',
      'Custom triggers',
      'Two-way sync',
      'File sharing'
    ],
    compatibility: 'compatible',
    minPlatformVersion: '1.0.0',
    fileSize: 1048576,
    lastUpdated: new Date(Date.now() - 86400000 * 2),
    releaseDate: new Date(Date.now() - 86400000 * 540),
    tags: ['slack', 'integration', 'notifications', 'collaboration'],
    isFeatured: false,
    isVerified: true,
    isNew: true
  },
  {
    id: 'plugin-4',
    name: 'Task Automation Bot',
    slug: 'task-automation-bot',
    description: 'Automate repetitive tasks with AI-powered workflows',
    category: 'automation',
    version: '2.0.1',
    author: {
      id: 'author-4',
      name: 'AutoFlow Labs',
      email: 'info@autoflow.com',
      verified: true,
      pluginCount: 6
    },
    pricing: {
      type: 'one-time',
      price: 99.99,
      currency: 'USD'
    },
    rating: 4.7,
    reviewCount: 189,
    installCount: 5890,
    icon: '/plugins/automation.svg',
    features: [
      'Visual workflow builder',
      'Pre-built templates',
      'Conditional logic',
      'Schedule automation',
      'Webhook triggers'
    ],
    compatibility: 'compatible',
    minPlatformVersion: '1.5.0',
    fileSize: 4194304,
    lastUpdated: new Date(Date.now() - 86400000 * 5),
    releaseDate: new Date(Date.now() - 86400000 * 90),
    tags: ['automation', 'workflows', 'ai', 'productivity'],
    isFeatured: true,
    isVerified: true,
    isTrending: true
  }
]

export const MOCK_INSTALLED_PLUGINS: InstalledPlugin[] = [
  {
    pluginId: 'plugin-1',
    installedVersion: '2.5.0',
    status: 'active',
    enabled: true,
    installedAt: new Date(Date.now() - 86400000 * 30),
    lastUsed: new Date(Date.now() - 3600000),
    usageStats: {
      pluginId: 'plugin-1',
      activations: 156,
      lastActivated: new Date(Date.now() - 3600000),
      totalUsageTime: 45000,
      errorsCount: 2
    }
  },
  {
    pluginId: 'plugin-3',
    installedVersion: '1.8.5',
    status: 'active',
    enabled: true,
    installedAt: new Date(Date.now() - 86400000 * 60),
    lastUsed: new Date(Date.now() - 7200000),
    usageStats: {
      pluginId: 'plugin-3',
      activations: 892,
      lastActivated: new Date(Date.now() - 7200000),
      totalUsageTime: 180000,
      errorsCount: 0
    }
  }
]

export const MOCK_PLUGIN_REVIEWS: PluginReview[] = [
  {
    id: 'review-1',
    pluginId: 'plugin-1',
    userId: 'user-1',
    userName: 'John Smith',
    rating: 5,
    title: 'Game changer for content creation!',
    comment: 'This plugin has completely transformed how we create content. The AI is incredibly accurate and saves us hours every week.',
    helpful: 45,
    notHelpful: 2,
    version: '2.5.0',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 5)
  },
  {
    id: 'review-2',
    pluginId: 'plugin-1',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    rating: 4,
    title: 'Great but could use more templates',
    comment: 'Really solid plugin overall. Would love to see more industry-specific templates added.',
    helpful: 23,
    notHelpful: 1,
    version: '2.4.0',
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 12),
    response: {
      text: 'Thanks for the feedback! We\'re adding more templates in the next release.',
      from: 'TechCorp Inc',
      date: new Date(Date.now() - 86400000 * 11)
    }
  }
]

export const MOCK_COLLECTIONS: PluginCollection[] = [
  {
    id: 'col-1',
    name: 'Essential Productivity Pack',
    description: 'Must-have plugins for maximum productivity',
    plugins: ['plugin-1', 'plugin-4'],
    icon: '⚡',
    curatedBy: 'KAZI Team',
    featured: true
  },
  {
    id: 'col-2',
    name: 'Integration Powerhouse',
    description: 'Connect all your favorite tools',
    plugins: ['plugin-3'],
    icon: '🔗',
    curatedBy: 'Community',
    featured: false
  }
]

export const MOCK_MARKETPLACE_STATS: PluginMarketplaceStats = {
  totalPlugins: 343,
  totalInstalls: 156789,
  totalDevelopers: 89,
  avgRating: 4.6,
  categoryCounts: {
    productivity: 45,
    creative: 38,
    analytics: 29,
    communication: 32,
    integration: 56,
    automation: 41,
    ai: 27,
    security: 22,
    finance: 19,
    marketing: 34
  },
  recentUpdates: 23,
  trendingPlugins: 12
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
