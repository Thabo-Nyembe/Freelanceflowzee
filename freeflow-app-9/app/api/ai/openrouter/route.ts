import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { type, context } = await request.json()

    if (!type || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: type and context' },
        { status: 400 }
      )
    }

    let response

    // Handle different types of AI requests with mock responses
    switch (type) {
      case 'business-insights':
        response = {
          insights: ['Focus on high-value clients', 'Optimize project workflow'],
          recommendations: ['Increase rates by 15%', 'Add retainer services'],
          confidence: 0.85
        }
        break
      
      case 'project-suggestions':
        response = {
          suggestions: ['Web design project', 'Mobile app development'],
          priorities: ['high', 'medium'],
          confidence: 0.9
        }
        break
      
      case 'client-communication':
        response = {
          message: 'Professional email template generated',
          tone: 'professional',
          confidence: 0.88
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Unsupported request type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OpenRouter API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OpenRouter AI API',
    supportedTypes: ['business-insights', 'project-suggestions', 'client-communication'],
    version: '1.0.0'
  })
} 