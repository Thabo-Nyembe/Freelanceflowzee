// lib/hooks/use-automation-recipes.ts
// React Hook for Automation Recipe Builder
// Competing with: Zapier, Make, n8n, Pipedream

'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// =============================================================================
// TYPES
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface RecipeNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'loop' | 'transform' | 'delay';
  triggerType?: string;
  actionType?: string;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  position: Position;
  inputs: string[];
  outputs: string[];
  metadata?: {
    icon?: string;
    color?: string;
    retryOnError?: boolean;
    maxRetries?: number;
    timeout?: number;
  };
}

export interface RecipeEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  condition?: {
    field: string;
    operator: string;
    value: unknown;
  };
  label?: string;
}

export interface RecipeVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  defaultValue?: unknown;
  required: boolean;
  description?: string;
}

export interface RecipeSettings {
  timezone: string;
  errorHandling: 'stop' | 'continue' | 'retry';
  maxRetries: number;
  retryDelay: number;
  concurrency: number;
  logging: 'none' | 'errors' | 'all';
  notifications: {
    onSuccess: boolean;
    onError: boolean;
    email?: string;
    slack?: string;
  };
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  icon: string;
  color: string;
  status: 'draft' | 'active' | 'paused' | 'error' | 'archived';
  version: number;
  settings: RecipeSettings;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  average_duration: number;
  total_time_saved: number;
  last_run_at?: string;
  last_success_at?: string;
  last_error_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
  color: string;
  popularity: number;
  use_count: number;
  nodes: Partial<RecipeNode>[];
  edges: Partial<RecipeEdge>[];
  variables: RecipeVariable[];
  required_integrations: string[];
  is_featured: boolean;
  is_premium: boolean;
}

export interface RecipeExecution {
  id: string;
  recipe_id: string;
  user_id: string;
  status: 'running' | 'success' | 'error' | 'partial' | 'cancelled';
  trigger_data?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  nodes_executed: number;
  error_message?: string;
  error_node_id?: string;
  started_at: string;
  completed_at?: string;
  duration?: number;
  automation_recipes?: {
    name: string;
  };
}

export interface ExecutionLog {
  id: string;
  execution_id: string;
  node_id?: string;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
  created_at: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  triggers: TriggerDefinition[];
  actions: ActionDefinition[];
  authType: 'oauth2' | 'api_key' | 'basic' | 'none';
  connected: boolean;
  connectionStatus?: string;
}

export interface TriggerDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  configSchema: { fields: SchemaField[] };
  outputSchema: { fields: SchemaField[] };
}

export interface ActionDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  configSchema: { fields: SchemaField[] };
  inputSchema: { fields: SchemaField[] };
  outputSchema: { fields: SchemaField[] };
}

export interface SchemaField {
  name: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: unknown }[];
}

export interface DashboardStats {
  totalRecipes: number;
  activeRecipes: number;
  totalRuns: number;
  successRate: number;
  timeSaved: number;
  last30DaysExecutions: number;
  last30DaysSuccess: number;
  recentExecutions: RecipeExecution[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface AISuggestion {
  type: 'node' | 'edge' | 'optimization' | 'error_fix';
  confidence: number;
  suggestion: string;
  details: string;
  implementation?: Partial<RecipeNode | RecipeEdge>;
}

export interface FullRecipe {
  recipe: Recipe;
  nodes: RecipeNode[];
  edges: RecipeEdge[];
  variables: RecipeVariable[];
  recent_executions: RecipeExecution[];
}

// =============================================================================
// HOOK
// =============================================================================

export function useAutomationRecipes() {
  // State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [templates, setTemplates] = useState<RecipeTemplate[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<FullRecipe | null>(null);
  const [executions, setExecutions] = useState<RecipeExecution[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [editorNodes, setEditorNodes] = useState<RecipeNode[]>([]);
  const [editorEdges, setEditorEdges] = useState<RecipeEdge[]>([]);
  const [editorVariables, setEditorVariables] = useState<RecipeVariable[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // ==========================================================================
  // RECIPES CRUD
  // ==========================================================================

  const fetchRecipes = useCallback(async (params?: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({ resource: 'recipes' });
      if (params?.status) searchParams.set('status', params.status);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());

      const response = await fetch(`/api/automations/recipes?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch recipes');
      }

      setRecipes(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recipes';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecipe = useCallback(async (recipeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/automations/recipes?resource=recipe&id=${recipeId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch recipe');
      }

      setCurrentRecipe(result.data);

      // Populate editor state
      if (result.data) {
        const nodes = (result.data.nodes || []).map((n: Record<string, unknown>) => ({
          id: n.id as string,
          type: n.node_type as RecipeNode['type'],
          triggerType: n.trigger_type as string | undefined,
          actionType: n.action_type as string | undefined,
          name: n.name as string,
          description: n.description as string | undefined,
          config: (n.config as Record<string, unknown>) || {},
          position: { x: n.position_x as number, y: n.position_y as number },
          inputs: [],
          outputs: [],
          metadata: n.metadata as RecipeNode['metadata'],
        }));

        const edges = (result.data.edges || []).map((e: Record<string, unknown>) => ({
          id: e.id as string,
          source: e.source_node_id as string,
          target: e.target_node_id as string,
          sourceHandle: e.source_handle as string | undefined,
          targetHandle: e.target_handle as string | undefined,
          condition: e.condition as RecipeEdge['condition'],
          label: e.label as string | undefined,
        }));

        const variables = (result.data.variables || []).map((v: Record<string, unknown>) => ({
          id: v.id as string,
          name: v.name as string,
          type: v.var_type as RecipeVariable['type'],
          defaultValue: v.default_value,
          required: v.is_required as boolean,
          description: v.description as string | undefined,
        }));

        setEditorNodes(nodes);
        setEditorEdges(edges);
        setEditorVariables(variables);
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recipe';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRecipe = useCallback(async (data: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    nodes?: Partial<RecipeNode>[];
    edges?: Partial<RecipeEdge>[];
    variables?: Partial<RecipeVariable>[];
    settings?: Partial<RecipeSettings>;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...data }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create recipe');
      }

      toast.success('Recipe created successfully');
      await fetchRecipes();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create recipe';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  const updateRecipe = useCallback(async (recipeId: string, data: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    status?: Recipe['status'];
    nodes?: Partial<RecipeNode>[];
    edges?: Partial<RecipeEdge>[];
    variables?: Partial<RecipeVariable>[];
    settings?: Partial<RecipeSettings>;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recipeId, ...data }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update recipe');
      }

      toast.success('Recipe updated successfully');
      await fetchRecipes();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update recipe';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  const deleteRecipe = useCallback(async (recipeId: string, permanent = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/automations/recipes?id=${recipeId}&permanent=${permanent}`,
        { method: 'DELETE' }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete recipe');
      }

      toast.success(permanent ? 'Recipe deleted permanently' : 'Recipe archived');
      await fetchRecipes();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete recipe';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  const cloneRecipe = useCallback(async (recipeId: string, newName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clone', recipeId, name: newName }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to clone recipe');
      }

      toast.success('Recipe cloned successfully');
      await fetchRecipes();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clone recipe';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  // ==========================================================================
  // TEMPLATES
  // ==========================================================================

  const fetchTemplates = useCallback(async (params?: {
    category?: string;
    featured?: boolean;
    search?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({ resource: 'templates' });
      if (params?.category) searchParams.set('category', params.category);
      if (params?.featured) searchParams.set('featured', 'true');
      if (params?.search) searchParams.set('search', params.search);

      const response = await fetch(`/api/automations/recipes?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch templates');
      }

      setTemplates(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch templates';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFromTemplate = useCallback(async (templateId: string, name?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-from-template', templateId, name }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create from template');
      }

      toast.success('Recipe created from template');
      await fetchRecipes();
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create from template';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  // ==========================================================================
  // EXECUTION
  // ==========================================================================

  const executeRecipe = useCallback(async (
    recipeId: string,
    triggerData: Record<string, unknown> = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', recipeId, triggerData }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute recipe');
      }

      if (result.data.status === 'success') {
        toast.success('Recipe executed successfully');
      } else if (result.data.status === 'error') {
        toast.error(`Execution failed: ${result.data.error?.message || 'Unknown error'}`);
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to execute recipe';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExecutions = useCallback(async (params?: {
    recipeId?: string;
    status?: string;
    limit?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({ resource: 'executions' });
      if (params?.recipeId) searchParams.set('recipeId', params.recipeId);
      if (params?.status) searchParams.set('status', params.status);
      if (params?.limit) searchParams.set('limit', params.limit.toString());

      const response = await fetch(`/api/automations/recipes?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch executions');
      }

      setExecutions(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch executions';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExecutionLogs = useCallback(async (executionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/automations/recipes?resource=execution-logs&executionId=${executionId}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch execution logs');
      }

      setExecutionLogs(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch logs';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================================================
  // INTEGRATIONS
  // ==========================================================================

  const fetchIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes?resource=integrations');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch integrations');
      }

      setIntegrations(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch integrations';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================================================
  // DASHBOARD
  // ==========================================================================

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/automations/recipes?resource=dashboard');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dashboard');
      }

      setDashboard(result.data);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================================================
  // VALIDATION & AI
  // ==========================================================================

  const validateRecipe = useCallback(async (recipeId?: string, nodes?: RecipeNode[], edges?: RecipeEdge[]): Promise<ValidationResult> => {
    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          recipe: recipeId ? { id: recipeId } : { nodes, edges },
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Validation failed');
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Validation failed';
      return { valid: false, errors: [message] };
    }
  }, []);

  const suggestNextNode = useCallback(async (recipeId: string, lastNodeId: string): Promise<AISuggestion[]> => {
    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest-next', recipeId, lastNodeId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get suggestions');
      }

      return result.data;
    } catch (err) {
      console.error('AI suggestion error:', err);
      return [];
    }
  }, []);

  const optimizeRecipe = useCallback(async (recipeId: string): Promise<AISuggestion[]> => {
    try {
      const response = await fetch('/api/automations/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'optimize', recipeId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to optimize');
      }

      return result.data;
    } catch (err) {
      console.error('Optimization error:', err);
      return [];
    }
  }, []);

  // ==========================================================================
  // EDITOR HELPERS
  // ==========================================================================

  const addNode = useCallback((node: Partial<RecipeNode>) => {
    const newNode: RecipeNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: node.type || 'action',
      triggerType: node.triggerType,
      actionType: node.actionType,
      name: node.name || 'New Node',
      description: node.description,
      config: node.config || {},
      position: node.position || { x: 100, y: 100 },
      inputs: node.inputs || [],
      outputs: node.outputs || [],
      metadata: node.metadata,
    };

    setEditorNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    return newNode;
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<RecipeNode>) => {
    setEditorNodes(prev =>
      prev.map(node => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setEditorNodes(prev => prev.filter(node => node.id !== nodeId));
    setEditorEdges(prev =>
      prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    );
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const addEdge = useCallback((edge: Partial<RecipeEdge>) => {
    // Check if edge already exists
    const exists = editorEdges.some(
      e => e.source === edge.source && e.target === edge.target
    );
    if (exists) return null;

    // Check for cycles (simple check)
    const wouldCreateCycle = editorEdges.some(
      e => e.source === edge.target && e.target === edge.source
    );
    if (wouldCreateCycle) {
      toast.error('Cannot create circular connection');
      return null;
    }

    const newEdge: RecipeEdge = {
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: edge.source || '',
      target: edge.target || '',
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      condition: edge.condition,
      label: edge.label,
    };

    setEditorEdges(prev => [...prev, newEdge]);
    return newEdge;
  }, [editorEdges]);

  const removeEdge = useCallback((edgeId: string) => {
    setEditorEdges(prev => prev.filter(edge => edge.id !== edgeId));
  }, []);

  const addVariable = useCallback((variable: Partial<RecipeVariable>) => {
    const newVariable: RecipeVariable = {
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: variable.name || 'new_variable',
      type: variable.type || 'string',
      defaultValue: variable.defaultValue,
      required: variable.required || false,
      description: variable.description,
    };

    setEditorVariables(prev => [...prev, newVariable]);
    return newVariable;
  }, []);

  const updateVariable = useCallback((variableId: string, updates: Partial<RecipeVariable>) => {
    setEditorVariables(prev =>
      prev.map(v => (v.id === variableId ? { ...v, ...updates } : v))
    );
  }, []);

  const removeVariable = useCallback((variableId: string) => {
    setEditorVariables(prev => prev.filter(v => v.id !== variableId));
  }, []);

  const saveEditorState = useCallback(async (recipeId: string) => {
    return updateRecipe(recipeId, {
      nodes: editorNodes,
      edges: editorEdges,
      variables: editorVariables,
    });
  }, [editorNodes, editorEdges, editorVariables, updateRecipe]);

  const clearEditor = useCallback(() => {
    setEditorNodes([]);
    setEditorEdges([]);
    setEditorVariables([]);
    setSelectedNodeId(null);
    setCurrentRecipe(null);
  }, []);

  // ==========================================================================
  // STATUS HELPERS
  // ==========================================================================

  const activateRecipe = useCallback(async (recipeId: string) => {
    // Validate first
    const validation = await validateRecipe(recipeId);
    if (!validation.valid) {
      toast.error(`Cannot activate: ${validation.errors.join(', ')}`);
      return false;
    }

    return updateRecipe(recipeId, { status: 'active' });
  }, [validateRecipe, updateRecipe]);

  const pauseRecipe = useCallback(async (recipeId: string) => {
    return updateRecipe(recipeId, { status: 'paused' });
  }, [updateRecipe]);

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  useEffect(() => {
    // Optional: Auto-fetch on mount
    // fetchRecipes();
    // fetchTemplates();
    // fetchIntegrations();
    // fetchDashboard();
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    recipes,
    templates,
    integrations,
    currentRecipe,
    executions,
    executionLogs,
    dashboard,
    isLoading,
    error,

    // Editor state
    editorNodes,
    editorEdges,
    editorVariables,
    selectedNodeId,
    setSelectedNodeId,

    // Recipes CRUD
    fetchRecipes,
    fetchRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    cloneRecipe,

    // Templates
    fetchTemplates,
    createFromTemplate,

    // Execution
    executeRecipe,
    fetchExecutions,
    fetchExecutionLogs,

    // Integrations
    fetchIntegrations,

    // Dashboard
    fetchDashboard,

    // Validation & AI
    validateRecipe,
    suggestNextNode,
    optimizeRecipe,

    // Editor helpers
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    addVariable,
    updateVariable,
    removeVariable,
    saveEditorState,
    clearEditor,

    // Status helpers
    activateRecipe,
    pauseRecipe,
  };
}
