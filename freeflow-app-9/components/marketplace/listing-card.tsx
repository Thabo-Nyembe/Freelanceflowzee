'use client';

/**
 * Listing Card - FreeFlow A+++ Implementation
 * Display card for service listings
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Clock, User, Check, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ServiceListing, SELLER_LEVELS, useSavedListings } from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: ServiceListing;
  viewMode?: 'grid' | 'list';
  showSeller?: boolean;
}

export function ListingCard({
  listing,
  viewMode = 'grid',
  showSeller = true,
}: ListingCardProps) {
  const { isSaved, toggleSave } = useSavedListings();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const saved = isSaved(listing.id);
  const startingPrice = listing.packages?.[0]?.price || 0;
  const deliveryDays = listing.packages?.[0]?.delivery_days || 0;

  const sellerLevel = listing.seller?.level || 'new';
  const levelInfo = SELLER_LEVELS[sellerLevel];

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleSave(listing.id);
    } catch {
      // Handle error silently or show toast
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden">
        <Link href={`/marketplace/${listing.slug}`}>
          <div className="flex">
            {/* Image */}
            <div className="relative w-64 flex-shrink-0">
              {listing.images?.[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  className={cn(
                    'object-cover transition-opacity duration-300',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Video indicator */}
              {listing.video_url && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Video
                </div>
              )}

              {/* Save button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full h-8 w-8"
                onClick={handleSaveClick}
              >
                <Heart className={cn('h-4 w-4', saved && 'fill-red-500 text-red-500')} />
              </Button>
            </div>

            {/* Content */}
            <CardContent className="flex-1 p-4 flex flex-col">
              <div className="flex-1">
                {/* Seller info */}
                {showSeller && listing.seller && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={listing.seller.profile_image || ''} />
                      <AvatarFallback>
                        {listing.seller.display_name?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {listing.seller.display_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {levelInfo.label}
                    </Badge>
                    {listing.seller.is_pro && (
                      <Badge className="bg-green-500 text-xs">PRO</Badge>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
                  {listing.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{listing.average_rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    ({listing.total_reviews})
                  </span>
                </div>

                {/* Features */}
                {listing.packages?.[0]?.features?.slice(0, 3).map((feature, i) => (
                  <div key={i} className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {deliveryDays} day{deliveryDays !== 1 ? 's' : ''} delivery
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Starting at</p>
                  <p className="text-lg font-bold">${startingPrice}</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/marketplace/${listing.slug}`}>
        {/* Image */}
        <div className="relative aspect-video bg-muted">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className={cn(
                'object-cover transition-all duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0',
                isHovered && 'scale-105'
              )}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Featured badge */}
          {listing.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500">
              Featured
            </Badge>
          )}

          {/* Video indicator */}
          {listing.video_url && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Play className="h-3 w-3" />
              Video
            </div>
          )}

          {/* Save button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full h-8 w-8',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              saved && 'opacity-100'
            )}
            onClick={handleSaveClick}
          >
            <Heart className={cn('h-4 w-4', saved && 'fill-red-500 text-red-500')} />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Seller info */}
          {showSeller && listing.seller && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={listing.seller.profile_image || ''} />
                <AvatarFallback>
                  {listing.seller.display_name?.[0] || 'S'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">
                {listing.seller.display_name}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {levelInfo.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Seller Level: {levelInfo.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{listing.average_rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground text-sm">
              ({listing.total_reviews})
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {deliveryDays}d
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-lg font-bold">${startingPrice}</p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
