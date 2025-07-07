import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
      Analyze the sentiment of the following text and provide a detailed breakdown.
      Return the response in the following JSON format:
      {
        "sentiment": {
          "positive": number (0-1),
          "neutral": number (0-1),
          "negative": number (0-1)
        },
        "emotions": ["emotion1", "emotion2"],
        "tone": "overall tone description",
        "confidence": number (0-1)
      }

      Text to analyze: "${text}"
    `

    const result = await model.generateContent(prompt)
    const response = result.response
    const sentiment = JSON.parse(response.text())

    return NextResponse.json(sentiment)
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
      { status: 500 }
    )
  }
} 