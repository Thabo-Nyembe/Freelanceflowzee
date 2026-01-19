'use client';

/**
 * Service Marketplace Hooks - FreeFlow A+++ Implementation
 * Comprehensive hooks for Fiverr-style service marketplace
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

// Types
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  level: number;
  display_order: number;
  listing_count: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  subcategories?: ServiceCategory[];
}

export interface SellerProfile {
  id: string;
  user_id: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  profile_image: string | null;
  cover_image: string | null;
  languages: Array<{ code: string; name: string; level: string }>;
  skills: string[];
  level: 'new' | 'level_1' | 'level_2' | 'top_rated' | 'pro';
  level_progress: number;
  total_earnings: number;
  available_balance: number;
  pending_clearance: number;
  withdrawn_amount: number;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_rating: number;
  total_reviews: number;
  response_rate: number;
  response_time: number | null;
  on_time_delivery_rate: number;
  order_completion_rate: number;
  is_verified: boolean;
  is_pro: boolean;
  vacation_mode: boolean;
  vacation_message: string | null;
  portfolio_items: Array<{
    id: string;
    title: string;
    description: string;
    image_url: string;
    project_url?: string;
    category?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  joined_at: string;
  last_active_at: string | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string;
  };
}

export interface ServicePackage {
  name: 'Basic' | 'Standard' | 'Premium';
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  revisions: number | 'unlimited';
  features: string[];
}

export interface ServiceExtra {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_days_modifier: number;
}

export interface ServiceListing {
  id: string;
  seller_profile_id: string;
  user_id: string;
  category_id: string;
  subcategory_id: string | null;
  title: string;
  slug: string;
  description: string;
  search_tags: string[];
  images: string[];
  video_url: string | null;
  packages: ServicePackage[];
  extras: ServiceExtra[];
  requirements: Array<{
    id: string;
    question: string;
    type: 'text' | 'file' | 'choice';
    required: boolean;
    options?: string[];
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  status: 'draft' | 'pending_review' | 'active' | 'paused' | 'denied' | 'deleted';
  is_featured: boolean;
  total_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_rating: number;
  total_reviews: number;
  impressions: number;
  clicks: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  seller?: SellerProfile;
  category?: ServiceCategory;
}

export interface ServiceOrder {
  id: string;
  order_number: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  package_name: 'Basic' | 'Standard' | 'Premium';
  package_price: number;
  package_details: ServicePackage;
  extras: ServiceExtra[];
  extras_total: number;
  quantity: number;
  subtotal: number;
  service_fee: number;
  service_fee_rate: number;
  total: number;
  currency: string;
  delivery_days: number;
  original_due_date: string;
  current_due_date: string;
  revisions_allowed: number;
  revisions_used: number;
  status:
    | 'pending'
    | 'requirements_submitted'
    | 'in_progress'
    | 'delivered'
    | 'revision_requested'
    | 'completed'
    | 'cancelled'
    | 'disputed'
    | 'refunded';
  payment_status: 'pending' | 'held' | 'released' | 'refunded' | 'partially_refunded';
  requirements_answers: Record<string, unknown>;
  requirements_files: string[];
  requirements_submitted: boolean;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  started_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  paid_at: string | null;
  released_at: string | null;
  auto_complete_at: string | null;
  created_at: string;
  updated_at: string;
  listing?: ServiceListing;
  buyer?: { id: string; name: string; email: string; avatar_url: string };
  seller?: { id: string; name: string; email: string; avatar_url: string };
  seller_profile?: SellerProfile;
  deliveries?: OrderDelivery[];
  messages?: OrderMessage[];
}

export interface OrderDelivery {
  id: string;
  order_id: string;
  message: string;
  files: string[];
  delivery_number: number;
  is_revision: boolean;
  status: 'pending' | 'accepted' | 'revision_requested';
  revision_notes: string | null;
  revision_requested_at: string | null;
  auto_accept_at: string;
  created_at: string;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  attachments: string[];
  is_system_message: boolean;
  created_at: string;
}

export interface ServiceReview {
  id: string;
  order_id: string;
  listing_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  communication_rating: number;
  service_rating: number;
  recommendation_rating: number;
  review_text: string | null;
  seller_response: string | null;
  seller_responded_at: string | null;
  is_public: boolean;
  created_at: string;
  reviewer?: { id: string; name: string; avatar_url: string };
}

// Search filters
export interface MarketplaceSearchFilters {
  query?: string;
  category_id?: string;
  subcategory_id?: string;
  min_price?: number;
  max_price?: number;
  delivery_days?: number;
  seller_level?: SellerProfile['level'];
  min_rating?: number;
  pro_only?: boolean;
  sort_by?: 'relevance' | 'best_selling' | 'price_low' | 'price_high' | 'top_rated' | 'newest';
  page?: number;
  limit?: number;
}

// Constants
export const SELLER_LEVELS = {
  new: { label: 'New Seller', color: 'gray' },
  level_1: { label: 'Level 1', color: 'blue' },
  level_2: { label: 'Level 2', color: 'purple' },
  top_rated: { label: 'Top Rated', color: 'orange' },
  pro: { label: 'Pro', color: 'green' },
} as const;

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  requirements_submitted: { label: 'Requirements Submitted', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'purple' },
  delivered: { label: 'Delivered', color: 'cyan' },
  revision_requested: { label: 'Revision Requested', color: 'orange' },
  completed: { label: 'Completed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
  disputed: { label: 'Disputed', color: 'red' },
  refunded: { label: 'Refunded', color: 'gray' },
} as const;

// ============ CATEGORIES HOOK ============
export function useServiceCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Build hierarchy
      const rootCategories = (data || []).filter(c => !c.parent_id);
      const withSubcategories = rootCategories.map(parent => ({
        ...parent,
        subcategories: (data || []).filter(c => c.parent_id === parent.id),
      }));

      setCategories(withSubcategories);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { categories, isLoading, error, refresh: fetch };
}

// ============ MARKETPLACE SEARCH HOOK ============
export function useMarketplaceSearch(filters: MarketplaceSearchFilters = {}) {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (searchFilters: MarketplaceSearchFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();

      if (searchFilters.query) params.set('q', searchFilters.query);
      if (searchFilters.category_id) params.set('category', searchFilters.category_id);
      if (searchFilters.subcategory_id) params.set('subcategory', searchFilters.subcategory_id);
      if (searchFilters.min_price) params.set('min_price', String(searchFilters.min_price));
      if (searchFilters.max_price) params.set('max_price', String(searchFilters.max_price));
      if (searchFilters.delivery_days) params.set('delivery_days', String(searchFilters.delivery_days));
      if (searchFilters.seller_level) params.set('seller_level', searchFilters.seller_level);
      if (searchFilters.min_rating) params.set('min_rating', String(searchFilters.min_rating));
      if (searchFilters.pro_only) params.set('pro_only', 'true');
      if (searchFilters.sort_by) params.set('sort', searchFilters.sort_by);
      if (searchFilters.page) params.set('page', String(searchFilters.page));
      if (searchFilters.limit) params.set('limit', String(searchFilters.limit));

      const response = await fetch(`/api/marketplace/search?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Search failed');

      setListings(result.listings || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { search(filters); }, [
    filters.query,
    filters.category_id,
    filters.subcategory_id,
    filters.min_price,
    filters.max_price,
    filters.delivery_days,
    filters.seller_level,
    filters.min_rating,
    filters.pro_only,
    filters.sort_by,
    filters.page,
    filters.limit,
    search,
  ]);

  return { listings, pagination, isLoading, error, search };
}

// ============ SINGLE LISTING HOOK ============
export function useServiceListing(idOrSlug?: string) {
  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!idOrSlug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const params = new URLSearchParams();
      params.set(isUUID ? 'id' : 'slug', idOrSlug);

      const response = await window.fetch(`/api/marketplace/listings?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch listing');

      setListing(result.listing);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch listing'));
    } finally {
      setIsLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => { fetch(); }, [fetch]);

  return { listing, isLoading, error, refresh: fetch };
}

// ============ MY LISTINGS HOOK ============
export function useMyListings(options?: { status?: ServiceListing['status'] }) {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.status) params.set('status', options.status);

      const response = await window.fetch(`/api/marketplace/listings?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch listings');

      setListings(result.listings || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch listings'));
    } finally {
      setIsLoading(false);
    }
  }, [options?.status]);

  useEffect(() => { fetch(); }, [fetch]);

  return { listings, isLoading, error, refresh: fetch };
}

// ============ LISTING MUTATIONS HOOK ============
export function useListingMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createListing = useCallback(async (data: Partial<ServiceListing>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create listing');
      return result.listing;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create listing');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateListing = useCallback(async (id: string, data: Partial<ServiceListing>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch('/api/marketplace/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update listing');
      return result.listing;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update listing');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateListingStatus = useCallback(async (id: string, status: ServiceListing['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch('/api/marketplace/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update status');
      return result.listing;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update status');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteListing = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch(`/api/marketplace/listings?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete listing');
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete listing');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createListing,
    updateListing,
    updateListingStatus,
    deleteListing,
    isLoading,
    error,
  };
}

// ============ ORDERS HOOK ============
export function useServiceOrders(options?: {
  role?: 'buyer' | 'seller';
  status?: 'active' | 'completed' | 'cancelled' | ServiceOrder['status'];
  page?: number;
  limit?: number;
}) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.role) params.set('role', options.role);
      if (options?.status) params.set('status', options.status);
      if (options?.page) params.set('page', String(options.page));
      if (options?.limit) params.set('limit', String(options.limit));

      const response = await window.fetch(`/api/marketplace/orders?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch orders');

      setOrders(result.orders || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setIsLoading(false);
    }
  }, [options?.role, options?.status, options?.page, options?.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, pagination, isLoading, error, refresh: fetch };
}

// ============ SINGLE ORDER HOOK ============
export function useServiceOrder(orderId?: string) {
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch(`/api/marketplace/orders?id=${orderId}`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Failed to fetch order');

      setOrder(result.order);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { order, isLoading, error, refresh: fetch };
}

// ============ ORDER MUTATIONS HOOK ============
export function useOrderMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createOrder = useCallback(async (data: {
    listing_id: string;
    package_name: 'Basic' | 'Standard' | 'Premium';
    extras?: string[];
    quantity?: number;
    requirements_answers?: Record<string, unknown>;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create order');
      return result.order;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create order');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitRequirements = useCallback(async (orderId: string, answers: Record<string, unknown>, files?: string[]) => {
    return performOrderAction(orderId, 'submit_requirements', { answers, files });
  }, []);

  const startWork = useCallback(async (orderId: string) => {
    return performOrderAction(orderId, 'start_work');
  }, []);

  const deliverOrder = useCallback(async (orderId: string, message: string, files?: string[]) => {
    return performOrderAction(orderId, 'deliver', { message, files });
  }, []);

  const requestRevision = useCallback(async (orderId: string, notes: string) => {
    return performOrderAction(orderId, 'request_revision', { notes });
  }, []);

  const acceptDelivery = useCallback(async (orderId: string) => {
    return performOrderAction(orderId, 'accept_delivery');
  }, []);

  const requestCancellation = useCallback(async (orderId: string, reason: string) => {
    return performOrderAction(orderId, 'request_cancellation', { reason });
  }, []);

  const approveCancellation = useCallback(async (orderId: string) => {
    return performOrderAction(orderId, 'approve_cancellation');
  }, []);

  const rejectCancellation = useCallback(async (orderId: string) => {
    return performOrderAction(orderId, 'reject_cancellation');
  }, []);

  const performOrderAction = async (orderId: string, action: string, data?: unknown) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.fetch('/api/marketplace/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, action, data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Action failed');
      return result.order;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Action failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    submitRequirements,
    startWork,
    deliverOrder,
    requestRevision,
    acceptDelivery,
    requestCancellation,
    approveCancellation,
    rejectCancellation,
    isLoading,
    error,
  };
}

// ============ SELLER PROFILE HOOK ============
export function useSellerProfile(userId?: string) {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      // Fetch current user's profile
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('seller_profiles')
          .select('*, user:users(*)')
          .eq('user_id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fetch specific user's profile
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('seller_profiles')
          .select('*, user:users(*)')
          .eq('user_id', userId)
          .single();

        if (fetchError) throw fetchError;
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateProfile = useCallback(async (data: Partial<SellerProfile>) => {
    if (!profile) return;

    try {
      const supabase = createClient();
      const { data: updated, error: updateError } = await supabase
        .from('seller_profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(updated);
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update profile');
    }
  }, [profile]);

  return { profile, isLoading, error, refresh: fetch, updateProfile };
}

// ============ LISTING REVIEWS HOOK ============
export function useListingReviews(listingId?: string) {
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!listingId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('service_reviews')
        .select('*, reviewer:users!reviewer_id(id, name, avatar_url)')
        .eq('listing_id', listingId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReviews(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const total = data.length;
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach(r => {
          const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
          if (rating >= 1 && rating <= 5) breakdown[rating]++;
        });
        setStats({
          average: sum / total,
          total,
          breakdown,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { reviews, stats, isLoading, error, refresh: fetch };
}

// ============ SAVED LISTINGS HOOK ============
export function useSavedListings() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('saved_listings')
        .select('listing_id, listing:service_listings(*)')
        .eq('user_id', user.id);

      if (data) {
        setSavedIds(new Set(data.map(d => d.listing_id)));
        setListings(data.map(d => d.listing).filter(Boolean));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleSave = useCallback(async (listingId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    if (savedIds.has(listingId)) {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
      setListings(prev => prev.filter(l => l.id !== listingId));
    } else {
      await supabase
        .from('saved_listings')
        .insert({ user_id: user.id, listing_id: listingId });

      setSavedIds(prev => new Set([...prev, listingId]));
      // Fetch the listing to add to saved listings
      const { data: listing } = await supabase
        .from('service_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listing) {
        setListings(prev => [...prev, listing]);
      }
    }
  }, [savedIds]);

  const isSaved = useCallback((listingId: string) => savedIds.has(listingId), [savedIds]);

  return { listings, savedIds, isLoading, toggleSave, isSaved, refresh: fetch };
}

// ============ SELLER STATS HOOK ============
export function useSellerStats() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingClearance: 0,
    availableBalance: 0,
    activeOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    totalReviews: 0,
    responseRate: 0,
    onTimeDelivery: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get seller profile stats
      const { data: profile } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get active orders count
      const { count: activeCount } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .in('status', ['pending', 'requirements_submitted', 'in_progress', 'delivered', 'revision_requested']);

      if (profile) {
        setStats({
          totalEarnings: profile.total_earnings || 0,
          pendingClearance: profile.pending_clearance || 0,
          availableBalance: profile.available_balance || 0,
          activeOrders: activeCount || 0,
          completedOrders: profile.completed_orders || 0,
          averageRating: profile.average_rating || 0,
          totalReviews: profile.total_reviews || 0,
          responseRate: profile.response_rate || 0,
          onTimeDelivery: profile.on_time_delivery_rate || 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, isLoading, refresh: fetch };
}

// ============ BUYER STATS HOOK ============
export function useBuyerStats() {
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    savedListings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      // Get active orders count
      const { count: activeCount } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
        .in('status', ['pending', 'requirements_submitted', 'in_progress', 'delivered', 'revision_requested']);

      // Get completed orders with total spent
      const { data: completedOrders } = await supabase
        .from('service_orders')
        .select('total')
        .eq('buyer_id', user.id)
        .eq('status', 'completed');

      // Get saved listings count
      const { count: savedCount } = await supabase
        .from('saved_listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const totalSpent = completedOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      setStats({
        activeOrders: activeCount || 0,
        completedOrders: completedOrders?.length || 0,
        totalSpent,
        savedListings: savedCount || 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { stats, isLoading, refresh: fetch };
}
