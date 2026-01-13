'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity,
  Download,
  Plus,
  RefreshCw,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Warehouse,
  Truck,
  Clock,
  AlertCircle,
  Box,
  Boxes,
  ScanLine,
  Tag,
  Layers,
  Settings,
  MoreHorizontal,
  FileText,
  List,
  Grid3X3,
  Archive,
  RotateCcw,
  History,
  Clipboard,
  ClipboardCheck,
  Building2,
  Users,
  Zap,
  Target,
  PieChart,
  Bell,
  Mail,
  ArrowRightLeft,
  Upload,
  ArrowDownToLine,
  ArrowUpFromLine
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




// ============================================================================
// TYPE DEFINITIONS - E*Trade Level Inventory Management
// ============================================================================

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order' | 'discontinued'
type MovementType = 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'return' | 'write_off'
type MovementStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled'
type ValuationMethod = 'fifo' | 'lifo' | 'average' | 'specific'
type ProductCategory = 'electronics' | 'apparel' | 'food' | 'raw_materials' | 'finished_goods' | 'packaging'

interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: ProductCategory
  brand?: string
  supplier: Supplier
  unitCost: number
  sellingPrice: number
  margin: number
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint: number
  reorderQuantity: number
  leadTimeDays: number
  status: StockStatus
  locations: StockLocation[]
  batchTracking: boolean
  serialTracking: boolean
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  barcode?: string
  image?: string
  lastRestocked?: string
  lastSold?: string
  createdAt: string
}

interface StockLocation {
  warehouseId: string
  warehouseName: string
  zone: string
  bin: string
  quantity: number
  reservedQuantity: number
}

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  leadTime: number
  minOrderQuantity: number
  rating: number
}

interface Warehouse {
  id: string
  name: string
  code: string
  address: string
  city: string
  state: string
  type: 'main' | 'distribution' | 'retail' | 'fulfillment'
  capacity: number
  utilization: number
  zones: number
  bins: number
  productCount: number
  totalValue: number
  manager: string
}

interface StockMovement {
  id: string
  movementNumber: string
  type: MovementType
  status: MovementStatus
  product: {
    id: string
    sku: string
    name: string
  }
  quantity: number
  unitCost: number
  totalValue: number
  fromLocation?: {
    warehouseId: string
    warehouseName: string
    zone: string
    bin: string
  }
  toLocation?: {
    warehouseId: string
    warehouseName: string
    zone: string
    bin: string
  }
  reference?: string
  purchaseOrderId?: string
  salesOrderId?: string
  batchNumber?: string
  serialNumbers?: string[]
  reason?: string
  notes?: string
  operator: string
  approvedBy?: string
  movementDate: string
  completedDate?: string
  createdAt: string
}

interface StockCount {
  id: string
  countNumber: string
  warehouseId: string
  warehouseName: string
  type: 'full' | 'cycle' | 'spot'
  status: 'scheduled' | 'in_progress' | 'completed' | 'verified'
  scheduledDate: string
  startedAt?: string
  completedAt?: string
  assignedTo: string[]
  productsCounted: number
  totalProducts: number
  varianceValue: number
  variancePercentage: number
}

interface Alert {
  id: string
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'reorder'
  severity: 'info' | 'warning' | 'critical'
  productId: string
  productName: string
  sku: string
  message: string
  currentQuantity: number
  threshold?: number
  createdAt: string
  acknowledged: boolean
}

interface Analytics {
  totalProducts: number
  totalValue: number
  avgTurnoverRate: number
  totalMovements: number
  lowStockCount: number
  outOfStockCount: number
  pendingOrders: number
  warehouses: number
  topMovers: { productId: string; name: string; quantity: number }[]
  slowMovers: { productId: string; name: string; daysInStock: number }[]
  valueByCategory: { category: ProductCategory; value: number; percentage: number }[]
  movementTrend: { date: string; inbound: number; outbound: number }[]
  turnoverByWarehouse: { warehouseId: string; name: string; rate: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Main Distribution Center',
    code: 'MDC-001',
    address: '1234 Industrial Blvd',
    city: 'Los Angeles',
    state: 'CA',
    type: 'distribution',
    capacity: 50000,
    utilization: 72,
    zones: 12,
    bins: 480,
    productCount: 1247,
    totalValue: 2450000,
    manager: 'John Smith'
  },
  {
    id: 'wh-2',
    name: 'East Coast Fulfillment',
    code: 'ECF-001',
    address: '567 Commerce Drive',
    city: 'Newark',
    state: 'NJ',
    type: 'fulfillment',
    capacity: 35000,
    utilization: 85,
    zones: 8,
    bins: 320,
    productCount: 892,
    totalValue: 1780000,
    manager: 'Sarah Chen'
  },
  {
    id: 'wh-3',
    name: 'Retail Store Backroom',
    code: 'RSB-001',
    address: '890 Main Street',
    city: 'San Francisco',
    state: 'CA',
    type: 'retail',
    capacity: 5000,
    utilization: 65,
    zones: 4,
    bins: 80,
    productCount: 234,
    totalValue: 156000,
    manager: 'Mike Johnson'
  }
]

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'ELEC-001',
    name: 'Wireless Bluetooth Earbuds Pro',
    description: 'Premium wireless earbuds with active noise cancellation',
    category: 'electronics',
    brand: 'TechSound',
    supplier: { id: 'sup-1', name: 'TechWholesale Inc', email: 'orders@techwholesale.com', phone: '+1 (555) 123-4567', leadTime: 7, minOrderQuantity: 50, rating: 4.8 },
    unitCost: 45.00,
    sellingPrice: 89.99,
    margin: 50,
    quantity: 1250,
    reservedQuantity: 87,
    availableQuantity: 1163,
    reorderPoint: 200,
    reorderQuantity: 500,
    leadTimeDays: 7,
    status: 'in_stock',
    locations: [
      { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'A', bin: 'A-12-3', quantity: 800, reservedQuantity: 50 },
      { warehouseId: 'wh-2', warehouseName: 'East Coast Fulfillment', zone: 'B', bin: 'B-05-1', quantity: 450, reservedQuantity: 37 }
    ],
    batchTracking: true,
    serialTracking: false,
    weight: 0.15,
    dimensions: { length: 8, width: 6, height: 4 },
    barcode: '1234567890123',
    lastRestocked: '2024-12-15T10:00:00Z',
    lastSold: '2024-12-23T14:30:00Z',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'prod-2',
    sku: 'ELEC-002',
    name: 'Smart Watch Series X',
    description: 'Advanced smartwatch with health monitoring',
    category: 'electronics',
    brand: 'TechWear',
    supplier: { id: 'sup-2', name: 'SmartGadgets Co', email: 'supply@smartgadgets.com', phone: '+1 (555) 234-5678', leadTime: 14, minOrderQuantity: 25, rating: 4.5 },
    unitCost: 120.00,
    sellingPrice: 249.99,
    margin: 52,
    quantity: 145,
    reservedQuantity: 23,
    availableQuantity: 122,
    reorderPoint: 100,
    reorderQuantity: 200,
    leadTimeDays: 14,
    status: 'low_stock',
    locations: [
      { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'A', bin: 'A-08-2', quantity: 100, reservedQuantity: 15 },
      { warehouseId: 'wh-3', warehouseName: 'Retail Store Backroom', zone: 'C', bin: 'C-01-1', quantity: 45, reservedQuantity: 8 }
    ],
    batchTracking: true,
    serialTracking: true,
    weight: 0.08,
    dimensions: { length: 5, width: 5, height: 3 },
    barcode: '2345678901234',
    lastRestocked: '2024-12-01T09:00:00Z',
    lastSold: '2024-12-23T16:45:00Z',
    createdAt: '2024-02-20T11:00:00Z'
  },
  {
    id: 'prod-3',
    sku: 'APP-001',
    name: 'Premium Cotton T-Shirt',
    description: '100% organic cotton t-shirt, multiple colors available',
    category: 'apparel',
    brand: 'EcoWear',
    supplier: { id: 'sup-3', name: 'GreenTextile Ltd', email: 'orders@greentextile.com', phone: '+1 (555) 345-6789', leadTime: 21, minOrderQuantity: 100, rating: 4.2 },
    unitCost: 8.50,
    sellingPrice: 24.99,
    margin: 66,
    quantity: 3500,
    reservedQuantity: 245,
    availableQuantity: 3255,
    reorderPoint: 500,
    reorderQuantity: 1000,
    leadTimeDays: 21,
    status: 'in_stock',
    locations: [
      { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'C', bin: 'C-22-1', quantity: 2500, reservedQuantity: 180 },
      { warehouseId: 'wh-2', warehouseName: 'East Coast Fulfillment', zone: 'A', bin: 'A-15-3', quantity: 1000, reservedQuantity: 65 }
    ],
    batchTracking: true,
    serialTracking: false,
    weight: 0.2,
    barcode: '3456789012345',
    lastRestocked: '2024-12-10T14:00:00Z',
    lastSold: '2024-12-23T11:20:00Z',
    createdAt: '2024-03-05T10:00:00Z'
  },
  {
    id: 'prod-4',
    sku: 'RAW-001',
    name: 'Aluminum Sheets 4x8',
    description: 'Industrial grade aluminum sheets for manufacturing',
    category: 'raw_materials',
    supplier: { id: 'sup-4', name: 'MetalWorks Inc', email: 'sales@metalworks.com', phone: '+1 (555) 456-7890', leadTime: 10, minOrderQuantity: 50, rating: 4.6 },
    unitCost: 75.00,
    sellingPrice: 125.00,
    margin: 40,
    quantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
    reorderPoint: 100,
    reorderQuantity: 500,
    leadTimeDays: 10,
    status: 'out_of_stock',
    locations: [],
    batchTracking: true,
    serialTracking: false,
    weight: 15,
    dimensions: { length: 96, width: 48, height: 0.125 },
    barcode: '4567890123456',
    lastRestocked: '2024-11-20T08:00:00Z',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    id: 'prod-5',
    sku: 'PKG-001',
    name: 'Corrugated Shipping Boxes (Medium)',
    description: '12x10x8 inch shipping boxes, pack of 25',
    category: 'packaging',
    supplier: { id: 'sup-5', name: 'PackRight Solutions', email: 'order@packright.com', phone: '+1 (555) 567-8901', leadTime: 5, minOrderQuantity: 10, rating: 4.9 },
    unitCost: 18.00,
    sellingPrice: 32.99,
    margin: 45,
    quantity: 2800,
    reservedQuantity: 150,
    availableQuantity: 2650,
    reorderPoint: 300,
    reorderQuantity: 500,
    leadTimeDays: 5,
    status: 'in_stock',
    locations: [
      { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'D', bin: 'D-01-1', quantity: 1800, reservedQuantity: 100 },
      { warehouseId: 'wh-2', warehouseName: 'East Coast Fulfillment', zone: 'D', bin: 'D-02-1', quantity: 1000, reservedQuantity: 50 }
    ],
    batchTracking: false,
    serialTracking: false,
    barcode: '5678901234567',
    lastRestocked: '2024-12-18T11:00:00Z',
    lastSold: '2024-12-23T09:15:00Z',
    createdAt: '2024-04-12T09:00:00Z'
  }
]

const mockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    movementNumber: 'MOV-2024-001',
    type: 'inbound',
    status: 'completed',
    product: { id: 'prod-1', sku: 'ELEC-001', name: 'Wireless Bluetooth Earbuds Pro' },
    quantity: 500,
    unitCost: 45.00,
    totalValue: 22500,
    toLocation: { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'A', bin: 'A-12-3' },
    reference: 'PO-2024-1234',
    purchaseOrderId: 'po-1',
    batchNumber: 'BATCH-2024-12-001',
    operator: 'John Smith',
    approvedBy: 'Sarah Manager',
    movementDate: '2024-12-15T10:00:00Z',
    completedDate: '2024-12-15T14:30:00Z',
    createdAt: '2024-12-15T10:00:00Z'
  },
  {
    id: 'mov-2',
    movementNumber: 'MOV-2024-002',
    type: 'outbound',
    status: 'completed',
    product: { id: 'prod-3', sku: 'APP-001', name: 'Premium Cotton T-Shirt' },
    quantity: 150,
    unitCost: 8.50,
    totalValue: 1275,
    fromLocation: { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'C', bin: 'C-22-1' },
    reference: 'SO-2024-5678',
    salesOrderId: 'so-1',
    operator: 'Mike Warehouse',
    movementDate: '2024-12-20T09:00:00Z',
    completedDate: '2024-12-20T09:45:00Z',
    createdAt: '2024-12-20T09:00:00Z'
  },
  {
    id: 'mov-3',
    movementNumber: 'MOV-2024-003',
    type: 'transfer',
    status: 'in_transit',
    product: { id: 'prod-2', sku: 'ELEC-002', name: 'Smart Watch Series X' },
    quantity: 50,
    unitCost: 120.00,
    totalValue: 6000,
    fromLocation: { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'A', bin: 'A-08-2' },
    toLocation: { warehouseId: 'wh-3', warehouseName: 'Retail Store Backroom', zone: 'C', bin: 'C-01-1' },
    notes: 'Restocking retail location',
    operator: 'Sarah Chen',
    movementDate: '2024-12-22T11:00:00Z',
    createdAt: '2024-12-22T11:00:00Z'
  },
  {
    id: 'mov-4',
    movementNumber: 'MOV-2024-004',
    type: 'adjustment',
    status: 'completed',
    product: { id: 'prod-5', sku: 'PKG-001', name: 'Corrugated Shipping Boxes (Medium)' },
    quantity: -25,
    unitCost: 18.00,
    totalValue: -450,
    fromLocation: { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'D', bin: 'D-01-1' },
    reason: 'Damaged in storage - water leak',
    notes: 'Damaged boxes disposed, incident report filed',
    operator: 'John Smith',
    approvedBy: 'Sarah Manager',
    movementDate: '2024-12-21T16:00:00Z',
    completedDate: '2024-12-21T16:30:00Z',
    createdAt: '2024-12-21T16:00:00Z'
  },
  {
    id: 'mov-5',
    movementNumber: 'MOV-2024-005',
    type: 'inbound',
    status: 'pending',
    product: { id: 'prod-4', sku: 'RAW-001', name: 'Aluminum Sheets 4x8' },
    quantity: 200,
    unitCost: 75.00,
    totalValue: 15000,
    toLocation: { warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', zone: 'E', bin: 'E-01-1' },
    reference: 'PO-2024-1890',
    purchaseOrderId: 'po-5',
    notes: 'Expected delivery Dec 26',
    operator: 'System',
    movementDate: '2024-12-26T09:00:00Z',
    createdAt: '2024-12-23T08:00:00Z'
  }
]

const mockAlerts: Alert[] = [
  { id: 'alert-1', type: 'low_stock', severity: 'warning', productId: 'prod-2', productName: 'Smart Watch Series X', sku: 'ELEC-002', message: 'Stock below reorder point', currentQuantity: 145, threshold: 100, createdAt: '2024-12-23T08:00:00Z', acknowledged: false },
  { id: 'alert-2', type: 'out_of_stock', severity: 'critical', productId: 'prod-4', productName: 'Aluminum Sheets 4x8', sku: 'RAW-001', message: 'Product out of stock', currentQuantity: 0, createdAt: '2024-12-20T10:00:00Z', acknowledged: false },
  { id: 'alert-3', type: 'reorder', severity: 'info', productId: 'prod-4', productName: 'Aluminum Sheets 4x8', sku: 'RAW-001', message: 'Reorder placed - PO-2024-1890', currentQuantity: 0, createdAt: '2024-12-23T08:30:00Z', acknowledged: true }
]

const mockStockCounts: StockCount[] = [
  { id: 'count-1', countNumber: 'CNT-2024-001', warehouseId: 'wh-1', warehouseName: 'Main Distribution Center', type: 'cycle', status: 'completed', scheduledDate: '2024-12-15', startedAt: '2024-12-15T06:00:00Z', completedAt: '2024-12-15T18:00:00Z', assignedTo: ['John Smith', 'Mike Johnson'], productsCounted: 1247, totalProducts: 1247, varianceValue: -2340, variancePercentage: -0.1 },
  { id: 'count-2', countNumber: 'CNT-2024-002', warehouseId: 'wh-2', warehouseName: 'East Coast Fulfillment', type: 'spot', status: 'in_progress', scheduledDate: '2024-12-23', startedAt: '2024-12-23T07:00:00Z', assignedTo: ['Sarah Chen'], productsCounted: 234, totalProducts: 892, varianceValue: 0, variancePercentage: 0 }
]

const mockAnalytics: Analytics = {
  totalProducts: 5,
  totalValue: 4386000,
  avgTurnoverRate: 8.4,
  totalMovements: 5,
  lowStockCount: 1,
  outOfStockCount: 1,
  pendingOrders: 1,
  warehouses: 3,
  topMovers: [
    { productId: 'prod-3', name: 'Premium Cotton T-Shirt', quantity: 2450 },
    { productId: 'prod-1', name: 'Wireless Bluetooth Earbuds Pro', quantity: 1890 },
    { productId: 'prod-5', name: 'Corrugated Shipping Boxes', quantity: 1234 }
  ],
  slowMovers: [
    { productId: 'prod-4', name: 'Aluminum Sheets 4x8', daysInStock: 33 },
    { productId: 'prod-2', name: 'Smart Watch Series X', daysInStock: 22 }
  ],
  valueByCategory: [
    { category: 'electronics', value: 1450000, percentage: 33 },
    { category: 'apparel', value: 875000, percentage: 20 },
    { category: 'raw_materials', value: 0, percentage: 0 },
    { category: 'packaging', value: 896000, percentage: 20 },
    { category: 'finished_goods', value: 1165000, percentage: 27 }
  ],
  movementTrend: [
    { date: '2024-12-17', inbound: 45, outbound: 38 },
    { date: '2024-12-18', inbound: 52, outbound: 41 },
    { date: '2024-12-19', inbound: 38, outbound: 45 },
    { date: '2024-12-20', inbound: 67, outbound: 52 },
    { date: '2024-12-21', inbound: 23, outbound: 31 },
    { date: '2024-12-22', inbound: 34, outbound: 28 },
    { date: '2024-12-23', inbound: 41, outbound: 35 }
  ],
  turnoverByWarehouse: [
    { warehouseId: 'wh-1', name: 'Main Distribution Center', rate: 9.2 },
    { warehouseId: 'wh-2', name: 'East Coast Fulfillment', rate: 11.5 },
    { warehouseId: 'wh-3', name: 'Retail Store Backroom', rate: 6.8 }
  ]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStockStatusBadge = (status: StockStatus) => {
  switch (status) {
    case 'in_stock':
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3 h-3 mr-1" />In Stock</Badge>
    case 'low_stock':
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>
    case 'out_of_stock':
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3 mr-1" />Out of Stock</Badge>
    case 'on_order':
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Clock className="w-3 h-3 mr-1" />On Order</Badge>
    case 'discontinued':
      return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"><Archive className="w-3 h-3 mr-1" />Discontinued</Badge>
  }
}

const getMovementTypeBadge = (type: MovementType) => {
  switch (type) {
    case 'inbound':
      return <Badge className="bg-green-100 text-green-700"><ArrowDownRight className="w-3 h-3 mr-1" />Inbound</Badge>
    case 'outbound':
      return <Badge className="bg-orange-100 text-orange-700"><ArrowUpRight className="w-3 h-3 mr-1" />Outbound</Badge>
    case 'transfer':
      return <Badge className="bg-blue-100 text-blue-700"><RefreshCw className="w-3 h-3 mr-1" />Transfer</Badge>
    case 'adjustment':
      return <Badge className="bg-purple-100 text-purple-700"><Activity className="w-3 h-3 mr-1" />Adjustment</Badge>
    case 'return':
      return <Badge className="bg-cyan-100 text-cyan-700"><RotateCcw className="w-3 h-3 mr-1" />Return</Badge>
    case 'write_off':
      return <Badge className="bg-red-100 text-red-700"><Trash2 className="w-3 h-3 mr-1" />Write Off</Badge>
  }
}

const getMovementStatusBadge = (status: MovementStatus) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>
    case 'in_transit':
      return <Badge className="bg-blue-100 text-blue-700"><Truck className="w-3 h-3 mr-1" />In Transit</Badge>
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>
  }
}

const getAlertSeverityBadge = (severity: 'info' | 'warning' | 'critical') => {
  switch (severity) {
    case 'info':
      return <Badge className="bg-blue-100 text-blue-700">Info</Badge>
    case 'warning':
      return <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>
    case 'critical':
      return <Badge className="bg-red-100 text-red-700">Critical</Badge>
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Mock data for AI-powered competitive upgrade components
const mockStockAIInsights = [
  { id: '1', type: 'success' as const, title: 'Inventory Optimized', description: 'AI reorder points saved $25K in carrying costs this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
  { id: '2', type: 'warning' as const, title: 'Low Stock Alert', description: '8 SKUs below safety stock level. Reorder recommended.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Inventory' },
  { id: '3', type: 'info' as const, title: 'Turnover Improving', description: 'Inventory turnover ratio increased to 8.5 from 7.2.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockStockCollaborators = [
  { id: '1', name: 'Inventory Manager', avatar: '/avatars/inventory.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Warehouse Lead', avatar: '/avatars/warehouse.jpg', status: 'online' as const, role: 'Operations' },
  { id: '3', name: 'Procurement', avatar: '/avatars/procurement.jpg', status: 'away' as const, role: 'Procurement' },
]

const mockStockPredictions = [
  { id: '1', title: 'Stockout Risk', prediction: 'SKU-5523 will stockout in 5 days based on current velocity', confidence: 92, trend: 'down' as const, impact: 'high' as const },
  { id: '2', title: 'Seasonal Demand', prediction: 'Q4 demand surge expected - increase safety stock 20%', confidence: 84, trend: 'up' as const, impact: 'high' as const },
]

const mockStockActivities = [
  { id: '1', user: 'Warehouse Lead', action: 'Received', target: 'PO-8834 shipment (500 units)', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Inventory Manager', action: 'Adjusted', target: 'cycle count for Zone A', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Procurement', action: 'Created', target: 'reorder for 12 low-stock items', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

export default function StockClient() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [products] = useState<Product[]>(mockProducts)
  const [movements] = useState<StockMovement[]>(mockMovements)
  const [warehouses] = useState<Warehouse[]>(mockWarehouses)
  const [alerts] = useState<Alert[]>(mockAlerts)
  const [stockCounts] = useState<StockCount[]>(mockStockCounts)
  const [analytics] = useState<Analytics>(mockAnalytics)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all')
  const [movementTypeFilter, setMovementTypeFilter] = useState<MovementType | 'all'>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Dialog states for QuickActions
  const [showAddStockDialog, setShowAddStockDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showCountDialog, setShowCountDialog] = useState(false)

  // Additional dialog states for all buttons
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showScanDialog, setShowScanDialog] = useState(false)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showMoreOptionsDialog, setShowMoreOptionsDialog] = useState(false)
  const [showShipDialog, setShowShipDialog] = useState(false)
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showAddLocationDialog, setShowAddLocationDialog] = useState(false)
  const [showZonesDialog, setShowZonesDialog] = useState(false)
  const [showLocationsDialog, setShowLocationsDialog] = useState(false)
  const [showShippingDialog, setShowShippingDialog] = useState(false)
  const [showCapacityDialog, setShowCapacityDialog] = useState(false)
  const [showStaffDialog, setShowStaffDialog] = useState(false)
  const [showWarehouseDetailsDialog, setShowWarehouseDetailsDialog] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [showNewCountDialog, setShowNewCountDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAssignTeamDialog, setShowAssignTeamDialog] = useState(false)
  const [showStartCountDialog, setShowStartCountDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showCountReportsDialog, setShowCountReportsDialog] = useState(false)
  const [showCountHistoryDialog, setShowCountHistoryDialog] = useState(false)
  const [showCountSettingsDialog, setShowCountSettingsDialog] = useState(false)
  const [showViewCriticalDialog, setShowViewCriticalDialog] = useState(false)
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false)
  const [showAcknowledgeAllDialog, setShowAcknowledgeAllDialog] = useState(false)
  const [showThresholdsDialog, setShowThresholdsDialog] = useState(false)
  const [showEmailRulesDialog, setShowEmailRulesDialog] = useState(false)
  const [showAlertSchedulesDialog, setShowAlertSchedulesDialog] = useState(false)
  const [showAlertReportsDialog, setShowAlertReportsDialog] = useState(false)
  const [showAutomationsDialog, setShowAutomationsDialog] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [showAcknowledgeAlertDialog, setShowAcknowledgeAlertDialog] = useState(false)
  const [showAnalyticsDashboardDialog, setShowAnalyticsDashboardDialog] = useState(false)
  const [showTrendsDialog, setShowTrendsDialog] = useState(false)
  const [showBreakdownDialog, setShowBreakdownDialog] = useState(false)
  const [showForecastsDialog, setShowForecastsDialog] = useState(false)
  const [showAnalyticsReportsDialog, setShowAnalyticsReportsDialog] = useState(false)
  const [showAnalyticsExportDialog, setShowAnalyticsExportDialog] = useState(false)
  const [showAnalyticsScheduleDialog, setShowAnalyticsScheduleDialog] = useState(false)
  const [showConfigureDialog, setShowConfigureDialog] = useState(false)
  const [showProductHistoryDialog, setShowProductHistoryDialog] = useState(false)
  const [showEditSelectedProductDialog, setShowEditSelectedProductDialog] = useState(false)
  const [showAddStockToProductDialog, setShowAddStockToProductDialog] = useState(false)
  const [showTransferProductDialog, setShowTransferProductDialog] = useState(false)

  // Add Stock form state
  const [addStockForm, setAddStockForm] = useState({
    productId: '',
    warehouseId: '',
    quantity: '',
    batchNumber: '',
    notes: ''
  })

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    notes: ''
  })

  // Count form state
  const [countForm, setCountForm] = useState({
    warehouseId: '',
    countType: 'cycle' as 'full' | 'cycle' | 'spot',
    scheduledDate: '',
    assignedTo: ''
  })

  // QuickActions with real dialog handlers
  const mockStockQuickActions = [
    { id: '1', label: 'Add Stock', icon: 'plus', action: () => setShowAddStockDialog(true), variant: 'default' as const },
    { id: '2', label: 'Transfer', icon: 'arrow-right', action: () => setShowTransferDialog(true), variant: 'default' as const },
    { id: '3', label: 'Count', icon: 'clipboard', action: () => setShowCountDialog(true), variant: 'outline' as const },
  ]

  // Handle Add Stock submission
  const handleAddStockSubmit = () => {
    if (!addStockForm.productId || !addStockForm.warehouseId || !addStockForm.quantity) {
      toast.error('Missing required fields', { description: 'Please fill in product, warehouse, and quantity' })
      return
    }
    const product = products.find(p => p.id === addStockForm.productId)
    const warehouse = warehouses.find(w => w.id === addStockForm.warehouseId)
    toast.success('Stock Added Successfully', {
      description: `Added ${addStockForm.quantity} units of ${product?.name || 'product'} to ${warehouse?.name || 'warehouse'}`
    })
    setAddStockForm({ productId: '', warehouseId: '', quantity: '', batchNumber: '', notes: '' })
    setShowAddStockDialog(false)
  }

  // Handle Transfer submission
  const handleTransferSubmit = () => {
    if (!transferForm.productId || !transferForm.fromWarehouseId || !transferForm.toWarehouseId || !transferForm.quantity) {
      toast.error('Missing required fields', { description: 'Please fill in all transfer details' })
      return
    }
    if (transferForm.fromWarehouseId === transferForm.toWarehouseId) {
      toast.error('Invalid Transfer', { description: 'Source and destination warehouses must be different' })
      return
    }
    const product = products.find(p => p.id === transferForm.productId)
    const fromWarehouse = warehouses.find(w => w.id === transferForm.fromWarehouseId)
    const toWarehouse = warehouses.find(w => w.id === transferForm.toWarehouseId)
    toast.success('Transfer Initiated', {
      description: `Transferring ${transferForm.quantity} units of ${product?.name || 'product'} from ${fromWarehouse?.name || 'source'} to ${toWarehouse?.name || 'destination'}`
    })
    setTransferForm({ productId: '', fromWarehouseId: '', toWarehouseId: '', quantity: '', notes: '' })
    setShowTransferDialog(false)
  }

  // Handle Stock Count submission
  const handleCountSubmit = () => {
    if (!countForm.warehouseId || !countForm.scheduledDate) {
      toast.error('Missing required fields', { description: 'Please select warehouse and schedule date' })
      return
    }
    const warehouse = warehouses.find(w => w.id === countForm.warehouseId)
    toast.success('Stock Count Scheduled', {
      description: `${countForm.countType.charAt(0).toUpperCase() + countForm.countType.slice(1)} count scheduled for ${warehouse?.name || 'warehouse'} on ${countForm.scheduledDate}`
    })
    setCountForm({ warehouseId: '', countType: 'cycle', scheduledDate: '', assignedTo: '' })
    setShowCountDialog(false)
  }

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [products, searchQuery, statusFilter, categoryFilter])

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      const matchesType = movementTypeFilter === 'all' || movement.type === movementTypeFilter
      return matchesType
    })
  }, [movements, movementTypeFilter])

  // Stats
  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
    totalValue: products.reduce((sum, p) => sum + (p.quantity * p.unitCost), 0),
    inStock: products.filter(p => p.status === 'in_stock').length,
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    activeAlerts: alerts.filter(a => !a.acknowledged).length,
    pendingMovements: movements.filter(m => m.status === 'pending').length
  }), [products, alerts, movements])

  // Handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDialog(true)
  }

  const handleAddStock = () => {
    toast.info('Add Stock', {
      description: 'Opening stock entry form...'
    })
  }

  const handleTransferStock = () => {
    toast.info('Transfer Stock', {
      description: 'Opening stock transfer form...'
    })
  }

  const handleStartCount = () => {
    toast.info('Stock Count', {
      description: 'Starting inventory count session...'
    })
  }

  const handleExportInventory = () => {
    toast.success('Export started', {
      description: 'Your inventory report is being exported'
    })
  }

  const handleAcknowledgeAlert = (alert: Alert) => {
    toast.success('Alert acknowledged', {
      description: `Stock alert for ${alert.productName} acknowledged`
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-pink-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Stock Management</h1>
                <p className="text-indigo-100">Inventory & warehouse control</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowExportDialog(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50" onClick={() => setShowAddProductDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Box className="w-4 h-4" />
                <span className="text-sm">Products</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Boxes className="w-4 h-4" />
                <span className="text-sm">Total Units</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalQuantity)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Total Value</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(stats.totalValue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">In Stock</span>
              </div>
              <p className="text-2xl font-bold">{stats.inStock}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Low Stock</span>
              </div>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Out of Stock</span>
              </div>
              <p className="text-2xl font-bold">{stats.outOfStock}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Warehouse className="w-4 h-4" />
                <span className="text-sm">Warehouses</span>
              </div>
              <p className="text-2xl font-bold">{warehouses.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 text-indigo-100 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Alerts</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-white dark:bg-gray-800 shadow-sm">
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="movements" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Movements
              </TabsTrigger>
              <TabsTrigger value="warehouses" className="flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                Warehouses
              </TabsTrigger>
              <TabsTrigger value="counts" className="flex items-center gap-2">
                <Clipboard className="w-4 h-4" />
                Stock Counts
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alerts
                {stats.activeAlerts > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{stats.activeAlerts}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center border rounded-lg p-1 bg-white dark:bg-gray-800">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Inventory Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Inventory Management</h2>
                  <p className="text-emerald-100">Fishbowl-level inventory tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProducts.length}</p>
                    <p className="text-emerald-200 text-sm">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProducts.filter(p => p.status === 'in_stock').length}</p>
                    <p className="text-emerald-200 text-sm">In Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProducts.filter(p => p.status === 'low_stock').length}</p>
                    <p className="text-emerald-200 text-sm">Low Stock</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Product', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowAddProductDialog(true) },
                { icon: Package, label: 'Receive', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowReceiveDialog(true) },
                { icon: ArrowRightLeft, label: 'Transfer', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowTransferDialog(true) },
                { icon: ClipboardCheck, label: 'Count', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowCountDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowReportsDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowExportDialog(true) },
                { icon: Upload, label: 'Import', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowImportDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StockStatus | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="on_order">On Order</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
                    className="px-3 py-1.5 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="apparel">Apparel</option>
                    <option value="food">Food</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="finished_goods">Finished Goods</option>
                    <option value="packaging">Packaging</option>
                  </select>
                  <div className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} products
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-0">
                <div className="divide-y dark:divide-gray-700">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                          <Box className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold">{product.name}</span>
                            <span className="text-sm text-muted-foreground">{product.sku}</span>
                            {getStockStatusBadge(product.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {product.brand && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                {product.brand}
                              </span>
                            )}
                            <span className="flex items-center gap-1 capitalize">
                              <Layers className="w-4 h-4" />
                              {product.category.replace('_', ' ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Warehouse className="w-4 h-4" />
                              {product.locations.length} locations
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{product.availableQuantity.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">available</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(product.sellingPrice)}</p>
                          <p className="text-xs text-muted-foreground">Cost: {formatCurrency(product.unitCost)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowScanDialog(true); }}>
                            <ScanLine className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowEditProductDialog(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setShowMoreOptionsDialog(true); }}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Stock Level Indicator */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Stock Level</span>
                          <span>{product.quantity} / {product.reorderPoint + product.reorderQuantity}</span>
                        </div>
                        <Progress
                          value={(product.quantity / (product.reorderPoint + product.reorderQuantity)) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Movements Tab */}
          <TabsContent value="movements" className="space-y-6">
            {/* Movements Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Stock Movements</h2>
                  <p className="text-blue-100">TradeGecko-level movement tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockMovements.length}</p>
                    <p className="text-blue-200 text-sm">Movements</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockMovements.filter(m => m.type === 'in').length}</p>
                    <p className="text-blue-200 text-sm">Inbound</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockMovements.filter(m => m.type === 'out').length}</p>
                    <p className="text-blue-200 text-sm">Outbound</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Movements Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: ArrowDownToLine, label: 'Receive', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowReceiveDialog(true) },
                { icon: ArrowUpFromLine, label: 'Ship', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowShipDialog(true) },
                { icon: ArrowRightLeft, label: 'Transfer', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowTransferDialog(true) },
                { icon: RotateCcw, label: 'Return', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowReturnDialog(true) },
                { icon: Search, label: 'Search', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowSearchDialog(true) },
                { icon: Filter, label: 'Filter', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowFilterDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowExportDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Movement Type Filters */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Movement Type:</span>
                  <div className="flex gap-2">
                    {(['all', 'inbound', 'outbound', 'transfer', 'adjustment'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={movementTypeFilter === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setMovementTypeFilter(type)}
                        className={movementTypeFilter === type ? 'bg-indigo-600' : ''}
                      >
                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Movements List */}
            <Card className="dark:bg-gray-800/50">
              <CardContent className="p-0">
                <div className="divide-y dark:divide-gray-700">
                  {filteredMovements.map((movement) => (
                    <div key={movement.id} className="p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
                          movement.type === 'inbound' ? 'bg-green-500' :
                          movement.type === 'outbound' ? 'bg-orange-500' :
                          movement.type === 'transfer' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}>
                          {movement.type === 'inbound' ? <ArrowDownRight className="w-6 h-6" /> :
                           movement.type === 'outbound' ? <ArrowUpRight className="w-6 h-6" /> :
                           movement.type === 'transfer' ? <RefreshCw className="w-6 h-6" /> :
                           <Activity className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold">{movement.movementNumber}</span>
                            {getMovementTypeBadge(movement.type)}
                            {getMovementStatusBadge(movement.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{movement.product.name}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            {movement.fromLocation && (
                              <span>From: {movement.fromLocation.warehouseName}</span>
                            )}
                            {movement.toLocation && (
                              <span>To: {movement.toLocation.warehouseName}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(Math.abs(movement.totalValue))}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{formatDate(movement.movementDate)}</p>
                          <p>By: {movement.operator}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warehouses Tab */}
          <TabsContent value="warehouses" className="space-y-6">
            {/* Warehouses Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Warehouse Management</h2>
                  <p className="text-amber-100">SAP-level warehouse operations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{warehouses.length}</p>
                    <p className="text-amber-200 text-sm">Warehouses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{warehouses.reduce((sum, w) => sum + w.zones, 0)}</p>
                    <p className="text-amber-200 text-sm">Zones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(warehouses.reduce((sum, w) => sum + w.utilization, 0) / warehouses.length).toFixed(0)}%</p>
                    <p className="text-amber-200 text-sm">Utilization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouses Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Location', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowAddLocationDialog(true) },
                { icon: Warehouse, label: 'Zones', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowZonesDialog(true) },
                { icon: MapPin, label: 'Locations', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowLocationsDialog(true) },
                { icon: Truck, label: 'Shipping', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowShippingDialog(true) },
                { icon: BarChart3, label: 'Capacity', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowCapacityDialog(true) },
                { icon: Users, label: 'Staff', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowStaffDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowExportDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map((warehouse) => (
                <Card key={warehouse.id} className="hover:shadow-lg transition-shadow dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                          <Warehouse className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{warehouse.name}</h3>
                          <p className="text-sm text-muted-foreground">{warehouse.code}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{warehouse.type}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{warehouse.city}, {warehouse.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Manager: {warehouse.manager}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Capacity Utilization</span>
                        <span>{warehouse.utilization}%</span>
                      </div>
                      <Progress value={warehouse.utilization} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Products</p>
                        <p className="font-semibold">{warehouse.productCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="font-semibold text-green-600">{formatNumber(warehouse.totalValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Zones</p>
                        <p className="font-semibold">{warehouse.zones}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bins</p>
                        <p className="font-semibold">{warehouse.bins}</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => { setSelectedWarehouse(warehouse); setShowWarehouseDetailsDialog(true); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Stock Counts Tab */}
          <TabsContent value="counts" className="space-y-6">
            {/* Counts Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Stock Count Management</h2>
                  <p className="text-violet-100">SAP-level cycle counting with variance tracking and reconciliation</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stockCounts.length}</p>
                    <p className="text-violet-200 text-sm">Total Counts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stockCounts.filter(c => c.status === 'in_progress').length}</p>
                    <p className="text-violet-200 text-sm">In Progress</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stockCounts.filter(c => c.status === 'completed').length}</p>
                    <p className="text-violet-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Counts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Count', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowNewCountDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowScheduleDialog(true) },
                { icon: Users, label: 'Assign Team', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowAssignTeamDialog(true) },
                { icon: ClipboardCheck, label: 'Start Count', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowStartCountDialog(true) },
                { icon: CheckCircle2, label: 'Verify', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowVerifyDialog(true) },
                { icon: FileText, label: 'Reports', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowCountReportsDialog(true) },
                { icon: History, label: 'History', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowCountHistoryDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowCountSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Stock Counts</h2>
              <Button onClick={() => setShowCountDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Count
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockCounts.map((count) => (
                <Card key={count.id} className="dark:bg-gray-800/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{count.countNumber}</h3>
                        <p className="text-sm text-muted-foreground">{count.warehouseName}</p>
                      </div>
                      <Badge className={
                        count.status === 'completed' ? 'bg-green-100 text-green-700' :
                        count.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        count.status === 'verified' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {count.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{count.productsCounted} / {count.totalProducts}</span>
                      </div>
                      <Progress value={(count.productsCounted / count.totalProducts) * 100} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-semibold capitalize">{count.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Scheduled</p>
                        <p className="font-semibold">{count.scheduledDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p className={`font-semibold ${count.varianceValue < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(count.varianceValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Assigned</p>
                        <p className="font-semibold">{count.assignedTo.length} staff</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Alerts Banner */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Inventory Alerts Center</h2>
                  <p className="text-red-100">Real-time monitoring with smart thresholds and automated notifications</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{alerts.filter(a => a.severity === 'critical').length}</p>
                    <p className="text-red-200 text-sm">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{alerts.filter(a => a.severity === 'warning').length}</p>
                    <p className="text-red-200 text-sm">Warnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{alerts.filter(a => !a.acknowledged).length}</p>
                    <p className="text-red-200 text-sm">Unread</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: AlertTriangle, label: 'View Critical', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowViewCriticalDialog(true) },
                { icon: Bell, label: 'Notifications', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowNotificationsDialog(true) },
                { icon: CheckCircle2, label: 'Acknowledge', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowAcknowledgeAllDialog(true) },
                { icon: Settings, label: 'Thresholds', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowThresholdsDialog(true) },
                { icon: Mail, label: 'Email Rules', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowEmailRulesDialog(true) },
                { icon: Clock, label: 'Schedules', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowAlertSchedulesDialog(true) },
                { icon: FileText, label: 'Reports', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowAlertReportsDialog(true) },
                { icon: Zap, label: 'Automations', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowAutomationsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="dark:bg-gray-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
                        alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20' :
                        'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {alert.severity === 'critical' ? (
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          ) : (
                            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{alert.productName}</span>
                              <span className="text-sm text-muted-foreground">{alert.sku}</span>
                              {getAlertSeverityBadge(alert.severity)}
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Current: {alert.currentQuantity} {alert.threshold && `/ Threshold: ${alert.threshold}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</span>
                          {!alert.acknowledged && (
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAlert(alert); setShowAcknowledgeAlertDialog(true); }}>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Inventory Analytics</h2>
                  <p className="text-cyan-100">Tableau-level insights with predictive forecasting and trend analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatCurrency(analytics.totalValue)}</p>
                    <p className="text-cyan-200 text-sm">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics.avgTurnoverRate}x</p>
                    <p className="text-cyan-200 text-sm">Turnover</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics.stockAccuracy}%</p>
                    <p className="text-cyan-200 text-sm">Accuracy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Dashboard', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowAnalyticsDashboardDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowTrendsDialog(true) },
                { icon: PieChart, label: 'Breakdown', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowBreakdownDialog(true) },
                { icon: Target, label: 'Forecasts', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowForecastsDialog(true) },
                { icon: FileText, label: 'Reports', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowAnalyticsReportsDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowAnalyticsExportDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowAnalyticsScheduleDialog(true) },
                { icon: Settings, label: 'Configure', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowConfigureDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(analytics.totalValue)}</p>
                  <p className="text-xs text-green-600">+12.5% from last month</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Turnover Rate</span>
                    <Activity className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.avgTurnoverRate}x</p>
                  <p className="text-xs text-muted-foreground">Annual average</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Stock Issues</span>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.lowStockCount + analytics.outOfStockCount}</p>
                  <p className="text-xs text-yellow-600">Need attention</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Movements Today</span>
                    <RefreshCw className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.totalMovements}</p>
                  <p className="text-xs text-muted-foreground">{analytics.pendingOrders} pending</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Movement Trend Chart */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Movement Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.movementTrend.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5">
                          <div
                            className="flex-1 bg-green-500 rounded-t-lg"
                            style={{ height: `${(day.inbound / 70) * 100}%`, minHeight: '4px' }}
                          />
                          <div
                            className="flex-1 bg-orange-500 rounded-t-lg"
                            style={{ height: `${(day.outbound / 70) * 100}%`, minHeight: '4px' }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded" />
                      <span className="text-sm">Inbound</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded" />
                      <span className="text-sm">Outbound</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Value by Category */}
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle>Value by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.valueByCategory.filter(c => c.value > 0).map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize">{category.category.replace('_', ' ')}</span>
                          <span className="font-semibold">{formatNumber(category.value)}</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top & Slow Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Top Movers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topMovers.map((product, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                        </div>
                        <p className="font-semibold">{product.quantity.toLocaleString()} units</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    Slow Movers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.slowMovers.map((product, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                        </div>
                        <p className="font-semibold text-red-600">{product.daysInStock} days</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockStockAIInsights}
              title="Inventory Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockStockCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockStockPredictions}
              title="Stock Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockStockActivities}
            title="Inventory Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockStockQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  {getStockStatusBadge(selectedProduct.status)}
                  <Badge variant="outline" className="capitalize">{selectedProduct.category.replace('_', ' ')}</Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedProduct.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Product Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SKU</span>
                        <span className="font-medium">{selectedProduct.sku}</span>
                      </div>
                      {selectedProduct.brand && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Brand</span>
                          <span className="font-medium">{selectedProduct.brand}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Barcode</span>
                        <span className="font-medium">{selectedProduct.barcode || 'N/A'}</span>
                      </div>
                      {selectedProduct.weight && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Weight</span>
                          <span className="font-medium">{selectedProduct.weight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Pricing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit Cost</span>
                        <span className="font-medium">{formatCurrency(selectedProduct.unitCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selling Price</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedProduct.sellingPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Margin</span>
                        <span className="font-medium">{selectedProduct.margin}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Levels */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedProduct.quantity.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Qty</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedProduct.availableQuantity.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{selectedProduct.reservedQuantity.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Reserved</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{selectedProduct.reorderPoint}</p>
                    <p className="text-sm text-muted-foreground">Reorder Point</p>
                  </div>
                </div>

                {/* Locations */}
                {selectedProduct.locations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Stock Locations</h4>
                    <div className="space-y-2">
                      {selectedProduct.locations.map((location, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Warehouse className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{location.warehouseName}</p>
                              <p className="text-sm text-muted-foreground">
                                Zone {location.zone} / Bin {location.bin}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{location.quantity.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {location.reservedQuantity} reserved
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Supplier */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Supplier Information</h4>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{selectedProduct.supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedProduct.supplier.email}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Lead Time: {selectedProduct.supplier.leadTime} days</p>
                      <p>Min Order: {selectedProduct.supplier.minOrderQuantity}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => { setShowProductDialog(false); setShowAddStockToProductDialog(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                  <Button variant="outline" onClick={() => { setShowProductDialog(false); setShowTransferProductDialog(true); }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                  <Button variant="outline" onClick={() => { setShowProductDialog(false); setShowProductHistoryDialog(true); }}>
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                  <Button variant="outline" onClick={() => { setShowProductDialog(false); setShowEditSelectedProductDialog(true); }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add Stock
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product *</label>
              <select
                value={addStockForm.productId}
                onChange={(e) => setAddStockForm({ ...addStockForm, productId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Warehouse *</label>
              <select
                value={addStockForm.warehouseId}
                onChange={(e) => setAddStockForm({ ...addStockForm, warehouseId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">Select a warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity *</label>
              <Input
                type="number"
                placeholder="Enter quantity to add"
                value={addStockForm.quantity}
                onChange={(e) => setAddStockForm({ ...addStockForm, quantity: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Batch Number</label>
              <Input
                placeholder="Optional batch/lot number"
                value={addStockForm.batchNumber}
                onChange={(e) => setAddStockForm({ ...addStockForm, batchNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Input
                placeholder="Add any notes about this stock addition"
                value={addStockForm.notes}
                onChange={(e) => setAddStockForm({ ...addStockForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddStockDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAddStockSubmit}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Transfer Stock
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product *</label>
              <select
                value={transferForm.productId}
                onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">Select a product</option>
                {products.filter(p => p.quantity > 0).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name} ({product.availableQuantity} available)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">From Warehouse *</label>
                <select
                  value={transferForm.fromWarehouseId}
                  onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">Select source</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Warehouse *</label>
                <select
                  value={transferForm.toWarehouseId}
                  onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">Select destination</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Transfer Quantity *</label>
              <Input
                type="number"
                placeholder="Enter quantity to transfer"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Input
                placeholder="Reason for transfer or special instructions"
                value={transferForm.notes}
                onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowTransferDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleTransferSubmit}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Initiate Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Count Dialog */}
      <Dialog open={showCountDialog} onOpenChange={setShowCountDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
              Schedule Stock Count
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Warehouse *</label>
              <select
                value={countForm.warehouseId}
                onChange={(e) => setCountForm({ ...countForm, warehouseId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">Select a warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} - {warehouse.name} ({warehouse.productCount} products)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Count Type</label>
              <select
                value={countForm.countType}
                onChange={(e) => setCountForm({ ...countForm, countType: e.target.value as 'full' | 'cycle' | 'spot' })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm"
              >
                <option value="cycle">Cycle Count (Partial inventory)</option>
                <option value="full">Full Count (Complete inventory)</option>
                <option value="spot">Spot Check (Random verification)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Scheduled Date *</label>
              <Input
                type="date"
                value={countForm.scheduledDate}
                onChange={(e) => setCountForm({ ...countForm, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assign To</label>
              <Input
                placeholder="Team member names (comma-separated)"
                value={countForm.assignedTo}
                onChange={(e) => setCountForm({ ...countForm, assignedTo: e.target.value })}
              />
            </div>
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Count Type Details:</p>
              <ul className="text-muted-foreground space-y-1">
                <li><strong>Cycle:</strong> Count a portion of inventory on a rotating basis</li>
                <li><strong>Full:</strong> Complete physical inventory of all items</li>
                <li><strong>Spot:</strong> Quick verification of specific items</li>
              </ul>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCountDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleCountSubmit}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Count
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Export Inventory Data
            </DialogTitle>
            <DialogDescription>Choose your export format and options</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Export Format</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="csv">CSV (Comma Separated)</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF Report</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Include Data</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Product Details</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Stock Levels</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Location Information</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Supplier Details</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  const exportData = { products, exportDate: new Date().toISOString(), totalItems: products.length }
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Export complete', { description: 'Your inventory data has been downloaded' })
                  setShowExportDialog(false)
                }}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Add New Product
            </DialogTitle>
            <DialogDescription>Enter the details for the new product</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">SKU *</Label>
                <Input placeholder="e.g., ELEC-001" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Category *</Label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="apparel">Apparel</option>
                  <option value="food">Food</option>
                  <option value="raw_materials">Raw Materials</option>
                  <option value="packaging">Packaging</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Product Name *</Label>
              <Input placeholder="Enter product name" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Description</Label>
              <Textarea placeholder="Product description..." rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Unit Cost *</Label>
                <Input type="number" placeholder="0.00" step="0.01" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Selling Price *</Label>
                <Input type="number" placeholder="0.00" step="0.01" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Reorder Point</Label>
                <Input type="number" placeholder="0" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  setProducts(prev => [...prev, { id: `prod-${Date.now()}`, sku: `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`, name: 'New Product', category: 'Electronics', currentStock: 0, minStock: 10, maxStock: 100, unitCost: 0, sellingPrice: 0, status: 'active', reorderPoint: 10, lastUpdated: new Date().toISOString() }])
                  toast.success('Product added', { description: 'New product has been added to inventory' })
                  setShowAddProductDialog(false)
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Receive Stock
            </DialogTitle>
            <DialogDescription>Record incoming stock receipt</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Purchase Order #</Label>
              <Input placeholder="e.g., PO-2024-001" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Product *</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Quantity Received *</Label>
                <Input type="number" placeholder="0" min="1" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Destination Warehouse</Label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Notes</Label>
              <Textarea placeholder="Any notes about this receipt..." rows={2} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                  toast.success('Stock received', { description: 'Stock has been recorded in inventory' })
                  setShowReceiveDialog(false)
                }}>
                <Package className="w-4 h-4 mr-2" />
                Receive Stock
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Generate Report
            </DialogTitle>
            <DialogDescription>Select a report type to generate</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { name: 'Inventory Valuation', desc: 'Current value of all stock', icon: DollarSign },
              { name: 'Stock Movement', desc: 'All movements over a period', icon: Activity },
              { name: 'Low Stock Alert', desc: 'Items below reorder point', icon: AlertTriangle },
              { name: 'Turnover Analysis', desc: 'Product velocity metrics', icon: RefreshCw },
              { name: 'Warehouse Utilization', desc: 'Capacity and space usage', icon: Warehouse },
            ].map((report, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  const reportData = { name: report.name, generatedAt: new Date().toISOString(), data: products }
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report generated', { description: `${report.name} report has been downloaded` })
                  setShowReportsDialog(false)
                }}
              >
                <report.icon className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-violet-600" />
              Import Inventory Data
            </DialogTitle>
            <DialogDescription>Upload a file to import inventory data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
              <Button variant="outline" size="sm">Choose File</Button>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Supported Formats</Label>
              <p className="text-sm text-muted-foreground">CSV, XLSX, JSON</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Import Options</p>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Update existing products</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Create new products if not found</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = '.csv,.xlsx,.json'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      toast.success('Import complete', { description: `${file.name} imported successfully` })
                      setShowImportDialog(false)
                    }
                  }
                  input.click()
                }}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Inventory Settings
            </DialogTitle>
            <DialogDescription>Configure inventory management settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Valuation Method</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="fifo">FIFO (First In, First Out)</option>
                <option value="lifo">LIFO (Last In, First Out)</option>
                <option value="average">Weighted Average</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Low Stock Threshold (%)</Label>
              <Input type="number" placeholder="20" min="1" max="100" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notifications</Label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Low stock alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Out of stock alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Reorder reminders</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Settings saved', { description: 'Inventory settings have been updated' })
                  setShowSettingsDialog(false)
                }}>
                Save Settings
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Product Dialog */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-indigo-600" />
              Scan Product
            </DialogTitle>
            <DialogDescription>Scan barcode or enter SKU manually</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
              <ScanLine className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Position barcode in front of camera</p>
              <Button variant="outline" size="sm">Activate Scanner</Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">SKU / Barcode</Label>
              <Input placeholder="Enter SKU or barcode" />
            </div>
            {selectedProduct && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}</p>
                <p className="text-sm">Stock: {selectedProduct.availableQuantity} available</p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScanDialog(false)}>Close</Button>
              <Button onClick={() => {
                  if (selectedProduct) {
                    toast.success('Product found', { description: selectedProduct.name })
                  } else {
                    toast.success('Product located')
                  }
                  setShowScanDialog(false)
                }}>
                Look Up
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Product
            </DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">SKU</Label>
                  <Input defaultValue={selectedProduct.sku} />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Category</Label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm" defaultValue={selectedProduct.category}>
                    <option value="electronics">Electronics</option>
                    <option value="apparel">Apparel</option>
                    <option value="food">Food</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Product Name</Label>
                <Input defaultValue={selectedProduct.name} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Unit Cost</Label>
                  <Input type="number" defaultValue={selectedProduct.unitCost} step="0.01" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selling Price</Label>
                  <Input type="number" defaultValue={selectedProduct.sellingPrice} step="0.01" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Reorder Point</Label>
                  <Input type="number" defaultValue={selectedProduct.reorderPoint} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                    toast.success('Product updated', { description: 'Product information has been saved' })
                    setShowEditProductDialog(false)
                  }}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* More Options Dialog */}
      <Dialog open={showMoreOptionsDialog} onOpenChange={setShowMoreOptionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5" />
              Product Actions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { label: 'View Details', icon: Eye, action: () => { setShowMoreOptionsDialog(false); setShowProductDialog(true); } },
              { label: 'Add Stock', icon: Plus, action: () => { setShowMoreOptionsDialog(false); setShowAddStockDialog(true); } },
              { label: 'Transfer Stock', icon: ArrowRightLeft, action: () => { setShowMoreOptionsDialog(false); setShowTransferDialog(true); } },
              { label: 'View History', icon: History, action: () => { setShowMoreOptionsDialog(false); setShowProductHistoryDialog(true); } },
              { label: 'Print Label', icon: Tag, action: () => {
                toast.success('Label sent to printer');
                setShowMoreOptionsDialog(false);
              } },
              { label: 'Delete Product', icon: Trash2, action: () => {
                if (confirm(`Are you sure you want to delete "${selectedProduct?.name || 'this product'}"? This action cannot be undone.`)) {
                  setProducts(prev => prev.filter(p => p.id !== selectedProduct?.id));
                  toast.success('Product deleted successfully');
                }
                setShowMoreOptionsDialog(false);
              } },
            ].map((item, idx) => (
              <Button key={idx} variant="ghost" className="w-full justify-start" onClick={item.action}>
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Ship Stock Dialog */}
      <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="w-5 h-5 text-indigo-600" />
              Ship Stock
            </DialogTitle>
            <DialogDescription>Record outgoing shipment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Sales Order #</Label>
              <Input placeholder="e.g., SO-2024-001" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Product *</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">Select product</option>
                {products.filter(p => p.availableQuantity > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name} ({p.availableQuantity} available)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Quantity to Ship *</Label>
                <Input type="number" placeholder="0" min="1" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Source Warehouse</Label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Shipping Notes</Label>
              <Textarea placeholder="Special handling instructions..." rows={2} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShipDialog(false)}>Cancel</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={async () => {
                  toast.success('Shipment created', { description: 'Stock has been allocated for shipping' })
                  setShowShipDialog(false)
                }}>
                <Truck className="w-4 h-4 mr-2" />
                Create Shipment
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Stock Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              Process Return
            </DialogTitle>
            <DialogDescription>Record a product return to inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Return Authorization #</Label>
              <Input placeholder="e.g., RA-2024-001" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Product *</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Return Quantity *</Label>
                <Input type="number" placeholder="0" min="1" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Condition</Label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                  <option value="good">Good - Resellable</option>
                  <option value="damaged">Damaged</option>
                  <option value="defective">Defective</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Return Reason</Label>
              <Textarea placeholder="Reason for return..." rows={2} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReturnDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                  toast.success('Return processed', { description: 'Stock has been returned to inventory' })
                  setShowReturnDialog(false)
                }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Process Return
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Movements Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-fuchsia-600" />
              Search Movements
            </DialogTitle>
            <DialogDescription>Find specific stock movements</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Movement Number</Label>
              <Input placeholder="e.g., MOV-2024-001" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Movement Type</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">All Types</option>
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSearchDialog(false)}>Cancel</Button>
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-700" onClick={() => {
                  toast.success('Search complete', { description: 'Found 5 matching movements' })
                  setShowSearchDialog(false)
                }}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Movements Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-pink-600" />
              Filter Movements
            </DialogTitle>
            <DialogDescription>Apply filters to movement list</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Status</Label>
              <div className="space-y-2">
                {['Completed', 'Pending', 'In Transit', 'Cancelled'].map(status => (
                  <label key={status} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Warehouse</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">All Warehouses</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Clear Filters</Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => {
                  toast.success('Filters applied')
                  setShowFilterDialog(false)
                }}>
                Apply Filters
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={showAddLocationDialog} onOpenChange={setShowAddLocationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              Add Warehouse Location
            </DialogTitle>
            <DialogDescription>Create a new warehouse or storage location</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Location Code *</Label>
                <Input placeholder="e.g., WH-004" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Location Type</Label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                  <option value="main">Main Warehouse</option>
                  <option value="distribution">Distribution Center</option>
                  <option value="retail">Retail Backroom</option>
                  <option value="fulfillment">Fulfillment Center</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Location Name *</Label>
              <Input placeholder="Enter location name" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Address</Label>
              <Textarea placeholder="Full address..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Capacity (units)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Manager</Label>
                <Input placeholder="Manager name" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddLocationDialog(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => {
                  setWarehouses(prev => [...prev, { id: `wh-${Date.now()}`, code: `WH-00${prev.length + 1}`, name: 'New Warehouse', type: 'Main Warehouse', address: '', capacity: 10000, utilization: 0, zones: 4, staff: 0, status: 'active' }])
                  toast.success('Location added', { description: 'New warehouse location created' })
                  setShowAddLocationDialog(false)
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zones Dialog */}
      <Dialog open={showZonesDialog} onOpenChange={setShowZonesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-orange-600" />
              Manage Zones
            </DialogTitle>
            <DialogDescription>Configure warehouse zones</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Warehouse</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.zones} zones)</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {['Zone A - Receiving', 'Zone B - Storage', 'Zone C - Picking', 'Zone D - Shipping'].map((zone, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm">{zone}</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const newName = prompt('Edit zone name:', zone)
                    if (newName && newName.trim()) {
                      toast.success('Zone updated', { description: `${zone} renamed to ${newName.trim()}` })
                    }
                  }}><Edit className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => {
              const zoneName = prompt('Enter zone name:', 'Zone E - New Area')
              if (zoneName && zoneName.trim()) {
                toast.success('Zone added', { description: zoneName.trim() })
              }
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Zone
            </Button>
            <DialogFooter>
              <Button onClick={() => setShowZonesDialog(false)}>Done</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Locations Dialog */}
      <Dialog open={showLocationsDialog} onOpenChange={setShowLocationsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Bin Locations
            </DialogTitle>
            <DialogDescription>View and manage bin locations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Warehouse</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {['A-01-1', 'A-01-2', 'A-02-1', 'B-01-1', 'B-01-2', 'C-01-1'].map((bin, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{bin}</span>
                    <p className="text-xs text-muted-foreground">Capacity: 100 units</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLocationsDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const binCode = prompt('Enter bin code (e.g., D-01-1):')
                  if (binCode) {
                    toast.success('Bin added', { description: `${binCode} created successfully` })
                  }
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Bin
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipping Settings Dialog */}
      <Dialog open={showShippingDialog} onOpenChange={setShowShippingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-rose-600" />
              Shipping Settings
            </DialogTitle>
            <DialogDescription>Configure shipping options and carriers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Carrier</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>FedEx</option>
                <option>UPS</option>
                <option>USPS</option>
                <option>DHL</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Active Carriers</Label>
              {['FedEx', 'UPS', 'USPS', 'DHL'].map(carrier => (
                <label key={carrier} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">{carrier}</span>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShippingDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Shipping settings saved')
                  setShowShippingDialog(false)
                }}>
                Save Settings
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Capacity Dialog */}
      <Dialog open={showCapacityDialog} onOpenChange={setShowCapacityDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
              Capacity Overview
            </DialogTitle>
            <DialogDescription>View warehouse capacity utilization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {warehouses.map(w => (
              <div key={w.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{w.name}</span>
                  <span className="text-sm">{w.utilization}% Used</span>
                </div>
                <Progress value={w.utilization} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{(w.capacity * w.utilization / 100).toLocaleString()} units</span>
                  <span>{w.capacity.toLocaleString()} total capacity</span>
                </div>
              </div>
            ))}
            <DialogFooter>
              <Button onClick={() => setShowCapacityDialog(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-600" />
              Warehouse Staff
            </DialogTitle>
            <DialogDescription>Manage warehouse personnel</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Warehouse</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              {[
                { name: 'John Smith', role: 'Manager', status: 'Active' },
                { name: 'Sarah Chen', role: 'Supervisor', status: 'Active' },
                { name: 'Mike Johnson', role: 'Picker', status: 'Active' },
              ].map((staff, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{staff.name}</p>
                    <p className="text-xs text-muted-foreground">{staff.role}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700">{staff.status}</Badge>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStaffDialog(false)}>Close</Button>
              <Button onClick={async () => {
                  const staffName = prompt('Enter staff member name:')
                  if (staffName) {
                    toast.success('Staff member added', { description: `${staffName} added to warehouse` })
                  }
                }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warehouse Details Dialog */}
      <Dialog open={showWarehouseDetailsDialog} onOpenChange={setShowWarehouseDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-indigo-600" />
              {selectedWarehouse?.name || 'Warehouse Details'}
            </DialogTitle>
            <DialogDescription>Complete warehouse information and statistics</DialogDescription>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium">{selectedWarehouse.code}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{selectedWarehouse.type}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedWarehouse.city}, {selectedWarehouse.state}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium">{selectedWarehouse.manager}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{selectedWarehouse.productCount}</p>
                  <p className="text-xs text-muted-foreground">Products</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatNumber(selectedWarehouse.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">Value</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{selectedWarehouse.zones}</p>
                  <p className="text-xs text-muted-foreground">Zones</p>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{selectedWarehouse.bins}</p>
                  <p className="text-xs text-muted-foreground">Bins</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Capacity Utilization</p>
                <Progress value={selectedWarehouse.utilization} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{selectedWarehouse.utilization}% of {selectedWarehouse.capacity.toLocaleString()} units</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWarehouseDetailsDialog(false)}>Close</Button>
                <Button onClick={() => { setShowWarehouseDetailsDialog(false); setShowSettingsDialog(true); }}>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Count Dialog */}
      <Dialog open={showNewCountDialog} onOpenChange={setShowNewCountDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-600" />
              Create New Stock Count
            </DialogTitle>
            <DialogDescription>Start a new inventory count session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Warehouse *</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">Select warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Count Type</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="cycle">Cycle Count</option>
                <option value="full">Full Inventory</option>
                <option value="spot">Spot Check</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Zone (Optional)</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="">All Zones</option>
                <option value="A">Zone A</option>
                <option value="B">Zone B</option>
                <option value="C">Zone C</option>
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewCountDialog(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => {
                  toast.success('Count created', { description: 'New stock count has been initiated' })
                  setShowNewCountDialog(false)
                }}>
                Start Count
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Count Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Schedule Count
            </DialogTitle>
            <DialogDescription>Schedule a future inventory count</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Warehouse</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Scheduled Date</Label>
              <Input type="date" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Scheduled Time</Label>
              <Input type="time" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Repeat</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option value="none">No Repeat</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                  toast.success('Count scheduled')
                  setShowScheduleDialog(false)
                }}>
                Schedule
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Team Dialog */}
      <Dialog open={showAssignTeamDialog} onOpenChange={setShowAssignTeamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-fuchsia-600" />
              Assign Team
            </DialogTitle>
            <DialogDescription>Assign team members to stock count</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Count</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {stockCounts.map(c => (
                  <option key={c.id} value={c.id}>{c.countNumber} - {c.warehouseName}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Team Members</Label>
              <div className="space-y-2">
                {['John Smith', 'Sarah Chen', 'Mike Johnson', 'Lisa Wong'].map(name => (
                  <label key={name} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignTeamDialog(false)}>Cancel</Button>
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-700" onClick={() => {
                  toast.success('Team assigned')
                  setShowAssignTeamDialog(false)
                }}>
                Assign Team
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Start Count Dialog */}
      <Dialog open={showStartCountDialog} onOpenChange={setShowStartCountDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-pink-600" />
              Start Count Session
            </DialogTitle>
            <DialogDescription>Begin counting inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Scheduled Count</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {stockCounts.filter(c => c.status === 'scheduled').map(c => (
                  <option key={c.id} value={c.id}>{c.countNumber} - {c.warehouseName}</option>
                ))}
              </select>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Count Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Scan each product barcode</li>
                <li>2. Enter physical count quantity</li>
                <li>3. Note any discrepancies</li>
                <li>4. Submit when zone complete</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartCountDialog(false)}>Cancel</Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => {
                  toast.success('Count started', { description: 'Counting session is now active' })
                  setShowStartCountDialog(false)
                }}>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Start Counting
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Count Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-rose-600" />
              Verify Count
            </DialogTitle>
            <DialogDescription>Review and verify count results</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Completed Count</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                {stockCounts.filter(c => c.status === 'completed').map(c => (
                  <option key={c.id} value={c.id}>{c.countNumber} - Variance: {formatCurrency(c.varianceValue)}</option>
                ))}
              </select>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Products Counted</span>
                <span className="font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Variance Items</span>
                <span className="font-medium text-red-600">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Variance Value</span>
                <span className="font-medium text-red-600">-$2,340</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>Review Later</Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => {
                  toast.success('Count verified', { description: 'Inventory has been updated' })
                  setShowVerifyDialog(false)
                }}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Verify & Apply
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Count Reports Dialog */}
      <Dialog open={showCountReportsDialog} onOpenChange={setShowCountReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-600" />
              Count Reports
            </DialogTitle>
            <DialogDescription>Generate stock count reports</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { name: 'Variance Report', desc: 'Discrepancies between system and physical count' },
              { name: 'Count Summary', desc: 'Overview of all count activities' },
              { name: 'Accuracy Report', desc: 'Count accuracy by zone and product' },
              { name: 'Adjustment Log', desc: 'All inventory adjustments made' },
            ].map((report, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  const reportData = { name: report.name, generatedAt: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report generated', { description: `${report.name} downloaded` })
                  setShowCountReportsDialog(false)
                }}
              >
                <FileText className="w-5 h-5 mr-3 text-red-600" />
                <div className="text-left">
                  <p className="font-medium">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Count History Dialog */}
      <Dialog open={showCountHistoryDialog} onOpenChange={setShowCountHistoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-orange-600" />
              Count History
            </DialogTitle>
            <DialogDescription>View past stock counts</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stockCounts.map(count => (
              <div key={count.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{count.countNumber}</span>
                  <Badge className={count.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {count.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{count.warehouseName}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{count.scheduledDate}</span>
                  <span>Variance: {formatCurrency(count.varianceValue)}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCountHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Count Settings Dialog */}
      <Dialog open={showCountSettingsDialog} onOpenChange={setShowCountSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-600" />
              Count Settings
            </DialogTitle>
            <DialogDescription>Configure stock count preferences</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Count Method</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>Blind Count</option>
                <option>Guided Count</option>
                <option>Cycle Count</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Variance Threshold (%)</Label>
              <Input type="number" placeholder="5" min="1" max="100" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Options</Label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Require supervisor approval for adjustments</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Auto-recount items with high variance</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCountSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Settings saved')
                  setShowCountSettingsDialog(false)
                }}>
                Save Settings
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Critical Alerts Dialog */}
      <Dialog open={showViewCriticalDialog} onOpenChange={setShowViewCriticalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Alerts
            </DialogTitle>
            <DialogDescription>Items requiring immediate attention</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {alerts.filter(a => a.severity === 'critical').map(alert => (
              <div key={alert.id} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{alert.productName}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">Current: {alert.currentQuantity}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                      toast.success('Alert acknowledged')
                    }}>
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
            {alerts.filter(a => a.severity === 'critical').length === 0 && (
              <p className="text-center text-muted-foreground py-8">No critical alerts</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewCriticalDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-600" />
              Notification Settings
            </DialogTitle>
            <DialogDescription>Configure alert notifications</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Critical alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Low stock warnings</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Daily summary</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Out of stock alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Reorder reminders</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotificationsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Notification settings saved')
                  setShowNotificationsDialog(false)
                }}>
                Save Settings
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Acknowledge All Dialog */}
      <Dialog open={showAcknowledgeAllDialog} onOpenChange={setShowAcknowledgeAllDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-pink-600" />
              Acknowledge All
            </DialogTitle>
            <DialogDescription>Mark all alerts as acknowledged</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              This will acknowledge {alerts.filter(a => !a.acknowledged).length} unread alerts. Are you sure?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAcknowledgeAllDialog(false)}>Cancel</Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => {
                  toast.success('All alerts acknowledged')
                  setShowAcknowledgeAllDialog(false)
                }}>
                Acknowledge All
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thresholds Dialog */}
      <Dialog open={showThresholdsDialog} onOpenChange={setShowThresholdsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-fuchsia-600" />
              Alert Thresholds
            </DialogTitle>
            <DialogDescription>Configure stock level thresholds</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Low Stock Warning (%)</Label>
              <Input type="number" placeholder="20" min="1" max="100" />
              <p className="text-xs text-muted-foreground mt-1">Alert when stock falls below this % of reorder point</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Critical Stock (%)</Label>
              <Input type="number" placeholder="10" min="1" max="100" />
              <p className="text-xs text-muted-foreground mt-1">Critical alert threshold</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Overstock Threshold (%)</Label>
              <Input type="number" placeholder="150" min="100" max="300" />
              <p className="text-xs text-muted-foreground mt-1">Alert when stock exceeds this % of target</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowThresholdsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Thresholds updated')
                  setShowThresholdsDialog(false)
                }}>
                Save Thresholds
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Rules Dialog */}
      <Dialog open={showEmailRulesDialog} onOpenChange={setShowEmailRulesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Email Alert Rules
            </DialogTitle>
            <DialogDescription>Configure email notification rules</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Recipients</Label>
              <Textarea placeholder="Enter email addresses (one per line)" rows={3} />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Alert Types to Email</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Out of stock</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Low stock</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Overstock</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailRulesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Email rules saved')
                  setShowEmailRulesDialog(false)
                }}>
                Save Rules
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Schedules Dialog */}
      <Dialog open={showAlertSchedulesDialog} onOpenChange={setShowAlertSchedulesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" />
              Alert Schedules
            </DialogTitle>
            <DialogDescription>Configure when alerts are sent</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Summary Report Schedule</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>Daily at 8:00 AM</option>
                <option>Weekly on Monday</option>
                <option>Bi-weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Quiet Hours</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <Input type="time" defaultValue="22:00" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <Input type="time" defaultValue="07:00" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Critical alerts will still be sent during quiet hours</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertSchedulesDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Schedule saved')
                  setShowAlertSchedulesDialog(false)
                }}>
                Save Schedule
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Reports Dialog */}
      <Dialog open={showAlertReportsDialog} onOpenChange={setShowAlertReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Alert Reports
            </DialogTitle>
            <DialogDescription>Generate alert and exception reports</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { name: 'Alert History', desc: 'All alerts over selected period' },
              { name: 'Exception Report', desc: 'Stock level exceptions' },
              { name: 'Response Time Report', desc: 'Time to acknowledge alerts' },
              { name: 'Trend Analysis', desc: 'Alert frequency trends' },
            ].map((report, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  const reportData = { name: report.name, generatedAt: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report generated', { description: `${report.name} downloaded` })
                  setShowAlertReportsDialog(false)
                }}
              >
                <FileText className="w-5 h-5 mr-3 text-indigo-600" />
                <div className="text-left">
                  <p className="font-medium">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Automations Dialog */}
      <Dialog open={showAutomationsDialog} onOpenChange={setShowAutomationsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Alert Automations
            </DialogTitle>
            <DialogDescription>Configure automated responses to alerts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { name: 'Auto-reorder', desc: 'Automatically create PO when stock is low', enabled: true },
                { name: 'Escalation', desc: 'Escalate unacknowledged critical alerts', enabled: true },
                { name: 'Supplier notification', desc: 'Notify supplier of upcoming orders', enabled: false },
              ].map((auto, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{auto.name}</p>
                    <p className="text-xs text-muted-foreground">{auto.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={auto.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAutomationsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Automations saved')
                  setShowAutomationsDialog(false)
                }}>
                Save Settings
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Acknowledge Single Alert Dialog */}
      <Dialog open={showAcknowledgeAlertDialog} onOpenChange={setShowAcknowledgeAlertDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Acknowledge Alert
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedAlert.productName}</p>
                <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Add Note (Optional)</Label>
                <Textarea placeholder="Action taken or notes..." rows={2} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAcknowledgeAlertDialog(false)}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    toast.success('Alert acknowledged', { description: selectedAlert.productName })
                    setShowAcknowledgeAlertDialog(false)
                  }}>
                  Acknowledge
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Dashboard Dialog */}
      <Dialog open={showAnalyticsDashboardDialog} onOpenChange={setShowAnalyticsDashboardDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              Analytics Dashboard
            </DialogTitle>
            <DialogDescription>Key inventory metrics at a glance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-600">{formatNumber(analytics.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Total Inventory Value</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.avgTurnoverRate}x</p>
                <p className="text-xs text-muted-foreground">Turnover Rate</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.totalProducts}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{analytics.lowStockCount + analytics.outOfStockCount}</p>
                <p className="text-xs text-muted-foreground">Needs Attention</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowAnalyticsDashboardDialog(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trends Dialog */}
      <Dialog open={showTrendsDialog} onOpenChange={setShowTrendsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Inventory Trends
            </DialogTitle>
            <DialogDescription>Analyze inventory movement patterns</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Time Period</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Last year</option>
              </select>
            </div>
            <div className="h-40 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Trend chart visualization</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <p className="text-green-600 font-medium">+12.5%</p>
                <p className="text-xs text-muted-foreground">Inbound Growth</p>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-blue-600 font-medium">+8.3%</p>
                <p className="text-xs text-muted-foreground">Outbound Growth</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrendsDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const trendData = { exportDate: new Date().toISOString(), inboundGrowth: '+12.5%', outboundGrowth: '+8.3%' }
                  const blob = new Blob([JSON.stringify(trendData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `inventory-trends-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Trend data exported')
                  setShowTrendsDialog(false)
                }}>
                Export Data
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breakdown Dialog */}
      <Dialog open={showBreakdownDialog} onOpenChange={setShowBreakdownDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Inventory Breakdown
            </DialogTitle>
            <DialogDescription>Breakdown by category, location, and value</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">By Category</p>
              {analytics.valueByCategory.filter(c => c.value > 0).map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{cat.category.replace('_', ' ')}</span>
                      <span>{cat.percentage}%</span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">By Warehouse</p>
              {warehouses.map((w, idx) => (
                <div key={idx} className="flex justify-between text-sm p-2 bg-muted/50 rounded mb-1">
                  <span>{w.name}</span>
                  <span className="font-medium">{formatNumber(w.totalValue)}</span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowBreakdownDialog(false)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forecasts Dialog */}
      <Dialog open={showForecastsDialog} onOpenChange={setShowForecastsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-600" />
              Demand Forecasts
            </DialogTitle>
            <DialogDescription>AI-powered demand predictions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <p className="font-medium mb-2">30-Day Forecast</p>
              <p className="text-sm text-muted-foreground">Based on historical trends and seasonal patterns</p>
            </div>
            <div className="space-y-2">
              {[
                { product: 'Wireless Earbuds Pro', forecast: '+250 units', confidence: 'High' },
                { product: 'Smart Watch Series X', forecast: '+180 units', confidence: 'Medium' },
                { product: 'Premium Cotton T-Shirt', forecast: '+450 units', confidence: 'High' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.product}</p>
                    <p className="text-xs text-muted-foreground">Forecast: {item.forecast}</p>
                  </div>
                  <Badge variant="outline">{item.confidence}</Badge>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForecastsDialog(false)}>Close</Button>
              <Button onClick={() => {
                  const forecastData = { generatedAt: new Date().toISOString(), forecasts: [{ product: 'Wireless Earbuds Pro', forecast: '+250 units' }] }
                  const blob = new Blob([JSON.stringify(forecastData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `demand-forecast-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Forecast generated', { description: 'Report downloaded' })
                  setShowForecastsDialog(false)
                }}>
                Full Report
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Reports Dialog */}
      <Dialog open={showAnalyticsReportsDialog} onOpenChange={setShowAnalyticsReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Analytics Reports
            </DialogTitle>
            <DialogDescription>Generate detailed analytics reports</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { name: 'Inventory Valuation', desc: 'Complete valuation by method' },
              { name: 'Turnover Analysis', desc: 'Product velocity and aging' },
              { name: 'ABC Analysis', desc: 'Classify products by value/volume' },
              { name: 'Seasonal Trends', desc: 'Year-over-year comparisons' },
              { name: 'Dead Stock Report', desc: 'Non-moving inventory' },
            ].map((report, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start h-auto py-3"
                onClick={() => {
                  const reportData = { name: report.name, generatedAt: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report generated', { description: `${report.name} downloaded` })
                  setShowAnalyticsReportsDialog(false)
                }}
              >
                <FileText className="w-5 h-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">{report.name}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Export Dialog */}
      <Dialog open={showAnalyticsExportDialog} onOpenChange={setShowAnalyticsExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-fuchsia-600" />
              Export Analytics
            </DialogTitle>
            <DialogDescription>Export analytics data</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Data to Export</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Inventory summary</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Movement data</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Forecast data</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Historical trends</span>
                </label>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Format</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>Excel (XLSX)</option>
                <option>CSV</option>
                <option>PDF</option>
              </select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnalyticsExportDialog(false)}>Cancel</Button>
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-700" onClick={() => {
                  const exportData = { analytics, exportDate: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Export complete', { description: 'File downloaded' })
                  setShowAnalyticsExportDialog(false)
                }}>
                Export
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Schedule Dialog */}
      <Dialog open={showAnalyticsScheduleDialog} onOpenChange={setShowAnalyticsScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-600" />
              Schedule Reports
            </DialogTitle>
            <DialogDescription>Set up automated report delivery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Report Type</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>Daily Summary</option>
                <option>Weekly Inventory Report</option>
                <option>Monthly Analytics</option>
                <option>Quarterly Review</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Delivery Time</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Recipients</Label>
              <Input placeholder="email@example.com" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnalyticsScheduleDialog(false)}>Cancel</Button>
              <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => {
                  toast.success('Report scheduled')
                  setShowAnalyticsScheduleDialog(false)
                }}>
                Schedule
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Analytics Dialog */}
      <Dialog open={showConfigureDialog} onOpenChange={setShowConfigureDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-600" />
              Configure Analytics
            </DialogTitle>
            <DialogDescription>Customize analytics settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Time Range</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Year to date</option>
                <option>Last 12 months</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Currency</Label>
              <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                <option>USD ($)</option>
                <option>EUR (E)</option>
                <option>GBP (P)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Display Options</Label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Show comparison to previous period</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Include forecasts</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigureDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                  toast.success('Configuration saved')
                  setShowConfigureDialog(false)
                }}>
                Save Settings
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product History Dialog */}
      <Dialog open={showProductHistoryDialog} onOpenChange={setShowProductHistoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Product History
            </DialogTitle>
            <DialogDescription>{selectedProduct?.name || 'Product'} movement history</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {movements.filter(m => selectedProduct && m.product.id === selectedProduct.id).length > 0 ? (
              movements.filter(m => selectedProduct && m.product.id === selectedProduct.id).map(mov => (
                <div key={mov.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{mov.movementNumber}</span>
                    {getMovementTypeBadge(mov.type)}
                  </div>
                  <p className="text-sm">Quantity: {mov.quantity > 0 ? '+' : ''}{mov.quantity}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(mov.movementDate)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No movement history found</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowProductHistoryDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Selected Product Dialog */}
      <Dialog open={showEditSelectedProductDialog} onOpenChange={setShowEditSelectedProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Product
            </DialogTitle>
            <DialogDescription>Update {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">SKU</Label>
                  <Input defaultValue={selectedProduct.sku} />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Category</Label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm" defaultValue={selectedProduct.category}>
                    <option value="electronics">Electronics</option>
                    <option value="apparel">Apparel</option>
                    <option value="food">Food</option>
                    <option value="raw_materials">Raw Materials</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Product Name</Label>
                <Input defaultValue={selectedProduct.name} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Unit Cost</Label>
                  <Input type="number" defaultValue={selectedProduct.unitCost} step="0.01" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Selling Price</Label>
                  <Input type="number" defaultValue={selectedProduct.sellingPrice} step="0.01" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Reorder Point</Label>
                  <Input type="number" defaultValue={selectedProduct.reorderPoint} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditSelectedProductDialog(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                    toast.success('Product updated')
                    setShowEditSelectedProductDialog(false)
                  }}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stock to Product Dialog */}
      <Dialog open={showAddStockToProductDialog} onOpenChange={setShowAddStockToProductDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Add Stock
            </DialogTitle>
            <DialogDescription>Add stock to {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">Current stock: {selectedProduct.quantity}</p>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Warehouse</Label>
                <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Quantity to Add</Label>
                <Input type="number" placeholder="0" min="1" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Batch Number (Optional)</Label>
                <Input placeholder="e.g., BATCH-2024-001" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddStockToProductDialog(false)}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    toast.success('Stock added', { description: `Stock added to ${selectedProduct.name}` })
                    setShowAddStockToProductDialog(false)
                  }}>
                  Add Stock
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Product Stock Dialog */}
      <Dialog open={showTransferProductDialog} onOpenChange={setShowTransferProductDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Transfer Stock
            </DialogTitle>
            <DialogDescription>Transfer {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">Available: {selectedProduct.availableQuantity}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">From</Label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                    {selectedProduct.locations.map(loc => (
                      <option key={loc.warehouseId} value={loc.warehouseId}>{loc.warehouseName} ({loc.quantity})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">To</Label>
                  <select className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm">
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Transfer Quantity</Label>
                <Input type="number" placeholder="0" min="1" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTransferProductDialog(false)}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                    toast.success('Transfer initiated', { description: `Transferring ${selectedProduct.name}` })
                    setShowTransferProductDialog(false)
                  }}>
                  Transfer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
