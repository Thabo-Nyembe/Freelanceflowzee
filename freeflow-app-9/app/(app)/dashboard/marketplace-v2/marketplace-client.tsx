'use client'

// MIGRATED: Wired to Supabase backend with marketplace hooks
// Hooks used: useMarketplaceApps, useMarketplaceReviews, useFeaturedApps, useMarketplaceMutations, useOrders

import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useCreateCoupon, useCoupons } from '@/lib/hooks/use-coupon-extended'
import {
  useMarketplaceApps,
  useMarketplaceReviews,
  useFeaturedApps,
  useMarketplaceMutations,
  type MarketplaceApp,
  type MarketplaceReview,
} from '@/lib/hooks/use-marketplace'
import { useOrders, type Order as DbOrder } from '@/lib/hooks/use-orders'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Store, Package, Users, Star, Download, TrendingUp, Rocket, Trophy,
  DollarSign, Search, Filter, Grid, List, Heart, ExternalLink, MoreHorizontal,
  Plus, Settings, Eye, CreditCard, Award, Shield, Zap, Tag, Percent,
  Clock, CheckCircle, XCircle, Loader2,
  Layers, BarChart3, MessageSquare, Crown, Sparkles, ThumbsUp, RefreshCw, Mail, MapPin, FileText, Receipt, PieChart, Activity, Target, Megaphone, Wallet, Bell, ThumbsDown, Reply, Edit, Trash2, Copy, Code, Bitcoin, Send, AlertTriangle
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'

// Types
type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock' | 'pending_review'
type VendorStatus = 'active' | 'pending' | 'suspended' | 'verified' | 'featured'
type PricingModel = 'free' | 'one_time' | 'subscription' | 'freemium' | 'usage_based'
type Category = 'productivity' | 'analytics' | 'marketing' | 'security' | 'collaboration' | 'design' | 'development' | 'finance' | 'communication' | 'automation'
type OrderStatus = 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled' | 'disputed'
type ReviewStatus = 'pending' | 'approved' | 'flagged' | 'hidden'

interface Product {
  id: string
  name: string
  description: string
  shortDescription: string
  vendor: Vendor
  category: Category
  subcategory: string
  price: number
  compareAtPrice?: number
  pricingModel: PricingModel
  status: ProductStatus
  images: string[]
  rating: number
  reviewCount: number
  downloads: number
  installs: number
  activeInstalls: number
  isFeatured: boolean
  isVerified: boolean
  isBestseller: boolean
  isNew: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  version: string
  compatibility: string[]
  features: string[]
  requirements: string[]
  changelog: ChangelogEntry[]
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

interface Vendor {
  id: string
  name: string
  logo?: string
  description: string
  website: string
  email: string
  phone?: string
  status: VendorStatus
  productCount: number
  totalSales: number
  totalRevenue: number
  rating: number
  reviewCount: number
  isVerified: boolean
  isFeatured: boolean
  joinedAt: string
  location: string
  supportEmail: string
  responseTime: string
}

interface Review {
  id: string
  productId: string
  productName: string
  author: { name: string; avatar?: string; company?: string }
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  helpful: number
  notHelpful: number
  createdAt: string
  verified: boolean
  status: ReviewStatus
  response?: { content: string; date: string }
}

interface Collection {
  id: string
  name: string
  description: string
  productCount: number
  image: string
  isFeatured: boolean
  curator: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  product: { id: string; name: string; vendor: string }
  customer: { name: string; email: string; company?: string }
  status: OrderStatus
  amount: number
  currency: string
  paymentMethod: string
  license: string
  date: string
  expiresAt?: string
  invoice?: string
}

interface SalesMetric {
  date: string
  revenue: number
  orders: number
  installs: number
  uninstalls: number
}

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_trial'
  value: number
  products: string[]
  usageLimit: number
  usedCount: number
  minPurchase?: number
  expiresAt: string
  status: 'active' | 'expired' | 'disabled'
  createdAt: string
}

interface Bundle {
  id: string
  name: string
  description: string
  products: string[]
  discount: number
  price: number
  originalPrice: number
  sales: number
  status: 'active' | 'draft'
  createdAt: string
}

interface PaymentProvider {
  id: string
  name: string
  type: 'card' | 'bank' | 'crypto' | 'wallet'
  status: 'active' | 'inactive' | 'pending'
  transactions: number
  volume: number
  fee: number
  logo: string
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  createdAt: string
  status: 'active' | 'revoked'
}

interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'failed' | 'disabled'
  lastTriggered?: string
  successRate: number
  createdAt: string
}


// Helper functions for real marketplace actions
const installApp = async (appId: string, appName: string) => {
  const response = await fetch('/api/marketplace/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId })
  })
  if (!response.ok) throw new Error('Installation failed')
  return { success: true, message: `${appName} installed successfully!` }
}

const uninstallApp = async (appId: string, appName: string) => {
  if (!confirm(`Are you sure you want to uninstall ${appName}?`)) {
    throw new Error('Uninstall cancelled')
  }
  const response = await fetch('/api/marketplace/uninstall', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId })
  })
  if (!response.ok) throw new Error('Uninstall failed')
  return { success: true, message: `${appName} uninstalled` }
}

const downloadFile = async (filename: string, type: string = 'csv') => {
  const response = await fetch(`/api/marketplace/export?type=${type}&filename=${filename}`)
  if (!response.ok) throw new Error('Export failed')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${type}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
  return { success: true, message: `${filename}.${type} downloaded` }
}

const copyToClipboard = async (text: string, label: string = 'Text') => {
  await navigator.clipboard.writeText(text)
  return { success: true, message: `${label} copied to clipboard` }
}

const shareContent = async (title: string, url: string) => {
  if (navigator.share) {
    await navigator.share({ title, url })
    return { success: true, message: 'Shared successfully' }
  } else {
    await navigator.clipboard.writeText(url)
    return { success: true, message: 'Link copied to clipboard' }
  }
}

// Placeholder quick actions - will be replaced with real state handlers in component
const mockMarketplaceQuickActions = [
  { id: '1', label: 'Add Product', icon: 'plus', action: () => { /* Replaced in component */ }, variant: 'default' as const },
  { id: '2', label: 'View Analytics', icon: 'chart', action: () => { /* Replaced in component */ }, variant: 'default' as const },
  { id: '3', label: 'Manage Reviews', icon: 'message', action: () => { /* Replaced in component */ }, variant: 'outline' as const },
]

export default function MarketplaceClient() {


  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedPricing, setSelectedPricing] = useState<PricingModel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [wishlist, setWishlist] = useState<string[]>(['p1', 'p3'])
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  const [showBundleDialog, setShowBundleDialog] = useState(false)
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showWishlistPanel, setShowWishlistPanel] = useState(false)
  const [showSubmitAppDialog, setShowSubmitAppDialog] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [orderPage, setOrderPage] = useState(1)
  const [settingsTab, setSettingsTab] = useState('general')
  const [analyticsTab, setAnalyticsTab] = useState('overview')
  const [followedVendors, setFollowedVendors] = useState<string[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [mockAPIKeysState, setMockAPIKeysState] = useState([])

  // Database state (local state for non-hook managed data)
  const [dbWebhooks, setDbWebhooks] = useState<any[]>([])
  const [dbApiKeys, setDbApiKeys] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Database integration - Marketplace hooks
  const { apps: dbApps, loading: loadingApps, error: appsError, refetch: refetchApps } = useMarketplaceApps({ status: 'published' })
  const { reviews: dbReviews, loading: loadingReviews, error: reviewsError, refetch: refetchReviews } = useMarketplaceReviews()
  const { featuredApps: dbFeaturedApps, loading: loadingFeatured, refetch: refetchFeatured } = useFeaturedApps()
  const { createApp, updateApp, deleteApp, createReview, updateReview, deleteReview } = useMarketplaceMutations()

  // Orders hook
  const { orders: dbOrders, loading: loadingOrders, stats: orderStats, refetch: refetchOrders } = useOrders()

  // Coupon hooks
  const { create: createCouponMutation, isLoading: creatingCoupon } = useCreateCoupon()
  const { data: dbCoupons, refresh: refreshCoupons } = useCoupons()

  // Team and activity hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Combined loading state
  const isLoading = loadingApps || loadingReviews || loadingFeatured || loadingOrders

  // Form state for marketplace coupon
  const [marketplaceCouponForm, setMarketplaceCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free_trial',
    value: '',
    usageLimit: '',
    minPurchase: '',
    expiresAt: '',
    applicableProducts: 'all'
  })

  // Form state for bundle
  const [bundleForm, setBundleForm] = useState({
    name: '', description: '', products: [] as string[], discount: '', price: ''
  })

  // Form state for API key
  const [apiKeyForm, setApiKeyForm] = useState({
    name: '', permissions: ['read'] as string[], expiration: 'never'
  })

  // Form state for webhook
  const [webhookForm, setWebhookForm] = useState({
    url: '', events: [] as string[], secret: ''
  })

  // Fetch webhooks from Supabase
  const fetchWebhooks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.from('webhooks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      setDbWebhooks(data || [])
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    }
  }, [])

  // Fetch API keys from Supabase
  const fetchApiKeys = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      setDbApiKeys(data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    }
  }, [])

  // Marketplace apps now fetched via useMarketplaceApps hook

  useEffect(() => {
    fetchWebhooks()
    fetchApiKeys()
  }, [fetchWebhooks, fetchApiKeys])

  const handleCreateMarketplaceCoupon = async () => {
    if (!marketplaceCouponForm.code || !marketplaceCouponForm.value) {
      toast.error('Please enter coupon code and value')
      return
    }

    try {
      await createCouponMutation({
        code: marketplaceCouponForm.code.toUpperCase(),
        name: `Marketplace Coupon - ${marketplaceCouponForm.code}`,
        discount_type: marketplaceCouponForm.discountType === 'percentage' ? 'percent_off' : 'amount_off',
        discount_value: parseFloat(marketplaceCouponForm.value),
        max_redemptions: marketplaceCouponForm.usageLimit ? parseInt(marketplaceCouponForm.usageLimit) : null,
        min_purchase: marketplaceCouponForm.minPurchase ? parseFloat(marketplaceCouponForm.minPurchase) : 0,
        expires_at: marketplaceCouponForm.expiresAt || null,
        is_active: true,
        duration: 'once',
        times_redeemed: 0
      })

      toast.promise(Promise.resolve(), { loading: 'Creating coupon...', success: 'Coupon created successfully!', error: 'Failed to create coupon' })
      setShowCouponDialog(false)
      setMarketplaceCouponForm({
        code: '',
        discountType: 'percentage',
        value: '',
        usageLimit: '',
        minPurchase: '',
        expiresAt: '',
        applicableProducts: 'all'
      })
      refreshCoupons()
    } catch (error) {
      toast.error('Failed to create coupon')
      console.error(error)
    }
  }

  // Create API key handler
  const handleCreateApiKey = async () => {
    if (!apiKeyForm.name) {
      toast.error('Please enter a key name')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Please sign in'); return }
      const keyPrefix = 'mk_' + Math.random().toString(36).substring(2, 8)
      const keyHash = 'hashed_' + Math.random().toString(36).substring(2, 20)
      const expiresAt = apiKeyForm.expiration === 'never' ? null : new Date(Date.now() + parseInt(apiKeyForm.expiration) * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id, name: apiKeyForm.name, key_prefix: keyPrefix, key_hash: keyHash,
        scopes: apiKeyForm.permissions, expires_at: expiresAt, is_active: true
      })
      if (error) throw error
      toast.promise(Promise.resolve(), { loading: 'Creating API key...', success: `API key created! Key prefix: ${keyPrefix}...`, error: 'Failed to create API key' })
      setShowAPIKeyDialog(false)
      setApiKeyForm({ name: '', permissions: ['read'], expiration: 'never' })
      fetchApiKeys()
    } catch (error) {
      toast.error('Failed to create API key')
      console.error(error)
    } finally { setIsSubmitting(false) }
  }

  // Delete API key handler
  const handleDeleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id)
      if (error) throw error
      toast.promise(Promise.resolve(), { loading: 'Deleting API key...', success: 'API key deleted', error: 'Failed to delete API key' })
      fetchApiKeys()
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  // Create webhook handler
  const handleCreateWebhook = async () => {
    if (!webhookForm.url || webhookForm.events.length === 0) {
      toast.error('Please enter URL and select events')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Please sign in'); return }

      const { error } = await supabase.from('webhooks').insert({
        user_id: user.id, name: `Webhook ${webhookForm.url.split('/').pop()}`,
        url: webhookForm.url, secret: webhookForm.secret || null, events: webhookForm.events, is_active: true
      })
      if (error) throw error
      toast.promise(Promise.resolve(), { loading: 'Creating webhook...', success: 'Webhook created!', error: 'Failed to create webhook' })
      setShowWebhookDialog(false)
      setWebhookForm({ url: '', events: [], secret: '' })
      fetchWebhooks()
    } catch (error) {
      toast.error('Failed to create webhook')
      console.error(error)
    } finally { setIsSubmitting(false) }
  }

  // Delete webhook handler
  const handleDeleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from('webhooks').delete().eq('id', id)
      if (error) throw error
      toast.promise(Promise.resolve(), { loading: 'Deleting webhook...', success: 'Webhook deleted', error: 'Failed to delete webhook' })
      fetchWebhooks()
    } catch (error) {
      toast.error('Failed to delete webhook')
    }
  }

  // Toggle webhook event selection
  const toggleWebhookEvent = (event: string) => {
    setWebhookForm(prev => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event]
    }))
  }

  // Toggle API key permission
  const toggleApiKeyPermission = (perm: string) => {
    setApiKeyForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
    }))
  }

  // Map database apps to UI Product format
  const productsData: Product[] = useMemo(() => {
    return (dbApps || []).map((app: MarketplaceApp) => ({
      id: app.id,
      name: app.app_name,
      description: app.description || '',
      shortDescription: app.short_description || '',
      vendor: {
        id: app.user_id,
        name: app.developer_name || 'Unknown Developer',
        logo: app.icon_url || undefined,
        description: '',
        website: app.developer_website || '',
        email: app.developer_email || '',
        status: app.developer_verified ? 'verified' as VendorStatus : 'active' as VendorStatus,
        productCount: 1,
        totalSales: app.total_downloads,
        totalRevenue: app.total_downloads * app.price,
        rating: app.average_rating,
        reviewCount: app.total_reviews,
        isVerified: app.developer_verified,
        isFeatured: app.is_featured,
        joinedAt: app.created_at,
        location: '',
        supportEmail: app.developer_email || '',
        responseTime: '24h'
      },
      category: app.category as Category,
      subcategory: app.subcategory || '',
      price: app.price,
      compareAtPrice: undefined,
      pricingModel: (app.pricing_model === 'paid' ? 'one_time' : app.pricing_model) as PricingModel,
      status: (app.status === 'published' ? 'active' : app.status) as ProductStatus,
      images: app.screenshots || [],
      rating: app.average_rating,
      reviewCount: app.total_reviews,
      downloads: app.total_downloads,
      installs: app.total_installs,
      activeInstalls: app.total_installs,
      isFeatured: app.is_featured,
      isVerified: app.is_verified,
      isBestseller: app.total_downloads > 10000,
      isNew: new Date(app.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      tags: app.tags || [],
      createdAt: app.created_at,
      updatedAt: app.updated_at,
      version: app.version || '1.0.0',
      compatibility: [],
      features: [],
      requirements: app.permissions || [],
      changelog: []
    }))
  }, [dbApps])

  // Map database reviews to UI Review format
  const reviewsData: Review[] = useMemo(() => {
    return (dbReviews || []).map((review: MarketplaceReview) => ({
      id: review.id,
      productId: review.app_id,
      productName: '',
      author: {
        name: review.reviewer_name || 'Anonymous',
        avatar: review.reviewer_avatar || undefined,
        company: undefined
      },
      rating: review.rating,
      title: review.title || '',
      content: review.content || '',
      pros: [],
      cons: [],
      helpful: review.helpful_count,
      notHelpful: review.not_helpful_count,
      createdAt: review.created_at,
      verified: review.is_verified_purchase,
      status: review.status as ReviewStatus,
      response: review.developer_response ? {
        content: review.developer_response,
        date: review.developer_responded_at || review.updated_at
      } : undefined
    }))
  }, [dbReviews])

  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPricing = selectedPricing === 'all' || product.pricingModel === selectedPricing
      return matchesSearch && matchesCategory && matchesPricing && product.status === 'active'
    })
  }, [searchQuery, selectedCategory, selectedPricing, productsData])

  // Get unique vendors from products
  const vendorsData = useMemo(() => {
    const vendorMap = new Map<string, Vendor>()
    productsData.forEach(p => {
      if (!vendorMap.has(p.vendor.id)) {
        vendorMap.set(p.vendor.id, p.vendor)
      }
    })
    return Array.from(vendorMap.values())
  }, [productsData])

  // Map database orders to UI Order format
  const ordersData: Order[] = useMemo(() => {
    return (dbOrders || []).map((order: DbOrder) => ({
      id: order.id,
      orderNumber: order.order_number,
      product: {
        id: '',
        name: 'Marketplace Purchase',
        vendor: ''
      },
      customer: {
        name: order.customer_name || 'Unknown',
        email: order.customer_email || '',
        company: undefined
      },
      status: (order.status === 'confirmed' ? 'processing' : order.status) as OrderStatus,
      amount: order.total_amount,
      currency: order.currency,
      paymentMethod: order.payment_method || 'card',
      license: '',
      date: order.created_at,
      expiresAt: undefined,
      invoice: undefined
    }))
  }, [dbOrders])

  const stats = useMemo(() => ({
    totalProducts: productsData.length,
    totalVendors: vendorsData.length,
    totalDownloads: productsData.reduce((sum, p) => sum + p.downloads, 0),
    totalInstalls: productsData.reduce((sum, p) => sum + p.activeInstalls, 0),
    avgRating: productsData.length > 0 ? (productsData.reduce((sum, p) => sum + p.rating, 0) / productsData.length).toFixed(1) : '0.0',
    totalRevenue: orderStats?.totalRevenue || vendorsData.reduce((sum, v) => sum + v.totalRevenue, 0),
    totalReviews: reviewsData.length,
    pendingOrders: orderStats?.pendingOrders || 0
  }), [productsData, vendorsData, reviewsData, orderStats])

  const statsCards = [
    { label: 'Total Apps', value: stats.totalProducts.toString(), icon: Package, color: 'from-violet-500 to-violet-600', trend: '+12%' },
    { label: 'Vendors', value: stats.totalVendors.toString(), icon: Users, color: 'from-purple-500 to-purple-600', trend: '+5%' },
    { label: 'Downloads', value: `${(stats.totalDownloads / 1000).toFixed(0)}K`, icon: Download, color: 'from-blue-500 to-blue-600', trend: '+23%' },
    { label: 'Active Installs', value: `${(stats.totalInstalls / 1000).toFixed(0)}K`, icon: Zap, color: 'from-green-500 to-green-600', trend: '+18%' },
    { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'from-amber-500 to-amber-600', trend: '+0.2' },
    { label: 'Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', trend: '+31%' },
    { label: 'Reviews', value: stats.totalReviews.toString(), icon: MessageSquare, color: 'from-pink-500 to-pink-600', trend: '+8' },
    { label: 'Pending', value: stats.pendingOrders.toString(), icon: Clock, color: 'from-orange-500 to-orange-600', trend: '' }
  ]

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  const getCategoryIcon = (category: Category) => {
    const icons: Record<Category, JSX.Element> = {
      productivity: <Zap className="w-4 h-4" />, analytics: <BarChart3 className="w-4 h-4" />,
      marketing: <Megaphone className="w-4 h-4" />, security: <Shield className="w-4 h-4" />,
      collaboration: <Users className="w-4 h-4" />, design: <Layers className="w-4 h-4" />,
      development: <Code className="w-4 h-4" />, finance: <Wallet className="w-4 h-4" />,
      communication: <MessageSquare className="w-4 h-4" />, automation: <RefreshCw className="w-4 h-4" />
    }
    return icons[category] || <Package className="w-4 h-4" />
  }

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      analytics: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      marketing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      collaboration: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      design: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      development: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      communication: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      automation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status: OrderStatus | ReviewStatus): string => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
      disputed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      hidden: 'bg-gray-100 text-gray-700 dark:bg-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const formatPrice = (price: number, model: PricingModel): string => {
    if (model === 'free') return 'Free'
    if (model === 'freemium') return 'Free+'
    if (model === 'usage_based') return 'Usage-based'
    if (model === 'one_time') return `$${price}`
    return `$${price}/mo`
  }

  // Handlers
  const handleSync = async () => {
    toast.promise(
      Promise.all([refetchApps(), refetchReviews(), refetchFeatured(), refetchOrders()]),
      { loading: 'Syncing marketplace data...', success: 'Marketplace data synced!', error: 'Failed to sync' }
    )
  }

  const handleAddToWishlist = (product: Product) => {
    toast.promise(Promise.resolve().then(() => setWishlist(prev => [...prev, product.id])), { loading: 'Adding to wishlist...', success: `"${product.name}" added to your wishlist`, error: 'Failed to add' })
  }

  const handleRemoveFromWishlist = (product: Product) => {
    toast.promise(Promise.resolve().then(() => setWishlist(prev => prev.filter(id => id !== product.id))), { loading: 'Removing from wishlist...', success: `"${product.name}" removed from your wishlist`, error: 'Failed to remove' })
  }

  const handlePurchaseProduct = (product: Product) => {
    // Open checkout in a new tab or redirect to payment page
    const checkoutUrl = `/checkout?product=${product.id}&price=${product.price}&name=${encodeURIComponent(product.name)}`
    window.open(checkoutUrl, '_blank')
    toast.success(`Opening checkout for "${product.name}"`)
  }

  const handleSubmitReview = (product: Product) => {
    toast.promise(Promise.resolve().then(() => setShowReviewDialog(false)), { loading: 'Submitting review...', success: 'Thank you for your review!', error: 'Failed to submit' })
  }

  const handleContactSeller = (product: Product) => {
    // Open email client or chat interface
    const mailtoUrl = `mailto:${product.vendor.supportEmail || product.vendor.email}?subject=Inquiry about ${encodeURIComponent(product.name)}`
    window.location.href = mailtoUrl
    toast.success(`Opening email to ${product.vendor.name}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (appsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">Error loading marketplace data</p>
        <Button onClick={() => { refetchApps(); refetchReviews(); refetchFeatured(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Marketplace</h1>
              <p className="text-gray-500 dark:text-gray-400">Shopify App Store level marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search apps..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowWishlistPanel(!showWishlistPanel)}><Heart className="h-4 w-4 mr-2" />Wishlist ({wishlist.length})</Button>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => setShowSubmitAppDialog(true)}><Plus className="h-4 w-4 mr-2" />Submit App</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      {stat.trend && <span className="text-xs text-green-600">{stat.trend}</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="browse" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Store className="h-4 w-4 mr-2" />Browse</TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Sparkles className="h-4 w-4 mr-2" />Featured</TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Layers className="h-4 w-4 mr-2" />Collections</TabsTrigger>
            <TabsTrigger value="vendors" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Users className="h-4 w-4 mr-2" />Vendors</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><MessageSquare className="h-4 w-4 mr-2" />Reviews</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Receipt className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6 space-y-6">
            {/* Marketplace Stats Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Marketplace Hub</h2>
                  <p className="text-violet-200">Discover apps to supercharge your workflow</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{productsData.length}</div>
                    <p className="text-violet-200 text-sm">Total Apps</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-violet-200 text-sm">Installed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">4.8</div>
                    <p className="text-violet-200 text-sm">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Productivity', icon: Zap, count: 24, color: 'bg-blue-100 text-blue-600' },
                { name: 'Analytics', icon: BarChart3, count: 18, color: 'bg-green-100 text-green-600' },
                { name: 'Marketing', icon: Megaphone, count: 15, color: 'bg-orange-100 text-orange-600' },
                { name: 'Security', icon: Shield, count: 12, color: 'bg-red-100 text-red-600' },
                { name: 'Automation', icon: RefreshCw, count: 20, color: 'bg-purple-100 text-purple-600' },
                { name: 'Development', icon: Code, count: 22, color: 'bg-cyan-100 text-cyan-600' },
              ].map((cat) => (
                <button key={cat.name} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left">
                  <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.count} apps</p>
                </button>
              ))}
            </div>

            {/* Trending Apps */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  Trending This Week
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSelectedCategory('all')
                  setActiveTab('browse')
                  toast.info('Showing all trending apps')
                }}>View All</Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {productsData.slice(0, 5).map((product, idx) => (
                    <div key={product.id} className="flex-shrink-0 w-48 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-violet-600">#{idx + 1}</span>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">{product.name}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{product.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{product.downloads.toLocaleString()} installs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
                  </div>
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category | 'all')}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPricing} onValueChange={(v) => setSelectedPricing(v as PricingModel | 'all')}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Pricing" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pricing</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="one_time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <span className="text-sm text-gray-500">{filteredProducts.length} apps found</span>
                </div>
              </CardContent>
            </Card>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {filteredProducts.map(product => (
                <Card key={product.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-t-lg flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-violet-300" />
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-gray-800/80" onClick={() => toggleWishlist(product.id)}>
                        <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      {product.isNew && <Badge className="absolute top-2 left-2 bg-green-500 text-white">New</Badge>}
                      {product.isFeatured && <Badge className="absolute top-2 left-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white"><Sparkles className="h-3 w-3 mr-1" />Featured</Badge>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold line-clamp-1">{product.name}</h4>
                        {product.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">by {product.vendor.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{product.shortDescription}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getCategoryColor(product.category)}>{getCategoryIcon(product.category)}<span className="ml-1">{product.category}</span></Badge>
                        {product.isBestseller && <Badge className="bg-orange-100 text-orange-700">Bestseller</Badge>}
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{product.rating} ({product.reviewCount})</span>
                        <span className="flex items-center gap-1 text-gray-500"><Download className="h-4 w-4" />{(product.downloads / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-lg font-bold text-violet-600">{formatPrice(product.price, product.pricingModel)}</p>
                        <Button size="sm" onClick={() => { setSelectedProduct(product); setShowProductDialog(true) }}><Eye className="h-4 w-4 mr-1" />View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="mt-6 space-y-8">
            {/* Editor's Pick Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-8 w-8" />
                <div>
                  <h2 className="text-xl font-bold">Editor's Choice Apps</h2>
                  <p className="text-amber-100 text-sm">Handpicked by our expert team for exceptional quality</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-amber-100">Featured Apps</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-amber-100">Avg Rating</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">156K</p>
                  <p className="text-sm text-amber-100">Total Installs</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-amber-100">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Featured Spotlight */}
            <Card className="border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-8 flex flex-col justify-center">
                  <Badge className="w-fit bg-white/20 text-white mb-4"><Zap className="h-3 w-3 mr-1" />App of the Week</Badge>
                  <h2 className="text-2xl font-bold text-white mb-2">Analytics Pro Suite</h2>
                  <p className="text-violet-200 mb-4">The most comprehensive analytics solution for growing businesses. Track, analyze, and optimize your entire operation.</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}</div>
                    <span className="text-white">4.9 (2,847 reviews)</span>
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-white text-violet-600 hover:bg-violet-50" onClick={() => toast.promise(installApp('analytics-pro', 'Analytics Pro Suite'), { loading: 'Installing Analytics Pro Suite...', success: 'Analytics Pro Suite installed successfully!', error: 'Installation failed' })}><Download className="h-4 w-4 mr-2" />Install Now</Button>
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => { setSelectedProduct(productsData[0]); setShowProductDialog(true) }}>Learn More</Button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-semibold mb-4">Key Features</h3>
                  <div className="space-y-3">
                    {['Real-time dashboard with 50+ metrics', 'AI-powered insights and predictions', 'Custom report builder', 'Team collaboration tools', 'API access & webhooks', '24/7 priority support'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Starting at</p>
                        <p className="text-2xl font-bold">$49<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">14-day free trial</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Featured Apps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {productsData.filter(p => p.isFeatured).map(product => (
                <Card key={product.id} className="border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 h-40 flex items-center justify-center"><Package className="h-20 w-20 text-white/30" /></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><h3 className="text-xl font-bold">{product.name}</h3>{product.isVerified && <Shield className="h-5 w-5 text-blue-500" />}</div>
                          <p className="text-sm text-gray-500">by {product.vendor.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-violet-600">{formatPrice(product.price, product.pricingModel)}</p>
                          {product.compareAtPrice && <p className="text-sm text-gray-400 line-through">${product.compareAtPrice}/mo</p>}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{product.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{product.rating}</span>
                          <span className="flex items-center gap-1 text-gray-500"><Download className="h-4 w-4" />{(product.downloads / 1000).toFixed(0)}K</span>
                          <span className="flex items-center gap-1 text-gray-500"><Zap className="h-4 w-4" />{(product.activeInstalls / 1000).toFixed(0)}K active</span>
                        </div>
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => toast.promise(installApp(product.id, product.name), { loading: `Installing ${product.name}...`, success: `${product.name} installed successfully!`, error: 'Installation failed' })}><Download className="h-4 w-4 mr-2" />Install</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Vendor Spotlight */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" />Featured Vendor of the Month</CardTitle>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Top Partner</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-2xl">TP</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">TechPro Solutions</h3>
                      <Shield className="h-5 w-5 text-blue-500" />
                      <Badge className="bg-violet-100 text-violet-700">Elite Partner</Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Industry-leading provider of enterprise productivity and security solutions. Trusted by over 10,000 businesses worldwide.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                      <div className="text-center"><p className="text-xl font-bold">15</p><p className="text-xs text-gray-500">Products</p></div>
                      <div className="text-center"><p className="text-xl font-bold">4.9</p><p className="text-xs text-gray-500">Avg Rating</p></div>
                      <div className="text-center"><p className="text-xl font-bold">45K</p><p className="text-xs text-gray-500">Customers</p></div>
                      <div className="text-center"><p className="text-xl font-bold">$2.3M</p><p className="text-xs text-gray-500">Revenue</p></div>
                      <div className="text-center"><p className="text-xl font-bold">&lt;2hr</p><p className="text-xs text-gray-500">Response</p></div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => window.open('https://techpro.example.com', '_blank')}><ExternalLink className="h-4 w-4 mr-2" />Visit Store</Button>
                      <Button variant="outline" onClick={() => window.location.href = 'mailto:contact@techpro.example.com?subject=Inquiry'}><Mail className="h-4 w-4 mr-2" />Contact</Button>
                      <Button variant="outline" onClick={() => { const vendorId = 'techpro'; if (followedVendors.includes(vendorId)) { setFollowedVendors(prev => prev.filter(id => id !== vendorId)); toast.success('Unfollowed TechPro Solutions'); } else { setFollowedVendors(prev => [...prev, vendorId]); toast.success('Now following TechPro Solutions'); } }}><Heart className={`h-4 w-4 mr-2 ${followedVendors.includes('techpro') ? 'fill-red-500 text-red-500' : ''}`} />{followedVendors.includes('techpro') ? 'Following' : 'Follow'}</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rising Stars */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-orange-500" />Rising Stars</CardTitle>
                <p className="text-sm text-gray-500">New apps gaining traction this month</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    { name: 'DataSync Pro', growth: '+245%', installs: '2.3K', category: 'Integration' },
                    { name: 'AI Writer', growth: '+189%', installs: '1.8K', category: 'AI Tools' },
                    { name: 'SecureVault', growth: '+156%', installs: '1.5K', category: 'Security' },
                  ].map((app, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center"><Package className="h-6 w-6 text-white" /></div>
                        <div>
                          <h4 className="font-semibold">{app.name}</h4>
                          <Badge variant="outline" className="text-xs">{app.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{app.installs} installs</span>
                        <Badge className="bg-green-100 text-green-700"><TrendingUp className="h-3 w-3 mr-1" />{app.growth}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {([] as Collection[]).map((collection, i) => (
                <Card key={collection.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className={`h-36 bg-gradient-to-br ${['from-violet-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-pink-500 to-rose-500', 'from-indigo-500 to-violet-500'][i % 6]} flex items-center justify-center`}>
                      <Layers className="h-14 w-14 text-white/30" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">{collection.isFeatured && <Crown className="h-4 w-4 text-amber-500" />}<h4 className="font-semibold">{collection.name}</h4></div>
                      <p className="text-sm text-gray-500 mb-3">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{collection.productCount} apps</Badge>
                        <span className="text-xs text-gray-400">by {collection.curator}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="mt-6 space-y-6">
            {/* Vendor Stats Overview */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Vendor Ecosystem</h2>
                  <p className="text-indigo-200 text-sm">Partner network performance overview</p>
                </div>
                <Button variant="outline" className="border-white/50 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />Apply as Vendor
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{vendorsData.length}</p>
                  <p className="text-sm text-indigo-100">Total Vendors</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{vendorsData.filter(v => v.isVerified).length}</p>
                  <p className="text-sm text-indigo-100">Verified</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-indigo-100">Avg Rating</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">$1.2M</p>
                  <p className="text-sm text-indigo-100">Total Revenue</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-indigo-100">Products</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">&lt;4hr</p>
                  <p className="text-sm text-indigo-100">Avg Response</p>
                </div>
              </div>
            </div>

            {/* Vendor Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { tier: 'Elite', icon: Crown, color: 'from-amber-500 to-orange-500', count: 2, perks: 'Priority placement, reduced fees' },
                { tier: 'Gold', icon: Award, color: 'from-yellow-500 to-amber-500', count: 5, perks: 'Featured listings, analytics' },
                { tier: 'Silver', icon: Shield, color: 'from-gray-400 to-gray-500', count: 12, perks: 'Standard features, support' },
                { tier: 'Bronze', icon: Users, color: 'from-orange-700 to-amber-700', count: 28, perks: 'Basic marketplace access' },
              ].map((t, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                      <t.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold">{t.tier} Partners</h4>
                    <p className="text-2xl font-bold">{t.count}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.perks}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Vendor Directory */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendor Directory</CardTitle>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Tiers" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sort By" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {vendorsData.map(vendor => (
                    <div key={vendor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl">{vendor.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{vendor.name}</h3>
                            {vendor.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                            {vendor.isFeatured && <Badge className="bg-amber-100 text-amber-700"><Crown className="h-3 w-3 mr-1" />Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.location}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Response: {vendor.responseTime}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{vendor.description}</p>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{vendor.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">{vendor.productCount} products</span>
                            <span className="text-sm text-gray-500">{(vendor.totalSales / 1000).toFixed(1)}K sales</span>
                            <span className="text-sm font-medium text-green-600">${(vendor.totalRevenue / 1000).toFixed(0)}K revenue</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { window.location.href = `mailto:${vendor.email}?subject=Inquiry from Marketplace`; }}><Mail className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => { window.open(vendor.website, '_blank'); }}><ExternalLink className="h-4 w-4 mr-1" />Store</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Performance Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Top Sellers</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendorsData.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{v.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-medium">{v.name}</p><p className="text-xs text-gray-500">{v.productCount} products</p></div>
                        <span className="font-semibold text-green-600">${(v.totalRevenue / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" />Highest Rated</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendorsData.sort((a, b) => b.rating - a.rating).slice(0, 5).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{v.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-medium">{v.name}</p><p className="text-xs text-gray-500">{v.totalSales} reviews</p></div>
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-semibold">{v.rating}</span></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6 space-y-6">
            {/* Reviews Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Review Management</h2>
                  <p className="text-amber-100 text-sm">Monitor and respond to customer feedback</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => toast.promise(downloadFile('reviews', 'csv'), { loading: 'Exporting reviews...', success: 'Reviews exported to CSV', error: 'Export failed' })}><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button className="bg-white text-amber-700 hover:bg-amber-50" onClick={() => setActiveTab('reviews')}><MessageSquare className="h-4 w-4 mr-2" />Respond All</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{reviewsData.length}</p>
                  <p className="text-sm text-amber-100">Total Reviews</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-amber-100">Avg Rating</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-sm text-amber-100">Positive</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{reviewsData.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-amber-100">Pending</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{reviewsData.filter(r => r.response).length}</p>
                  <p className="text-sm text-amber-100">Responded</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">2.3h</p>
                  <p className="text-sm text-amber-100">Avg Response</p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {[5, 4, 3, 2, 1].map(stars => {
                const counts = [156, 89, 23, 8, 4]
                const pct = [56, 32, 8, 3, 1]
                return (
                  <Card key={stars} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(stars)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                        {[...Array(5-stars)].map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                      </div>
                      <p className="text-xl font-bold">{counts[5-stars]}</p>
                      <p className="text-xs text-gray-500">{pct[5-stars]}% of reviews</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {reviewsData.map(review => (
                  <div key={review.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedReview(review); setShowReviewDialog(true) }}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10"><AvatarFallback className="bg-violet-100 text-violet-700">{review.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.author.name}</span>
                            {review.author.company && <span className="text-sm text-gray-500">• {review.author.company}</span>}
                            {review.verified && <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                          </div>
                          <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                          <span className="text-sm text-gray-500">for {review.productName}</span>
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{review.helpful}</span>
                          <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" />{review.notHelpful}</span>
                          {review.response && <Badge variant="outline"><Reply className="h-3 w-3 mr-1" />Responded</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6 space-y-6">
            {/* Orders Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Order Management</h2>
                  <p className="text-emerald-200 text-sm">Track and manage all marketplace transactions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => toast.promise(downloadFile('orders', 'csv'), { loading: 'Exporting orders...', success: 'Orders exported to CSV', error: 'Export failed' })}><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={() => toast.promise(downloadFile('order-report', 'pdf'), { loading: 'Generating order report...', success: 'Order report generated', error: 'Report generation failed' })}><FileText className="h-4 w-4 mr-2" />Generate Report</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{ordersData.length}</p>
                  <p className="text-sm text-emerald-100">Total Orders</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{ordersData.filter(o => o.status === 'completed').length}</p>
                  <p className="text-sm text-emerald-100">Completed</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{ordersData.filter(o => o.status === 'pending').length}</p>
                  <p className="text-sm text-emerald-100">Pending</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{ordersData.filter(o => o.status === 'processing').length}</p>
                  <p className="text-sm text-emerald-100">Processing</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">${ordersData.reduce((sum, o) => sum + o.amount, 0)}</p>
                  <p className="text-sm text-emerald-100">Revenue</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">$32.40</p>
                  <p className="text-sm text-emerald-100">Avg Order</p>
                </div>
              </div>
            </div>

            {/* Order Filters & Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search orders..." className="pl-10 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[130px]"><SelectValue placeholder="Payment" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" className="w-[150px]" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                        setOrderPage(1)
                        toast.loading('Refreshing orders...', { id: 'orders-refresh' })
                        setTimeout(() => {
                          toast.success('Orders refreshed', { id: 'orders-refresh' })
                        }, 800)
                      }}><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => { setShowFilterPanel(!showFilterPanel); }}><Filter className="h-4 w-4 mr-1" />Filters</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {ordersData.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><input type="checkbox" className="rounded" /></td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm text-violet-600">{order.orderNumber}</span>
                            <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center"><Package className="h-5 w-5 text-white" /></div>
                              <div><p className="font-medium">{order.product.name}</p><p className="text-xs text-gray-500">{order.product.vendor}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8"><AvatarFallback className="bg-gray-100 text-gray-600 text-xs">{order.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                              <div><p className="font-medium">{order.customer.name}</p><p className="text-xs text-gray-500">{order.customer.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4"><span className="font-semibold">${order.amount}</span></td>
                          <td className="px-4 py-4"><span className="text-green-600 font-medium">${(order.amount * 0.15).toFixed(2)}</span></td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(order.status)}>{order.status}</Badge></td>
                          <td className="px-4 py-4 text-sm text-gray-500">{order.date}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderDialog(true) }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => toast.promise(downloadFile(`invoice-${order.orderNumber}`, 'pdf'), { loading: 'Generating invoice...', success: `Invoice generated for ${order.orderNumber}`, error: 'Failed to generate invoice' })}><FileText className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderDialog(true) }}><MoreHorizontal className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-gray-500">Showing 1-{ordersData.length} of {ordersData.length} orders</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" className={orderPage === 1 ? "bg-violet-50 text-violet-700" : ""} onClick={() => { setOrderPage(1); }}>1</Button>
                    <Button variant="outline" size="sm" className={orderPage === 2 ? "bg-violet-50 text-violet-700" : ""} onClick={() => { setOrderPage(2); }}>2</Button>
                    <Button variant="outline" size="sm" className={orderPage === 3 ? "bg-violet-50 text-violet-700" : ""} onClick={() => { setOrderPage(3); }}>3</Button>
                    <Button variant="outline" size="sm" onClick={() => { setOrderPage(prev => Math.min(prev + 1, 3)); }}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Revenue by Day</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const values = [65, 85, 70, 90, 75, 45, 30]
                      return (
                        <div key={day} className="flex items-center gap-2">
                          <span className="w-8 text-xs text-gray-500">{day}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${values[i]}%` }} />
                          </div>
                          <span className="text-xs font-medium w-12 text-right">${(values[i] * 50).toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { method: 'Credit Card', pct: 58, icon: CreditCard, color: 'bg-blue-500' },
                      { method: 'PayPal', pct: 28, icon: Wallet, color: 'bg-indigo-500' },
                      { method: 'Crypto', pct: 10, icon: Bitcoin, color: 'bg-orange-500' },
                      { method: 'Other', pct: 4, icon: MoreHorizontal, color: 'bg-gray-500' },
                    ].map(pm => (
                      <div key={pm.method} className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${pm.color} rounded-lg flex items-center justify-center`}><pm.icon className="h-4 w-4 text-white" /></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1"><span className="text-sm">{pm.method}</span><span className="text-sm font-medium">{pm.pct}%</span></div>
                          <Progress value={pm.pct} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.promise(fetch('/api/marketplace/orders/process-pending', { method: 'POST' }).then(r => { if (!r.ok) throw new Error('Failed'); return r; }), { loading: 'Processing pending orders...', success: 'All pending orders processed', error: 'Failed to process orders' })}><RefreshCw className="h-4 w-4 mr-2" />Process Pending Orders</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.promise(downloadFile('invoices-batch', 'pdf'), { loading: 'Generating invoices...', success: 'Invoices generated for all orders', error: 'Failed to generate invoices' })}><FileText className="h-4 w-4 mr-2" />Generate Invoices</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.promise(fetch('/api/marketplace/payouts/process', { method: 'POST' }).then(r => { if (!r.ok) throw new Error('Failed'); return r; }), { loading: 'Processing payouts...', success: 'Payouts processed successfully', error: 'Failed to process payouts' })}><DollarSign className="h-4 w-4 mr-2" />Process Payouts</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.promise(fetch('/api/marketplace/notifications/send-bulk', { method: 'POST' }).then(r => { if (!r.ok) throw new Error('Failed'); return r; }), { loading: 'Sending notifications...', success: 'Notifications sent to all customers', error: 'Failed to send notifications' })}><Send className="h-4 w-4 mr-2" />Send Notifications</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => toast.promise(downloadFile('orders-export', 'csv'), { loading: 'Exporting to CSV...', success: 'Data exported to CSV file', error: 'Export failed' })}><Download className="h-4 w-4 mr-2" />Export to CSV</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Overview */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Marketplace Analytics</h2>
                  <p className="text-violet-200 text-sm">Performance insights and trends</p>
                </div>
                <select className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">$124,580</p>
                  <p className="text-green-300 text-xs">+18.2% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold">3,847</p>
                  <p className="text-green-300 text-xs">+12.5% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold">$32.38</p>
                  <p className="text-green-300 text-xs">+5.1% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Active Users</p>
                  <p className="text-2xl font-bold">12.4K</p>
                  <p className="text-green-300 text-xs">+8.3% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold">2.1%</p>
                  <p className="text-green-300 text-xs">-0.4% vs last period</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><PieChart className="h-5 w-5 text-violet-500" /><span className="text-sm">Conversion Rate</span></div><p className="text-2xl font-bold mt-2">3.2%</p><p className="text-xs text-green-600">+0.4% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" /><span className="text-sm">Page Views</span></div><p className="text-2xl font-bold mt-2">45.2K</p><p className="text-xs text-green-600">+12% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-green-500" /><span className="text-sm">Install Rate</span></div><p className="text-2xl font-bold mt-2">8.7%</p><p className="text-xs text-green-600">+1.2% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /><span className="text-sm">Avg Session</span></div><p className="text-2xl font-bold mt-2">4m 32s</p><p className="text-xs text-green-600">+23s from last month</p></CardContent></Card>
            </div>

            {/* Revenue & Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const values = [65, 78, 82, 90, 88, 45, 38]
                    const amounts = [4250, 5120, 5380, 5920, 5780, 2940, 2480]
                    return (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-10 text-sm text-gray-500">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                          <div className="bg-violet-500 h-3 rounded-full" style={{ width: `${values[idx]}%` }} />
                        </div>
                        <span className="w-20 text-sm font-medium text-right">${amounts[idx].toLocaleString()}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{ name: 'Analytics', value: 35, amount: 43603, color: 'bg-purple-500' }, { name: 'Productivity', value: 28, amount: 34882, color: 'bg-blue-500' }, { name: 'Security', value: 20, amount: 24916, color: 'bg-red-500' }, { name: 'Marketing', value: 12, amount: 14950, color: 'bg-orange-500' }, { name: 'Other', value: 5, amount: 6229, color: 'bg-gray-500' }].map(cat => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="w-24 text-sm">{cat.name}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.value}%` }} /></div>
                        <span className="w-20 text-sm font-medium text-right">${cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* App Performance & User Behavior */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Top Performing Apps</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {productsData.slice(0, 5).map((product, i) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-gray-500">{i + 1}</span>
                        <div className="flex-1"><p className="font-medium">{product.name}</p><p className="text-xs text-gray-500">{product.vendor.name}</p></div>
                        <Badge variant="outline">{(product.downloads / 1000).toFixed(0)}K</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>User Acquisition</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { source: 'Organic Search', users: 4520, pct: 42 },
                    { source: 'Direct', users: 2840, pct: 26 },
                    { source: 'Referrals', users: 1680, pct: 16 },
                    { source: 'Social Media', users: 980, pct: 9 },
                    { source: 'Email', users: 780, pct: 7 },
                  ].map((src) => (
                    <div key={src.source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{src.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{src.users.toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">{src.pct}%</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Retention Metrics</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">87%</p>
                      <p className="text-xs text-gray-500">Day 1 Retention</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">64%</p>
                      <p className="text-xs text-gray-500">Day 7 Retention</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">48%</p>
                      <p className="text-xs text-gray-500">Day 30 Retention</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-600">35%</p>
                      <p className="text-xs text-gray-500">Day 90 Retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { app: 'Analytics Pro', user: 'john@example.com', amount: 49, time: '2 min ago' },
                      { app: 'Security Suite', user: 'sarah@company.io', amount: 99, time: '15 min ago' },
                      { app: 'Marketing Tools', user: 'mike@startup.co', amount: 29, time: '1 hr ago' },
                      { app: 'Automation Hub', user: 'lisa@agency.com', amount: 79, time: '2 hrs ago' },
                      { app: 'Dev Toolkit', user: 'alex@dev.io', amount: 149, time: '3 hrs ago' },
                    ].map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tx.app}</p>
                          <p className="text-sm text-gray-500">{tx.user}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${tx.amount}</p>
                          <p className="text-xs text-gray-500">{tx.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">Growth Opportunity</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Analytics apps are trending 40% higher than last month. Consider featuring more analytics tools.</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-700 dark:text-blue-400">Conversion Tip</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Users who view 3+ apps have 2.5x higher conversion rate. Consider app recommendations.</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-700 dark:text-amber-400">Attention Needed</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5 apps have ratings below 3.5 stars. Review quality and consider removal.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="flex gap-6">
              <Card className="w-64 h-fit border-gray-200 dark:border-gray-700">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'payments', icon: CreditCard, label: 'Payments' },
                      { id: 'coupons', icon: Tag, label: 'Coupons' },
                      { id: 'developers', icon: Code, label: 'Developers' },
                      { id: 'security', icon: Shield, label: 'Security' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <item.icon className="h-4 w-4" />{item.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
              <div className="flex-1 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Marketplace Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Store Name</Label><Input defaultValue="My App Store" className="mt-1" /></div><div><Label>Default Currency</Label><Select defaultValue="usd"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="usd">USD</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem></SelectContent></Select></div></div>
                        <div><Label>Store Description</Label><Textarea defaultValue="Enterprise app marketplace" className="mt-1" /></div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Display Options</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Show Prices</p><p className="text-sm text-gray-500">Display app prices to visitors</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Show Reviews</p><p className="text-sm text-gray-500">Display user reviews</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Vendor Badges</p><p className="text-sm text-gray-500">Show verified vendor badges</p></div><Switch defaultChecked /></div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'notifications' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">New App Alerts</p><p className="text-sm text-gray-500">Get notified when new apps are added</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Review Responses</p><p className="text-sm text-gray-500">Notifications when vendors respond</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Price Drops</p><p className="text-sm text-gray-500">Alert when wishlist items drop in price</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Digest</p><p className="text-sm text-gray-500">Summary of marketplace activity</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Order Updates</p><p className="text-sm text-gray-500">Notifications for order status changes</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Security Alerts</p><p className="text-sm text-gray-500">Notify on suspicious activity</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'payments' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Payment Providers</CardTitle><Button onClick={() => window.open('/dashboard/settings/payments/add-provider', '_blank')}><Plus className="h-4 w-4 mr-2" />Add Provider</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {([] as PaymentProvider[]).map(provider => (
                        <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${provider.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                              <CreditCard className="h-6 w-6 text-violet-600" />
                            </div>
                            <div><h4 className="font-medium">{provider.name}</h4><p className="text-sm text-gray-500">{provider.type} • {provider.fee}% fee</p></div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right"><p className="text-sm text-gray-500">Volume</p><p className="font-bold">${(provider.volume / 1000).toFixed(0)}K</p></div>
                            <div className="text-right"><p className="text-sm text-gray-500">Transactions</p><p className="font-medium">{provider.transactions}</p></div>
                            <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                            <Switch checked={provider.status === 'active'} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'coupons' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Active Coupons ({(dbCoupons?.length || 0) + mockCoupons.length})</CardTitle><Button onClick={() => setShowCouponDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Coupon</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {(dbCoupons || []).map((coupon: any) => (
                          <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-violet-500">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${coupon.is_active ? 'bg-violet-100' : 'bg-gray-100'}`}>
                                <Percent className="h-6 w-6 text-violet-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2"><h4 className="font-mono font-bold">{coupon.code}</h4><Badge className={coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{coupon.is_active ? 'active' : 'inactive'}</Badge></div>
                                <p className="text-sm text-gray-500">{coupon.discount_type === 'percent_off' ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`} {coupon.expires_at && `• Expires ${new Date(coupon.expires_at).toLocaleDateString()}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="font-medium">{coupon.times_redeemed || 0}/{coupon.max_redemptions || 'Unlimited'}</p><Progress value={coupon.max_redemptions ? ((coupon.times_redeemed || 0) / coupon.max_redemptions) * 100 : 0} className="w-20 h-2" /></div>
                              <Button variant="ghost" size="icon" onClick={() => { setMarketplaceCouponForm({ code: coupon.code, discountType: coupon.discount_type === 'percent_off' ? 'percentage' : 'fixed', value: String(coupon.discount_value), usageLimit: String(coupon.max_redemptions || ''), minPurchase: String(coupon.min_purchase || ''), expiresAt: coupon.expires_at || '', applicableProducts: 'all' }); setShowCouponDialog(true); }}><Edit className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        {mockCoupons.map(coupon => (
                          <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${coupon.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Percent className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2"><h4 className="font-mono font-bold">{coupon.code}</h4><Badge className={getStatusColor(coupon.status)}>{coupon.status}</Badge></div>
                                <p className="text-sm text-gray-500">{coupon.type === 'percentage' ? `${coupon.value}% off` : coupon.type === 'fixed' ? `$${coupon.value} off` : `${coupon.value} day trial`} • Expires {coupon.expiresAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="font-medium">{coupon.usedCount}/{coupon.usageLimit}</p><Progress value={(coupon.usedCount / coupon.usageLimit) * 100} className="w-20 h-2" /></div>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedCoupon(coupon); setMarketplaceCouponForm({ code: coupon.code, discountType: coupon.type, value: String(coupon.value), usageLimit: String(coupon.usageLimit), minPurchase: coupon.minPurchase ? String(coupon.minPurchase) : '', expiresAt: coupon.expiresAt, applicableProducts: coupon.products.includes('all') ? 'all' : 'selected' }); setShowCouponDialog(true); }}><Edit className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Bundles</CardTitle><Button onClick={() => setShowBundleDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Bundle</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {([] as Bundle[]).map(bundle => (
                          <div key={bundle.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div><h4 className="font-medium">{bundle.name}</h4><p className="text-sm text-gray-500">{bundle.products.length} apps • {bundle.discount}% discount</p></div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="text-lg font-bold text-violet-600">${bundle.price}</p><p className="text-sm text-gray-400 line-through">${bundle.originalPrice}</p></div>
                              <Badge variant="outline">{bundle.sales} sales</Badge>
                              <Badge className={getStatusColor(bundle.status)}>{bundle.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'developers' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>API Keys ({dbApiKeys.length + mockAPIKeysState.length})</CardTitle><Button onClick={() => setShowAPIKeyDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Key</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {dbApiKeys.map(apiKey => (
                          <div key={apiKey.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-violet-500">
                            <div>
                              <div className="flex items-center gap-2"><h4 className="font-medium">{apiKey.name}</h4><Badge className={apiKey.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{apiKey.is_active ? 'active' : 'inactive'}</Badge></div>
                              <p className="font-mono text-sm text-gray-500">{apiKey.key_prefix}...</p>
                              <div className="flex items-center gap-2 mt-1">{(apiKey.scopes || []).map((p: string) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm text-gray-500"><p>Used: {apiKey.usage_count} times</p><p>Created: {new Date(apiKey.created_at).toLocaleDateString()}</p></div>
                              <Button variant="ghost" size="icon" onClick={() => toast.promise(navigator.clipboard.writeText(apiKey.key_prefix), { loading: 'Copying...', success: 'Key prefix copied', error: 'Failed to copy' })}><Copy className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteApiKey(apiKey.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        {mockAPIKeysState.map(apiKey => (
                          <div key={apiKey.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2"><h4 className="font-medium">{apiKey.name}</h4><Badge className={getStatusColor(apiKey.status)}>{apiKey.status}</Badge></div>
                              <p className="font-mono text-sm text-gray-500">{apiKey.key}</p>
                              <div className="flex items-center gap-2 mt-1">{apiKey.permissions.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm text-gray-500"><p>Last used: {apiKey.lastUsed}</p><p>Created: {apiKey.createdAt}</p></div>
                              <Button variant="ghost" size="icon" onClick={() => toast.promise(navigator.clipboard.writeText(apiKey.key), { loading: 'Copying key...', success: 'API key copied to clipboard', error: 'Failed to copy key' })}><Copy className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { if (confirm(`Are you sure you want to revoke "${apiKey.name}"?`)) { setMockAPIKeysState(prev => prev.filter(k => k.id !== apiKey.id)); toast.success(`API key "${apiKey.name}" revoked`); } }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Webhooks ({dbWebhooks.length + mockWebhooks.length})</CardTitle><Button onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {dbWebhooks.map(webhook => (
                          <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-violet-500">
                            <div>
                              <div className="flex items-center gap-2"><Code className="h-4 w-4 text-violet-500" /><span className="font-mono text-sm">{webhook.url}</span></div>
                              <div className="flex items-center gap-2 mt-1">{(webhook.events || []).map((e: string) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="text-sm">Deliveries: {webhook.total_deliveries || 0}</p><p className="text-xs text-gray-500">Created: {new Date(webhook.created_at).toLocaleDateString()}</p></div>
                              <Badge className={webhook.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{webhook.is_active ? 'active' : 'inactive'}</Badge>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteWebhook(webhook.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        {mockWebhooks.map(webhook => (
                          <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2"><Code className="h-4 w-4 text-gray-400" /><span className="font-mono text-sm">{webhook.url}</span></div>
                              <div className="flex items-center gap-2 mt-1">{webhook.events.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="text-sm"><span className={webhook.successRate >= 95 ? 'text-green-600' : 'text-amber-600'}>{webhook.successRate}%</span> success</p>{webhook.lastTriggered && <p className="text-xs text-gray-500">Last: {webhook.lastTriggered}</p>}</div>
                              <Badge className={getStatusColor(webhook.status)}>{webhook.status}</Badge>
                              <Button variant="ghost" size="icon" onClick={() => toast.promise(fetch(`/api/webhooks/test?url=${encodeURIComponent(webhook.url)}`, { method: 'POST' }).then(r => { if (!r.ok) throw new Error('Test failed'); return r; }), { loading: 'Testing webhook...', success: 'Webhook test successful', error: 'Webhook test failed' })}><RefreshCw className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'security' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Privacy & Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Public Profile</p><p className="text-sm text-gray-500">Allow vendors to see your profile</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Review Visibility</p><p className="text-sm text-gray-500">Show your reviews publicly</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Usage Analytics</p><p className="text-sm text-gray-500">Share anonymous usage data</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Two-Factor Auth</p><p className="text-sm text-gray-500">Require 2FA for purchases</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">API Rate Limiting</p><p className="text-sm text-gray-500">Limit API requests per minute</p></div><Select defaultValue="100"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="50">50/min</SelectItem><SelectItem value="100">100/min</SelectItem><SelectItem value="500">500/min</SelectItem></SelectContent></Select></div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[]}
              title="Marketplace Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers?.map(m => ({ id: m.id, name: m.name, avatar: m.avatar_url, status: m.status === 'active' ? 'online' : 'offline' })) || []}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Marketplace Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs?.slice(0, 10).map(l => ({ id: l.id, type: l.activity_type, title: l.action, user: { name: l.user_name || 'System' }, timestamp: l.created_at })) || []}
            title="Marketplace Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockMarketplaceQuickActions}
            variant="grid"
          />
        </div>

        {/* Product Detail Dialog */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">{selectedProduct.name}{selectedProduct.isVerified && <Shield className="h-5 w-5 text-blue-500" />}{selectedProduct.isBestseller && <Badge className="bg-orange-100 text-orange-700">Bestseller</Badge>}</DialogTitle>
                  <DialogDescription>by {selectedProduct.vendor.name} • v{selectedProduct.version}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 h-48 rounded-lg flex items-center justify-center"><Package className="h-24 w-24 text-violet-300" /></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4"><span className="flex items-center gap-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" />{selectedProduct.rating} ({selectedProduct.reviewCount} reviews)</span><span className="flex items-center gap-1 text-gray-500"><Download className="h-4 w-4" />{(selectedProduct.downloads / 1000).toFixed(0)}K</span><span className="flex items-center gap-1 text-gray-500"><Zap className="h-4 w-4" />{(selectedProduct.activeInstalls / 1000).toFixed(0)}K active</span></div>
                    <div className="text-right"><p className="text-3xl font-bold text-violet-600">{formatPrice(selectedProduct.price, selectedProduct.pricingModel)}</p>{selectedProduct.compareAtPrice && <p className="text-sm text-gray-400 line-through">${selectedProduct.compareAtPrice}/mo</p>}</div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>
                  <div><h4 className="font-semibold mb-3">Features</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">{selectedProduct.features.map((f, i) => <div key={i} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm">{f}</span></div>)}</div></div>
                  <div><h4 className="font-semibold mb-3">Tags</h4><div className="flex flex-wrap gap-2">{selectedProduct.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div></div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => toggleWishlist(selectedProduct.id)}><Heart className={`h-4 w-4 mr-2 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />Wishlist</Button>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => toast.promise(installApp(selectedProduct.id, selectedProduct.name), { loading: `Installing ${selectedProduct.name}...`, success: `${selectedProduct.name} installed successfully!`, error: 'Installation failed' })}><Download className="h-4 w-4 mr-2" />Install Now</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl">
            {selectedReview && (
              <>
                <DialogHeader>
                  <DialogTitle>Review Details</DialogTitle>
                  <DialogDescription>Review for {selectedReview.productName}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{selectedReview.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div><p className="font-medium">{selectedReview.author.name}</p>{selectedReview.author.company && <p className="text-sm text-gray-500">{selectedReview.author.company}</p>}</div>
                    {selectedReview.verified && <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Verified Purchase</Badge>}
                  </div>
                  <div className="flex items-center gap-2"><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div><span className="text-gray-500">{selectedReview.createdAt}</span></div>
                  <h4 className="font-semibold text-lg">{selectedReview.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedReview.content}</p>
                  {selectedReview.pros.length > 0 && <div><h5 className="font-medium text-green-700 mb-2">Pros</h5><ul className="space-y-1">{selectedReview.pros.map((p, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />{p}</li>)}</ul></div>}
                  {selectedReview.cons.length > 0 && <div><h5 className="font-medium text-red-700 mb-2">Cons</h5><ul className="space-y-1">{selectedReview.cons.map((c, i) => <li key={i} className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" />{c}</li>)}</ul></div>}
                  {selectedReview.response && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500 mb-2">Vendor Response • {selectedReview.response.date}</p><p className="text-sm">{selectedReview.response.content}</p></div>}
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowReviewDialog(false)}>Close</Button></DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-lg">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>{selectedOrder.orderNumber}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div><p className="font-semibold">{selectedOrder.product.name}</p><p className="text-sm text-gray-500">{selectedOrder.product.vendor}</p></div>
                    <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div><Label className="text-gray-500">Customer</Label><p className="font-medium">{selectedOrder.customer.name}</p><p className="text-sm text-gray-500">{selectedOrder.customer.email}</p></div>
                    <div><Label className="text-gray-500">Amount</Label><p className="text-xl font-bold">${selectedOrder.amount}</p><p className="text-sm text-gray-500">{selectedOrder.paymentMethod}</p></div>
                    <div><Label className="text-gray-500">License</Label><p className="font-mono text-sm">{selectedOrder.license}</p></div>
                    <div><Label className="text-gray-500">Date</Label><p>{selectedOrder.date}</p>{selectedOrder.expiresAt && <p className="text-sm text-gray-500">Expires: {selectedOrder.expiresAt}</p>}</div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  {selectedOrder.invoice && <Button variant="outline" onClick={() => toast.promise(downloadFile(`invoice-${selectedOrder.invoice}`, 'pdf'), { loading: 'Downloading invoice...', success: `Invoice ${selectedOrder.invoice} downloaded`, error: 'Failed to download invoice' })}><FileText className="h-4 w-4 mr-2" />Download Invoice</Button>}
                  <Button variant="outline" onClick={() => setShowOrderDialog(false)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Coupon Dialog */}
        <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create Coupon</DialogTitle><DialogDescription>Create a new discount coupon for your marketplace</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Coupon Code</Label><Input placeholder="SUMMER25" className="mt-1 font-mono" value={marketplaceCouponForm.code} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Discount Type</Label><Select value={marketplaceCouponForm.discountType} onValueChange={(v) => setMarketplaceCouponForm(prev => ({ ...prev, discountType: v as 'percentage' | 'fixed' | 'free_trial' }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage Off</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem><SelectItem value="free_trial">Free Trial Days</SelectItem></SelectContent></Select></div>
                <div><Label>Value</Label><Input type="number" placeholder="25" className="mt-1" value={marketplaceCouponForm.value} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, value: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Usage Limit</Label><Input type="number" placeholder="100" className="mt-1" value={marketplaceCouponForm.usageLimit} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, usageLimit: e.target.value }))} /></div><div><Label>Min Purchase</Label><Input type="number" placeholder="0" className="mt-1" value={marketplaceCouponForm.minPurchase} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, minPurchase: e.target.value }))} /></div></div>
              <div><Label>Expires At</Label><Input type="date" className="mt-1" value={marketplaceCouponForm.expiresAt} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))} /></div>
              <div><Label>Applicable Products</Label><Select value={marketplaceCouponForm.applicableProducts} onValueChange={(v) => setMarketplaceCouponForm(prev => ({ ...prev, applicableProducts: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select products" /></SelectTrigger><SelectContent><SelectItem value="all">All Products</SelectItem><SelectItem value="selected">Selected Products</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowCouponDialog(false)}>Cancel</Button><Button onClick={handleCreateMarketplaceCoupon} disabled={creatingCoupon || !marketplaceCouponForm.code || !marketplaceCouponForm.value} className="bg-gradient-to-r from-violet-600 to-purple-600">{creatingCoupon ? 'Creating...' : 'Create Coupon'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bundle Dialog */}
        <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create Bundle</DialogTitle><DialogDescription>Create a product bundle with discounted pricing</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Bundle Name</Label><Input placeholder="Productivity Suite" className="mt-1" /></div>
              <div><Label>Description</Label><Textarea placeholder="Describe what's included..." className="mt-1" /></div>
              <div><Label>Select Products</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {productsData.slice(0, 4).map(p => <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"><input type="checkbox" /><span className="text-sm">{p.name}</span></div>)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Discount %</Label><Input type="number" placeholder="25" className="mt-1" /></div><div><Label>Bundle Price</Label><Input type="number" placeholder="99" className="mt-1" /></div></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowBundleDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => toast.promise(fetch('/api/marketplace/bundles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bundleForm) }).then(r => { if (!r.ok) throw new Error('Failed'); setShowBundleDialog(false); return r; }), { loading: 'Creating bundle...', success: 'Bundle created successfully!', error: 'Failed to create bundle' })}> Create Bundle</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create API Key</DialogTitle><DialogDescription>Generate a new API key for integrations</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Key Name</Label><Input placeholder="Production API" className="mt-1" value={apiKeyForm.name} onChange={(e) => setApiKeyForm(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['read', 'write', 'delete', 'admin'].map(perm => <Badge key={perm} variant="outline" className={`cursor-pointer hover:bg-violet-50 ${apiKeyForm.permissions.includes(perm) ? 'bg-violet-100 border-violet-500' : ''}`} onClick={() => toggleApiKeyPermission(perm)}>{perm}</Badge>)}
                </div>
              </div>
              <div><Label>Expiration</Label><Select value={apiKeyForm.expiration} onValueChange={(v) => setApiKeyForm(prev => ({ ...prev, expiration: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select expiration" /></SelectTrigger><SelectContent><SelectItem value="never">Never</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem></SelectContent></Select></div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200"><p className="text-sm text-amber-700">API keys are shown only once after creation. Make sure to copy it!</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowAPIKeyDialog(false)}>Cancel</Button><Button onClick={handleCreateApiKey} disabled={isSubmitting || !apiKeyForm.name} className="bg-gradient-to-r from-violet-600 to-purple-600">{isSubmitting ? 'Creating...' : 'Generate Key'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add Webhook</DialogTitle><DialogDescription>Configure a webhook endpoint for event notifications</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Endpoint URL</Label><Input placeholder="https://your-api.com/webhooks" className="mt-1" value={webhookForm.url} onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))} /></div>
              <div><Label>Events</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {['order.created', 'order.completed', 'order.refunded', 'review.created', 'review.flagged', 'install', 'uninstall'].map(event => (
                    <div key={event} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${webhookForm.events.includes(event) ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-gray-50 dark:bg-gray-800'}`} onClick={() => toggleWebhookEvent(event)}><input type="checkbox" checked={webhookForm.events.includes(event)} readOnly /><span className="text-sm font-mono">{event}</span></div>
                  ))}
                </div>
              </div>
              <div><Label>Secret (Optional)</Label><Input placeholder="whsec_xxxxxxxxx" className="mt-1 font-mono" value={webhookForm.secret} onChange={(e) => setWebhookForm(prev => ({ ...prev, secret: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button><Button onClick={handleCreateWebhook} disabled={isSubmitting || !webhookForm.url || webhookForm.events.length === 0} className="bg-gradient-to-r from-violet-600 to-purple-600">{isSubmitting ? 'Adding...' : 'Add Webhook'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
