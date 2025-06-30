import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  streamText,
  UIMessage,
  createUIMessageStream,
  ToolSet,
} from 'ai';
import { z } from 'zod';
import { ExampleMetadata } from '@/app/types/chat';

export const runtime = 'edge';

// --- Real FreeflowZee Tool Definitions ---
const tools: ToolSet = {
  createProject: {
    description: 'Create a new project in the Projects Hub',
    inputSchema: z.object({
      name: z.string(),
      description: z.string(),
    }),
    execute: async ({ name, description }: { name: string; description: string }) => {
      // Simulate project creation (replace with real logic)
      await new Promise((res) => setTimeout(res, 800));
      return { success: true, projectId: 'prj-' + Date.now(), name, description };
    },
  },
  uploadFile: {
    description: 'Upload a file to the Files Hub',
    inputSchema: z.object({
      fileName: z.string(),
      fileType: z.string(),
    }),
    execute: async ({ fileName, fileType }: { fileName: string; fileType: string }) => {
      // Simulate file upload (replace with real logic)
      await new Promise((res) => setTimeout(res, 600));
      return { success: true, fileId: 'file-' + Date.now(), fileName, fileType };
    },
  },
  generateAsset: {
    description: 'Generate an AI asset (image, text, code) using AI Create',
    inputSchema: z.object({
      type: z.string(),
      prompt: z.string(),
    }),
    execute: async ({ type, prompt }: { type: string; prompt: string }) => {
      // Simulate AI asset generation (replace with real logic)
      await new Promise((res) => setTimeout(res, 1200));
      return { success: true, assetId: 'asset-' + Date.now(), type, prompt, url: '/assets/sample-' + type + '.png' };
    },
  },
  createEscrowDeposit: {
    description: 'Create a new escrow deposit for a project',
    inputSchema: z.object({
      projectId: z.string(),
      amount: z.number(),
    }),
    execute: async ({ projectId, amount }: { projectId: string; amount: number }) => {
      // Simulate escrow deposit (replace with real logic)
      await new Promise((res) => setTimeout(res, 700));
      return { success: true, depositId: 'dep-' + Date.now(), projectId, amount };
    },
  },
};

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const startTime = Date.now();

  // Stream AI and tool results
  const aiStream = streamText({
    model: openai('gpt-4o'),
    prompt: convertToModelMessages(messages),
    tools,
    // Remove experimental_prepareStep for now (not in ToolSet signature)
  });

  // Stream the AI/tool response and custom sources if needed
  const stream = createUIMessageStream({
    async execute({ writer }) {
      for await (const part of aiStream) {
        writer.write(part);
      }
      // Example: Stream a custom citation/source after the AI response
      writer.write({
        type: 'source-url',
        sourceId: 'freeflowzee-ai-tools',
        url: 'https://freeflowzee.com/docs/ai-tools',
        title: 'FreeflowZee AI Tools Documentation',
      });
      writer.close();
    },
  });

  return new Response(stream);
} 