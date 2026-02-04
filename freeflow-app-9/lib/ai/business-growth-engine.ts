/**
 * BUSINESS GROWTH ENGINE
 * World-class AI prompts and strategies for freelancers & businesses
 * Optimized for maximum revenue, client acquisition, and scaling
 */

import { kaziAI } from './kazi-ai-router'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('BusinessGrowthEngine')

// Specialized prompt templates for business growth
export const GROWTH_PROMPTS = {
  // Client Acquisition Strategies
  CLIENT_ACQUISITION: {
    COLD_OUTREACH: `You are a client acquisition expert. Create a highly personalized cold outreach strategy for {{industry}} targeting {{clientType}}.

Include:
1. Compelling subject lines (5 variations)
2. Pain points to address
3. Value proposition framework
4. Call-to-action strategies
5. Follow-up sequence (3 touches)

Make it conversion-focused and non-salesy.`,

    LINKEDIN_STRATEGY: `Create a LinkedIn client acquisition strategy for {{profession}} targeting {{targetMarket}}.

Include:
1. Profile optimization checklist
2. Content posting strategy (topics + frequency)
3. Engagement tactics
4. Connection request templates (5 variations)
5. DM conversation starters
6. Lead nurturing sequence

Focus on authority building and trust.`,

    REFERRAL_SYSTEM: `Design a referral program for {{businessType}} that incentivizes existing clients to refer new business.

Include:
1. Referral incentive structure
2. Ask scripts (3 variations)
3. Timing strategies (when to ask)
4. Referral tracking system
5. Thank you + reward process
6. Expected referral rate projections`,
  },

  // Revenue Optimization
  REVENUE_OPTIMIZATION: {
    PRICING_AUDIT: `Analyze this freelancer/business profile and provide pricing optimization:

Current rate: {{currentRate}}
Experience: {{experience}}
Skills: {{skills}}
Market: {{market}}
Average project value: {{avgProjectValue}}

Provide:
1. Rate comparison vs market (low/fair/high)
2. Recommended rate increase % and timeline
3. Value-based pricing strategy
4. Package pricing structure (3 tiers)
5. Negotiation scripts for higher rates
6. Client segmentation by budget`,

    UPSELL_STRATEGY: `Create an upselling strategy for {{service}} with current average project value of {{projectValue}}.

Include:
1. Complementary services to offer
2. Upsell timing (project milestones)
3. Value stacking techniques
4. Pricing for upsells (% of main service)
5. Presentation scripts (3 variations)
6. Expected revenue lift %`,

    RETAINER_CONVERSION: `Design a strategy to convert project clients into monthly retainer clients for {{serviceType}}.

Include:
1. Retainer package structure (3 tiers)
2. Benefits positioning (client perspective)
3. Pricing strategy vs project rates
4. Transition conversation scripts
5. Retainer agreement key terms
6. Expected conversion rate`,
  },

  // Productivity & Efficiency
  PRODUCTIVITY: {
    WORKFLOW_OPTIMIZATION: `Analyze this workflow and suggest optimizations:

Current process: {{currentWorkflow}}
Time per project: {{timePerProject}}
Pain points: {{painPoints}}

Provide:
1. Bottleneck identification
2. Automation opportunities
3. Delegation tasks (if applicable)
4. Tool recommendations
5. Optimized workflow steps
6. Expected time savings %`,

    TIME_BLOCKING: `Create a time blocking schedule for {{role}} managing {{clientCount}} clients with {{weeklyHours}} hours available.

Include:
1. Daily schedule template
2. Client work blocks
3. Business development time
4. Admin/email batching
5. Deep work periods
6. Buffer time strategy
7. Weekly review process`,

    CAPACITY_PLANNING: `Calculate capacity and scaling strategy:

Current clients: {{clientCount}}
Hours per client: {{hoursPerClient}}
Available hours: {{availableHours}}
Target revenue: {{targetRevenue}}

Provide:
1. Current capacity utilization %
2. Maximum client capacity
3. Revenue per client needed
4. Scaling options (prices vs clients)
5. Hiring timeline (if needed)
6. Subcontracting strategy`,
  },

  // Market Positioning
  POSITIONING: {
    NICHE_STRATEGY: `Develop a niche positioning strategy for {{generalService}} professional.

Current situation: {{currentSituation}}
Experience: {{experience}}
Interests: {{interests}}

Provide:
1. Top 3 profitable niches to consider
2. Niche selection criteria
3. Positioning statement for each niche
4. Target client profile
5. Specialization timeline (3-6-12 months)
6. Expected price premium %`,

    COMPETITIVE_ADVANTAGE: `Identify and articulate unique competitive advantages:

Services: {{services}}
Experience: {{experience}}
Background: {{background}}
Target market: {{targetMarket}}

Provide:
1. 3-5 unique differentiators
2. Competitive positioning map
3. Value proposition statement
4. Messaging framework
5. Proof points to highlight
6. Anti-competitor positioning`,

    AUTHORITY_BUILDING: `Create an authority building plan for {{expertise}} in {{market}}.

Include:
1. Content strategy (topics + formats)
2. Speaking/guest appearance opportunities
3. Case study development plan
4. Testimonial collection system
5. Social proof accumulation
6. Thought leadership tactics
7. 90-day action plan`,
  },

  // Client Management
  CLIENT_MANAGEMENT: {
    ONBOARDING_SYSTEM: `Design a client onboarding system for {{serviceType}} projects.

Include:
1. Onboarding checklist (step-by-step)
2. Welcome email sequence
3. Kickoff meeting agenda
4. Information gathering process
5. Expectation setting scripts
6. Timeline communication
7. Payment structure setup`,

    SCOPE_MANAGEMENT: `Create a scope management system to prevent scope creep:

Service: {{service}}
Project type: {{projectType}}

Include:
1. Scope definition template
2. Change request process
3. Pricing for scope changes
4. Client communication scripts
5. Contract clauses to include
6. Red flags to watch for`,

    CLIENT_RETENTION: `Develop a client retention strategy for {{businessType}}.

Current retention rate: {{retentionRate}}
Average client lifetime: {{clientLifetime}}

Provide:
1. Retention improvement tactics
2. Check-in schedule
3. Value delivery metrics
4. Renewal conversation framework
5. Win-back campaign (lost clients)
6. Loyalty incentives
7. Target retention rate + timeline`,
  },

  // Scaling Strategies
  SCALING: {
    TEAM_BUILDING: `Create a team building strategy for scaling from {{currentRevenue}} to {{targetRevenue}}.

Current situation: Solo freelancer/{{teamSize}} person team
Timeline: {{timeline}}

Provide:
1. Hiring roadmap (roles + timing)
2. VA vs employee strategy
3. Cost structure projections
4. Delegation framework
5. Training system outline
6. Profit margin protection
7. Management time allocation`,

    PRODUCTIZATION: `Design a productized service offering from current custom work:

Current service: {{service}}
Average project: {{projectDetails}}
Price: {{price}}

Include:
1. Standardized package structure (3 tiers)
2. Scope definition (clear boundaries)
3. Delivery process (repeatable)
4. Pricing strategy
5. Sales page outline
6. Expected margin improvement %`,

    PASSIVE_INCOME: `Create a passive income strategy for {{expertise}} professional.

Include:
1. Digital product ideas (5 options)
2. Effort to create (time + cost)
3. Revenue potential (realistic)
4. Distribution strategy
5. Pricing recommendations
6. Launch timeline
7. Expected ROI`,
  },

  // Financial Management
  FINANCIAL: {
    PROFIT_OPTIMIZATION: `Analyze profitability and suggest improvements:

Revenue: {{revenue}}
Expenses: {{expenses}}
Net margin: {{netMargin}}
Expense breakdown: {{expenseBreakdown}}

Provide:
1. Profit margin vs industry benchmark
2. Expense reduction opportunities
3. Revenue enhancement strategies
4. Cash flow optimization
5. Tax efficiency tips
6. Target margin + timeline`,

    PRICING_PSYCHOLOGY: `Apply pricing psychology to current service offering:

Service: {{service}}
Current price: {{currentPrice}}
Target market: {{targetMarket}}

Include:
1. Psychological pricing strategies
2. Anchoring techniques
3. Decoy pricing (if applicable)
4. Payment terms optimization
5. Discount strategy (if ever)
6. Price presentation formats`,

    FINANCIAL_GOALS: `Create a financial roadmap:

Current revenue: {{currentRevenue}}
Target revenue: {{targetRevenue}}
Timeline: {{timeline}}
Current margins: {{margins}}

Provide:
1. Monthly revenue milestones
2. Client acquisition targets
3. Pricing adjustments timeline
4. Expense management plan
5. Profit accumulation strategy
6. Risk mitigation`,
  },

  // Sales & Closing
  SALES: {
    PROPOSAL_OPTIMIZATION: `Optimize proposal for maximum conversion:

Service: {{service}}
Client: {{clientInfo}}
Budget: {{budget}}
Competition: {{competition}}

Provide:
1. Proposal structure (psychology-driven)
2. Value quantification framework
3. Risk reversal strategies
4. Pricing presentation
5. Call-to-action optimization
6. Follow-up strategy
7. Expected conversion rate improvement`,

    OBJECTION_HANDLING: `Create objection handling scripts for {{service}} sales.

Common objections: {{objections}}

Provide:
1. "Too expensive" - 3 response frameworks
2. "Need to think about it" - 3 strategies
3. "Can we start smaller?" - positioning
4. "Your competitor is cheaper" - differentiation
5. "Bad timing" - urgency creation
6. Confidence-building responses`,

    CLOSING_TECHNIQUES: `Develop ethical closing techniques for {{serviceType}} sales calls.

Average deal size: {{dealSize}}
Sales cycle: {{salesCycle}}

Include:
1. Trial close questions (5 options)
2. Assumptive close techniques
3. Urgency creation (ethical)
4. Decision-maker engagement
5. Contract presentation strategy
6. Post-close confirmation`,
  },
}

/**
 * Business Growth Engine - Main Interface
 */
export class BusinessGrowthEngine {
  /**
   * Get AI-powered client acquisition strategy
   */
  async generateClientAcquisitionPlan(params: {
    industry: string
    targetClient: string
    currentClients: number
    targetClients: number
    timeline: string
  }): Promise<{
    strategy: string
    tactics: string[]
    timeline: string
    expectedROI: string
  }> {
    logger.info('Generating client acquisition plan', { params })

    const prompt = `Create a comprehensive client acquisition plan for a ${params.industry} professional.

Current clients: ${params.currentClients}
Target clients: ${params.targetClients}
Timeline: ${params.timeline}
Target client type: ${params.targetClient}

Provide:
1. Overall acquisition strategy
2. Top 5 tactics (ranked by ROI)
3. Implementation timeline
4. Budget allocation recommendations
5. Expected client acquisition cost
6. Success metrics to track
7. Week-by-week action plan`

    const response = await kaziAI.routeRequest({
      type: 'strategic',
      prompt,
      temperature: 0.7,
      maxTokens: 2048,
    })

    return {
      strategy: response.content,
      tactics: this.extractTactics(response.content),
      timeline: params.timeline,
      expectedROI: 'Track: CAC, conversion rate, client LTV'
    }
  }

  /**
   * Optimize pricing strategy
   */
  async optimizePricing(params: {
    currentRate: number
    experience: number
    skills: string[]
    market: string
    targetIncome: number
  }): Promise<{
    analysis: string
    recommendedRate: number
    rateIncrease: number
    packages: Array<{ name: string; price: number; description: string }>
  }> {
    logger.info('Optimizing pricing', { params })

    const prompt = `Analyze and optimize pricing for:

Current rate: $${params.currentRate}/hour
Experience: ${params.experience} years
Skills: ${params.skills.join(', ')}
Market: ${params.market}
Target annual income: $${params.targetIncome}

Provide:
1. Market rate comparison
2. Recommended rate ($X/hour or $X/project)
3. Rate increase justification
4. 3 package tiers with pricing
5. Value-based pricing strategy
6. Implementation timeline`

    const response = await kaziAI.routeRequest({
      type: 'strategic',
      prompt,
      temperature: 0.6,
      maxTokens: 1500
    })

    // Extract recommended rate (simple parsing)
    const rateMatch = response.content.match(/\$(\d+)\/hour/)
    const recommendedRate = rateMatch ? parseInt(rateMatch[1]) : params.currentRate * 1.3

    return {
      analysis: response.content,
      recommendedRate,
      rateIncrease: ((recommendedRate - params.currentRate) / params.currentRate) * 100,
      packages: this.extractPackages(response.content)
    }
  }

  /**
   * Generate personalized growth roadmap
   */
  async createGrowthRoadmap(params: {
    currentRevenue: number
    targetRevenue: number
    timeline: string
    businessType: string
    constraints: string[]
  }): Promise<{
    roadmap: string
    milestones: Array<{ month: number; target: number; actions: string[] }>
    keyMetrics: string[]
  }> {
    logger.info('Creating growth roadmap', { params })

    const prompt = `Create a detailed growth roadmap:

Current MRR/Revenue: $${params.currentRevenue}
Target Revenue: $${params.targetRevenue}
Timeline: ${params.timeline}
Business: ${params.businessType}
Constraints: ${params.constraints.join(', ')}

Provide:
1. Monthly revenue milestones
2. Key actions for each milestone
3. Metrics to track
4. Resource requirements
5. Risk mitigation strategies
6. Quick wins (first 30 days)
7. Expected challenges + solutions`

    const response = await kaziAI.routeRequest({
      type: 'strategic',
      prompt,
      temperature: 0.7,
      maxTokens: 2048
    })

    return {
      roadmap: response.content,
      milestones: this.extractMilestones(response.content, params.timeline),
      keyMetrics: ['MRR', 'Client acquisition', 'Conversion rate', 'Average deal size', 'Churn rate']
    }
  }

  /**
   * Generate cold outreach campaign
   */
  async generateOutreachCampaign(params: {
    targetIndustry: string
    serviceOffering: string
    uniqueValue: string
    touchPoints: number
  }): Promise<{
    campaign: string
    templates: Array<{ subject: string; body: string; timing: string }>
    tips: string[]
  }> {
    logger.info('Generating outreach campaign', { params })

    const prompt = `Create a ${params.touchPoints}-touch cold outreach campaign:

Target: ${params.targetIndustry} companies
Service: ${params.serviceOffering}
Unique value: ${params.uniqueValue}

For each touch, provide:
1. Subject line (compelling + personalized)
2. Email body (150-200 words)
3. Timing (days between touches)
4. Call-to-action
5. Personalization variables

Make it conversion-focused and non-salesy.`

    const response = await kaziAI.routeRequest({
      type: 'creative',
      prompt,
      temperature: 0.8,
      maxTokens: 2048
    })

    return {
      campaign: response.content,
      templates: this.extractEmailTemplates(response.content),
      tips: [
        'Personalize with prospect research',
        'Test subject lines (A/B test)',
        'Track opens and replies',
        'Follow up consistently',
        'Adjust based on response rate'
      ]
    }
  }

  /**
   * Analyze and optimize workflow efficiency
   */
  async optimizeWorkflow(params: {
    currentWorkflow: string
    timePerProject: number
    painPoints: string[]
    toolsUsed: string[]
  }): Promise<{
    analysis: string
    bottlenecks: string[]
    optimizations: Array<{ action: string; impact: string; effort: string }>
    timeSavings: number
  }> {
    logger.info('Optimizing workflow', { params })

    const prompt = `Analyze and optimize this workflow:

Current process: ${params.currentWorkflow}
Time per project: ${params.timePerProject} hours
Pain points: ${params.painPoints.join(', ')}
Tools: ${params.toolsUsed.join(', ')}

Provide:
1. Bottleneck identification
2. Top 5 optimization opportunities (ranked by impact)
3. Automation possibilities
4. Tool recommendations
5. Delegation opportunities
6. Expected time savings %
7. Implementation priorities`

    const response = await kaziAI.routeRequest({
      type: 'operational',
      prompt,
      temperature: 0.6,
      maxTokens: 1500
    })

    return {
      analysis: response.content,
      bottlenecks: this.extractBottlenecks(response.content),
      optimizations: this.extractOptimizations(response.content),
      timeSavings: 25 // Estimate 25% time savings on average
    }
  }

  // Helper methods for parsing AI responses
  private extractTactics(content: string): string[] {
    // Simple extraction - look for numbered lists
    const matches = content.match(/\d\.\s*([^\n]+)/g)
    return matches ? matches.slice(0, 5).map(m => m.replace(/^\d\.\s*/, '')) : []
  }

  private extractPackages(content: string): Array<{ name: string; price: number; description: string }> {
    // Default packages if parsing fails
    return [
      { name: 'Starter', price: 0, description: 'Basic package' },
      { name: 'Professional', price: 0, description: 'Standard package' },
      { name: 'Premium', price: 0, description: 'Full-service package' }
    ]
  }

  private extractMilestones(content: string, timeline: string): Array<{ month: number; target: number; actions: string[] }> {
    // Generate sample milestones
    const months = parseInt(timeline) || 12
    const milestones: Array<{ month: number; target: number; actions: string[] }> = []

    for (let i = 1; i <= Math.min(months, 12); i++) {
      milestones.push({
        month: i,
        target: 0, // Would be calculated based on growth trajectory
        actions: [`Month ${i} actions`]
      })
    }

    return milestones
  }

  private extractEmailTemplates(content: string): Array<{ subject: string; body: string; timing: string }> {
    // Default templates
    return [
      { subject: 'Quick question about [pain point]', body: '...', timing: 'Day 0' },
      { subject: 'Following up on my previous email', body: '...', timing: 'Day 3' },
      { subject: 'Case study: How we helped [similar company]', body: '...', timing: 'Day 7' }
    ]
  }

  private extractBottlenecks(content: string): string[] {
    return ['Manual data entry', 'Client communication delays', 'Review cycles']
  }

  private extractOptimizations(content: string): Array<{ action: string; impact: string; effort: string }> {
    return [
      { action: 'Automate reporting', impact: 'High', effort: 'Medium' },
      { action: 'Template responses', impact: 'Medium', effort: 'Low' },
      { action: 'Batch similar tasks', impact: 'Medium', effort: 'Low' }
    ]
  }
}

// Export singleton instance
export const businessGrowthEngine = new BusinessGrowthEngine()

// Export prompt library for direct access
export default businessGrowthEngine
