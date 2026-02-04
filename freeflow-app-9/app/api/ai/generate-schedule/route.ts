import { NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('API-GenerateSchedule')

export async function POST(request: Request) {
  try {
    const { tasks, goals, preferences } = await request.json()

    const prompt = `You are an AI productivity assistant. Generate an optimized daily schedule based on the following:

Tasks: ${JSON.stringify(tasks || [])}
Goals: ${JSON.stringify(goals || [])}
Preferences: ${JSON.stringify(preferences || { workHours: '9am-5pm', breakDuration: 15 })}

Create a detailed, realistic schedule that:
1. Prioritizes high-impact tasks
2. Includes appropriate breaks
3. Groups similar tasks together
4. Considers energy levels throughout the day
5. Leaves buffer time for unexpected items

Return the schedule as a JSON array of time blocks with this structure:
[
  {
    "time": "9:00 AM",
    "duration": 60,
    "title": "Task name",
    "description": "Brief description",
    "priority": "high|medium|low",
    "type": "work|break|meeting|focus"
  }
]

Only return valid JSON, no markdown or explanations.`

    // Use OpenRouter (which is working) instead of OpenAI
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:9323',
        'X-Title': 'KAZI Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // Use Claude 3.5 Sonnet - fast and smart
        messages: [
          {
            role: 'system',
            content: 'You are an expert productivity and time management AI. You create optimal schedules.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const completion = await response.json()

    const scheduleText = completion.choices[0].message.content || '[]'

    // Try to parse the JSON response
    let schedule
    try {
      // Remove markdown code blocks if present
      const cleanText = scheduleText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      schedule = JSON.parse(cleanText)
    } catch (e) {
      logger.error('Failed to parse AI response', {
        error: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined,
        responseText: scheduleText.substring(0, 200)
      });
      schedule = []
    }

    return NextResponse.json({
      success: true,
      schedule,
      message: 'Schedule generated successfully'
    })

  } catch (error) {
    logger.error('AI Schedule Generation Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate schedule',
        schedule: []
      },
      { status: 500 }
    )
  }
}
