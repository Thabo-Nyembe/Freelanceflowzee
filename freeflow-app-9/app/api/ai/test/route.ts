import { NextRequest, NextResponse } from "next/server
import { enhancedAIService } from '@/lib/ai/enhanced-ai-service

export async function GET() {
  try {
    // Test if the service exists and has required methods
    const serviceCheck = {
      serviceExists: !!enhancedAIService,
      generateResponseExists: typeof enhancedAIService.generateResponse === 'function',
      generateContentExists: typeof enhancedAIService.generateContent === 'function',
      suggestAutomationsExists: typeof enhancedAIService.suggestAutomations === 'function
    }

    if (!enhancedAIService.generateResponse) {
      return NextResponse.json({
        success: false,
        error: 'generateResponse method not found',
        serviceCheck
      }, { status: 500 })
    }

    // Test AI response generation
    const testResponse = await enhancedAIService.generateResponse('How can I increase my revenue?', {
      userId: 'test-user',
      sessionId: 'test-session',
      projectData: null,
      clientData: null,
      performanceMetrics: null,
      preferences: null
    })

    return NextResponse.json({
      success: true,
      message: 'AI service is working correctly',
      serviceCheck,
      testResponse: {
        content: testResponse.content.substring(0, 200) + '...',
        suggestionsCount: testResponse.suggestions?.length || 0,
        actionItemsCount: testResponse.actionItems?.length || 0,
        confidence: testResponse.confidence
      }
    })

  } catch (error: unknown) {
    console.error('AI Test Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 })
  }
}
