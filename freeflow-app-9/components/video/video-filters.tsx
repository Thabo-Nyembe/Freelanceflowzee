import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface VideoFiltersProps {
  onFilterChange: (filters: VideoFilters) => void;
  className?: string;
}

interface VideoFilters {
  sortBy: 'newest' | 'oldest' | 'popular' | 'alphabetical';
  duration: 'all' | 'short' | 'medium' | 'long';
  status: 'all' | 'ready' | 'processing' | 'error';
}

const defaultFilters: VideoFilters = {
  sortBy: 'newest',
  duration: 'all',
  status: 'all',
};

export function VideoFilters({ onFilterChange, className }: VideoFiltersProps) {
  const [filters, setFilters] = useState<VideoFilters>(defaultFilters);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleFilterChange = (
    key: keyof VideoFilters,
    value: VideoFilters[keyof VideoFilters]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const FilterControls = () => (
    <div className={cn('space-y-4', !isMobile && 'flex items-center gap-4 space-y-0')}>
      <Select
        value={filters.sortBy}
        onValueChange={(value) => handleFilterChange('sortBy', value as VideoFilters['sortBy'])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="alphabetical">Alphabetical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.duration}
        onValueChange={(value) => handleFilterChange('duration', value as VideoFilters['duration'])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Durations</SelectItem>
          <SelectItem value="short">Short (< 5 min)</SelectItem>
          <SelectItem value="medium">Medium (5-20 min)</SelectItem>
          <SelectItem value="long">Long (> 20 min)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value as VideoFilters['status'])}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (isMobile) {
    return (
      <div className={className}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Videos</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterControls />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={className}>
      <FilterControls />
    </div>
  );
} 