/**
 * AI Agent Chat API - Send messages to agent and stream responses
 * Implements SSE for real-time updates
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';
import { ManusAgent, AgentStep, AgentMessage, GeneratedFile } from '@/lib/agents/manus-agent';


export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

// POST - Send message to agent (with SSE streaming)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Unauthorized' })}\n\n`));
          controller.close();
          return;
        }

        const body = await request.json();
        const { message, taskType = 'general' } = body;

        if (!message) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Message is required' })}\n\n`));
          controller.close();
          return;
        }

        // Send initial event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', sessionId })}\n\n`));

        // Create agent with callbacks for streaming
        const agent = new ManusAgent({
          onStep: (step: AgentStep) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'step', step })}\n\n`));
          },
          onMessage: (msg: AgentMessage) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'message', message: msg })}\n\n`));
          },
          onFile: (file: GeneratedFile) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'file', file })}\n\n`));
          },
          onError: (error: Error) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`));
          }
        });

        // Load session
        await agent.loadSession(sessionId);

        // Run task
        const task = await agent.runTask(message, taskType);

        // Send completion event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'complete',
          task,
          files: agent.getGeneratedFiles()
        })}\n\n`));

        controller.close();
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
