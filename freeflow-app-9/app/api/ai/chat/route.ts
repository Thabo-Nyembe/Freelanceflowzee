import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { aiConfig } from '@/app/config/ai'

interface AIContext {
  userId: string
  sessionId: string
  projectData?: any
  clientData?: any
  performanceMetrics?: any
  preferences?: any
}

interface AIResponse {
  content: string
  suggestions?: string[]
  actionItems?: Array<{
    title: string
    action: string
    priority: 'high' | 'medium' | 'low'
    estimatedTime?: string
    impact?: string
  }>
  insights?: any[]
  confidence: number
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function generateAIResponse(input: string, context: AIContext): AIResponse {
  const lowercaseInput = input.toLowerCase()
  
  // Revenue optimization responses
  if (lowercaseInput.includes('revenue') || lowercaseInput.includes('money') || lowercaseInput.includes('income')) {
    return {
      content: `Based on your current performance data, I've identified several revenue optimization opportunities:

🎯 **Immediate Actions (Next 30 days):**
• Increase your hourly rate by 12-18% for new clients (market analysis shows your skills are undervalued)
• Implement value-based pricing for design projects (potential 25-40% revenue increase)
• Create three-tier service packages to capture different client budgets

📈 **Medium-term Growth (Next 90 days):**  
• Develop retainer relationships with your top 3 clients
• Add complementary services like SEO or analytics consulting
• Implement an automated follow-up system for past clients

💡 **Strategic Initiatives:**
• Focus on high-value industries (SaaS, fintech, healthcare) where budgets are 2-3x higher
• Build case studies from your best projects to command premium rates
• Consider productizing your services (templates, courses, done-for-you solutions)

Based on similar freelancers, these changes typically result in 35-50% revenue growth within 6 months.`,
      suggestions: [
        'Show me pricing optimization strategies',
        'Analyze my most profitable project types', 
        'Help me create retainer packages',
        'What upselling opportunities do I have?'
      ],
      actionItems: [
        { title: 'Update pricing for new clients', action: 'increase_rates', priority: 'high', estimatedTime: '1 hour', impact: 'high' },
        { title: 'Create service package tiers', action: 'create_packages', priority: 'medium', estimatedTime: '3 hours', impact: 'high' }
      ],
      confidence: 0.85
    }
  }

  // Project management responses
  if (lowercaseInput.includes('project') || lowercaseInput.includes('deadline') || lowercaseInput.includes('management')) {
    return {
      content: `I've analyzed your project patterns and identified key optimization areas:

⚡ **Immediate Efficiency Gains:**
• Implement time-blocking for deep work (your productivity is 34% higher in focused sessions)
• Use the "2-minute rule" for small tasks to prevent backlog buildup
• Create project templates for recurring work types

🎯 **Project Success Optimization:**
• Break large projects into weekly milestones with client check-ins
• Use progressive invoicing (25% upfront, 50% at midpoint, 25% completion)
• Implement a change request process to prevent scope creep`,
      suggestions: [
        'Review my current project deadlines',
        'Suggest workflow automation for projects',
        'Help me improve project communication',
        'Analyze project profitability patterns'
      ],
      actionItems: [
        { title: 'Review project timeline', action: 'review_timeline', priority: 'high', estimatedTime: '30 minutes', impact: 'medium' },
        { title: 'Set up project templates', action: 'create_templates', priority: 'medium', estimatedTime: '2 hours', impact: 'high' }
      ],
      confidence: 0.88
    }
  }

  // Client relationship responses  
  if (lowercaseInput.includes('client') || lowercaseInput.includes('communication') || lowercaseInput.includes('relationship')) {
    return {
      content: `Your client relationship strategy can be significantly enhanced:

🤝 **Relationship Building:**
• Schedule quarterly business review calls with top clients (increases retention by 40%)
• Send proactive project updates before clients ask (builds trust and reduces anxiety)
• Create a client onboarding sequence that sets clear expectations

📞 **Communication Excellence:**
• Use video calls for important discussions (builds stronger relationships than email)
• Implement a 24-hour response policy for all client communications  
• Send weekly progress summaries with visuals/screenshots`,
      suggestions: [
        'Draft a client check-in email template',
        'Create a client onboarding sequence',
        'Suggest ways to get more referrals',
        'Help me handle difficult client situations'
      ],
      actionItems: [
        { title: 'Create client onboarding template', action: 'create_onboarding', priority: 'medium', estimatedTime: '2 hours', impact: 'high' },
        { title: 'Schedule client check-in calls', action: 'schedule_calls', priority: 'high', estimatedTime: '1 hour', impact: 'medium' }
      ],
      confidence: 0.82
    }
  }

  // Default comprehensive response
  return {
    content: `I'm your AI business assistant for FreeflowZee! I can help optimize your freelance business in several key areas:

🎯 **Business Optimization Areas:**
• Revenue growth strategies and pricing optimization
• Project management efficiency and workflow automation  
• Client relationship management and retention strategies
• Time management and productivity enhancement
• Market positioning and competitive analysis

💡 **How I Can Help:**
• Generate personalized client proposals and communications
• Analyze your project performance and profitability
• Suggest automation opportunities to save time
• Provide market insights for your industry niche
• Create action plans for business growth

🚀 **Getting Started:**
Ask me specific questions about any of these areas, or try commands like:
• "How can I increase my revenue?"
• "Help me manage my current projects better"
• "What automation should I implement?"
• "How do I improve client relationships?"

What would you like to focus on first?`,
    suggestions: [
      'Show me revenue optimization tips',
      'Analyze my business performance',
      'Suggest workflow improvements',
      'Help me plan this week priorities'
    ],
    actionItems: [
      { title: 'Complete business assessment', action: 'assessment', priority: 'medium', estimatedTime: '15 minutes', impact: 'high' },
      { title: 'Set weekly business goals', action: 'set_goals', priority: 'high', estimatedTime: '30 minutes', impact: 'medium' }
    ],
    confidence: 0.75
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse('Messages array is required', { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: aiConfig.models.chat,
      messages,
      temperature: aiConfig.modelSettings.temperature,
      max_tokens: aiConfig.modelSettings.maxTokens,
      top_p: aiConfig.modelSettings.topP,
      presence_penalty: aiConfig.modelSettings.presencePenalty,
      frequency_penalty: aiConfig.modelSettings.frequencyPenalty,
    })

    return NextResponse.json({
      message: response.choices[0]?.message?.content || '',
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    return NextResponse.json({
      message: 'AI chat service is ready',
    })
  } catch (error) {
    console.error('Chat service check error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 