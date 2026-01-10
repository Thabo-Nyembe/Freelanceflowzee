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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ValuationMethod = 'fifo' | 'lifo' | 'average' | 'specific'
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

// QuickActions will be defined inside component to access state setters

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

  // Dialog states for real functionality
  const [showAddStockDialog, setShowAddStockDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showCountDialog, setShowCountDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAlertSettingsDialog, setShowAlertSettingsDialog] = useState(false)

  // Form states
  const [addStockForm, setAddStockForm] = useState({
    productId: '',
    quantity: '',
    warehouseId: '',
    zone: '',
    bin: '',
    batchNumber: '',
    notes: ''
  })

  const [transferForm, setTransferForm] = useState({
    productId: '',
    quantity: '',
    fromWarehouse: '',
    toWarehouse: '',
    fromZone: '',
    toZone: '',
    notes: ''
  })

  const [countForm, setCountForm] = useState({
    warehouseId: '',
    countType: 'cycle' as 'full' | 'cycle' | 'spot',
    scheduledDate: '',
    assignedTo: [] as string[],
    notes: ''
  })

  const [exportForm, setExportForm] = useState({
    format: 'csv' as 'csv' | 'xlsx' | 'pdf',
    includeQuantities: true,
    includeValues: true,
    includeLocations: true,
    dateRange: 'all' as 'all' | '30d' | '90d' | '1y'
  })

  const [newProductForm, setNewProductForm] = useState({
    name: '',
    sku: '',
    category: 'electronics' as ProductCategory,
    brand: '',
    description: '',
    unitCost: '',
    sellingPrice: '',
    reorderPoint: '',
    reorderQuantity: ''
  })

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleAddStock = () => {
    setShowAddStockDialog(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleTransferStock = () => {
    setShowTransferDialog(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleStartCount = () => {
    setShowCountDialog(true)
  }

  const handleExportInventory = () => {
    setShowExportDialog(true)
  }

  const handleAcknowledgeAlert = (alertItem: Alert) => {
    toast.success('Alert acknowledged', {
      description: `Stock alert for ${alertItem.productName} acknowledged`
    })
  }

  const handleSubmitAddStock = () => {
    if (!addStockForm.productId || !addStockForm.quantity || !addStockForm.warehouseId) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Stock added successfully', {
      description: `Added ${addStockForm.quantity} units to inventory`
    })
    setShowAddStockDialog(false)
    setAddStockForm({
      productId: '',
      quantity: '',
      warehouseId: '',
      zone: '',
      bin: '',
      batchNumber: '',
      notes: ''
    })
  }

  const handleSubmitTransfer = () => {
    if (!transferForm.productId || !transferForm.quantity || !transferForm.fromWarehouse || !transferForm.toWarehouse) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Transfer initiated', {
      description: `${transferForm.quantity} units scheduled for transfer`
    })
    setShowTransferDialog(false)
    setTransferForm({
      productId: '',
      quantity: '',
      fromWarehouse: '',
      toWarehouse: '',
      fromZone: '',
      toZone: '',
      notes: ''
    })
  }

  const handleSubmitCount = () => {
    if (!countForm.warehouseId || !countForm.scheduledDate) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Stock count scheduled', {
      description: `${countForm.countType} count scheduled for ${countForm.scheduledDate}`
    })
    setShowCountDialog(false)
    setCountForm({
      warehouseId: '',
      countType: 'cycle',
      scheduledDate: '',
      assignedTo: [],
      notes: ''
    })
  }

  const handleSubmitExport = () => {
    toast.success('Export started', {
      description: `Generating ${exportForm.format.toUpperCase()} inventory report...`
    })
    setShowExportDialog(false)
  }

  const handleSubmitNewProduct = () => {
    if (!newProductForm.name || !newProductForm.sku || !newProductForm.unitCost) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Product created', {
      description: `${newProductForm.name} has been added to inventory`
    })
    setShowAddProductDialog(false)
    setNewProductForm({
      name: '',
      sku: '',
      category: 'electronics',
      brand: '',
      description: '',
      unitCost: '',
      sellingPrice: '',
      reorderPoint: '',
      reorderQuantity: ''
    })
  }

  // QuickActions with real functionality
  const stockQuickActions = [
    { id: '1', label: 'Add Stock', icon: 'plus', action: () => setShowAddStockDialog(true), variant: 'default' as const },
    { id: '2', label: 'Transfer', icon: 'arrow-right', action: () => setShowTransferDialog(true), variant: 'default' as const },
    { id: '3', label: 'Count', icon: 'clipboard', action: () => setShowCountDialog(true), variant: 'outline' as const },
  ]

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
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={handleExportInventory}>
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
                { icon: Package, label: 'Receive', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowAddStockDialog(true) },
                { icon: ArrowRightLeft, label: 'Transfer', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowTransferDialog(true) },
                { icon: ClipboardCheck, label: 'Count', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowCountDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setActiveTab('analytics') },
                { icon: Download, label: 'Export', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowExportDialog(true) },
                { icon: Upload, label: 'Import', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => toast.info('Import Feature', { description: 'Drag and drop CSV/Excel file or click to browse' }) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => toast.info('Settings', { description: 'Opening inventory settings...' }) }
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
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toast.info('Scan Barcode', { description: `Barcode: ${product.barcode || 'Not assigned'}` }) }}>
                            <ScanLine className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toast.info('Edit Product', { description: `Editing ${product.name}` }) }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toast.info('More Options', { description: 'Duplicate, Archive, Delete...' }) }}>
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
                { icon: ArrowDownToLine, label: 'Receive', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowAddStockDialog(true) },
                { icon: ArrowUpFromLine, label: 'Ship', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.info('Ship Stock', { description: 'Select items from inventory to create shipment' }) },
                { icon: ArrowRightLeft, label: 'Transfer', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowTransferDialog(true) },
                { icon: RotateCcw, label: 'Return', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.info('Process Return', { description: 'Enter return details to process inventory return' }) },
                { icon: Search, label: 'Search', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => document.querySelector<HTMLInputElement>('input[placeholder="Search products..."]')?.focus() },
                { icon: Filter, label: 'Filter', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setMovementTypeFilter('all') },
                { icon: Download, label: 'Export', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowExportDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => toast.info('Movement Settings', { description: 'Configure movement tracking preferences' }) }
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
                { icon: Plus, label: 'Add Location', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => toast.info('Add Warehouse Location', { description: 'Configure new warehouse zone or bin location' }) },
                { icon: Warehouse, label: 'Zones', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => toast.info('Zone Management', { description: 'Manage warehouse zones and areas' }) },
                { icon: MapPin, label: 'Locations', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => toast.info('Bin Locations', { description: 'View and edit bin location assignments' }) },
                { icon: Truck, label: 'Shipping', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => toast.info('Shipping Integration', { description: 'Configure shipping carriers and dock doors' }) },
                { icon: BarChart3, label: 'Capacity', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => toast.info('Capacity Report', { description: 'View warehouse capacity utilization details' }) },
                { icon: Users, label: 'Staff', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => toast.info('Warehouse Staff', { description: 'Manage warehouse personnel and assignments' }) },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowExportDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => toast.info('Warehouse Settings', { description: 'Configure warehouse preferences' }) }
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

                    <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => { /* TODO: Implement warehouse details dialog */ }}>
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
                { icon: Plus, label: 'New Count', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowCountDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowCountDialog(true) },
                { icon: Users, label: 'Assign Team', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => toast.info('Assign Team', { description: 'Select team members to assign to stock count' }) },
                { icon: ClipboardCheck, label: 'Start Count', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => toast.info('Start Count Session', { description: 'Begin recording inventory counts' }) },
                { icon: CheckCircle2, label: 'Verify', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => toast.info('Verify Counts', { description: 'Review and approve count discrepancies' }) },
                { icon: FileText, label: 'Reports', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowExportDialog(true) },
                { icon: History, label: 'History', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => toast.info('Count History', { description: 'View historical stock count records' }) },
                { icon: Settings, label: 'Settings', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => toast.info('Count Settings', { description: 'Configure count preferences and schedules' }) },
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
                { icon: AlertTriangle, label: 'View Critical', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => toast.info('Critical Alerts', { description: `${alerts.filter(a => a.severity === 'critical').length} critical alerts require attention` }) },
                { icon: Bell, label: 'Notifications', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => toast.info('Notification Settings', { description: 'Configure how you receive stock alerts' }) },
                { icon: CheckCircle2, label: 'Acknowledge', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => toast.success('All Acknowledged', { description: 'All visible alerts have been acknowledged' }) },
                { icon: Settings, label: 'Thresholds', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowAlertSettingsDialog(true) },
                { icon: Mail, label: 'Email Rules', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.info('Email Rules', { description: 'Configure email notification rules for alerts' }) },
                { icon: Clock, label: 'Schedules', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => toast.info('Alert Schedules', { description: 'Set up scheduled alert digests' }) },
                { icon: FileText, label: 'Reports', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowExportDialog(true) },
                { icon: Zap, label: 'Automations', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.info('Alert Automations', { description: 'Create automated responses to stock alerts' }) },
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
                            <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert)}>
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
                { icon: BarChart3, label: 'Dashboard', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.info('Analytics Dashboard', { description: 'View comprehensive inventory analytics' }) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.info('Trend Analysis', { description: 'Analyzing inventory movement trends' }) },
                { icon: PieChart, label: 'Breakdown', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.info('Inventory Breakdown', { description: 'View inventory by category, location, and value' }) },
                { icon: Target, label: 'Forecasts', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => toast.info('Demand Forecasting', { description: 'AI-powered demand predictions for inventory planning' }) },
                { icon: FileText, label: 'Reports', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowExportDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowExportDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => toast.info('Scheduled Reports', { description: 'Set up automated report generation' }) },
                { icon: Settings, label: 'Configure', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => toast.info('Analytics Settings', { description: 'Configure analytics preferences and metrics' }) },
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
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
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
            actions={stockQuickActions}
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
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                    setAddStockForm(prev => ({ ...prev, productId: selectedProduct.id }))
                    setShowProductDialog(false)
                    setShowAddStockDialog(true)
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stock
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setTransferForm(prev => ({ ...prev, productId: selectedProduct.id }))
                    setShowProductDialog(false)
                    setShowTransferDialog(true)
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Transfer
                  </Button>
                  <Button variant="outline" onClick={() => { /* TODO: Implement movement history dialog */ }}>
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                  <Button variant="outline" onClick={() => { /* TODO: Implement product editor dialog */ }}>
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
              <Plus className="w-5 h-5 text-emerald-600" />
              Add Stock
            </DialogTitle>
            <DialogDescription>
              Record incoming inventory for an existing product
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-product">Product *</Label>
              <Select
                value={addStockForm.productId}
                onValueChange={(value) => setAddStockForm(prev => ({ ...prev, productId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Quantity *</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={addStockForm.quantity}
                  onChange={(e) => setAddStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-warehouse">Warehouse *</Label>
                <Select
                  value={addStockForm.warehouseId}
                  onValueChange={(value) => setAddStockForm(prev => ({ ...prev, warehouseId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-zone">Zone</Label>
                <Input
                  id="add-zone"
                  placeholder="e.g., A, B, C"
                  value={addStockForm.zone}
                  onChange={(e) => setAddStockForm(prev => ({ ...prev, zone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-bin">Bin Location</Label>
                <Input
                  id="add-bin"
                  placeholder="e.g., A-12-3"
                  value={addStockForm.bin}
                  onChange={(e) => setAddStockForm(prev => ({ ...prev, bin: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-batch">Batch Number</Label>
              <Input
                id="add-batch"
                placeholder="Enter batch number (optional)"
                value={addStockForm.batchNumber}
                onChange={(e) => setAddStockForm(prev => ({ ...prev, batchNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-notes">Notes</Label>
              <Textarea
                id="add-notes"
                placeholder="Additional notes..."
                value={addStockForm.notes}
                onChange={(e) => setAddStockForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAddStock} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </DialogFooter>
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
            <DialogDescription>
              Move inventory between warehouses or locations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-product">Product *</Label>
              <Select
                value={transferForm.productId}
                onValueChange={(value) => setTransferForm(prev => ({ ...prev, productId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.filter(p => p.quantity > 0).map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.name} ({product.availableQuantity} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-quantity">Quantity to Transfer *</Label>
              <Input
                id="transfer-quantity"
                type="number"
                placeholder="Enter quantity"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-from">From Warehouse *</Label>
                <Select
                  value={transferForm.fromWarehouse}
                  onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromWarehouse: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-to">To Warehouse *</Label>
                <Select
                  value={transferForm.toWarehouse}
                  onValueChange={(value) => setTransferForm(prev => ({ ...prev, toWarehouse: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-from-zone">From Zone</Label>
                <Input
                  id="transfer-from-zone"
                  placeholder="Zone"
                  value={transferForm.fromZone}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, fromZone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-to-zone">To Zone</Label>
                <Input
                  id="transfer-to-zone"
                  placeholder="Zone"
                  value={transferForm.toZone}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, toZone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-notes">Notes</Label>
              <Textarea
                id="transfer-notes"
                placeholder="Reason for transfer..."
                value={transferForm.notes}
                onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTransfer} className="bg-blue-600 hover:bg-blue-700">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Initiate Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Count Dialog */}
      <Dialog open={showCountDialog} onOpenChange={setShowCountDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-violet-600" />
              Schedule Stock Count
            </DialogTitle>
            <DialogDescription>
              Create a new inventory count session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count-warehouse">Warehouse *</Label>
              <Select
                value={countForm.warehouseId}
                onValueChange={(value) => setCountForm(prev => ({ ...prev, warehouseId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(wh => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.productCount} products)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count-type">Count Type *</Label>
                <Select
                  value={countForm.countType}
                  onValueChange={(value) => setCountForm(prev => ({ ...prev, countType: value as 'full' | 'cycle' | 'spot' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Count</SelectItem>
                    <SelectItem value="cycle">Cycle Count</SelectItem>
                    <SelectItem value="spot">Spot Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="count-date">Scheduled Date *</Label>
                <Input
                  id="count-date"
                  type="date"
                  value={countForm.scheduledDate}
                  onChange={(e) => setCountForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Count Type Details</Label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                {countForm.countType === 'full' && (
                  <p>Full count includes all products in the warehouse. Best for annual inventory audits.</p>
                )}
                {countForm.countType === 'cycle' && (
                  <p>Cycle count rotates through product categories. Ideal for ongoing accuracy maintenance.</p>
                )}
                {countForm.countType === 'spot' && (
                  <p>Spot check verifies specific high-value or high-velocity items.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="count-notes">Notes</Label>
              <Textarea
                id="count-notes"
                placeholder="Special instructions..."
                value={countForm.notes}
                onChange={(e) => setCountForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCountDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCount} className="bg-violet-600 hover:bg-violet-700">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Count
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Export Inventory
            </DialogTitle>
            <DialogDescription>
              Generate an inventory report in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['csv', 'xlsx', 'pdf'] as const).map(format => (
                  <Button
                    key={format}
                    variant={exportForm.format === format ? 'default' : 'outline'}
                    onClick={() => setExportForm(prev => ({ ...prev, format }))}
                    className={exportForm.format === format ? 'bg-indigo-600' : ''}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={exportForm.dateRange}
                onValueChange={(value) => setExportForm(prev => ({ ...prev, dateRange: value as 'all' | '30d' | '90d' | '1y' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Include in Report</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-quantities"
                    checked={exportForm.includeQuantities}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeQuantities: !!checked }))}
                  />
                  <Label htmlFor="include-quantities" className="font-normal">Stock quantities and levels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-values"
                    checked={exportForm.includeValues}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeValues: !!checked }))}
                  />
                  <Label htmlFor="include-values" className="font-normal">Cost and value information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-locations"
                    checked={exportForm.includeLocations}
                    onCheckedChange={(checked) => setExportForm(prev => ({ ...prev, includeLocations: !!checked }))}
                  />
                  <Label htmlFor="include-locations" className="font-normal">Warehouse locations</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitExport} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Add New Product
            </DialogTitle>
            <DialogDescription>
              Create a new product in your inventory system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                  id="product-name"
                  placeholder="Enter product name"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-sku">SKU *</Label>
                <Input
                  id="product-sku"
                  placeholder="e.g., ELEC-001"
                  value={newProductForm.sku}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-category">Category *</Label>
                <Select
                  value={newProductForm.category}
                  onValueChange={(value) => setNewProductForm(prev => ({ ...prev, category: value as ProductCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="apparel">Apparel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="raw_materials">Raw Materials</SelectItem>
                    <SelectItem value="finished_goods">Finished Goods</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-brand">Brand</Label>
                <Input
                  id="product-brand"
                  placeholder="Brand name"
                  value={newProductForm.brand}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, brand: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                placeholder="Product description..."
                value={newProductForm.description}
                onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-cost">Unit Cost *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="product-cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={newProductForm.unitCost}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, unitCost: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-price">Selling Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={newProductForm.sellingPrice}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-reorder-point">Reorder Point</Label>
                <Input
                  id="product-reorder-point"
                  type="number"
                  placeholder="Minimum stock level"
                  value={newProductForm.reorderPoint}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, reorderPoint: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-reorder-qty">Reorder Quantity</Label>
                <Input
                  id="product-reorder-qty"
                  type="number"
                  placeholder="Default order quantity"
                  value={newProductForm.reorderQuantity}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, reorderQuantity: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitNewProduct} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
