'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  Star,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Settings,
  Eye,
  ShoppingBag,
  Truck,
  CreditCard,
  Award,
  Shield,
  Zap,
  Tag,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Box,
  BarChart3,
  Globe,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Crown,
  Sparkles,
  Flame,
  ThumbsUp,
  RefreshCw
} from 'lucide-react'

// Types
type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock'
type VendorStatus = 'active' | 'pending' | 'suspended' | 'verified'
type PricingModel = 'free' | 'one_time' | 'subscription' | 'freemium'
type Category = 'productivity' | 'analytics' | 'marketing' | 'security' | 'collaboration' | 'design' | 'development' | 'finance'

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
  isFeatured: boolean
  isVerified: boolean
  isBestseller: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  version: string
  compatibility: string[]
  features: string[]
}

interface Vendor {
  id: string
  name: string
  logo?: string
  description: string
  website: string
  email: string
  status: VendorStatus
  productCount: number
  totalSales: number
  rating: number
  reviewCount: number
  isVerified: boolean
  joinedAt: string
  location: string
}

interface Review {
  id: string
  productId: string
  author: {
    name: string
    avatar?: string
  }
  rating: number
  title: string
  content: string
  helpful: number
  createdAt: string
  verified: boolean
}

interface Collection {
  id: string
  name: string
  description: string
  productCount: number
  image: string
  isFeatured: boolean
}

interface Order {
  id: string
  product: Product
  customer: string
  status: 'pending' | 'completed' | 'refunded' | 'cancelled'
  amount: number
  date: string
}

// Mock Data
const mockVendors: Vendor[] = [
  { id: 'v1', name: 'ProTools Inc', description: 'Enterprise productivity solutions', website: 'https://protools.com', email: 'contact@protools.com', status: 'verified', productCount: 12, totalSales: 45000, rating: 4.8, reviewCount: 234, isVerified: true, joinedAt: '2022-01-15', location: 'San Francisco, CA' },
  { id: 'v2', name: 'DataFlow Labs', description: 'Advanced analytics and reporting', website: 'https://dataflow.io', email: 'hello@dataflow.io', status: 'active', productCount: 8, totalSales: 32000, rating: 4.6, reviewCount: 156, isVerified: true, joinedAt: '2022-06-20', location: 'New York, NY' },
  { id: 'v3', name: 'SecureStack', description: 'Security and compliance tools', website: 'https://securestack.dev', email: 'team@securestack.dev', status: 'verified', productCount: 5, totalSales: 28000, rating: 4.9, reviewCount: 89, isVerified: true, joinedAt: '2023-02-10', location: 'Austin, TX' }
]

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Analytics Pro',
    description: 'Comprehensive analytics dashboard with real-time insights, custom reports, and AI-powered predictions.',
    shortDescription: 'Advanced analytics for your business',
    vendor: mockVendors[1],
    category: 'analytics',
    subcategory: 'Business Intelligence',
    price: 49,
    compareAtPrice: 79,
    pricingModel: 'subscription',
    status: 'active',
    images: [],
    rating: 4.8,
    reviewCount: 234,
    downloads: 15420,
    installs: 12350,
    isFeatured: true,
    isVerified: true,
    isBestseller: true,
    tags: ['analytics', 'dashboard', 'reporting', 'AI'],
    createdAt: '2023-06-15',
    updatedAt: '2024-01-10',
    version: '3.2.1',
    compatibility: ['Chrome', 'Firefox', 'Safari', 'Edge'],
    features: ['Real-time analytics', 'Custom dashboards', 'AI insights', 'Export to PDF/CSV']
  },
  {
    id: 'p2',
    name: 'TaskMaster',
    description: 'Complete project management solution with kanban boards, time tracking, and team collaboration.',
    shortDescription: 'Project management made simple',
    vendor: mockVendors[0],
    category: 'productivity',
    subcategory: 'Project Management',
    price: 29,
    pricingModel: 'subscription',
    status: 'active',
    images: [],
    rating: 4.6,
    reviewCount: 456,
    downloads: 28900,
    installs: 24500,
    isFeatured: true,
    isVerified: true,
    isBestseller: true,
    tags: ['project management', 'kanban', 'collaboration'],
    createdAt: '2023-03-20',
    updatedAt: '2024-01-12',
    version: '2.8.0',
    compatibility: ['Chrome', 'Firefox', 'Safari'],
    features: ['Kanban boards', 'Time tracking', 'Team chat', 'File sharing']
  },
  {
    id: 'p3',
    name: 'SecureVault',
    description: 'Enterprise-grade security solution with encryption, access control, and audit logging.',
    shortDescription: 'Protect your sensitive data',
    vendor: mockVendors[2],
    category: 'security',
    subcategory: 'Data Protection',
    price: 99,
    compareAtPrice: 149,
    pricingModel: 'subscription',
    status: 'active',
    images: [],
    rating: 4.9,
    reviewCount: 89,
    downloads: 8500,
    installs: 7200,
    isFeatured: false,
    isVerified: true,
    isBestseller: false,
    tags: ['security', 'encryption', 'compliance'],
    createdAt: '2023-09-01',
    updatedAt: '2024-01-08',
    version: '1.5.2',
    compatibility: ['All browsers'],
    features: ['End-to-end encryption', 'Access control', 'Audit logs', 'Compliance reports']
  },
  {
    id: 'p4',
    name: 'FormBuilder Pro',
    description: 'Drag-and-drop form builder with conditional logic, integrations, and analytics.',
    shortDescription: 'Build forms in minutes',
    vendor: mockVendors[0],
    category: 'productivity',
    subcategory: 'Forms',
    price: 0,
    pricingModel: 'freemium',
    status: 'active',
    images: [],
    rating: 4.5,
    reviewCount: 678,
    downloads: 45200,
    installs: 38900,
    isFeatured: false,
    isVerified: true,
    isBestseller: true,
    tags: ['forms', 'surveys', 'no-code'],
    createdAt: '2022-11-10',
    updatedAt: '2024-01-05',
    version: '4.1.0',
    compatibility: ['All browsers'],
    features: ['Drag-and-drop builder', 'Conditional logic', '50+ integrations', 'Analytics']
  },
  {
    id: 'p5',
    name: 'Email Automator',
    description: 'Automated email marketing with templates, scheduling, and performance tracking.',
    shortDescription: 'Automate your email campaigns',
    vendor: mockVendors[1],
    category: 'marketing',
    subcategory: 'Email Marketing',
    price: 39,
    pricingModel: 'subscription',
    status: 'active',
    images: [],
    rating: 4.4,
    reviewCount: 312,
    downloads: 18700,
    installs: 15400,
    isFeatured: true,
    isVerified: true,
    isBestseller: false,
    tags: ['email', 'automation', 'marketing'],
    createdAt: '2023-05-25',
    updatedAt: '2024-01-11',
    version: '2.3.0',
    compatibility: ['Chrome', 'Firefox', 'Safari'],
    features: ['Email templates', 'A/B testing', 'Analytics', 'Segmentation']
  },
  {
    id: 'p6',
    name: 'CodeReview AI',
    description: 'AI-powered code review with security scanning, best practices, and suggestions.',
    shortDescription: 'Smarter code reviews',
    vendor: mockVendors[2],
    category: 'development',
    subcategory: 'Code Quality',
    price: 19,
    pricingModel: 'subscription',
    status: 'active',
    images: [],
    rating: 4.7,
    reviewCount: 145,
    downloads: 9800,
    installs: 8200,
    isFeatured: false,
    isVerified: true,
    isBestseller: false,
    tags: ['code review', 'AI', 'security'],
    createdAt: '2023-08-10',
    updatedAt: '2024-01-09',
    version: '1.8.0',
    compatibility: ['VS Code', 'JetBrains', 'GitHub'],
    features: ['AI suggestions', 'Security scanning', 'Best practices', 'Git integration']
  }
]

const mockCollections: Collection[] = [
  { id: 'c1', name: 'Staff Picks', description: 'Hand-selected by our team', productCount: 12, image: '', isFeatured: true },
  { id: 'c2', name: 'New This Week', description: 'Fresh additions to the marketplace', productCount: 8, image: '', isFeatured: true },
  { id: 'c3', name: 'Essential Tools', description: 'Must-have apps for every business', productCount: 15, image: '', isFeatured: true },
  { id: 'c4', name: 'Top Free Apps', description: 'Best free tools available', productCount: 20, image: '', isFeatured: false }
]

const mockReviews: Review[] = [
  { id: 'r1', productId: 'p1', author: { name: 'John D.' }, rating: 5, title: 'Excellent analytics tool!', content: 'This has transformed how we track our business metrics. Highly recommended!', helpful: 45, createdAt: '2024-01-10', verified: true },
  { id: 'r2', productId: 'p1', author: { name: 'Sarah M.' }, rating: 4, title: 'Great features, minor bugs', content: 'Love the dashboard customization. Had some issues with exports but support was helpful.', helpful: 23, createdAt: '2024-01-08', verified: true },
  { id: 'r3', productId: 'p2', author: { name: 'Mike R.' }, rating: 5, title: 'Best project management tool', content: 'We switched from competitors and never looked back. The kanban feature is amazing.', helpful: 67, createdAt: '2024-01-05', verified: true }
]

export default function MarketplaceClient() {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedPricing, setSelectedPricing] = useState<PricingModel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])

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

  const featuredProducts = mockProducts.filter(p => p.isFeatured)
  const bestsellers = mockProducts.filter(p => p.isBestseller)

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'productivity': return <Zap className="w-4 h-4" />
      case 'analytics': return <BarChart3 className="w-4 h-4" />
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'collaboration': return <Users className="w-4 h-4" />
      case 'design': return <Layers className="w-4 h-4" />
      case 'development': return <Box className="w-4 h-4" />
      case 'finance': return <DollarSign className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'productivity': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'analytics': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'marketing': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'security': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'collaboration': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'design': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      case 'development': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'finance': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatPrice = (price: number, model: PricingModel) => {
    if (model === 'free') return 'Free'
    if (model === 'freemium') return 'Free+'
    return `$${price}/mo`
  }

  // Stats
  const stats = {
    totalProducts: mockProducts.length,
    totalVendors: mockVendors.length,
    totalDownloads: mockProducts.reduce((sum, p) => sum + p.downloads, 0),
    avgRating: (mockProducts.reduce((sum, p) => sum + p.rating, 0) / mockProducts.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">App Marketplace</h1>
                <p className="text-white/80">Discover and install powerful apps</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Package className="w-4 h-4 mr-2" />
                My Apps
              </Button>
              <Button className="bg-white text-purple-700 hover:bg-white/90">
                <Plus className="w-4 h-4 mr-2" />
                Submit App
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Total Apps</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Vendors</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalVendors}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Download className="w-4 h-4" />
                <span className="text-sm">Downloads</span>
              </div>
              <p className="text-2xl font-bold">{(stats.totalDownloads / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="browse" className="rounded-lg">
              <Store className="w-4 h-4 mr-2" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="featured" className="rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="collections" className="rounded-lg">
              <Layers className="w-4 h-4 mr-2" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="vendors" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Vendors
            </TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <select
                    className="text-sm border rounded-md px-3 py-2 bg-background"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                  >
                    <option value="all">All Categories</option>
                    <option value="productivity">Productivity</option>
                    <option value="analytics">Analytics</option>
                    <option value="marketing">Marketing</option>
                    <option value="security">Security</option>
                    <option value="development">Development</option>
                  </select>
                  <select
                    className="text-sm border rounded-md px-3 py-2 bg-background"
                    value={selectedPricing}
                    onChange={(e) => setSelectedPricing(e.target.value as PricingModel | 'all')}
                  >
                    <option value="all">All Pricing</option>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="subscription">Subscription</option>
                    <option value="one_time">One-time</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  isWishlisted={wishlist.includes(product.id)}
                  onWishlist={() => toggleWishlist(product.id)}
                  onSelect={() => setSelectedProduct(product)}
                  getCategoryIcon={getCategoryIcon}
                  getCategoryColor={getCategoryColor}
                  formatPrice={formatPrice}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No apps found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-32 flex items-center justify-center">
                      <Package className="w-16 h-16 text-white/50" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold">{product.name}</h3>
                            {product.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                            {product.isBestseller && <Badge className="bg-orange-100 text-orange-700">Bestseller</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">by {product.vendor.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{formatPrice(product.price, product.pricingModel)}</p>
                          {product.compareAtPrice && (
                            <p className="text-sm text-muted-foreground line-through">${product.compareAtPrice}/mo</p>
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">{product.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {product.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {(product.downloads / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Install
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockCollections.map(collection => (
                <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className={`h-32 bg-gradient-to-br ${
                      collection.id === 'c1' ? 'from-purple-500 to-pink-500' :
                      collection.id === 'c2' ? 'from-blue-500 to-cyan-500' :
                      collection.id === 'c3' ? 'from-green-500 to-emerald-500' :
                      'from-orange-500 to-red-500'
                    } flex items-center justify-center`}>
                      <Layers className="w-12 h-12 text-white/50" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold mb-1">{collection.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{collection.productCount} apps</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockVendors.map(vendor => (
                <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
                          {vendor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{vendor.name}</h3>
                          {vendor.isVerified && <Shield className="w-4 h-4 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{vendor.location}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{vendor.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <p className="text-xl font-bold">{vendor.productCount}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{vendor.rating}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">{(vendor.totalSales / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">Sales</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Product Detail Dialog */}
        {selectedProduct && (
          <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedProduct.name}</span>
                  {selectedProduct.isVerified && <Shield className="w-5 h-5 text-blue-500" />}
                  {selectedProduct.isBestseller && <Badge className="bg-orange-100 text-orange-700">Bestseller</Badge>}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 h-48 rounded-lg flex items-center justify-center">
                  <Package className="w-24 h-24 text-purple-300" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">by {selectedProduct.vendor.name}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {selectedProduct.rating} ({selectedProduct.reviewCount} reviews)
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {(selectedProduct.downloads / 1000).toFixed(0)}K downloads
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">{formatPrice(selectedProduct.price, selectedProduct.pricingModel)}</p>
                    {selectedProduct.compareAtPrice && (
                      <p className="text-sm text-muted-foreground line-through">${selectedProduct.compareAtPrice}/mo</p>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground">{selectedProduct.description}</p>

                <div>
                  <h4 className="font-semibold mb-3">Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Install Now
                  </Button>
                  <Button variant="outline" onClick={() => toggleWishlist(selectedProduct.id)}>
                    <Heart className={`w-4 h-4 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

// Product Card Component
function ProductCard({
  product,
  viewMode,
  isWishlisted,
  onWishlist,
  onSelect,
  getCategoryIcon,
  getCategoryColor,
  formatPrice
}: {
  product: Product
  viewMode: 'grid' | 'list'
  isWishlisted: boolean
  onWishlist: () => void
  onSelect: () => void
  getCategoryIcon: (category: Category) => JSX.Element
  getCategoryColor: (category: Category) => string
  formatPrice: (price: number, model: PricingModel) => string
}) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center`}>
              <Package className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{product.name}</h4>
                {product.isVerified && <Shield className="w-4 h-4 text-blue-500" />}
                {product.isBestseller && <Badge className="bg-orange-100 text-orange-700 text-xs">Bestseller</Badge>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{product.shortDescription}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {product.rating}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Download className="w-3 h-3" />
                  {(product.downloads / 1000).toFixed(0)}K
                </span>
                <Badge className={getCategoryColor(product.category)}>{product.category}</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-600">{formatPrice(product.price, product.pricingModel)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onWishlist}>
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button size="sm" onClick={onSelect}>View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-lg flex items-center justify-center relative">
          <Package className="w-12 h-12 text-purple-300" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-gray-800/80"
            onClick={onWishlist}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold line-clamp-1">{product.name}</h4>
            {product.isVerified && <Shield className="w-4 h-4 text-blue-500" />}
          </div>
          <p className="text-xs text-muted-foreground mb-2">by {product.vendor.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.shortDescription}</p>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getCategoryColor(product.category)}>
              {getCategoryIcon(product.category)}
              <span className="ml-1">{product.category}</span>
            </Badge>
            {product.isBestseller && <Badge variant="outline" className="text-orange-600">Bestseller</Badge>}
          </div>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {product.rating} ({product.reviewCount})
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Download className="w-4 h-4" />
              {(product.downloads / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <p className="text-lg font-bold text-purple-600">{formatPrice(product.price, product.pricingModel)}</p>
            <Button size="sm" onClick={onSelect}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
