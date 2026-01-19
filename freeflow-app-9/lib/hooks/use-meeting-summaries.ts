'use client';

/**
 * Meeting Summaries Hook - FreeFlow A+++ Implementation
 * React hook for meeting intelligence features
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { MeetingSummary, SummarizerOptions } from '@/lib/ai/meeting-summarizer';

interface UseMeetingSummariesReturn {
  // State
  summaries: MeetingSummary[];
  currentSummary: MeetingSummary | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateSummary: (params: GenerateSummaryParams) => Promise<MeetingSummary | null>;
  quickSummarize: (text: string) => Promise<QuickSummaryResult | null>;
  fetchSummaries: (params?: FetchSummariesParams) => Promise<void>;
  fetchSummary: (id: string) => Promise<MeetingSummary | null>;
  deleteSummary: (id: string) => Promise<boolean>;
  exportToMarkdown: (summary: MeetingSummary) => Promise<string | null>;
  clearError: () => void;
}

interface GenerateSummaryParams {
  transcript: string;
  meetingId?: string;
  title?: string;
  speakers?: string[];
  duration?: number;
  segments?: Array<{
    speaker?: string;
    start: number;
    end: number;
    text: string;
  }>;
  options?: SummarizerOptions;
}

interface FetchSummariesParams {
  meetingId?: string;
  limit?: number;
  offset?: number;
}

interface QuickSummaryResult {
  summary: string;
  actionItems: string[];
  keyPoints: string[];
}

export function useMeetingSummaries(): UseMeetingSummariesReturn {
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [currentSummary, setCurrentSummary] = useState<MeetingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Generate a comprehensive meeting summary
   */
  const generateSummary = useCallback(async (params: GenerateSummaryParams): Promise<MeetingSummary | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/meeting-summary?action=summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();

      if (data.success && data.summary) {
        setCurrentSummary(data.summary);
        setSummaries(prev => [data.summary, ...prev]);
        toast.success('Meeting summary generated!', {
          description: `Found ${data.summary.actionItems?.length || 0} action items`,
        });
        return data.summary;
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(message);
      toast.error('Summary generation failed', { description: message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Quick summarize (faster, less detailed)
   */
  const quickSummarize = useCallback(async (text: string): Promise<QuickSummaryResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/meeting-summary?action=quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quick summary');
      }

      const data = await response.json();

      if (data.success) {
        return {
          summary: data.summary,
          actionItems: data.actionItems || [],
          keyPoints: data.keyPoints || [],
        };
      }

      throw new Error('Invalid response from server');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate quick summary';
      setError(message);
      toast.error('Quick summary failed', { description: message });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Fetch list of summaries
   */
  const fetchSummaries = useCallback(async (params?: FetchSummariesParams): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (params?.meetingId) searchParams.set('meetingId', params.meetingId);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());

      const response = await fetch(`/api/ai/meeting-summary?${searchParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch summaries');
      }

      const data = await response.json();
      setSummaries(data.summaries || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch summaries';
      setError(message);
      console.error('Error fetching summaries:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a single summary by ID
   */
  const fetchSummary = useCallback(async (id: string): Promise<MeetingSummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/meeting-summary?id=${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch summary');
      }

      const data = await response.json();

      if (data.summary) {
        setCurrentSummary(data.summary);
        return data.summary;
      }

      throw new Error('Summary not found');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch summary';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a summary
   */
  const deleteSummary = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/meeting-summary?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete summary');
      }

      // Remove from local state
      setSummaries(prev => prev.filter(s => s.id !== id));
      if (currentSummary?.id === id) {
        setCurrentSummary(null);
      }

      toast.success('Summary deleted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete summary';
      setError(message);
      toast.error('Delete failed', { description: message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentSummary?.id]);

  /**
   * Export summary to markdown
   */
  const exportToMarkdown = useCallback(async (summary: MeetingSummary): Promise<string | null> => {
    try {
      const response = await fetch('/api/ai/meeting-summary?action=markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary),
      });

      if (!response.ok) {
        throw new Error('Failed to export to markdown');
      }

      const data = await response.json();

      if (data.success && data.markdown) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.markdown);
        toast.success('Markdown copied to clipboard!');
        return data.markdown;
      }

      throw new Error('Invalid response');
    } catch (err) {
      toast.error('Export failed');
      return null;
    }
  }, []);

  return {
    summaries,
    currentSummary,
    isLoading,
    isGenerating,
    error,
    generateSummary,
    quickSummarize,
    fetchSummaries,
    fetchSummary,
    deleteSummary,
    exportToMarkdown,
    clearError,
  };
}

// Export types
export type { GenerateSummaryParams, FetchSummariesParams, QuickSummaryResult };
