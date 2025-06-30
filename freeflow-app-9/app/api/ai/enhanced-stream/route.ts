import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { tool } from 'ai';
import { z } from 'zod';

// FreeflowZee metadata schema
export const freeflowMetadataSchema = z.object({
  duration: z.number().optional(),
  model: z.string().optional(),
  totalTokens: z.number().optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  toolsUsed: z.array(z.string()).optional(),
});

export type FreeflowMetadata = z.infer<typeof freeflowMetadataSchema>;

// Project Analysis Tool
const projectAnalysisTool = tool({
  description: 'Analyze project requirements and suggest optimal workflow',
  inputSchema: z.object({
    projectType: z.enum(['website', 'logo', 'branding', 'mobile-app', 'video', 'content']),
    budget: z.number(),
    timeline: z.string(),
    clientRequirements: z.string(),
  }),
  outputSchema: z.object({
    recommendedSteps: z.array(z.string()),
    timeEstimate: z.string(),
    riskFactors: z.array(z.string()),
    pricing: z.object({
      suggested: z.number(),
      breakdown: z.array(z.object({
        item: z.string(),
        cost: z.number(),
      })),
    }),
  }),
  onInputStart: ({ toolCallId }) => {
    console.log('🎯 Project analysis started:', toolCallId);
  },
  onInputDelta: ({ inputTextDelta, toolCallId }) => {
    console.log('📊 Analyzing project requirements:', inputTextDelta);
  },
  onInputAvailable: ({ input, toolCallId }) => {
    console.log('✅ Project analysis input ready:', input);
  },
  execute: async ({ projectType, budget, timeline, clientRequirements }) => {
    // Simulate project analysis processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseSteps = {
      website: ['Requirements gathering', 'Wireframing', 'Design mockups', 'Development', 'Testing', 'Launch'],
      logo: ['Brand discovery', 'Concept sketches', 'Digital refinement', 'Final delivery'],
      branding: ['Brand strategy', 'Visual identity', 'Guidelines creation', 'Asset development'],
      'mobile-app': ['Research', 'UX/UI design', 'Development', 'Testing', 'Store submission'],
      video: ['Pre-production', 'Filming/Recording', 'Post-production', 'Review & delivery'],
      content: ['Content strategy', 'Research', 'Writing', 'Review', 'Publishing'],
    };

    const recommendedSteps = baseSteps[projectType] || [];
    const timeMultiplier = budget > 5000 ? 1.2 : budget > 2000 ? 1.0 : 0.8;
    const baseTime = projectType === 'website' ? 6 : projectType === 'mobile-app' ? 12 : 4;
    
    return {
      recommendedSteps,
      timeEstimate: `${Math.round(baseTime * timeMultiplier)} weeks`,
      riskFactors: [
        'Scope creep potential',
        'Client feedback delays',
        'Technical complexity variations'
      ],
      pricing: {
        suggested: Math.round(budget * 1.1),
        breakdown: [
          { item: 'Design & Development', cost: Math.round(budget * 0.7) },
          { item: 'Project Management', cost: Math.round(budget * 0.2) },
          { item: 'Testing & QA', cost: Math.round(budget * 0.1) },
        ],
      },
    };
  },
});

// Creative Asset Generator Tool
const creativeAssetTool = tool({
  description: 'Generate creative assets and design suggestions',
  inputSchema: z.object({
    assetType: z.enum(['color-palette', 'typography', 'layout', 'imagery', 'branding-elements']),
    style: z.string(),
    industry: z.string(),
    targetAudience: z.string(),
  }),
  outputSchema: z.object({
    suggestions: z.array(z.object({
      name: z.string(),
      description: z.string(),
      code: z.string().optional(),
      url: z.string().optional(),
    })),
    rationale: z.string(),
  }),
  onInputStart: ({ toolCallId }) => {
    console.log('🎨 Creative asset generation started:', toolCallId);
  },
  onInputDelta: ({ inputTextDelta, toolCallId }) => {
    console.log('🖌️ Processing creative requirements:', inputTextDelta);
  },
  onInputAvailable: ({ input, toolCallId }) => {
    console.log('✨ Creative input ready:', input);
  },
  execute: async ({ assetType, style, industry, targetAudience }) => {
    // Simulate creative generation processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const suggestions = {
      'color-palette': [
        { name: 'Primary Blue', description: 'Professional trust-building color', code: '#2563eb' },
        { name: 'Accent Orange', description: 'Energy and creativity accent', code: '#ea580c' },
        { name: 'Neutral Gray', description: 'Balance and sophistication', code: '#6b7280' },
      ],
      typography: [
        { name: 'Inter', description: 'Modern, readable sans-serif', url: 'https://fonts.google.com/specimen/Inter' },
        { name: 'Playfair Display', description: 'Elegant serif for headers', url: 'https://fonts.google.com/specimen/Playfair+Display' },
      ],
      layout: [
        { name: 'Grid System', description: '12-column responsive grid layout' },
        { name: 'Card-based', description: 'Modern card-based content organization' },
      ],
      imagery: [
        { name: 'Photography Style', description: 'Clean, bright, professional photography' },
        { name: 'Illustration Style', description: 'Minimalist line art illustrations' },
      ],
      'branding-elements': [
        { name: 'Logo Concept', description: 'Geometric, scalable mark' },
        { name: 'Icon System', description: 'Consistent outline icon family' },
      ],
    };

    return {
      suggestions: suggestions[assetType] || [],
      rationale: `These ${assetType} suggestions are tailored for ${industry} industry with ${style} aesthetic, targeting ${targetAudience}.`,
    };
  },
});

// Client Communication Tool
const clientCommunicationTool = tool({
  description: 'Generate professional client communication templates',
  inputSchema: z.object({
    communicationType: z.enum(['proposal', 'update', 'invoice', 'feedback-request', 'project-completion']),
    projectContext: z.string(),
    clientName: z.string(),
    urgency: z.enum(['low', 'medium', 'high']),
  }),
  onInputStart: ({ toolCallId }) => {
    console.log('📧 Client communication generation started:', toolCallId);
  },
  onInputDelta: ({ inputTextDelta, toolCallId }) => {
    console.log('💬 Processing communication request:', inputTextDelta);
  },
  execute: async ({ communicationType, projectContext, clientName, urgency }) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const templates = {
      proposal: `Dear ${clientName},\n\nThank you for considering FreeflowZee for your ${projectContext} project. Based on our discussion, I've prepared a comprehensive proposal that outlines our approach, timeline, and investment.\n\nI'm excited about the opportunity to work together and help bring your vision to life.\n\nBest regards,\nYour FreeflowZee Team`,
      update: `Hi ${clientName},\n\nI wanted to provide you with a quick update on your ${projectContext} project. We're making excellent progress and everything is on track for our scheduled delivery.\n\nPlease let me know if you have any questions or would like to schedule a review call.\n\nBest,\nFreeflowZee Team`,
      invoice: `Dear ${clientName},\n\nAttached is the invoice for the completed work on your ${projectContext} project. Payment is due within 30 days of receipt.\n\nThank you for your business!\n\nFreeflowZee Team`,
      'feedback-request': `Hi ${clientName},\n\nI hope you're pleased with the progress on your ${projectContext} project. I'd love to get your feedback on the latest deliverables.\n\nYour input is invaluable in ensuring we exceed your expectations.\n\nLooking forward to hearing from you!\n\nFreeflowZee Team`,
      'project-completion': `Dear ${clientName},\n\nI'm thrilled to announce that your ${projectContext} project has been completed! It's been a pleasure working with you on this exciting project.\n\nAll final files and documentation have been delivered. Thank you for choosing FreeflowZee!\n\nBest regards,\nFreeflowZee Team`,
    };

    return {
      template: templates[communicationType],
      subject: `${projectContext} - ${communicationType.replace('-', ' ').toUpperCase()}`,
      priority: urgency,
      followUpDays: urgency === 'high' ? 1 : urgency === 'medium' ? 3 : 7,
    };
  },
});

// Time Budget Tool
const timeBudgetTool = tool({
  description: 'Optimize time allocation and resource management',
  inputSchema: z.object({
    availableHours: z.number(),
    projectCount: z.number(),
    deadlines: z.array(z.string()),
    priorities: z.array(z.enum(['low', 'medium', 'high', 'urgent'])),
  }),
  onInputStart: ({ toolCallId }) => {
    console.log('⏰ Time budget optimization started:', toolCallId);
  },
  execute: async ({ availableHours, projectCount, deadlines, priorities }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hoursPerProject = Math.floor(availableHours / projectCount);
    const priorityWeights = { urgent: 1.5, high: 1.2, medium: 1.0, low: 0.8 };
    
    return {
      recommendedAllocation: priorities.map((priority, index) => ({
        project: `Project ${index + 1}`,
        allocatedHours: Math.round(hoursPerProject * (priorityWeights[priority] || 1)),
        priority,
        deadline: deadlines[index] || 'TBD',
      })),
      totalAllocated: availableHours,
      efficiency: 'optimized',
      recommendations: [
        'Focus on urgent priorities first',
        'Buffer 20% time for unexpected tasks',
        'Schedule regular client check-ins',
      ],
    };
  },
});

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const startTime = Date.now();

  try {
    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      tools: {
        projectAnalysis: projectAnalysisTool,
        creativeAsset: creativeAssetTool,
        clientCommunication: clientCommunicationTool,
        timeBudget: timeBudgetTool,
      },
      // Enhanced callbacks for monitoring and logging
      onChunk({ chunk }) {
        // Log different chunk types for debugging
        switch (chunk.type) {
          case 'text':
            console.log('📝 Text chunk:', chunk.text?.substring(0, 50) + '...');
            break;
          case 'tool-call':
            console.log('🔧 Tool call:', chunk.toolName);
            break;
          case 'tool-result':
            console.log('✅ Tool result:', chunk.toolName);
            break;
          default:
            console.log('📦 Chunk type:', chunk.type);
        }
      },
      onFinish({ text, finishReason, usage, response }) {
        // Log completion details
        console.log('🎉 Stream finished:', {
          textLength: text.length,
          finishReason,
          totalTokens: usage.totalTokens,
          duration: Date.now() - startTime,
          messageCount: response.messages?.length || 0,
        });
      },
      onError({ error }) {
        // Enhanced error logging with proper typing
        const err = error as Error;
        console.error('❌ Stream error:', {
          message: err.message,
          type: err.constructor.name,
          stack: err.stack?.substring(0, 500),
          timestamp: new Date().toISOString(),
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        'X-Custom-Model': 'gpt-4o',
        'X-Features': 'project-analysis,creative-assets,client-communication,time-management',
        'X-Start-Time': startTime.toString(),
      },
    });

  } catch (error) {
    console.error('🚨 API Route Error:', error);
    
    // Return a structured error response
    return new Response(
      JSON.stringify({
        error: 'Failed to generate AI response',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 