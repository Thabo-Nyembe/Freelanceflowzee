/**
 * @file route.ts
 * @description Comprehensive API endpoints for multi-modal AI operations
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { authenticateRequest } from '@/lib/auth';
import { MultiModalAISystem, MultiModalOperationType, MultiModalProvider, MultiModalContentType } from '@/lib/ai/multi-modal-ai-system';
import { IntegratedAISystem } from '@/lib/ai/integrated-ai-system';
import { createHash, randomBytes } from 'crypto';
import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-MultiModal')

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Initialize Multi-modal AI System
const multiModalSystem = MultiModalAISystem.getInstance();
const integratedAISystem = IntegratedAISystem.getInstance();

// Initialize WebSocket server (for serverless environments, this would be handled differently)
let wsServer: WebSocketServer | null = null;
const wsClients = new Map();
const wsAuthTokens = new Map();

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

// Request validation schemas
const imageGenerationSchema = z.object({
  prompt: z.string().min(1).max(4000),
  negativePrompt: z.string().optional(),
  width: z.number().int().min(64).max(4096).optional(),
  height: z.number().int().min(64).max(4096).optional(),
  numOutputs: z.number().int().min(1).max(10).optional(),
  style: z.string().optional(),
  quality: z.enum(['standard', 'hd']).optional(),
  seed: z.number().int().optional(),
  guidanceScale: z.number().min(1).max(20).optional(),
  steps: z.number().int().min(10).max(150).optional(),
  modelVersion: z.string().optional(),
  safetyFilter: z.boolean().optional(),
  enhancePrompt: z.boolean().optional(),
  provider: z.enum([
    MultiModalProvider.DALLE, 
    MultiModalProvider.MIDJOURNEY, 
    MultiModalProvider.STABLE_DIFFUSION,
    MultiModalProvider.AUTO
  ]).optional(),
});

const voiceSynthesisSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z.string().optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
  pitch: z.number().min(-20).max(20).optional(),
  stability: z.number().min(0).max(1).optional(),
  similarityBoost: z.number().min(0).max(1).optional(),
  style: z.string().optional(),
  emotion: z.string().optional(),
  format: z.enum(['mp3', 'wav', 'ogg']).optional(),
  quality: z.enum(['standard', 'high']).optional(),
  speakerId: z.string().optional(),
  language: z.string().optional(),
  preserveOriginalTiming: z.boolean().optional(),
  provider: z.enum([
    MultiModalProvider.ELEVENLABS, 
    MultiModalProvider.OPENAI_TTS, 
    MultiModalProvider.GOOGLE_TTS,
    MultiModalProvider.AMAZON_POLLY,
    MultiModalProvider.AUTO
  ]).optional(),
});

const embeddingSchema = z.object({
  content: z.any(),
  contentType: z.nativeEnum(MultiModalContentType),
  dimensions: z.number().int().min(64).max(4096).optional(),
  model: z.string().optional(),
  normalize: z.boolean().optional(),
  truncate: z.boolean().optional(),
  batchSize: z.number().int().min(1).max(100).optional(),
  provider: z.enum([
    MultiModalProvider.OPENAI_EMBEDDINGS,
    MultiModalProvider.COHERE,
    MultiModalProvider.HUGGINGFACE,
    MultiModalProvider.AUTO
  ]).optional(),
});

const semanticSearchSchema = z.object({
  query: z.any(),
  queryType: z.nativeEnum(MultiModalContentType),
  collection: z.string(),
  limit: z.number().int().min(1).max(100).optional(),
  filters: z.record(z.any()).optional(),
  minScore: z.number().min(0).max(1).optional(),
  includeMetadata: z.boolean().optional(),
  includeVectors: z.boolean().optional(),
  provider: z.enum([
    MultiModalProvider.PINECONE,
    MultiModalProvider.WEAVIATE,
    MultiModalProvider.AUTO
  ]).optional(),
});

const contentSimilaritySchema = z.object({
  sourceContent: z.any(),
  sourceType: z.nativeEnum(MultiModalContentType),
  targetContent: z.any(),
  targetType: z.nativeEnum(MultiModalContentType),
  metric: z.enum(['cosine', 'euclidean', 'dot']).optional(),
  threshold: z.number().min(0).max(1).optional(),
  provider: z.enum([
    MultiModalProvider.OPENAI_EMBEDDINGS,
    MultiModalProvider.COHERE,
    MultiModalProvider.AUTO
  ]).optional(),
});

const autoGenerationSchema = z.object({
  input: z.any(),
  inputType: z.nativeEnum(MultiModalContentType),
  outputType: z.nativeEnum(MultiModalContentType),
  steps: z.array(z.string()).optional(),
  parameters: z.record(z.any()).optional(),
  intermediateResults: z.boolean().optional(),
  provider: z.enum([
    MultiModalProvider.OPENAI_GPT4V,
    MultiModalProvider.ANTHROPIC_CLAUDE,
    MultiModalProvider.GOOGLE_GEMINI,
    MultiModalProvider.AUTO
  ]).optional(),
});

const multiModalUnderstandingSchema = z.object({
  contents: z.array(z.object({
    content: z.any(),
    contentType: z.nativeEnum(MultiModalContentType),
  })),
  task: z.string(),
  detailLevel: z.enum(['basic', 'detailed', 'comprehensive']).optional(),
  outputFormat: z.enum(['text', 'json', 'markdown']).optional(),
  provider: z.enum([
    MultiModalProvider.OPENAI_GPT4V,
    MultiModalProvider.ANTHROPIC_CLAUDE,
    MultiModalProvider.GOOGLE_GEMINI,
    MultiModalProvider.AUTO
  ]).optional(),
});

const assetLibrarySchema = z.object({
  operation: z.enum(['index', 'search', 'tag', 'organize']),
  assets: z.array(z.object({
    id: z.string().optional(),
    content: z.any(),
    contentType: z.nativeEnum(MultiModalContentType),
    metadata: z.record(z.any()).optional(),
  })).optional(),
  query: z.any().optional(),
  queryType: z.nativeEnum(MultiModalContentType).optional(),
  filters: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  provider: z.enum([
    MultiModalProvider.OPENAI_GPT4V,
    MultiModalProvider.ANTHROPIC_CLAUDE,
    MultiModalProvider.AUTO
  ]).optional(),
});

const collaborationSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  operation: z.enum(['join', 'update', 'leave']),
  content: z.any().optional(),
  contentType: z.nativeEnum(MultiModalContentType).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  viewportState: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
});

// Helper functions
function generateWebSocketToken(userId: string): string {
  const token = randomBytes(32).toString('hex');
  wsAuthTokens.set(token, {
    userId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  return token;
}

function validateWebSocketToken(token: string): { valid: boolean; userId?: string } {
  const authInfo = wsAuthTokens.get(token);
  if (!authInfo) {
    return { valid: false };
  }
  
  if (authInfo.expiresAt < Date.now()) {
    wsAuthTokens.delete(token);
    return { valid: false };
  }
  
  return { valid: true, userId: authInfo.userId };
}

function generateSignature(timestamp: string, payload: string, secret: string): string {
  return createHash('sha256')
    .update(`${timestamp}.${payload}.${secret}`)
    .digest('hex');
}

async function validateRequest(req: NextRequest, schema: z.ZodSchema): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return {
        valid: false,
        error: JSON.stringify(result.error.format()),
      };
    }
    
    return {
      valid: true,
      data: result.data,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON payload',
    };
  }
}

function handleError(error: any): NextResponse {
  logger.error('Multi-modal API error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    code: error.code || 'unknown_error',
    status: error.status || 500
  });

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorCode = error.code || 'unknown_error';

  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    },
    { status: error.status || 500 }
  );
}

// Initialize WebSocket server for real-time updates
function initWebSocketServer(server: Server) {
  if (wsServer) return;
  
  wsServer = new WebSocketServer({ server, path: '/api/ai/multi-modal/websocket' });
  
  wsServer.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const userId = url.searchParams.get('userId');
    
    // Authenticate connection
    let authenticated = false;
    let authUserId = '';
    
    if (token) {
      const validation = validateWebSocketToken(token);
      if (validation.valid && validation.userId) {
        authenticated = true;
        authUserId = validation.userId;
        wsClients.set(authUserId, ws);
      }
    } else if (userId) {
      // Simple authentication for development/testing
      authenticated = true;
      authUserId = userId;
      wsClients.set(authUserId, ws);
    }
    
    if (!authenticated) {
      ws.close(1008, 'Authentication failed');
      return;
    }
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      payload: {
        userId: authUserId,
        timestamp: new Date().toISOString(),
      },
    }));
    
    // Handle messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Process message based on type
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({
              type: 'pong',
              payload: {
                timestamp: new Date().toISOString(),
              },
            }));
            break;
            
          case 'collaboration_update':
            // Broadcast to all clients in the same session
            if (data.payload?.sessionId) {
              wsClients.forEach((client, clientId) => {
                if (clientId !== authUserId && client.readyState === 1) {
                  client.send(JSON.stringify({
                    type: 'collaboration_update',
                    payload: {
                      ...data.payload,
                      sourceUserId: authUserId,
                    },
                  }));
                }
              });
            }
            break;
            
          default:
            // Unknown message type
            break;
        }
      } catch (error) {
        logger.error('WebSocket message error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          userId: authUserId
        });
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      wsClients.delete(authUserId);
    });
  });
}

// API Routes

/**
 * GET handler for WebSocket authentication token
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if this is a WebSocket token request
    const url = new URL(req.url);
    const path = url.pathname;
    
    if (path.endsWith('/websocket-token')) {
      // Generate WebSocket token
      const token = generateWebSocketToken(auth.user.id);
      
      return NextResponse.json({
        success: true,
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    
    // Get operation status if requestId is provided
    const requestId = url.searchParams.get('requestId');
    if (requestId) {
      const status = multiModalSystem.getOperationStatus(requestId);
      const result = multiModalSystem.getOperationResult(requestId);
      
      return NextResponse.json({
        success: true,
        requestId,
        status,
        result: result || undefined,
      });
    }
    
    // Get asset if assetId is provided
    const assetId = url.searchParams.get('assetId');
    if (assetId) {
      const asset = multiModalSystem.getAsset(assetId);
      
      if (!asset) {
        return NextResponse.json(
          { success: false, error: 'Asset not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        asset,
      });
    }
    
    // Search assets
    const query = url.searchParams.get('query') || '';
    const contentTypes = url.searchParams.get('contentTypes')?.split(',') as MultiModalContentType[] | undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined;
    
    const assets = multiModalSystem.searchAssets(query, {
      contentTypes,
      limit,
      offset,
    });
    
    return NextResponse.json({
      success: true,
      assets,
      total: assets.length,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST handler for multi-modal operations
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Apply rate limiting
    const ip = headers().get('x-forwarded-for') || 'localhost';
    try {
      await limiter.check(10, ip); // 10 requests per minute per IP
    } catch {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Initialize Multi-modal AI System if not already initialized
    if (!multiModalSystem['isInitialized']) {
      await multiModalSystem.initialize({
        userOptions: {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        },
      });
    }
    
    // Get operation type from URL path
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop() || '';
    
    // Process based on operation type
    switch (path) {
      case 'generate-image': {
        const validation = await validateRequest(req, imageGenerationSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.generateImage(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'image-variations': {
        const body = await req.json();
        const imageData = body.imageData;
        if (!imageData) {
          return NextResponse.json(
            { success: false, error: 'Image data is required' },
            { status: 400 }
          );
        }
        
        delete body.imageData;
        const validation = await validateRequest(
          new NextRequest(req.url, { method: 'POST', body: JSON.stringify(body) }),
          imageGenerationSchema
        );
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.createImageVariations(imageData, validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'edit-image': {
        const body = await req.json();
        const imageData = body.imageData;
        const maskData = body.maskData;
        if (!imageData || !maskData) {
          return NextResponse.json(
            { success: false, error: 'Image data and mask data are required' },
            { status: 400 }
          );
        }
        
        delete body.imageData;
        delete body.maskData;
        const validation = await validateRequest(
          new NextRequest(req.url, { method: 'POST', body: JSON.stringify(body) }),
          imageGenerationSchema
        );
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.editImage(imageData, maskData, validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'upscale-image': {
        const body = await req.json();
        const imageData = body.imageData;
        const scale = body.scale || 2;
        if (!imageData) {
          return NextResponse.json(
            { success: false, error: 'Image data is required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.upscaleImage(imageData, scale, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'style-transfer': {
        const body = await req.json();
        const imageData = body.imageData;
        const styleData = body.styleData;
        const strength = body.strength || 0.8;
        if (!imageData || !styleData) {
          return NextResponse.json(
            { success: false, error: 'Image data and style data are required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.applyStyleTransfer(imageData, styleData, { strength }, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'text-to-speech': {
        const validation = await validateRequest(req, voiceSynthesisSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.textToSpeech(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'clone-voice': {
        const body = await req.json();
        const audioSamples = body.audioSamples;
        const name = body.name;
        const description = body.description;
        
        if (!audioSamples || !Array.isArray(audioSamples) || audioSamples.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Audio samples are required' },
            { status: 400 }
          );
        }
        
        if (!name) {
          return NextResponse.json(
            { success: false, error: 'Voice name is required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.cloneVoice(audioSamples, { name, description }, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'create-embeddings': {
        const validation = await validateRequest(req, embeddingSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.createEmbeddings(
          validation.data.content,
          validation.data.contentType,
          validation.data,
          {
            userId: auth.user.id,
            organizationId: auth.user.organizationId,
          }
        );
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'semantic-search': {
        const validation = await validateRequest(req, semanticSearchSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.semanticSearch(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'content-similarity': {
        const validation = await validateRequest(req, contentSimilaritySchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.contentSimilarity(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'execute-workflow': {
        const validation = await validateRequest(req, autoGenerationSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.executeWorkflow(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'process-multimodal': {
        const validation = await validateRequest(req, multiModalUnderstandingSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.processMultiModalContent(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'generate-multimodal': {
        const body = await req.json();
        const prompt = body.prompt;
        const outputTypes = body.outputTypes;
        
        if (!prompt || !outputTypes || !Array.isArray(outputTypes)) {
          return NextResponse.json(
            { success: false, error: 'Prompt and output types are required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.generateMultiModalContent(
          prompt,
          outputTypes,
          {
            maxOutputs: body.maxOutputs,
            temperature: body.temperature,
            style: body.style,
            quality: body.quality,
          },
          {
            userId: auth.user.id,
            organizationId: auth.user.organizationId,
          }
        );
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'translate-modalities': {
        const body = await req.json();
        const content = body.content;
        const contentType = body.contentType;
        const targetType = body.targetType;
        
        if (!content || !contentType || !targetType) {
          return NextResponse.json(
            { success: false, error: 'Content, content type, and target type are required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.translateAcrossModalities(
          content,
          contentType,
          targetType,
          {
            quality: body.quality,
            preserveStyle: body.preserveStyle,
            preserveContext: body.preserveContext,
          },
          {
            userId: auth.user.id,
            organizationId: auth.user.organizationId,
          }
        );
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'get-recommendations': {
        const body = await req.json();
        const content = body.content;
        const contentType = body.contentType;
        
        if (!content || !contentType) {
          return NextResponse.json(
            { success: false, error: 'Content and content type are required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.getRecommendations(
          content,
          contentType,
          {
            limit: body.limit,
            filters: body.filters,
            diversity: body.diversity,
            categories: body.categories,
          },
          {
            userId: auth.user.id,
            organizationId: auth.user.organizationId,
          }
        );
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'discover-content': {
        const body = await req.json();
        const query = body.query;
        const queryType = body.queryType;
        
        if (!query || !queryType) {
          return NextResponse.json(
            { success: false, error: 'Query and query type are required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.discoverContent(
          query,
          queryType,
          {
            limit: body.limit,
            filters: body.filters,
            contentTypes: body.contentTypes,
          },
          {
            userId: auth.user.id,
            organizationId: auth.user.organizationId,
          }
        );
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'match-assets': {
        const body = await req.json();
        const criteria = body.criteria;
        
        if (!criteria) {
          return NextResponse.json(
            { success: false, error: 'Matching criteria are required' },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.matchAssets(
          criteria,
          {
            contentTypes: body.contentTypes,
            limit: body.limit,
            threshold: body.threshold,
            categories: body.categories,
          },
          {
            userId: auth.user.id,
            organizationId: auth.user.organizationId,
          }
        );
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'manage-assets': {
        const validation = await validateRequest(req, assetLibrarySchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        const result = await multiModalSystem.manageAssetLibrary(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'collaboration': {
        const validation = await validateRequest(req, collaborationSchema);
        if (!validation.valid) {
          return NextResponse.json(
            { success: false, error: validation.error },
            { status: 400 }
          );
        }
        
        // Override userId with authenticated user ID for security
        validation.data.userId = auth.user.id;
        
        const result = await multiModalSystem.manageCollaboration(validation.data, {
          userId: auth.user.id,
          organizationId: auth.user.organizationId,
        });
        
        // Broadcast to WebSocket clients if applicable
        if (validation.data.operation !== 'leave' && wsClients.size > 0) {
          const sessionId = validation.data.sessionId;
          wsClients.forEach((client, clientId) => {
            if (clientId !== auth.user.id && client.readyState === 1) {
              client.send(JSON.stringify({
                type: 'collaboration_update',
                payload: {
                  ...validation.data,
                  sourceUserId: auth.user.id,
                },
              }));
            }
          });
        }
        
        return NextResponse.json({
          success: true,
          requestId: result.requestId,
          result,
        });
      }
      
      case 'cancel-operation': {
        const body = await req.json();
        const requestId = body.requestId;
        
        if (!requestId) {
          return NextResponse.json(
            { success: false, error: 'Request ID is required' },
            { status: 400 }
          );
        }
        
        const cancelled = await multiModalSystem.cancelOperation(requestId);
        
        return NextResponse.json({
          success: true,
          cancelled,
        });
      }
      
      case 'metrics': {
        // Check if user has admin privileges
        if (!auth.user.isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Admin privileges required' },
            { status: 403 }
          );
        }
        
        const body = await req.json();
        const operationType = body.operationType;
        const contentType = body.contentType;
        const provider = body.provider;
        const timeRange = body.timeRange ? {
          start: new Date(body.timeRange.start),
          end: new Date(body.timeRange.end),
        } : undefined;
        
        const metrics = multiModalSystem.getPerformanceMetrics({
          operationType,
          contentType,
          provider,
          timeRange,
        });
        
        const aggregated = multiModalSystem.getAggregatedMetrics({
          operationType,
          contentType,
          provider,
          timeRange,
        });
        
        return NextResponse.json({
          success: true,
          metrics,
          aggregated,
        });
      }
      
      case 'cost-breakdown': {
        // Check if user has admin privileges
        if (!auth.user.isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Admin privileges required' },
            { status: 403 }
          );
        }
        
        const body = await req.json();
        const userId = body.userId;
        const projectId = body.projectId;
        const timeRange = body.timeRange ? {
          start: new Date(body.timeRange.start),
          end: new Date(body.timeRange.end),
        } : undefined;
        
        const byOperationType = multiModalSystem.getCostBreakdown({
          userId,
          projectId,
          timeRange,
        });
        
        const byProvider = multiModalSystem.getCostBreakdownByProvider({
          userId,
          projectId,
          timeRange,
        });
        
        return NextResponse.json({
          success: true,
          byOperationType,
          byProvider,
        });
      }
      
      case 'cache-stats': {
        // Check if user has admin privileges
        if (!auth.user.isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Admin privileges required' },
            { status: 403 }
          );
        }
        
        const stats = multiModalSystem.getCacheStats();
        
        return NextResponse.json({
          success: true,
          stats,
        });
      }
      
      case 'clear-cache': {
        // Check if user has admin privileges
        if (!auth.user.isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Admin privileges required' },
            { status: 403 }
          );
        }
        
        const body = await req.json();
        multiModalSystem.clearCache({
          operationType: body.operationType,
          contentType: body.contentType,
          userId: body.userId,
          projectId: body.projectId,
        });
        
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
        });
      }
      
      case 'operation-history': {
        const body = await req.json();
        const isAdmin = auth.user.isAdmin;
        
        // Non-admins can only see their own operations
        const userId = isAdmin ? body.userId : auth.user.id;
        const projectId = isAdmin ? body.projectId : auth.user.projectId;
        
        const operations = multiModalSystem.exportOperationHistory({
          operationType: body.operationType,
          contentType: body.contentType,
          userId,
          projectId,
          timeRange: body.timeRange ? {
            start: new Date(body.timeRange.start),
            end: new Date(body.timeRange.end),
          } : undefined,
          status: body.status,
          limit: body.limit || 100,
        });
        
        return NextResponse.json({
          success: true,
          operations,
          total: operations.length,
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown operation type' },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT handler for asset updates
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get asset ID from URL
    const url = new URL(req.url);
    const assetId = url.searchParams.get('assetId');
    
    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }
    
    // Get asset update data
    const body = await req.json();
    
    // Ensure asset ID is included
    body.id = assetId;
    
    // Update asset
    const updatedAsset = await multiModalSystem.addOrUpdateAsset(body);
    
    return NextResponse.json({
      success: true,
      asset: updatedAsset,
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE handler for asset deletion
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get asset ID from URL
    const url = new URL(req.url);
    const assetId = url.searchParams.get('assetId');
    
    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }
    
    // Delete asset
    const deleted = await multiModalSystem.deleteAsset(assetId);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}

// Initialize WebSocket server if in Node.js environment
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // For development environment only
  try {
    const { createServer } = require('http');
    const server = createServer();
    initWebSocketServer(server);
    server.listen(3001, () => {
      logger.info('WebSocket server started', { port: 3001, environment: 'development' });
    });
  } catch (error) {
    logger.error('Failed to initialize WebSocket server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
