/**
 * KAZI AI HOOK
 * React hook for easy AI integration across the app
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('useKaziAI')

export type AITaskType =
  | 'chat'
  | 'analysis'
  | 'creative'
  | 'legal'
  | 'strategic'
  | 'operational'
  | 'coding'

export interface AIResponse {
  response: string
  metadata: {
    provider: string
    model: string
    tokens: {
      input: number
      output: number
      total: number
    }
    cost: number
    duration: number
    cached?: boolean
  }
}

export interface UseKaziAIReturn {
  chat: (message: string, taskType?: AITaskType, context?: Record<string, any>) => Promise<AIResponse>
  loading: boolean
  error: string | null
  clearError: () => void
}

export function useKaziAI(userId?: string): UseKaziAIReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Realtime subscription for AI chat history updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('kazi-ai-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_chat_history', filter: `user_id=eq.${userId}` },
        (payload) => {
          logger.info('AI chat history updated', {
            eventType: payload.eventType,
            userId
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_usage_logs', filter: `user_id=eq.${userId}` },
        (payload) => {
          logger.info('AI usage updated', {
            eventType: payload.eventType,
            userId
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const chat = useCallback(async (
    message: string,
    taskType: AITaskType = 'chat',
    context?: Record<string, any>
  ): Promise<AIResponse> => {
    setLoading(true)
    setError(null)

    logger.info('AI chat request', {
      userId,
      taskType,
      messageLength: message.length,
      hasContext: !!context
    })

    try {
      const response = await fetch('/api/kazi-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          taskType,
          context,
          userId: userId || 'anonymous'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI request failed')
      }

      const data = await response.json()

      logger.info('AI chat response received', {
        userId,
        provider: data.metadata.provider,
        tokens: data.metadata.tokens.total,
        cached: data.metadata.cached
      })

      setLoading(false)
      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logger.error('AI chat error', { userId, error: errorMessage })
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [userId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    chat,
    loading,
    error,
    clearError
  }
}

// Specialized hooks for specific use cases

export function useBusinessIntelligence(userId?: string) {
  const { chat, loading, error } = useKaziAI(userId)

  const analyzeProject = useCallback(async (projectData: {
    name: string
    budget: number
    timeline: number
    clientType: string
    description?: string
  }) => {
    const prompt = `Analyze this project and provide detailed business intelligence:

Project: ${projectData.name}
Budget: $${projectData.budget.toLocaleString()}
Timeline: ${projectData.timeline} days
Client Type: ${projectData.clientType}
${projectData.description ? `Description: ${projectData.description}` : ''}

Provide comprehensive insights on:
1. Profitability Assessment - Calculate expected profit margins and ROI
2. Risk Factors - Identify potential risks and mitigation strategies
3. Optimization Opportunities - Suggest ways to improve efficiency and outcomes
4. Pricing Recommendations - Evaluate if pricing is optimal based on scope
5. Timeline Feasibility - Assess if timeline is realistic
6. Success Factors - Key elements that will determine project success

Be specific with numbers and actionable recommendations.`

    return await chat(prompt, 'analysis', projectData)
  }, [chat])

  const generatePricingStrategy = useCallback(async (userData: {
    skills: string[]
    experience: number
    market: string
    currentRate: number
    services?: string[]
  }) => {
    const prompt = `Generate a comprehensive pricing strategy for this professional:

Skills: ${userData.skills.join(', ')}
Experience: ${userData.experience} years
Market: ${userData.market}
Current Rate: $${userData.currentRate}/hour
${userData.services ? `Services: ${userData.services.join(', ')}` : ''}

Provide detailed pricing recommendations:
1. Market Analysis - Compare against industry benchmarks for ${userData.market}
2. Recommended Pricing Tiers:
   - Basic Package (for budget clients)
   - Standard Package (most popular)
   - Premium Package (high-value clients)
3. Value-Based Pricing - How to price based on value delivered vs. time
4. Negotiation Strategies - Tips for discussing rates with clients
5. Rate Increase Plan - When and how to raise rates over the next 12 months
6. Package Offerings - Suggest bundled services for higher revenue

Include specific dollar amounts and percentage recommendations.`

    return await chat(prompt, 'strategic', userData)
  }, [chat])

  const optimizeWorkflow = useCallback(async (workflowData: {
    dailyTasks: string[]
    timeSpent: Record<string, number>
    painPoints?: string[]
    tools?: string[]
  }) => {
    const prompt = `Analyze this workflow and provide optimization recommendations:

Daily Tasks:
${workflowData.dailyTasks.map((task, i) => `${i + 1}. ${task}`).join('\n')}

Time Spent:
${Object.entries(workflowData.timeSpent).map(([task, hours]) => `- ${task}: ${hours} hours`).join('\n')}

${workflowData.painPoints ? `Pain Points:\n${workflowData.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}
${workflowData.tools ? `Current Tools: ${workflowData.tools.join(', ')}` : ''}

Provide actionable optimization strategies:
1. Bottleneck Identification - What's slowing you down the most
2. Automation Opportunities - Tasks that can be automated (with specific tools)
3. Time-Saving Strategies - Techniques to reduce time on repetitive tasks
4. Tool Recommendations - Suggest better tools or integrations
5. Workflow Redesign - Propose an optimized daily schedule
6. Efficiency Metrics - Set targets for improvement (save X hours per week)
7. Quick Wins - 3 changes you can implement immediately

Be specific with tool names, time savings estimates, and implementation steps.`

    return await chat(prompt, 'operational', workflowData)
  }, [chat])

  const generateBusinessPlan = useCallback(async (businessData: {
    businessType: string
    skills: string[]
    targetMarket: string
    goals: string[]
    currentRevenue?: number
    targetRevenue?: number
  }) => {
    const prompt = `Create a comprehensive business growth plan:

Business Type: ${businessData.businessType}
Skills/Services: ${businessData.skills.join(', ')}
Target Market: ${businessData.targetMarket}
Goals: ${businessData.goals.join(', ')}
${businessData.currentRevenue ? `Current Revenue: $${businessData.currentRevenue.toLocaleString()}/month` : ''}
${businessData.targetRevenue ? `Target Revenue: $${businessData.targetRevenue.toLocaleString()}/month` : ''}

Provide a detailed business growth strategy:
1. Market Positioning - How to differentiate in ${businessData.targetMarket}
2. Revenue Streams - Multiple ways to monetize skills
3. Client Acquisition Strategy - Specific tactics to find and win clients
4. Marketing Plan - Content, social media, and outreach strategies
5. Scaling Roadmap - How to grow from current to target revenue
6. Operational Systems - Processes needed to support growth
7. Financial Projections - Month-by-month revenue targets and milestones
8. Action Plan - Prioritized steps for the next 90 days

Include specific metrics, timelines, and success indicators.`

    return await chat(prompt, 'strategic', businessData)
  }, [chat])

  return {
    analyzeProject,
    generatePricingStrategy,
    optimizeWorkflow,
    generateBusinessPlan,
    loading,
    error
  }
}

export function useContentGeneration(userId?: string) {
  const { chat, loading, error } = useKaziAI(userId)

  const generateEmail = useCallback(async (emailData: {
    type: 'proposal' | 'follow-up' | 'inquiry' | 'update' | 'thank-you'
    recipient: string
    context: string
    tone?: 'professional' | 'friendly' | 'formal'
  }) => {
    const prompt = `Write a ${emailData.tone || 'professional'} email:

Type: ${emailData.type}
To: ${emailData.recipient}
Context: ${emailData.context}

Create a complete, well-structured email that is:
- Clear and concise
- Action-oriented (if applicable)
- Appropriately ${emailData.tone || 'professional'} in tone
- Ready to send with minimal editing

Include subject line and email body.`

    return await chat(prompt, 'creative', emailData)
  }, [chat])

  const generateProposal = useCallback(async (proposalData: {
    clientName: string
    projectType: string
    scope: string[]
    timeline: string
    budget: number
    deliverables: string[]
  }) => {
    const prompt = `Create a professional project proposal:

Client: ${proposalData.clientName}
Project Type: ${proposalData.projectType}
Timeline: ${proposalData.timeline}
Budget: $${proposalData.budget.toLocaleString()}

Scope of Work:
${proposalData.scope.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Deliverables:
${proposalData.deliverables.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Generate a comprehensive proposal with:
1. Executive Summary
2. Project Understanding
3. Proposed Approach
4. Detailed Scope of Work
5. Timeline & Milestones
6. Pricing Breakdown
7. Terms & Conditions
8. Next Steps

Make it professional, persuasive, and client-focused.`

    return await chat(prompt, 'creative', proposalData)
  }, [chat])

  const generateMarketingCopy = useCallback(async (copyData: {
    platform: 'website' | 'social' | 'ad' | 'email'
    product: string
    targetAudience: string
    goal: string
    tone?: string
  }) => {
    const prompt = `Create compelling marketing copy:

Platform: ${copyData.platform}
Product/Service: ${copyData.product}
Target Audience: ${copyData.targetAudience}
Goal: ${copyData.goal}
Tone: ${copyData.tone || 'professional'}

Create engaging copy that:
- Captures attention immediately
- Speaks directly to ${copyData.targetAudience}
- Drives action toward ${copyData.goal}
- Is optimized for ${copyData.platform}

Provide multiple variations if appropriate.`

    return await chat(prompt, 'creative', copyData)
  }, [chat])

  return {
    generateEmail,
    generateProposal,
    generateMarketingCopy,
    loading,
    error
  }
}

export function useDocumentAnalysis(userId?: string) {
  const { chat, loading, error } = useKaziAI(userId)

  const reviewContract = useCallback(async (contractText: string, context?: string) => {
    const prompt = `Review this contract and provide detailed analysis:

${context ? `Context: ${context}\n\n` : ''}

Contract Text:
${contractText}

Provide comprehensive contract review:
1. Key Terms Summary - Main obligations and rights
2. Risk Assessment - Potential issues or unfavorable terms
3. Missing Clauses - Important protections that should be added
4. Red Flags - Terms that require immediate attention or negotiation
5. Recommendations - Specific changes to request
6. Legal Considerations - Areas where legal counsel may be needed

Be thorough and highlight any concerning language.`

    return await chat(prompt, 'legal', { contractText, context })
  }, [chat])

  const analyzeFinancials = useCallback(async (financialData: {
    revenue: number[]
    expenses: number[]
    period: string
    categories?: Record<string, number>
  }) => {
    const prompt = `Analyze these financial metrics:

Period: ${financialData.period}
Revenue: ${financialData.revenue.map(r => `$${r.toLocaleString()}`).join(', ')}
Expenses: ${financialData.expenses.map(e => `$${e.toLocaleString()}`).join(', ')}

${financialData.categories ? `Expense Categories:\n${Object.entries(financialData.categories).map(([cat, amount]) => `- ${cat}: $${amount.toLocaleString()}`).join('\n')}` : ''}

Provide financial analysis:
1. Revenue Trends - Growth patterns and trajectory
2. Expense Analysis - Where money is going and optimization opportunities
3. Profit Margins - Calculate and assess profitability
4. Cash Flow Health - Current financial position
5. Cost Reduction Opportunities - Specific areas to cut costs
6. Revenue Growth Strategies - How to increase income
7. Financial Projections - Expected performance for next 3-6 months
8. Action Items - Specific financial decisions to make

Include specific numbers and percentages.`

    return await chat(prompt, 'analysis', financialData)
  }, [chat])

  return {
    reviewContract,
    analyzeFinancials,
    loading,
    error
  }
}
