import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('PredictiveAnalytics')

// Types
export interface Client {
  id: string
  name: string
  email: string
  tier: 'starter' | 'standard' | 'premium' | 'enterprise' | 'vip'
  lastActivity?: Date
  communicationCount: number
  projectCount: number
  completedProjects: number
  totalProjects: number
  latePayments: number
  averageRating: number
  contractEnd?: Date
  revenue: number
  projectsPerMonth: number
  features: {
    aiAccess?: boolean
    prioritySupport?: boolean
    customBranding?: boolean
  }
  requestedFeatures?: string[]
}

export interface ChurnRiskScore {
  score: number // 0-100
  level: 'low' | 'medium' | 'high'
  drivers: ChurnDriver[]
  recommendations: RetentionAction[]
  probability: string
  trendDirection: 'improving' | 'stable' | 'declining'
}

export interface ChurnDriver {
  factor: string
  impact: 'high' | 'medium' | 'low'
  value: number
  description: string
}

export interface RetentionAction {
  priority: 'urgent' | 'high' | 'medium' | 'low'
  action: string
  expectedImpact: string
  timeframe: string
}

export interface UpsellOpportunity {
  id: string
  type: 'tier_upgrade' | 'feature_addon' | 'volume_discount' | 'bundled_services'
  title: string
  description: string
  confidence: number // 0-100
  estimatedRevenue: number
  timeframe: string
  reasoning: string[]
  nextSteps: string[]
  benefits?: string[]
  savings?: number
  features?: string[]
}

export interface ProjectHealthPrediction {
  projectId: string
  overallHealth: 'excellent' | 'good' | 'at-risk' | 'critical'
  healthScore: number // 0-100
  risks: ProjectRisk[]
  opportunities: ProjectOpportunity[]
  recommendations: string[]
}

export interface ProjectRisk {
  category: 'timeline' | 'budget' | 'quality' | 'communication' | 'scope'
  severity: 'critical' | 'high' | 'medium' | 'low'
  probability: number // 0-100
  description: string
  mitigation: string
  potentialImpact: string
}

export interface ProjectOpportunity {
  category: string
  description: string
  potentialValue: string
  actionRequired: string
}

// Helper function to calculate days between dates
function daysSince(date: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function daysUntil(date: Date): number {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Churn Risk Calculation
export function calculateChurnRisk(client: Client): ChurnRiskScore {
  logger.info('Calculating churn risk', {
    clientId: client.id,
    clientName: client.name,
    tier: client.tier
  })

  const factors = {
    inactivityDays: client.lastActivity ? daysSince(client.lastActivity) : 999,
    communicationFrequency: client.projectCount > 0
      ? client.communicationCount / client.projectCount
      : 0,
    paymentDelays: client.latePayments,
    projectCompletionRate: client.totalProjects > 0
      ? (client.completedProjects / client.totalProjects) * 100
      : 0,
    satisfactionScore: client.averageRating,
    contractRenewalDays: client.contractEnd ? daysUntil(client.contractEnd) : 999
  }

  // Calculate weighted risk score
  const weights = {
    inactivity: 0.25,
    communication: 0.15,
    payment: 0.20,
    completion: 0.15,
    satisfaction: 0.15,
    renewal: 0.10
  }

  // Normalize factors to 0-100 scale (higher = more risk)
  const normalizedFactors = {
    inactivity: Math.min((factors.inactivityDays / 30) * 100, 100),
    communication: Math.max(0, 100 - (factors.communicationFrequency * 10)),
    payment: Math.min(factors.paymentDelays * 20, 100),
    completion: 100 - factors.projectCompletionRate,
    satisfaction: Math.max(0, 100 - (factors.satisfactionScore * 20)),
    renewal: factors.contractRenewalDays < 90
      ? Math.max(0, 100 - (factors.contractRenewalDays / 90 * 100))
      : 0
  }

  const riskScore = Math.round(
    normalizedFactors.inactivity * weights.inactivity +
    normalizedFactors.communication * weights.communication +
    normalizedFactors.payment * weights.payment +
    normalizedFactors.completion * weights.completion +
    normalizedFactors.satisfaction * weights.satisfaction +
    normalizedFactors.renewal * weights.renewal
  )

  // Identify top risk drivers
  const drivers: ChurnDriver[] = []

  if (normalizedFactors.inactivity > 60) {
    drivers.push({
      factor: 'Account Inactivity',
      impact: normalizedFactors.inactivity > 80 ? 'high' : 'medium',
      value: factors.inactivityDays,
      description: `No activity for ${factors.inactivityDays} days`
    })
  }

  if (normalizedFactors.payment > 50) {
    drivers.push({
      factor: 'Payment Issues',
      impact: 'high',
      value: factors.paymentDelays,
      description: `${factors.paymentDelays} late payment(s)`
    })
  }

  if (normalizedFactors.satisfaction > 60) {
    drivers.push({
      factor: 'Low Satisfaction',
      impact: 'high',
      value: factors.satisfactionScore,
      description: `Average rating of ${factors.satisfactionScore.toFixed(1)}/5.0`
    })
  }

  if (normalizedFactors.communication > 60) {
    drivers.push({
      factor: 'Poor Communication',
      impact: 'medium',
      value: factors.communicationFrequency,
      description: `Low engagement with team`
    })
  }

  if (normalizedFactors.completion > 40) {
    drivers.push({
      factor: 'Project Completion Rate',
      impact: 'medium',
      value: factors.projectCompletionRate,
      description: `Only ${factors.projectCompletionRate.toFixed(0)}% completion rate`
    })
  }

  if (factors.contractRenewalDays > 0 && factors.contractRenewalDays < 90) {
    drivers.push({
      factor: 'Contract Renewal',
      impact: factors.contractRenewalDays < 30 ? 'high' : 'medium',
      value: factors.contractRenewalDays,
      description: `Contract expires in ${factors.contractRenewalDays} days`
    })
  }

  // Sort drivers by impact
  drivers.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 }
    return impactOrder[b.impact] - impactOrder[a.impact]
  })

  // Generate retention recommendations
  const recommendations = generateRetentionActions(factors, drivers, client)

  // Determine trend direction
  const trendDirection: 'improving' | 'stable' | 'declining' =
    riskScore > 70 ? 'declining' :
    riskScore > 40 ? 'stable' :
    'improving'

  const result: ChurnRiskScore = {
    score: riskScore,
    level: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
    drivers,
    recommendations,
    probability: `${riskScore}% chance of churn in next 90 days`,
    trendDirection
  }

  logger.info('Churn risk calculated', {
    clientId: client.id,
    riskScore,
    riskLevel: result.level,
    driversCount: drivers.length,
    topDriver: drivers[0]?.factor
  })

  return result
}

function generateRetentionActions(
  factors: any,
  drivers: ChurnDriver[],
  client: Client
): RetentionAction[] {
  const actions: RetentionAction[] = []

  // High priority actions for critical risk factors
  if (factors.inactivityDays > 30) {
    actions.push({
      priority: factors.inactivityDays > 60 ? 'urgent' : 'high',
      action: 'Schedule personal check-in call with account manager',
      expectedImpact: 'Re-engage client and understand any blockers',
      timeframe: 'Within 48 hours'
    })
  }

  if (factors.paymentDelays > 0) {
    actions.push({
      priority: 'urgent',
      action: 'Offer flexible payment terms or payment plan',
      expectedImpact: 'Resolve financial friction and maintain relationship',
      timeframe: 'Immediately'
    })
  }

  if (factors.satisfactionScore < 4.0) {
    actions.push({
      priority: 'high',
      action: 'Conduct satisfaction survey and address concerns',
      expectedImpact: 'Identify and resolve satisfaction issues',
      timeframe: 'Within 1 week'
    })
  }

  if (factors.communicationFrequency < 5) {
    actions.push({
      priority: 'medium',
      action: 'Increase proactive communication and project updates',
      expectedImpact: 'Build stronger relationship and trust',
      timeframe: 'Ongoing'
    })
  }

  if (factors.contractRenewalDays > 0 && factors.contractRenewalDays < 90) {
    actions.push({
      priority: factors.contractRenewalDays < 30 ? 'urgent' : 'high',
      action: 'Present renewal offer with exclusive benefits',
      expectedImpact: 'Secure contract renewal',
      timeframe: `Before ${factors.contractRenewalDays} days`
    })
  }

  // General retention actions
  if (client.tier === 'standard') {
    actions.push({
      priority: 'medium',
      action: 'Present upgrade opportunity to Premium tier',
      expectedImpact: 'Increase engagement with advanced features',
      timeframe: 'Next 30 days'
    })
  }

  actions.push({
    priority: 'low',
    action: 'Share client success stories and case studies',
    expectedImpact: 'Demonstrate value and build confidence',
    timeframe: 'Quarterly'
  })

  // Sort by priority
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
  actions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

  return actions
}

// Upsell Opportunity Detection
export function detectUpsellOpportunities(client: Client): UpsellOpportunity[] {
  logger.info('Detecting upsell opportunities', {
    clientId: client.id,
    currentTier: client.tier,
    projectsPerMonth: client.projectsPerMonth,
    revenue: client.revenue
  })

  const opportunities: UpsellOpportunity[] = []

  // Tier upgrade opportunities
  if (client.projectsPerMonth > 3 && client.tier === 'standard') {
    const monthlySavings = client.projectsPerMonth * 150 // Estimated savings per project
    opportunities.push({
      id: `upsell-${client.id}-tier-premium`,
      type: 'tier_upgrade',
      title: 'Upgrade to Premium Tier',
      description: 'Unlock unlimited projects, priority support, and 15% discount on all services',
      confidence: 85,
      estimatedRevenue: 2400, // Annual premium upgrade
      timeframe: '30 days',
      reasoning: [
        `Currently completing ${client.projectsPerMonth} projects/month`,
        'Premium tier offers unlimited projects',
        '15% discount would save significant costs',
        'Priority support reduces response times'
      ],
      nextSteps: [
        'Schedule demo of Premium features',
        'Calculate exact ROI with current project volume',
        'Offer first month at 50% discount'
      ],
      benefits: [
        'Unlimited projects',
        'Priority support (2hr response time)',
        '15% discount on all services',
        'Dedicated account manager',
        'Advanced analytics dashboard'
      ],
      savings: monthlySavings,
      features: ['unlimited_projects', 'priority_support', 'bulk_discount']
    })
  }

  if (client.tier === 'premium' && client.revenue > 50000) {
    opportunities.push({
      id: `upsell-${client.id}-tier-enterprise`,
      type: 'tier_upgrade',
      title: 'Upgrade to Enterprise Tier',
      description: 'White-label options, custom SLA, API access, and 20% discount',
      confidence: 70,
      estimatedRevenue: 12000, // Annual enterprise upgrade
      timeframe: '60 days',
      reasoning: [
        `Annual revenue of $${client.revenue.toLocaleString()}`,
        'Enterprise tier offers 20% discount',
        'Custom SLA ensures priority delivery',
        'White-label perfect for client-facing work'
      ],
      nextSteps: [
        'Present enterprise features presentation',
        'Discuss white-label customization needs',
        'Offer pilot period for API integration'
      ],
      benefits: [
        'White-label customization',
        'Custom SLA with guarantees',
        '20% discount on all services',
        'API access for integrations',
        'Quarterly strategy sessions',
        'Custom reporting'
      ],
      savings: client.revenue * 0.05, // 5% additional savings
      features: ['white_label', 'custom_sla', 'api_access']
    })
  }

  // Feature addon opportunities
  if (
    client.requestedFeatures?.includes('ai_design') &&
    !client.features.aiAccess
  ) {
    opportunities.push({
      id: `upsell-${client.id}-addon-ai`,
      type: 'feature_addon',
      title: 'Add AI Design Tools',
      description: 'AI-powered design generation, variation creation, and smart suggestions',
      confidence: 90,
      estimatedRevenue: 1188, // $99/month annual
      timeframe: '14 days',
      reasoning: [
        'Client has requested AI design features',
        'Current projects would benefit from AI tools',
        '3x faster design iteration with AI',
        'Competitor differentiation'
      ],
      nextSteps: [
        'Provide free 14-day trial of AI tools',
        'Showcase AI-generated design examples',
        'Calculate time savings for typical projects'
      ],
      benefits: [
        'AI design generation',
        'Instant design variations',
        'Style transfer capabilities',
        'Smart color palette suggestions',
        'Automated asset optimization'
      ]
    })
  }

  // Volume discount opportunities
  if (client.projectsPerMonth > 5 && client.tier !== 'enterprise') {
    opportunities.push({
      id: `upsell-${client.id}-volume-discount`,
      type: 'volume_discount',
      title: 'Volume Discount Program',
      description: 'Lock in 20% discount with annual commitment',
      confidence: 75,
      estimatedRevenue: client.revenue * 0.2, // 20% increase from commitment
      timeframe: '45 days',
      reasoning: [
        `High project volume: ${client.projectsPerMonth}/month`,
        'Annual commitment reduces cost by 20%',
        'Predictable budgeting for client',
        'Priority scheduling for committed projects'
      ],
      nextSteps: [
        'Present annual commitment proposal',
        'Calculate exact savings based on history',
        'Offer flexible payment terms'
      ],
      benefits: [
        '20% discount on all projects',
        'Priority project scheduling',
        'Dedicated resource allocation',
        'Flexible rollover credits',
        'Quarterly business reviews'
      ],
      savings: client.revenue * 0.2
    })
  }

  // Bundled services opportunities
  if (client.projectCount > 8 && client.tier === 'standard') {
    opportunities.push({
      id: `upsell-${client.id}-bundle`,
      type: 'bundled_services',
      title: 'Creative Services Bundle',
      description: 'Package of design, video, and marketing services at discounted rate',
      confidence: 65,
      estimatedRevenue: 3600,
      timeframe: '60 days',
      reasoning: [
        'Multiple project types completed',
        'Bundle offers 25% savings',
        'Simplified project management',
        'Consistent brand experience'
      ],
      nextSteps: [
        'Analyze project type distribution',
        'Create custom bundle proposal',
        'Offer trial bundle at intro rate'
      ],
      benefits: [
        '25% discount vs. individual projects',
        'Unified creative direction',
        'Simplified billing',
        'Priority delivery',
        'Dedicated creative team'
      ]
    })
  }

  // Sort by confidence and revenue potential
  opportunities.sort((a, b) => {
    const scoreA = (a.confidence / 100) * a.estimatedRevenue
    const scoreB = (b.confidence / 100) * b.estimatedRevenue
    return scoreB - scoreA
  })

  logger.info('Upsell opportunities detected', {
    clientId: client.id,
    opportunitiesCount: opportunities.length,
    totalPotentialRevenue: opportunities.reduce((sum, opp) => sum + opp.estimatedRevenue, 0),
    highestConfidence: opportunities[0]?.confidence
  })

  return opportunities
}

// Project Health Prediction
export function predictProjectHealth(
  projectId: string,
  projectData: {
    startDate: Date
    dueDate: Date
    budget: number
    spent: number
    progress: number
    milestones: number
    completedMilestones: number
    communicationCount: number
    lastUpdate: Date
    teamSize: number
    revisionCount: number
    clientResponseTime: number // hours
  }
): ProjectHealthPrediction {
  logger.info('Predicting project health', {
    projectId,
    progress: projectData.progress,
    budget: projectData.budget
  })

  const risks: ProjectRisk[] = []
  const opportunities: ProjectOpportunity[] = []
  const recommendations: string[] = []

  // Timeline analysis
  const totalDays = daysSince(projectData.startDate)
  const daysRemaining = daysUntil(projectData.dueDate)
  const timeProgress = (totalDays / (totalDays + daysRemaining)) * 100
  const timelineVariance = projectData.progress - timeProgress

  if (timelineVariance < -10) {
    risks.push({
      category: 'timeline',
      severity: timelineVariance < -20 ? 'critical' : 'high',
      probability: 85,
      description: `Project is ${Math.abs(timelineVariance).toFixed(0)}% behind schedule`,
      mitigation: 'Increase team resources or adjust scope',
      potentialImpact: 'Delayed delivery, client dissatisfaction'
    })
    recommendations.push('Consider adding team members or extending deadline')
  }

  // Budget analysis
  const budgetProgress = (projectData.spent / projectData.budget) * 100
  const budgetVariance = budgetProgress - projectData.progress

  if (budgetVariance > 15) {
    risks.push({
      category: 'budget',
      severity: budgetVariance > 30 ? 'critical' : 'high',
      probability: 80,
      description: `Budget ${budgetVariance.toFixed(0)}% ahead of progress`,
      mitigation: 'Review scope and resource allocation',
      potentialImpact: 'Budget overrun, reduced profit margin'
    })
    recommendations.push('Review and optimize resource allocation')
  }

  // Communication analysis
  const daysSinceUpdate = daysSince(projectData.lastUpdate)
  if (daysSinceUpdate > 7) {
    risks.push({
      category: 'communication',
      severity: daysSinceUpdate > 14 ? 'high' : 'medium',
      probability: 70,
      description: `No updates for ${daysSinceUpdate} days`,
      mitigation: 'Schedule immediate status update meeting',
      potentialImpact: 'Client disengagement, misaligned expectations'
    })
    recommendations.push('Increase communication frequency with client')
  }

  // Quality analysis
  const milestonesProgress = (projectData.completedMilestones / projectData.milestones) * 100
  const avgRevisionsPerMilestone = projectData.revisionCount / (projectData.completedMilestones || 1)

  if (avgRevisionsPerMilestone > 3) {
    risks.push({
      category: 'quality',
      severity: avgRevisionsPerMilestone > 5 ? 'high' : 'medium',
      probability: 75,
      description: `High revision count: ${avgRevisionsPerMilestone.toFixed(1)} per milestone`,
      mitigation: 'Improve requirements clarity and approval process',
      potentialImpact: 'Timeline delays, increased costs'
    })
    recommendations.push('Clarify requirements before starting next milestone')
  }

  // Client responsiveness
  if (projectData.clientResponseTime > 48) {
    risks.push({
      category: 'communication',
      severity: 'medium',
      probability: 60,
      description: `Slow client response time: ${projectData.clientResponseTime}hrs average`,
      mitigation: 'Set clear response time expectations',
      potentialImpact: 'Timeline delays, blocked work'
    })
    recommendations.push('Discuss response time expectations with client')
  }

  // Identify opportunities
  if (timelineVariance > 10) {
    opportunities.push({
      category: 'timeline',
      description: 'Project is ahead of schedule',
      potentialValue: 'Early delivery bonus opportunity',
      actionRequired: 'Propose early delivery with value-add features'
    })
  }

  if (budgetVariance < -10) {
    opportunities.push({
      category: 'budget',
      description: 'Under budget with strong progress',
      potentialValue: 'Higher profit margin',
      actionRequired: 'Consider adding value-add features within budget'
    })
  }

  if (avgRevisionsPerMilestone < 1.5) {
    opportunities.push({
      category: 'quality',
      description: 'High first-time approval rate',
      potentialValue: 'Client satisfaction and referral potential',
      actionRequired: 'Request testimonial and referrals'
    })
  }

  // Calculate overall health score
  const healthFactors = {
    timeline: Math.max(0, 100 - Math.abs(timelineVariance)),
    budget: Math.max(0, 100 - Math.abs(budgetVariance)),
    communication: Math.max(0, 100 - (daysSinceUpdate * 5)),
    quality: Math.max(0, 100 - (avgRevisionsPerMilestone * 15)),
    progress: projectData.progress
  }

  const healthScore = Math.round(
    (healthFactors.timeline * 0.25 +
      healthFactors.budget * 0.25 +
      healthFactors.communication * 0.15 +
      healthFactors.quality * 0.20 +
      healthFactors.progress * 0.15)
  )

  const overallHealth: 'excellent' | 'good' | 'at-risk' | 'critical' =
    healthScore > 85 ? 'excellent' :
    healthScore > 70 ? 'good' :
    healthScore > 50 ? 'at-risk' :
    'critical'

  const result: ProjectHealthPrediction = {
    projectId,
    overallHealth,
    healthScore,
    risks,
    opportunities,
    recommendations
  }

  logger.info('Project health predicted', {
    projectId,
    overallHealth,
    healthScore,
    risksCount: risks.length,
    opportunitiesCount: opportunities.length
  })

  return result
}
