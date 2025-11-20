/**
 * Plugin Marketplace Types
 * Complete type system for plugin ecosystem and marketplace
 */

export type PluginCategory =
  | 'productivity'
  | 'creative'
  | 'analytics'
  | 'communication'
  | 'integration'
  | 'automation'
  | 'ai'
  | 'security'
  | 'finance'
  | 'marketing'

export type PluginStatus = 'active' | 'inactive' | 'updating' | 'error'

export type PluginPricingType = 'free' | 'one-time' | 'subscription' | 'freemium'

export type PluginCompatibility = 'compatible' | 'requires-update' | 'incompatible'

export interface Plugin {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  category: PluginCategory
  version: string
  author: PluginAuthor
  pricing: PluginPricing
  rating: number
  reviewCount: number
  installCount: number
  icon: string
  screenshots?: string[]
  features: string[]
  compatibility: PluginCompatibility
  minPlatformVersion: string
  maxPlatformVersion?: string
  fileSize: number
  lastUpdated: Date
  releaseDate: Date
  tags: string[]
  website?: string
  documentation?: string
  support?: string
  changelog?: PluginChangelog[]
  permissions?: PluginPermission[]
  isFeatured?: boolean
  isVerified?: boolean
  isNew?: boolean
  isTrending?: boolean
}

export interface PluginAuthor {
  id: string
  name: string
  email: string
  website?: string
  avatar?: string
  verified: boolean
  pluginCount: number
}

export interface PluginPricing {
  type: PluginPricingType
  price?: number
  currency?: string
  billingPeriod?: 'monthly' | 'yearly'
  trialDays?: number
  hasFreeVersion?: boolean
}

export interface InstalledPlugin {
  pluginId: string
  installedVersion: string
  status: PluginStatus
  enabled: boolean
  installedAt: Date
  lastUsed?: Date
  settings?: Record<string, any>
  usageStats?: PluginUsageStats
}

export interface PluginUsageStats {
  pluginId: string
  activations: number
  lastActivated?: Date
  totalUsageTime: number
  errorsCount: number
  lastError?: {
    message: string
    timestamp: Date
  }
}

export interface PluginReview {
  id: string
  pluginId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  helpful: number
  notHelpful: number
  version: string
  verified: boolean
  createdAt: Date
  updatedAt?: Date
  response?: {
    text: string
    from: string
    date: Date
  }
}

export interface PluginChangelog {
  version: string
  date: Date
  changes: Array<{
    type: 'feature' | 'fix' | 'improvement' | 'breaking'
    description: string
  }>
}

export interface PluginPermission {
  id: string
  name: string
  description: string
  required: boolean
  granted?: boolean
}

export interface PluginCollection {
  id: string
  name: string
  description: string
  plugins: string[]
  icon: string
  curatedBy: string
  featured: boolean
}

export interface PluginDeveloperStats {
  totalPlugins: number
  totalInstalls: number
  totalRevenue: number
  averageRating: number
  totalReviews: number
  monthlyActiveUsers: number
}

export interface PluginDevelopment {
  id: string
  name: string
  description: string
  status: 'draft' | 'testing' | 'review' | 'published' | 'rejected'
  version: string
  category: PluginCategory
  createdAt: Date
  lastModified: Date
  testResults?: Array<{
    test: string
    passed: boolean
    error?: string
  }>
  submittedAt?: Date
  reviewNotes?: string
}

export interface PluginAPI {
  version: string
  endpoints: Array<{
    method: string
    path: string
    description: string
  }>
  webhooks?: Array<{
    event: string
    url: string
    enabled: boolean
  }>
  rateLimit: {
    requests: number
    period: string
  }
}

export interface PluginMarketplaceStats {
  totalPlugins: number
  totalInstalls: number
  totalDevelopers: number
  avgRating: number
  categoryCounts: Record<PluginCategory, number>
  recentUpdates: number
  trendingPlugins: number
}

export interface PluginSearchFilters {
  category?: PluginCategory
  pricing?: PluginPricingType
  rating?: number
  compatibility?: PluginCompatibility
  verified?: boolean
  featured?: boolean
  sort?: 'popular' | 'recent' | 'rating' | 'name'
}

export interface PluginSubscription {
  pluginId: string
  userId: string
  plan: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  startDate: Date
  endDate?: Date
  renewalDate?: Date
  amount: number
  currency: string
}
