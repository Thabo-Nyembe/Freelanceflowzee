import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('API-GenerateSuggestions')

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { text, quality } = await request.json()

    if (!text || !quality) {
      return NextResponse.json(
        { error: 'Text and quality analysis are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
      Based on the following speech/presentation content and its quality analysis,
      provide actionable suggestions for improvement.
      Focus on the areas that need the most attention.
      Return the response in the following JSON format:
      {
        "suggestions": [
          {
            "category": "category name",
            "suggestion": "detailed suggestion",
            "priority": "high" | "medium" | "low",
            "example": "example of improved version"
          }
        ],
        "quickTips": ["tip1", "tip2"],
        "longTermImprovements": ["improvement1", "improvement2"]
      }

      Content: "${text}"
      Quality Analysis: ${JSON.stringify(quality)}
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const suggestions = JSON.parse(response.text())

    return NextResponse.json(suggestions)
  } catch (error) {
    logger.error('Suggestion generation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
} 