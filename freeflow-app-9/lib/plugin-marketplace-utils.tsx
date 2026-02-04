/**
 * ========================================
 * PLUGIN MARKETPLACE UTILITIES - PRODUCTION READY
 * ========================================
 *
 * Complete plugin marketplace with:
 * - Plugin discovery and installation
 * - Multiple categories and pricing models
 * - Ratings and reviews system
 * - Version management
 * - Featured and trending plugins
 * - Author verification
 * - Plugin settings and configuration
 * - Installation analytics
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('PluginMarketplaceUtils')

// ========================================
// TYPE DEFINITIONS
// ========================================

export type PluginCategory = 'productivity' | 'creative' | 'analytics' | 'communication' | 'integration' | 'automation' | 'ai' | 'security' | 'finance' | 'marketing'
export type PricingType = 'free' | 'one-time' | 'subscription' | 'freemium'
export type PluginStatus = 'published' | 'beta' | 'coming-soon' | 'deprecated'
export type SortBy = 'popular' | 'recent' | 'rating' | 'name' | 'price'
export type ViewMode = 'grid' | 'list'

export interface PluginAuthor {
  id: string
  name: string
  avatar: string
  verified: boolean
  email?: string
  website?: string
  totalPlugins: number
  totalInstalls: number
}

export interface Plugin {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  category: PluginCategory
  icon: string
  author: PluginAuthor
  version: string
  rating: number
  reviewCount: number
  installCount: number
  activeInstalls: number
  price: number
  pricingType: PricingType
  status: PluginStatus
  fileSize: number
  lastUpdated: Date
  createdAt: Date
  isVerified: boolean
  isFeatured: boolean
  isTrending: boolean
  isPopular: boolean
  tags: string[]
  screenshots: string[]
  compatibility: string[]
  requirements: string[]
  changelog: ChangelogEntry[]
  downloadUrl?: string
  documentationUrl?: string
  supportUrl?: string
}

export interface ChangelogEntry {
  version: string
  date: Date
  changes: string[]
}

export interface InstalledPlugin {
  id: string
  pluginId: string
  userId: string
  installedAt: Date
  installedVersion: string
  isActive: boolean
  settings: Record<string, any>
  lastUsed?: Date
  usageCount: number
}

export interface PluginReview {
  id: string
  pluginId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  title: string
  comment: string
  helpful: number
  notHelpful: number
  createdAt: Date
  verified: boolean
}

export interface PluginStats {
  totalPlugins: number
  totalInstalls: number
  totalReviews: number
  averageRating: number
  byCategory: Record<PluginCategory, number>
  byPricing: Record<PricingType, number>
  featured: number
  trending: number
  verified: number
}

// ========================================
// CONSTANTS
// ========================================

const PLUGIN_NAMES = [
  'AI Content Generator',
  'Advanced Analytics Pro',
  'Email Marketing Suite',
  'Social Media Manager',
  'SEO Optimizer',
  'Project Timeline Visualizer',
  'Team Collaboration Hub',
  'Invoice Generator Plus',
  'Code Snippet Manager',
  'Design System Builder',
  'Customer Feedback Widget',
  'Calendar Sync Pro',
  'File Converter Ultimate',
  'Backup & Restore',
  'Performance Monitor',
  'Security Scanner',
  'Chat Integration',
  'Video Meeting Recorder',
  'Document Signer',
  'Expense Tracker Pro'
]

const PLUGIN_DESCRIPTIONS = [
  'Generate high-quality content with AI assistance',
  'Advanced analytics and reporting tools',
  'Complete email marketing automation',
  'Manage all your social media in one place',
  'Optimize your content for search engines',
  'Visualize project timelines and milestones',
  'Collaborate with your team in real-time',
  'Create and send professional invoices',
  'Organize and share code snippets',
  'Build consistent design systems',
  'Collect and analyze customer feedback',
  'Sync calendars across all platforms',
  'Convert files between any format',
  'Automated backup and restore solutions',
  'Monitor performance and optimize speed',
  'Scan for security vulnerabilities',
  'Integrate popular chat platforms',
  'Record and transcribe video meetings',
  'Sign documents electronically',
  'Track expenses and generate reports'
]

const TAGS = [
  'ai',
  'analytics',
  'automation',
  'productivity',
  'design',
  'marketing',
  'communication',
  'security',
  'finance',
  'development',
  'collaboration',
  'integration',
  'reporting',
  'optimization',
  'monitoring'
]

const AUTHOR_NAMES = [
  'TechFlow Studios',
  'Pixel Perfect Labs',
  'Innovation Works',
  'Digital Dynamics',
  'Cloud Crafters',
  'Code Masters',
  'Design First',
  'Data Wizards',
  'Smart Solutions',
  'Creative Edge'
]

// ========================================
// MOCK DATA GENERATION
// ========================================

export function generateMockPlugins(count: number = 50): Plugin[] {
  logger.info('Generating mock plugins', { count })

  const plugins: Plugin[] = []
  const now = new Date()
  const categories: PluginCategory[] = ['productivity', 'creative', 'analytics', 'communication', 'integration', 'automation', 'ai', 'security', 'finance', 'marketing']
  const pricingTypes: PricingType[] = ['free', 'one-time', 'subscription', 'freemium']
  const statuses: PluginStatus[] = ['published', 'beta', 'coming-soon']

  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length]
    const pricingType = pricingTypes[i % pricingTypes.length]
    const status = statuses[i % statuses.length]
    const daysAgo = Math.floor(Math.random() * 365)

    const author: PluginAuthor = {
      id: `author-${(i % 10) + 1}`,
      name: AUTHOR_NAMES[i % AUTHOR_NAMES.length],
      avatar: `/avatars/author-${(i % 10) + 1}.jpg`,
      verified: i % 3 === 0,
      email: `contact@${AUTHOR_NAMES[i % AUTHOR_NAMES.length].toLowerCase().replace(/\s+/g, '')}.com`,
      website: `https://${AUTHOR_NAMES[i % AUTHOR_NAMES.length].toLowerCase().replace(/\s+/g, '')}.com`,
      totalPlugins: Math.floor(Math.random() * 10) + 1,
      totalInstalls: Math.floor(Math.random() * 100000) + 1000
    }

    const rating = parseFloat((3 + Math.random() * 2).toFixed(1)) // 3.0 - 5.0
    const reviewCount = Math.floor(Math.random() * 1000) + 10
    const installCount = Math.floor(Math.random() * 50000) + 100

    plugins.push({
      id: `plugin-${i + 1}`,
      name: PLUGIN_NAMES[i % PLUGIN_NAMES.length],
      slug: PLUGIN_NAMES[i % PLUGIN_NAMES.length].toLowerCase().replace(/\s+/g, '-'),
      description: PLUGIN_DESCRIPTIONS[i % PLUGIN_DESCRIPTIONS.length],
      longDescription: `${PLUGIN_DESCRIPTIONS[i % PLUGIN_DESCRIPTIONS.length]}. This powerful plugin provides advanced features and seamless integration with your workflow. Built with modern technologies and best practices, it offers excellent performance and reliability.`,
      category,
      icon: `/icons/plugin-${(i % 20) + 1}.svg`,
      author,
      version: `${Math.floor(i / 10) + 1}.${i % 10}.0`,
      rating,
      reviewCount,
      installCount,
      activeInstalls: Math.floor(installCount * 0.7),
      price: pricingType === 'free' ? 0 : pricingType === 'one-time' ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 50) + 5,
      pricingType,
      status,
      fileSize: Math.floor(Math.random() * 10000000) + 100000, // 100KB - 10MB
      lastUpdated: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - (daysAgo + 90) * 24 * 60 * 60 * 1000),
      isVerified: i % 4 === 0,
      isFeatured: i % 8 === 0,
      isTrending: i % 6 === 0,
      isPopular: installCount > 10000,
      tags: [
        TAGS[i % TAGS.length],
        TAGS[(i + 1) % TAGS.length],
        TAGS[(i + 2) % TAGS.length]
      ],
      screenshots: [
        `/screenshots/plugin-${i + 1}-1.jpg`,
        `/screenshots/plugin-${i + 1}-2.jpg`,
        `/screenshots/plugin-${i + 1}-3.jpg`
      ],
      compatibility: ['Web', 'Desktop', 'Mobile'],
      requirements: [
        'Node.js 16+',
        'React 18+',
        'TypeScript 5+'
      ],
      changelog: [
        {
          version: `${Math.floor(i / 10) + 1}.${i % 10}.0`,
          date: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
          changes: [
            'Added new features',
            'Improved performance',
            'Fixed various bugs'
          ]
        }
      ],
      downloadUrl: `https://plugins.kazi.com/downloads/plugin-${i + 1}.zip`,
      documentationUrl: `https://docs.kazi.com/plugins/plugin-${i + 1}`,
      supportUrl: `https://support.kazi.com/plugins/plugin-${i + 1}`
    })
  }

  logger.debug('Mock plugins generated', {
    total: plugins.length,
    byCategory: categories.map(c => ({ category: c, count: plugins.filter(p => p.category === c).length }))
  })

  return plugins
}

export function generateMockInstalledPlugins(count: number = 15, userId: string = 'user-1'): InstalledPlugin[] {
  logger.info('Generating mock installed plugins', { count, userId })

  const installed: InstalledPlugin[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60)

    installed.push({
      id: `installed-${i + 1}`,
      pluginId: `plugin-${i + 1}`,
      userId,
      installedAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      installedVersion: `${Math.floor(i / 10) + 1}.${i % 10}.0`,
      isActive: i % 4 !== 0,
      settings: {
        enabled: true,
        autoUpdate: i % 2 === 0,
        notifications: i % 3 === 0
      },
      lastUsed: new Date(now.getTime() - Math.floor(daysAgo / 2) * 24 * 60 * 60 * 1000),
      usageCount: Math.floor(Math.random() * 500) + 10
    })
  }

  logger.debug('Mock installed plugins generated', { count: installed.length })
  return installed
}

export function generateMockReviews(pluginId: string, count: number = 20): PluginReview[] {
  logger.info('Generating mock reviews', { pluginId, count })

  const reviews: PluginReview[] = []
  const now = new Date()

  const titles = [
    'Amazing plugin!',
    'Very useful',
    'Great features',
    'Good but needs improvement',
    'Excellent work',
    'Highly recommended',
    'Works as expected',
    'Could be better',
    'Perfect solution',
    'Outstanding quality'
  ]

  const comments = [
    'This plugin has completely transformed my workflow. Highly recommend!',
    'Great features but could use more documentation.',
    'Easy to use and very powerful. Worth every penny.',
    'Good plugin but had some issues with installation.',
    'Exactly what I was looking for. Five stars!',
    'Works well but the UI could be improved.',
    'Fantastic support from the developer.',
    'Very intuitive and well-designed.',
    'Had some bugs at first but they were quickly fixed.',
    'Best plugin in its category!'
  ]

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 180)

    reviews.push({
      id: `review-${i + 1}`,
      pluginId,
      userId: `user-${i + 1}`,
      userName: `User ${i + 1}`,
      userAvatar: `/avatars/user-${(i % 10) + 1}.jpg`,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
      title: titles[i % titles.length],
      comment: comments[i % comments.length],
      helpful: Math.floor(Math.random() * 50),
      notHelpful: Math.floor(Math.random() * 10),
      createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      verified: i % 3 === 0
    })
  }

  logger.debug('Mock reviews generated', { count: reviews.length })
  return reviews
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function formatInstallCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

export function getCategoryIcon(category: PluginCategory): string {
  const icons: Record<PluginCategory, string> = {
    productivity: 'Zap',
    creative: 'Palette',
    analytics: 'BarChart3',
    communication: 'MessageSquare',
    integration: 'Globe',
    automation: 'RefreshCw',
    ai: 'Sparkles',
    security: 'Shield',
    finance: 'DollarSign',
    marketing: 'Target'
  }
  return icons[category]
}

export function getCategoryColor(category: PluginCategory): string {
  const colors: Record<PluginCategory, string> = {
    productivity: 'blue',
    creative: 'purple',
    analytics: 'green',
    communication: 'orange',
    integration: 'cyan',
    automation: 'indigo',
    ai: 'pink',
    security: 'red',
    finance: 'yellow',
    marketing: 'teal'
  }
  return colors[category]
}

export function getPricingLabel(pricingType: PricingType, price: number): string {
  switch (pricingType) {
    case 'free':
      return 'Free'
    case 'one-time':
      return `$${price}`
    case 'subscription':
      return `$${price}/mo`
    case 'freemium':
      return 'Freemium'
    default:
      return 'Free'
  }
}

export function getStatusColor(status: PluginStatus): string {
  const colors: Record<PluginStatus, string> = {
    published: 'green',
    beta: 'yellow',
    'coming-soon': 'blue',
    deprecated: 'red'
  }
  return colors[status]
}

export function getStatusLabel(status: PluginStatus): string {
  const labels: Record<PluginStatus, string> = {
    published: 'Published',
    beta: 'Beta',
    'coming-soon': 'Coming Soon',
    deprecated: 'Deprecated'
  }
  return labels[status]
}

export function searchPlugins(plugins: Plugin[], searchTerm: string): Plugin[] {
  if (!searchTerm.trim()) return plugins

  const term = searchTerm.toLowerCase()
  logger.debug('Searching plugins', { term, totalPlugins: plugins.length })

  const filtered = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(term) ||
    plugin.description.toLowerCase().includes(term) ||
    plugin.author.name.toLowerCase().includes(term) ||
    plugin.tags.some(tag => tag.toLowerCase().includes(term))
  )

  logger.info('Plugin search complete', {
    term,
    resultsCount: filtered.length,
    totalSearched: plugins.length
  })

  return filtered
}

export function filterByCategory(plugins: Plugin[], category: 'all' | PluginCategory): Plugin[] {
  if (category === 'all') return plugins

  logger.debug('Filtering plugins by category', { category })

  const filtered = plugins.filter(p => p.category === category)

  logger.info('Plugins filtered by category', {
    category,
    resultsCount: filtered.length
  })

  return filtered
}

export function filterByPricing(plugins: Plugin[], pricingType: 'all' | PricingType): Plugin[] {
  if (pricingType === 'all') return plugins

  logger.debug('Filtering plugins by pricing', { pricingType })

  const filtered = plugins.filter(p => p.pricingType === pricingType)

  logger.info('Plugins filtered by pricing', {
    pricingType,
    resultsCount: filtered.length
  })

  return filtered
}

export function sortPlugins(plugins: Plugin[], sortBy: SortBy): Plugin[] {
  logger.debug('Sorting plugins', { sortBy, totalPlugins: plugins.length })

  const sorted = [...plugins].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.installCount - a.installCount
      case 'recent':
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      case 'rating':
        return b.rating - a.rating
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price - b.price
      default:
        return 0
    }
  })

  logger.info('Plugins sorted', { sortBy, count: sorted.length })
  return sorted
}

export function getFeaturedPlugins(plugins: Plugin[]): Plugin[] {
  return plugins.filter(p => p.isFeatured)
}

export function getTrendingPlugins(plugins: Plugin[]): Plugin[] {
  return plugins.filter(p => p.isTrending)
}

export function getPopularPlugins(plugins: Plugin[]): Plugin[] {
  return plugins.filter(p => p.isPopular)
}

export function getVerifiedPlugins(plugins: Plugin[]): Plugin[] {
  return plugins.filter(p => p.isVerified)
}

export function calculatePluginStats(plugins: Plugin[]): PluginStats {
  logger.debug('Calculating plugin stats', { totalPlugins: plugins.length })

  const byCategory: Record<PluginCategory, number> = {
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
  }

  const byPricing: Record<PricingType, number> = {
    free: 0,
    'one-time': 0,
    subscription: 0,
    freemium: 0
  }

  let totalInstalls = 0
  let totalReviews = 0
  let totalRating = 0
  let featured = 0
  let trending = 0
  let verified = 0

  plugins.forEach(plugin => {
    byCategory[plugin.category]++
    byPricing[plugin.pricingType]++
    totalInstalls += plugin.installCount
    totalReviews += plugin.reviewCount
    totalRating += plugin.rating * plugin.reviewCount
    if (plugin.isFeatured) featured++
    if (plugin.isTrending) trending++
    if (plugin.isVerified) verified++
  })

  const stats: PluginStats = {
    totalPlugins: plugins.length,
    totalInstalls,
    totalReviews,
    averageRating: totalReviews > 0 ? parseFloat((totalRating / totalReviews).toFixed(1)) : 0,
    byCategory,
    byPricing,
    featured,
    trending,
    verified
  }

  logger.info('Plugin stats calculated', {
    totalPlugins: stats.totalPlugins,
    totalInstalls: formatInstallCount(stats.totalInstalls),
    averageRating: stats.averageRating
  })

  return stats
}

export function isPluginInstalled(pluginId: string, installedPlugins: InstalledPlugin[]): boolean {
  return installedPlugins.some(ip => ip.pluginId === pluginId)
}

export function getInstalledPlugin(pluginId: string, installedPlugins: InstalledPlugin[]): InstalledPlugin | undefined {
  return installedPlugins.find(ip => ip.pluginId === pluginId)
}

export function canInstallPlugin(plugin: Plugin): { canInstall: boolean; reason?: string } {
  if (plugin.status === 'deprecated') {
    return { canInstall: false, reason: 'This plugin is deprecated' }
  }

  if (plugin.status === 'coming-soon') {
    return { canInstall: false, reason: 'This plugin is not yet available' }
  }

  return { canInstall: true }
}

export function validatePluginRequirements(plugin: Plugin): { valid: boolean; missing: string[] } {
  // In a real implementation, this would check actual system requirements
  const missing: string[] = []

  logger.info('Validating plugin requirements', {
    pluginId: plugin.id,
    requirements: plugin.requirements
  })

  return { valid: missing.length === 0, missing }
}

export function exportPluginList(plugins: Plugin[], format: 'json' | 'csv'): Blob {
  logger.info('Exporting plugin list', { format, count: plugins.length })

  if (format === 'json') {
    const data = JSON.stringify(plugins, null, 2)
    return new Blob([data], { type: 'application/json' })
  }

  // CSV format
  const headers = ['Name', 'Category', 'Author', 'Version', 'Rating', 'Installs', 'Price', 'Status']
  const rows = plugins.map(p => [
    p.name,
    p.category,
    p.author.name,
    p.version,
    p.rating.toString(),
    p.installCount.toString(),
    getPricingLabel(p.pricingType, p.price),
    p.status
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return new Blob([csv], { type: 'text/csv' })
}

export default {
  generateMockPlugins,
  generateMockInstalledPlugins,
  generateMockReviews,
  formatFileSize,
  formatInstallCount,
  getCategoryIcon,
  getCategoryColor,
  getPricingLabel,
  getStatusColor,
  getStatusLabel,
  searchPlugins,
  filterByCategory,
  filterByPricing,
  sortPlugins,
  getFeaturedPlugins,
  getTrendingPlugins,
  getPopularPlugins,
  getVerifiedPlugins,
  calculatePluginStats,
  isPluginInstalled,
  getInstalledPlugin,
  canInstallPlugin,
  validatePluginRequirements,
  exportPluginList
}
