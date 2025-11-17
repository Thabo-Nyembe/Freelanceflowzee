/**
 * @file AI Collaboration Assistant API
 * @description AI-powered collaboration tools for meetings, feedback analysis, and team productivity
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Collaboration AI tool types
type CollaborationToolType =
  | 'meeting-summary'
  | 'action-items'
  | 'feedback-analysis'
  | 'sentiment-analysis'
  | 'meeting-notes'
  | 'agenda-generator'
  | 'conflict-resolver'
  | 'team-insights'

interface CollaborationToolRequest {
  toolType: CollaborationToolType
  context?: string
  meetingTranscript?: string
  feedbackComments?: string[]
  teamData?: Record<string, any>
  participants?: string[]
  duration?: number
}

interface CollaborationToolResponse {
  success: boolean
  toolType: CollaborationToolType
  result: {
    content: string
    actionItems?: Array<{
      task: string
      assignee?: string
      priority: 'high' | 'medium' | 'low'
      dueDate?: string
    }>
    insights?: Array<{
      category: string
      description: string
      recommendation: string
    }>
    sentiment?: {
      overall: 'positive' | 'neutral' | 'negative' | 'mixed'
      confidence: number
      breakdown?: Record<string, number>
    }
    metadata?: Record<string, any>
  }
  tokensUsed?: number
  cost?: number
}

/**
 * Get system prompt for each collaboration tool type
 */
function getSystemPrompt(toolType: CollaborationToolType): string {
  const prompts: Record<CollaborationToolType, string> = {
    'meeting-summary': `You are an expert meeting facilitator and summarizer. Create concise, actionable meeting summaries that:
- Capture key discussion points and decisions
- Highlight important outcomes
- Identify action items with owners
- Note any blockers or concerns raised
- Format clearly with sections
Keep it professional and focused on what matters.`,

    'action-items': `You are a project management expert. Extract and organize action items from meeting content:
- Identify all tasks, to-dos, and commitments
- Assign priority levels (high, medium, low)
- Suggest appropriate owners when mentioned
- Set realistic due dates when timeframes discussed
- Make each action item specific and measurable
Format as a clear, prioritized list.`,

    'feedback-analysis': `You are a UX research analyst and feedback specialist. Analyze user feedback to:
- Identify common themes and patterns
- Categorize feedback by type (feature request, bug, UX issue, etc.)
- Assess urgency and impact
- Extract specific pain points
- Highlight positive feedback and wins
- Provide actionable recommendations
Be data-driven and objective.`,

    'sentiment-analysis': `You are an expert in sentiment analysis and team dynamics. Analyze the emotional tone and sentiment:
- Determine overall sentiment (positive, neutral, negative, mixed)
- Identify sentiment patterns and shifts
- Note any concerns or frustrations
- Highlight enthusiasm and engagement
- Assess team morale indicators
- Provide confidence scores
Be nuanced and consider context.`,

    'meeting-notes': `You are a professional meeting note-taker. Create comprehensive meeting notes that:
- Organize information chronologically
- Use clear headings and bullet points
- Capture speaker attributions when relevant
- Include timestamps for key moments
- Note decisions made
- Track follow-up items
- Keep formatting clean and scannable
Make it easy to reference later.`,

    'agenda-generator': `You are a meeting planning expert. Generate effective meeting agendas that:
- Start with clear objectives
- Organize topics logically
- Estimate time allocations
- Identify required participants
- Suggest preparation needs
- Include discussion prompts
- End with next steps
Make it structured and time-efficient.`,

    'conflict-resolver': `You are a professional mediator and conflict resolution specialist. Help resolve team conflicts by:
- Identifying root causes objectively
- Acknowledging all perspectives
- Finding common ground
- Suggesting win-win solutions
- Providing communication frameworks
- Recommending next steps
- Maintaining neutrality and empathy
Be diplomatic and solution-focused.`,

    'team-insights': `You are a team productivity and culture analyst. Provide insights on team dynamics:
- Identify collaboration patterns
- Spot productivity trends
- Assess communication effectiveness
- Highlight strengths and opportunities
- Suggest team improvements
- Provide data-driven recommendations
- Focus on actionable insights
Be constructive and evidence-based.`
  }

  return prompts[toolType]
}

/**
 * Get user prompt based on tool type and context
 */
function getUserPrompt(toolType: CollaborationToolType, request: CollaborationToolRequest): string {
  const prompts: Record<CollaborationToolType, string> = {
    'meeting-summary': `Summarize this meeting:
${request.meetingTranscript || 'No transcript provided'}

Participants: ${request.participants?.join(', ') || 'Not specified'}
Duration: ${request.duration ? `${request.duration} minutes` : 'Not specified'}
Additional Context: ${request.context || 'None'}

Provide a comprehensive summary with key decisions, discussions, and action items.`,

    'action-items': `Extract action items from this content:
${request.meetingTranscript || request.context || 'No content provided'}

Participants: ${request.participants?.join(', ') || 'Not specified'}

List all action items with:
- Clear task description
- Suggested assignee (if mentioned)
- Priority level
- Target completion date (if discussed)`,

    'feedback-analysis': `Analyze this user feedback:
${request.feedbackComments?.join('\n\n---\n\n') || request.context || 'No feedback provided'}

Provide:
- Common themes and patterns
- Categorized feedback
- Urgency assessment
- Key pain points
- Actionable recommendations`,

    'sentiment-analysis': `Analyze the sentiment of this content:
${request.meetingTranscript || request.feedbackComments?.join('\n\n') || request.context || 'No content provided'}

Provide:
- Overall sentiment with confidence score
- Sentiment breakdown by category
- Key emotional indicators
- Team morale assessment
- Notable patterns`,

    'meeting-notes': `Create detailed meeting notes from this content:
${request.meetingTranscript || 'No transcript provided'}

Meeting: ${request.context || 'General meeting'}
Participants: ${request.participants?.join(', ') || 'Not specified'}
Duration: ${request.duration ? `${request.duration} minutes` : 'Not specified'}

Format with:
- Clear sections
- Bullet points
- Speaker attributions
- Key decisions highlighted
- Action items separated`,

    'agenda-generator': `Create a meeting agenda for:
Topic: ${request.context || 'Team meeting'}
Participants: ${request.participants?.join(', ') || 'Team members'}
Duration: ${request.duration ? `${request.duration} minutes` : '60 minutes'}
Additional Context: ${request.meetingTranscript || 'None'}

Include:
- Meeting objectives
- Topic breakdown with time allocations
- Discussion prompts
- Expected outcomes
- Preparation requirements`,

    'conflict-resolver': `Help resolve this team conflict:
${request.context || 'No conflict details provided'}

Team Data: ${JSON.stringify(request.teamData || {}, null, 2)}
Participants Involved: ${request.participants?.join(', ') || 'Not specified'}

Provide:
- Root cause analysis
- All perspectives acknowledged
- Common ground identified
- Solution options
- Recommended approach
- Communication framework`,

    'team-insights': `Analyze team collaboration and provide insights:
${request.context || 'No data provided'}

Team Data:
${JSON.stringify(request.teamData || {}, null, 2)}

Participants: ${request.participants?.join(', ') || 'Team members'}

Provide:
- Collaboration patterns
- Productivity trends
- Communication effectiveness
- Team strengths
- Improvement opportunities
- Actionable recommendations`
  }

  return prompts[toolType]
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(systemPrompt: string, userPrompt: string): Promise<any> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured')
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9323',
      'X-Title': 'KAZI Collaboration Hub'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet', // Best for analysis and summarization
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.5, // Lower for more consistent analysis
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Parse AI response and extract structured data
 */
function parseResponse(content: string, toolType: CollaborationToolType): any {
  const result: any = { content }

  // Extract action items if present
  if (['meeting-summary', 'action-items', 'meeting-notes'].includes(toolType)) {
    const actionItems: any[] = []
    const actionItemRegex = /(?:^|\n)\s*[-*]\s*(.+?)(?:\((.+?)\))?\s*(?:\[(.+?)\])?\s*(?:due|by|deadline)?\s*:?\s*(.+)?$/gim

    let match
    while ((match = actionItemRegex.exec(content)) !== null) {
      const task = match[1]?.trim()
      const assignee = match[2]?.trim()
      const priority = match[3]?.toLowerCase()?.includes('high') ? 'high' :
                      match[3]?.toLowerCase()?.includes('low') ? 'low' : 'medium'
      const dueDate = match[4]?.trim()

      if (task) {
        actionItems.push({
          task,
          assignee: assignee || undefined,
          priority,
          dueDate: dueDate || undefined
        })
      }
    }

    if (actionItems.length > 0) {
      result.actionItems = actionItems
    }
  }

  // Extract sentiment if sentiment analysis
  if (toolType === 'sentiment-analysis') {
    const sentimentMatch = content.match(/overall.*?sentiment.*?[:\-]\s*(positive|neutral|negative|mixed)/i)
    const confidenceMatch = content.match(/confidence.*?[:\-]\s*(\d+)%?/i)

    if (sentimentMatch) {
      result.sentiment = {
        overall: sentimentMatch[1].toLowerCase() as any,
        confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) / 100 : 0.8,
        breakdown: {}
      }
    }
  }

  // Extract insights for analysis tools
  if (['feedback-analysis', 'team-insights'].includes(toolType)) {
    const insights: any[] = []
    const sections = content.split(/\n(?=##?\s)/g)

    for (const section of sections) {
      const titleMatch = section.match(/^##?\s*(.+?)$/m)
      if (titleMatch) {
        const category = titleMatch[1].trim()
        const description = section.replace(/^##?\s*.+?$/m, '').trim()

        if (description) {
          insights.push({
            category,
            description: description.split('\n')[0], // First line as description
            recommendation: description.split('\n').slice(1).join(' ').trim()
          })
        }
      }
    }

    if (insights.length > 0) {
      result.insights = insights
    }
  }

  return result
}

/**
 * Main POST handler
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CollaborationToolRequest = await request.json()

    // Validate request
    if (!body.toolType) {
      return NextResponse.json({
        success: false,
        error: 'Tool type is required'
      }, { status: 400 })
    }

    // Get prompts
    const systemPrompt = getSystemPrompt(body.toolType)
    const userPrompt = getUserPrompt(body.toolType, body)

    // Call OpenRouter
    const aiResponse = await callOpenRouter(systemPrompt, userPrompt)

    // Extract response
    const content = aiResponse.choices[0]?.message?.content || ''
    const usage = aiResponse.usage || {}

    // Parse response for structured data
    const parsedResult = parseResponse(content, body.toolType)

    // Calculate approximate cost
    const inputTokens = usage.prompt_tokens || 0
    const outputTokens = usage.completion_tokens || 0
    const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015)

    // Build response
    const response: CollaborationToolResponse = {
      success: true,
      toolType: body.toolType,
      result: parsedResult,
      tokensUsed: inputTokens + outputTokens,
      cost
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Collaboration AI error:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process request'
    }, { status: 500 })
  }
}

/**
 * GET handler for tool types documentation
 */
export async function GET(): Promise<NextResponse> {
  const toolTypes = [
    {
      id: 'meeting-summary',
      name: 'Meeting Summary',
      description: 'Generate comprehensive meeting summaries with key decisions and action items',
      requiredFields: ['meetingTranscript'],
      optionalFields: ['participants', 'duration', 'context']
    },
    {
      id: 'action-items',
      name: 'Action Items Extractor',
      description: 'Extract and organize action items with priorities and assignees',
      requiredFields: ['meetingTranscript'],
      optionalFields: ['participants']
    },
    {
      id: 'feedback-analysis',
      name: 'Feedback Analysis',
      description: 'Analyze user feedback for themes, patterns, and actionable insights',
      requiredFields: ['feedbackComments'],
      optionalFields: ['context']
    },
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      description: 'Analyze sentiment and team morale from communication',
      requiredFields: ['meetingTranscript'],
      optionalFields: ['participants']
    },
    {
      id: 'meeting-notes',
      name: 'Meeting Notes',
      description: 'Create detailed, organized meeting notes',
      requiredFields: ['meetingTranscript'],
      optionalFields: ['participants', 'duration', 'context']
    },
    {
      id: 'agenda-generator',
      name: 'Agenda Generator',
      description: 'Generate structured meeting agendas with time allocations',
      requiredFields: ['context'],
      optionalFields: ['participants', 'duration']
    },
    {
      id: 'conflict-resolver',
      name: 'Conflict Resolver',
      description: 'Help resolve team conflicts with neutral, solution-focused advice',
      requiredFields: ['context'],
      optionalFields: ['teamData', 'participants']
    },
    {
      id: 'team-insights',
      name: 'Team Insights',
      description: 'Analyze team collaboration patterns and productivity',
      requiredFields: ['teamData'],
      optionalFields: ['context', 'participants']
    }
  ]

  return NextResponse.json({
    success: true,
    toolTypes,
    documentation: {
      endpoint: '/api/ai/collaboration',
      method: 'POST',
      example: {
        toolType: 'meeting-summary',
        meetingTranscript: 'Team discussed Q4 roadmap...',
        participants: ['Alice', 'Bob', 'Charlie'],
        duration: 45
      }
    }
  })
}
