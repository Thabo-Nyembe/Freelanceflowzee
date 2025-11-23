import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-AIAnalyzeQuality')
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
      Analyze the quality of the following speech/presentation content.
      Consider factors like clarity, engagement, professionalism, and effectiveness.
      Return the response in the following JSON format:
      {
        "score": number (0-1),
        "metrics": {
          "clarity": number (0-1),
          "engagement": number (0-1),
          "professionalism": number (0-1),
          "effectiveness": number (0-1)
        },
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "analysis": "detailed analysis of the content"
      }

      Text to analyze: "${text}"
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const quality = JSON.parse(response.text())

    return NextResponse.json(quality)
  } catch (error) {
    logger.error('Quality analysis error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Failed to analyze quality' },
      { status: 500 }
    )
  }
} 