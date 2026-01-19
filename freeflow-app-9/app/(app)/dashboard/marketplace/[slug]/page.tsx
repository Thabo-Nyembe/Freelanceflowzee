/**
 * Listing Detail Page - FreeFlow A+++ Implementation
 * View full service listing details
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ListingDetail } from '@/components/marketplace';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from('service_listings')
    .select('title, description')
    .eq('slug', slug)
    .single();

  if (!listing) {
    return {
      title: 'Service Not Found | FreeFlow',
    };
  }

  return {
    title: `${listing.title} | FreeFlow Marketplace`,
    description: listing.description?.substring(0, 160),
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch listing with seller info
  const { data: listing, error } = await supabase
    .from('service_listings')
    .select(`
      *,
      seller:seller_profiles!seller_profile_id (
        *,
        user:users(id, name, email, avatar_url)
      ),
      category:service_categories!category_id (*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !listing) {
    notFound();
  }

  // Track impression
  await supabase
    .from('service_listings')
    .update({ impressions: (listing.impressions || 0) + 1 })
    .eq('id', listing.id);

  return (
    <div className="container py-6">
      <ListingDetail listing={listing} />
    </div>
  );
}
