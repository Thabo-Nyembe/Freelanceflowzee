'use client';

/**
 * Create New Listing Page - FreeFlow A+++ Implementation
 * Create a new service listing/gig
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/marketplace';
import { useListingMutations } from '@/lib/hooks/use-service-marketplace';
import { toast } from 'sonner';

export default function NewListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createListing } = useListingMutations();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const listing = await createListing(data);
      toast.success('Gig created successfully!');
      router.push(`/seller/listings/${listing.id}`);
    } catch (error) {
      toast.error('Failed to create gig. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Gig</h1>
        <p className="text-muted-foreground">
          Set up your service and start getting orders
        </p>
      </div>

      <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
