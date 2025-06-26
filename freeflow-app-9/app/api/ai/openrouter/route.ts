import { NextRequest, NextResponse } from 'next/server'
import { openRouterService } from '@/lib/ai/openrouter-service'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, type, model } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    let response: string

    // Handle different types of AI requests
    switch (type) {
      case 'business-insights':
        response = await openRouterService.generateBusinessInsights(context)
        break
      
      case 'project-suggestions':
        response = await openRouterService.generateProjectSuggestions(context)
        break
      
      case 'client-communication':
        const { communicationType, ...communicationContext } = context
        response = await openRouterService.generateClientCommunication(
          communicationType || 'email',
          communicationContext
        )
        break
      
      case 'marketing-content':
        const { contentType, ...marketingContext } = context
        response = await openRouterService.generateMarketingContent(
          contentType || 'social-media-post',
          marketingContext
        )
        break
      
      default:
        response = await openRouterService.generateResponse(prompt, context, model)
    }

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('OpenRouter API error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate AI response',
        details: error.cause || null
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test endpoint to check OpenRouter connection
    const url = new URL(request.url)
    const test = url.searchParams.get('test')

    if (test === 'connection') {
      const isConnected = await openRouterService.testConnection()
      return NextResponse.json({
        success: true,
        connected: isConnected,
        timestamp: new Date().toISOString()
      })
    }

    if (test === 'models') {
      const models = await openRouterService.getAvailableModels()
      return NextResponse.json({
        success: true,
        models: models.slice(0, 10), // Return first 10 models
        total: models.length,
        timestamp: new Date().toISOString()
      })
    }

    // Default: Return API info
    return NextResponse.json({
      success: true,
      message: 'OpenRouter AI API is ready',
      endpoints: {
        'POST /api/ai/openrouter': 'Generate AI responses',
        'GET /api/ai/openrouter?test=connection': 'Test connection',
        'GET /api/ai/openrouter?test=models': 'List available models'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('OpenRouter GET error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process request'
      },
      { status: 500 }
    )
  }
} 