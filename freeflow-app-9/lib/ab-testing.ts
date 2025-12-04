/**
 * A/B Testing Framework
 * Simple, cookie-based A/B testing for marketing experiments
 */

export type Variant = 'A' | 'B'

export interface ABTest {
  id: string
  name: string
  description: string
  variants: {
    A: { name: string; weight: number }
    B: { name: string; weight: number }
  }
  active: boolean
  startDate: string
  endDate?: string
}

export interface ABTestResult {
  testId: string
  variant: Variant
  conversionRate?: number
  sampleSize?: number
}

// Define your A/B tests here
export const AB_TESTS: Record<string, ABTest> = {
  'homepage-hero-headline': {
    id: 'homepage-hero-headline',
    name: 'Homepage Hero Headline',
    description: 'Test different hero headlines for conversion',
    variants: {
      A: { name: 'Run Your Entire Business', weight: 0.5 },
      B: { name: 'Stop Juggling 6+ Tools', weight: 0.5 }
    },
    active: true,
    startDate: '2025-12-04'
  },
  'pricing-cta-button': {
    id: 'pricing-cta-button',
    name: 'Pricing CTA Button Text',
    description: 'Test CTA button copy on pricing page',
    variants: {
      A: { name: 'Start Free Trial', weight: 0.5 },
      B: { name: 'Try Free for 14 Days', weight: 0.5 }
    },
    active: true,
    startDate: '2025-12-04'
  },
  'signup-form-fields': {
    id: 'signup-form-fields',
    name: 'Signup Form Complexity',
    description: 'Test minimal vs detailed signup form',
    variants: {
      A: { name: 'Minimal (Email + Password)', weight: 0.5 },
      B: { name: 'Detailed (Email + Password + Name + Company)', weight: 0.5 }
    },
    active: false,
    startDate: '2025-12-04'
  }
}

/**
 * Get variant for a test (client-side)
 */
export function getVariant(testId: string): Variant {
  if (typeof window === 'undefined') return 'A'

  // Check if user already has a variant assigned
  const cookieName = `ab_test_${testId}`
  const existingVariant = getCookie(cookieName)

  if (existingVariant === 'A' || existingVariant === 'B') {
    return existingVariant
  }

  // Assign new variant based on weights
  const test = AB_TESTS[testId]
  if (!test || !test.active) return 'A'

  const random = Math.random()
  const variant: Variant = random < test.variants.A.weight ? 'A' : 'B'

  // Store variant in cookie (30 days)
  setCookie(cookieName, variant, 30)

  // Track variant assignment
  trackABTestAssignment(testId, variant)

  return variant
}

/**
 * Track A/B test assignment
 */
async function trackABTestAssignment(testId: string, variant: Variant): Promise<void> {
  try {
    await fetch('/api/analytics/ab-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'variant_assigned',
        testId,
        variant,
        timestamp: new Date().toISOString()
      }),
      keepalive: true
    })
  } catch (error) {
    console.error('Failed to track A/B test assignment:', error)
  }
}

/**
 * Track A/B test conversion
 */
export async function trackABTestConversion(testId: string, variant?: Variant): Promise<void> {
  try {
    const assignedVariant = variant || getVariant(testId)

    await fetch('/api/analytics/ab-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'conversion',
        testId,
        variant: assignedVariant,
        timestamp: new Date().toISOString()
      }),
      keepalive: true
    })
  } catch (error) {
    console.error('Failed to track A/B test conversion:', error)
  }
}

/**
 * Cookie helpers
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

/**
 * React hook for A/B testing
 */
export function useABTest(testId: string) {
  if (typeof window === 'undefined') {
    return { variant: 'A' as Variant, isVariantB: false }
  }

  const variant = getVariant(testId)
  const isVariantB = variant === 'B'

  return { variant, isVariantB }
}

/**
 * Calculate statistical significance
 * Uses Chi-Square test for A/B test results
 */
export function calculateSignificance(
  variantA: { conversions: number; visitors: number },
  variantB: { conversions: number; visitors: number }
): { significant: boolean; pValue: number; confidence: number } {
  const rateA = variantA.conversions / variantA.visitors
  const rateB = variantB.conversions / variantB.visitors

  const pooledRate =
    (variantA.conversions + variantB.conversions) /
    (variantA.visitors + variantB.visitors)

  const sePooled = Math.sqrt(
    pooledRate *
      (1 - pooledRate) *
      (1 / variantA.visitors + 1 / variantB.visitors)
  )

  const zScore = (rateB - rateA) / sePooled
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))

  return {
    significant: pValue < 0.05,
    pValue: Math.round(pValue * 10000) / 10000,
    confidence: Math.round((1 - pValue) * 100)
  }
}

/**
 * Normal cumulative distribution function
 */
function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))

  return x > 0 ? 1 - prob : prob
}

/**
 * Get test results from database
 */
export async function getABTestResults(testId: string): Promise<ABTestResult | null> {
  try {
    const response = await fetch(`/api/analytics/ab-tests?testId=${testId}`)
    const data = await response.json()

    if (!data.success) {
      return null
    }

    return data.results
  } catch (error) {
    console.error('Failed to get A/B test results:', error)
    return null
  }
}

/**
 * Export test configuration for dashboard
 */
export function getActiveTests(): ABTest[] {
  return Object.values(AB_TESTS).filter(test => test.active)
}

/**
 * Winner declaration helper
 */
export function declareWinner(
  variantA: { conversions: number; visitors: number },
  variantB: { conversions: number; visitors: number },
  minSampleSize: number = 100
): {
  winner: Variant | 'undecided'
  improvement: number
  confidence: number
  recommendation: string
} {
  // Check minimum sample size
  if (variantA.visitors < minSampleSize || variantB.visitors < minSampleSize) {
    return {
      winner: 'undecided',
      improvement: 0,
      confidence: 0,
      recommendation: `Need more data. Current: A=${variantA.visitors}, B=${variantB.visitors}. Target: ${minSampleSize} each.`
    }
  }

  const rateA = variantA.conversions / variantA.visitors
  const rateB = variantB.conversions / variantB.visitors
  const improvement = ((rateB - rateA) / rateA) * 100

  const { significant, confidence } = calculateSignificance(variantA, variantB)

  if (!significant) {
    return {
      winner: 'undecided',
      improvement: Math.round(improvement * 10) / 10,
      confidence,
      recommendation: 'No statistically significant difference. Consider running test longer or trying a different variation.'
    }
  }

  const winner: Variant = rateB > rateA ? 'B' : 'A'

  return {
    winner,
    improvement: Math.abs(Math.round(improvement * 10) / 10),
    confidence,
    recommendation: `Variant ${winner} is the winner with ${confidence}% confidence. ${winner === 'B' ? `Deploy variant B for ${Math.abs(Math.round(improvement))}% improvement.` : 'Keep variant A (control).'}`
  }
}
