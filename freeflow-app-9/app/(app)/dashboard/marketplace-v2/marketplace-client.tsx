'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Store, Package, ShoppingCart, Users, Star, Download, TrendingUp, TrendingDown,
  DollarSign, Search, Filter, Grid, List, Heart, Share2, ExternalLink, MoreHorizontal,
  Plus, Settings, Eye, ShoppingBag, Truck, CreditCard, Award, Shield, Zap, Tag, Percent,
  Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ArrowUpRight, ArrowDownRight,
  Layers, Box, BarChart3, Globe, MessageSquare, Bookmark, BookmarkCheck, Crown, Sparkles,
  Flame, ThumbsUp, RefreshCw, Mail, Phone, MapPin, Calendar, FileText, Receipt,
  TrendingUp as Trending, PieChart, Activity, Target, Megaphone, Gift, Wallet, Bell,
  Flag, ThumbsDown, Reply, Edit, Trash2, Copy, Link, Image, Video, Code, Hash, History
} from 'lucide-react'

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

// Mock Data
const mockVendors: Vendor[] = [
  { id: 'v1', name: 'ProTools Inc', description: 'Enterprise productivity solutions powering 10,000+ businesses worldwide', website: 'https://protools.com', email: 'contact@protools.com', phone: '+1-555-0123', status: 'verified', productCount: 12, totalSales: 4520, totalRevenue: 245000, rating: 4.8, reviewCount: 234, isVerified: true, isFeatured: true, joinedAt: '2022-01-15', location: 'San Francisco, CA', supportEmail: 'support@protools.com', responseTime: '< 2 hours' },
  { id: 'v2', name: 'DataFlow Labs', description: 'Advanced analytics and business intelligence solutions', website: 'https://dataflow.io', email: 'hello@dataflow.io', status: 'verified', productCount: 8, totalSales: 3200, totalRevenue: 186000, rating: 4.6, reviewCount: 156, isVerified: true, isFeatured: true, joinedAt: '2022-06-20', location: 'New York, NY', supportEmail: 'help@dataflow.io', responseTime: '< 4 hours' },
  { id: 'v3', name: 'SecureStack', description: 'Enterprise security and compliance automation', website: 'https://securestack.dev', email: 'team@securestack.dev', status: 'featured', productCount: 5, totalSales: 2800, totalRevenue: 312000, rating: 4.9, reviewCount: 89, isVerified: true, isFeatured: true, joinedAt: '2023-02-10', location: 'Austin, TX', supportEmail: 'security@securestack.dev', responseTime: '< 1 hour' },
  { id: 'v4', name: 'AutomateHQ', description: 'Workflow automation and integration platform', website: 'https://automatehq.com', email: 'info@automatehq.com', status: 'active', productCount: 6, totalSales: 1890, totalRevenue: 94500, rating: 4.5, reviewCount: 78, isVerified: true, isFeatured: false, joinedAt: '2023-05-15', location: 'Seattle, WA', supportEmail: 'support@automatehq.com', responseTime: '< 6 hours' }
]

const mockProducts: Product[] = [
  {
    id: 'p1', name: 'Analytics Pro', description: 'Comprehensive analytics dashboard with real-time insights, custom reports, AI-powered predictions, and advanced data visualization.', shortDescription: 'Advanced analytics for modern businesses', vendor: mockVendors[1], category: 'analytics', subcategory: 'Business Intelligence', price: 49, compareAtPrice: 79, pricingModel: 'subscription', status: 'active', images: [], rating: 4.8, reviewCount: 234, downloads: 15420, installs: 12350, activeInstalls: 11200, isFeatured: true, isVerified: true, isBestseller: true, isNew: false, tags: ['analytics', 'dashboard', 'reporting', 'AI', 'visualization'], createdAt: '2023-06-15', updatedAt: '2024-01-10', version: '3.2.1', compatibility: ['Chrome', 'Firefox', 'Safari', 'Edge'], features: ['Real-time analytics', 'Custom dashboards', 'AI insights', 'Export to PDF/CSV', '50+ integrations'], requirements: ['Modern browser', 'Internet connection'],
    changelog: [{ version: '3.2.1', date: '2024-01-10', changes: ['Bug fixes', 'Performance improvements'] }]
  },
  {
    id: 'p2', name: 'TaskMaster', description: 'Complete project management solution with kanban boards, time tracking, team collaboration, and resource management.', shortDescription: 'Project management made simple', vendor: mockVendors[0], category: 'productivity', subcategory: 'Project Management', price: 29, pricingModel: 'subscription', status: 'active', images: [], rating: 4.6, reviewCount: 456, downloads: 28900, installs: 24500, activeInstalls: 22100, isFeatured: true, isVerified: true, isBestseller: true, isNew: false, tags: ['project management', 'kanban', 'collaboration', 'time tracking'], createdAt: '2023-03-20', updatedAt: '2024-01-12', version: '2.8.0', compatibility: ['Chrome', 'Firefox', 'Safari'], features: ['Kanban boards', 'Time tracking', 'Team chat', 'File sharing', 'Gantt charts'], requirements: ['Modern browser'],
    changelog: [{ version: '2.8.0', date: '2024-01-12', changes: ['New Gantt view', 'Improved mobile experience'] }]
  },
  {
    id: 'p3', name: 'SecureVault', description: 'Enterprise-grade security solution with end-to-end encryption, access control, audit logging, and compliance automation.', shortDescription: 'Protect your sensitive data', vendor: mockVendors[2], category: 'security', subcategory: 'Data Protection', price: 99, compareAtPrice: 149, pricingModel: 'subscription', status: 'active', images: [], rating: 4.9, reviewCount: 89, downloads: 8500, installs: 7200, activeInstalls: 6800, isFeatured: false, isVerified: true, isBestseller: false, isNew: false, tags: ['security', 'encryption', 'compliance', 'audit'], createdAt: '2023-09-01', updatedAt: '2024-01-08', version: '1.5.2', compatibility: ['All browsers'], features: ['End-to-end encryption', 'Access control', 'Audit logs', 'Compliance reports', 'SSO integration'], requirements: ['Enterprise plan'],
    changelog: [{ version: '1.5.2', date: '2024-01-08', changes: ['SOC2 compliance updates'] }]
  },
  {
    id: 'p4', name: 'FormBuilder Pro', description: 'Drag-and-drop form builder with conditional logic, payment integrations, and advanced analytics.', shortDescription: 'Build forms in minutes', vendor: mockVendors[0], category: 'productivity', subcategory: 'Forms', price: 0, pricingModel: 'freemium', status: 'active', images: [], rating: 4.5, reviewCount: 678, downloads: 45200, installs: 38900, activeInstalls: 35000, isFeatured: false, isVerified: true, isBestseller: true, isNew: false, tags: ['forms', 'surveys', 'no-code', 'payments'], createdAt: '2022-11-10', updatedAt: '2024-01-05', version: '4.1.0', compatibility: ['All browsers'], features: ['Drag-and-drop builder', 'Conditional logic', '50+ integrations', 'Payment collection', 'Analytics'], requirements: ['None'],
    changelog: [{ version: '4.1.0', date: '2024-01-05', changes: ['Stripe integration', 'New templates'] }]
  },
  {
    id: 'p5', name: 'Email Automator', description: 'Automated email marketing with templates, A/B testing, scheduling, and performance analytics.', shortDescription: 'Automate your email campaigns', vendor: mockVendors[1], category: 'marketing', subcategory: 'Email Marketing', price: 39, pricingModel: 'subscription', status: 'active', images: [], rating: 4.4, reviewCount: 312, downloads: 18700, installs: 15400, activeInstalls: 14200, isFeatured: true, isVerified: true, isBestseller: false, isNew: false, tags: ['email', 'automation', 'marketing', 'templates'], createdAt: '2023-05-25', updatedAt: '2024-01-11', version: '2.3.0', compatibility: ['Chrome', 'Firefox', 'Safari'], features: ['Email templates', 'A/B testing', 'Analytics', 'Segmentation', 'Drip campaigns'], requirements: ['Email list'],
    changelog: [{ version: '2.3.0', date: '2024-01-11', changes: ['AI subject line generator'] }]
  },
  {
    id: 'p6', name: 'WorkflowBot', description: 'AI-powered workflow automation with 500+ integrations, custom triggers, and advanced logic.', shortDescription: 'Automate anything', vendor: mockVendors[3], category: 'automation', subcategory: 'Workflow', price: 59, pricingModel: 'subscription', status: 'active', images: [], rating: 4.7, reviewCount: 145, downloads: 12800, installs: 10200, activeInstalls: 9500, isFeatured: true, isVerified: true, isBestseller: false, isNew: true, tags: ['automation', 'workflow', 'integrations', 'AI'], createdAt: '2024-01-01', updatedAt: '2024-01-15', version: '1.0.0', compatibility: ['All platforms'], features: ['500+ integrations', 'Custom triggers', 'AI actions', 'Team collaboration', 'Version control'], requirements: ['API access'],
    changelog: [{ version: '1.0.0', date: '2024-01-01', changes: ['Initial release'] }]
  }
]

const mockCollections: Collection[] = [
  { id: 'c1', name: 'Staff Picks', description: 'Hand-selected by our team for exceptional quality', productCount: 12, image: '', isFeatured: true, curator: 'Editorial Team', createdAt: '2024-01-01' },
  { id: 'c2', name: 'New This Week', description: 'Fresh additions to the marketplace', productCount: 8, image: '', isFeatured: true, curator: 'System', createdAt: '2024-01-15' },
  { id: 'c3', name: 'Essential Tools', description: 'Must-have apps for every business', productCount: 15, image: '', isFeatured: true, curator: 'Editorial Team', createdAt: '2023-12-01' },
  { id: 'c4', name: 'Top Free Apps', description: 'Best free tools available', productCount: 20, image: '', isFeatured: false, curator: 'System', createdAt: '2024-01-10' },
  { id: 'c5', name: 'Enterprise Solutions', description: 'Built for scale and security', productCount: 10, image: '', isFeatured: true, curator: 'Enterprise Team', createdAt: '2023-11-15' },
  { id: 'c6', name: 'AI & Automation', description: 'Smart tools powered by AI', productCount: 18, image: '', isFeatured: true, curator: 'AI Team', createdAt: '2024-01-08' }
]

const mockReviews: Review[] = [
  { id: 'r1', productId: 'p1', productName: 'Analytics Pro', author: { name: 'John Davidson', company: 'TechCorp' }, rating: 5, title: 'Excellent analytics tool!', content: 'This has transformed how we track our business metrics. The AI insights are surprisingly accurate and have helped us identify trends we would have missed.', pros: ['Easy to use', 'Great visualizations', 'Accurate AI predictions'], cons: ['Steep learning curve initially'], helpful: 45, notHelpful: 2, createdAt: '2024-01-10', verified: true, status: 'approved', response: { content: 'Thank you for the wonderful review! We\'re glad the AI insights are helping your team.', date: '2024-01-11' } },
  { id: 'r2', productId: 'p1', productName: 'Analytics Pro', author: { name: 'Sarah Miller' }, rating: 4, title: 'Great features, minor bugs', content: 'Love the dashboard customization. Had some issues with exports but support was helpful and responsive.', pros: ['Customizable dashboards', 'Great support'], cons: ['Export bugs', 'Occasional slow loading'], helpful: 23, notHelpful: 1, createdAt: '2024-01-08', verified: true, status: 'approved' },
  { id: 'r3', productId: 'p2', productName: 'TaskMaster', author: { name: 'Mike Roberts', company: 'StartupXYZ' }, rating: 5, title: 'Best project management tool', content: 'We switched from competitors and never looked back. The kanban feature is amazing and the mobile app works flawlessly.', pros: ['Intuitive UI', 'Great mobile app', 'Excellent integrations'], cons: [], helpful: 67, notHelpful: 3, createdAt: '2024-01-05', verified: true, status: 'approved' },
  { id: 'r4', productId: 'p3', productName: 'SecureVault', author: { name: 'Emily Chen', company: 'FinanceHub' }, rating: 5, title: 'Essential for compliance', content: 'The compliance reporting alone is worth the price. Passed our SOC2 audit with flying colors thanks to SecureVault.', pros: ['Compliance ready', 'Excellent documentation', 'Fast support'], cons: ['Premium pricing'], helpful: 34, notHelpful: 0, createdAt: '2024-01-03', verified: true, status: 'approved' },
  { id: 'r5', productId: 'p4', productName: 'FormBuilder Pro', author: { name: 'Alex Thompson' }, rating: 4, title: 'Great free tier', content: 'The free tier is generous enough for small businesses. Upgraded to pro for payment collection and it\'s been smooth.', pros: ['Generous free tier', 'Easy to use', 'Good templates'], cons: ['Limited conditional logic on free plan'], helpful: 89, notHelpful: 5, createdAt: '2024-01-01', verified: true, status: 'approved' }
]

const mockOrders: Order[] = [
  { id: 'o1', orderNumber: 'ORD-2024-001234', product: { id: 'p1', name: 'Analytics Pro', vendor: 'DataFlow Labs' }, customer: { name: 'Acme Corp', email: 'billing@acme.com', company: 'Acme Corporation' }, status: 'completed', amount: 49, currency: 'USD', paymentMethod: 'Credit Card', license: 'LIC-APR-001234', date: '2024-01-15', expiresAt: '2025-01-15', invoice: 'INV-001234' },
  { id: 'o2', orderNumber: 'ORD-2024-001235', product: { id: 'p2', name: 'TaskMaster', vendor: 'ProTools Inc' }, customer: { name: 'Tech Solutions', email: 'finance@techsol.io' }, status: 'completed', amount: 29, currency: 'USD', paymentMethod: 'PayPal', license: 'LIC-TM-001235', date: '2024-01-14', expiresAt: '2025-01-14', invoice: 'INV-001235' },
  { id: 'o3', orderNumber: 'ORD-2024-001236', product: { id: 'p3', name: 'SecureVault', vendor: 'SecureStack' }, customer: { name: 'FinanceHub Ltd', email: 'accounts@finhub.com', company: 'FinanceHub Ltd' }, status: 'processing', amount: 99, currency: 'USD', paymentMethod: 'Wire Transfer', license: 'Pending', date: '2024-01-16' },
  { id: 'o4', orderNumber: 'ORD-2024-001230', product: { id: 'p5', name: 'Email Automator', vendor: 'DataFlow Labs' }, customer: { name: 'Marketing Pro', email: 'team@marketpro.co' }, status: 'refunded', amount: 39, currency: 'USD', paymentMethod: 'Credit Card', license: 'Revoked', date: '2024-01-10', invoice: 'INV-001230' },
  { id: 'o5', orderNumber: 'ORD-2024-001237', product: { id: 'p6', name: 'WorkflowBot', vendor: 'AutomateHQ' }, customer: { name: 'Startup Inc', email: 'hello@startup.io' }, status: 'pending', amount: 59, currency: 'USD', paymentMethod: 'Credit Card', license: 'Pending', date: '2024-01-16' }
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

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPricing = selectedPricing === 'all' || product.pricingModel === selectedPricing
      return matchesSearch && matchesCategory && matchesPricing && product.status === 'active'
    })
  }, [searchQuery, selectedCategory, selectedPricing])

  const stats = useMemo(() => ({
    totalProducts: mockProducts.length,
    totalVendors: mockVendors.length,
    totalDownloads: mockProducts.reduce((sum, p) => sum + p.downloads, 0),
    totalInstalls: mockProducts.reduce((sum, p) => sum + p.activeInstalls, 0),
    avgRating: (mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length).toFixed(1),
    totalRevenue: mockVendors.reduce((sum, v) => sum + v.totalRevenue, 0),
    totalReviews: mockReviews.length,
    pendingOrders: mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
  }), [])

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
            <Button variant="outline"><Heart className="h-4 w-4 mr-2" />Wishlist ({wishlist.length})</Button>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600"><Plus className="h-4 w-4 mr-2" />Submit App</Button>
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
          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockProducts.filter(p => p.isFeatured).map(product => (
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
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600"><Download className="h-4 w-4 mr-2" />Install</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollections.map((collection, i) => (
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
          <TabsContent value="vendors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockVendors.map(vendor => (
                <Card key={vendor.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl">{vendor.name.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{vendor.name}</h3>
                          {vendor.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                          {vendor.isFeatured && <Badge className="bg-amber-100 text-amber-700"><Crown className="h-3 w-3 mr-1" />Featured</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500"><MapPin className="h-3 w-3" />{vendor.location}</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{vendor.description}</p>
                    <div className="grid grid-cols-4 gap-4 text-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div><p className="text-xl font-bold">{vendor.productCount}</p><p className="text-xs text-gray-500">Products</p></div>
                      <div><p className="text-xl font-bold">{vendor.rating}</p><p className="text-xs text-gray-500">Rating</p></div>
                      <div><p className="text-xl font-bold">{(vendor.totalSales / 1000).toFixed(1)}K</p><p className="text-xs text-gray-500">Sales</p></div>
                      <div><p className="text-xl font-bold">${(vendor.totalRevenue / 1000).toFixed(0)}K</p><p className="text-xs text-gray-500">Revenue</p></div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4" /><span>Response time: {vendor.responseTime}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1"><Mail className="h-4 w-4 mr-2" />Contact</Button>
                      <Button className="flex-1"><ExternalLink className="h-4 w-4 mr-2" />Visit Store</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{mockReviews.length}</p><p className="text-sm text-gray-500">Total Reviews</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-500">4.7</p><p className="text-sm text-gray-500">Average Rating</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">92%</p><p className="text-sm text-gray-500">Positive Reviews</p></CardContent></Card>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockReviews.map(review => (
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
          <TabsContent value="orders" className="mt-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{mockOrders.length}</p><p className="text-sm text-gray-500">Total Orders</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{mockOrders.filter(o => o.status === 'completed').length}</p><p className="text-sm text-gray-500">Completed</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-500">{mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length}</p><p className="text-sm text-gray-500">Pending</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">${mockOrders.reduce((sum, o) => sum + o.amount, 0)}</p><p className="text-sm text-gray-500">Total Revenue</p></CardContent></Card>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-4 py-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {mockOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><span className="font-mono text-sm">{order.orderNumber}</span></td>
                          <td className="px-4 py-4"><div><p className="font-medium">{order.product.name}</p><p className="text-xs text-gray-500">{order.product.vendor}</p></div></td>
                          <td className="px-4 py-4"><div><p className="font-medium">{order.customer.name}</p><p className="text-xs text-gray-500">{order.customer.email}</p></div></td>
                          <td className="px-4 py-4"><span className="font-semibold">${order.amount}</span><span className="text-xs text-gray-500 ml-1">/{order.paymentMethod}</span></td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(order.status)}>{order.status}</Badge></td>
                          <td className="px-4 py-4 text-sm text-gray-500">{order.date}</td>
                          <td className="px-4 py-4"><Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderDialog(true) }}><Eye className="h-4 w-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><PieChart className="h-5 w-5 text-violet-500" /><span className="text-sm">Conversion Rate</span></div><p className="text-2xl font-bold mt-2">3.2%</p><p className="text-xs text-green-600">+0.4% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" /><span className="text-sm">Page Views</span></div><p className="text-2xl font-bold mt-2">45.2K</p><p className="text-xs text-green-600">+12% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-green-500" /><span className="text-sm">Install Rate</span></div><p className="text-2xl font-bold mt-2">8.7%</p><p className="text-xs text-green-600">+1.2% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /><span className="text-sm">Avg Session</span></div><p className="text-2xl font-bold mt-2">4m 32s</p><p className="text-xs text-green-600">+23s from last month</p></CardContent></Card>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{ name: 'Analytics', value: 35, color: 'bg-purple-500' }, { name: 'Productivity', value: 28, color: 'bg-blue-500' }, { name: 'Security', value: 20, color: 'bg-red-500' }, { name: 'Marketing', value: 12, color: 'bg-orange-500' }, { name: 'Other', value: 5, color: 'bg-gray-500' }].map(cat => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="w-24 text-sm">{cat.name}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.value}%` }} /></div>
                        <span className="w-12 text-sm font-medium text-right">{cat.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Top Performing Apps</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProducts.slice(0, 5).map((product, i) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-gray-500">{i + 1}</span>
                        <div className="flex-1"><p className="font-medium">{product.name}</p><p className="text-xs text-gray-500">{product.vendor.name}</p></div>
                        <Badge variant="outline">{(product.downloads / 1000).toFixed(0)}K</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">New App Alerts</p><p className="text-sm text-gray-500">Get notified when new apps are added</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Review Responses</p><p className="text-sm text-gray-500">Notifications when vendors respond</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Price Drops</p><p className="text-sm text-gray-500">Alert when wishlist items drop in price</p></div><Switch /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Digest</p><p className="text-sm text-gray-500">Summary of marketplace activity</p></div><Switch defaultChecked /></div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Privacy & Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Public Profile</p><p className="text-sm text-gray-500">Allow vendors to see your profile</p></div><Switch /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Review Visibility</p><p className="text-sm text-gray-500">Show your reviews publicly</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Usage Analytics</p><p className="text-sm text-gray-500">Share anonymous usage data</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Two-Factor Auth</p><p className="text-sm text-gray-500">Require 2FA for purchases</p></div><Switch /></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                  <div><h4 className="font-semibold mb-3">Features</h4><div className="grid grid-cols-2 gap-2">{selectedProduct.features.map((f, i) => <div key={i} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm">{f}</span></div>)}</div></div>
                  <div><h4 className="font-semibold mb-3">Tags</h4><div className="flex flex-wrap gap-2">{selectedProduct.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div></div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => toggleWishlist(selectedProduct.id)}><Heart className={`h-4 w-4 mr-2 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />Wishlist</Button>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600"><Download className="h-4 w-4 mr-2" />Install Now</Button>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-gray-500">Customer</Label><p className="font-medium">{selectedOrder.customer.name}</p><p className="text-sm text-gray-500">{selectedOrder.customer.email}</p></div>
                    <div><Label className="text-gray-500">Amount</Label><p className="text-xl font-bold">${selectedOrder.amount}</p><p className="text-sm text-gray-500">{selectedOrder.paymentMethod}</p></div>
                    <div><Label className="text-gray-500">License</Label><p className="font-mono text-sm">{selectedOrder.license}</p></div>
                    <div><Label className="text-gray-500">Date</Label><p>{selectedOrder.date}</p>{selectedOrder.expiresAt && <p className="text-sm text-gray-500">Expires: {selectedOrder.expiresAt}</p>}</div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  {selectedOrder.invoice && <Button variant="outline"><FileText className="h-4 w-4 mr-2" />Download Invoice</Button>}
                  <Button variant="outline" onClick={() => setShowOrderDialog(false)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
