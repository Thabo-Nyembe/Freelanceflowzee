/**
 * Marketplace Listings API - FreeFlow A+++ Implementation
 * Full CRUD for service listings (gigs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
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

const logger = createSimpleLogger('marketplace-listings');

const packageSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().min(5),
  delivery_days: z.number().min(1),
  revisions: z.union([z.number(), z.literal('unlimited')]),
  features: z.array(z.string()),
});

const extraSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().min(0),
  delivery_days_modifier: z.number().optional(),
});

const requirementSchema = z.object({
  question: z.string(),
  type: z.enum(['text', 'textarea', 'file', 'multiple_choice']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

const createListingSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(100).max(5000),
  category_id: z.string().uuid(),
  subcategory_id: z.string().uuid().optional(),
  tags: z.array(z.string()).max(5).optional(),
  images: z.array(z.string()).min(1).max(5),
  video_url: z.string().url().optional(),
  packages: z.array(packageSchema).min(1).max(3),
  extras: z.array(extraSchema).optional(),
  requirements: z.array(requirementSchema).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  max_concurrent_orders: z.number().min(1).max(20).optional(),
});

const updateListingSchema = createListingSchema.partial();

// GET - List user's listings or search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const myListings = searchParams.get('my') === 'true';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (myListings) {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      let query = supabase
        .from('service_listings')
        .select(`
          *,
          category:service_categories!category_id (id, name, slug),
          subcategory:service_categories!subcategory_id (id, name, slug)
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        listings: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }

    // Public listing view (single)
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id || slug) {
      let query = supabase
        .from('service_listings')
        .select(`
          *,
          category:service_categories!category_id (id, name, slug, icon),
          subcategory:service_categories!subcategory_id (id, name, slug),
          seller:seller_profiles!seller_profile_id (
            id, display_name, tagline, profile_image, level, rating, reviews_count,
            orders_completed, response_time_hours, on_time_delivery_rate
          )
        `);

      if (id) {
        query = query.eq('id', id);
      } else {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();

      if (error) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      // Only show active listings to public
      if (data.status !== 'active') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.id !== data.user_id) {
          return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }
      }

      // Increment view count (don't await)
      supabase.rpc('increment_listing_impressions', {
        listing_ids: [data.id]
      });

      return NextResponse.json({ listing: data });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    logger.error('Listings GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new listing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createListingSchema.parse(body);

    // Check/create seller profile
    let { data: sellerProfile } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!sellerProfile) {
      // Create seller profile
      const { data: userData } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();

      const { data: newProfile, error: profileError } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: user.id,
          display_name: userData?.name || user.email?.split('@')[0] || 'Seller',
        })
        .select('id')
        .single();

      if (profileError) {
        return NextResponse.json({ error: 'Failed to create seller profile' }, { status: 500 });
      }

      sellerProfile = newProfile;
    }

    // Create listing
    const { data: listing, error } = await supabase
      .from('service_listings')
      .insert({
        user_id: user.id,
        seller_profile_id: sellerProfile.id,
        ...validatedData,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      logger.error('Create listing error', { error });
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
    }

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Listings POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update listing
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    const validatedUpdates = updateListingSchema.parse(updates);

    // Verify ownership
    const { data: existing } = await supabase
      .from('service_listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const { data: listing, error } = await supabase
      .from('service_listings')
      .update({
        ...validatedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Listings PUT error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update listing status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    const validStatuses = ['draft', 'pending_review', 'active', 'paused', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('service_listings')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Status transitions
    if (status === 'active' && existing.status === 'draft') {
      // Require review first in production
      // For now, auto-approve
    }

    const { data: listing, error } = await supabase
      .from('service_listings')
      .update({
        status,
        approved_at: status === 'active' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    logger.error('Listings PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete listing
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Listing ID required' }, { status: 400 });
    }

    // Verify ownership and no active orders
    const { data: existing } = await supabase
      .from('service_listings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Check for active orders
    const { data: activeOrders } = await supabase
      .from('service_orders')
      .select('id')
      .eq('listing_id', id)
      .in('status', ['pending', 'requirements_submitted', 'in_progress', 'delivered', 'revision_requested'])
      .limit(1);

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete listing with active orders' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('service_listings')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Listings DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
