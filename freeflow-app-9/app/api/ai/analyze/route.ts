import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { aiConfig } from '@/app/config/ai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const analyzePrompt = `Analyze the design patterns and provide insights in the following JSON format:
{
  "category": "string", "score": number between 0 and 1, "insights": ["string"], "recommendations": ["string"]
}

Focus on these categories:
1. Code Organization
2. Component Structure
3. State Management
4. Performance Optimization
5. Error Handling`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const response = await openai.chat.completions.create({
      model: aiConfig.models.analyze,
      messages: [{ role: 'user', content: analyzePrompt }],
      temperature: aiConfig.modelSettings.temperature,
      max_tokens: aiConfig.modelSettings.maxTokens,
      top_p: aiConfig.modelSettings.topP,
      presence_penalty: aiConfig.modelSettings.presencePenalty,
      frequency_penalty: aiConfig.modelSettings.frequencyPenalty,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No analysis content received')
    }

    try {
      const results = JSON.parse(content)
      return NextResponse.json({ results })
    } catch (e) {
      console.error('Failed to parse analysis results: ', e)'
      return new NextResponse('Invalid analysis results format', { status: 500 })
    }
  } catch (error) {
    console.error('Analysis error: ', error)'
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 