'use client';

/**
 * Organization AI Context Hook - FreeFlow A+++ Implementation
 * React hook for managing organization-wide AI configuration
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
  OrganizationContext,
  KnowledgeSource,
  TeamContext,
  AIConfiguration,
  AIResponseWithContext,
} from '@/lib/ai/organization-context';

interface UseOrganizationContextReturn {
  // State
  context: OrganizationContext | null;
  isLoading: boolean;
  isSaving: boolean;
  isDefault: boolean;
  error: string | null;

  // Actions
  fetchContext: (organizationId: string, teamId?: string) => Promise<void>;
  updateContext: (updates: Partial<OrganizationContext>) => Promise<boolean>;
  generateOptimizedContext: (params: GenerateContextParams) => Promise<Partial<OrganizationContext> | null>;
  analyzeContext: () => Promise<ContextAnalysis | null>;
  addKnowledgeSource: (source: Partial<KnowledgeSource>) => Promise<boolean>;
  removeKnowledgeSource: (sourceId: string) => Promise<boolean>;
  addTeamContext: (team: Partial<TeamContext>) => Promise<boolean>;
  removeTeamContext: (teamId: string) => Promise<boolean>;
  chatWithContext: (prompt: string, additionalContext?: string) => Promise<AIResponseWithContext | null>;
  clearError: () => void;
}

interface GenerateContextParams {
  organizationName: string;
  industry: string;
  description?: string;
  teamSize?: number;
}

interface ContextAnalysis {
  score: number;
  suggestions: string[];
  warnings: string[];
  optimizations: string[];
}

export function useOrganizationContext(
  initialOrganizationId?: string
): UseOrganizationContextReturn {
  const [context, setContext] = useState<OrganizationContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | undefined>(initialOrganizationId);
  const [teamId, setTeamId] = useState<string | undefined>();

  const clearError = useCallback(() => setError(null), []);

  /**
   * Fetch organization context
   */
  const fetchContext = useCallback(async (orgId: string, teamIdParam?: string) => {
    setIsLoading(true);
    setError(null);
    setOrganizationId(orgId);
    setTeamId(teamIdParam);

    try {
      const params = new URLSearchParams({ organizationId: orgId });
      if (teamIdParam) params.set('teamId', teamIdParam);

      const response = await fetch(`/api/ai/organization-context?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch context');
      }

      const data = await response.json();
      setContext(data.context);
      setIsDefault(data.isDefault || false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch context';
      setError(message);
      console.error('Error fetching context:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update organization context
   */
  const updateContext = useCallback(async (updates: Partial<OrganizationContext>): Promise<boolean> => {
    if (!organizationId) {
      toast.error('No organization selected');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/organization-context?action=upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          ...context,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update context');
      }

      const data = await response.json();

      if (data.success) {
        setContext(data.context);
        setIsDefault(false);
        toast.success('AI context updated');
        return true;
      }

      throw new Error('Invalid response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update context';
      setError(message);
      toast.error('Update failed', { description: message });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, context]);

  /**
   * Generate AI-optimized context
   */
  const generateOptimizedContext = useCallback(async (
    params: GenerateContextParams
  ): Promise<Partial<OrganizationContext> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/organization-context?action=generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate context');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('AI context generated!');
        return data.generatedContext;
      }

      throw new Error('Invalid response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate context';
      setError(message);
      toast.error('Generation failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Analyze current context
   */
  const analyzeContext = useCallback(async (): Promise<ContextAnalysis | null> => {
    if (!context) {
      toast.error('No context to analyze');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/organization-context?action=analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze context');
      }

      const data = await response.json();

      if (data.success) {
        return data.analysis;
      }

      throw new Error('Invalid response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze context';
      setError(message);
      toast.error('Analysis failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  /**
   * Add knowledge source
   */
  const addKnowledgeSource = useCallback(async (source: Partial<KnowledgeSource>): Promise<boolean> => {
    if (!organizationId) {
      toast.error('No organization selected');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/organization-context?action=add-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          source,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add knowledge source');
      }

      const data = await response.json();

      if (data.success) {
        // Refresh context
        await fetchContext(organizationId, teamId);
        toast.success('Knowledge source added');
        return true;
      }

      throw new Error('Invalid response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add knowledge source';
      setError(message);
      toast.error('Add failed', { description: message });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, teamId, fetchContext]);

  /**
   * Remove knowledge source
   */
  const removeKnowledgeSource = useCallback(async (sourceId: string): Promise<boolean> => {
    if (!organizationId) {
      toast.error('No organization selected');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        organizationId,
        sourceId,
      });

      const response = await fetch(`/api/ai/organization-context?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove knowledge source');
      }

      // Refresh context
      await fetchContext(organizationId, teamId);
      toast.success('Knowledge source removed');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove knowledge source';
      setError(message);
      toast.error('Remove failed', { description: message });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, teamId, fetchContext]);

  /**
   * Add team context
   */
  const addTeamContext = useCallback(async (team: Partial<TeamContext>): Promise<boolean> => {
    if (!organizationId) {
      toast.error('No organization selected');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/organization-context?action=add-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          team,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add team context');
      }

      const data = await response.json();

      if (data.success) {
        // Refresh context
        await fetchContext(organizationId, teamId);
        toast.success('Team context added');
        return true;
      }

      throw new Error('Invalid response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add team context';
      setError(message);
      toast.error('Add failed', { description: message });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, teamId, fetchContext]);

  /**
   * Remove team context
   */
  const removeTeamContext = useCallback(async (teamIdToRemove: string): Promise<boolean> => {
    if (!organizationId) {
      toast.error('No organization selected');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        organizationId,
        teamId: teamIdToRemove,
      });

      const response = await fetch(`/api/ai/organization-context?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove team context');
      }

      // Refresh context
      await fetchContext(organizationId, teamId);
      toast.success('Team context removed');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove team context';
      setError(message);
      toast.error('Remove failed', { description: message });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, teamId, fetchContext]);

  /**
   * Chat with organization context
   */
  const chatWithContext = useCallback(async (
    prompt: string,
    additionalContext?: string
  ): Promise<AIResponseWithContext | null> => {
    if (!organizationId) {
      toast.error('No organization selected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/organization-context?action=chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          organizationId,
          teamId,
          additionalContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      if (data.success) {
        return data.response;
      }

      throw new Error('Invalid response');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(message);
      toast.error('Chat failed', { description: message });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, teamId]);

  // Fetch context on initial organization ID
  useEffect(() => {
    if (initialOrganizationId) {
      fetchContext(initialOrganizationId);
    }
  }, [initialOrganizationId, fetchContext]);

  return {
    context,
    isLoading,
    isSaving,
    isDefault,
    error,
    fetchContext,
    updateContext,
    generateOptimizedContext,
    analyzeContext,
    addKnowledgeSource,
    removeKnowledgeSource,
    addTeamContext,
    removeTeamContext,
    chatWithContext,
    clearError,
  };
}

// Export types
export type { GenerateContextParams, ContextAnalysis };
