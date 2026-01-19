'use client';

/**
 * Review List - FreeFlow A+++ Implementation
 * Display reviews with rating breakdown
 */

import { useState } from 'react';
import { Star, ThumbsUp, Flag, MessageSquare, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceReview } from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  reviews: ServiceReview[];
  stats: {
    average: number;
    total: number;
    breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
  };
  isLoading?: boolean;
}

export function ReviewList({ reviews, stats, isLoading }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'rating_high':
        return b.rating - a.rating;
      case 'rating_low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  // Filter by rating
  const filteredReviews = filterRating === 'all'
    ? sortedReviews
    : sortedReviews.filter(r => Math.round(r.rating) === filterRating);

  // Render stars
  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              sizeClass,
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-20 bg-muted rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-5xl font-bold">{stats.average.toFixed(1)}</p>
              <div className="mt-2">{renderStars(Math.round(stats.average))}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.total} review{stats.total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.breakdown[rating as keyof typeof stats.breakdown];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                return (
                  <button
                    key={rating}
                    className="flex items-center gap-2 w-full group"
                    onClick={() => setFilterRating(filterRating === rating ? 'all' : rating)}
                  >
                    <span className="w-3 text-sm">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <Progress
                      value={percentage}
                      className={cn(
                        'h-2 flex-1 transition-colors',
                        filterRating === rating && 'ring-2 ring-primary ring-offset-2'
                      )}
                    />
                    <span className="w-8 text-sm text-muted-foreground text-right">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
            {filterRating !== 'all' && ` with ${filterRating} stars`}
          </span>
          {filterRating !== 'all' && (
            <Button variant="ghost" size="sm" onClick={() => setFilterRating('all')}>
              Clear filter
            </Button>
          )}
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
            <SelectItem value="rating_high">Highest Rating</SelectItem>
            <SelectItem value="rating_low">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
            <p className="text-muted-foreground">
              {filterRating !== 'all'
                ? 'No reviews match the selected rating filter'
                : 'Be the first to review this service'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-4">
                {/* Reviewer Info */}
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.reviewer?.avatar_url || ''} />
                    <AvatarFallback>
                      {review.reviewer?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{review.reviewer?.name || 'Anonymous'}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mt-1">
                      {renderStars(review.rating, 'sm')}
                      <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
                    </div>

                    {/* Sub-ratings */}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Communication: {review.communication_rating}</span>
                      <span>Service: {review.service_rating}</span>
                      <span>Recommend: {review.recommendation_rating}</span>
                    </div>

                    {/* Review Text */}
                    {review.review_text && (
                      <p className="mt-3 text-sm">{review.review_text}</p>
                    )}

                    {/* Seller Response */}
                    {review.seller_response && (
                      <div className="mt-4 bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Seller&apos;s Response
                        </p>
                        <p className="text-sm">{review.seller_response}</p>
                        {review.seller_responded_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(review.seller_responded_at), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                        <Flag className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
