// =====================================================
// KAZI AI Service API - Comprehensive Route
// Multi-provider AI with conversations, generations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/ai/ai-service';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('ai-comprehensive');

// =====================================================
// GET - List conversations, generations, templates
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const conversationId = searchParams.get('conversationId');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(action, conversationId);
    }

    switch (action) {
      case 'conversation': {
        if (!conversationId) {
          return NextResponse.json(
            { success: false, error: 'Conversation ID required' },
            { status: 400 }
          );
        }
        const conversation = await aiService.getConversation(conversationId, user.id);
        if (!conversation) {
          return NextResponse.json(
            { success: false, error: 'Conversation not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, conversation });
      }

      case 'messages': {
        if (!conversationId) {
          return NextResponse.json(
            { success: false, error: 'Conversation ID required' },
            { status: 400 }
          );
        }
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before') || undefined;
        const messages = await aiService.getMessages(conversationId, user.id, limit, before);
        return NextResponse.json({ success: true, messages });
      }

      case 'generations': {
        const generationId = searchParams.get('generationId');
        if (generationId) {
          const generation = await aiService.getGeneration(generationId, user.id);
          return NextResponse.json({ success: true, generation });
        }

        const type = searchParams.get('type') as string | null;
        const status = searchParams.get('status') as string | null;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await aiService.listGenerations(
          user.id,
          { type, status },
          { page, limit }
        );

        return NextResponse.json({
          success: true,
          ...result,
          page,
          limit
        });
      }

      case 'templates': {
        const category = searchParams.get('category') || undefined;
        const includePublic = searchParams.get('includePublic') !== 'false';
        const templates = await aiService.getTemplates(user.id, category, includePublic);
        return NextResponse.json({ success: true, templates });
      }

      case 'usage': {
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const usage = await aiService.getUsage(
          user.id,
          startDate ? new Date(startDate) : undefined,
          endDate ? new Date(endDate) : undefined
        );
        return NextResponse.json({ success: true, usage });
      }

      case 'models': {
        const models = await aiService.getAvailableModels(user.id);
        return NextResponse.json({ success: true, models });
      }

      case 'model-config': {
        const configs = await aiService.getUserModelConfigs(user.id);
        return NextResponse.json({ success: true, configs });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'AI Service',
          version: '2.0.0',
          status: 'operational',
          providers: ['openai', 'anthropic', 'google'],
          capabilities: [
            'chat_completions',
            'image_generation',
            'code_generation',
            'text_analysis',
            'embeddings',
            'conversation_history',
            'prompt_templates',
            'usage_tracking'
          ]
        });
      }

      default: {
        // List all conversations
        const modelId = searchParams.get('modelId') || undefined;
        const isArchived = searchParams.get('isArchived') === 'true';
        const search = searchParams.get('search') || undefined;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await aiService.listConversations(
          user.id,
          { modelId, isArchived, search },
          { page, limit }
        );

        return NextResponse.json({
          success: true,
          ...result,
          page,
          limit
        });
      }
    }
  } catch (error) {
    logger.error('AI Service GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch AI data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Chat, generate, create conversations
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'chat': {
        if (!data.message) {
          return NextResponse.json(
            { success: false, error: 'Message required' },
            { status: 400 }
          );
        }

        const result = await aiService.chat(user.id, {
          conversationId: data.conversationId,
          message: data.message,
          modelId: data.modelId,
          provider: data.provider,
          systemPrompt: data.systemPrompt,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          attachments: data.attachments,
          contextType: data.contextType,
          contextId: data.contextId,
          contextData: data.contextData,
        });

        return NextResponse.json({
          success: true,
          action: 'chat',
          ...result
        });
      }

      case 'stream-chat': {
        // For streaming, we'd typically use a different approach
        // This returns a setup response; actual streaming handled elsewhere
        if (!data.message) {
          return NextResponse.json(
            { success: false, error: 'Message required' },
            { status: 400 }
          );
        }

        const streamSetup = await aiService.prepareStreamChat(user.id, {
          conversationId: data.conversationId,
          message: data.message,
          modelId: data.modelId,
          provider: data.provider,
        });

        return NextResponse.json({
          success: true,
          action: 'stream-chat',
          ...streamSetup,
          message: 'Stream ready. Connect to SSE endpoint.'
        });
      }

      case 'create-conversation': {
        const conversation = await aiService.createConversation(user.id, {
          title: data.title,
          modelId: data.modelId,
          provider: data.provider,
          systemPrompt: data.systemPrompt,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          contextType: data.contextType,
          contextId: data.contextId,
          tags: data.tags,
        });

        return NextResponse.json({
          success: true,
          action: 'create-conversation',
          conversation,
          message: 'Conversation created'
        }, { status: 201 });
      }

      case 'generate-image': {
        if (!data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Prompt required' },
            { status: 400 }
          );
        }

        const generation = await aiService.generateImage(user.id, {
          prompt: data.prompt,
          negativePrompt: data.negativePrompt,
          modelId: data.modelId || 'dall-e-3',
          size: data.size,
          quality: data.quality,
          style: data.style,
          n: data.n,
        });

        return NextResponse.json({
          success: true,
          action: 'generate-image',
          generation,
          message: 'Image generation started'
        });
      }

      case 'generate-code': {
        if (!data.prompt) {
          return NextResponse.json(
            { success: false, error: 'Prompt required' },
            { status: 400 }
          );
        }

        const generation = await aiService.generateCode(user.id, {
          prompt: data.prompt,
          language: data.language,
          modelId: data.modelId,
          context: data.context,
          existingCode: data.existingCode,
        });

        return NextResponse.json({
          success: true,
          action: 'generate-code',
          generation,
          message: 'Code generated'
        });
      }

      case 'analyze-text': {
        if (!data.text) {
          return NextResponse.json(
            { success: false, error: 'Text required' },
            { status: 400 }
          );
        }

        const analysis = await aiService.analyzeText(user.id, {
          text: data.text,
          analysisType: data.analysisType,
          modelId: data.modelId,
        });

        return NextResponse.json({
          success: true,
          action: 'analyze-text',
          analysis,
          message: 'Text analyzed'
        });
      }

      case 'create-embedding': {
        if (!data.text) {
          return NextResponse.json(
            { success: false, error: 'Text required' },
            { status: 400 }
          );
        }

        const embedding = await aiService.createEmbedding(user.id, {
          text: data.text,
          modelId: data.modelId,
        });

        return NextResponse.json({
          success: true,
          action: 'create-embedding',
          embedding,
          message: 'Embedding created'
        });
      }

      case 'apply-template': {
        if (!data.templateId || !data.variables) {
          return NextResponse.json(
            { success: false, error: 'Template ID and variables required' },
            { status: 400 }
          );
        }

        const result = await aiService.applyTemplate(user.id, data.templateId, data.variables);
        return NextResponse.json({
          success: true,
          action: 'apply-template',
          ...result,
          message: 'Template applied'
        });
      }

      case 'create-template': {
        if (!data.name || !data.template) {
          return NextResponse.json(
            { success: false, error: 'Name and template required' },
            { status: 400 }
          );
        }

        const template = await aiService.createTemplate(user.id, {
          name: data.name,
          description: data.description,
          category: data.category,
          template: data.template,
          variables: data.variables,
          defaultValues: data.defaultValues,
          preferredModel: data.preferredModel,
          preferredProvider: data.preferredProvider,
          recommendedSettings: data.recommendedSettings,
          isPublic: data.isPublic,
          tags: data.tags,
        });

        return NextResponse.json({
          success: true,
          action: 'create-template',
          template,
          message: 'Template created'
        }, { status: 201 });
      }

      case 'rate-response': {
        if (!data.messageId || !data.rating) {
          return NextResponse.json(
            { success: false, error: 'Message ID and rating required' },
            { status: 400 }
          );
        }

        await aiService.rateResponse(data.messageId, user.id, data.rating, data.feedback);
        return NextResponse.json({
          success: true,
          action: 'rate-response',
          message: 'Rating recorded'
        });
      }

      case 'save-model-config': {
        if (!data.modelId || !data.provider) {
          return NextResponse.json(
            { success: false, error: 'Model ID and provider required' },
            { status: 400 }
          );
        }

        const config = await aiService.saveModelConfig(user.id, {
          modelId: data.modelId,
          provider: data.provider,
          displayName: data.displayName,
          isEnabled: data.isEnabled,
          isDefault: data.isDefault,
          defaultTemperature: data.defaultTemperature,
          defaultMaxTokens: data.defaultMaxTokens,
          customSettings: data.customSettings,
          apiKeyEncrypted: data.apiKey, // Will be encrypted in service
          endpointOverride: data.endpointOverride,
          maxRequestsPerMinute: data.maxRequestsPerMinute,
          maxTokensPerDay: data.maxTokensPerDay,
        });

        return NextResponse.json({
          success: true,
          action: 'save-model-config',
          config,
          message: 'Model configuration saved'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('AI Service POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update conversation, template
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, templateId, ...updates } = body;

    if (conversationId) {
      const conversation = await aiService.updateConversation(conversationId, user.id, updates);
      return NextResponse.json({
        success: true,
        conversation,
        message: 'Conversation updated'
      });
    }

    if (templateId) {
      const template = await aiService.updateTemplate(templateId, user.id, updates);
      return NextResponse.json({
        success: true,
        template,
        message: 'Template updated'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Conversation ID or Template ID required' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('AI Service PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Delete conversation, template, generation
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const templateId = searchParams.get('templateId');
    const generationId = searchParams.get('generationId');

    if (conversationId) {
      await aiService.deleteConversation(conversationId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Conversation deleted'
      });
    }

    if (templateId) {
      await aiService.deleteTemplate(templateId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Template deleted'
      });
    }

    if (generationId) {
      await aiService.deleteGeneration(generationId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Generation deleted'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('AI Service DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// DEMO MODE HANDLERS
// =====================================================
function handleDemoGet(action: string | null, conversationId: string | null): NextResponse {
  const mockConversations = [
    {
      id: 'demo-conv-1',
      title: 'Code Review Discussion',
      modelId: 'gpt-4',
      provider: 'openai',
      messageCount: 12,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'demo-conv-2',
      title: 'Content Writing Assistant',
      modelId: 'claude-3-opus',
      provider: 'anthropic',
      messageCount: 8,
      lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  switch (action) {
    case 'conversation':
      return NextResponse.json({
        success: true,
        conversation: {
          ...mockConversations[0],
          messages: [
            { role: 'user', content: 'Can you review this code?', createdAt: new Date(Date.now() - 3600000).toISOString() },
            { role: 'assistant', content: 'I\'d be happy to help review your code. Please share it and I\'ll provide feedback on best practices, potential bugs, and improvements.', createdAt: new Date(Date.now() - 3580000).toISOString() },
          ]
        },
        message: 'Demo conversation loaded'
      });
    case 'templates':
      return NextResponse.json({
        success: true,
        templates: [
          { id: 'tpl-1', name: 'Code Review', category: 'development', isPublic: true },
          { id: 'tpl-2', name: 'Email Writer', category: 'communication', isPublic: true },
          { id: 'tpl-3', name: 'Content Summarizer', category: 'productivity', isPublic: true },
        ],
        message: 'Demo templates loaded'
      });
    case 'usage':
      return NextResponse.json({
        success: true,
        usage: {
          totalRequests: 245,
          totalTokens: 125000,
          totalCost: 2.45,
          byProvider: {
            openai: { requests: 150, tokens: 80000 },
            anthropic: { requests: 95, tokens: 45000 },
          }
        },
        message: 'Demo usage stats'
      });
    case 'models':
      return NextResponse.json({
        success: true,
        models: [
          { id: 'gpt-4', provider: 'openai', name: 'GPT-4', available: true },
          { id: 'gpt-4-turbo', provider: 'openai', name: 'GPT-4 Turbo', available: true },
          { id: 'claude-3-opus', provider: 'anthropic', name: 'Claude 3 Opus', available: true },
          { id: 'claude-3-sonnet', provider: 'anthropic', name: 'Claude 3 Sonnet', available: true },
          { id: 'gemini-pro', provider: 'google', name: 'Gemini Pro', available: true },
        ],
        message: 'Available models'
      });
    default:
      return NextResponse.json({
        success: true,
        conversations: mockConversations,
        total: mockConversations.length,
        page: 1,
        limit: 20,
        message: 'Demo conversations loaded'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'chat':
      return NextResponse.json({
        success: true,
        action: 'chat',
        conversationId: 'demo-conv-new',
        message: {
          role: 'assistant',
          content: 'This is a demo response. In the full version, you would receive an AI-generated response based on your message. Please log in to access the complete AI capabilities.',
          createdAt: new Date().toISOString(),
        },
        usage: {
          promptTokens: 50,
          completionTokens: 45,
          totalTokens: 95,
        }
      });
    case 'generate-image':
      return NextResponse.json({
        success: true,
        action: 'generate-image',
        generation: {
          id: 'demo-gen-image',
          status: 'completed',
          outputUrl: '/demo/generated-image.jpg',
          prompt: data.prompt,
        },
        message: 'Demo image generation'
      });
    case 'create-conversation':
      return NextResponse.json({
        success: true,
        action: 'create-conversation',
        conversation: {
          id: 'demo-new-conv',
          title: data.title || 'New Conversation',
          modelId: data.modelId || 'gpt-4',
          createdAt: new Date().toISOString(),
        },
        message: 'Demo conversation created'
      });
    default:
      return NextResponse.json({
        success: false,
        error: 'Please log in to use AI features'
      }, { status: 401 });
  }
}
