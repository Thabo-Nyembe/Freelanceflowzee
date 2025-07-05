import { Database } from '@/lib/database.types';

export type VideoSearchResult = Database['public']['Tables']['videos']['Row'] & {
  search_rank: number;
};

export interface TranscriptSegment {
  timestamp_start: number;
  timestamp_end: number;
  text: string;
  similarity: number;
}

export interface VideoSearchFilters {
  query: string;
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'views';
  duration?: 'short' | 'medium' | 'long' | 'any';
  status?: 'ready' | 'processing' | 'error' | 'any';
}

export interface VideoSearchState {
  results: VideoSearchResult[];
  isLoading: boolean;
  error: Error | null;
  filters: VideoSearchFilters;
  totalResults: number;
  hasMore: boolean;
} 