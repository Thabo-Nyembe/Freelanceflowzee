'use client';

/**
 * Category Browser - FreeFlow A+++ Implementation
 * Horizontal category navigation with subcategories
 */

import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Code,
  Palette,
  Video,
  Music,
  PenTool,
  BarChart,
  Globe,
  Megaphone,
  Briefcase,
  BookOpen,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceCategory } from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';

interface CategoryBrowserProps {
  categories: ServiceCategory[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string | undefined) => void;
  isLoading?: boolean;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'programming-tech': Code,
  'graphics-design': Palette,
  'video-animation': Video,
  'music-audio': Music,
  'writing-translation': PenTool,
  'data': BarChart,
  'digital-marketing': Megaphone,
  'business': Briefcase,
  'lifestyle': BookOpen,
  'ai-services': Sparkles,
};

export function CategoryBrowser({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading,
}: CategoryBrowserProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Get icon for category
  const getCategoryIcon = (slug: string) => {
    return CATEGORY_ICONS[slug] || Briefcase;
  };

  // Find selected category info
  const selectedCategoryInfo = categories.find(c => c.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main categories */}
      <div className="relative">
        {/* Left scroll button */}
        {showLeftArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Categories scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-8"
          onScroll={checkScroll}
        >
          {/* All categories */}
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            className="rounded-full whitespace-nowrap flex-shrink-0"
            onClick={() => {
              onSelectCategory(undefined);
              setExpandedCategory(null);
            }}
          >
            <Globe className="h-4 w-4 mr-2" />
            All Services
          </Button>

          {categories.map(category => {
            const Icon = getCategoryIcon(category.slug);
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            const isSelected = selectedCategory === category.id;

            if (hasSubcategories) {
              return (
                <Popover
                  key={category.id}
                  open={expandedCategory === category.id}
                  onOpenChange={(open) => setExpandedCategory(open ? category.id : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant={isSelected ? 'default' : 'outline'}
                      className="rounded-full whitespace-nowrap flex-shrink-0"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
                      {/* View all in category */}
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          onSelectCategory(category.id);
                          setExpandedCategory(null);
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        All {category.name}
                      </Button>

                      <div className="h-px bg-border my-1" />

                      {/* Subcategories */}
                      {category.subcategories?.map(sub => (
                        <Button
                          key={sub.id}
                          variant="ghost"
                          className="w-full justify-between"
                          onClick={() => {
                            onSelectCategory(sub.id);
                            setExpandedCategory(null);
                          }}
                        >
                          <span className="truncate">{sub.name}</span>
                          {sub.listing_count > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              {sub.listing_count}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return (
              <Button
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                className="rounded-full whitespace-nowrap flex-shrink-0"
                onClick={() => {
                  onSelectCategory(category.id);
                  setExpandedCategory(null);
                }}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Right scroll button */}
        {showRightArrow && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-background"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected category breadcrumb / subcategories */}
      {selectedCategoryInfo && selectedCategoryInfo.subcategories && selectedCategoryInfo.subcategories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">In {selectedCategoryInfo.name}:</span>
          {selectedCategoryInfo.subcategories.slice(0, 6).map(sub => (
            <Button
              key={sub.id}
              variant={selectedCategory === sub.id ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => onSelectCategory(sub.id)}
            >
              {sub.name}
              {sub.listing_count > 0 && (
                <span className="ml-1 text-muted-foreground">({sub.listing_count})</span>
              )}
            </Button>
          ))}
          {selectedCategoryInfo.subcategories.length > 6 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <MoreHorizontal className="h-3 w-3 mr-1" />
                  More
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                  {selectedCategoryInfo.subcategories.slice(6).map(sub => (
                    <Button
                      key={sub.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => onSelectCategory(sub.id)}
                    >
                      <span className="truncate">{sub.name}</span>
                      {sub.listing_count > 0 && (
                        <Badge variant="secondary">{sub.listing_count}</Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  );
}
