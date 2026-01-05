'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'archived'
export type ListingType = 'product' | 'service' | 'digital' | 'subscription'
export type ListingCategory = 'software' | 'design' | 'marketing' | 'development' | 'consulting' | 'other'

export interface MarketplaceListing {
  id: string
  title: string
  description: string
  shortDescription?: string
  type: ListingType
  category: ListingCategory
  status: ListingStatus
  price: number
  currency: string
  pricingModel: 'one_time' | 'subscription' | 'custom'
  subscriptionInterval?: 'monthly' | 'yearly'
  images: ListingImage[]
  features: string[]
  tags: string[]
  sellerId: string
  sellerName: string
  sellerAvatar?: string
  sellerRating: number
  rating: number
  reviewCount: number
  salesCount: number
  viewCount: number
  isFeatured: boolean
  deliveryTime?: string
  requirements?: string
  faqs: ListingFAQ[]
  createdAt: string
  updatedAt: string
}

export interface ListingImage {
  id: string
  url: string
  thumbnailUrl?: string
  alt?: string
  order: number
}

export interface ListingFAQ {
  question: string
  answer: string
}

export interface MarketplaceReview {
  id: string
  listingId: string
  buyerId: string
  buyerName: string
  buyerAvatar?: string
  rating: number
  title?: string
  content: string
  response?: string
  respondedAt?: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
}

export interface MarketplaceOrder {
  id: string
  listingId: string
  listingTitle: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  status: 'pending' | 'paid' | 'processing' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
  amount: number
  currency: string
  paymentMethod?: string
  deliveredAt?: string
  completedAt?: string
  createdAt: string
}

export interface MarketplaceStats {
  totalListings: number
  activeListings: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  pendingOrders: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockListings: MarketplaceListing[] = [
  { id: 'listing-1', title: 'Professional Website Template', description: 'A modern, responsive website template perfect for businesses and portfolios.', shortDescription: 'Modern responsive website template', type: 'digital', category: 'design', status: 'active', price: 49, currency: 'USD', pricingModel: 'one_time', images: [{ id: 'img-1', url: '/marketplace/template1.jpg', order: 1 }], features: ['Fully Responsive', 'Dark/Light Mode', 'SEO Optimized', '24/7 Support'], tags: ['template', 'website', 'responsive'], sellerId: 'user-2', sellerName: 'Sarah Miller', sellerRating: 4.8, rating: 4.7, reviewCount: 128, salesCount: 450, viewCount: 12500, isFeatured: true, deliveryTime: 'Instant', faqs: [{ question: 'Is this template customizable?', answer: 'Yes, fully customizable with included documentation.' }], createdAt: '2024-01-15', updatedAt: '2024-03-10' },
  { id: 'listing-2', title: 'SEO Consulting Package', description: 'Complete SEO audit and optimization for your website.', type: 'service', category: 'marketing', status: 'active', price: 299, currency: 'USD', pricingModel: 'one_time', images: [{ id: 'img-2', url: '/marketplace/seo.jpg', order: 1 }], features: ['Full Site Audit', 'Keyword Research', 'Competitor Analysis', 'Monthly Report'], tags: ['seo', 'marketing', 'consulting'], sellerId: 'user-1', sellerName: 'Alex Chen', sellerRating: 4.9, rating: 4.9, reviewCount: 45, salesCount: 89, viewCount: 3200, isFeatured: false, deliveryTime: '7 days', requirements: 'Access to Google Analytics', faqs: [], createdAt: '2024-02-01', updatedAt: '2024-03-15' },
  { id: 'listing-3', title: 'SaaS Analytics Dashboard', description: 'Subscription-based analytics dashboard for your SaaS business.', type: 'subscription', category: 'software', status: 'active', price: 29, currency: 'USD', pricingModel: 'subscription', subscriptionInterval: 'monthly', images: [{ id: 'img-3', url: '/marketplace/analytics.jpg', order: 1 }], features: ['Real-time Analytics', 'Custom Reports', 'API Access', 'Priority Support'], tags: ['saas', 'analytics', 'dashboard'], sellerId: 'user-1', sellerName: 'Alex Chen', sellerRating: 4.9, rating: 4.6, reviewCount: 67, salesCount: 234, viewCount: 8900, isFeatured: true, faqs: [], createdAt: '2024-01-20', updatedAt: '2024-03-18' }
]

const mockReviews: MarketplaceReview[] = [
  { id: 'review-1', listingId: 'listing-1', buyerId: 'user-3', buyerName: 'Mike Johnson', rating: 5, title: 'Excellent template!', content: 'Very well designed and easy to customize. Great support too!', isVerifiedPurchase: true, helpfulCount: 12, createdAt: '2024-03-15' },
  { id: 'review-2', listingId: 'listing-1', buyerId: 'user-4', buyerName: 'Emily Davis', rating: 4, content: 'Good quality template, just needed minor adjustments.', isVerifiedPurchase: true, helpfulCount: 5, createdAt: '2024-03-10' }
]

const mockOrders: MarketplaceOrder[] = [
  { id: 'order-1', listingId: 'listing-1', listingTitle: 'Professional Website Template', buyerId: 'user-3', buyerName: 'Mike Johnson', sellerId: 'user-2', sellerName: 'Sarah Miller', status: 'completed', amount: 49, currency: 'USD', paymentMethod: 'card', deliveredAt: '2024-03-15T10:00:00Z', completedAt: '2024-03-15T10:00:00Z', createdAt: '2024-03-15' },
  { id: 'order-2', listingId: 'listing-2', listingTitle: 'SEO Consulting Package', buyerId: 'user-4', buyerName: 'Emily Davis', sellerId: 'user-1', sellerName: 'Alex Chen', status: 'processing', amount: 299, currency: 'USD', paymentMethod: 'card', createdAt: '2024-03-18' }
]

const mockStats: MarketplaceStats = {
  totalListings: 15,
  activeListings: 12,
  totalSales: 773,
  totalRevenue: 45680,
  averageRating: 4.7,
  pendingOrders: 3
}

// ============================================================================
// HOOK
// ============================================================================

interface UseMarketplaceOptions {
  
  sellerId?: string
  category?: ListingCategory
}

export function useMarketplace(options: UseMarketplaceOptions = {}) {
  const {  sellerId, category } = options

  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [reviews, setReviews] = useState<MarketplaceReview[]>([])
  const [orders, setOrders] = useState<MarketplaceOrder[]>([])
  const [currentListing, setCurrentListing] = useState<MarketplaceListing | null>(null)
  const [stats, setStats] = useState<MarketplaceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchMarketplace = useCallback(async (filters?: { category?: string; type?: string; search?: string; minPrice?: number; maxPrice?: number }) => {
    try {
      const params = new URLSearchParams()
      if (sellerId) params.set('sellerId', sellerId)
      if (filters?.category || category) params.set('category', filters?.category || category || '')
      if (filters?.type) params.set('type', filters.type)
      if (filters?.search) params.set('search', filters.search)
      if (filters?.minPrice) params.set('minPrice', filters.minPrice.toString())
      if (filters?.maxPrice) params.set('maxPrice', filters.maxPrice.toString())

      const response = await fetch(`/api/marketplace?${params}`)
      const result = await response.json()
      if (result.success) {
        setListings(Array.isArray(result.listings) ? result.listings : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.listings
      }
      setListings(mockListings)
      setStats(null)
      return []
    } catch (err) {
      setListings(mockListings)
      setReviews(mockReviews)
      setOrders([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ sellerId, category])

  const createListing = useCallback(async (data: Partial<MarketplaceListing>) => {
    const newListing: MarketplaceListing = {
      id: `listing-${Date.now()}`,
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'product',
      category: data.category || 'other',
      status: 'draft',
      price: data.price || 0,
      currency: data.currency || 'USD',
      pricingModel: data.pricingModel || 'one_time',
      images: data.images || [],
      features: data.features || [],
      tags: data.tags || [],
      sellerId: 'user-1',
      sellerName: 'You',
      sellerRating: 0,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      viewCount: 0,
      isFeatured: false,
      faqs: data.faqs || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as MarketplaceListing
    setListings(prev => [newListing, ...prev])
    return { success: true, listing: newListing }
  }, [])

  const updateListing = useCallback(async (listingId: string, updates: Partial<MarketplaceListing>) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    return { success: true }
  }, [])

  const deleteListing = useCallback(async (listingId: string) => {
    setListings(prev => prev.filter(l => l.id !== listingId))
    return { success: true }
  }, [])

  const publishListing = useCallback(async (listingId: string) => {
    return updateListing(listingId, { status: 'active' })
  }, [updateListing])

  const archiveListing = useCallback(async (listingId: string) => {
    return updateListing(listingId, { status: 'archived' })
  }, [updateListing])

  const duplicateListing = useCallback(async (listingId: string) => {
    const original = listings.find(l => l.id === listingId)
    if (!original) return { success: false, error: 'Listing not found' }

    const duplicate: MarketplaceListing = {
      ...original,
      id: `listing-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: 'draft',
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      viewCount: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setListings(prev => [duplicate, ...prev])
    return { success: true, listing: duplicate }
  }, [listings])

  const addImage = useCallback(async (listingId: string, file: File): Promise<ListingImage> => {
    const image: ListingImage = {
      id: `img-${Date.now()}`,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      order: listings.find(l => l.id === listingId)?.images.length || 0
    }
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, images: [...l.images, image] } : l))
    return image
  }, [listings])

  const removeImage = useCallback(async (listingId: string, imageId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, images: l.images.filter(i => i.id !== imageId) } : l))
    return { success: true }
  }, [])

  const reorderImages = useCallback(async (listingId: string, imageIds: string[]) => {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) return { success: false }

    const reordered = imageIds.map((id, index) => {
      const image = listing.images.find(i => i.id === id)
      return image ? { ...image, order: index } : null
    }).filter(Boolean) as ListingImage[]

    return updateListing(listingId, { images: reordered })
  }, [listings, updateListing])

  const fetchReviews = useCallback(async (listingId: string) => {
    try {
      const response = await fetch(`/api/marketplace/listings/${listingId}/reviews`)
      const result = await response.json()
      if (result.success) {
        setReviews(result.reviews || [])
        return result.reviews
      }
      return []
    } catch (err) {
      return [].filter(r => r.listingId === listingId)
    }
  }, [])

  const addReview = useCallback(async (listingId: string, data: { rating: number; title?: string; content: string }) => {
    const newReview: MarketplaceReview = {
      id: `review-${Date.now()}`,
      listingId,
      buyerId: 'user-1',
      buyerName: 'You',
      rating: data.rating,
      title: data.title,
      content: data.content,
      isVerifiedPurchase: true,
      helpfulCount: 0,
      createdAt: new Date().toISOString()
    }
    setReviews(prev => [newReview, ...prev])

    // Update listing rating
    const listing = listings.find(l => l.id === listingId)
    if (listing) {
      const newReviewCount = listing.reviewCount + 1
      const newRating = ((listing.rating * listing.reviewCount) + data.rating) / newReviewCount
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, rating: newRating, reviewCount: newReviewCount } : l))
    }

    return { success: true, review: newReview }
  }, [listings])

  const respondToReview = useCallback(async (reviewId: string, response: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, response, respondedAt: new Date().toISOString() } : r))
    return { success: true }
  }, [])

  const markReviewHelpful = useCallback(async (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    return { success: true }
  }, [])

  const purchaseListing = useCallback(async (listingId: string, paymentMethod: string) => {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) return { success: false, error: 'Listing not found' }

    const newOrder: MarketplaceOrder = {
      id: `order-${Date.now()}`,
      listingId,
      listingTitle: listing.title,
      buyerId: 'user-1',
      buyerName: 'You',
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      status: 'paid',
      amount: listing.price,
      currency: listing.currency,
      paymentMethod,
      createdAt: new Date().toISOString()
    }
    setOrders(prev => [newOrder, ...prev])
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, salesCount: l.salesCount + 1 } : l))
    return { success: true, order: newOrder }
  }, [listings])

  const updateOrderStatus = useCallback(async (orderId: string, status: MarketplaceOrder['status']) => {
    const now = new Date().toISOString()
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status,
      deliveredAt: status === 'delivered' ? now : o.deliveredAt,
      completedAt: status === 'completed' ? now : o.completedAt
    } : o))
    return { success: true }
  }, [])

  const recordView = useCallback(async (listingId: string) => {
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, viewCount: l.viewCount + 1 } : l))
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchMarketplace({ search: query })
  }, [fetchMarketplace])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchMarketplace()
  }, [fetchMarketplace])

  useEffect(() => { refresh() }, [refresh])

  const activeListings = useMemo(() => listings.filter(l => l.status === 'active'), [listings])
  const draftListings = useMemo(() => listings.filter(l => l.status === 'draft'), [listings])
  const featuredListings = useMemo(() => listings.filter(l => l.isFeatured && l.status === 'active'), [listings])
  const myListings = useMemo(() => listings.filter(l => l.sellerId === 'user-1'), [listings])
  const pendingOrders = useMemo(() => orders.filter(o => ['pending', 'paid', 'processing'].includes(o.status)), [orders])
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'completed'), [orders])
  const listingsByCategory = useMemo(() => {
    const grouped: Record<string, MarketplaceListing[]> = {}
    listings.forEach(l => {
      if (!grouped[l.category]) grouped[l.category] = []
      grouped[l.category].push(l)
    })
    return grouped
  }, [listings])
  const topRated = useMemo(() => [...activeListings].filter(l => l.reviewCount >= 5).sort((a, b) => b.rating - a.rating).slice(0, 10), [activeListings])
  const bestSellers = useMemo(() => [...activeListings].sort((a, b) => b.salesCount - a.salesCount).slice(0, 10), [activeListings])

  const categories: ListingCategory[] = ['software', 'design', 'marketing', 'development', 'consulting', 'other']
  const listingTypes: ListingType[] = ['product', 'service', 'digital', 'subscription']

  return {
    listings, reviews, orders, currentListing, stats, activeListings, draftListings, featuredListings, myListings,
    pendingOrders, completedOrders, listingsByCategory, topRated, bestSellers, categories, listingTypes,
    isLoading, error, searchQuery,
    refresh, fetchMarketplace, createListing, updateListing, deleteListing, publishListing, archiveListing, duplicateListing,
    addImage, removeImage, reorderImages, fetchReviews, addReview, respondToReview, markReviewHelpful,
    purchaseListing, updateOrderStatus, recordView, search,
    setCurrentListing
  }
}

export default useMarketplace
