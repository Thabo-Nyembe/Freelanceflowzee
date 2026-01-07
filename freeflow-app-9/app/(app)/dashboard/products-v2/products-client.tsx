'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Package,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Plus,
  Zap,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  Copy,
  Archive,
  RefreshCw,
  Tag,
  Percent,
  Globe,
  Clock,
  CheckCircle,
  Grid3X3,
  List,
  MoreHorizontal,
  Link2,
  CreditCard,
  Repeat,
  Box,
  Truck,
  ToggleLeft,
  ToggleRight,
  ArrowUpRight,
  Target,
  Activity
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




import { useProducts, useProductStats, type Product } from '@/lib/hooks/use-products'

// Stripe-level types
type ProductStatus = 'active' | 'draft' | 'archived' | 'discontinued'
type PricingType = 'one_time' | 'recurring' | 'metered' | 'tiered'
type BillingInterval = 'day' | 'week' | 'month' | 'year'
type TaxBehavior = 'inclusive' | 'exclusive' | 'unspecified'

interface Price {
  id: string
  productId: string
  nickname: string
  unitAmount: number
  currency: string
  type: PricingType
  billingInterval?: BillingInterval
  intervalCount?: number
  trialDays?: number
  taxBehavior: TaxBehavior
  active: boolean
  metadata: Record<string, string>
}

interface StripeProduct {
  id: string
  name: string
  description: string
  images: string[]
  status: ProductStatus
  defaultPrice?: Price
  prices: Price[]
  category: string
  metadata: Record<string, string>
  features: string[]
  taxCode?: string
  shippable: boolean
  unitLabel?: string
  url?: string
  createdAt: string
  updatedAt: string
  // Analytics
  revenue: number
  subscribers: number
  mrr: number
  churnRate: number
  conversionRate: number
  averageOrderValue: number
}

interface Coupon {
  id: string
  name: string
  percentOff?: number
  amountOff?: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  durationMonths?: number
  maxRedemptions?: number
  timesRedeemed: number
  valid: boolean
  expiresAt?: string
}

interface TaxRate {
  id: string
  displayName: string
  description: string
  percentage: number
  inclusive: boolean
  country: string
  state?: string
  active: boolean
}

interface InventoryItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  reservedQuantity: number
  reorderPoint: number
  reorderQuantity: number
  location: string
  lastRestocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
}

interface ProductsClientProps {
  initialProducts: Product[]
}

// Mock Stripe-level data
const mockProducts: StripeProduct[] = [
  {
    id: 'prod_1',
    name: 'Pro Plan',
    description: 'Advanced features for growing teams',
    images: ['/products/pro-plan.png'],
    status: 'active',
    prices: [
      { id: 'price_1', productId: 'prod_1', nickname: 'Monthly', unitAmount: 4900, currency: 'usd', type: 'recurring', billingInterval: 'month', intervalCount: 1, trialDays: 14, taxBehavior: 'exclusive', active: true, metadata: {} },
      { id: 'price_2', productId: 'prod_1', nickname: 'Yearly', unitAmount: 47900, currency: 'usd', type: 'recurring', billingInterval: 'year', intervalCount: 1, trialDays: 14, taxBehavior: 'exclusive', active: true, metadata: {} }
    ],
    category: 'subscription',
    metadata: { tier: 'pro', popular: 'true' },
    features: ['Unlimited projects', 'Team collaboration', 'Priority support', 'Advanced analytics', 'Custom integrations'],
    taxCode: 'txcd_10000000',
    shippable: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    revenue: 245000,
    subscribers: 512,
    mrr: 24500,
    churnRate: 2.3,
    conversionRate: 8.5,
    averageOrderValue: 478
  },
  {
    id: 'prod_2',
    name: 'Enterprise Plan',
    description: 'Custom solutions for large organizations',
    images: ['/products/enterprise.png'],
    status: 'active',
    prices: [
      { id: 'price_3', productId: 'prod_2', nickname: 'Monthly', unitAmount: 19900, currency: 'usd', type: 'recurring', billingInterval: 'month', intervalCount: 1, taxBehavior: 'exclusive', active: true, metadata: {} },
      { id: 'price_4', productId: 'prod_2', nickname: 'Yearly', unitAmount: 199000, currency: 'usd', type: 'recurring', billingInterval: 'year', intervalCount: 1, taxBehavior: 'exclusive', active: true, metadata: {} }
    ],
    category: 'subscription',
    metadata: { tier: 'enterprise' },
    features: ['Everything in Pro', 'SSO/SAML', 'Dedicated support', 'SLA guarantee', 'Custom contracts', 'Audit logs'],
    taxCode: 'txcd_10000000',
    shippable: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    revenue: 598000,
    subscribers: 45,
    mrr: 89550,
    churnRate: 0.8,
    conversionRate: 15.2,
    averageOrderValue: 13289
  },
  {
    id: 'prod_3',
    name: 'Starter Plan',
    description: 'Perfect for individuals and small teams',
    images: ['/products/starter.png'],
    status: 'active',
    prices: [
      { id: 'price_5', productId: 'prod_3', nickname: 'Monthly', unitAmount: 1900, currency: 'usd', type: 'recurring', billingInterval: 'month', intervalCount: 1, trialDays: 7, taxBehavior: 'exclusive', active: true, metadata: {} }
    ],
    category: 'subscription',
    metadata: { tier: 'starter' },
    features: ['5 projects', 'Basic analytics', 'Email support'],
    taxCode: 'txcd_10000000',
    shippable: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    revenue: 45200,
    subscribers: 1250,
    mrr: 23750,
    churnRate: 5.2,
    conversionRate: 12.3,
    averageOrderValue: 36
  },
  {
    id: 'prod_4',
    name: 'API Credits Pack',
    description: '10,000 API credits for metered usage',
    images: ['/products/api-credits.png'],
    status: 'active',
    prices: [
      { id: 'price_6', productId: 'prod_4', nickname: 'Credits Pack', unitAmount: 9900, currency: 'usd', type: 'one_time', taxBehavior: 'exclusive', active: true, metadata: {} }
    ],
    category: 'credits',
    metadata: { credits: '10000' },
    features: ['10,000 API calls', 'Never expires', 'Priority processing'],
    taxCode: 'txcd_10000000',
    shippable: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-15',
    revenue: 89100,
    subscribers: 0,
    mrr: 0,
    churnRate: 0,
    conversionRate: 25.4,
    averageOrderValue: 99
  },
  {
    id: 'prod_5',
    name: 'Premium Support',
    description: '24/7 dedicated support add-on',
    images: ['/products/support.png'],
    status: 'active',
    prices: [
      { id: 'price_7', productId: 'prod_5', nickname: 'Monthly', unitAmount: 29900, currency: 'usd', type: 'recurring', billingInterval: 'month', intervalCount: 1, taxBehavior: 'exclusive', active: true, metadata: {} }
    ],
    category: 'add-on',
    metadata: { type: 'support' },
    features: ['24/7 phone support', 'Dedicated account manager', '1-hour response SLA', 'Onboarding assistance'],
    taxCode: 'txcd_10000000',
    shippable: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-01',
    revenue: 35880,
    subscribers: 12,
    mrr: 3588,
    churnRate: 1.5,
    conversionRate: 4.8,
    averageOrderValue: 299
  }
]

const mockCoupons: Coupon[] = [
  { id: 'coupon_1', name: 'LAUNCH20', percentOff: 20, duration: 'once', maxRedemptions: 1000, timesRedeemed: 342, valid: true, expiresAt: '2024-12-31' },
  { id: 'coupon_2', name: 'ENTERPRISE50', percentOff: 50, duration: 'repeating', durationMonths: 3, maxRedemptions: 50, timesRedeemed: 12, valid: true },
  { id: 'coupon_3', name: 'FRIEND10', amountOff: 1000, currency: 'usd', duration: 'forever', timesRedeemed: 856, valid: true },
  { id: 'coupon_4', name: 'SUMMER25', percentOff: 25, duration: 'once', maxRedemptions: 500, timesRedeemed: 500, valid: false }
]

const mockTaxRates: TaxRate[] = [
  { id: 'tax_1', displayName: 'US Sales Tax', description: 'Standard US sales tax', percentage: 8.25, inclusive: false, country: 'US', active: true },
  { id: 'tax_2', displayName: 'EU VAT', description: 'European Union VAT', percentage: 20, inclusive: true, country: 'EU', active: true },
  { id: 'tax_3', displayName: 'UK VAT', description: 'United Kingdom VAT', percentage: 20, inclusive: true, country: 'GB', active: true },
  { id: 'tax_4', displayName: 'CA GST', description: 'Canadian GST', percentage: 5, inclusive: false, country: 'CA', active: true }
]

const mockInventory: InventoryItem[] = [
  { productId: 'prod_4', productName: 'API Credits Pack', sku: 'SKU-API-10K', quantity: 9999, reservedQuantity: 0, reorderPoint: 0, reorderQuantity: 0, location: 'Digital', lastRestocked: '2024-01-01', status: 'in_stock' }
]

// Enhanced Competitive Upgrade Mock Data
const mockProductsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Best Seller', description: 'Pro Plan revenue up 45% this quarter. Consider feature expansion.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Sales' },
  { id: '2', type: 'info' as const, title: 'Pricing Opportunity', description: 'Enterprise tier underpriced vs competitors by 15%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Pricing' },
  { id: '3', type: 'warning' as const, title: 'Low Stock', description: 'API Credits Pack approaching inventory threshold.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Inventory' },
]

const mockProductsCollaborators = [
  { id: '1', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Pricing Analyst', avatar: '/avatars/pricing.jpg', status: 'online' as const, role: 'Analyst' },
  { id: '3', name: 'Sales Lead', avatar: '/avatars/sales.jpg', status: 'busy' as const, role: 'Sales' },
]

const mockProductsPredictions = [
  { id: '1', title: 'Q2 Revenue', prediction: '$450K product revenue projected', confidence: 82, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'New Launches', prediction: '2 new products ready for launch', confidence: 90, trend: 'stable' as const, impact: 'medium' as const },
]

const mockProductsActivities = [
  { id: '1', user: 'System', action: 'Product sold', target: 'Enterprise Plan ($999)', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Product Team', action: 'Updated pricing for', target: 'Pro Plan', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Inventory', action: 'Restocked', target: 'API Credits Pack', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// Quick actions are defined inside component to access state setters

export default function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [activeTab, setActiveTab] = useState('catalog')
  const [selectedCategory, setSelectedCategory] = useState<ProductStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [showCreateProduct, setShowCreateProduct] = useState(false)
  const [showCreateCoupon, setShowCreateCoupon] = useState(false)
  const [showCreatePrice, setShowCreatePrice] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [showEditPrice, setShowEditPrice] = useState(false)
  const [showEditTaxRate, setShowEditTaxRate] = useState(false)
  const [showEditCoupon, setShowEditCoupon] = useState(false)
  const [showCreateTaxRate, setShowCreateTaxRate] = useState(false)
  const [showShippingZones, setShowShippingZones] = useState(false)
  const [showCarrierSettings, setShowCarrierSettings] = useState(false)
  const [showWebhookSettings, setShowWebhookSettings] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)
  const [localProducts, setLocalProducts] = useState(mockProducts)
  const [localCoupons, setLocalCoupons] = useState(mockCoupons)

  const { data: apiProducts } = useProducts({
    status: selectedCategory === 'all' ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined
  })
  const { stats } = useProductStats()

  // Calculate stats from mock data
  const totalRevenue = mockProducts.reduce((sum, p) => sum + p.revenue, 0)
  const totalMRR = mockProducts.reduce((sum, p) => sum + p.mrr, 0)
  const totalSubscribers = mockProducts.reduce((sum, p) => sum + p.subscribers, 0)
  const activeProducts = mockProducts.filter(p => p.status === 'active').length
  const avgConversion = mockProducts.reduce((sum, p) => sum + p.conversionRate, 0) / mockProducts.length
  const avgChurn = mockProducts.filter(p => p.mrr > 0).reduce((sum, p) => sum + p.churnRate, 0) / mockProducts.filter(p => p.mrr > 0).length

  const filteredProducts = useMemo(() => {
    return localProducts.filter(product => {
      const matchesStatus = selectedCategory === 'all' || product.status === selectedCategory
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [selectedCategory, searchQuery, localProducts])

  const formatCurrency = (amount: number, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount / 100)
  }

  const formatPrice = (amount: number, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2
    }).format(amount / 100)
  }

  // Handlers
  const handleCreateProduct = () => {
    setShowCreateProduct(true)
  }

  const handleCreateCoupon = () => {
    setShowCreateCoupon(true)
  }

  const handleImportProducts = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          if (file.name.endsWith('.json')) {
            const imported = JSON.parse(content)
            if (imported.products && Array.isArray(imported.products)) {
              setLocalProducts(prev => [...prev, ...imported.products])
              toast.success(`Imported ${imported.products.length} products successfully`)
            } else if (Array.isArray(imported)) {
              setLocalProducts(prev => [...prev, ...imported])
              toast.success(`Imported ${imported.length} products successfully`)
            }
          } else {
            // CSV parsing
            const lines = content.split('\n')
            const headers = lines[0].split(',')
            const products = lines.slice(1).filter(line => line.trim()).map((line, idx) => {
              const values = line.split(',').map(v => v.replace(/^"|"$/g, ''))
              return {
                id: `prod_import_${Date.now()}_${idx}`,
                name: values[headers.indexOf('Name')] || values[1] || `Imported Product ${idx + 1}`,
                description: values[headers.indexOf('Description')] || values[2] || '',
                status: 'draft' as ProductStatus,
                images: [],
                prices: [],
                category: 'subscription',
                metadata: {},
                features: [],
                shippable: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                revenue: 0,
                subscribers: 0,
                mrr: 0,
                churnRate: 0,
                conversionRate: 0,
                averageOrderValue: 0
              }
            })
            setLocalProducts(prev => [...prev, ...products])
            toast.success(`Imported ${products.length} products from CSV`)
          }
        } catch (error) {
          toast.error('Failed to parse import file. Please check the format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleExportProducts = () => {
    const headers = ['ID', 'Name', 'Description', 'Status', 'Category', 'Revenue', 'Subscribers', 'MRR']
    const rows = localProducts.map(p => [
      p.id,
      p.name,
      p.description,
      p.status,
      p.category,
      p.revenue.toString(),
      p.subscribers.toString(),
      p.mrr.toString()
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Products exported successfully')
  }

  const handleDuplicateProduct = (product: StripeProduct) => {
    const duplicated = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Copy)`,
      status: 'draft' as ProductStatus
    }
    setLocalProducts(prev => [...prev, duplicated])
    toast.success(`${product.name} duplicated successfully`)
  }

  const handleDeleteCoupon = (coupon: Coupon) => {
    if (confirm(`Are you sure you want to delete coupon "${coupon.name}"?`)) {
      setLocalCoupons(prev => prev.filter(c => c.id !== coupon.id))
      setSelectedCoupon(null)
      toast.success(`Coupon ${coupon.name} deleted successfully`)
    }
  }

  // Quick actions with real functionality
  const productQuickActions = [
    { id: '1', label: 'New Product', icon: 'plus', action: () => setShowCreateProduct(true), variant: 'default' as const },
    { id: '2', label: 'Update Pricing', icon: 'dollar', action: () => setShowCreatePrice(true), variant: 'default' as const },
    { id: '3', label: 'Analytics', icon: 'chart', action: () => setActiveTab('analytics'), variant: 'outline' as const },
  ]

  const handleArchiveProduct = (product: StripeProduct) => {
    if (confirm(`Are you sure you want to archive "${product.name}"?`)) {
      setLocalProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, status: 'archived' as ProductStatus } : p
      ))
      setSelectedProduct(null)
      toast.success(`${product.name} has been archived`)
    }
  }

  const handleBulkEdit = () => {
    setShowBulkEditDialog(true)
  }

  const handleExportJSON = () => {
    const data = {
      products: localProducts,
      coupons: localCoupons,
      taxRates: mockTaxRates,
      exportedAt: new Date().toISOString()
    }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-catalog-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Catalog exported as JSON')
  }

  const handleSyncAll = () => {
    setLocalProducts(mockProducts)
    setLocalCoupons(mockCoupons)
    toast.success('All data synced successfully')
  }

  const handleQuickAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'New Product':
        setShowCreateProduct(true)
        break
      case 'Add Price':
        setShowCreatePrice(true)
        break
      case 'Coupon':
        setShowCreateCoupon(true)
        break
      case 'Tax Rate':
        setShowCreateTaxRate(true)
        break
      case 'Inventory':
        setSettingsTab('inventory')
        setActiveTab('settings')
        break
      case 'Analytics':
        setActiveTab('analytics')
        break
      case 'Export':
        handleExportProducts()
        break
      case 'Sync':
        handleSyncAll()
        break
      default:
        toast.info(`${actionLabel} action triggered`)
    }
  }

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'discontinued': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const getPricingTypeColor = (type: PricingType) => {
    switch (type) {
      case 'recurring': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'one_time': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'metered': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'tiered': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'subscription': return <Repeat className="w-4 h-4" />
      case 'credits': return <Zap className="w-4 h-4" />
      case 'add-on': return <Plus className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              Product Catalog
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Stripe-Level Product & Pricing Management</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportProducts}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setShowCreateProduct(true)}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-violet-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Products</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProducts}</p>
              <p className="text-xs text-green-600">+3 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue * 100)}</p>
              <p className="text-xs text-green-600">+18.3% growth</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">MRR</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalMRR * 100)}</p>
              <p className="text-xs text-green-600">+12.5% growth</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Subscribers</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers.toLocaleString()}</p>
              <p className="text-xs text-green-600">+156 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Conversion</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgConversion.toFixed(1)}%</p>
              <p className="text-xs text-green-600">+2.1% improvement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Churn Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgChurn.toFixed(1)}%</p>
              <p className="text-xs text-green-600">-0.5% decrease</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border">
            <TabsTrigger value="catalog" className="gap-2">
              <Package className="w-4 h-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="taxes" className="gap-2">
              <Percent className="w-4 h-4" />
              Tax Rates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Catalog Tab */}
          <TabsContent value="catalog" className="mt-6">
            {/* Catalog Overview Banner */}
            <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Package className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Product Catalog</h3>
                      <p className="text-violet-100">Manage your complete product catalog</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredProducts.length}</div>
                      <div className="text-sm text-violet-100">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{filteredProducts.filter(p => p.status === 'active').length}</div>
                      <div className="text-sm text-violet-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(totalRevenue * 100)}</div>
                      <div className="text-sm text-violet-100">Revenue</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ProductStatus | 'all')}
                    className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Products Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                              {getCategoryIcon(product.category)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                              <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product) }}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          {product.prices.slice(0, 2).map((price) => (
                            <div key={price.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{price.nickname}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{formatPrice(price.unitAmount, price.currency)}</span>
                                {price.billingInterval && (
                                  <span className="text-xs text-gray-400">/{price.billingInterval}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs border-t pt-3">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Revenue</p>
                            <p className="font-semibold">{formatCurrency(product.revenue * 100)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Subscribers</p>
                            <p className="font-semibold">{product.subscribers.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Conversion</p>
                            <p className="font-semibold">{product.conversionRate}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors flex items-center justify-between"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                              {getCategoryIcon(product.category)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                                <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(product.revenue * 100)}</p>
                              <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{product.subscribers.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">Subscribers</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(product.mrr * 100)}</p>
                              <p className="text-xs text-gray-500">MRR</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product) }}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="mt-6">
            {/* Pricing Overview Banner */}
            <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Pricing Management</h3>
                      <p className="text-green-100">Configure prices, billing intervals, and trials</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockProducts.flatMap(p => p.prices).length}</div>
                      <div className="text-sm text-green-100">Prices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockProducts.flatMap(p => p.prices).filter(p => p.type === 'recurring').length}</div>
                      <div className="text-sm text-green-100">Recurring</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(totalMRR * 100)}</div>
                      <div className="text-sm text-green-100">MRR</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Price List</h3>
                  <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setShowCreatePrice(true)}>
                    <Plus className="w-4 h-4" />
                    Add Price
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mockProducts.flatMap(product =>
                        product.prices.map(price => ({ ...price, productName: product.name }))
                      ).map((price) => (
                        <div key={price.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                {price.type === 'recurring' ? <Repeat className="w-5 h-5 text-blue-500" /> : <CreditCard className="w-5 h-5 text-green-500" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{price.productName} - {price.nickname}</h4>
                                  <Badge className={getPricingTypeColor(price.type)}>{price.type}</Badge>
                                  {price.active ? (
                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {price.id} • {price.taxBehavior === 'inclusive' ? 'Tax inclusive' : 'Tax exclusive'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xl font-bold">{formatPrice(price.unitAmount, price.currency)}</p>
                                {price.billingInterval && (
                                  <p className="text-sm text-gray-500">per {price.billingInterval}</p>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setShowEditPrice(true)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {price.trialDays && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              {price.trialDays}-day free trial
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pricing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Prices</span>
                        <span className="font-semibold">{mockProducts.flatMap(p => p.prices).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Recurring</span>
                        <span className="font-semibold">{mockProducts.flatMap(p => p.prices).filter(p => p.type === 'recurring').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">One-time</span>
                        <span className="font-semibold">{mockProducts.flatMap(p => p.prices).filter(p => p.type === 'one_time').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Active</span>
                        <span className="font-semibold text-green-600">{mockProducts.flatMap(p => p.prices).filter(p => p.active).length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Currencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['USD', 'EUR', 'GBP', 'CAD'].map((currency) => (
                        <div key={currency} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="font-medium">{currency}</span>
                          <Badge variant="outline">{currency === 'USD' ? 'Primary' : 'Secondary'}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="mt-6">
            {/* Coupons Overview Banner */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Tag className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Coupons & Discounts</h3>
                      <p className="text-orange-100">Create promotional codes and track redemptions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockCoupons.length}</div>
                      <div className="text-sm text-orange-100">Coupons</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockCoupons.filter(c => c.valid).length}</div>
                      <div className="text-sm text-orange-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockCoupons.reduce((sum, c) => sum + c.timesRedeemed, 0)}</div>
                      <div className="text-sm text-orange-100">Redeemed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Coupons & Discounts</h3>
                <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setShowCreateCoupon(true)}>
                  <Plus className="w-4 h-4" />
                  Create Coupon
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockCoupons.map((coupon) => (
                  <Card key={coupon.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCoupon(coupon)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                          <Tag className="w-5 h-5 text-violet-600" />
                        </div>
                        {coupon.valid ? (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">Expired</Badge>
                        )}
                      </div>
                      <h4 className="font-bold text-lg mb-1">{coupon.name}</h4>
                      <div className="text-2xl font-bold text-violet-600 mb-2">
                        {coupon.percentOff ? `${coupon.percentOff}% OFF` : formatPrice(coupon.amountOff || 0, coupon.currency)}
                      </div>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Duration</span>
                          <span className="font-medium capitalize">{coupon.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Redeemed</span>
                          <span className="font-medium">{coupon.timesRedeemed}{coupon.maxRedemptions ? `/${coupon.maxRedemptions}` : ''}</span>
                        </div>
                        {coupon.expiresAt && (
                          <div className="flex items-center justify-between">
                            <span>Expires</span>
                            <span className="font-medium">{new Date(coupon.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      {coupon.maxRedemptions && (
                        <Progress
                          value={(coupon.timesRedeemed / coupon.maxRedemptions) * 100}
                          className="mt-3 h-1.5"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tax Rates Tab */}
          <TabsContent value="taxes" className="mt-6">
            {/* Tax Rates Overview Banner */}
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Percent className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Tax Configuration</h3>
                      <p className="text-blue-100">Manage tax rates and automatic calculation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockTaxRates.length}</div>
                      <div className="text-sm text-blue-100">Tax Rates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{mockTaxRates.filter(t => t.active).length}</div>
                      <div className="text-sm text-blue-100">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{new Set(mockTaxRates.map(t => t.country)).size}</div>
                      <div className="text-sm text-blue-100">Countries</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tax Rates</h3>
                  <Button className="bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setShowCreateTaxRate(true)}>
                    <Plus className="w-4 h-4" />
                    Add Tax Rate
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {mockTaxRates.map((tax) => (
                        <div key={tax.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{tax.displayName}</h4>
                                  {tax.active ? (
                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                  ) : (
                                    <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{tax.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xl font-bold">{tax.percentage}%</p>
                                <p className="text-sm text-gray-500">{tax.inclusive ? 'Inclusive' : 'Exclusive'}</p>
                              </div>
                              <Badge variant="outline">{tax.country}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => setShowEditTaxRate(true)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tax Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Auto Tax Calculation</p>
                          <p className="text-xs text-gray-500">Stripe Tax enabled</p>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Tax ID Collection</p>
                          <p className="text-xs text-gray-500">Collect VAT/GST IDs</p>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">Tax Inclusive Pricing</p>
                          <p className="text-xs text-gray-500">Include tax in displayed prices</p>
                        </div>
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            {/* Analytics Overview Banner */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Product Analytics</h3>
                      <p className="text-indigo-100">Revenue, subscriptions, and performance insights</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatCurrency(totalRevenue * 100)}</div>
                      <div className="text-sm text-indigo-100">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
                      <div className="text-sm text-indigo-100">Subscribers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{avgConversion.toFixed(1)}%</div>
                      <div className="text-sm text-indigo-100">Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{avgChurn.toFixed(1)}%</div>
                      <div className="text-sm text-indigo-100">Churn</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockProducts.sort((a, b) => b.revenue - a.revenue).map((product, idx) => {
                        const maxRevenue = Math.max(...mockProducts.map(p => p.revenue))
                        const percent = (product.revenue / maxRevenue) * 100
                        return (
                          <div key={product.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 w-6">{idx + 1}.</span>
                                <span className="font-medium">{product.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{formatCurrency(product.revenue * 100)}</span>
                                <span className="text-xs text-gray-500 ml-2">({((product.revenue / totalRevenue) * 100).toFixed(1)}%)</span>
                              </div>
                            </div>
                            <Progress value={percent} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">MRR Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockProducts.filter(p => p.mrr > 0).map((product) => (
                          <div key={product.id} className="flex items-center justify-between">
                            <span className="text-sm">{product.name}</span>
                            <span className="font-semibold">{formatCurrency(product.mrr * 100)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Churn by Product</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockProducts.filter(p => p.churnRate > 0).map((product) => (
                          <div key={product.id} className="flex items-center justify-between">
                            <span className="text-sm">{product.name}</span>
                            <span className={`font-semibold ${product.churnRate > 3 ? 'text-red-500' : 'text-green-500'}`}>
                              {product.churnRate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">ARPU</span>
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{formatPrice((totalRevenue / totalSubscribers) * 100)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">LTV</span>
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(((totalRevenue / totalSubscribers) / (avgChurn / 100)) * 100)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">CAC Payback</span>
                          <span className="text-sm text-green-500">3.2 months</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Trial Conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-violet-600">67%</p>
                      <p className="text-sm text-gray-500">Trial to Paid</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Active Trials</span>
                        <span className="font-semibold">234</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Converted This Month</span>
                        <span className="font-semibold">156</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Churned</span>
                        <span className="font-semibold text-red-500">78</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Settings Banner */}
            <Card className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Stripe-Level Product Management</h2>
                      <p className="text-violet-100 mt-1">Configure catalog, pricing, inventory, and integrations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{activeProducts}</div>
                      <div className="text-sm text-violet-100">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockProducts.flatMap(p => p.prices).length}</div>
                      <div className="text-sm text-violet-100">Prices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{formatCurrency(totalMRR * 100)}</div>
                      <div className="text-sm text-violet-100">MRR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalSubscribers.toLocaleString()}</div>
                      <div className="text-sm text-violet-100">Subscribers</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <Card className="col-span-3 h-fit border-0 shadow-sm">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'inventory', icon: Box, label: 'Inventory' },
                      { id: 'shipping', icon: Truck, label: 'Shipping' },
                      { id: 'integrations', icon: Link2, label: 'Integrations' },
                      { id: 'notifications', icon: Activity, label: 'Notifications' },
                      { id: 'advanced', icon: Zap, label: 'Advanced' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          settingsTab === item.id
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure default product settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Currency</div>
                          <div className="text-sm text-muted-foreground">Primary currency for new products</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>USD - US Dollar</option>
                          <option>EUR - Euro</option>
                          <option>GBP - British Pound</option>
                          <option>CAD - Canadian Dollar</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Tax Calculation</div>
                          <div className="text-sm text-muted-foreground">Enable automatic tax calculation</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Statement Descriptor</div>
                          <div className="text-sm text-muted-foreground">Appears on customer credit card statements</div>
                        </div>
                        <Input className="w-48" defaultValue="FREEFLOW KAZI" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Product Images</div>
                          <div className="text-sm text-muted-foreground">Require images for all products</div>
                        </div>
                        <ToggleLeft className="w-6 h-6 text-gray-400 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Trial Period</div>
                          <div className="text-sm text-muted-foreground">Default trial days for subscriptions</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>7 days</option>
                          <option>14 days</option>
                          <option>30 days</option>
                          <option>No trial</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Proration Behavior</div>
                          <div className="text-sm text-muted-foreground">How to handle subscription changes</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>Create prorations</option>
                          <option>None</option>
                          <option>Always invoice</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'inventory' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Box className="w-5 h-5" />
                        Inventory Settings
                      </CardTitle>
                      <CardDescription>Manage stock levels and tracking</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Track Inventory</div>
                          <div className="text-sm text-muted-foreground">Enable inventory tracking for physical products</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Low Stock Threshold</div>
                          <div className="text-sm text-muted-foreground">Alert when stock falls below</div>
                        </div>
                        <Input className="w-24" type="number" defaultValue="10" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Out of Stock Behavior</div>
                          <div className="text-sm text-muted-foreground">What happens when stock is zero</div>
                        </div>
                        <select className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                          <option>Allow backorders</option>
                          <option>Mark as unavailable</option>
                          <option>Hide product</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Reserve Stock</div>
                          <div className="text-sm text-muted-foreground">Reserve inventory during checkout</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">SKU Auto-Generation</div>
                          <div className="text-sm text-muted-foreground">Automatically generate SKUs for new products</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'shipping' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Settings
                      </CardTitle>
                      <CardDescription>Configure shipping options and rates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Enable Shipping</div>
                          <div className="text-sm text-muted-foreground">Allow physical product shipping</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Default Shipping Rate</div>
                          <div className="text-sm text-muted-foreground">Standard shipping cost</div>
                        </div>
                        <Input className="w-32" defaultValue="$9.99" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Free Shipping Threshold</div>
                          <div className="text-sm text-muted-foreground">Order minimum for free shipping</div>
                        </div>
                        <Input className="w-32" defaultValue="$99.00" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Shipping Zones</div>
                          <div className="text-sm text-muted-foreground">Configure regional shipping rates</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowShippingZones(true)}>Manage Zones</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Carrier Integration</div>
                          <div className="text-sm text-muted-foreground">Connect shipping carriers for real-time rates</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowCarrierSettings(true)}>Configure</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Integrations
                      </CardTitle>
                      <CardDescription>Connect with payment processors and platforms</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium">Stripe</div>
                            <div className="text-sm text-muted-foreground">Payment processing</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Shopify</div>
                            <div className="text-sm text-muted-foreground">E-commerce platform sync</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { window.open('https://shopify.com/admin/oauth/authorize', '_blank'); toast.success('Shopify authorization started') }}>Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Package className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">Amazon</div>
                            <div className="text-sm text-muted-foreground">Product listing sync</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { window.open('https://sellercentral.amazon.com', '_blank'); toast.success('Amazon authorization started') }}>Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">QuickBooks</div>
                            <div className="text-sm text-muted-foreground">Accounting integration</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { window.open('https://quickbooks.intuit.com/app/connect', '_blank'); toast.success('QuickBooks authorization started') }}>Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium">Zapier</div>
                            <div className="text-sm text-muted-foreground">Workflow automation</div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Connected</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>Configure alerts and notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">New Order Alerts</div>
                          <div className="text-sm text-muted-foreground">Get notified when orders are placed</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Low Stock Alerts</div>
                          <div className="text-sm text-muted-foreground">Alert when inventory is low</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Subscription Events</div>
                          <div className="text-sm text-muted-foreground">Notify on renewals, cancellations, trials</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Payment Failures</div>
                          <div className="text-sm text-muted-foreground">Alert on failed payments</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Daily Revenue Summary</div>
                          <div className="text-sm text-muted-foreground">Daily email with revenue stats</div>
                        </div>
                        <ToggleLeft className="w-6 h-6 text-gray-400 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Churn Alerts</div>
                          <div className="text-sm text-muted-foreground">Notify when churn exceeds threshold</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>Power user settings and data management</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">API Access</div>
                          <div className="text-sm text-muted-foreground">Enable Products API for integrations</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Webhook Events</div>
                          <div className="text-sm text-muted-foreground">Send product events to external services</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowWebhookSettings(true)}>Configure</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Audit Logging</div>
                          <div className="text-sm text-muted-foreground">Track all product changes</div>
                        </div>
                        <ToggleRight className="w-6 h-6 text-green-500 cursor-pointer" />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                        <div>
                          <div className="font-medium">Test Mode</div>
                          <div className="text-sm text-muted-foreground">Use test API keys for development</div>
                        </div>
                        <ToggleLeft className="w-6 h-6 text-gray-400 cursor-pointer" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportProducts}>
                          <Download className="w-6 h-6" />
                          <span>Export Catalog</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleImportProducts}>
                          <Upload className="w-6 h-6" />
                          <span>Import Products</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleExportJSON}>
                          <Archive className="w-6 h-6" />
                          <span>Backup Data</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleSyncAll}>
                          <RefreshCw className="w-6 h-6" />
                          <span>Sync All</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Package, label: 'New Product', desc: 'Create', color: 'from-violet-500 to-purple-600' },
                { icon: DollarSign, label: 'Add Price', desc: 'Pricing', color: 'from-green-500 to-emerald-600' },
                { icon: Tag, label: 'Coupon', desc: 'Discount', color: 'from-orange-500 to-red-600' },
                { icon: Percent, label: 'Tax Rate', desc: 'Configure', color: 'from-blue-500 to-cyan-600' },
                { icon: Box, label: 'Inventory', desc: 'Stock', color: 'from-amber-500 to-yellow-600' },
                { icon: BarChart3, label: 'Analytics', desc: 'Reports', color: 'from-pink-500 to-rose-600' },
                { icon: Download, label: 'Export', desc: 'Download', color: 'from-teal-500 to-green-600' },
                { icon: RefreshCw, label: 'Sync', desc: 'Update', color: 'from-indigo-500 to-blue-600' }
              ].map((action, idx) => (
                <Card
                  key={idx}
                  className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 group border-0 shadow-sm"
                  onClick={() => handleQuickAction(action.label)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockProductsAIInsights}
              title="Product Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockProductsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockProductsPredictions}
              title="Product Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockProductsActivities}
            title="Product Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={productQuickActions}
            variant="grid"
          />
        </div>

        {/* Product Detail Dialog */}
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  {selectedProduct && getCategoryIcon(selectedProduct.category)}
                </div>
                {selectedProduct?.name}
              </DialogTitle>
              <DialogDescription>
                Product ID: {selectedProduct?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(selectedProduct.status)}>{selectedProduct.status}</Badge>
                  <Badge variant="outline">{selectedProduct.category}</Badge>
                  {selectedProduct.metadata.popular === 'true' && (
                    <Badge className="bg-orange-100 text-orange-700">Popular</Badge>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p>{selectedProduct.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Pricing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedProduct.prices.map((price) => (
                      <Card key={price.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{price.nickname}</span>
                            <Badge className={getPricingTypeColor(price.type)}>{price.type}</Badge>
                          </div>
                          <p className="text-2xl font-bold">
                            {formatPrice(price.unitAmount, price.currency)}
                            {price.billingInterval && <span className="text-sm font-normal text-gray-500">/{price.billingInterval}</span>}
                          </p>
                          {price.trialDays && (
                            <p className="text-sm text-gray-500 mt-1">{price.trialDays}-day free trial</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(selectedProduct.revenue * 100)}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedProduct.subscribers.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Subscribers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatCurrency(selectedProduct.mrr * 100)}</p>
                    <p className="text-xs text-gray-500">MRR</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{selectedProduct.conversionRate}%</p>
                    <p className="text-xs text-gray-500">Conversion</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setShowEditProduct(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { if (selectedProduct) { handleDuplicateProduct(selectedProduct); setSelectedProduct(null) } }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" onClick={() => { if (selectedProduct) handleArchiveProduct(selectedProduct) }}>
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Coupon Detail Dialog */}
        <Dialog open={!!selectedCoupon} onOpenChange={() => setSelectedCoupon(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-violet-600" />
                Coupon Details
              </DialogTitle>
            </DialogHeader>
            {selectedCoupon && (
              <div className="space-y-4">
                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-1">Coupon Code</p>
                  <p className="text-2xl font-bold text-violet-600">{selectedCoupon.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Discount</p>
                    <p className="font-semibold text-xl">
                      {selectedCoupon.percentOff ? `${selectedCoupon.percentOff}%` : formatPrice(selectedCoupon.amountOff || 0, selectedCoupon.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-xl capitalize">{selectedCoupon.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Times Redeemed</p>
                    <p className="font-semibold text-xl">{selectedCoupon.timesRedeemed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max Redemptions</p>
                    <p className="font-semibold text-xl">{selectedCoupon.maxRedemptions || 'Unlimited'}</p>
                  </div>
                </div>

                {selectedCoupon.maxRedemptions && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span>{((selectedCoupon.timesRedeemed / selectedCoupon.maxRedemptions) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(selectedCoupon.timesRedeemed / selectedCoupon.maxRedemptions) * 100} />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4">
                  <Button className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => setShowEditCoupon(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(selectedCoupon?.name || ''); toast.success('Coupon code copied to clipboard') }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button variant="destructive" onClick={() => { if (selectedCoupon) handleDeleteCoupon(selectedCoupon) }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
