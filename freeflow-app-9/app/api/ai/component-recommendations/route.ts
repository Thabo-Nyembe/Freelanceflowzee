import { NextRequest, NextResponse } from 'next/server';
import { googleAIService } from '@/lib/ai/google-ai-service';

export async function POST(request: NextRequest) {
  try {
    const { context, projectType, currentComponents } = await request.json();

    if (!context) {
      return NextResponse.json(
        { error: 'Missing required field: context' },
        { status: 400 }
      );
    }

    // Build enhanced context for AI
    const enhancedContext = `
      Project Context: ${context}
      Project Type: ${projectType || 'Freelance Management Platform'}
      Current Components: ${JSON.stringify(currentComponents || [])}
      Platform: FreeflowZee - Professional freelance platform
      Focus: Enterprise-grade UI components for freelancers and clients
    `;

    // Call Google AI service for component recommendations
    const recommendations = await googleAIService.generateComponentRecommendations(enhancedContext);

    return NextResponse.json({
      success: true,
      recommendations,
      context: enhancedContext,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Component Recommendations Error:', error);
    
    // Return fallback recommendations if AI service fails
    return NextResponse.json({
      success: true,
      recommendations: {
        components: [
          {
            name: 'Smart Project Dashboard',
            description: 'AI-powered dashboard with personalized project insights and recommendations',
            aiScore: 95,
            conversionBoost: '+28%',
            implementation: ['Implement real-time analytics', 'Add AI-powered insights', 'Create customizable widgets', 'Add drag-and-drop interface'
            ]
          },
          {
            name: 'Intelligent Client Portal',
            description: 'Client-facing portal with AI-enhanced communication and feedback tools',
            aiScore: 92,
            conversionBoost: '+31%',
            implementation: ['Build secure client login', 'Add real-time messaging', 'Implement file sharing', 'Create feedback system'
            ]
          },
          {
            name: 'AI-Powered Time Tracker',
            description: 'Automatic time tracking with AI suggestions and productivity insights',
            aiScore: 89,
            conversionBoost: '+18%',
            implementation: ['Add automatic detection', 'Create productivity metrics', 'Build reporting dashboard', 'Implement billing integration'
            ]
          }
        ]
      },
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Component Recommendations API',
    endpoints: {
      'POST /api/ai/component-recommendations': 'Get AI-powered component recommendations for your project'
    },
    version: '1.0.0',
    capabilities: ['React/Next.js component suggestions', 'Conversion optimization analysis', 'AI scoring and impact assessment', 'Implementation guidance'
    ]
  });
} 