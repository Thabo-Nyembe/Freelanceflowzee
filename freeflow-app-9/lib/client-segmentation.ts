import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('ClientSegmentation')

// ============================================================================
// TYPES
// ============================================================================

export type ClientTier = 'starter' | 'standard' | 'premium' | 'enterprise' | 'vip'

export interface ClientSegmentation {
  tier: ClientTier
  features: TierFeatures
  benefits: string[]
  limits: TierLimits
  pricing: TierPricing
  accountManager?: AccountManager
  customization?: CustomizationOptions
}

export interface TierFeatures {
  prioritySupport: boolean
  dedicatedManager: boolean
  customBranding: boolean
  advancedAnalytics: boolean
  apiAccess: boolean
  unlimitedProjects: boolean
  whiteLabel: boolean
  customSLA: boolean
  aiFeatures: boolean
  bulkDiscount: boolean
  earlyAccess: boolean
  customIntegrations: boolean
}

export interface TierLimits {
  maxProjects: number | 'unlimited'
  maxTeamMembers: number | 'unlimited'
  maxStorage: string // e.g., "50GB", "unlimited"
  maxMonthlySpend: number | null
  revisionRounds: number | 'unlimited'
  supportResponseTime: string // e.g., "24 hours", "2 hours"
}

export interface TierPricing {
  monthlyFee: number
  transactionFee: number // percentage
  discount: number // percentage off services
  minimumCommitment: number // months
  setupFee: number
}

export interface AccountManager {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  title: string
  timezone: string
  availability: string
}

export interface CustomizationOptions {
  customDomain: boolean
  customColors: boolean
  customLogo: boolean
  customEmails: boolean
  customReports: boolean
  ssoIntegration: boolean
}

export interface SegmentationCriteria {
  revenue: {
    min: number
    max?: number
  }
  projects: {
    min: number
    max?: number
  }
  tenure: {
    min: number // months
    max?: number
  }
  healthScore?: {
    min: number
    max?: number
  }
}

// ============================================================================
// TIER DEFINITIONS
// ============================================================================

export const tierDefinitions: Record<ClientTier, ClientSegmentation> = {
  starter: {
    tier: 'starter',
    features: {
      prioritySupport: false,
      dedicatedManager: false,
      customBranding: false,
      advancedAnalytics: false,
      apiAccess: false,
      unlimitedProjects: false,
      whiteLabel: false,
      customSLA: false,
      aiFeatures: false,
      bulkDiscount: false,
      earlyAccess: false,
      customIntegrations: false
    },
    benefits: [
      'Access to platform features',
      'Standard support (24hr response)',
      'Basic analytics dashboard',
      'Secure payment escrow',
      'File storage (10GB)',
      'Email notifications'
    ],
    limits: {
      maxProjects: 3,
      maxTeamMembers: 2,
      maxStorage: '10GB',
      maxMonthlySpend: 5000,
      revisionRounds: 2,
      supportResponseTime: '24 hours'
    },
    pricing: {
      monthlyFee: 0,
      transactionFee: 5,
      discount: 0,
      minimumCommitment: 0,
      setupFee: 0
    }
  },

  standard: {
    tier: 'standard',
    features: {
      prioritySupport: false,
      dedicatedManager: false,
      customBranding: false,
      advancedAnalytics: true,
      apiAccess: false,
      unlimitedProjects: false,
      whiteLabel: false,
      customSLA: false,
      aiFeatures: false,
      bulkDiscount: false,
      earlyAccess: false,
      customIntegrations: false
    },
    benefits: [
      'All Starter features',
      'Up to 10 projects/month',
      'Advanced analytics & reporting',
      'Priority email support',
      'File storage (50GB)',
      'Team collaboration tools',
      'Custom notifications',
      'ROI tracking dashboard'
    ],
    limits: {
      maxProjects: 10,
      maxTeamMembers: 5,
      maxStorage: '50GB',
      maxMonthlySpend: null,
      revisionRounds: 3,
      supportResponseTime: '12 hours'
    },
    pricing: {
      monthlyFee: 99,
      transactionFee: 3,
      discount: 5,
      minimumCommitment: 0,
      setupFee: 0
    }
  },

  premium: {
    tier: 'premium',
    features: {
      prioritySupport: true,
      dedicatedManager: false,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: false,
      unlimitedProjects: true,
      whiteLabel: false,
      customSLA: false,
      aiFeatures: true,
      bulkDiscount: true,
      earlyAccess: true,
      customIntegrations: false
    },
    benefits: [
      'All Standard features',
      'Unlimited projects',
      'Priority support (2hr response)',
      '15% discount on all services',
      'AI-powered features',
      'Custom branding options',
      'File storage (200GB)',
      'Early access to new features',
      'Quarterly business reviews',
      'Advanced team management'
    ],
    limits: {
      maxProjects: 'unlimited',
      maxTeamMembers: 15,
      maxStorage: '200GB',
      maxMonthlySpend: null,
      revisionRounds: 5,
      supportResponseTime: '2 hours'
    },
    pricing: {
      monthlyFee: 299,
      transactionFee: 2,
      discount: 15,
      minimumCommitment: 3,
      setupFee: 0
    }
  },

  enterprise: {
    tier: 'enterprise',
    features: {
      prioritySupport: true,
      dedicatedManager: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      unlimitedProjects: true,
      whiteLabel: true,
      customSLA: true,
      aiFeatures: true,
      bulkDiscount: true,
      earlyAccess: true,
      customIntegrations: true
    },
    benefits: [
      'All Premium features',
      'Dedicated account manager',
      'White-label customization',
      'Custom SLA with guarantees',
      '20% discount on all services',
      'API access for integrations',
      'File storage (1TB)',
      'Custom domain support',
      'SSO integration',
      'Monthly strategy sessions',
      'Custom reporting & analytics',
      'Priority project scheduling',
      'Flexible payment terms (Net 60)'
    ],
    limits: {
      maxProjects: 'unlimited',
      maxTeamMembers: 'unlimited',
      maxStorage: '1TB',
      maxMonthlySpend: null,
      revisionRounds: 'unlimited',
      supportResponseTime: '1 hour'
    },
    pricing: {
      monthlyFee: 999,
      transactionFee: 0,
      discount: 20,
      minimumCommitment: 12,
      setupFee: 500
    },
    accountManager: {
      id: 'am-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@kazi.app',
      phone: '+1 (555) 123-4567',
      avatar: '/avatars/sarah-johnson.jpg',
      title: 'Senior Account Manager',
      timezone: 'America/New_York',
      availability: 'Mon-Fri 9am-6pm EST'
    },
    customization: {
      customDomain: true,
      customColors: true,
      customLogo: true,
      customEmails: true,
      customReports: true,
      ssoIntegration: true
    }
  },

  vip: {
    tier: 'vip',
    features: {
      prioritySupport: true,
      dedicatedManager: true,
      customBranding: true,
      advancedAnalytics: true,
      apiAccess: true,
      unlimitedProjects: true,
      whiteLabel: true,
      customSLA: true,
      aiFeatures: true,
      bulkDiscount: true,
      earlyAccess: true,
      customIntegrations: true
    },
    benefits: [
      'All Enterprise features',
      'Highest priority support (30min response)',
      'Executive account manager',
      '25% discount on all services',
      'File storage (unlimited)',
      'Custom feature development',
      'Exclusive beta access',
      'Bi-weekly strategy calls',
      'Co-marketing opportunities',
      'Speaking opportunities at events',
      'Partner program benefits',
      'Flexible contract terms',
      'Custom integrations included'
    ],
    limits: {
      maxProjects: 'unlimited',
      maxTeamMembers: 'unlimited',
      maxStorage: 'unlimited',
      maxMonthlySpend: null,
      revisionRounds: 'unlimited',
      supportResponseTime: '30 minutes'
    },
    pricing: {
      monthlyFee: 2499,
      transactionFee: 0,
      discount: 25,
      minimumCommitment: 12,
      setupFee: 0 // Waived for VIP
    },
    accountManager: {
      id: 'am-vip-001',
      name: 'Michael Chen',
      email: 'michael.chen@kazi.app',
      phone: '+1 (555) 987-6543',
      avatar: '/avatars/michael-chen.jpg',
      title: 'VP of Client Success',
      timezone: 'America/Los_Angeles',
      availability: '24/7 on-call support'
    },
    customization: {
      customDomain: true,
      customColors: true,
      customLogo: true,
      customEmails: true,
      customReports: true,
      ssoIntegration: true
    }
  }
}

// ============================================================================
// SEGMENTATION CRITERIA
// ============================================================================

export const tierCriteria: Record<ClientTier, SegmentationCriteria> = {
  starter: {
    revenue: { min: 0, max: 10000 },
    projects: { min: 0, max: 5 },
    tenure: { min: 0, max: 3 }
  },
  standard: {
    revenue: { min: 10000, max: 25000 },
    projects: { min: 5, max: 15 },
    tenure: { min: 3, max: 12 }
  },
  premium: {
    revenue: { min: 25000, max: 50000 },
    projects: { min: 15, max: 30 },
    tenure: { min: 6 }
  },
  enterprise: {
    revenue: { min: 50000, max: 100000 },
    projects: { min: 30 },
    tenure: { min: 12 }
  },
  vip: {
    revenue: { min: 100000 },
    projects: { min: 50 },
    tenure: { min: 12 },
    healthScore: { min: 90 }
  }
}

// ============================================================================
// SEGMENTATION ENGINE
// ============================================================================

export interface ClientData {
  id: string
  currentTier: ClientTier
  revenue: number // Total lifetime revenue
  projectCount: number
  tenureMonths: number
  healthScore: number
  monthlySpend: number
  growthRate: number // percentage
  engagementScore: number
}

export class ClientSegmentationEngine {
  /**
   * Calculate recommended tier for a client
   */
  calculateRecommendedTier(client: ClientData): ClientTier {
    logger.info('Calculating recommended tier', {
      clientId: client.id,
      currentTier: client.currentTier,
      revenue: client.revenue,
      projects: client.projectCount
    })

    // Check VIP eligibility first (highest tier)
    if (this.meetsVIPCriteria(client)) {
      return 'vip'
    }

    // Check Enterprise
    if (this.meetsCriteria(client, tierCriteria.enterprise)) {
      return 'enterprise'
    }

    // Check Premium
    if (this.meetsCriteria(client, tierCriteria.premium)) {
      return 'premium'
    }

    // Check Standard
    if (this.meetsCriteria(client, tierCriteria.standard)) {
      return 'standard'
    }

    // Default to Starter
    return 'starter'
  }

  /**
   * Check if client meets VIP criteria
   */
  private meetsVIPCriteria(client: ClientData): boolean {
    const criteria = tierCriteria.vip

    return (
      client.revenue >= criteria.revenue.min &&
      client.projectCount >= criteria.projects.min &&
      client.tenureMonths >= criteria.tenure.min &&
      (criteria.healthScore ? client.healthScore >= criteria.healthScore.min : true)
    )
  }

  /**
   * Check if client meets tier criteria
   */
  private meetsCriteria(
    client: ClientData,
    criteria: SegmentationCriteria
  ): boolean {
    // Revenue check
    const revenueOk =
      client.revenue >= criteria.revenue.min &&
      (!criteria.revenue.max || client.revenue < criteria.revenue.max)

    // Projects check
    const projectsOk =
      client.projectCount >= criteria.projects.min &&
      (!criteria.projects.max || client.projectCount < criteria.projects.max)

    // Tenure check
    const tenureOk =
      client.tenureMonths >= criteria.tenure.min &&
      (!criteria.tenure.max || client.tenureMonths < criteria.tenure.max)

    // Health score check (if specified)
    const healthOk = criteria.healthScore
      ? client.healthScore >= criteria.healthScore.min &&
        (!criteria.healthScore.max || client.healthScore < criteria.healthScore.max)
      : true

    return revenueOk && projectsOk && tenureOk && healthOk
  }

  /**
   * Get segmentation for a client
   */
  getSegmentation(clientTier: ClientTier): ClientSegmentation {
    return tierDefinitions[clientTier]
  }

  /**
   * Calculate tier upgrade opportunity
   */
  calculateUpgradeOpportunity(client: ClientData): {
    shouldUpgrade: boolean
    recommendedTier: ClientTier
    savings: number
    reasoning: string[]
  } {
    const recommendedTier = this.calculateRecommendedTier(client)
    const currentTierDef = tierDefinitions[client.currentTier]
    const recommendedTierDef = tierDefinitions[recommendedTier]

    // No upgrade if already at recommended tier
    if (client.currentTier === recommendedTier) {
      return {
        shouldUpgrade: false,
        recommendedTier: client.currentTier,
        savings: 0,
        reasoning: ['Client is at optimal tier for their usage']
      }
    }

    // Calculate potential savings
    const currentDiscount = currentTierDef.pricing.discount
    const newDiscount = recommendedTierDef.pricing.discount
    const discountImprovement = newDiscount - currentDiscount
    const monthlySavings =
      (client.monthlySpend * discountImprovement) / 100 -
      (recommendedTierDef.pricing.monthlyFee - currentTierDef.pricing.monthlyFee)

    const annualSavings = monthlySavings * 12

    // Build reasoning
    const reasoning: string[] = []

    if (client.revenue > tierCriteria[client.currentTier].revenue.max!) {
      reasoning.push(`Revenue ($${client.revenue.toLocaleString()}) exceeds ${client.currentTier} tier limit`)
    }

    if (client.projectCount > (tierCriteria[client.currentTier].projects.max || 0)) {
      reasoning.push(`Project count (${client.projectCount}) exceeds ${client.currentTier} tier limit`)
    }

    if (monthlySavings > 0) {
      reasoning.push(`Would save $${annualSavings.toLocaleString()}/year with ${recommendedTier} tier discount`)
    }

    const newFeatures = this.getNewFeatures(client.currentTier, recommendedTier)
    if (newFeatures.length > 0) {
      reasoning.push(`Unlock ${newFeatures.length} new features: ${newFeatures.slice(0, 3).join(', ')}`)
    }

    logger.info('Upgrade opportunity calculated', {
      clientId: client.id,
      currentTier: client.currentTier,
      recommendedTier,
      savings: annualSavings,
      shouldUpgrade: true
    })

    return {
      shouldUpgrade: true,
      recommendedTier,
      savings: annualSavings,
      reasoning
    }
  }

  /**
   * Get new features when upgrading
   */
  private getNewFeatures(
    currentTier: ClientTier,
    newTier: ClientTier
  ): string[] {
    const currentFeatures = tierDefinitions[currentTier].features
    const newFeatures = tierDefinitions[newTier].features

    const additions: string[] = []

    for (const [feature, enabled] of Object.entries(newFeatures)) {
      if (enabled && !currentFeatures[feature as keyof TierFeatures]) {
        // Convert camelCase to readable format
        const readable = feature.replace(/([A-Z])/g, ' $1').toLowerCase()
        additions.push(readable.charAt(0).toUpperCase() + readable.slice(1))
      }
    }

    return additions
  }

  /**
   * Get personalized dashboard config
   */
  getPersonalizedDashboard(client: ClientData): PersonalizedDashboard {
    const segmentation = this.getSegmentation(client.currentTier)
    const upgradeOpp = this.calculateUpgradeOpportunity(client)

    return {
      tier: client.currentTier,
      widgets: this.getAvailableWidgets(segmentation),
      features: segmentation.features,
      showUpgradePrompt: upgradeOpp.shouldUpgrade,
      upgradeOpportunity: upgradeOpp,
      accountManager: segmentation.accountManager,
      customization: segmentation.customization
    }
  }

  /**
   * Get available dashboard widgets based on tier
   */
  private getAvailableWidgets(segmentation: ClientSegmentation): string[] {
    const widgets = ['projects', 'messages', 'invoices', 'files']

    if (segmentation.features.advancedAnalytics) {
      widgets.push('analytics', 'roi_calculator', 'benchmarks')
    }

    if (segmentation.features.aiFeatures) {
      widgets.push('ai_assistant', 'ai_insights')
    }

    if (segmentation.features.customBranding) {
      widgets.push('branding_settings')
    }

    if (segmentation.features.apiAccess) {
      widgets.push('api_keys', 'webhooks')
    }

    if (segmentation.accountManager) {
      widgets.push('account_manager_contact')
    }

    return widgets
  }

  /**
   * Check if client has access to feature
   */
  hasFeatureAccess(clientTier: ClientTier, feature: keyof TierFeatures): boolean {
    return tierDefinitions[clientTier].features[feature]
  }

  /**
   * Get feature comparison between tiers
   */
  getFeatureComparison(
    tier1: ClientTier,
    tier2: ClientTier
  ): FeatureComparison[] {
    const tier1Features = tierDefinitions[tier1].features
    const tier2Features = tierDefinitions[tier2].features

    const comparisons: FeatureComparison[] = []

    for (const [feature, _] of Object.entries(tier1Features)) {
      const key = feature as keyof TierFeatures
      comparisons.push({
        feature: key,
        tier1Has: tier1Features[key],
        tier2Has: tier2Features[key],
        difference: tier2Features[key] && !tier1Features[key]
      })
    }

    return comparisons
  }
}

// ============================================================================
// ADDITIONAL TYPES
// ============================================================================

export interface PersonalizedDashboard {
  tier: ClientTier
  widgets: string[]
  features: TierFeatures
  showUpgradePrompt: boolean
  upgradeOpportunity: {
    shouldUpgrade: boolean
    recommendedTier: ClientTier
    savings: number
    reasoning: string[]
  }
  accountManager?: AccountManager
  customization?: CustomizationOptions
}

export interface FeatureComparison {
  feature: keyof TierFeatures
  tier1Has: boolean
  tier2Has: boolean
  difference: boolean // true if tier2 has it but tier1 doesn't
}

// Export singleton instance
export const segmentationEngine = new ClientSegmentationEngine()
