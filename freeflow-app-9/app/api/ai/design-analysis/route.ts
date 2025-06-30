import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIService } from '@/lib/ai/google-ai-service';

const googleAIService = new GoogleAIService();

export async function POST(request: NextRequest) {
  try {
    const { type, designDescription, context } = await request.json();

    if (!type || !designDescription) {
      return NextResponse.json(
        { error: 'Missing required fields: type and designDescription' },
        { status: 400 }
      );
    }

    // Validate analysis type
    const validTypes = ['accessibility', 'performance', 'responsiveness', 'brand-consistency'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      );
    }

    // Call Google AI service for analysis
    const analysisResult = await googleAIService.analyzeDesign({
      type,
      designDescription,
      context: context || 'FreeflowZee freelance platform'
    });

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Design Analysis Error:', error);
    
    // Return fallback analysis if AI service fails
    return NextResponse.json({
      success: true,
      analysis: {
        score: 87,
        insights: ['Design follows modern best practices', 'Good visual hierarchy'],
        recommendations: ['Consider accessibility improvements', 'Optimize for mobile devices'],
        confidence: 80
      },
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Design Analysis API',
    endpoints: {
      'POST /api/ai/design-analysis': 'Analyze design for accessibility, performance, responsiveness, or brand consistency'
    },
    version: '1.0.0'
  });
} 