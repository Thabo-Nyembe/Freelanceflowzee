'use client';

/**
 * Listing Detail - FreeFlow A+++ Implementation
 * Full service listing view with gallery, description, reviews
 */

import { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  Clock,
  RotateCcw,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Play,
  Check,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PackageSelector } from './package-selector';
import { SellerProfileCard } from './seller-profile-card';
import { ReviewList } from './review-list';
import {
  ServiceListing,
  useOrderMutations,
  useSavedListings,
  useListingReviews,
} from '@/lib/hooks/use-service-marketplace';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ListingDetailProps {
  listing: ServiceListing;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const { isSaved, toggleSave } = useSavedListings();
  const { createOrder, isLoading: isOrdering } = useOrderMutations();
  const { reviews, stats, isLoading: reviewsLoading } = useListingReviews(listing.id);

  const images = listing.images || [];
  const saved = isSaved(listing.id);

  // Navigation
  const goToPrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle order
  const handleOrder = async (orderData: {
    package_name: 'Basic' | 'Standard' | 'Premium';
    extras: string[];
    quantity: number;
  }) => {
    try {
      const order = await createOrder({
        listing_id: listing.id,
        ...orderData,
      });
      toast.success('Order created successfully!');
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error('Failed to create order. Please try again.');
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      await toggleSave(listing.id);
      toast.success(saved ? 'Removed from saved' : 'Added to saved');
    } catch {
      toast.error('Failed to save listing');
    }
  };

  // Share
  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Gallery */}
        <div className="space-y-2">
          {/* Main Image */}
          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogTrigger asChild>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer group">
                {images[currentImageIndex] ? (
                  <Image
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}

                {/* Video indicator */}
                {listing.video_url && currentImageIndex === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-8 w-8 text-black ml-1" />
                    </div>
                  </div>
                )}

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); goToPrevImage(); }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); goToNextImage(); }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-4xl p-0">
              <div className="relative aspect-video">
                {images[currentImageIndex] && (
                  <Image
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    fill
                    className="object-contain"
                  />
                )}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full"
                      onClick={goToPrevImage}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full"
                      onClick={goToNextImage}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={cn(
                    'relative w-20 h-14 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors',
                    i === currentImageIndex ? 'border-primary' : 'border-transparent'
                  )}
                  onClick={() => setCurrentImageIndex(i)}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title & Actions */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleSave}>
              <Heart className={cn('h-4 w-4', saved && 'fill-red-500 text-red-500')} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{listing.average_rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({listing.total_reviews} reviews)</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{listing.total_orders} orders</span>
          {listing.is_featured && (
            <>
              <span className="text-muted-foreground">•</span>
              <Badge className="bg-yellow-500">Featured</Badge>
            </>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({listing.total_reviews})</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{listing.description}</div>
            </div>

            {/* Tags */}
            {listing.search_tags && listing.search_tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.search_tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewList
              reviews={reviews}
              stats={stats}
              isLoading={reviewsLoading}
            />
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            {listing.faqs && listing.faqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {listing.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No FAQs available for this service.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Package Selector */}
        <PackageSelector
          listing={listing}
          onOrder={handleOrder}
          isOrdering={isOrdering}
        />

        {/* Seller Card */}
        {listing.seller && (
          <SellerProfileCard
            seller={listing.seller}
            variant="compact"
            onContact={() => {
              // Navigate to messages with pre-filled recipient and subject
              router.push(`/dashboard/messages-v2?recipient=${listing.seller?.id}&subject=${encodeURIComponent(`Inquiry about: ${listing.title}`)}`);
              toast.success('Opening conversation with seller');
            }}
          />
        )}
      </div>
    </div>
  );
}
