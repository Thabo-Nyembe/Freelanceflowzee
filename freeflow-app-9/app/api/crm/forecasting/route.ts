import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('crm-api')

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type ForecastPeriod = 'week' | 'month' | 'quarter' | 'year'
export type ForecastCategory = 'commit' | 'best_case' | 'pipeline' | 'upside' | 'omitted'
export type ForecastGranularity = 'daily' | 'weekly' | 'monthly' | 'quarterly'
export type TrendDirection = 'up' | 'down' | 'stable'

export interface ForecastSettings {
  id: string
  organization_id: string
  fiscal_year_start_month: number // 1-12
  quota_period: ForecastPeriod
  default_win_rate: number
  include_weighted_pipeline: boolean
  include_closed_won: boolean
  category_definitions: CategoryDefinition[]
  created_at: string
  updated_at: string
}

export interface CategoryDefinition {
  category: ForecastCategory
  min_probability: number
  max_probability: number
  label: string
  description: string
  color: string
  include_in_forecast: boolean
}

export interface ForecastData {
  period: string
  period_start: string
  period_end: string
  closed_won: number
  commit: number
  best_case: number
  pipeline: number
  upside: number
  total_weighted: number
  total_unweighted: number
  quota: number
  quota_attainment: number
  pipeline_coverage: number
  deal_count: number
  avg_deal_size: number
  win_rate: number
}

export interface RepForecast {
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string | null
  quota: number
  closed_won: number
  commit: number
  best_case: number
  pipeline: number
  total_weighted: number
  quota_attainment: number
  pipeline_coverage: number
  deals_to_close: number
  avg_deal_size: number
  win_rate: number
  trend: TrendDirection
  trend_percentage: number
}

export interface TeamForecast {
  team_id: string
  team_name: string
  manager_id: string
  manager_name: string
  members: RepForecast[]
  total_quota: number
  total_closed_won: number
  total_commit: number
  total_best_case: number
  total_pipeline: number
  total_weighted: number
  quota_attainment: number
  pipeline_coverage: number
  trend: TrendDirection
}

export interface ForecastTrend {
  period: string
  value: number
  quota: number
  attainment: number
  year_over_year_change: number | null
  quarter_over_quarter_change: number | null
  month_over_month_change: number | null
}

export interface WinRateAnalysis {
  overall_win_rate: number
  win_rate_by_stage: { stage: string; win_rate: number; deals_entered: number; deals_won: number }[]
  win_rate_by_source: { source: string; win_rate: number; deals: number }[]
  win_rate_by_size: { size_range: string; win_rate: number; deals: number }[]
  win_rate_by_rep: { rep_id: string; rep_name: string; win_rate: number; deals: number }[]
  win_rate_trend: { period: string; win_rate: number }[]
  avg_days_to_close: number
  avg_days_to_close_by_stage: { stage: string; avg_days: number }[]
}

export interface PipelineAnalysis {
  total_pipeline_value: number
  weighted_pipeline_value: number
  pipeline_by_stage: { stage: string; value: number; count: number; weighted_value: number }[]
  pipeline_by_category: { category: ForecastCategory; value: number; count: number }[]
  pipeline_velocity: number // deals closed per period
  avg_sales_cycle: number // days
  pipeline_coverage: number // pipeline / quota
  pipeline_health: {
    healthy_deals: number
    at_risk_deals: number
    stale_deals: number
    overdue_deals: number
  }
  aging_analysis: {
    range: string
    count: number
    value: number
  }[]
}

export interface AIForecastPrediction {
  predicted_revenue: number
  confidence_interval: { low: number; high: number }
  confidence_score: number
  factors: {
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    weight: number
    description: string
  }[]
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    action: string
    expected_impact: number
    affected_deals: string[]
  }[]
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high'
    risks: {
      risk: string
      probability: number
      impact: number
      mitigation: string
    }[]
  }
}

export interface Quota {
  id: string
  user_id: string | null
  team_id: string | null
  organization_id: string
  period: ForecastPeriod
  period_start: string
  period_end: string
  amount: number
  currency: string
  type: 'revenue' | 'units' | 'deals'
  created_at: string
  updated_at: string
}

export interface ForecastSubmission {
  id: string
  user_id: string
  period: string
  period_start: string
  period_end: string
  commit: number
  best_case: number
  pipeline: number
  notes: string | null
  submitted_at: string
  approved_by: string | null
  approved_at: string | null
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const ForecastQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('quarter'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  user_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  pipeline_id: z.string().uuid().optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly'),
  include_ai_predictions: z.coerce.boolean().default(false),
})

const QuotaSchema = z.object({
  user_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  period: z.enum(['week', 'month', 'quarter', 'year']),
  period_start: z.string(),
  period_end: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  type: z.enum(['revenue', 'units', 'deals']).default('revenue'),
})

const ForecastSubmissionSchema = z.object({
  period: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  commit: z.number().min(0),
  best_case: z.number().min(0),
  pipeline: z.number().min(0),
  notes: z.string().optional(),
})

const ForecastSettingsSchema = z.object({
  fiscal_year_start_month: z.number().min(1).max(12).default(1),
  quota_period: z.enum(['week', 'month', 'quarter', 'year']).default('quarter'),
  default_win_rate: z.number().min(0).max(100).default(25),
  include_weighted_pipeline: z.boolean().default(true),
  include_closed_won: z.boolean().default(true),
  category_definitions: z.array(z.object({
    category: z.enum(['commit', 'best_case', 'pipeline', 'upside', 'omitted']),
    min_probability: z.number().min(0).max(100),
    max_probability: z.number().min(0).max(100),
    label: z.string(),
    description: z.string(),
    color: z.string(),
    include_in_forecast: z.boolean(),
  })).optional(),
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getPeriodDates(period: ForecastPeriod, referenceDate: Date = new Date()): { start: Date; end: Date } {
  const now = new Date(referenceDate)
  let start: Date
  let end: Date

  switch (period) {
    case 'week':
      const dayOfWeek = now.getDay()
      start = new Date(now)
      start.setDate(now.getDate() - dayOfWeek)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      start = new Date(now.getFullYear(), quarter * 3, 1)
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
      break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function formatPeriodLabel(date: Date, granularity: ForecastGranularity): string {
  switch (granularity) {
    case 'daily':
      return date.toISOString().split('T')[0]
    case 'weekly':
      const weekNum = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)
      return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
    case 'monthly':
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    case 'quarterly':
      const q = Math.floor(date.getMonth() / 3) + 1
      return `${date.getFullYear()}-Q${q}`
    default:
      return date.toISOString().split('T')[0]
  }
}

function categorizeDeal(probability: number): ForecastCategory {
  if (probability >= 90) return 'commit'
  if (probability >= 70) return 'best_case'
  if (probability >= 30) return 'pipeline'
  if (probability >= 10) return 'upside'
  return 'omitted'
}

function calculateTrend(current: number, previous: number): { direction: TrendDirection; percentage: number } {
  if (previous === 0) return { direction: 'stable', percentage: 0 }
  const change = ((current - previous) / previous) * 100
  if (change > 5) return { direction: 'up', percentage: change }
  if (change < -5) return { direction: 'down', percentage: change }
  return { direction: 'stable', percentage: change }
}

function calculatePipelineCoverage(pipeline: number, quota: number): number {
  if (quota === 0) return 0
  return (pipeline / quota) * 100
}

function calculateQuotaAttainment(achieved: number, quota: number): number {
  if (quota === 0) return 0
  return (achieved / quota) * 100
}

// AI prediction simulation (in production, this would call an ML model)
function generateAIPrediction(
  deals: any[],
  historicalData: any[],
  quota: number
): AIForecastPrediction {
  // Calculate base prediction from weighted pipeline
  const weightedPipeline = deals.reduce((sum, deal) =>
    sum + (deal.value * (deal.probability / 100)), 0
  )

  // Calculate historical win rate
  const historicalWinRate = historicalData.length > 0
    ? historicalData.filter(d => d.status === 'won').length / historicalData.length
    : 0.25

  // Simulate ML prediction with confidence intervals
  const predictedRevenue = weightedPipeline * (1 + (Math.random() * 0.1 - 0.05))
  const variance = predictedRevenue * 0.15

  // Identify risk factors
  const staleDealCount = deals.filter(d => {
    const daysSinceUpdate = (Date.now() - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > 30
  }).length

  const riskLevel: 'low' | 'medium' | 'high' =
    staleDealCount > deals.length * 0.3 ? 'high' :
    staleDealCount > deals.length * 0.15 ? 'medium' : 'low'

  return {
    predicted_revenue: Math.round(predictedRevenue),
    confidence_interval: {
      low: Math.round(predictedRevenue - variance),
      high: Math.round(predictedRevenue + variance),
    },
    confidence_score: 0.72 + (Math.random() * 0.15),
    factors: [
      {
        factor: 'Historical Win Rate',
        impact: historicalWinRate > 0.3 ? 'positive' : 'negative',
        weight: 0.35,
        description: `Win rate of ${(historicalWinRate * 100).toFixed(1)}% ${historicalWinRate > 0.3 ? 'exceeds' : 'below'} benchmark`,
      },
      {
        factor: 'Pipeline Velocity',
        impact: deals.length > 10 ? 'positive' : 'neutral',
        weight: 0.25,
        description: `${deals.length} active deals in pipeline`,
      },
      {
        factor: 'Deal Aging',
        impact: staleDealCount > 3 ? 'negative' : 'positive',
        weight: 0.20,
        description: `${staleDealCount} deals haven't been updated in 30+ days`,
      },
      {
        factor: 'Seasonality',
        impact: 'neutral',
        weight: 0.10,
        description: 'Current period shows typical seasonal patterns',
      },
      {
        factor: 'Economic Indicators',
        impact: 'neutral',
        weight: 0.10,
        description: 'Market conditions remain stable',
      },
    ],
    recommendations: [
      {
        priority: 'high',
        action: 'Focus on commit-stage deals to accelerate close',
        expected_impact: predictedRevenue * 0.15,
        affected_deals: deals
          .filter(d => d.probability >= 80)
          .slice(0, 3)
          .map(d => d.id),
      },
      {
        priority: 'medium',
        action: 'Re-engage stale pipeline deals',
        expected_impact: predictedRevenue * 0.08,
        affected_deals: deals
          .filter(d => {
            const daysSinceUpdate = (Date.now() - new Date(d.updated_at).getTime()) / (1000 * 60 * 60 * 24)
            return daysSinceUpdate > 14
          })
          .slice(0, 5)
          .map(d => d.id),
      },
      {
        priority: 'low',
        action: 'Increase prospecting to build next quarter pipeline',
        expected_impact: predictedRevenue * 0.20,
        affected_deals: [],
      },
    ],
    risk_assessment: {
      overall_risk: riskLevel,
      risks: [
        {
          risk: 'Stale Pipeline',
          probability: staleDealCount / Math.max(deals.length, 1),
          impact: 0.3,
          mitigation: 'Schedule discovery calls with inactive accounts',
        },
        {
          risk: 'Deal Slippage',
          probability: 0.25,
          impact: 0.4,
          mitigation: 'Confirm close dates with decision makers',
        },
        {
          risk: 'Competitor Loss',
          probability: 0.15,
          impact: 0.35,
          mitigation: 'Strengthen value proposition in late-stage deals',
        },
      ],
    },
  }
}

const defaultCategoryDefinitions: CategoryDefinition[] = [
  {
    category: 'commit',
    min_probability: 90,
    max_probability: 100,
    label: 'Commit',
    description: 'Deals highly likely to close this period',
    color: '#22c55e',
    include_in_forecast: true,
  },
  {
    category: 'best_case',
    min_probability: 70,
    max_probability: 89,
    label: 'Best Case',
    description: 'Deals with good chance of closing',
    color: '#3b82f6',
    include_in_forecast: true,
  },
  {
    category: 'pipeline',
    min_probability: 30,
    max_probability: 69,
    label: 'Pipeline',
    description: 'Active deals being worked',
    color: '#f59e0b',
    include_in_forecast: true,
  },
  {
    category: 'upside',
    min_probability: 10,
    max_probability: 29,
    label: 'Upside',
    description: 'Early stage or uncertain deals',
    color: '#8b5cf6',
    include_in_forecast: false,
  },
  {
    category: 'omitted',
    min_probability: 0,
    max_probability: 9,
    label: 'Omitted',
    description: 'Deals excluded from forecast',
    color: '#6b7280',
    include_in_forecast: false,
  },
]

// =============================================================================
// API HANDLERS
// =============================================================================

// GET /api/crm/forecasting - Get forecast data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'forecast'

    // Parse and validate query parameters
    const queryParams = ForecastQuerySchema.parse({
      period: searchParams.get('period') || 'quarter',
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
      user_id: searchParams.get('user_id'),
      team_id: searchParams.get('team_id'),
      pipeline_id: searchParams.get('pipeline_id'),
      granularity: searchParams.get('granularity') || 'monthly',
      include_ai_predictions: searchParams.get('include_ai_predictions') === 'true',
    })

    // Determine date range
    let startDate: Date
    let endDate: Date

    if (queryParams.start_date && queryParams.end_date) {
      startDate = new Date(queryParams.start_date)
      endDate = new Date(queryParams.end_date)
    } else {
      const periodDates = getPeriodDates(queryParams.period)
      startDate = periodDates.start
      endDate = periodDates.end
    }

    switch (action) {
      case 'forecast': {
        // Get deals in pipeline
        let dealsQuery = supabase
          .from('deals')
          .select(`
            *,
            company:companies(id, name),
            contact:contacts(id, first_name, last_name),
            owner:users(id, name, email, avatar_url)
          `)
          .in('status', ['open', 'won'])
          .gte('expected_close_date', startDate.toISOString())
          .lte('expected_close_date', endDate.toISOString())

        if (queryParams.user_id) {
          dealsQuery = dealsQuery.eq('owner_id', queryParams.user_id)
        }
        if (queryParams.pipeline_id) {
          dealsQuery = dealsQuery.eq('pipeline_id', queryParams.pipeline_id)
        }

        const { data: deals, error: dealsError } = await dealsQuery

        if (dealsError) {
          logger.error('Deals fetch error', { error: dealsError })
          // Return empty forecast if table doesn't exist
          return NextResponse.json({
            period: formatPeriodLabel(startDate, queryParams.granularity),
            period_start: startDate.toISOString(),
            period_end: endDate.toISOString(),
            closed_won: 0,
            commit: 0,
            best_case: 0,
            pipeline: 0,
            upside: 0,
            total_weighted: 0,
            total_unweighted: 0,
            quota: 0,
            quota_attainment: 0,
            pipeline_coverage: 0,
            deal_count: 0,
            avg_deal_size: 0,
            win_rate: 0,
            deals_by_category: [],
            ai_prediction: null,
          })
        }

        // Get quota
        const { data: quotaData } = await supabase
          .from('quotas')
          .select('*')
          .gte('period_start', startDate.toISOString())
          .lte('period_end', endDate.toISOString())
          .maybeSingle()

        const quota = quotaData?.amount || 0

        // Categorize deals
        const categorizedDeals = (deals || []).map(deal => ({
          ...deal,
          category: deal.status === 'won' ? 'closed_won' as const : categorizeDeal(deal.probability || 0),
        }))

        // Calculate forecast metrics
        const closedWon = categorizedDeals
          .filter(d => d.status === 'won')
          .reduce((sum, d) => sum + (d.value || 0), 0)

        const commit = categorizedDeals
          .filter(d => d.category === 'commit')
          .reduce((sum, d) => sum + (d.value || 0), 0)

        const bestCase = categorizedDeals
          .filter(d => d.category === 'best_case')
          .reduce((sum, d) => sum + (d.value || 0), 0)

        const pipeline = categorizedDeals
          .filter(d => d.category === 'pipeline')
          .reduce((sum, d) => sum + (d.value || 0), 0)

        const upside = categorizedDeals
          .filter(d => d.category === 'upside')
          .reduce((sum, d) => sum + (d.value || 0), 0)

        const totalUnweighted = commit + bestCase + pipeline + upside
        const totalWeighted = categorizedDeals
          .filter(d => d.status !== 'won')
          .reduce((sum, d) => sum + ((d.value || 0) * ((d.probability || 0) / 100)), 0)

        const dealCount = categorizedDeals.filter(d => d.status !== 'won').length
        const avgDealSize = dealCount > 0 ? totalUnweighted / dealCount : 0

        // Get historical deals for win rate
        const { data: historicalDeals } = await supabase
          .from('deals')
          .select('id, status')
          .in('status', ['won', 'lost'])
          .gte('closed_at', new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString())

        const wonDeals = (historicalDeals || []).filter(d => d.status === 'won').length
        const totalClosed = (historicalDeals || []).length
        const winRate = totalClosed > 0 ? (wonDeals / totalClosed) * 100 : 0

        // AI Prediction if requested
        let aiPrediction = null
        if (queryParams.include_ai_predictions) {
          aiPrediction = generateAIPrediction(
            categorizedDeals.filter(d => d.status !== 'won'),
            historicalDeals || [],
            quota
          )
        }

        const forecastData: ForecastData & {
          deals_by_category: any[]
          ai_prediction: AIForecastPrediction | null
        } = {
          period: formatPeriodLabel(startDate, queryParams.granularity),
          period_start: startDate.toISOString(),
          period_end: endDate.toISOString(),
          closed_won: closedWon,
          commit,
          best_case: bestCase,
          pipeline,
          upside,
          total_weighted: totalWeighted,
          total_unweighted: totalUnweighted,
          quota,
          quota_attainment: calculateQuotaAttainment(closedWon + totalWeighted, quota),
          pipeline_coverage: calculatePipelineCoverage(totalUnweighted, quota),
          deal_count: dealCount,
          avg_deal_size: avgDealSize,
          win_rate: winRate,
          deals_by_category: [
            { category: 'closed_won', value: closedWon, count: categorizedDeals.filter(d => d.status === 'won').length },
            { category: 'commit', value: commit, count: categorizedDeals.filter(d => d.category === 'commit').length },
            { category: 'best_case', value: bestCase, count: categorizedDeals.filter(d => d.category === 'best_case').length },
            { category: 'pipeline', value: pipeline, count: categorizedDeals.filter(d => d.category === 'pipeline').length },
            { category: 'upside', value: upside, count: categorizedDeals.filter(d => d.category === 'upside').length },
          ],
          ai_prediction: aiPrediction,
        }

        return NextResponse.json(forecastData)
      }

      case 'team': {
        // Get team forecast
        const { data: teamMembers } = await supabase
          .from('team_members')
          .select(`
            user_id,
            team_id,
            user:users(id, name, email, avatar_url),
            team:teams(id, name, manager_id)
          `)
          .eq('team_id', queryParams.team_id || '')

        if (!teamMembers || teamMembers.length === 0) {
          return NextResponse.json({
            error: 'Team not found or has no members'
          }, { status: 404 })
        }

        const userIds = teamMembers.map(m => m.user_id)

        // Get deals for team members
        const { data: deals } = await supabase
          .from('deals')
          .select('*')
          .in('owner_id', userIds)
          .in('status', ['open', 'won'])
          .gte('expected_close_date', startDate.toISOString())
          .lte('expected_close_date', endDate.toISOString())

        // Get quotas for team members
        const { data: quotas } = await supabase
          .from('quotas')
          .select('*')
          .in('user_id', userIds)
          .gte('period_start', startDate.toISOString())
          .lte('period_end', endDate.toISOString())

        // Calculate per-rep forecasts
        const repForecasts: RepForecast[] = teamMembers.map(member => {
          const userDeals = (deals || []).filter(d => d.owner_id === member.user_id)
          const userQuota = quotas?.find(q => q.user_id === member.user_id)?.amount || 0

          const closedWon = userDeals.filter(d => d.status === 'won').reduce((sum, d) => sum + (d.value || 0), 0)
          const commit = userDeals.filter(d => d.probability >= 90 && d.status !== 'won').reduce((sum, d) => sum + (d.value || 0), 0)
          const bestCase = userDeals.filter(d => d.probability >= 70 && d.probability < 90).reduce((sum, d) => sum + (d.value || 0), 0)
          const pipelineVal = userDeals.filter(d => d.probability >= 30 && d.probability < 70).reduce((sum, d) => sum + (d.value || 0), 0)
          const weighted = userDeals.filter(d => d.status !== 'won').reduce((sum, d) => sum + ((d.value || 0) * ((d.probability || 0) / 100)), 0)

          return {
            user_id: member.user_id,
            user_name: (member.user as any)?.name || 'Unknown',
            user_email: (member.user as any)?.email || '',
            user_avatar: (member.user as any)?.avatar_url || null,
            quota: userQuota,
            closed_won: closedWon,
            commit,
            best_case: bestCase,
            pipeline: pipelineVal,
            total_weighted: weighted,
            quota_attainment: calculateQuotaAttainment(closedWon + weighted, userQuota),
            pipeline_coverage: calculatePipelineCoverage(commit + bestCase + pipelineVal, userQuota),
            deals_to_close: userDeals.filter(d => d.status !== 'won').length,
            avg_deal_size: userDeals.length > 0 ? userDeals.reduce((sum, d) => sum + (d.value || 0), 0) / userDeals.length : 0,
            win_rate: 0, // Would need historical data
            trend: 'stable' as TrendDirection,
            trend_percentage: 0,
          }
        })

        // Calculate team totals
        const team = teamMembers[0]?.team as any
        const teamForecast: TeamForecast = {
          team_id: queryParams.team_id || '',
          team_name: team?.name || 'Unknown Team',
          manager_id: team?.manager_id || '',
          manager_name: '', // Would need to join
          members: repForecasts,
          total_quota: repForecasts.reduce((sum, r) => sum + r.quota, 0),
          total_closed_won: repForecasts.reduce((sum, r) => sum + r.closed_won, 0),
          total_commit: repForecasts.reduce((sum, r) => sum + r.commit, 0),
          total_best_case: repForecasts.reduce((sum, r) => sum + r.best_case, 0),
          total_pipeline: repForecasts.reduce((sum, r) => sum + r.pipeline, 0),
          total_weighted: repForecasts.reduce((sum, r) => sum + r.total_weighted, 0),
          quota_attainment: calculateQuotaAttainment(
            repForecasts.reduce((sum, r) => sum + r.closed_won + r.total_weighted, 0),
            repForecasts.reduce((sum, r) => sum + r.quota, 0)
          ),
          pipeline_coverage: calculatePipelineCoverage(
            repForecasts.reduce((sum, r) => sum + r.commit + r.best_case + r.pipeline, 0),
            repForecasts.reduce((sum, r) => sum + r.quota, 0)
          ),
          trend: 'stable',
        }

        return NextResponse.json(teamForecast)
      }

      case 'trends': {
        // Get historical forecast data for trends
        const { data: historicalDeals } = await supabase
          .from('deals')
          .select('*')
          .in('status', ['won'])
          .gte('closed_at', new Date(startDate.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString())
          .order('closed_at', { ascending: true })

        // Group by period
        const trendData: ForecastTrend[] = []
        const periodMap = new Map<string, number>()

        ;(historicalDeals || []).forEach(deal => {
          const closedDate = new Date(deal.closed_at)
          const periodLabel = formatPeriodLabel(closedDate, queryParams.granularity)
          periodMap.set(periodLabel, (periodMap.get(periodLabel) || 0) + (deal.value || 0))
        })

        let previousValue = 0
        Array.from(periodMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(([period, value], index) => {
            const trend = calculateTrend(value, previousValue)
            trendData.push({
              period,
              value,
              quota: 0, // Would need to fetch historical quotas
              attainment: 0,
              year_over_year_change: null, // Would need more historical data
              quarter_over_quarter_change: null,
              month_over_month_change: index > 0 ? trend.percentage : null,
            })
            previousValue = value
          })

        return NextResponse.json({ trends: trendData })
      }

      case 'win-rate': {
        // Get win rate analysis
        const { data: closedDeals } = await supabase
          .from('deals')
          .select(`
            *,
            owner:users(id, name)
          `)
          .in('status', ['won', 'lost'])
          .gte('closed_at', new Date(startDate.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString())

        const wonDeals = (closedDeals || []).filter(d => d.status === 'won')
        const lostDeals = (closedDeals || []).filter(d => d.status === 'lost')
        const totalDeals = closedDeals?.length || 0

        const overallWinRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0

        // Win rate by rep
        const repStats = new Map<string, { won: number; total: number; name: string }>()
        ;(closedDeals || []).forEach(deal => {
          const key = deal.owner_id || 'unassigned'
          const current = repStats.get(key) || { won: 0, total: 0, name: (deal.owner as any)?.name || 'Unassigned' }
          current.total++
          if (deal.status === 'won') current.won++
          repStats.set(key, current)
        })

        const winRateByRep = Array.from(repStats.entries()).map(([id, stats]) => ({
          rep_id: id,
          rep_name: stats.name,
          win_rate: stats.total > 0 ? (stats.won / stats.total) * 100 : 0,
          deals: stats.total,
        }))

        // Calculate average days to close
        const avgDaysToClose = wonDeals.length > 0
          ? wonDeals.reduce((sum, deal) => {
              const created = new Date(deal.created_at).getTime()
              const closed = new Date(deal.closed_at).getTime()
              return sum + (closed - created) / (1000 * 60 * 60 * 24)
            }, 0) / wonDeals.length
          : 0

        const analysis: WinRateAnalysis = {
          overall_win_rate: overallWinRate,
          win_rate_by_stage: [], // Would need stage history
          win_rate_by_source: [], // Would need source tracking
          win_rate_by_size: [
            { size_range: '$0-$10K', win_rate: 35, deals: wonDeals.filter(d => d.value <= 10000).length },
            { size_range: '$10K-$50K', win_rate: 28, deals: wonDeals.filter(d => d.value > 10000 && d.value <= 50000).length },
            { size_range: '$50K-$100K', win_rate: 22, deals: wonDeals.filter(d => d.value > 50000 && d.value <= 100000).length },
            { size_range: '$100K+', win_rate: 18, deals: wonDeals.filter(d => d.value > 100000).length },
          ],
          win_rate_by_rep: winRateByRep,
          win_rate_trend: [], // Would calculate over time
          avg_days_to_close: avgDaysToClose,
          avg_days_to_close_by_stage: [], // Would need stage history
        }

        return NextResponse.json(analysis)
      }

      case 'pipeline-analysis': {
        // Get pipeline analysis
        const { data: deals } = await supabase
          .from('deals')
          .select(`
            *,
            stage:pipeline_stages(id, name, probability)
          `)
          .eq('status', 'open')

        const totalPipeline = (deals || []).reduce((sum, d) => sum + (d.value || 0), 0)
        const weightedPipeline = (deals || []).reduce((sum, d) =>
          sum + ((d.value || 0) * ((d.probability || 0) / 100)), 0
        )

        // Get quota for coverage calculation
        const { data: quotaData } = await supabase
          .from('quotas')
          .select('amount')
          .gte('period_start', startDate.toISOString())
          .lte('period_end', endDate.toISOString())
          .maybeSingle()

        const quota = quotaData?.amount || 0

        // Group by stage
        const stageMap = new Map<string, { name: string; value: number; count: number; weighted: number }>()
        ;(deals || []).forEach(deal => {
          const stageName = (deal.stage as any)?.name || 'Unknown'
          const current = stageMap.get(stageName) || { name: stageName, value: 0, count: 0, weighted: 0 }
          current.value += deal.value || 0
          current.count++
          current.weighted += (deal.value || 0) * ((deal.probability || 0) / 100)
          stageMap.set(stageName, current)
        })

        // Group by category
        const categoryMap = new Map<ForecastCategory, { value: number; count: number }>()
        ;(deals || []).forEach(deal => {
          const category = categorizeDeal(deal.probability || 0)
          const current = categoryMap.get(category) || { value: 0, count: 0 }
          current.value += deal.value || 0
          current.count++
          categoryMap.set(category, current)
        })

        // Calculate health metrics
        const now = new Date()
        const staleDays = 14
        const rottenDays = 30

        const healthyDeals = (deals || []).filter(deal => {
          const daysSinceUpdate = (now.getTime() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceUpdate < staleDays
        }).length

        const staleDeals = (deals || []).filter(deal => {
          const daysSinceUpdate = (now.getTime() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceUpdate >= staleDays && daysSinceUpdate < rottenDays
        }).length

        const rottenDealsCount = (deals || []).filter(deal => {
          const daysSinceUpdate = (now.getTime() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)
          return daysSinceUpdate >= rottenDays
        }).length

        const overdueDeals = (deals || []).filter(deal => {
          if (!deal.expected_close_date) return false
          return new Date(deal.expected_close_date) < now
        }).length

        // Aging analysis
        const agingBuckets = [
          { range: '0-7 days', min: 0, max: 7 },
          { range: '8-14 days', min: 8, max: 14 },
          { range: '15-30 days', min: 15, max: 30 },
          { range: '31-60 days', min: 31, max: 60 },
          { range: '60+ days', min: 61, max: Infinity },
        ]

        const agingAnalysis = agingBuckets.map(bucket => {
          const bucketDeals = (deals || []).filter(deal => {
            const age = (now.getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
            return age >= bucket.min && age <= bucket.max
          })
          return {
            range: bucket.range,
            count: bucketDeals.length,
            value: bucketDeals.reduce((sum, d) => sum + (d.value || 0), 0),
          }
        })

        const analysis: PipelineAnalysis = {
          total_pipeline_value: totalPipeline,
          weighted_pipeline_value: weightedPipeline,
          pipeline_by_stage: Array.from(stageMap.values()).map(s => ({
            stage: s.name,
            value: s.value,
            count: s.count,
            weighted_value: s.weighted,
          })),
          pipeline_by_category: Array.from(categoryMap.entries()).map(([category, data]) => ({
            category,
            value: data.value,
            count: data.count,
          })),
          pipeline_velocity: 0, // Would need historical data
          avg_sales_cycle: 0, // Would need won deal data
          pipeline_coverage: calculatePipelineCoverage(totalPipeline, quota),
          pipeline_health: {
            healthy_deals: healthyDeals,
            at_risk_deals: staleDeals,
            stale_deals: rottenDealsCount,
            overdue_deals: overdueDeals,
          },
          aging_analysis: agingAnalysis,
        }

        return NextResponse.json(analysis)
      }

      case 'quotas': {
        // Get quotas
        const { data: quotas, error: quotasError } = await supabase
          .from('quotas')
          .select(`
            *,
            user:users(id, name, email),
            team:teams(id, name)
          `)
          .gte('period_start', startDate.toISOString())
          .lte('period_end', endDate.toISOString())

        if (quotasError) {
          return NextResponse.json({ quotas: [] })
        }

        return NextResponse.json({ quotas })
      }

      case 'submissions': {
        // Get forecast submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('forecast_submissions')
          .select(`
            *,
            user:users(id, name, email),
            approver:users!forecast_submissions_approved_by_fkey(id, name)
          `)
          .gte('period_start', startDate.toISOString())
          .lte('period_end', endDate.toISOString())
          .order('submitted_at', { ascending: false })

        if (submissionsError) {
          return NextResponse.json({ submissions: [] })
        }

        return NextResponse.json({ submissions })
      }

      case 'settings': {
        // Get forecast settings
        const { data: settings } = await supabase
          .from('forecast_settings')
          .select('*')
          .maybeSingle()

        return NextResponse.json({
          settings: settings || {
            fiscal_year_start_month: 1,
            quota_period: 'quarter',
            default_win_rate: 25,
            include_weighted_pipeline: true,
            include_closed_won: true,
            category_definitions: defaultCategoryDefinitions,
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Forecasting GET error', { error })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/crm/forecasting - Create quota, submission, or update settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'quota'
    const body = await request.json()

    switch (action) {
      case 'quota': {
        // Create or update quota
        const validatedData = QuotaSchema.parse(body)

        const { data: quota, error } = await supabase
          .from('quotas')
          .upsert({
            ...validatedData,
            organization_id: user.user_metadata?.organization_id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,period_start,period_end',
          })
          .select()
          .single()

        if (error) {
          logger.error('Quota create error', { error })
          return NextResponse.json({ error: 'Failed to create quota' }, { status: 500 })
        }

        return NextResponse.json({ quota }, { status: 201 })
      }

      case 'submission': {
        // Submit forecast
        const validatedData = ForecastSubmissionSchema.parse(body)

        const { data: submission, error } = await supabase
          .from('forecast_submissions')
          .insert({
            ...validatedData,
            user_id: user.id,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          logger.error('Submission create error', { error })
          return NextResponse.json({ error: 'Failed to submit forecast' }, { status: 500 })
        }

        return NextResponse.json({ submission }, { status: 201 })
      }

      case 'settings': {
        // Update forecast settings
        const validatedData = ForecastSettingsSchema.parse(body)

        const { data: settings, error } = await supabase
          .from('forecast_settings')
          .upsert({
            ...validatedData,
            organization_id: user.user_metadata?.organization_id,
            category_definitions: validatedData.category_definitions || defaultCategoryDefinitions,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'organization_id',
          })
          .select()
          .single()

        if (error) {
          logger.error('Settings update error', { error })
          return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
        }

        return NextResponse.json({ settings })
      }

      case 'bulk-quotas': {
        // Bulk create/update quotas
        const { quotas } = body as { quotas: z.infer<typeof QuotaSchema>[] }

        if (!Array.isArray(quotas) || quotas.length === 0) {
          return NextResponse.json({ error: 'Quotas array is required' }, { status: 400 })
        }

        const validatedQuotas = quotas.map(q => QuotaSchema.parse(q))

        const { data, error } = await supabase
          .from('quotas')
          .upsert(
            validatedQuotas.map(q => ({
              ...q,
              organization_id: user.user_metadata?.organization_id,
              updated_at: new Date().toISOString(),
            })),
            {
              onConflict: 'user_id,period_start,period_end',
            }
          )
          .select()

        if (error) {
          logger.error('Bulk quota error', { error })
          return NextResponse.json({ error: 'Failed to create quotas' }, { status: 500 })
        }

        return NextResponse.json({
          quotas: data,
          created: data?.length || 0,
        }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Forecasting POST error', { error })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/crm/forecasting - Update submission status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('id')
    const action = searchParams.get('action') || 'approve'

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const body = await request.json()

    if (action === 'approve' || action === 'reject') {
      const { data: submission, error } = await supabase
        .from('forecast_submissions')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .select()
        .single()

      if (error) {
        logger.error('Submission update error', { error })
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
      }

      return NextResponse.json({ submission })
    }

    if (action === 'update') {
      const validatedData = ForecastSubmissionSchema.partial().parse(body)

      const { data: submission, error } = await supabase
        .from('forecast_submissions')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', submissionId)
        .eq('user_id', user.id) // Only owner can update
        .select()
        .single()

      if (error) {
        logger.error('Submission update error', { error })
        return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
      }

      return NextResponse.json({ submission })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logger.error('Forecasting PUT error', { error })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/crm/forecasting - Delete quota or submission
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') || 'quota' // 'quota' or 'submission'

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = type === 'submission' ? 'forecast_submissions' : 'quotas'

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      logger.error('Delete error', { error })
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Forecasting DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
