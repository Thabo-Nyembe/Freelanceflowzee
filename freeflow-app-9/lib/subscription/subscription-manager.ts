'use client'

import { createClient } from '@/lib/supabase/client'

export type PlanType = 'free' | 'professional' | 'enterprise'

export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  interval: 'monthly' | 'annual'
  features: string[]
  limits: {
    projects: number
    storage: number // in GB
    aiRequests: number // per month
    collaborators: number
    videoMinutes: number // per month
  }
  stripeProductId?: string
  stripePriceId?: string
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Creator Genesis',
    price: 0,
    interval: 'monthly',
    features: [
      '5 quantum AI-powered projects',
      'Basic multi-model AI access (GPT-4o, Claude)',
      '10GB quantum-encrypted storage',
      'Universal Pinpoint System (UPS) basic',
      'Community metaverse access',
      'AI-powered analytics dashboard',
      'Blockchain transaction security',
      'Real-time collaboration (3 users)'
    ],
    limits: {
      projects: 5,
      storage: 10, // GB
      aiRequests: 100,
      collaborators: 3,
      videoMinutes: 60
    },
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID
  },
  professional: {
    id: 'professional',
    name: 'Professional Nexus',
    price: 47,
    interval: 'monthly',
    features: [
      'Unlimited quantum AI projects',
      'Full AI Arsenal (7 premium models)',
      '500GB multi-cloud architecture',
      'Hollywood-grade video studio (8K)',
      'Advanced UPS with sentiment analysis',
      'Blockchain escrow payments (1.9%)',
      'Priority quantum support',
      'Enterprise analytics & predictions',
      'Client metaverse portals',
      'Brand DNA consistency AI',
      'Real-time collaboration (25 users)',
      'Quantum synchronization technology'
    ],
    limits: {
      projects: -1, // unlimited
      storage: 500, // GB
      aiRequests: 5000,
      collaborators: 25,
      videoMinutes: 1000
    },
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRODUCT_ID,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Quantum',
    price: 197,
    interval: 'monthly',
    features: [
      'Everything in Professional Nexus',
      'Unlimited team collaboration',
      'Unlimited quantum storage',
      'White-label quantum platform',
      'Advanced blockchain security',
      'Custom AI model training',
      'Dedicated success architect',
      '99.99% SLA guarantee',
      'Custom integrations & APIs',
      'Advanced workflow automation',
      'Enterprise compliance suite',
      'Holographic presence indicators',
      'AI business strategy optimization',
      'Quantum conflict resolution'
    ],
    limits: {
      projects: -1, // unlimited
      storage: -1, // unlimited
      aiRequests: -1, // unlimited
      collaborators: -1, // unlimited
      videoMinutes: -1 // unlimited
    },
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRODUCT_ID,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
  }
}

export interface UserSubscription {
  id: string
  userId: string
  planType: PlanType
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  usage: {
    projects: number
    storage: number // in GB
    aiRequests: number
    collaborators: number
    videoMinutes: number
  }
  createdAt: Date
  updatedAt: Date
}

export class SubscriptionManager {
  private supabase = createClient()

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        // Return default free plan if no subscription found
        return this.createDefaultFreeSubscription(userId)
      }

      return {
        id: data.id,
        userId: data.user_id,
        planType: data.plan_type as PlanType,
        status: data.status,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        stripeSubscriptionId: data.stripe_subscription_id,
        stripeCustomerId: data.stripe_customer_id,
        usage: data.usage || {
          projects: 0,
          storage: 0,
          aiRequests: 0,
          collaborators: 0,
          videoMinutes: 0
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return this.createDefaultFreeSubscription(userId)
    }
  }

  private async createDefaultFreeSubscription(userId: string): Promise<UserSubscription> {
    const now = new Date()
    const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

    return {
      id: `free_${userId}`,
      userId,
      planType: 'free',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
      usage: {
        projects: 0,
        storage: 0,
        aiRequests: 0,
        collaborators: 0,
        videoMinutes: 0
      },
      createdAt: now,
      updatedAt: now
    }
  }

  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) return false

    const plan = SUBSCRIPTION_PLANS[subscription.planType]
    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
  }

  async checkUsageLimit(userId: string, limitType: keyof UserSubscription['usage']): Promise<{
    allowed: boolean
    current: number
    limit: number
    plan: PlanType
  }> {
    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return { allowed: false, current: 0, limit: 0, plan: 'free' }
    }

    const plan = SUBSCRIPTION_PLANS[subscription.planType]
    const currentUsage = subscription.usage[limitType]
    const limit = plan.limits[limitType]

    // -1 means unlimited
    const allowed = limit === -1 || currentUsage < limit

    return {
      allowed,
      current: currentUsage,
      limit,
      plan: subscription.planType
    }
  }

  async incrementUsage(userId: string, limitType: keyof UserSubscription['usage'], amount: number = 1): Promise<boolean> {
    try {
      const usageCheck = await this.checkUsageLimit(userId, limitType)

      if (!usageCheck.allowed) {
        return false
      }

      // Update usage in database
      const { error } = await this.supabase
        .from('user_subscriptions')
        .update({
          [`usage.${limitType}`]: usageCheck.current + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      return !error
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  }

  getPlanFeatures(planType: PlanType): SubscriptionPlan {
    return SUBSCRIPTION_PLANS[planType]
  }

  getUpgradeUrl(currentPlan: PlanType): string {
    if (currentPlan === 'free') {
      return '/pricing'
    }
    if (currentPlan === 'professional') {
      return '/contact' // Enterprise requires consultation
    }
    return '/pricing'
  }

  async createGuestSession(email?: string): Promise<string> {
    // Create temporary guest session for payments without account
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store guest session in localStorage for client-side tracking
    if (typeof window !== 'undefined') {
      localStorage.setItem('kazi_guest_session', guestId)
      if (email) {
        localStorage.setItem('kazi_guest_email', email)
      }
    }

    return guestId
  }

  getGuestSession(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kazi_guest_session')
    }
    return null
  }

  async canUseFeature(userId: string | null, feature: string): Promise<{
    allowed: boolean
    reason?: string
    upgradeUrl?: string
    currentPlan: PlanType
  }> {
    // Guest users get limited access
    if (!userId) {
      const guestSession = this.getGuestSession()
      if (!guestSession) {
        return {
          allowed: false,
          reason: 'Please create an account or start a guest session',
          upgradeUrl: '/signup',
          currentPlan: 'free'
        }
      }

      // Allow basic features for guests
      const guestAllowedFeatures = ['basic_projects', 'community_access', 'basic_analytics']
      return {
        allowed: guestAllowedFeatures.includes(feature),
        reason: guestAllowedFeatures.includes(feature) ? undefined : 'This feature requires an account',
        upgradeUrl: '/signup',
        currentPlan: 'free'
      }
    }

    const subscription = await this.getUserSubscription(userId)
    if (!subscription) {
      return {
        allowed: false,
        reason: 'Unable to determine subscription status',
        currentPlan: 'free'
      }
    }

    const hasAccess = await this.hasFeatureAccess(userId, feature)

    return {
      allowed: hasAccess,
      reason: hasAccess ? undefined : `This feature requires ${subscription.planType === 'free' ? 'Professional' : 'Enterprise'} plan`,
      upgradeUrl: hasAccess ? undefined : this.getUpgradeUrl(subscription.planType),
      currentPlan: subscription.planType
    }
  }
}

export const subscriptionManager = new SubscriptionManager()