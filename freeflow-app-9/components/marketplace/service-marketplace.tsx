'use client';

/**
 * Service Marketplace - FreeFlow A+++ Implementation
 * Main marketplace browsing interface with search and filters
 */

import { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  Star,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ListingCard } from './listing-card';
import { CategoryBrowser } from './category-browser';
import {
  useServiceCategories,
  useMarketplaceSearch,
  MarketplaceSearchFilters,
  SELLER_LEVELS,
} from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';

interface ServiceMarketplaceProps {
  initialCategory?: string;
  initialQuery?: string;
}

export function ServiceMarketplace({
  initialCategory,
  initialQuery,
}: ServiceMarketplaceProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<MarketplaceSearchFilters>({
    query: initialQuery,
    category_id: initialCategory,
    sort_by: 'relevance',
    page: 1,
    limit: 24,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { categories, isLoading: categoriesLoading } = useServiceCategories();
  const { listings, pagination, isLoading, search } = useMarketplaceSearch(filters);

  // Update filters
  const updateFilters = useCallback((updates: Partial<MarketplaceSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates, page: 1 }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      sort_by: 'relevance',
      page: 1,
      limit: 24,
    });
  }, []);

  // Active filters count
  const activeFiltersCount = [
    filters.category_id,
    filters.min_price,
    filters.max_price,
    filters.delivery_days,
    filters.seller_level,
    filters.min_rating,
    filters.pro_only,
  ].filter(Boolean).length;

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    updateFilters({ query });
  };

  // Price range presets
  const pricePresets = [
    { label: 'Any Price', min: undefined, max: undefined },
    { label: 'Under $50', min: undefined, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $250', min: 100, max: 250 },
    { label: '$250 - $500', min: 250, max: 500 },
    { label: '$500+', min: 500, max: undefined },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Find the perfect service for your business
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse thousands of professional services from verified sellers
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              name="query"
              placeholder="Search for any service..."
              defaultValue={filters.query}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Button type="submit" size="lg">
            Search
          </Button>
        </form>
      </div>

      {/* Category Browser */}
      <CategoryBrowser
        categories={categories}
        selectedCategory={filters.category_id}
        onSelectCategory={(id) => updateFilters({ category_id: id })}
        isLoading={categoriesLoading}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Filter Button (Mobile) */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down your search results
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <FilterControls
                  filters={filters}
                  onUpdateFilters={updateFilters}
                  onClearFilters={clearFilters}
                  pricePresets={pricePresets}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            {pagination.total.toLocaleString()} services found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select
            value={filters.sort_by}
            onValueChange={(v) => updateFilters({ sort_by: v as MarketplaceSearchFilters['sort_by'] })}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="best_selling">Best Selling</SelectItem>
              <SelectItem value="top_rated">Top Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-4">
              <FilterControls
                filters={filters}
                onUpdateFilters={updateFilters}
                onClearFilters={clearFilters}
                pricePresets={pricePresets}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Listings Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-6 bg-muted rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              )}>
                {listings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Filter Controls Component
interface FilterControlsProps {
  filters: MarketplaceSearchFilters;
  onUpdateFilters: (updates: Partial<MarketplaceSearchFilters>) => void;
  onClearFilters: () => void;
  pricePresets: Array<{ label: string; min?: number; max?: number }>;
}

function FilterControls({
  filters,
  onUpdateFilters,
  onClearFilters,
  pricePresets,
}: FilterControlsProps) {
  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear all
        </Button>
      </div>

      <Separator />

      {/* Budget */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Budget</h4>
        <div className="space-y-2">
          {pricePresets.map((preset, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                id={`price-${i}`}
                checked={filters.min_price === preset.min && filters.max_price === preset.max}
                onCheckedChange={() => onUpdateFilters({
                  min_price: preset.min,
                  max_price: preset.max,
                })}
              />
              <Label htmlFor={`price-${i}`} className="text-sm cursor-pointer">
                {preset.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Delivery Time */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Delivery Time</h4>
        <div className="space-y-2">
          {[
            { label: 'Express (24h)', days: 1 },
            { label: 'Up to 3 days', days: 3 },
            { label: 'Up to 7 days', days: 7 },
            { label: 'Any time', days: undefined },
          ].map((option, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox
                id={`delivery-${i}`}
                checked={filters.delivery_days === option.days}
                onCheckedChange={() => onUpdateFilters({ delivery_days: option.days })}
              />
              <Label htmlFor={`delivery-${i}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Seller Level */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Seller Level</h4>
        <div className="space-y-2">
          {Object.entries(SELLER_LEVELS).map(([key, { label }]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={`level-${key}`}
                checked={filters.seller_level === key}
                onCheckedChange={() => onUpdateFilters({
                  seller_level: filters.seller_level === key ? undefined : key as string,
                })}
              />
              <Label htmlFor={`level-${key}`} className="text-sm cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Minimum Rating</h4>
        <div className="space-y-2">
          {[4.5, 4, 3.5, 3].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.min_rating === rating}
                onCheckedChange={() => onUpdateFilters({
                  min_rating: filters.min_rating === rating ? undefined : rating,
                })}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {rating}+
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pro Sellers */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="pro-only"
          checked={filters.pro_only}
          onCheckedChange={(checked) => onUpdateFilters({ pro_only: !!checked })}
        />
        <Label htmlFor="pro-only" className="text-sm cursor-pointer">
          Pro sellers only
        </Label>
      </div>
    </div>
  );
}
