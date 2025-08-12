import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    // Mock chat response
    return NextResponse.json({
      success: true,
      response: {
        content: "This is a mock AI response to: " + message,
        suggestions: ["Try this", "Consider that", "Explore this option"],
        actionItems: [
          { 
            title: "Review mock suggestion", 
            action: "review", 
            priority: "medium",
            estimatedTime: "30 minutes",
            impact: "medium"
          }
        ]
      }
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}