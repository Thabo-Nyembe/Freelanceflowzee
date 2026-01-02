import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      suggestions: [
        { id: '1', type: 'design', content: 'Consider using a warmer color palette', confidence: 0.85 },
        { id: '2', type: 'copy', content: 'The headline could be more action-oriented', confidence: 0.78 },
      ],
      insights: {
        projectHealth: 85,
        estimatedCompletion: '2024-02-01',
        riskFactors: []
      }
    }
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    data: {
      generated: true,
      result: 'AI-generated content based on your request',
      ...body
    }
  })
}
