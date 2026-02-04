/**
 * Marketplace Search API - FreeFlow A+++ Implementation
 * Full-text search with filters and sorting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('marketplace-search');

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Search parameters
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const deliveryTime = searchParams.get('delivery_time');
    const sellerLevel = searchParams.get('seller_level');
    const minRating = searchParams.get('min_rating');
    const sortBy = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Build query
    let dbQuery = supabase
      .from('service_listings')
      .select(`
        id,
        title,
        slug,
        description,
        images,
        packages,
        tags,
        average_rating,
        total_reviews,
        orders_completed,
        category:service_categories!category_id (id, name, slug, icon),
        subcategory:service_categories!subcategory_id (id, name, slug),
        seller:seller_profiles!seller_profile_id (
          id,
          display_name,
          profile_image,
          level,
          rating,
          reviews_count,
          on_time_delivery_rate,
          country:users!user_id(country)
        )
      `, { count: 'exact' })
      .eq('status', 'active');

    // Full-text search
    if (query && query.trim()) {
      dbQuery = dbQuery.textSearch('search_vector', query, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Category filter
    if (category) {
      // Get category by slug
      const { data: cat } = await supabase
        .from('service_categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (cat) {
        // Include subcategories
        const { data: subcats } = await supabase
          .from('service_categories')
          .select('id')
          .eq('parent_id', cat.id);

        const categoryIds = [cat.id, ...(subcats?.map(s => s.id) || [])];
        dbQuery = dbQuery.or(`category_id.in.(${categoryIds.join(',')}),subcategory_id.in.(${categoryIds.join(',')})`);
      }
    }

    // Subcategory filter
    if (subcategory) {
      const { data: subcat } = await supabase
        .from('service_categories')
        .select('id')
        .eq('slug', subcategory)
        .single();

      if (subcat) {
        dbQuery = dbQuery.eq('subcategory_id', subcat.id);
      }
    }

    // Seller level filter
    if (sellerLevel) {
      const levels = sellerLevel.split(',');
      // This requires a subquery or join - for now filter in application
    }

    // Rating filter
    if (minRating) {
      dbQuery = dbQuery.gte('average_rating', parseFloat(minRating));
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        // Sort by first package price (basic)
        dbQuery = dbQuery.order('packages->0->price', { ascending: true, nullsFirst: false });
        break;
      case 'price_high':
        dbQuery = dbQuery.order('packages->0->price', { ascending: false, nullsFirst: false });
        break;
      case 'rating':
        dbQuery = dbQuery
          .order('average_rating', { ascending: false })
          .order('total_reviews', { ascending: false });
        break;
      case 'orders':
        dbQuery = dbQuery.order('orders_completed', { ascending: false });
        break;
      case 'newest':
        dbQuery = dbQuery.order('created_at', { ascending: false });
        break;
      case 'relevance':
      default:
        // If no search query, sort by a combination
        if (!query) {
          dbQuery = dbQuery
            .order('orders_completed', { ascending: false })
            .order('average_rating', { ascending: false });
        }
        break;
    }

    // Pagination
    const from = (page - 1) * limit;
    dbQuery = dbQuery.range(from, from + limit - 1);

    const { data: listings, error, count } = await dbQuery;

    if (error) {
      logger.error('Search error', { error });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Post-process filtering (for JSON field filters)
    let filteredListings = listings || [];

    // Price filter
    if (minPrice || maxPrice) {
      filteredListings = filteredListings.filter((listing: any) => {
        const basicPrice = listing.packages?.[0]?.price;
        if (!basicPrice) return false;
        if (minPrice && basicPrice < parseFloat(minPrice)) return false;
        if (maxPrice && basicPrice > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // Delivery time filter
    if (deliveryTime) {
      const maxDays = parseInt(deliveryTime);
      filteredListings = filteredListings.filter((listing: any) => {
        const basicDelivery = listing.packages?.[0]?.delivery_days;
        return basicDelivery && basicDelivery <= maxDays;
      });
    }

    // Seller level filter (post-process)
    if (sellerLevel) {
      const levels = sellerLevel.split(',');
      filteredListings = filteredListings.filter((listing: any) =>
        listing.seller && levels.includes(listing.seller.level)
      );
    }

    // Track impressions (non-blocking)
    if (filteredListings.length > 0) {
      supabase.rpc('increment_listing_impressions', {
        listing_ids: filteredListings.map((l: any) => l.id),
      });
    }

    // Transform for response
    const transformedListings = filteredListings.map((listing: any) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      thumbnail: listing.images?.[0],
      starting_price: listing.packages?.[0]?.price,
      delivery_days: listing.packages?.[0]?.delivery_days,
      rating: listing.average_rating,
      reviews_count: listing.total_reviews,
      orders_completed: listing.orders_completed,
      category: listing.category,
      seller: listing.seller ? {
        id: listing.seller.id,
        name: listing.seller.display_name,
        avatar: listing.seller.profile_image,
        level: listing.seller.level,
        rating: listing.seller.rating,
      } : null,
    }));

    return NextResponse.json({
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total: count || filteredListings.length,
        totalPages: Math.ceil((count || filteredListings.length) / limit),
      },
      filters: {
        query,
        category,
        subcategory,
        minPrice,
        maxPrice,
        deliveryTime,
        sellerLevel,
        minRating,
        sortBy,
      },
    });
  } catch (error) {
    logger.error('Search error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
