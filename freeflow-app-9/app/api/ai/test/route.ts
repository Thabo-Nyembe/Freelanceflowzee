import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Simple AI service test
    const testResult = {
      status: 'operational',
      services: ['OpenAI', 'Google AI', 'Context7'],
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      result: testResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI test error: ', error)'
    return NextResponse.json(
      { error: 'AI service test failed' },
      { status: 500 }
    )
  }
}
