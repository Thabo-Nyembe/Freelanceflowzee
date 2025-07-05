import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VideoSearchResult, VideoSearchFilters, TranscriptSegment } from '@/lib/types/video-search';
import { useDebounce } from '@/hooks/use-debounce';

const supabase = createClient();

export function useVideoSearch(initialFilters: Partial<VideoSearchFilters> = {}) {
  const [filters, setFilters] = useState<VideoSearchFilters>({
    query: '',
    maxResults: 20,
    sortBy: 'relevance',
    duration: 'any',
    status: 'any',
    ...initialFilters
  });

  const [results, setResults] = useState<VideoSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const debouncedQuery = useDebounce(filters.query, 300);

  const searchVideos = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the search_videos function
      const { data, error: searchError } = await supabase
        .rpc('search_videos', {
          search_query: debouncedQuery,
          max_results: filters.maxResults
        });

      if (searchError) throw searchError;

      // Apply client-side filters
      let filteredResults = data as VideoSearchResult[];

      if (filters.duration !== 'any') {
        filteredResults = filteredResults.filter(video => {
          const duration = video.duration || 0;
          switch (filters.duration) {
            case 'short': return duration < 300; // < 5 minutes
            case 'medium': return duration >= 300 && duration < 1200; // 5-20 minutes
            case 'long': return duration >= 1200; // > 20 minutes
            default: return true;
          }
        });
      }

      if (filters.status !== 'any') {
        filteredResults = filteredResults.filter(video => video.status === filters.status);
      }

      // Apply sorting
      if (filters.sortBy !== 'relevance') {
        filteredResults.sort((a, b) => {
          if (filters.sortBy === 'date') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          if (filters.sortBy === 'views') {
            return (b.view_count || 0) - (a.view_count || 0);
          }
          return 0;
        });
      }

      setResults(filteredResults);
      setTotalResults(filteredResults.length);
      setHasMore(filteredResults.length === filters.maxResults);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while searching'));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters]);

  const searchTranscript = useCallback(async (videoId: string, query: string) => {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .rpc('extract_transcript_timestamps', {
          video_id: videoId,
          search_query: query
        });

      if (error) throw error;

      return data as TranscriptSegment[];
    } catch (err) {
      console.error('Error searching transcript:', err);
      return [];
    }
  }, []);

  useEffect(() => {
    searchVideos();
  }, [searchVideos]);

  const updateFilters = useCallback((newFilters: Partial<VideoSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    results,
    isLoading,
    error,
    filters,
    totalResults,
    hasMore,
    updateFilters,
    searchTranscript
  };
} 