"use client";

/**
 * Suggestions Hook - FreeFlow A+++ Implementation
 * React Query hooks for track changes/suggestions management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface Suggestion {
  id: string;
  documentId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  type: 'insertion' | 'deletion' | 'replacement' | 'formatting';
  content: {
    original?: string;
    suggested?: string;
    from: number;
    to: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolverName?: string;
  comments: SuggestionComment[];
}

export interface SuggestionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface CreateSuggestionPayload {
  documentId: string;
  type: 'insertion' | 'deletion' | 'replacement' | 'formatting';
  content: {
    original?: string;
    suggested?: string;
    from: number;
    to: number;
  };
}

// =====================================================
// Fetch Suggestions
// =====================================================

export function useSuggestions(documentId: string | null, status?: string) {
  return useQuery({
    queryKey: ['suggestions', documentId, status],
    queryFn: async (): Promise<Suggestion[]> => {
      if (!documentId) return [];

      const params = new URLSearchParams({ documentId });
      if (status) params.append('status', status);

      const response = await fetch(`/api/suggestions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      return response.json();
    },
    enabled: !!documentId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

// =====================================================
// Create Suggestion
// =====================================================

export function useCreateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSuggestionPayload): Promise<Suggestion> => {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create suggestion');
      }

      return response.json();
    },
    onSuccess: (newSuggestion) => {
      // Invalidate suggestions query
      queryClient.invalidateQueries({
        queryKey: ['suggestions', newSuggestion.documentId],
      });

      // Optimistic update
      queryClient.setQueryData(
        ['suggestions', newSuggestion.documentId],
        (old: Suggestion[] | undefined) => {
          if (!old) return [newSuggestion];
          return [newSuggestion, ...old];
        }
      );
    },
    onError: (error: Error) => {
      toast.error('Failed to create suggestion', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Accept Suggestion
// =====================================================

export function useAcceptSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string): Promise<{ id: string; status: string }> => {
      const response = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestionId, action: 'accept' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept suggestion');
      }

      return response.json();
    },
    onSuccess: (result, suggestionId) => {
      // Update the suggestion in cache
      queryClient.setQueriesData(
        { queryKey: ['suggestions'] },
        (old: Suggestion[] | undefined) => {
          if (!old) return old;
          return old.map(s =>
            s.id === suggestionId
              ? { ...s, status: 'accepted' as const, resolvedAt: new Date().toISOString() }
              : s
          );
        }
      );

      toast.success('Suggestion accepted');
    },
    onError: (error: Error) => {
      toast.error('Failed to accept suggestion', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Reject Suggestion
// =====================================================

export function useRejectSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string): Promise<{ id: string; status: string }> => {
      const response = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestionId, action: 'reject' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject suggestion');
      }

      return response.json();
    },
    onSuccess: (result, suggestionId) => {
      // Update the suggestion in cache
      queryClient.setQueriesData(
        { queryKey: ['suggestions'] },
        (old: Suggestion[] | undefined) => {
          if (!old) return old;
          return old.map(s =>
            s.id === suggestionId
              ? { ...s, status: 'rejected' as const, resolvedAt: new Date().toISOString() }
              : s
          );
        }
      );

      toast.success('Suggestion rejected');
    },
    onError: (error: Error) => {
      toast.error('Failed to reject suggestion', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Bulk Accept All Suggestions
// =====================================================

export function useAcceptAllSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string): Promise<void> => {
      // Get all pending suggestions
      const suggestions = queryClient.getQueryData<Suggestion[]>(['suggestions', documentId]);
      const pendingSuggestions = suggestions?.filter(s => s.status === 'pending') || [];

      // Accept each one
      await Promise.all(
        pendingSuggestions.map(s =>
          fetch('/api/suggestions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: s.id, action: 'accept' }),
          })
        )
      );
    },
    onSuccess: (_, documentId) => {
      // Update all pending to accepted
      queryClient.setQueryData(
        ['suggestions', documentId],
        (old: Suggestion[] | undefined) => {
          if (!old) return old;
          return old.map(s =>
            s.status === 'pending'
              ? { ...s, status: 'accepted' as const, resolvedAt: new Date().toISOString() }
              : s
          );
        }
      );

      toast.success('All suggestions accepted');
    },
    onError: (error: Error) => {
      toast.error('Failed to accept all suggestions', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Bulk Reject All Suggestions
// =====================================================

export function useRejectAllSuggestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string): Promise<void> => {
      // Get all pending suggestions
      const suggestions = queryClient.getQueryData<Suggestion[]>(['suggestions', documentId]);
      const pendingSuggestions = suggestions?.filter(s => s.status === 'pending') || [];

      // Reject each one
      await Promise.all(
        pendingSuggestions.map(s =>
          fetch('/api/suggestions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: s.id, action: 'reject' }),
          })
        )
      );
    },
    onSuccess: (_, documentId) => {
      // Update all pending to rejected
      queryClient.setQueryData(
        ['suggestions', documentId],
        (old: Suggestion[] | undefined) => {
          if (!old) return old;
          return old.map(s =>
            s.status === 'pending'
              ? { ...s, status: 'rejected' as const, resolvedAt: new Date().toISOString() }
              : s
          );
        }
      );

      toast.success('All suggestions rejected');
    },
    onError: (error: Error) => {
      toast.error('Failed to reject all suggestions', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Add Comment to Suggestion
// =====================================================

export function useAddSuggestionComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      suggestionId,
      content,
    }: {
      suggestionId: string;
      content: string;
    }): Promise<SuggestionComment> => {
      const response = await fetch(`/api/suggestions/${suggestionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      return response.json();
    },
    onSuccess: (newComment, { suggestionId }) => {
      // Update suggestion with new comment
      queryClient.setQueriesData(
        { queryKey: ['suggestions'] },
        (old: Suggestion[] | undefined) => {
          if (!old) return old;
          return old.map(s =>
            s.id === suggestionId
              ? { ...s, comments: [...(s.comments || []), newComment] }
              : s
          );
        }
      );

      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add comment', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Delete Suggestion
// =====================================================

export function useDeleteSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (suggestionId: string): Promise<void> => {
      const response = await fetch(`/api/suggestions?id=${suggestionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete suggestion');
      }
    },
    onSuccess: (_, suggestionId) => {
      // Remove from cache
      queryClient.setQueriesData(
        { queryKey: ['suggestions'] },
        (old: Suggestion[] | undefined) => {
          if (!old) return old;
          return old.filter(s => s.id !== suggestionId);
        }
      );

      toast.success('Suggestion deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete suggestion', {
        description: error.message,
      });
    },
  });
}

// =====================================================
// Export all hooks
// =====================================================

export const suggestionsHooks = {
  useSuggestions,
  useCreateSuggestion,
  useAcceptSuggestion,
  useRejectSuggestion,
  useAcceptAllSuggestions,
  useRejectAllSuggestions,
  useAddSuggestionComment,
  useDeleteSuggestion,
};

export default suggestionsHooks;
