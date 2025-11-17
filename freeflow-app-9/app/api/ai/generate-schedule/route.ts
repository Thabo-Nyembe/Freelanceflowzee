import { NextResponse } from 'next/server'

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
      console.error('Failed to parse AI response:', e)
      schedule = []
    }

    return NextResponse.json({
      success: true,
      schedule,
      message: 'Schedule generated successfully'
    })

  } catch (error: any) {
    console.error('AI Schedule Generation Error:', error)
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
