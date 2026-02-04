/**
 * BUSINESS INTELLIGENCE MODULE
 * AI-powered business insights and recommendations
 */

import { kaziAI } from './kazi-ai-router'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('BusinessIntelligence')

export interface ProjectInsight {
  category: 'profitability' | 'risk' | 'opportunity' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendation?: string
}

export interface PricingRecommendation {
  tier: 'basic' | 'standard' | 'premium'
  price: number
  description: string
  reasoning: string
  targetClient: string
}

export interface WorkflowOptimization {
  task: string
  currentTime: number
  optimizedTime: number
  savings: number
  method: string
  difficulty: 'easy' | 'medium' | 'hard'
  tools?: string[]
}

/**
 * Analyze a project and generate business insights
 */
export async function analyzeProjectIntelligence(projectData: {
  id: string
  name: string
  budget: number
  timeline: number
  clientType: string
  scope?: string
  status?: string
  hoursLogged?: number
}): Promise<{
  insights: ProjectInsight[]
  profitabilityScore: number
  riskScore: number
  recommendations: string[]
  estimatedProfit: number
  estimatedMargin: number
}> {
  logger.info('Analyzing project intelligence', {
    projectId: projectData.id,
    budget: projectData.budget
  })

  const prompt = `Analyze this project as a business consultant and provide structured insights:

Project: ${projectData.name}
Budget: $${projectData.budget}
Timeline: ${projectData.timeline} days
Client Type: ${projectData.clientType}
${projectData.scope ? `Scope: ${projectData.scope}` : ''}
${projectData.status ? `Status: ${projectData.status}` : ''}
${projectData.hoursLogged ? `Hours Logged: ${projectData.hoursLogged}` : ''}

Provide analysis in this exact JSON structure:
{
  "profitabilityScore": <number 0-100>,
  "riskScore": <number 0-100>,
  "estimatedProfit": <number>,
  "estimatedMargin": <number 0-100>,
  "insights": [
    {
      "category": "profitability|risk|opportunity|warning",
      "title": "Brief title",
      "description": "Detailed description",
      "impact": "high|medium|low",
      "actionable": true/false,
      "recommendation": "Specific action to take"
    }
  ],
  "recommendations": ["List of 3-5 key recommendations"]
}

Focus on actionable business insights that help maximize profitability and minimize risk.`

  try {
    const response = await kaziAI.routeRequest({
      type: 'analysis',
      prompt,
      context: projectData
    })

    // Parse AI response - try to extract JSON
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      logger.info('Project analysis complete', {
        projectId: projectData.id,
        profitabilityScore: analysis.profitabilityScore,
        insightsCount: analysis.insights.length
      })
      return analysis
    }

    // Fallback if JSON parsing fails
    return generateFallbackAnalysis(projectData, response.content)

  } catch (error) {
    logger.error('Project analysis failed', {
      projectId: projectData.id,
      error: error instanceof Error ? error.message : 'Unknown'
    })
    throw error
  }
}

/**
 * Generate pricing recommendations based on market and user data
 */
export async function generatePricingIntelligence(userData: {
  userId: string
  skills: string[]
  experience: number
  market: string
  currentRate?: number
  completedProjects?: number
  avgRating?: number
}): Promise<{
  recommendations: PricingRecommendation[]
  marketAnalysis: string
  rateIncreaseStrategy: string
  competitivePosition: string
}> {
  logger.info('Generating pricing intelligence', {
    userId: userData.userId,
    market: userData.market
  })

  const prompt = `As a pricing strategist, analyze this professional's profile and generate pricing recommendations:

Skills: ${userData.skills.join(', ')}
Experience: ${userData.experience} years
Market: ${userData.market}
${userData.currentRate ? `Current Rate: $${userData.currentRate}/hour` : ''}
${userData.completedProjects ? `Completed Projects: ${userData.completedProjects}` : ''}
${userData.avgRating ? `Average Rating: ${userData.avgRating}/5` : ''}

Provide pricing strategy in this JSON structure:
{
  "recommendations": [
    {
      "tier": "basic|standard|premium",
      "price": <number>,
      "description": "What's included",
      "reasoning": "Why this price",
      "targetClient": "Who this is for"
    }
  ],
  "marketAnalysis": "Market rate analysis for ${userData.market}",
  "rateIncreaseStrategy": "When and how to increase rates",
  "competitivePosition": "Where you stand vs competitors"
}

Base recommendations on industry standards and value delivered.`

  try {
    const response = await kaziAI.routeRequest({
      type: 'strategic',
      prompt,
      context: userData
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const pricing = JSON.parse(jsonMatch[0])
      logger.info('Pricing intelligence generated', {
        userId: userData.userId,
        tierCount: pricing.recommendations.length
      })
      return pricing
    }

    return generateFallbackPricing(userData, response.content)

  } catch (error) {
    logger.error('Pricing intelligence failed', {
      userId: userData.userId,
      error: error instanceof Error ? error.message : 'Unknown'
    })
    throw error
  }
}

/**
 * Analyze workflow and suggest optimizations
 */
export async function analyzeWorkflowEfficiency(workflowData: {
  userId: string
  dailyTasks: Array<{ task: string; hours: number }>
  painPoints?: string[]
  tools?: string[]
}): Promise<{
  optimizations: WorkflowOptimization[]
  totalTimeSavings: number
  efficiencyScore: number
  quickWins: string[]
  automationOpportunities: string[]
}> {
  logger.info('Analyzing workflow efficiency', {
    userId: workflowData.userId,
    taskCount: workflowData.dailyTasks.length
  })

  const totalHours = workflowData.dailyTasks.reduce((sum, t) => sum + t.hours, 0)

  const prompt = `As an efficiency expert, analyze this workflow and suggest optimizations:

Daily Tasks (${totalHours} hours total):
${workflowData.dailyTasks.map(t => `- ${t.task}: ${t.hours} hours`).join('\n')}

${workflowData.painPoints ? `Pain Points:\n${workflowData.painPoints.map(p => `- ${p}`).join('\n')}` : ''}
${workflowData.tools ? `Current Tools: ${workflowData.tools.join(', ')}` : ''}

Provide workflow analysis in this JSON structure:
{
  "efficiencyScore": <number 0-100>,
  "totalTimeSavings": <number hours per week>,
  "optimizations": [
    {
      "task": "Task name",
      "currentTime": <hours>,
      "optimizedTime": <hours>,
      "savings": <hours>,
      "method": "How to optimize",
      "difficulty": "easy|medium|hard",
      "tools": ["Tool suggestions"]
    }
  ],
  "quickWins": ["3 easy changes with immediate impact"],
  "automationOpportunities": ["Tasks that can be automated"]
}

Focus on practical, implementable optimizations.`

  try {
    const response = await kaziAI.routeRequest({
      type: 'operational',
      prompt,
      context: workflowData
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      logger.info('Workflow analysis complete', {
        userId: workflowData.userId,
        timeSavings: analysis.totalTimeSavings
      })
      return analysis
    }

    return generateFallbackWorkflow(workflowData, response.content)

  } catch (error) {
    logger.error('Workflow analysis failed', {
      userId: workflowData.userId,
      error: error instanceof Error ? error.message : 'Unknown'
    })
    throw error
  }
}

/**
 * Generate business growth insights
 */
export async function generateGrowthInsights(businessData: {
  userId: string
  revenue: number[]
  projects: number[]
  clients: number[]
  period: string
}): Promise<{
  trends: Array<{ metric: string; trend: 'up' | 'down' | 'stable'; change: number }>
  opportunities: string[]
  risks: string[]
  predictions: Array<{ period: string; metric: string; value: number; confidence: number }>
  actionPlan: string[]
}> {
  logger.info('Generating growth insights', {
    userId: businessData.userId,
    period: businessData.period
  })

  const prompt = `As a business growth analyst, analyze these metrics and provide strategic insights:

Period: ${businessData.period}
Revenue: ${businessData.revenue.map((r, i) => `Month ${i + 1}: $${r}`).join(', ')}
Projects: ${businessData.projects.map((p, i) => `Month ${i + 1}: ${p}`).join(', ')}
Clients: ${businessData.clients.map((c, i) => `Month ${i + 1}: ${c}`).join(', ')}

Provide growth analysis in this JSON structure:
{
  "trends": [
    {
      "metric": "Revenue|Projects|Clients",
      "trend": "up|down|stable",
      "change": <percentage>
    }
  ],
  "opportunities": ["Growth opportunities identified"],
  "risks": ["Potential risks to watch"],
  "predictions": [
    {
      "period": "Next 3 months",
      "metric": "Revenue",
      "value": <number>,
      "confidence": <percentage>
    }
  ],
  "actionPlan": ["Prioritized actions for next 30 days"]
}

Base analysis on data trends and industry best practices.`

  try {
    const response = await kaziAI.routeRequest({
      type: 'strategic',
      prompt,
      context: businessData
    })

    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0])
      logger.info('Growth insights generated', {
        userId: businessData.userId,
        trendsCount: insights.trends.length
      })
      return insights
    }

    return generateFallbackGrowth(businessData, response.content)

  } catch (error) {
    logger.error('Growth insights failed', {
      userId: businessData.userId,
      error: error instanceof Error ? error.message : 'Unknown'
    })
    throw error
  }
}

// Fallback functions for when JSON parsing fails

function generateFallbackAnalysis(projectData: any, aiResponse: string): any {
  return {
    profitabilityScore: 75,
    riskScore: 30,
    estimatedProfit: projectData.budget * 0.3,
    estimatedMargin: 30,
    insights: [
      {
        category: 'profitability' as const,
        title: 'AI Analysis Available',
        description: aiResponse.substring(0, 200),
        impact: 'medium' as const,
        actionable: true,
        recommendation: 'Review full AI analysis for detailed insights'
      }
    ],
    recommendations: ['Review project scope', 'Monitor timeline', 'Track expenses']
  }
}

function generateFallbackPricing(userData: any, aiResponse: string): any {
  const baseRate = userData.currentRate || 75
  return {
    recommendations: [
      {
        tier: 'basic' as const,
        price: baseRate * 0.8,
        description: 'Entry-level package',
        reasoning: 'Competitive entry point',
        targetClient: 'Budget-conscious clients'
      },
      {
        tier: 'standard' as const,
        price: baseRate,
        description: 'Standard package',
        reasoning: 'Market rate',
        targetClient: 'Typical clients'
      },
      {
        tier: 'premium' as const,
        price: baseRate * 1.5,
        description: 'Premium package',
        reasoning: 'High-value positioning',
        targetClient: 'Enterprise clients'
      }
    ],
    marketAnalysis: aiResponse.substring(0, 200),
    rateIncreaseStrategy: 'Increase rates 10-15% annually based on experience',
    competitivePosition: 'Review full analysis for market positioning'
  }
}

function generateFallbackWorkflow(workflowData: any, aiResponse: string): any {
  return {
    efficiencyScore: 70,
    totalTimeSavings: 5,
    optimizations: workflowData.dailyTasks.map((t: any) => ({
      task: t.task,
      currentTime: t.hours,
      optimizedTime: t.hours * 0.8,
      savings: t.hours * 0.2,
      method: 'Automation and streamlining',
      difficulty: 'medium' as const,
      tools: ['AI tools', 'Automation software']
    })),
    quickWins: [
      'Automate repetitive tasks',
      'Use templates for common work',
      'Batch similar tasks together'
    ],
    automationOpportunities: [
      'Email responses',
      'Invoice generation',
      'Status updates'
    ]
  }
}

function generateFallbackGrowth(businessData: any, aiResponse: string): any {
  return {
    trends: [
      { metric: 'Revenue', trend: 'up' as const, change: 15 },
      { metric: 'Projects', trend: 'stable' as const, change: 0 },
      { metric: 'Clients', trend: 'up' as const, change: 10 }
    ],
    opportunities: [
      'Expand service offerings',
      'Increase pricing',
      'Focus on high-value clients'
    ],
    risks: [
      'Market competition',
      'Client retention',
      'Capacity constraints'
    ],
    predictions: [
      {
        period: 'Next 3 months',
        metric: 'Revenue',
        value: businessData.revenue[businessData.revenue.length - 1] * 1.15,
        confidence: 70
      }
    ],
    actionPlan: [
      'Review and optimize pricing',
      'Implement client retention strategy',
      'Develop new service packages'
    ]
  }
}
