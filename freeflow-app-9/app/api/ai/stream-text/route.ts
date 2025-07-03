import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

// Input validation schema
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  id: z.string().optional(),
  parts: z.array(z.any()).optional(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).optional(),
  prompt: z.string().optional(),
  system: z.string().optional(),
  useWebSearch: z.boolean().optional().default(false),
  useFileSearch: z.boolean().optional().default(false),
  temperature: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    const { messages, prompt, system, useWebSearch, useFileSearch, temperature } = requestSchema.parse(input);

    // Custom web search tool implementation
    const webSearchTool = {
      description: 'Search the web for current information',
      inputSchema: z.object({
        query: z.string().describe('The search query'),
      }),
      execute: async ({ query }: { query: string }) => {
        // Simulate web search (replace with real implementation)
        return {
          results: [
            {
              title: `Results for: ${query}`,
              url: 'https://example.com',
              snippet: 'Web search results would appear here',
            }
          ]
        };
      },
    };

    // Custom file search tool implementation
    const fileSearchTool = {
      description: 'Search through uploaded files and documents',
      inputSchema: z.object({
        query: z.string().describe('What to search for in files'),
      }),
      execute: async ({ query }: { query: string }) => {
        // Simulate file search (replace with real implementation)
        return {
          files: [
            {
              name: 'document.pdf',
              content: `File content related to: ${query}`,
              relevance: 0.95,
            }
          ]
        };
      },
    };

    // Configure tools based on request
    const tools: any = {};
    if (useWebSearch) {
      tools.webSearch = webSearchTool;
    }
    if (useFileSearch) {
      tools.fileSearch = fileSearchTool;
    }

    // Use streamText for real-time streaming
    const result = streamText({
      model: openai('gpt-4o'),
      prompt: prompt || (messages ? messages.map(msg => ({
        ...msg,
        parts: msg.parts || [{ type: 'text', text: msg.content }],
      })) : []),
      system,
      tools: Object.keys(tools).length > 0 ? tools : undefined,
      temperature,
    });

    // Create a TransformStream to handle the text stream
    const encoder = new TextEncoder();
    const stream = new TransformStream({
      async transform(chunk, controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
      },
      async flush(controller) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      },
    });

    // Pipe the text stream through our transformer
    result.textStream.pipeTo(stream.writable);

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI streaming error: ', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to stream response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}