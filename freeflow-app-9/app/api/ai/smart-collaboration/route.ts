import { NextRequest, NextResponse } from 'next/server';
import { createSimpleLogger } from '@/lib/simple-logger'
import { SmartCollaborationAI } from '@/lib/ai/smart-collaboration-ai';
import { WebSocketServer } from '@/lib/websocket-server';
import { rateLimit } from '@/lib/rate-limit';
import { verifyAuthToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { logApiUsage, trackCost } from '@/lib/analytics';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

// Inline type definitions
type SmartCollaborationFeatureType = 'suggestions' | 'workload' | 'scheduling' | 'matching';
type CollaborationContextType = 'project' | 'team' | 'task' | 'document';
type DocumentType = 'contract' | 'proposal' | 'report' | 'policy' | 'invoice' | 'presentation';

const logger = createSimpleLogger('API-SmartCollaboration')

// Environment configuration
const API_SECRET_KEY = process.env.API_SECRET_KEY || '';
const MAX_REQUESTS_PER_MINUTE = 60;
const MAX_DOCUMENT_SIZE_MB = 50;

// Initialize WebSocket server
const wsServer = WebSocketServer.getInstance();

// Initialize Smart Collaboration AI
let smartCollabAI: SmartCollaborationAI;

// Initialize AI on first request
const initializeAI = async () => {
  if (!smartCollabAI) {
    smartCollabAI = SmartCollaborationAI.getInstance();
    await smartCollabAI.initialize();
  }
  return smartCollabAI;
};

// Middleware for authentication and rate limiting
const applyMiddleware = async (req: NextRequest) => {
  // Validate token
  const authResult = await verifyAuthToken(req);
  if (!authResult) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Apply rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await rateLimit(`smart-collab-${ip}`, MAX_REQUESTS_PER_MINUTE);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
    );
  }

  // Log API usage
  await logApiUsage({
    endpoint: req.nextUrl.pathname,
    method: req.method,
    userId: authResult.id,
    timestamp: new Date(),
    ip
  });

  return null; // No error, continue processing
};

// Error handling wrapper
const errorHandler = async (fn: (req: NextRequest) => Promise<Response>, req: NextRequest) => {
  try {
    return await fn(req);
  } catch (error) {
    logger.error('API Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      endpoint: req.nextUrl.pathname
    });

    // Determine appropriate status code
    let status = 500;
    if (error.message?.includes('not found')) status = 404;
    if (error.message?.includes('unauthorized')) status = 401;
    if (error.message?.includes('invalid')) status = 400;
    if (error.message?.includes('limit exceeded')) status = 429;
    
    return NextResponse.json(
      { 
        error: error.name || 'Error', 
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status }
    );
  }
};

// Helper to parse multipart form data for file uploads
async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('file') as File[];
  const metadata = formData.get('metadata');
  
  let metadataObj = {};
  if (metadata && typeof metadata === 'string') {
    try {
      metadataObj = JSON.parse(metadata);
    } catch (error) {
      throw new Error('Invalid metadata format');
    }
  }
  
  return { files, metadata: metadataObj };
}

// Helper to validate document size
function validateDocumentSize(file: File) {
  const maxSizeBytes = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_DOCUMENT_SIZE_MB}MB`);
  }
}

// Helper to determine document type
function determineDocumentType(file: File): DocumentType {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  if (mimeType.includes('pdf')) return DocumentType.PDF;
  if (mimeType.includes('image')) return DocumentType.IMAGE;
  if (mimeType.includes('video')) return DocumentType.VIDEO;
  if (mimeType.includes('audio')) return DocumentType.AUDIO;
  if (mimeType.includes('text/plain')) return DocumentType.TEXT;
  if (mimeType.includes('text/html')) return DocumentType.TEXT;
  if (mimeType.includes('application/json')) return DocumentType.TEXT;
  if (mimeType.includes('application/javascript')) return DocumentType.CODE;
  if (mimeType.includes('text/css')) return DocumentType.CODE;
  
  if (fileName.endsWith('.psd')) return DocumentType.ADOBE_PSD;
  if (fileName.endsWith('.ai')) return DocumentType.ADOBE_AI;
  if (fileName.endsWith('.xd')) return DocumentType.ADOBE_XD;
  if (fileName.endsWith('.fig')) return DocumentType.FIGMA;
  
  // Default to text
  return DocumentType.TEXT;
}

// Helper to create standardized API responses
function createApiResponse(data: any, metadata: any = {}, status: number = 200) {
  const responseMetadata = {
    timestamp: new Date().toISOString(),
    processingTime: metadata.processingTime || 0,
    ...metadata
  };
  
  return NextResponse.json({
    success: status >= 200 && status < 300,
    data,
    metadata: responseMetadata
  }, { status });
}

// WebSocket connection handler
export async function GET(req: NextRequest) {
  return errorHandler(async () => {
    // Check if this is a WebSocket upgrade request
    const upgradeHeader = req.headers.get('upgrade');
    if (upgradeHeader !== 'websocket') {
      return NextResponse.json({ error: 'Expected WebSocket connection' }, { status: 400 });
    }
    
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize AI
    await initializeAI();
    
    // Handle WebSocket upgrade
    const response = await wsServer.handleUpgrade(req, 'smart-collaboration');
    
    // Return response (this will be handled by the WebSocket server)
    return response;
  }, req);
}

// Document processing endpoint
export async function POST(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize AI
    const ai = await initializeAI();
    
    // Get path segments to determine the action
    const pathname = req.nextUrl.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const action = segments[segments.length - 1];
    
    // Route to the appropriate handler based on the action
    switch (action) {
      case 'documents':
        return handleDocumentProcessing(req, ai);
      case 'suggestions':
        return handleAISuggestions(req, ai);
      case 'start':
        return handleMeetingStart(req, ai);
      case 'end':
        return handleMeetingEnd(req, ai);
      case 'team':
        return handleTeamAnalytics(req, ai);
      default:
        // If no specific action, handle based on the request body
        const contentType = req.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
          return handleDocumentProcessing(req, ai);
        } else {
          const body = await req.json();
          const requestType = body.type || 'unknown';
          
          switch (requestType) {
            case 'document':
              return handleDocumentProcessing(req, ai);
            case 'meeting':
              return body.action === 'start' ? 
                handleMeetingStart(req, ai) : 
                handleMeetingEnd(req, ai);
            case 'suggestion':
              return handleAISuggestions(req, ai);
            case 'analytics':
              return handleTeamAnalytics(req, ai);
            default:
              return NextResponse.json(
                { error: 'Invalid request type', message: 'Unknown action requested' },
                { status: 400 }
              );
          }
        }
    }
  }, req);
}

// Document processing handler
async function handleDocumentProcessing(req: NextRequest, ai: SmartCollaborationAI) {
  const startTime = Date.now();
  
  // Check content type to determine how to parse the request
  const contentType = req.headers.get('content-type') || '';
  
  let documentId: string;
  let documentType: DocumentType;
  let content: string | Blob;
  let options: any = {};
  
  if (contentType.includes('multipart/form-data')) {
    // Handle file upload
    const { files, metadata } = await parseFormData(req);
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No file provided' },
        { status: 400 }
      );
    }
    
    const file = files[0];
    validateDocumentSize(file);
    
    documentId = (metadata as Record<string, unknown>).documentId || `doc-${Date.now()}`;
    documentType = determineDocumentType(file);
    content = file;
    options = (metadata as Record<string, unknown>).options || {};
  } else {
    // Handle JSON request
    const body = await req.json();
    
    // Validate required fields
    if (!body.documentId || !body.content) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: documentId, content' },
        { status: 400 }
      );
    }
    
    documentId = sanitizeInput(body.documentId);
    documentType = body.documentType ? 
      (DocumentType as Record<string, unknown>)[body.documentType] || DocumentType.TEXT : 
      DocumentType.TEXT;
    content = body.content;
    options = body.options || {};
  }
  
  // Process document with AI
  const analysis = await ai.processDocument(
    documentId,
    documentType,
    content,
    options
  );
  
  // Track cost
  await trackCost({
    feature: SmartCollaborationFeatureType.DOCUMENT_PROCESSING,
    tokensUsed: analysis.wordCount * 1.5, // Estimate
    cost: analysis.wordCount * 0.000015, // Estimate
    userId: req.headers.get('x-user-id') || 'unknown'
  });
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Store result in Supabase for persistence
  await supabase
    .from('document_analyses')
    .upsert({
      id: analysis.id,
      document_id: documentId,
      document_type: documentType,
      summary: analysis.summary,
      key_insights: analysis.keyInsights,
      action_items: analysis.actionItems,
      tags: analysis.tags,
      entities: analysis.entities,
      sentiment: analysis.sentiment,
      readability_score: analysis.readabilityScore,
      word_count: analysis.wordCount,
      processing_time: processingTime,
      created_at: new Date(),
      updated_at: new Date()
    });
  
  // Return response
  return createApiResponse(analysis, {
    processingTime,
    documentId,
    documentType,
    wordCount: analysis.wordCount
  });
}

// AI Suggestions handler
async function handleAISuggestions(req: NextRequest, ai: SmartCollaborationAI) {
  const startTime = Date.now();
  
  // Parse request body
  const body = await req.json();
  
  // Validate required fields
  if (!body.contextType || !body.contextId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required fields: contextType, contextId' },
      { status: 400 }
    );
  }
  
  // Sanitize inputs
  const contextType = (CollaborationContextType as Record<string, unknown>)[body.contextType] || CollaborationContextType.PROJECT;
  const contextId = sanitizeInput(body.contextId);
  const options = body.options || {};
  
  // Get suggestions from AI
  const suggestions = await ai.getAICopilotSuggestions(
    contextType,
    contextId,
    options
  );
  
  // Track cost
  await trackCost({
    feature: SmartCollaborationFeatureType.AI_COPILOT,
    tokensUsed: 1000, // Estimate
    cost: 0.02, // Estimate
    userId: req.headers.get('x-user-id') || 'unknown'
  });
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Return response
  return createApiResponse(suggestions, {
    processingTime,
    contextType,
    contextId,
    suggestionCount: suggestions.length
  });
}

// Meeting Start handler
async function handleMeetingStart(req: NextRequest, ai: SmartCollaborationAI) {
  const startTime = Date.now();
  
  // Parse request body
  const body = await req.json();
  
  // Validate required fields
  if (!body.meetingId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required field: meetingId' },
      { status: 400 }
    );
  }
  
  // Sanitize inputs
  const meetingId = sanitizeInput(body.meetingId);
  const options = body.options || {};
  
  // Create session ID
  const sessionId = `session-${Date.now()}`;
  
  // Start meeting analysis
  const observable = ai.startMeetingAnalysis(meetingId, {
    participants: options.participants || [],
    language: options.language || 'en',
    generateSummary: options.generateSummary !== false,
    extractActionItems: options.extractActionItems !== false,
    realTimeTranscription: options.realTimeTranscription !== false
  });
  
  // Set up WebSocket connection for this meeting
  wsServer.registerSession(sessionId, meetingId, observable);
  
  // Track cost (initial)
  await trackCost({
    feature: SmartCollaborationFeatureType.REAL_TIME_FEATURES,
    tokensUsed: 500, // Initial estimate
    cost: 0.01, // Initial estimate
    userId: req.headers.get('x-user-id') || 'unknown'
  });
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Store meeting session in Supabase
  await supabase
    .from('meeting_sessions')
    .insert({
      id: sessionId,
      meeting_id: meetingId,
      status: 'active',
      start_time: new Date(),
      options: options,
      created_at: new Date()
    });
  
  // Return response
  return createApiResponse({
    sessionId,
    meetingId,
    status: 'active',
    wsEndpoint: `/api/ai/smart-collaboration/ws?session=${sessionId}`
  }, {
    processingTime
  });
}

// Meeting End handler
async function handleMeetingEnd(req: NextRequest, ai: SmartCollaborationAI) {
  const startTime = Date.now();
  
  // Parse request body
  const body = await req.json();
  
  // Validate required fields
  if (!body.meetingId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required field: meetingId' },
      { status: 400 }
    );
  }
  
  // Sanitize inputs
  const meetingId = sanitizeInput(body.meetingId);
  
  // End meeting analysis
  const analysis = await ai.endMeetingAnalysis(meetingId);
  
  if (!analysis) {
    return NextResponse.json(
      { error: 'Not Found', message: 'No active meeting session found for the provided meetingId' },
      { status: 404 }
    );
  }
  
  // Track cost
  await trackCost({
    feature: SmartCollaborationFeatureType.REAL_TIME_FEATURES,
    tokensUsed: 2000, // Estimate
    cost: 0.04, // Estimate
    userId: req.headers.get('x-user-id') || 'unknown'
  });
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Update meeting session in Supabase
  await supabase
    .from('meeting_sessions')
    .update({
      status: 'completed',
      end_time: new Date(),
      duration: analysis.duration,
      updated_at: new Date()
    })
    .eq('meeting_id', meetingId)
    .eq('status', 'active');
  
  // Store meeting analysis in Supabase
  await supabase
    .from('meeting_analyses')
    .insert({
      id: analysis.id,
      meeting_id: meetingId,
      summary: analysis.summary,
      key_points: analysis.keyPoints,
      action_items: analysis.actionItems,
      participant_stats: analysis.participantStats,
      topics: analysis.topics,
      decisions: analysis.decisions,
      follow_up_tasks: analysis.followUpTasks,
      duration: analysis.duration,
      created_at: new Date()
    });
  
  // Return response
  return createApiResponse(analysis, {
    processingTime,
    meetingId,
    duration: analysis.duration
  });
}

// Team Analytics handler
async function handleTeamAnalytics(req: NextRequest, ai: SmartCollaborationAI) {
  const startTime = Date.now();
  
  // Parse URL parameters
  const { searchParams } = req.nextUrl;
  const teamId = searchParams.get('teamId');
  const periodStart = searchParams.get('periodStart');
  const periodEnd = searchParams.get('periodEnd');
  
  // Validate required parameters
  if (!teamId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required parameter: teamId' },
      { status: 400 }
    );
  }
  
  // Sanitize inputs
  const sanitizedTeamId = sanitizeInput(teamId);
  
  // Set default period if not provided (last 30 days)
  const start = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = periodEnd ? new Date(periodEnd) : new Date();
  
  // Analyze team performance
  const metrics = await ai.analyzeTeamPerformance(sanitizedTeamId, { start, end });
  
  // Track cost
  await trackCost({
    feature: SmartCollaborationFeatureType.COLLABORATION_INTELLIGENCE,
    tokensUsed: 1500, // Estimate
    cost: 0.03, // Estimate
    userId: req.headers.get('x-user-id') || 'unknown'
  });
  
  // Calculate processing time
  const processingTime = Date.now() - startTime;
  
  // Store analytics result in Supabase
  await supabase
    .from('team_performance_metrics')
    .insert({
      team_id: sanitizedTeamId,
      period_start: start,
      period_end: end,
      productivity: metrics.productivity,
      collaboration: metrics.collaboration,
      workload: metrics.workload,
      sentiment: metrics.sentiment,
      created_at: new Date()
    });
  
  // Return response
  return createApiResponse(metrics, {
    processingTime,
    teamId: sanitizedTeamId,
    period: { start, end }
  });
}

// Workflow recommendations endpoint
export async function PUT(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize AI
    const ai = await initializeAI();
    
    const startTime = Date.now();
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.projectId || !body.teamId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: projectId, teamId' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const projectId = sanitizeInput(body.projectId);
    const teamId = sanitizeInput(body.teamId);
    
    // Generate workflow recommendations
    const recommendations = await ai.generateWorkflowRecommendations(projectId, teamId);
    
    // Track cost
    await trackCost({
      feature: SmartCollaborationFeatureType.AI_COPILOT,
      tokensUsed: 1500, // Estimate
      cost: 0.03, // Estimate
      userId: req.headers.get('x-user-id') || 'unknown'
    });
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Return response
    return createApiResponse(recommendations, {
      processingTime,
      projectId,
      teamId,
      recommendationCount: recommendations.length
    });
  }, req);
}

// Resource allocation optimization endpoint
export async function PATCH(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Initialize AI
    const ai = await initializeAI();
    
    const startTime = Date.now();
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.projectId || !body.teamId || !body.tasks) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields: projectId, teamId, tasks' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const projectId = sanitizeInput(body.projectId);
    const teamId = sanitizeInput(body.teamId);
    const tasks = body.tasks;
    
    // Optimize resource allocation
    const suggestions = await ai.optimizeResourceAllocation(projectId, teamId, tasks);
    
    // Track cost
    await trackCost({
      feature: SmartCollaborationFeatureType.COLLABORATION_INTELLIGENCE,
      tokensUsed: 1800, // Estimate
      cost: 0.035, // Estimate
      userId: req.headers.get('x-user-id') || 'unknown'
    });
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Return response
    return createApiResponse(suggestions, {
      processingTime,
      projectId,
      teamId,
      suggestionCount: suggestions.length
    });
  }, req);
}

// Delete endpoint for cleaning up resources
export async function DELETE(req: NextRequest) {
  return errorHandler(async () => {
    // Apply middleware
    const middlewareError = await applyMiddleware(req);
    if (middlewareError) return middlewareError;
    
    // Get resource type and ID from URL
    const { searchParams } = req.nextUrl;
    const resourceType = searchParams.get('type');
    const resourceId = searchParams.get('id');
    
    // Validate parameters
    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required parameters: type, id' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const sanitizedType = sanitizeInput(resourceType);
    const sanitizedId = sanitizeInput(resourceId);
    
    // Handle different resource types
    switch (sanitizedType) {
      case 'document':
        await supabase
          .from('document_analyses')
          .delete()
          .eq('document_id', sanitizedId);
        break;
      
      case 'meeting':
        await supabase
          .from('meeting_analyses')
          .delete()
          .eq('meeting_id', sanitizedId);
        
        await supabase
          .from('meeting_sessions')
          .delete()
          .eq('meeting_id', sanitizedId);
        break;
      
      case 'session':
        // Unregister WebSocket session
        wsServer.unregisterSession(sanitizedId);
        
        await supabase
          .from('meeting_sessions')
          .delete()
          .eq('id', sanitizedId);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Bad Request', message: 'Invalid resource type' },
          { status: 400 }
        );
    }
    
    // Return success response
    return createApiResponse({ 
      deleted: true, 
      resourceType: sanitizedType, 
      resourceId: sanitizedId 
    });
  }, req);
}

// Options endpoint for CORS support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
