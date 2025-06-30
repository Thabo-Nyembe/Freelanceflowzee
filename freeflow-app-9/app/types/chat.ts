import { z } from 'zod';

// Metadata schema for chat responses
export const exampleMetadataSchema = z.object({
  duration: z.number().optional(),
  model: z.string().optional(),
  totalTokens: z.number().optional(),
});

export type ExampleMetadata = z.infer<typeof exampleMetadataSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  metadata: exampleMetadataSchema.optional(),
});

export type Message = z.infer<typeof messageSchema>;

// Chat response schema
export const chatResponseSchema = z.object({
  messages: z.array(messageSchema),
  metadata: exampleMetadataSchema.optional(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>; 