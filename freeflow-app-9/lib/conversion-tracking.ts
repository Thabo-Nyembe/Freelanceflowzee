/**
 * Conversion Tracking & Goals Configuration
 *
 * Comprehensive conversion tracking system for marketing and business goals
 */

export type ConversionGoal =
  | 'signup'
  | 'trial_start'
  | 'plan_upgrade'
  | 'checkout_complete'
  | 'contact_form'
  | 'guest_upload'
  | 'demo_request'
  | 'feature_click'
  | 'blog_subscribe'
  | 'download_resource'

export interface ConversionEvent {
  goal: ConversionGoal
  value?: number
  currency?: string
  properties?: Record<string, any>
  timestamp: string
  userId?: string
  sessionId?: string
  source?: string
  medium?: string
  campaign?: string
}

export interface ConversionFunnel {
  name: string
  steps: string[]
  conversionRate?: number
  dropOffPoints?: Array<{
    step: string
    dropRate: number
  }>
}

/**
 * Conversion Goals Configuration
 */
export const CONVERSION_GOALS = {
  signup: {
    name: 'Sign Up',
    description: 'User creates an account',
    value: 10, // Estimated value in USD
    category: 'acquisition',
    priority: 'high'
  },
  trial_start: {
    name: 'Free Trial Started',
    description: 'User starts 14-day free trial',
    value: 25,
    category: 'activation',
    priority: 'high'
  },
  plan_upgrade: {
    name: 'Plan Upgrade',
    description: 'User upgrades to paid plan',
    value: 100,
    category: 'revenue',
    priority: 'critical'
  },
  checkout_complete: {
    name: 'Checkout Complete',
    description: 'User completes payment',
    value: 50,
    category: 'revenue',
    priority: 'critical'
  },
  contact_form: {
    name: 'Contact Form Submitted',
    description: 'User submits contact/sales form',
    value: 15,
    category: 'lead',
    priority: 'medium'
  },
  guest_upload: {
    name: 'Guest Upload Complete',
    description: 'Guest completes file upload',
    value: 5,
    category: 'engagement',
    priority: 'medium'
  },
  demo_request: {
    name: 'Demo Requested',
    description: 'User requests product demo',
    value: 30,
    category: 'lead',
    priority: 'high'
  },
  feature_click: {
    name: 'Feature Interaction',
    description: 'User interacts with key feature',
    value: 2,
    category: 'engagement',
    priority: 'low'
  },
  blog_subscribe: {
    name: 'Blog Subscription',
    description: 'User subscribes to blog/newsletter',
    value: 8,
    category: 'engagement',
    priority: 'medium'
  },
  download_resource: {
    name: 'Resource Downloaded',
    description: 'User downloads guide/template',
    value: 5,
    category: 'engagement',
    priority: 'low'
  }
} as const

/**
 * Conversion Funnels Configuration
 */
export const CONVERSION_FUNNELS: Record<string, ConversionFunnel> = {
  signup_to_trial: {
    name: 'Sign Up to Trial',
    steps: ['page_view', 'signup_click', 'signup_complete', 'trial_start']
  },
  trial_to_paid: {
    name: 'Trial to Paid Conversion',
    steps: ['trial_start', 'feature_usage', 'upgrade_click', 'checkout_complete']
  },
  guest_to_customer: {
    name: 'Guest to Customer',
    steps: ['guest_upload', 'signup_prompt', 'signup_complete', 'plan_select']
  },
  contact_to_customer: {
    name: 'Contact to Customer',
    steps: ['contact_form', 'demo_complete', 'proposal_sent', 'checkout_complete']
  }
}

/**
 * Track a conversion event
 */
export async function trackConversion(event: ConversionEvent): Promise<boolean> {
  try {
    const response = await fetch('/api/analytics/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      }),
      keepalive: true
    })

    if (!response.ok) {
      console.error('Conversion tracking failed:', await response.text())
      return false
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Conversion]', event.goal, event.value, event.properties)
    }

    return true
  } catch (error) {
    console.error('Failed to track conversion:', error)
    return false
  }
}

/**
 * Track signup conversion
 */
export async function trackSignupConversion(
  userId: string,
  properties?: Record<string, any>
): Promise<void> {
  await trackConversion({
    goal: 'signup',
    userId,
    value: CONVERSION_GOALS.signup.value,
    currency: 'USD',
    properties: {
      ...properties,
      source: getUTMSource(),
      medium: getUTMMedium(),
      campaign: getUTMCampaign()
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Track checkout completion
 */
export async function trackCheckoutConversion(
  userId: string,
  orderValue: number,
  planName: string,
  properties?: Record<string, any>
): Promise<void> {
  await trackConversion({
    goal: 'checkout_complete',
    userId,
    value: orderValue,
    currency: 'USD',
    properties: {
      plan: planName,
      ...properties,
      source: getUTMSource(),
      medium: getUTMMedium(),
      campaign: getUTMCampaign()
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Track contact form submission
 */
export async function trackContactFormConversion(
  email: string,
  properties?: Record<string, any>
): Promise<void> {
  await trackConversion({
    goal: 'contact_form',
    value: CONVERSION_GOALS.contact_form.value,
    currency: 'USD',
    properties: {
      email,
      ...properties,
      source: getUTMSource(),
      medium: getUTMMedium(),
      campaign: getUTMCampaign()
    },
    timestamp: new Date().toISOString()
  })
}

/**
 * Calculate funnel conversion rate
 */
export function calculateFunnelConversion(
  funnel: ConversionFunnel,
  stepCounts: Record<string, number>
): number {
  if (funnel.steps.length === 0) return 0

  const firstStepCount = stepCounts[funnel.steps[0]] || 0
  const lastStepCount = stepCounts[funnel.steps[funnel.steps.length - 1]] || 0

  if (firstStepCount === 0) return 0

  return (lastStepCount / firstStepCount) * 100
}

/**
 * Identify drop-off points in funnel
 */
export function identifyDropOffPoints(
  funnel: ConversionFunnel,
  stepCounts: Record<string, number>
): Array<{ step: string; dropRate: number }> {
  const dropOffs: Array<{ step: string; dropRate: number }> = []

  for (let i = 0; i < funnel.steps.length - 1; i++) {
    const currentStep = funnel.steps[i]
    const nextStep = funnel.steps[i + 1]

    const currentCount = stepCounts[currentStep] || 0
    const nextCount = stepCounts[nextStep] || 0

    if (currentCount > 0) {
      const dropRate = ((currentCount - nextCount) / currentCount) * 100
      if (dropRate > 10) { // Only track significant drop-offs (>10%)
        dropOffs.push({
          step: `${currentStep} → ${nextStep}`,
          dropRate: Math.round(dropRate * 10) / 10
        })
      }
    }
  }

  return dropOffs.sort((a, b) => b.dropRate - a.dropRate)
}

/**
 * Get UTM parameters from URL
 */
function getUTMSource(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_source') || undefined
}

function getUTMMedium(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_medium') || undefined
}

function getUTMCampaign(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_campaign') || undefined
}

/**
 * Store UTM parameters in session for attribution
 */
export function storeUTMParameters(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const utmData = {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
    term: params.get('utm_term'),
    content: params.get('utm_content'),
    timestamp: new Date().toISOString()
  }

  // Only store if there are UTM parameters
  if (Object.values(utmData).some(v => v !== null && v !== undefined)) {
    sessionStorage.setItem('kazi_utm', JSON.stringify(utmData))
  }
}

/**
 * Get stored UTM parameters
 */
export function getStoredUTMParameters(): Record<string, any> | null {
  if (typeof window === 'undefined') return null

  const stored = sessionStorage.getItem('kazi_utm')
  if (!stored) return null

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Revenue attribution helper
 */
export function attributeRevenue(
  revenue: number,
  utmData: Record<string, any> | null
): void {
  if (!utmData) return

  // Send revenue attribution data to analytics
  fetch('/api/analytics/revenue-attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      revenue,
      source: utmData.source,
      medium: utmData.medium,
      campaign: utmData.campaign,
      timestamp: new Date().toISOString()
    }),
    keepalive: true
  }).catch(console.error)
}

/**
 * Goal completion tracker
 */
export class GoalTracker {
  private completedGoals: Set<string> = new Set()

  /**
   * Track goal completion (prevents duplicate tracking)
   */
  async trackGoal(goal: ConversionGoal, properties?: Record<string, any>): Promise<boolean> {
    const goalKey = `${goal}-${JSON.stringify(properties || {})}`

    // Prevent duplicate tracking in same session
    if (this.completedGoals.has(goalKey)) {
      return false
    }

    const success = await trackConversion({
      goal,
      value: CONVERSION_GOALS[goal].value,
      currency: 'USD',
      properties,
      timestamp: new Date().toISOString()
    })

    if (success) {
      this.completedGoals.add(goalKey)
    }

    return success
  }

  /**
   * Check if goal was completed
   */
  hasCompletedGoal(goal: ConversionGoal, properties?: Record<string, any>): boolean {
    const goalKey = `${goal}-${JSON.stringify(properties || {})}`
    return this.completedGoals.has(goalKey)
  }

  /**
   * Reset tracker (for testing)
   */
  reset(): void {
    this.completedGoals.clear()
  }
}

// Export singleton instance
export const goalTracker = new GoalTracker()
