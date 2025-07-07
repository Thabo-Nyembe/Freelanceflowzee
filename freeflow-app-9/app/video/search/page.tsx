'use client';
import { Suspense } from 'react';
import { VideoSearch } from '@/components/video/video-search';
import { VideoFilters } from '@/components/video/video-filters';
import { VideoGrid } from '@/components/video/video-grid';
import { useVideoSearch } from '@/hooks/use-video-search';
import { useSearchParams } from 'next/navigation';
import { VideoSearchFilters } from '@/lib/types/video-search';

export default function VideoSearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Search Videos</h1>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const {
    results,
    isLoading,
    error,
    filters,
    totalResults,
    updateFilters
  } = useVideoSearch({
    query: initialQuery
  });

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handleFilterChange = (newFilters: Partial<VideoSearchFilters>) => {
    updateFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <VideoSearch
          onSearch={handleSearch}
          initialValue={initialQuery}
          className="md:max-w-md"
        />
        <VideoFilters
          onFilterChange={handleFilterChange}
          className="w-full md:w-auto"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error.message}
        </div>
      )}

      {!error && (
        <>
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Searching...'
            ) : totalResults > 0 ? (
              `Found ${totalResults} video${totalResults === 1 ? '' : 's'}`
            ) : filters.query ? (
              'No videos found'
            ) : null}
          </div>

          <VideoGrid
            videos={results.map(video => ({
              id: video.id,
              title: video.title,
              status: video.status as 'processing' | 'ready' | 'error'
            }))}
            className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        </>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted md:w-[384px]" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted md:w-[180px]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-video animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
} 