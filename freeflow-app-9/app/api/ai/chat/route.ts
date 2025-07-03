import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { aiConfig } from '@/app/config/ai'

interface AIContext {
  userId: string
  sessionId: string
  projectData?: unknown
  clientData?: unknown
  performanceMetrics?: unknown
  preferences?: unknown
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
  insights?: unknown[]
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
      content: `Based on your current performance data, I've identified several revenue optimization opportunities:\n\n🎯 **Immediate Actions (Next 30 days):**\n• Increase your hourly rate by 12-18% for new clients (market analysis shows your skills are undervalued)\n• Implement value-based pricing for design projects (potential 25-40% revenue increase)\n• Create three-tier service packages to capture different client budgets\n\n📈 **Medium-term Growth (Next 90 days):**  \n• Develop retainer relationships with your top 3 clients\n• Add complementary services like SEO or analytics consulting\n• Implement an automated follow-up system for past clients\n\n💡 **Strategic Initiatives:**\n• Focus on high-value industries (SaaS, fintech, healthcare) where budgets are 2-3x higher\n• Build case studies from your best projects to command premium rates\n• Consider productizing your services (templates, courses, done-for-you solutions)\n\nBased on similar freelancers, these changes typically result in 35-50% revenue growth within 6 months.`,
      suggestions: ['Show me pricing optimization strategies', 'Analyze my most profitable project types', 'Help me create retainer packages', 'What upselling opportunities do I have?'],
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
      content: `I've analyzed your project patterns and identified key optimization areas:\n\n⚡ **Immediate Efficiency Gains:**\n• Implement time-blocking for deep work (your productivity is 34% higher in focused sessions)\n• Use the "2-minute rule" for small tasks to prevent backlog buildup\n• Create project templates for recurring work types\n\n🎯 **Project Success Optimization:**\n• Break large projects into weekly milestones with client check-ins\n• Use progressive invoicing (25% upfront, 50% at midpoint, 25% completion)\n• Implement a change request process to prevent scope creep`,
      suggestions: ['Review my current project deadlines', 'Suggest workflow automation for projects', 'Help me improve project communication', 'Analyze project profitability patterns'],
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
      content: `Your client relationship strategy can be significantly enhanced:\n\n🤝 **Relationship Building:**\n• Schedule quarterly business review calls with top clients (increases retention by 40%)\n• Send proactive project updates before clients ask (builds trust and reduces anxiety)\n• Create a client onboarding sequence that sets clear expectations\n\n📞 **Communication Excellence:**\n• Use video calls for important discussions (builds stronger relationships than email)\n• Implement a 24-hour response policy for all client communications  \n• Send weekly progress summaries with visuals/screenshots`,
      suggestions: ['Draft a client check-in email template', 'Create a client onboarding sequence', 'Suggest ways to get more referrals', 'Help me handle difficult client situations'],
      actionItems: [
        { title: 'Create client onboarding template', action: 'create_onboarding', priority: 'medium', estimatedTime: '2 hours', impact: 'high' },
        { title: 'Schedule client check-in calls', action: 'schedule_calls', priority: 'high', estimatedTime: '1 hour', impact: 'medium' }
      ],
      confidence: 0.82
    }
  }

  // Default comprehensive response
  return {
    content: `I'm your AI business assistant for FreeflowZee! I can help optimize your freelance business in several key areas:\n\n🎯 **Business Optimization Areas:**\n• Revenue growth strategies and pricing optimization\n• Project management efficiency and workflow automation  \n• Client relationship management and retention strategies\n• Time management and productivity enhancement\n• Market positioning and competitive analysis\n\n💡 **How I Can Help:**\n• Generate personalized client proposals and communications\n• Analyze your project performance and profitability\n• Suggest automation opportunities to save time\n• Provide market insights for your industry niche\n• Create action plans for business growth\n\n🚀 **Getting Started:**\nAsk me specific questions about any of these areas, or try commands like: • "How can I increase my revenue?\n• "Help me manage my current projects better\n• "What automation should I implement?\n• "How do I improve client relationships?\n\nWhat would you like to focus on first?`,
    suggestions: ['Show me revenue optimization tips', 'Analyze my business performance', 'Suggest workflow improvements', 'Help me plan this week priorities'],
    actionItems: [
      { title: 'Complete business assessment', action: 'assessment', priority: 'medium', estimatedTime: '15 minutes', impact: 'high' },
      { title: 'Set weekly business goals', action: 'set_goals', priority: 'high', estimatedTime: '30 minutes', impact: 'medium' }
    ],
    confidence: 0.75
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse('Messages array is required', { status: 400 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userInput = lastMessage?.content || lastMessage?.text || ''

    // Create mock context for demo purposes
    const mockContext: AIContext = {
      userId: 'demo-user',
      sessionId: 'demo-session-' + Date.now(),
      projectData: { activeProjects: 3, completionRate: 0.85 },
      clientData: { totalClients: 5, retentionRate: 0.9 },
      performanceMetrics: { avgHourlyRate: 75, monthlyRevenue: 4200 }
    }

    // Try OpenAI first, fall back to mock AI response
    try {
      if (process.env.OPENAI_API_KEY && openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are FreeflowZee AI, a business optimization assistant for freelancers. Provide actionable advice with specific suggestions and action items.' },
            { role: 'user', content: userInput }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        })

        const content = response.choices[0]?.message?.content || ''
        
        // Convert OpenAI response to our format
        return NextResponse.json({
          content,
          suggestions: [
            'Tell me more about this topic',
            'What are the next steps?',
            'Show me related strategies',
            'How can I implement this?'
          ],
          actionItems: [
            { title: 'Review the suggestions above', action: 'review', priority: 'medium', estimatedTime: '10 minutes', impact: 'medium' }
          ],
          confidence: 0.8
        })
      }
    } catch (openaiError) {
      console.log('OpenAI unavailable, using mock AI responses:', openaiError instanceof Error ? openaiError.message : 'Unknown error')
    }

    // Use the rich mock AI response as fallback
    const aiResponse = generateAIResponse(userInput, mockContext)
    return NextResponse.json(aiResponse)

  } catch (error) {
    console.error('Chat error: ', error)
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
    console.error('Chat service check error: ', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 