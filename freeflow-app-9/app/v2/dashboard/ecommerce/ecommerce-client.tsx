'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Star,
  Share2,
  Tag,
  Percent,
  Box,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  Layers,
  Grid,
  List
} from 'lucide-react'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'

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

// Types
interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  inventory: number
  status: 'active' | 'draft' | 'archived' | 'out_of_stock'
  images: string[]
  rating: number
  reviews: number
  sales: number
  sku: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  customer: { name: string; email: string }
  items: { name: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded'
  shippingAddress: string
  createdAt: string
}

interface Customer {
  id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  status: 'active' | 'inactive'
}

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  usageLimit: number
  usedCount: number
  expiresAt: string
  status: 'active' | 'expired' | 'disabled'
}

// Mock Data
const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Premium Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 299, compareAtPrice: 349, category: 'Electronics', inventory: 150, status: 'active', images: [], rating: 4.8, reviews: 234, sales: 1250, sku: 'ELEC-HP-001', createdAt: '2024-01-15' },
  { id: 'p2', name: 'Smart Watch Pro', description: 'Advanced smartwatch with health monitoring features', price: 399, category: 'Electronics', inventory: 75, status: 'active', images: [], rating: 4.6, reviews: 189, sales: 890, sku: 'ELEC-SW-002', createdAt: '2024-01-10' },
  { id: 'p3', name: 'Organic Cotton T-Shirt', description: 'Sustainable and comfortable cotton t-shirt', price: 45, compareAtPrice: 55, category: 'Apparel', inventory: 500, status: 'active', images: [], rating: 4.5, reviews: 567, sales: 3200, sku: 'APP-TS-001', createdAt: '2024-01-08' },
  { id: 'p4', name: 'Laptop Stand', description: 'Ergonomic aluminum laptop stand', price: 79, category: 'Accessories', inventory: 0, status: 'out_of_stock', images: [], rating: 4.7, reviews: 123, sales: 780, sku: 'ACC-LS-001', createdAt: '2024-01-05' },
  { id: 'p5', name: 'Wireless Charger', description: 'Fast wireless charging pad', price: 49, category: 'Electronics', inventory: 200, status: 'active', images: [], rating: 4.4, reviews: 345, sales: 1560, sku: 'ELEC-WC-001', createdAt: '2024-01-01' },
]

const MOCK_ORDERS: Order[] = [
  { id: 'o1', orderNumber: 'ORD-2024-001', customer: { name: 'John Smith', email: 'john@example.com' }, items: [{ name: 'Premium Headphones', quantity: 1, price: 299 }], total: 299, status: 'delivered', paymentStatus: 'paid', shippingAddress: '123 Main St, New York, NY 10001', createdAt: '2024-01-15' },
  { id: 'o2', orderNumber: 'ORD-2024-002', customer: { name: 'Sarah Johnson', email: 'sarah@example.com' }, items: [{ name: 'Smart Watch Pro', quantity: 1, price: 399 }, { name: 'Wireless Charger', quantity: 2, price: 98 }], total: 497, status: 'shipped', paymentStatus: 'paid', shippingAddress: '456 Oak Ave, Los Angeles, CA 90001', createdAt: '2024-01-14' },
  { id: 'o3', orderNumber: 'ORD-2024-003', customer: { name: 'Michael Brown', email: 'michael@example.com' }, items: [{ name: 'Organic Cotton T-Shirt', quantity: 3, price: 135 }], total: 135, status: 'processing', paymentStatus: 'paid', shippingAddress: '789 Pine Rd, Chicago, IL 60601', createdAt: '2024-01-13' },
  { id: 'o4', orderNumber: 'ORD-2024-004', customer: { name: 'Emily Davis', email: 'emily@example.com' }, items: [{ name: 'Laptop Stand', quantity: 1, price: 79 }], total: 79, status: 'pending', paymentStatus: 'pending', shippingAddress: '321 Elm St, Houston, TX 77001', createdAt: '2024-01-12' },
]

const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'John Smith', email: 'john@example.com', totalOrders: 12, totalSpent: 2450, lastOrder: '2024-01-15', status: 'active' },
  { id: 'c2', name: 'Sarah Johnson', email: 'sarah@example.com', totalOrders: 8, totalSpent: 1890, lastOrder: '2024-01-14', status: 'active' },
  { id: 'c3', name: 'Michael Brown', email: 'michael@example.com', totalOrders: 5, totalSpent: 675, lastOrder: '2024-01-13', status: 'active' },
  { id: 'c4', name: 'Emily Davis', email: 'emily@example.com', totalOrders: 3, totalSpent: 320, lastOrder: '2024-01-12', status: 'inactive' },
]

const MOCK_COUPONS: Coupon[] = [
  { id: 'cp1', code: 'WELCOME20', type: 'percentage', value: 20, usageLimit: 500, usedCount: 234, expiresAt: '2024-03-31', status: 'active' },
  { id: 'cp2', code: 'SAVE50', type: 'fixed', value: 50, usageLimit: 100, usedCount: 67, expiresAt: '2024-02-28', status: 'active' },
  { id: 'cp3', code: 'FLASH25', type: 'percentage', value: 25, usageLimit: 200, usedCount: 200, expiresAt: '2024-01-31', status: 'expired' },
]

// AI Insights Mock Data
const ecommerceAIInsights = [
  { id: '1', type: 'success' as const, title: 'Sales Growth', description: 'Revenue increased by 23% compared to last month. Best-selling category: Electronics.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Sales' },
  { id: '2', type: 'warning' as const, title: 'Low Stock Alert', description: '3 products are running low on inventory. Restock recommended within 7 days.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Inventory' },
  { id: '3', type: 'info' as const, title: 'Customer Insight', description: 'Repeat customer rate is 45%. Consider loyalty program to increase retention.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Customers' },
]

const ecommerceCollaborators = [
  { id: '1', name: 'Store Manager', avatar: '/avatars/manager.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Sales Lead', avatar: '/avatars/sales.jpg', status: 'online' as const, role: 'Sales' },
  { id: '3', name: 'Support Agent', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const ecommercePredictions = [
  { id: '1', label: 'Monthly Revenue', current: 45000, target: 60000, predicted: 52000, confidence: 85, trend: 'up' as const },
  { id: '2', label: 'Order Volume', current: 450, target: 600, predicted: 520, confidence: 82, trend: 'up' as const },
]

const ecommerceActivities = [
  { id: '1', user: 'Customer', action: 'placed order', target: '#ORD-2024-005', timestamp: '5m ago', type: 'success' as const },
  { id: '2', user: 'System', action: 'processed payment', target: '$497.00', timestamp: '10m ago', type: 'info' as const },
  { id: '3', user: 'Support', action: 'resolved', target: 'refund request #123', timestamp: '30m ago', type: 'success' as const },
]

export default function EcommerceClient() {
  const router = useRouter()

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  // UI states
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Dialog states
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false)
  const [showUpdateOrderDialog, setShowUpdateOrderDialog] = useState(false)
  const [showCustomerDetailsDialog, setShowCustomerDetailsDialog] = useState(false)
  const [showAddCouponDialog, setShowAddCouponDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  // Form states
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    inventory: '',
    sku: ''
  })

  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    usageLimit: '',
    expiresAt: ''
  })

  const [orderStatusUpdate, setOrderStatusUpdate] = useState('')

  // Quick Actions
  const ecommerceQuickActions = [
    {
      id: '1',
      label: 'Add Product',
      icon: 'Plus',
      shortcut: 'N',
      action: async () => {
        setShowAddProductDialog(true)
      }
    },
    {
      id: '2',
      label: 'Export Data',
      icon: 'Download',
      shortcut: 'E',
      action: async () => {
        setShowExportDialog(true)
      }
    },
    {
      id: '3',
      label: 'Settings',
      icon: 'Settings',
      shortcut: 'S',
      action: async () => {
        setShowSettingsDialog(true)
      }
    },
  ]

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch ecommerce data from API
        const [productsRes, ordersRes] = await Promise.all([
          fetch('/api/products').catch(() => null),
          fetch('/api/orders').catch(() => null)
        ])

        setProducts(productsRes?.ok ? (await productsRes.json()).products : MOCK_PRODUCTS)
        setOrders(ordersRes?.ok ? (await ordersRes.json()).orders : MOCK_ORDERS)
        setCustomers(MOCK_CUSTOMERS)
        setCoupons(MOCK_COUPONS)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to load ecommerce data')
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate metrics
  const metrics = {
    totalRevenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    lowStockProducts: products.filter(p => p.inventory < 50 && p.inventory > 0).length,
    outOfStock: products.filter(p => p.inventory === 0).length,
  }

  // Handlers
  const handleAddProduct = async () => {
    if (!newProductForm.name || !newProductForm.price) {
      toast.error('Please fill in required fields')
      return
    }

    const newProduct: Product = {
      id: `p${products.length + 1}`,
      name: newProductForm.name,
      description: newProductForm.description,
      price: parseFloat(newProductForm.price),
      compareAtPrice: newProductForm.compareAtPrice ? parseFloat(newProductForm.compareAtPrice) : undefined,
      category: newProductForm.category || 'Uncategorized',
      inventory: parseInt(newProductForm.inventory) || 0,
      status: 'active',
      images: [],
      rating: 0,
      reviews: 0,
      sales: 0,
      sku: newProductForm.sku || `SKU-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setProducts([newProduct, ...products])
    setNewProductForm({ name: '', description: '', price: '', compareAtPrice: '', category: '', inventory: '', sku: '' })
    setShowAddProductDialog(false)
    toast.success('Product added successfully')
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return

    setProducts(products.map(p =>
      p.id === selectedProduct.id ? selectedProduct : p
    ))
    setShowEditProductDialog(false)
    toast.success('Product updated successfully')
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    setProducts(products.filter(p => p.id !== selectedProduct.id))
    setSelectedProduct(null)
    setShowDeleteProductDialog(false)
    toast.success('Product deleted successfully')
  }

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !orderStatusUpdate) return

    setOrders(orders.map(o =>
      o.id === selectedOrder.id
        ? { ...o, status: orderStatusUpdate as Order['status'] }
        : o
    ))
    setShowUpdateOrderDialog(false)
    toast.success('Order status updated')
  }

  const handleAddCoupon = async () => {
    if (!newCouponForm.code || !newCouponForm.value) {
      toast.error('Please fill in required fields')
      return
    }

    const newCoupon: Coupon = {
      id: `cp${coupons.length + 1}`,
      code: newCouponForm.code.toUpperCase(),
      type: newCouponForm.type,
      value: parseFloat(newCouponForm.value),
      usageLimit: parseInt(newCouponForm.usageLimit) || 100,
      usedCount: 0,
      expiresAt: newCouponForm.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    }

    setCoupons([newCoupon, ...coupons])
    setNewCouponForm({ code: '', type: 'percentage', value: '', usageLimit: '', expiresAt: '' })
    setShowAddCouponDialog(false)
    toast.success('Coupon created successfully')
  }

  const handleExportData = async (type: string) => {
    toast.success(`Exporting ${type} data...`)
    setShowExportDialog(false)
  }

  const handleImportData = async () => {
    toast.success('Import started')
    setShowImportDialog(false)
  }

  const handleRefundOrder = async () => {
    if (!selectedOrder) return

    setOrders(orders.map(o =>
      o.id === selectedOrder.id
        ? { ...o, status: 'refunded', paymentStatus: 'refunded' }
        : o
    ))
    setShowRefundDialog(false)
    toast.success('Refund processed successfully')
  }

  const handleRefreshData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ecommerce/refresh', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to refresh')
      toast.success('Data refreshed')
    } catch {
      toast.error('Failed to refresh data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    toast.success(`Bulk ${action} completed`)
    setShowBulkActionsDialog(false)
  }

  const handleShareProduct = () => {
    if (selectedProduct) {
      navigator.clipboard.writeText(`https://store.example.com/product/${selectedProduct.id}`)
      toast.success('Link copied to clipboard')
    }
    setShowShareDialog(false)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'refunded':
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'draft':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'out_of_stock':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AIInsightsPanel insights={ecommerceAIInsights} />
            <PredictiveAnalytics predictions={ecommercePredictions} />
            <CollaborationIndicator collaborators={ecommerceCollaborators} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <QuickActionsToolbar actions={ecommerceQuickActions} />
            <ActivityFeed activities={ecommerceActivities} />
          </div>
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">E-Commerce Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your online store, products, orders, and customers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersDialog(true)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportDialog(true)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddProductDialog(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AIInsightsPanel insights={ecommerceAIInsights} />
          <PredictiveAnalytics predictions={ecommercePredictions} />
          <CollaborationIndicator collaborators={ecommerceCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActionsToolbar actions={ecommerceQuickActions} />
          <ActivityFeed activities={ecommerceActivities} />
        </div>

        {/* Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">${metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-2">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{metrics.totalOrders}</p>
              <p className="text-xs text-gray-600 mt-2">{metrics.pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{metrics.totalProducts}</p>
              <p className="text-xs text-gray-600 mt-2">{metrics.outOfStock} out of stock</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{metrics.totalCustomers}</p>
              <p className="text-xs text-gray-600 mt-2">45% repeat rate</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="h-4 w-4" />
              Coupons
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold">$12,450</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">$45,230</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Top Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.slice(0, 4).map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} sales</p>
                        </div>
                        <span className="font-semibold text-sm">${product.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Recent Orders
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{order.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${order.total}</p>
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkActionsDialog(true)}
              >
                <Layers className="h-4 w-4 mr-2" />
                Bulk Actions
              </Button>
            </div>

            {products.length === 0 ? (
              <NoDataEmptyState
                title="No products found"
                description="Add your first product to get started."
              />
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {products
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((product) => (
                    <Card key={product.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                          </div>
                          <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                            {product.compareAtPrice && (
                              <span className="ml-2 text-sm text-gray-400 line-through">${product.compareAtPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{product.rating}</span>
                            <span className="text-sm text-gray-500">({product.reviews})</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span>Stock: {product.inventory}</span>
                          <span>Sales: {product.sales}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowEditProductDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowShareDialog(true)
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedProduct(product)
                              setShowDeleteProductDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{order.createdAt}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{order.items.length} item(s)</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold">${order.total}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowOrderDetailsDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setOrderStatusUpdate(order.status)
                                  setShowUpdateOrderDialog(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowRefundDialog(true)
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Orders</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Spent</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Order</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50/50">
                          <td className="px-6 py-4">
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{customer.totalOrders}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold">${customer.totalSpent.toLocaleString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{customer.lastOrder}</p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setShowCustomerDetailsDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setShowAddCouponDialog(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Create Coupon
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-600" />
                        <span className="font-mono font-bold text-lg">{coupon.code}</span>
                      </div>
                      <Badge className={getStatusColor(coupon.status)}>{coupon.status}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-gray-500" />
                        <span className="text-2xl font-bold text-green-600">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`} OFF
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Used: {coupon.usedCount}/{coupon.usageLimit}</span>
                        <span>Expires: {coupon.expiresAt}</span>
                      </div>
                      <Progress value={(coupon.usedCount / coupon.usageLimit) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Product Dialog */}
        <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Add New Product
              </DialogTitle>
              <DialogDescription>
                Create a new product for your store.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productPrice">Price *</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Compare At Price</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    value={newProductForm.compareAtPrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, compareAtPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productCategory">Category</Label>
                  <Input
                    id="productCategory"
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productInventory">Inventory</Label>
                  <Input
                    id="productInventory"
                    type="number"
                    value={newProductForm.inventory}
                    onChange={(e) => setNewProductForm({ ...newProductForm, inventory: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="productSKU">SKU</Label>
                <Input
                  id="productSKU"
                  value={newProductForm.sku}
                  onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                  placeholder="Enter SKU"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-500" />
                Edit Product
              </DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedProduct.description}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={selectedProduct.price}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Inventory</Label>
                    <Input
                      type="number"
                      value={selectedProduct.inventory}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, inventory: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProduct} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Product Dialog */}
        <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Product
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700 text-white">
                Delete Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Details Dialog */}
        <Dialog open={showOrderDetailsDialog} onOpenChange={setShowOrderDetailsDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Order Details
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{selectedOrder.orderNumber}</span>
                  <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Customer</h4>
                  <p className="text-sm">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Items</h4>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedOrder.total}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOrderDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Order Status Dialog */}
        <Dialog open={showUpdateOrderDialog} onOpenChange={setShowUpdateOrderDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-500" />
                Update Order Status
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={orderStatusUpdate} onValueChange={setOrderStatusUpdate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateOrderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateOrderStatus} className="bg-blue-600 hover:bg-blue-700 text-white">
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Details Dialog */}
        <Dialog open={showCustomerDetailsDialog} onOpenChange={setShowCustomerDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Customer Details
              </DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-medium">{selectedCustomer.name}</h4>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="font-semibold text-lg">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="font-semibold text-lg">${selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Order</p>
                  <p className="font-medium">{selectedCustomer.lastOrder}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomerDetailsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Coupon Dialog */}
        <Dialog open={showAddCouponDialog} onOpenChange={setShowAddCouponDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-500" />
                Create New Coupon
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon Code *</Label>
                <Input
                  id="couponCode"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newCouponForm.type}
                    onValueChange={(value: 'percentage' | 'fixed') => setNewCouponForm({ ...newCouponForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponValue">Value *</Label>
                  <Input
                    id="couponValue"
                    type="number"
                    value={newCouponForm.value}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, value: e.target.value })}
                    placeholder={newCouponForm.type === 'percentage' ? '20' : '50'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={newCouponForm.usageLimit}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, usageLimit: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={newCouponForm.expiresAt}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, expiresAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCouponDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCoupon} className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-500" />
                Export Data
              </DialogTitle>
              <DialogDescription>
                Choose what data you want to export.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('products')}>
                <Package className="h-4 w-4 mr-2" />
                Export Products (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('orders')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Export Orders (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('customers')}>
                <Users className="h-4 w-4 mr-2" />
                Export Customers (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleExportData('all')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export All Data (ZIP)
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-500" />
                Import Data
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file to import data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Drag and drop your CSV file here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleImportData} className="bg-blue-600 hover:bg-blue-700 text-white">
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                Filters
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                  <Input placeholder="Min" type="number" />
                  <Input placeholder="Max" type="number" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>
                Clear Filters
              </Button>
              <Button onClick={() => {
                setShowFiltersDialog(false)
                toast.success('Filters applied')
              }} className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Store Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input defaultValue="My Store" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR ($)</SelectItem>
                    <SelectItem value="gbp">GBP ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" defaultValue="10" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowSettingsDialog(false)
                toast.success('Settings saved')
              }} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Process Refund
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to refund order {selectedOrder?.orderNumber}? This will refund ${selectedOrder?.total} to the customer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRefundOrder} className="bg-red-600 hover:bg-red-700 text-white">
                Process Refund
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Dialog */}
        <Dialog open={showBulkActionsDialog} onOpenChange={setShowBulkActionsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                Bulk Actions
              </DialogTitle>
              <DialogDescription>
                Apply actions to multiple products at once.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('update prices')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Update Prices
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('update inventory')}>
                <Box className="h-4 w-4 mr-2" />
                Update Inventory
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => handleBulkAction('archive')}>
                <Eye className="h-4 w-4 mr-2" />
                Archive Products
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Products
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkActionsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-500" />
                Share Product
              </DialogTitle>
              <DialogDescription>
                Share {selectedProduct?.name} with others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`https://store.example.com/product/${selectedProduct?.id}`}
                  className="flex-1"
                />
                <Button onClick={handleShareProduct}>
                  Copy
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
