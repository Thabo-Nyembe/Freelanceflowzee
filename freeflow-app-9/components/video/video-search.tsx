import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface VideoSearchProps {
  onSearch: (query: string) => void;
  className?: string;
  placeholder?: string;
  initialValue?: string;
}

export function VideoSearch({
  onSearch,
  className,
  placeholder = 'Search videos...',
  initialValue = ''
}: VideoSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-2',
        isMobile ? 'w-full' : 'max-w-md',
        className
      )}
    >
      <div className="relative flex-1">
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'pl-9 pr-8',
            isFocused && 'ring-2 ring-primary ring-offset-2'
          )}
        />
        <Search
          className={cn(
            'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors',
            isFocused && 'text-primary'
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full p-0 hover:bg-accent"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {isMobile && (
        <Button
          variant="ghost"
          className="shrink-0"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
        >
          Cancel
        </Button>
      )}
    </div>
  );
} 