'use client'

import { useState, useMemo } from 'react'
import { useInventory, type InventoryItem, type InventoryStatus } from '@/lib/hooks/use-inventory'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Download,
  Upload,
  Plus,
  Search,
  Truck,
  ShoppingCart,
  Box,
  Zap,
  MapPin,
  ArrowRightLeft,
  ClipboardList,
  Users,
  History,
  Settings,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  QrCode,
  Tag,
  Layers,
  Warehouse,
  PackageCheck,
  PackageX,
  RefreshCw,
  Eye,
  Copy,
  Archive,
  TrendingDown,
  Clock,
  Building2,
  Globe,
  Barcode,
  FileSpreadsheet,
  Bell,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

// Comprehensive type definitions for Shopify-level inventory
interface ProductVariant {
  id: string
  sku: string
  barcode: string
  option1: string | null
  option2: string | null
  option3: string | null
  price: number
  costPrice: number
  quantity: number
  weight: number
  weightUnit: 'kg' | 'lb' | 'oz' | 'g'
}

interface Product {
  id: string
  title: string
  description: string
  vendor: string
  productType: string
  tags: string[]
  status: 'active' | 'draft' | 'archived'
  variants: ProductVariant[]
  totalQuantity: number
  totalValue: number
  images: string[]
  createdAt: string
  updatedAt: string
}

interface Location {
  id: string
  name: string
  address: string
  city: string
  country: string
  type: 'warehouse' | 'store' | 'fulfillment' | 'dropship'
  isDefault: boolean
  productCount: number
  totalValue: number
}

interface StockTransfer {
  id: string
  reference: string
  originLocation: string
  destinationLocation: string
  status: 'pending' | 'in_transit' | 'received' | 'cancelled'
  items: { productId: string; productName: string; sku: string; quantity: number }[]
  createdAt: string
  expectedArrival: string
  notes: string
}

interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  supplierName: string
  status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled'
  items: { productId: string; productName: string; sku: string; quantity: number; unitCost: number }[]
  subtotal: number
  tax: number
  total: number
  expectedDate: string
  createdAt: string
  notes: string
}

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  country: string
  leadTime: number
  paymentTerms: string
  productCount: number
  totalOrders: number
  totalSpent: number
  rating: number
}

interface InventoryAdjustment {
  id: string
  type: 'increase' | 'decrease' | 'correction' | 'transfer'
  productId: string
  productName: string
  sku: string
  locationId: string
  locationName: string
  quantityBefore: number
  quantityAfter: number
  reason: string
  adjustedBy: string
  adjustedAt: string
}

interface InventoryStats {
  totalProducts: number
  totalVariants: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  totalLocations: number
  pendingTransfers: number
  openPurchaseOrders: number
  avgTurnoverRate: number
  inventoryAccuracy: number
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Classic Cotton T-Shirt',
    description: 'Premium quality cotton t-shirt',
    vendor: 'Textile Co',
    productType: 'Apparel',
    tags: ['clothing', 'basics', 'cotton'],
    status: 'active',
    variants: [
      { id: 'v1', sku: 'TSH-BLK-S', barcode: '123456789001', option1: 'Black', option2: 'S', option3: null, price: 29.99, costPrice: 12.00, quantity: 45, weight: 0.2, weightUnit: 'kg' },
      { id: 'v2', sku: 'TSH-BLK-M', barcode: '123456789002', option1: 'Black', option2: 'M', option3: null, price: 29.99, costPrice: 12.00, quantity: 82, weight: 0.2, weightUnit: 'kg' },
      { id: 'v3', sku: 'TSH-BLK-L', barcode: '123456789003', option1: 'Black', option2: 'L', option3: null, price: 29.99, costPrice: 12.00, quantity: 5, weight: 0.2, weightUnit: 'kg' },
      { id: 'v4', sku: 'TSH-WHT-S', barcode: '123456789004', option1: 'White', option2: 'S', option3: null, price: 29.99, costPrice: 12.00, quantity: 67, weight: 0.2, weightUnit: 'kg' },
      { id: 'v5', sku: 'TSH-WHT-M', barcode: '123456789005', option1: 'White', option2: 'M', option3: null, price: 29.99, costPrice: 12.00, quantity: 0, weight: 0.2, weightUnit: 'kg' },
    ],
    totalQuantity: 199,
    totalValue: 5967.01,
    images: ['/products/tshirt.jpg'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z'
  },
  {
    id: '2',
    title: 'Wireless Bluetooth Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation',
    vendor: 'TechSound',
    productType: 'Electronics',
    tags: ['audio', 'wireless', 'bluetooth'],
    status: 'active',
    variants: [
      { id: 'v6', sku: 'EBD-BLK', barcode: '223456789001', option1: 'Black', option2: null, option3: null, price: 79.99, costPrice: 35.00, quantity: 120, weight: 0.05, weightUnit: 'kg' },
      { id: 'v7', sku: 'EBD-WHT', barcode: '223456789002', option1: 'White', option2: null, option3: null, price: 79.99, costPrice: 35.00, quantity: 85, weight: 0.05, weightUnit: 'kg' },
    ],
    totalQuantity: 205,
    totalValue: 16397.95,
    images: ['/products/earbuds.jpg'],
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z'
  },
  {
    id: '3',
    title: 'Organic Coffee Beans',
    description: 'Premium single-origin coffee beans',
    vendor: 'BeanMasters',
    productType: 'Food & Beverage',
    tags: ['coffee', 'organic', 'fair-trade'],
    status: 'active',
    variants: [
      { id: 'v8', sku: 'COF-250', barcode: '323456789001', option1: '250g', option2: null, option3: null, price: 14.99, costPrice: 6.00, quantity: 8, weight: 0.25, weightUnit: 'kg' },
      { id: 'v9', sku: 'COF-500', barcode: '323456789002', option1: '500g', option2: null, option3: null, price: 24.99, costPrice: 10.00, quantity: 45, weight: 0.5, weightUnit: 'kg' },
      { id: 'v10', sku: 'COF-1KG', barcode: '323456789003', option1: '1kg', option2: null, option3: null, price: 39.99, costPrice: 16.00, quantity: 22, weight: 1, weightUnit: 'kg' },
    ],
    totalQuantity: 75,
    totalValue: 2124.25,
    images: ['/products/coffee.jpg'],
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-12-19T16:45:00Z'
  },
  {
    id: '4',
    title: 'Leather Messenger Bag',
    description: 'Genuine leather messenger bag with laptop compartment',
    vendor: 'LeatherCraft',
    productType: 'Accessories',
    tags: ['bags', 'leather', 'business'],
    status: 'active',
    variants: [
      { id: 'v11', sku: 'BAG-BRN', barcode: '423456789001', option1: 'Brown', option2: null, option3: null, price: 149.99, costPrice: 65.00, quantity: 18, weight: 1.2, weightUnit: 'kg' },
      { id: 'v12', sku: 'BAG-BLK', barcode: '423456789002', option1: 'Black', option2: null, option3: null, price: 149.99, costPrice: 65.00, quantity: 24, weight: 1.2, weightUnit: 'kg' },
    ],
    totalQuantity: 42,
    totalValue: 6299.58,
    images: ['/products/bag.jpg'],
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-12-17T09:20:00Z'
  },
  {
    id: '5',
    title: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitor',
    vendor: 'FitTech',
    productType: 'Electronics',
    tags: ['fitness', 'wearable', 'smart'],
    status: 'draft',
    variants: [
      { id: 'v13', sku: 'WATCH-BLK', barcode: '523456789001', option1: 'Black', option2: null, option3: null, price: 199.99, costPrice: 85.00, quantity: 0, weight: 0.08, weightUnit: 'kg' },
      { id: 'v14', sku: 'WATCH-SLV', barcode: '523456789002', option1: 'Silver', option2: null, option3: null, price: 199.99, costPrice: 85.00, quantity: 0, weight: 0.08, weightUnit: 'kg' },
    ],
    totalQuantity: 0,
    totalValue: 0,
    images: ['/products/watch.jpg'],
    createdAt: '2024-05-15T14:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z'
  }
]

const mockLocations: Location[] = [
  { id: 'loc1', name: 'Main Warehouse', address: '123 Industrial Blvd', city: 'Los Angeles', country: 'USA', type: 'warehouse', isDefault: true, productCount: 156, totalValue: 245000 },
  { id: 'loc2', name: 'Downtown Store', address: '456 Main Street', city: 'Los Angeles', country: 'USA', type: 'store', isDefault: false, productCount: 89, totalValue: 78000 },
  { id: 'loc3', name: 'East Coast Fulfillment', address: '789 Commerce Dr', city: 'New York', country: 'USA', type: 'fulfillment', isDefault: false, productCount: 124, totalValue: 167000 },
  { id: 'loc4', name: 'EU Distribution Center', address: '10 Logistics Way', city: 'Amsterdam', country: 'Netherlands', type: 'warehouse', isDefault: false, productCount: 67, totalValue: 89000 },
]

const mockTransfers: StockTransfer[] = [
  { id: 'tr1', reference: 'TRF-001', originLocation: 'Main Warehouse', destinationLocation: 'Downtown Store', status: 'in_transit', items: [{ productId: '1', productName: 'Classic Cotton T-Shirt', sku: 'TSH-BLK-M', quantity: 25 }], createdAt: '2024-12-20T10:00:00Z', expectedArrival: '2024-12-22T16:00:00Z', notes: 'Restock for holiday season' },
  { id: 'tr2', reference: 'TRF-002', originLocation: 'Main Warehouse', destinationLocation: 'East Coast Fulfillment', status: 'pending', items: [{ productId: '2', productName: 'Wireless Bluetooth Earbuds', sku: 'EBD-BLK', quantity: 50 }, { productId: '2', productName: 'Wireless Bluetooth Earbuds', sku: 'EBD-WHT', quantity: 30 }], createdAt: '2024-12-21T09:00:00Z', expectedArrival: '2024-12-26T12:00:00Z', notes: 'Q1 inventory prep' },
  { id: 'tr3', reference: 'TRF-003', originLocation: 'EU Distribution Center', destinationLocation: 'Downtown Store', status: 'received', items: [{ productId: '4', productName: 'Leather Messenger Bag', sku: 'BAG-BRN', quantity: 10 }], createdAt: '2024-12-15T11:00:00Z', expectedArrival: '2024-12-18T14:00:00Z', notes: '' },
]

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2024-001', supplierId: 'sup1', supplierName: 'Textile Co', status: 'sent', items: [{ productId: '1', productName: 'Classic Cotton T-Shirt', sku: 'TSH-BLK-L', quantity: 100, unitCost: 12.00 }, { productId: '1', productName: 'Classic Cotton T-Shirt', sku: 'TSH-WHT-M', quantity: 75, unitCost: 12.00 }], subtotal: 2100, tax: 210, total: 2310, expectedDate: '2024-12-28T00:00:00Z', createdAt: '2024-12-18T14:00:00Z', notes: 'Urgent restock' },
  { id: 'po2', poNumber: 'PO-2024-002', supplierId: 'sup2', supplierName: 'TechSound', status: 'partial', items: [{ productId: '2', productName: 'Wireless Bluetooth Earbuds', sku: 'EBD-BLK', quantity: 200, unitCost: 35.00 }], subtotal: 7000, tax: 700, total: 7700, expectedDate: '2024-12-30T00:00:00Z', createdAt: '2024-12-10T10:00:00Z', notes: '' },
  { id: 'po3', poNumber: 'PO-2024-003', supplierId: 'sup3', supplierName: 'FitTech', status: 'draft', items: [{ productId: '5', productName: 'Smart Fitness Watch', sku: 'WATCH-BLK', quantity: 50, unitCost: 85.00 }, { productId: '5', productName: 'Smart Fitness Watch', sku: 'WATCH-SLV', quantity: 50, unitCost: 85.00 }], subtotal: 8500, tax: 850, total: 9350, expectedDate: '2025-01-15T00:00:00Z', createdAt: '2024-12-21T16:00:00Z', notes: 'New product launch' },
]

const mockSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Textile Co', email: 'orders@textileco.com', phone: '+1-555-0101', address: '500 Fabric Lane, Chicago, IL', country: 'USA', leadTime: 14, paymentTerms: 'Net 30', productCount: 12, totalOrders: 45, totalSpent: 125000, rating: 4.8 },
  { id: 'sup2', name: 'TechSound', email: 'wholesale@techsound.com', phone: '+1-555-0102', address: '200 Audio Way, San Jose, CA', country: 'USA', leadTime: 21, paymentTerms: 'Net 45', productCount: 8, totalOrders: 28, totalSpent: 89000, rating: 4.5 },
  { id: 'sup3', name: 'FitTech', email: 'b2b@fittech.com', phone: '+86-755-1234', address: '88 Innovation Rd, Shenzhen', country: 'China', leadTime: 35, paymentTerms: 'Net 60', productCount: 5, totalOrders: 12, totalSpent: 67000, rating: 4.2 },
  { id: 'sup4', name: 'BeanMasters', email: 'partners@beanmasters.co', phone: '+57-1-234-5678', address: 'Zona Cafetera, Manizales', country: 'Colombia', leadTime: 28, paymentTerms: 'Net 30', productCount: 3, totalOrders: 18, totalSpent: 34000, rating: 4.9 },
  { id: 'sup5', name: 'LeatherCraft', email: 'sales@leathercraft.it', phone: '+39-02-1234567', address: 'Via dei Pellettieri 25, Florence', country: 'Italy', leadTime: 21, paymentTerms: 'Net 30', productCount: 6, totalOrders: 22, totalSpent: 78000, rating: 4.7 },
]

const mockAdjustments: InventoryAdjustment[] = [
  { id: 'adj1', type: 'decrease', productId: '3', productName: 'Organic Coffee Beans', sku: 'COF-250', locationId: 'loc1', locationName: 'Main Warehouse', quantityBefore: 15, quantityAfter: 8, reason: 'Damaged in storage', adjustedBy: 'John Smith', adjustedAt: '2024-12-20T14:30:00Z' },
  { id: 'adj2', type: 'increase', productId: '1', productName: 'Classic Cotton T-Shirt', sku: 'TSH-BLK-M', locationId: 'loc2', locationName: 'Downtown Store', quantityBefore: 57, quantityAfter: 82, reason: 'Transfer received', adjustedBy: 'Sarah Johnson', adjustedAt: '2024-12-19T11:00:00Z' },
  { id: 'adj3', type: 'correction', productId: '2', productName: 'Wireless Bluetooth Earbuds', sku: 'EBD-WHT', locationId: 'loc3', locationName: 'East Coast Fulfillment', quantityBefore: 90, quantityAfter: 85, reason: 'Inventory count discrepancy', adjustedBy: 'Mike Brown', adjustedAt: '2024-12-18T16:45:00Z' },
]

const mockStats: InventoryStats = {
  totalProducts: 5,
  totalVariants: 14,
  totalValue: 30788.79,
  lowStockItems: 2,
  outOfStockItems: 3,
  totalLocations: 4,
  pendingTransfers: 2,
  openPurchaseOrders: 2,
  avgTurnoverRate: 4.2,
  inventoryAccuracy: 98.5
}

export default function InventoryClient({ initialInventory }: { initialInventory: InventoryItem[] }) {
  const [activeTab, setActiveTab] = useState('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showPODialog, setShowPODialog] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variants.some(v => v.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const toggleProductExpanded = (productId: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'in_transit': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'received': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'partial': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getVariantStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' }
    if (quantity <= 10) return { label: 'Low stock', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' }
    return { label: 'In stock', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' }
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return Warehouse
      case 'store': return Building2
      case 'fulfillment': return Truck
      case 'dropship': return Globe
      default: return MapPin
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Inventory Management</h1>
                <p className="text-white/80">Shopify-level multi-location inventory control</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
                Shopify Level
              </span>
              <button
                onClick={() => setShowProductDialog(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Package className="w-4 h-4" />
                Total Products
              </div>
              <div className="text-2xl font-bold">{mockStats.totalProducts}</div>
              <div className="text-xs text-white/60">{mockStats.totalVariants} variants</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                Total Value
              </div>
              <div className="text-2xl font-bold">${(mockStats.totalValue / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Across all locations</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Low Stock
              </div>
              <div className="text-2xl font-bold text-yellow-300">{mockStats.lowStockItems}</div>
              <div className="text-xs text-white/60">{mockStats.outOfStockItems} out of stock</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <RefreshCw className="w-4 h-4" />
                Turnover Rate
              </div>
              <div className="text-2xl font-bold">{mockStats.avgTurnoverRate}x</div>
              <div className="text-xs text-white/60">Monthly average</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Accuracy
              </div>
              <div className="text-2xl font-bold">{mockStats.inventoryAccuracy}%</div>
              <div className="text-xs text-white/60">Last count</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700 mb-6">
            <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="locations" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <MapPin className="w-4 h-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="transfers" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfers
            </TabsTrigger>
            <TabsTrigger value="purchase-orders" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <ClipboardList className="w-4 h-4 mr-2" />
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <Users className="w-4 h-4 mr-2" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, SKUs, vendors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    Draft
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Inventory</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Value</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Vendor</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <>
                        <tr
                          key={product.id}
                          className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => toggleProductExpanded(product.id)}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                {expandedProducts.has(product.id) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{product.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{product.variants.length} variants</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-medium text-gray-900 dark:text-white">{product.totalQuantity}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">in stock</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-medium text-gray-900 dark:text-white">${product.totalValue.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{product.vendor}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowProductDialog(true); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedProducts.has(product.id) && (
                          <tr className="bg-gray-50/50 dark:bg-gray-700/30">
                            <td colSpan={6} className="py-3 px-4 pl-16">
                              <div className="grid grid-cols-5 gap-4 text-sm">
                                <div className="font-medium text-gray-500 dark:text-gray-400">Variant</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400">SKU</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400 text-right">Stock</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400 text-right">Price</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400 text-center">Status</div>
                              </div>
                              {product.variants.map((variant) => {
                                const stockStatus = getVariantStockStatus(variant.quantity)
                                return (
                                  <div key={variant.id} className="grid grid-cols-5 gap-4 text-sm py-2 border-t dark:border-gray-600 mt-2">
                                    <div className="text-gray-900 dark:text-white">
                                      {[variant.option1, variant.option2, variant.option3].filter(Boolean).join(' / ') || 'Default'}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400 font-mono">{variant.sku}</div>
                                    <div className={`text-right font-medium ${stockStatus.color}`}>{variant.quantity}</div>
                                    <div className="text-right text-gray-900 dark:text-white">${variant.price.toFixed(2)}</div>
                                    <div className="text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-xs ${stockStatus.bg} ${stockStatus.color}`}>
                                        {stockStatus.label}
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Locations</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockLocations.map((location) => {
                const LocationIcon = getLocationIcon(location.type)
                return (
                  <div key={location.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          location.type === 'warehouse' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                          location.type === 'store' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          location.type === 'fulfillment' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        }`}>
                          <LocationIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{location.name}</h3>
                            {location.isDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{location.address}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{location.city}, {location.country}</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Products</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">{location.productCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">${(location.totalValue / 1000).toFixed(0)}K</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Transfers</h2>
              <button
                onClick={() => setShowTransferDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Transfer
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Reference</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Origin</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Destination</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Expected</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{transfer.reference}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transfer.originLocation}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{transfer.destinationLocation}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {transfer.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {transfer.status.replace('_', ' ').charAt(0).toUpperCase() + transfer.status.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(transfer.expectedArrival).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Purchase Orders</h2>
              <button
                onClick={() => setShowPODialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create PO
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">PO Number</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Supplier</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Items</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Expected</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPurchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{po.poNumber}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{po.supplierName}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {po.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                        ${po.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(po.expectedDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Suppliers</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSuppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.country}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">{supplier.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      Lead time: {supplier.leadTime} days
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Package className="w-4 h-4" />
                      {supplier.productCount} products
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      {supplier.paymentTerms}
                    </div>
                  </div>
                  <div className="pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total orders</span>
                      <span className="font-medium text-gray-900 dark:text-white">{supplier.totalOrders}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500 dark:text-gray-400">Total spent</span>
                      <span className="font-medium text-gray-900 dark:text-white">${(supplier.totalSpent / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Adjustments</h2>
              <button className="px-4 py-2 border dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Download className="w-4 h-4" />
                Export History
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Location</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Change</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">By</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAdjustments.map((adj) => (
                    <tr key={adj.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(adj.adjustedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          adj.type === 'increase' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          adj.type === 'decrease' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{adj.productName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{adj.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{adj.locationName}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${adj.quantityAfter > adj.quantityBefore ? 'text-green-600' : 'text-red-600'}`}>
                          {adj.quantityAfter > adj.quantityBefore ? '+' : ''}{adj.quantityAfter - adj.quantityBefore}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {adj.quantityBefore} → {adj.quantityAfter}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{adj.reason}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{adj.adjustedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Detail/Create Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
              {selectedProduct ? selectedProduct.title : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    defaultValue={selectedProduct?.title || ''}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                  <input
                    type="text"
                    defaultValue={selectedProduct?.vendor || ''}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Enter vendor name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  defaultValue={selectedProduct?.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="Enter product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Type</label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                    <option>Apparel</option>
                    <option>Electronics</option>
                    <option>Food & Beverage</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    defaultValue={selectedProduct?.status || 'draft'}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Variants Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Variants</label>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Variant
                  </button>
                </div>
                <div className="space-y-2">
                  {(selectedProduct?.variants || [{ id: 'new', sku: '', barcode: '', option1: null, option2: null, option3: null, price: 0, costPrice: 0, quantity: 0, weight: 0, weightUnit: 'kg' as const }]).map((variant, idx) => (
                    <div key={variant.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">SKU</label>
                          <input
                            type="text"
                            defaultValue={variant.sku}
                            className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-sm dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Option</label>
                          <input
                            type="text"
                            defaultValue={variant.option1 || ''}
                            className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-sm dark:text-white"
                            placeholder="e.g. Black / S"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Price</label>
                          <input
                            type="number"
                            defaultValue={variant.price}
                            className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-sm dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cost</label>
                          <input
                            type="number"
                            defaultValue={variant.costPrice}
                            className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-sm dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity</label>
                          <input
                            type="number"
                            defaultValue={variant.quantity}
                            className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded text-sm dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowProductDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              {selectedProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              Create Stock Transfer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin Location</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                  {mockLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination Location</label>
                <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                  {mockLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Arrival</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Add transfer notes..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowTransferDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Create Transfer
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create PO Dialog */}
      <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <ClipboardList className="w-5 h-5" />
              </div>
              Create Purchase Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                {mockSuppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Add order notes..."
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowPODialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Create PO
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
