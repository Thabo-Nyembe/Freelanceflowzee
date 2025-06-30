import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action'
  const fileId = searchParams.get('fileId'

  console.log('🧪 UPF Test API called:', { action, fileId })

  try {
    // Return mock data for testing while database is being set up
    const mockComments = [
      {
        id: '1,
        fileId: fileId || 'test-file-1,
        projectId: 'project-1,
        userId: 'user-1,
        content: 'The animation timing feels a bit fast in the logo reveal section.,
        commentType: 'video,
        positionData: { timestamp: 5.2 },
        priority: 'medium,
        status: 'open,
        mentions: [],
        aiAnalysis: {
          category: 'Timing Feedback,
          themes: ['Animation', 'Pacing'],
          sentiment: 'constructive,
          priority: 'medium,
          estimatedEffort: '2-3 hours'
        },
        reactions: [
          { type: 'thumbs_up', count: 2, users: ['user-2', 'user-3'] }'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2,
        fileId: fileId || 'test-file-1,
        projectId: 'project-1,
        userId: 'user-2,
        content: 'Love the color scheme! Could we try a darker shade for the CTA button?,
        commentType: 'image,
        positionData: { x: 450, y: 320 },
        priority: 'low,
        status: 'open,
        mentions: ['@designer'],
        aiAnalysis: {
          category: 'Design Feedback,
          themes: ['Colors', 'UI Elements'],
          sentiment: 'positive,
          priority: 'low,
          estimatedEffort: '1 hour'
        },
        reactions: [
          { type: 'love', count: 1, users: ['user-1'] },
          { type: 'thumbs_up', count: 3, users: ['user-1', 'user-3', 'user-4'] }'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    const mockStats = {
      totalComments: mockComments.length,
      openComments: mockComments.filter(c => c.status === 'open').length,
      resolvedComments: mockComments.filter(c => c.status === 'resolved').length,
      highPriorityComments: mockComments.filter(c => c.priority === 'high').length'
    }

    switch (action) {
      case 'get_comments':'
        return NextResponse.json({
          success: true,
          comments: mockComments,
          stats: mockStats,
          message: '🧪 Mock data - Database setup required for full functionality'
        })

      case 'get_ai_insights':'
        return NextResponse.json({
          success: true,
          insights: {
            summary: 'Most feedback focuses on timing and visual elements,
            trends: ['Animation timing concerns', 'Positive color reception'],
            priorities: ['Address video timing', 'Minor UI adjustments'],
            categories: {
              'Design Feedback': 1, 'Timing Feedback': 1'
            }
          },
          message: '🧪 Mock AI insights - Real AI analysis coming soon'
        })

      default:
        return NextResponse.json({
          success: true,
          message: '🧪 UPF Test API is working! Database setup required for full functionality.,
          availableActions: ['get_comments', 'get_ai_insights'],
          nextSteps: ['1. Complete database setup in Supabase SQL Editor', '2. Copy SQL from scripts/create-upf-tables.sql', '3. Restart server and test again'
          ]
        })
    }

  } catch (error) {
    console.error('UPF Test API error:', error)
    return NextResponse.json(
      { 
        error: 'Test API error', '
        details: error instanceof Error ? error.message : 'Unknown error,
        note: 'This is the test endpoint - main endpoint requires database setup'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🧪 UPF Test POST:', body)

    return NextResponse.json({
      success: true,
      message: '🧪 Test POST successful - Database required for real operations,
      received: body,
      nextSteps: ['Complete database setup to enable real comment creation', 'Use the main /api/collaboration/upf endpoint after setup'
      ]
    })

  } catch (error) {
    console.error('UPF Test POST error:', error)
    return NextResponse.json(
      { error: 'Test POST error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 