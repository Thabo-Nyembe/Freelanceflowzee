// app/api/automations/recipes/route.ts
// API Routes for Automation Recipe Builder
// Competing with: Zapier, Make, n8n, Pipedream

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recipeBuilderService } from '@/lib/automations/recipe-builder';
import { createSimpleLogger } from '@/lib/simple-logger';
import { DEMO_USER_ID } from '@/lib/demo-auth';

const logger = createSimpleLogger('automations-recipes');

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const NodeSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['trigger', 'action', 'condition', 'loop', 'transform', 'delay']),
  triggerType: z.string().optional(),
  actionType: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  config: z.record(z.unknown()).default({}),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  inputs: z.array(z.string()).optional().default([]),
  outputs: z.array(z.string()).optional().default([]),
  metadata: z.object({
    icon: z.string().optional(),
    color: z.string().optional(),
    retryOnError: z.boolean().optional(),
    maxRetries: z.number().optional(),
    timeout: z.number().optional(),
  }).optional(),
});

const EdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  condition: z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty']),
    value: z.unknown(),
  }).optional(),
  label: z.string().optional(),
});

const VariableSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object', 'date']),
  defaultValue: z.unknown().optional(),
  required: z.boolean().default(false),
  description: z.string().optional(),
});

const SettingsSchema = z.object({
  timezone: z.string().default('UTC'),
  errorHandling: z.enum(['stop', 'continue', 'retry']).default('stop'),
  maxRetries: z.number().default(3),
  retryDelay: z.number().default(60),
  concurrency: z.number().default(1),
  logging: z.enum(['none', 'errors', 'all']).default('errors'),
  notifications: z.object({
    onSuccess: z.boolean().default(false),
    onError: z.boolean().default(true),
    email: z.string().optional(),
    slack: z.string().optional(),
  }).default({}),
});

const CreateRecipeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().default('general'),
  tags: z.array(z.string()).default([]),
  icon: z.string().default('Workflow'),
  color: z.string().default('blue'),
  nodes: z.array(NodeSchema).default([]),
  edges: z.array(EdgeSchema).default([]),
  variables: z.array(VariableSchema).default([]),
  settings: SettingsSchema.optional(),
});

const UpdateRecipeSchema = CreateRecipeSchema.partial().extend({
  status: z.enum(['draft', 'active', 'paused', 'error', 'archived']).optional(),
});

const ExecuteRecipeSchema = z.object({
  recipeId: z.string().uuid(),
  triggerData: z.record(z.unknown()).default({}),
});

const CreateFromTemplateSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().optional(),
});

// =============================================================================
// GET - Fetch recipes, templates, executions
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') || 'recipes';

    switch (resource) {
      case 'recipes': {
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
          .from('automation_recipes')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) {
          query = query.eq('status', status);
        }
        if (category) {
          query = query.eq('category', category);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Error fetching recipes', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'recipe': {
        const recipeId = searchParams.get('id');
        if (!recipeId) {
          return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
        }

        // Use database function to get full recipe with nodes, edges, variables
        const { data, error } = await supabase
          .rpc('get_recipe_full', { p_recipe_id: recipeId });

        if (error) {
          logger.error('Error fetching recipe', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'templates': {
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const search = searchParams.get('search');

        let query = supabase
          .from('recipe_templates')
          .select('*')
          .order('popularity', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }
        if (featured === 'true') {
          query = query.eq('is_featured', true);
        }
        if (search) {
          query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Error fetching templates', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'executions': {
        const recipeId = searchParams.get('recipeId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabase
          .from('recipe_executions')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })
          .limit(limit);

        if (recipeId) {
          query = query.eq('recipe_id', recipeId);
        }
        if (status) {
          query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
          logger.error('Error fetching executions', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'execution-logs': {
        const executionId = searchParams.get('executionId');
        if (!executionId) {
          return NextResponse.json({ error: 'Execution ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('recipe_execution_logs')
          .select('*')
          .eq('execution_id', executionId)
          .order('created_at', { ascending: true });

        if (error) {
          logger.error('Error fetching execution logs', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'integrations': {
        // Get available integrations and user's connected ones
        const availableIntegrations = recipeBuilderService.getIntegrations();

        const { data: connectedIntegrations, error } = await supabase
          .from('recipe_integrations')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          logger.error('Error fetching integrations', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const integrations = availableIntegrations.map(integration => ({
          ...integration,
          connected: connectedIntegrations?.some(c => c.integration_id === integration.id) || false,
          connectionStatus: connectedIntegrations?.find(c => c.integration_id === integration.id)?.status,
        }));

        return NextResponse.json({ data: integrations });
      }

      case 'dashboard': {
        // Get dashboard statistics
        const [recipesResult, executionsResult, recentResult] = await Promise.all([
          supabase
            .from('automation_recipes')
            .select('id, status, total_runs, successful_runs, failed_runs, total_time_saved')
            .eq('user_id', userId)
            .is('deleted_at', null),
          supabase
            .from('recipe_executions')
            .select('id, status, duration')
            .eq('user_id', userId)
            .gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase
            .from('recipe_executions')
            .select('*, automation_recipes(name)')
            .eq('user_id', userId)
            .order('started_at', { ascending: false })
            .limit(10),
        ]);

        const recipes = recipesResult.data || [];
        const executions = executionsResult.data || [];

        const stats = {
          totalRecipes: recipes.length,
          activeRecipes: recipes.filter(r => r.status === 'active').length,
          totalRuns: recipes.reduce((sum, r) => sum + (r.total_runs || 0), 0),
          successRate: recipes.reduce((sum, r) => sum + (r.total_runs || 0), 0) > 0
            ? Math.round(
                (recipes.reduce((sum, r) => sum + (r.successful_runs || 0), 0) /
                  recipes.reduce((sum, r) => sum + (r.total_runs || 0), 0)) *
                  100
              )
            : 0,
          timeSaved: recipes.reduce((sum, r) => sum + (r.total_time_saved || 0), 0),
          last30DaysExecutions: executions.length,
          last30DaysSuccess: executions.filter(e => e.status === 'success').length,
          recentExecutions: recentResult.data || [],
        };

        return NextResponse.json({ data: stats });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in GET /api/automations/recipes', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// POST - Create recipes, execute, clone, create from template
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const body = await request.json();
    const action = body.action || 'create';

    switch (action) {
      case 'create': {
        const validation = CreateRecipeSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { nodes, edges, variables, ...recipeData } = validation.data;

        // Create recipe
        const { data: recipe, error: recipeError } = await supabase
          .from('automation_recipes')
          .insert({
            ...recipeData,
            user_id: userId,
            status: 'draft',
          })
          .select()
          .single();

        if (recipeError) {
          logger.error('Error creating recipe', { error: recipeError });
          return NextResponse.json({ error: recipeError.message }, { status: 500 });
        }

        // Create nodes
        if (nodes.length > 0) {
          const nodesData = nodes.map((node, index) => ({
            recipe_id: recipe.id,
            node_type: node.type,
            trigger_type: node.triggerType,
            action_type: node.actionType,
            name: node.name,
            description: node.description,
            config: node.config,
            position_x: node.position.x,
            position_y: node.position.y,
            metadata: node.metadata || {},
            sort_order: index,
          }));

          const { error: nodesError } = await supabase
            .from('recipe_nodes')
            .insert(nodesData);

          if (nodesError) {
            logger.error('Error creating nodes', { error: nodesError });
          }
        }

        // Create edges (after nodes are created, get node IDs)
        if (edges.length > 0) {
          const { data: createdNodes } = await supabase
            .from('recipe_nodes')
            .select('id, name')
            .eq('recipe_id', recipe.id);

          const nodeIdMap = new Map(
            createdNodes?.map(n => [n.name, n.id]) || []
          );

          const edgesData = edges.map(edge => ({
            recipe_id: recipe.id,
            source_node_id: nodeIdMap.get(edge.source) || edge.source,
            target_node_id: nodeIdMap.get(edge.target) || edge.target,
            source_handle: edge.sourceHandle,
            target_handle: edge.targetHandle,
            condition: edge.condition,
            label: edge.label,
          }));

          const { error: edgesError } = await supabase
            .from('recipe_edges')
            .insert(edgesData);

          if (edgesError) {
            logger.error('Error creating edges', { error: edgesError });
          }
        }

        // Create variables
        if (variables.length > 0) {
          const variablesData = variables.map(v => ({
            recipe_id: recipe.id,
            name: v.name,
            var_type: v.type,
            default_value: v.defaultValue,
            is_required: v.required,
            description: v.description,
          }));

          const { error: variablesError } = await supabase
            .from('recipe_variables')
            .insert(variablesData);

          if (variablesError) {
            logger.error('Error creating variables', { error: variablesError });
          }
        }

        return NextResponse.json({ data: recipe }, { status: 201 });
      }

      case 'execute': {
        const validation = ExecuteRecipeSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { recipeId, triggerData } = validation.data;

        // Get full recipe
        const { data: recipeData } = await supabase
          .rpc('get_recipe_full', { p_recipe_id: recipeId });

        if (!recipeData || !recipeData.recipe) {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        // Check if recipe is active
        if (recipeData.recipe.status !== 'active') {
          return NextResponse.json(
            { error: 'Recipe is not active' },
            { status: 400 }
          );
        }

        // Create execution record
        const { data: execution, error: execError } = await supabase
          .from('recipe_executions')
          .insert({
            recipe_id: recipeId,
            user_id: userId,
            status: 'running',
            trigger_data: triggerData,
          })
          .select()
          .single();

        if (execError) {
          logger.error('Error creating execution', { error: execError });
          return NextResponse.json({ error: execError.message }, { status: 500 });
        }

        // Transform database data to service format
        const recipe = {
          id: recipeData.recipe.id,
          userId: recipeData.recipe.user_id,
          name: recipeData.recipe.name,
          description: recipeData.recipe.description,
          category: recipeData.recipe.category,
          tags: recipeData.recipe.tags || [],
          nodes: (recipeData.nodes || []).map((n: Record<string, unknown>) => ({
            id: n.id,
            type: n.node_type,
            triggerType: n.trigger_type,
            actionType: n.action_type,
            name: n.name,
            description: n.description,
            config: n.config || {},
            position: { x: n.position_x, y: n.position_y },
            inputs: [],
            outputs: [],
            metadata: n.metadata,
          })),
          edges: (recipeData.edges || []).map((e: Record<string, unknown>) => ({
            id: e.id,
            source: e.source_node_id,
            target: e.target_node_id,
            sourceHandle: e.source_handle,
            targetHandle: e.target_handle,
            condition: e.condition,
            label: e.label,
          })),
          variables: (recipeData.variables || []).map((v: Record<string, unknown>) => ({
            id: v.id,
            name: v.name,
            type: v.var_type,
            defaultValue: v.default_value,
            required: v.is_required,
            description: v.description,
          })),
          status: recipeData.recipe.status,
          version: recipeData.recipe.version,
          settings: recipeData.recipe.settings || {},
          stats: {
            totalRuns: recipeData.recipe.total_runs,
            successfulRuns: recipeData.recipe.successful_runs,
            failedRuns: recipeData.recipe.failed_runs,
            averageDuration: recipeData.recipe.average_duration,
            totalTimeSaved: recipeData.recipe.total_time_saved,
          },
          createdAt: new Date(recipeData.recipe.created_at),
          updatedAt: new Date(recipeData.recipe.updated_at),
        };

        // Execute recipe (in background or synchronously based on settings)
        const result = await recipeBuilderService.executeRecipe(
          recipe as import('@/lib/automations/recipe-builder').Recipe,
          triggerData,
          userId
        );

        // Update execution record
        const { error: updateError } = await supabase
          .from('recipe_executions')
          .update({
            status: result.status,
            outputs: result.outputs,
            nodes_executed: result.nodesExecuted,
            error_message: result.error?.message,
            error_stack: result.error?.stack,
            completed_at: result.completedAt.toISOString(),
            duration: result.duration,
          })
          .eq('id', execution.id);

        if (updateError) {
          logger.error('Error updating execution', { error: updateError });
        }

        // Save execution logs
        if (result.logs.length > 0) {
          const logsData = result.logs.map(log => ({
            execution_id: execution.id,
            node_id: log.nodeId,
            log_level: log.level,
            message: log.message,
            data: log.data,
            created_at: log.timestamp.toISOString(),
          }));

          const { error: logsError } = await supabase
            .from('recipe_execution_logs')
            .insert(logsData);

          if (logsError) {
            logger.error('Error saving logs', { error: logsError });
          }
        }

        return NextResponse.json({
          data: {
            executionId: execution.id,
            status: result.status,
            duration: result.duration,
            nodesExecuted: result.nodesExecuted,
            outputs: result.outputs,
            error: result.error,
          },
        });
      }

      case 'clone': {
        const recipeId = body.recipeId;
        const newName = body.name;

        if (!recipeId) {
          return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
        }

        const { data: newRecipeId, error } = await supabase
          .rpc('clone_recipe', {
            p_recipe_id: recipeId,
            p_user_id: userId,
            p_new_name: newName || null,
          });

        if (error) {
          logger.error('Error cloning recipe', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: recipe } = await supabase
          .from('automation_recipes')
          .select('*')
          .eq('id', newRecipeId)
          .single();

        return NextResponse.json({ data: recipe }, { status: 201 });
      }

      case 'create-from-template': {
        const validation = CreateFromTemplateSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { templateId, name } = validation.data;

        const { data: newRecipeId, error } = await supabase
          .rpc('create_recipe_from_template', {
            p_template_id: templateId,
            p_user_id: userId,
            p_name: name || null,
          });

        if (error) {
          logger.error('Error creating from template', { error });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: recipe } = await supabase
          .from('automation_recipes')
          .select('*')
          .eq('id', newRecipeId)
          .single();

        return NextResponse.json({ data: recipe }, { status: 201 });
      }

      case 'validate': {
        const recipeData = body.recipe;

        // Get full recipe from database or use provided data
        let recipe;
        if (recipeData.id) {
          const { data: dbRecipe } = await supabase
            .rpc('get_recipe_full', { p_recipe_id: recipeData.id });
          recipe = dbRecipe;
        } else {
          recipe = recipeData;
        }

        // Transform and validate
        const transformed = {
          id: recipe.id || 'temp',
          userId,
          name: recipe.name,
          nodes: (recipe.nodes || []).map((n: Record<string, unknown>) => ({
            id: n.id,
            type: n.node_type || n.type,
            triggerType: n.trigger_type || n.triggerType,
            actionType: n.action_type || n.actionType,
            name: n.name,
            config: n.config || {},
            position: n.position || { x: n.position_x, y: n.position_y },
            inputs: [],
            outputs: [],
          })),
          edges: (recipe.edges || []).map((e: Record<string, unknown>) => ({
            id: e.id,
            source: e.source_node_id || e.source,
            target: e.target_node_id || e.target,
          })),
        };

        const validation = recipeBuilderService.validateRecipe(
          transformed as import('@/lib/automations/recipe-builder').Recipe
        );

        return NextResponse.json({ data: validation });
      }

      case 'suggest-next': {
        const { recipeId, lastNodeId } = body;

        if (!recipeId || !lastNodeId) {
          return NextResponse.json(
            { error: 'Recipe ID and last node ID required' },
            { status: 400 }
          );
        }

        const { data: recipeData } = await supabase
          .rpc('get_recipe_full', { p_recipe_id: recipeId });

        if (!recipeData) {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        const recipe = {
          id: recipeData.recipe.id,
          nodes: (recipeData.nodes || []).map((n: Record<string, unknown>) => ({
            id: n.id,
            type: n.node_type,
            triggerType: n.trigger_type,
            actionType: n.action_type,
            name: n.name,
            config: n.config || {},
            position: { x: n.position_x, y: n.position_y },
          })),
          edges: (recipeData.edges || []).map((e: Record<string, unknown>) => ({
            id: e.id,
            source: e.source_node_id,
            target: e.target_node_id,
          })),
        };

        const suggestions = await recipeBuilderService.suggestNextNode(
          recipe as import('@/lib/automations/recipe-builder').Recipe,
          lastNodeId
        );

        return NextResponse.json({ data: suggestions });
      }

      case 'optimize': {
        const { recipeId } = body;

        if (!recipeId) {
          return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
        }

        const { data: recipeData } = await supabase
          .rpc('get_recipe_full', { p_recipe_id: recipeId });

        if (!recipeData) {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        const recipe = {
          id: recipeData.recipe.id,
          nodes: (recipeData.nodes || []).map((n: Record<string, unknown>) => ({
            id: n.id,
            type: n.node_type,
            actionType: n.action_type,
            name: n.name,
            metadata: n.metadata,
          })),
          edges: (recipeData.edges || []).map((e: Record<string, unknown>) => ({
            id: e.id,
            source: e.source_node_id,
            target: e.target_node_id,
          })),
        };

        const suggestions = await recipeBuilderService.optimizeRecipe(
          recipe as import('@/lib/automations/recipe-builder').Recipe
        );

        return NextResponse.json({ data: suggestions });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in POST /api/automations/recipes', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// PUT - Update recipes
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const body = await request.json();
    const recipeId = body.id;

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('automation_recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    const validation = UpdateRecipeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { nodes, edges, variables, ...recipeData } = validation.data;

    // Update recipe
    const updateData: Record<string, unknown> = {};
    if (recipeData.name) updateData.name = recipeData.name;
    if (recipeData.description !== undefined) updateData.description = recipeData.description;
    if (recipeData.category) updateData.category = recipeData.category;
    if (recipeData.tags) updateData.tags = recipeData.tags;
    if (recipeData.icon) updateData.icon = recipeData.icon;
    if (recipeData.color) updateData.color = recipeData.color;
    if (recipeData.status) updateData.status = recipeData.status;
    if (recipeData.settings) updateData.settings = recipeData.settings;

    if (Object.keys(updateData).length > 0) {
      const { error: recipeError } = await supabase
        .from('automation_recipes')
        .update(updateData)
        .eq('id', recipeId);

      if (recipeError) {
        logger.error('Error updating recipe', { error: recipeError });
        return NextResponse.json({ error: recipeError.message }, { status: 500 });
      }
    }

    // Update nodes if provided
    if (nodes !== undefined) {
      // Delete existing nodes (cascade deletes edges)
      await supabase
        .from('recipe_nodes')
        .delete()
        .eq('recipe_id', recipeId);

      // Insert new nodes
      if (nodes.length > 0) {
        const nodesData = nodes.map((node, index) => ({
          recipe_id: recipeId,
          node_type: node.type,
          trigger_type: node.triggerType,
          action_type: node.actionType,
          name: node.name,
          description: node.description,
          config: node.config,
          position_x: node.position.x,
          position_y: node.position.y,
          metadata: node.metadata || {},
          sort_order: index,
        }));

        await supabase
          .from('recipe_nodes')
          .insert(nodesData);
      }
    }

    // Update edges if provided
    if (edges !== undefined && nodes !== undefined) {
      // Get newly created node IDs
      const { data: createdNodes } = await supabase
        .from('recipe_nodes')
        .select('id, name')
        .eq('recipe_id', recipeId);

      const nodeIdMap = new Map(
        createdNodes?.map(n => [n.name, n.id]) || []
      );

      if (edges.length > 0) {
        const edgesData = edges.map(edge => ({
          recipe_id: recipeId,
          source_node_id: nodeIdMap.get(edge.source) || edge.source,
          target_node_id: nodeIdMap.get(edge.target) || edge.target,
          source_handle: edge.sourceHandle,
          target_handle: edge.targetHandle,
          condition: edge.condition,
          label: edge.label,
        }));

        await supabase
          .from('recipe_edges')
          .insert(edgesData);
      }
    }

    // Update variables if provided
    if (variables !== undefined) {
      await supabase
        .from('recipe_variables')
        .delete()
        .eq('recipe_id', recipeId);

      if (variables.length > 0) {
        const variablesData = variables.map(v => ({
          recipe_id: recipeId,
          name: v.name,
          var_type: v.type,
          default_value: v.defaultValue,
          is_required: v.required,
          description: v.description,
        }));

        await supabase
          .from('recipe_variables')
          .insert(variablesData);
      }
    }

    // Fetch updated recipe
    const { data: recipe } = await supabase
      .from('automation_recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    return NextResponse.json({ data: recipe });
  } catch (error) {
    logger.error('Error in PUT /api/automations/recipes', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// DELETE - Delete recipes
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID required' }, { status: 400 });
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('automation_recipes')
      .select('user_id')
      .eq('id', recipeId)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (permanent) {
      // Hard delete (cascade deletes nodes, edges, variables)
      const { error } = await supabase
        .from('automation_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) {
        logger.error('Error deleting recipe', { error });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Soft delete
      const { error } = await supabase
        .from('automation_recipes')
        .update({ deleted_at: new Date().toISOString(), status: 'archived' })
        .eq('id', recipeId);

      if (error) {
        logger.error('Error archiving recipe', { error });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/automations/recipes', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
