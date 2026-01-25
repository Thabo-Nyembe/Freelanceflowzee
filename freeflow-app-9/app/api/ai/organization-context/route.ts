/**
 * Organization AI Context API - FreeFlow A+++ Implementation
 * Manage organization-wide AI configuration and knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  OrganizationContextService,
  OrganizationContext,
  KnowledgeSource,
  TeamContext,
  AIConfiguration,
} from '@/lib/ai/organization-context';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('ai-organization-context');

// Initialize service
const contextService = new OrganizationContextService();

// ============================================================================
// POST - Create or update organization context
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'upsert';

    switch (action) {
      case 'upsert': {
        // Create or update organization context
        const organizationId = body.organizationId;

        if (!organizationId) {
          return NextResponse.json(
            { error: 'organizationId is required' },
            { status: 400 }
          );
        }

        // Check if context exists
        const { data: existing } = await supabase
          .from('organization_contexts')
          .select('id, version')
          .eq('organization_id', organizationId)
          .single();

        const contextData = {
          organization_id: organizationId,
          name: body.name || 'AI Context',
          description: body.description || '',
          ai_config: body.aiConfig || {},
          knowledge_sources: body.knowledgeSources || [],
          custom_instructions: body.customInstructions || '',
          system_prompt_additions: body.systemPromptAdditions || '',
          team_contexts: body.teamContexts || [],
          updated_by: user.id,
          version: (existing?.version || 0) + 1,
        };

        let result;
        if (existing) {
          // Update
          const { data, error } = await supabase
            .from('organization_contexts')
            .update(contextData)
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw error;
          result = data;
        } else {
          // Insert
          const { data, error } = await supabase
            .from('organization_contexts')
            .insert({
              ...contextData,
              created_by: user.id,
            })
            .select()
            .single();

          if (error) throw error;
          result = data;
        }

        return NextResponse.json({
          success: true,
          context: transformContext(result),
        });
      }

      case 'generate': {
        // Generate AI-optimized context for a new organization
        const { organizationName, industry, description, teamSize } = body;

        if (!organizationName || !industry) {
          return NextResponse.json(
            { error: 'organizationName and industry are required' },
            { status: 400 }
          );
        }

        const generatedContext = await contextService.generateOnboardingContext(
          organizationName,
          industry,
          description || '',
          teamSize || 10
        );

        return NextResponse.json({
          success: true,
          generatedContext,
        });
      }

      case 'analyze': {
        // Analyze existing context and provide suggestions
        const context = body as OrganizationContext;

        if (!context.id) {
          return NextResponse.json(
            { error: 'Valid context object is required' },
            { status: 400 }
          );
        }

        const analysis = await contextService.analyzeContext(context);

        return NextResponse.json({
          success: true,
          analysis,
        });
      }

      case 'query': {
        // Query relevant context for a user question
        const { query, organizationId, teamId, includeHistory, maxResults } = body;

        if (!query || !organizationId) {
          return NextResponse.json(
            { error: 'query and organizationId are required' },
            { status: 400 }
          );
        }

        const contextResult = await contextService.queryContext({
          query,
          userId: user.id,
          organizationId,
          teamId,
          includeHistory: includeHistory ?? true,
          maxResults: maxResults ?? 10,
        });

        return NextResponse.json({
          success: true,
          result: contextResult,
        });
      }

      case 'chat': {
        // Generate AI response with organization context
        const { prompt, organizationId, teamId, additionalContext } = body;

        if (!prompt || !organizationId) {
          return NextResponse.json(
            { error: 'prompt and organizationId are required' },
            { status: 400 }
          );
        }

        // Fetch organization context
        const { data: contextData, error: fetchError } = await supabase
          .from('organization_contexts')
          .select('*')
          .eq('organization_id', organizationId)
          .single();

        if (fetchError || !contextData) {
          // Use default context
          const defaultContext = contextService.createDefaultContext(organizationId, 'Organization');

          const response = await contextService.generateWithContext(
            prompt,
            defaultContext,
            undefined,
            additionalContext
          );

          return NextResponse.json({
            success: true,
            response,
          });
        }

        const context = transformContext(contextData);

        // Find team context if specified
        let teamContext: TeamContext | undefined;
        if (teamId && context.teamContexts) {
          teamContext = context.teamContexts.find(tc => tc.teamId === teamId);
        }

        const response = await contextService.generateWithContext(
          prompt,
          context,
          teamContext,
          additionalContext
        );

        return NextResponse.json({
          success: true,
          response,
        });
      }

      case 'add-knowledge': {
        // Add a knowledge source
        const { organizationId, source } = body;

        if (!organizationId || !source) {
          return NextResponse.json(
            { error: 'organizationId and source are required' },
            { status: 400 }
          );
        }

        // Fetch current context
        const { data: contextData, error: fetchError } = await supabase
          .from('organization_contexts')
          .select('id, knowledge_sources')
          .eq('organization_id', organizationId)
          .single();

        if (fetchError || !contextData) {
          return NextResponse.json(
            { error: 'Organization context not found' },
            { status: 404 }
          );
        }

        // Add new source
        const newSource: KnowledgeSource = {
          id: `ks_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: source.type || 'document',
          name: source.name || 'Untitled',
          description: source.description || '',
          content: source.content,
          url: source.url,
          syncFrequency: source.syncFrequency || 'manual',
          status: 'active',
          metadata: source.metadata || {},
        };

        const knowledgeSources = [...(contextData.knowledge_sources || []), newSource];

        // Update context
        const { data, error: updateError } = await supabase
          .from('organization_contexts')
          .update({
            knowledge_sources: knowledgeSources,
            updated_by: user.id,
          })
          .eq('id', contextData.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Generate embeddings for the source if it has content
        let embeddings = null;
        if (newSource.content) {
          embeddings = await contextService.embedKnowledgeSource(newSource);

          // Store embeddings (in production, use a vector database)
          await supabase
            .from('knowledge_embeddings')
            .insert({
              source_id: newSource.id,
              organization_id: organizationId,
              chunks: embeddings.chunks,
              embeddings: embeddings.embeddings,
            });
        }

        return NextResponse.json({
          success: true,
          source: newSource,
          embeddingsCreated: !!embeddings,
        });
      }

      case 'add-team': {
        // Add a team context
        const { organizationId, team } = body;

        if (!organizationId || !team) {
          return NextResponse.json(
            { error: 'organizationId and team are required' },
            { status: 400 }
          );
        }

        // Fetch current context
        const { data: contextData, error: fetchError } = await supabase
          .from('organization_contexts')
          .select('id, team_contexts')
          .eq('organization_id', organizationId)
          .single();

        if (fetchError || !contextData) {
          return NextResponse.json(
            { error: 'Organization context not found' },
            { status: 404 }
          );
        }

        // Add new team context
        const newTeamContext: TeamContext = {
          id: `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          teamId: team.teamId,
          teamName: team.teamName || 'Team',
          inheritFromOrg: team.inheritFromOrg !== false,
          overrides: team.overrides || {},
          additionalKnowledge: team.additionalKnowledge || [],
          customInstructions: team.customInstructions,
          members: team.members || [],
        };

        const teamContexts = [...(contextData.team_contexts || []), newTeamContext];

        // Update context
        const { data, error: updateError } = await supabase
          .from('organization_contexts')
          .update({
            team_contexts: teamContexts,
            updated_by: user.id,
          })
          .eq('id', contextData.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          teamContext: newTeamContext,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error in POST /api/ai/organization-context', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Fetch organization context
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const teamId = searchParams.get('teamId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Fetch organization context
    const { data, error } = await supabase
      .from('organization_contexts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No context found, return default
        return NextResponse.json({
          context: contextService.createDefaultContext(organizationId, 'Organization'),
          isDefault: true,
        });
      }
      throw error;
    }

    const context = transformContext(data);

    // If team specified, extract team-specific context
    let effectiveContext = context;
    if (teamId && context.teamContexts) {
      const teamContext = context.teamContexts.find(tc => tc.teamId === teamId);
      if (teamContext) {
        effectiveContext = {
          ...context,
          aiConfig: teamContext.inheritFromOrg
            ? { ...context.aiConfig, ...teamContext.overrides }
            : (teamContext.overrides as AIConfiguration),
          customInstructions: teamContext.customInstructions || context.customInstructions,
          knowledgeSources: [
            ...context.knowledgeSources,
            ...teamContext.additionalKnowledge,
          ],
        };
      }
    }

    return NextResponse.json({
      context: effectiveContext,
      isDefault: false,
    });
  } catch (error) {
    logger.error('Error in GET /api/ai/organization-context', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove organization context or components
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const sourceId = searchParams.get('sourceId');
    const teamId = searchParams.get('teamId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Fetch current context
    const { data: contextData, error: fetchError } = await supabase
      .from('organization_contexts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (fetchError || !contextData) {
      return NextResponse.json(
        { error: 'Organization context not found' },
        { status: 404 }
      );
    }

    if (sourceId) {
      // Remove specific knowledge source
      const knowledgeSources = (contextData.knowledge_sources || [])
        .filter((s: KnowledgeSource) => s.id !== sourceId);

      await supabase
        .from('organization_contexts')
        .update({
          knowledge_sources: knowledgeSources,
          updated_by: user.id,
        })
        .eq('organization_id', organizationId);

      // Also delete embeddings
      await supabase
        .from('knowledge_embeddings')
        .delete()
        .eq('source_id', sourceId);

      return NextResponse.json({
        success: true,
        message: 'Knowledge source removed',
      });
    }

    if (teamId) {
      // Remove specific team context
      const teamContexts = (contextData.team_contexts || [])
        .filter((t: TeamContext) => t.teamId !== teamId);

      await supabase
        .from('organization_contexts')
        .update({
          team_contexts: teamContexts,
          updated_by: user.id,
        })
        .eq('organization_id', organizationId);

      return NextResponse.json({
        success: true,
        message: 'Team context removed',
      });
    }

    // Delete entire context
    await supabase
      .from('organization_contexts')
      .delete()
      .eq('organization_id', organizationId);

    // Delete all embeddings
    await supabase
      .from('knowledge_embeddings')
      .delete()
      .eq('organization_id', organizationId);

    return NextResponse.json({
      success: true,
      message: 'Organization context deleted',
    });
  } catch (error) {
    logger.error('Error in DELETE /api/ai/organization-context', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function transformContext(data: any): OrganizationContext {
  return {
    id: data.id,
    organizationId: data.organization_id,
    name: data.name,
    description: data.description,
    aiConfig: data.ai_config || {},
    knowledgeSources: data.knowledge_sources || [],
    customInstructions: data.custom_instructions || '',
    systemPromptAdditions: data.system_prompt_additions || '',
    teamContexts: data.team_contexts || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    version: data.version,
  };
}
