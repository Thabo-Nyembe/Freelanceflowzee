'use client';
import { useState } from 'react';
import { useVideoSearch } from '@/hooks/use-video-search';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Search, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TranscriptSegment } from '@/lib/types/video-search';

interface TranscriptSearchProps {
  videoId: string;
  onTimestampClick: (time: number) => void;
  className?: string;
}

export function TranscriptSearch({
  videoId: unknown, onTimestampClick: unknown, className
}: TranscriptSearchProps) {
  const [query, setQuery] = useState<any>('');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isSearching, setIsSearching] = useState<any>(false);
  const { searchTranscript } = useVideoSearch();
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = async () => {
    if (!debouncedQuery.trim()) {
      setSegments([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchTranscript(videoId, debouncedQuery);
      setSegments(results);
    } catch (error) {
      console.error('Error searching transcript:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => (
      regex.test(part) ? (
        <span key={i} className="bg-primary/20 text-primary font-medium">
          {part}
        </span>
      ) : part
    ));
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in transcript..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button
          variant="secondary"
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
        >
          Search
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        {isSearching ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Searching transcript...</p>
          </div>
        ) : segments.length > 0 ? (
          <div className="space-y-2 p-4">
            {segments.map((segment, index) => (
              <button
                key={index}
                onClick={() => onTimestampClick(segment.timestamp_start)}
                className="group w-full rounded-lg p-2 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(segment.timestamp_start)}</span>
                </div>
                <p className="mt-1 text-sm">
                  {highlightText(segment.text, debouncedQuery)}
                </p>
              </button>
            ))}
          </div>
        ) : query ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">No matches found</p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Enter a search term to find specific moments in the video
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 