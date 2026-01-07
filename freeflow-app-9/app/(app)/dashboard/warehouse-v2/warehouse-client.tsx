'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  Warehouse as WarehouseIcon,
  MapPin,
  TrendingUp,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Activity,
  Download,
  Plus,
  Settings,
  Box,
  Search,
  Eye,
  Edit,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Grid3X3,
  Move,
  Scan,
  RotateCcw,
  ClipboardList,
  Boxes,
  Timer,
  Zap,
  ThermometerSnowflake,
  Flame,
  AlertCircle,
  XCircle,
  RefreshCw,
  Hash,
  Shield,
  Sliders,
  Webhook,
  Database,
  Trash2,
  Printer,
  Mail,
  Upload,
  Terminal
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




import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

// Types
type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved' | 'damaged' | 'quarantine'
type ZoneType = 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping' | 'cold_storage' | 'hazmat' | 'returns'
type ShipmentStatus = 'pending' | 'in_transit' | 'receiving' | 'putaway' | 'completed' | 'cancelled'
type OrderStatus = 'pending' | 'allocated' | 'picking' | 'picked' | 'packing' | 'packed' | 'shipped' | 'cancelled'
type TaskType = 'putaway' | 'pick' | 'pack' | 'count' | 'replenish' | 'move' | 'receive' | 'ship'
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'

interface InventoryItem {
  id: string
  sku: string
  name: string
  description: string
  category: string
  quantity_on_hand: number
  quantity_available: number
  quantity_reserved: number
  quantity_incoming: number
  reorder_point: number
  reorder_quantity: number
  unit_cost: number
  bin_location: string
  zone: string
  lot_number: string
  expiry_date: string | null
  last_counted: string
  status: InventoryStatus
  weight_kg: number
  dimensions: { l: number; w: number; h: number }
  is_serialized: boolean
  requires_cold_storage: boolean
  is_hazmat: boolean
}

interface Zone {
  id: string
  name: string
  code: string
  type: ZoneType
  capacity_units: number
  used_units: number
  bin_count: number
  temperature_min: number | null
  temperature_max: number | null
  is_active: boolean
  last_activity: string
}

interface Bin {
  id: string
  code: string
  zone_id: string
  zone_name: string
  aisle: string
  rack: string
  level: string
  position: string
  capacity_units: number
  used_units: number
  item_count: number
  is_active: boolean
  bin_type: 'storage' | 'picking' | 'reserve' | 'staging'
}

interface InboundShipment {
  id: string
  shipment_number: string
  po_number: string
  supplier: string
  carrier: string
  tracking_number: string
  expected_date: string
  received_date: string | null
  status: ShipmentStatus
  total_items: number
  received_items: number
  total_units: number
  received_units: number
  dock_door: string | null
  assigned_to: string | null
}

interface OutboundOrder {
  id: string
  order_number: string
  customer: string
  priority: TaskPriority
  status: OrderStatus
  order_date: string
  ship_by_date: string
  shipped_date: string | null
  total_lines: number
  picked_lines: number
  total_units: number
  picked_units: number
  carrier: string
  tracking_number: string | null
  assigned_to: string | null
  wave_id: string | null
}

interface WarehouseTask {
  id: string
  task_number: string
  type: TaskType
  priority: TaskPriority
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  from_location: string
  to_location: string
  item_sku: string
  item_name: string
  quantity: number
  assigned_to: string | null
  assigned_to_avatar: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  estimated_minutes: number
}

interface CycleCount {
  id: string
  count_number: string
  zone: string
  bin_locations: string[]
  status: 'scheduled' | 'in_progress' | 'pending_review' | 'completed'
  scheduled_date: string
  completed_date: string | null
  total_bins: number
  counted_bins: number
  variance_items: number
  variance_value: number
  assigned_to: string
  accuracy_percent: number
}

// Mock data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'SKU-001',
    name: 'Industrial Bearing 6205',
    description: 'Deep groove ball bearing 25x52x15mm',
    category: 'Bearings',
    quantity_on_hand: 1250,
    quantity_available: 980,
    quantity_reserved: 270,
    quantity_incoming: 500,
    reorder_point: 300,
    reorder_quantity: 1000,
    unit_cost: 12.50,
    bin_location: 'A-01-03-02',
    zone: 'Zone A - Storage',
    lot_number: 'LOT-2024-001',
    expiry_date: null,
    last_counted: '2024-01-10',
    status: 'in_stock',
    weight_kg: 0.12,
    dimensions: { l: 52, w: 52, h: 15 },
    is_serialized: false,
    requires_cold_storage: false,
    is_hazmat: false
  },
  {
    id: '2',
    sku: 'SKU-002',
    name: 'Hydraulic Fluid AW46',
    description: 'Premium anti-wear hydraulic oil 5L',
    category: 'Lubricants',
    quantity_on_hand: 85,
    quantity_available: 85,
    quantity_reserved: 0,
    quantity_incoming: 200,
    reorder_point: 100,
    reorder_quantity: 200,
    unit_cost: 45.00,
    bin_location: 'C-02-01-01',
    zone: 'Zone C - Hazmat',
    lot_number: 'LOT-2024-015',
    expiry_date: '2026-06-15',
    last_counted: '2024-01-08',
    status: 'low_stock',
    weight_kg: 4.5,
    dimensions: { l: 200, w: 150, h: 250 },
    is_serialized: false,
    requires_cold_storage: false,
    is_hazmat: true
  },
  {
    id: '3',
    sku: 'SKU-003',
    name: 'Temperature Sensor PT100',
    description: 'RTD temperature sensor -50 to 500°C',
    category: 'Sensors',
    quantity_on_hand: 0,
    quantity_available: 0,
    quantity_reserved: 0,
    quantity_incoming: 150,
    reorder_point: 25,
    reorder_quantity: 100,
    unit_cost: 89.00,
    bin_location: 'B-03-02-04',
    zone: 'Zone B - Electronics',
    lot_number: '',
    expiry_date: null,
    last_counted: '2024-01-05',
    status: 'out_of_stock',
    weight_kg: 0.05,
    dimensions: { l: 100, w: 10, h: 10 },
    is_serialized: true,
    requires_cold_storage: false,
    is_hazmat: false
  },
  {
    id: '4',
    sku: 'SKU-004',
    name: 'Pharmaceutical Grade Enzyme',
    description: 'Industrial lipase enzyme 1kg',
    category: 'Chemicals',
    quantity_on_hand: 45,
    quantity_available: 30,
    quantity_reserved: 15,
    quantity_incoming: 0,
    reorder_point: 20,
    reorder_quantity: 50,
    unit_cost: 450.00,
    bin_location: 'D-01-01-01',
    zone: 'Zone D - Cold Storage',
    lot_number: 'LOT-2024-022',
    expiry_date: '2024-04-30',
    last_counted: '2024-01-12',
    status: 'in_stock',
    weight_kg: 1.0,
    dimensions: { l: 150, w: 150, h: 200 },
    is_serialized: false,
    requires_cold_storage: true,
    is_hazmat: false
  },
  {
    id: '5',
    sku: 'SKU-005',
    name: 'Stainless Steel Valve DN50',
    description: 'Ball valve 2" SS316 flanged',
    category: 'Valves',
    quantity_on_hand: 180,
    quantity_available: 120,
    quantity_reserved: 60,
    quantity_incoming: 0,
    reorder_point: 50,
    reorder_quantity: 100,
    unit_cost: 285.00,
    bin_location: 'A-05-02-03',
    zone: 'Zone A - Storage',
    lot_number: 'LOT-2023-089',
    expiry_date: null,
    last_counted: '2024-01-09',
    status: 'reserved',
    weight_kg: 3.2,
    dimensions: { l: 180, w: 130, h: 130 },
    is_serialized: false,
    requires_cold_storage: false,
    is_hazmat: false
  }
]

const mockZones: Zone[] = [
  { id: '1', name: 'Zone A - Storage', code: 'ZONE-A', type: 'storage', capacity_units: 10000, used_units: 7850, bin_count: 250, temperature_min: null, temperature_max: null, is_active: true, last_activity: '2024-01-15T14:30:00' },
  { id: '2', name: 'Zone B - Electronics', code: 'ZONE-B', type: 'storage', capacity_units: 3000, used_units: 2100, bin_count: 80, temperature_min: 15, temperature_max: 25, is_active: true, last_activity: '2024-01-15T14:25:00' },
  { id: '3', name: 'Zone C - Hazmat', code: 'ZONE-C', type: 'hazmat', capacity_units: 1500, used_units: 890, bin_count: 40, temperature_min: null, temperature_max: null, is_active: true, last_activity: '2024-01-15T13:45:00' },
  { id: '4', name: 'Zone D - Cold Storage', code: 'ZONE-D', type: 'cold_storage', capacity_units: 2000, used_units: 1450, bin_count: 60, temperature_min: 2, temperature_max: 8, is_active: true, last_activity: '2024-01-15T14:28:00' },
  { id: '5', name: 'Receiving Dock', code: 'RECV', type: 'receiving', capacity_units: 500, used_units: 120, bin_count: 10, temperature_min: null, temperature_max: null, is_active: true, last_activity: '2024-01-15T14:32:00' },
  { id: '6', name: 'Shipping Dock', code: 'SHIP', type: 'shipping', capacity_units: 500, used_units: 85, bin_count: 10, temperature_min: null, temperature_max: null, is_active: true, last_activity: '2024-01-15T14:20:00' },
  { id: '7', name: 'Pick Zone', code: 'PICK', type: 'picking', capacity_units: 1200, used_units: 980, bin_count: 150, temperature_min: null, temperature_max: null, is_active: true, last_activity: '2024-01-15T14:31:00' },
  { id: '8', name: 'Pack Station', code: 'PACK', type: 'packing', capacity_units: 200, used_units: 45, bin_count: 20, temperature_min: null, temperature_max: null, is_active: true, last_activity: '2024-01-15T14:29:00' }
]

const mockInboundShipments: InboundShipment[] = [
  { id: '1', shipment_number: 'INB-2024-001', po_number: 'PO-5001', supplier: 'Industrial Supplies Co', carrier: 'FedEx Freight', tracking_number: '794644790132', expected_date: '2024-01-16', received_date: null, status: 'in_transit', total_items: 15, received_items: 0, total_units: 2500, received_units: 0, dock_door: null, assigned_to: null },
  { id: '2', shipment_number: 'INB-2024-002', po_number: 'PO-5002', supplier: 'Tech Components Ltd', carrier: 'UPS Freight', tracking_number: '1Z999AA10123456784', expected_date: '2024-01-15', received_date: null, status: 'receiving', total_items: 8, received_items: 5, total_units: 150, received_units: 95, dock_door: 'Dock 3', assigned_to: 'Mike Johnson' },
  { id: '3', shipment_number: 'INB-2024-003', po_number: 'PO-4998', supplier: 'Chemical Solutions Inc', carrier: 'Hazmat Express', tracking_number: 'HM789456123', expected_date: '2024-01-15', received_date: '2024-01-15', status: 'putaway', total_items: 4, received_items: 4, total_units: 200, received_units: 200, dock_door: 'Dock 1', assigned_to: 'Sarah Williams' },
  { id: '4', shipment_number: 'INB-2024-004', po_number: 'PO-5003', supplier: 'Bearing World', carrier: 'XPO Logistics', tracking_number: 'XPO456789012', expected_date: '2024-01-17', received_date: null, status: 'pending', total_items: 12, received_items: 0, total_units: 5000, received_units: 0, dock_door: null, assigned_to: null }
]

const mockOutboundOrders: OutboundOrder[] = [
  { id: '1', order_number: 'ORD-2024-1001', customer: 'Acme Manufacturing', priority: 'high', status: 'picking', order_date: '2024-01-14', ship_by_date: '2024-01-15', shipped_date: null, total_lines: 8, picked_lines: 5, total_units: 125, picked_units: 78, carrier: 'FedEx Ground', tracking_number: null, assigned_to: 'John Smith', wave_id: 'WAVE-001' },
  { id: '2', order_number: 'ORD-2024-1002', customer: 'Global Tech Corp', priority: 'urgent', status: 'packing', order_date: '2024-01-14', ship_by_date: '2024-01-15', shipped_date: null, total_lines: 3, picked_lines: 3, total_units: 45, picked_units: 45, carrier: 'FedEx Express', tracking_number: null, assigned_to: 'Emily Chen', wave_id: 'WAVE-001' },
  { id: '3', order_number: 'ORD-2024-1003', customer: 'Pacific Industries', priority: 'normal', status: 'allocated', order_date: '2024-01-15', ship_by_date: '2024-01-17', shipped_date: null, total_lines: 12, picked_lines: 0, total_units: 280, picked_units: 0, carrier: 'UPS Ground', tracking_number: null, assigned_to: null, wave_id: null },
  { id: '4', order_number: 'ORD-2024-1004', customer: 'Northern Electric', priority: 'low', status: 'pending', order_date: '2024-01-15', ship_by_date: '2024-01-20', shipped_date: null, total_lines: 5, picked_lines: 0, total_units: 60, picked_units: 0, carrier: 'UPS Ground', tracking_number: null, assigned_to: null, wave_id: null },
  { id: '5', order_number: 'ORD-2024-0998', customer: 'Summit Solutions', priority: 'normal', status: 'shipped', order_date: '2024-01-12', ship_by_date: '2024-01-14', shipped_date: '2024-01-14', total_lines: 6, picked_lines: 6, total_units: 150, picked_units: 150, carrier: 'FedEx Ground', tracking_number: '794644790145', assigned_to: 'John Smith', wave_id: 'WAVE-098' }
]

const mockTasks: WarehouseTask[] = [
  { id: '1', task_number: 'TSK-001', type: 'pick', priority: 'high', status: 'in_progress', from_location: 'A-01-03-02', to_location: 'PICK-CART-05', item_sku: 'SKU-001', item_name: 'Industrial Bearing 6205', quantity: 50, assigned_to: 'John Smith', assigned_to_avatar: null, created_at: '2024-01-15T14:00:00', started_at: '2024-01-15T14:15:00', completed_at: null, estimated_minutes: 15 },
  { id: '2', task_number: 'TSK-002', type: 'putaway', priority: 'normal', status: 'assigned', from_location: 'RECV-STAGE-01', to_location: 'C-02-01-01', item_sku: 'SKU-002', item_name: 'Hydraulic Fluid AW46', quantity: 100, assigned_to: 'Sarah Williams', assigned_to_avatar: null, created_at: '2024-01-15T13:30:00', started_at: null, completed_at: null, estimated_minutes: 20 },
  { id: '3', task_number: 'TSK-003', type: 'pack', priority: 'urgent', status: 'in_progress', from_location: 'PICK-CART-03', to_location: 'PACK-STN-02', item_sku: 'MULTI', item_name: 'Order ORD-2024-1002', quantity: 45, assigned_to: 'Emily Chen', assigned_to_avatar: null, created_at: '2024-01-15T14:20:00', started_at: '2024-01-15T14:25:00', completed_at: null, estimated_minutes: 25 },
  { id: '4', task_number: 'TSK-004', type: 'replenish', priority: 'normal', status: 'pending', from_location: 'A-05-02-03', to_location: 'PICK-A-15', item_sku: 'SKU-005', item_name: 'Stainless Steel Valve DN50', quantity: 20, assigned_to: null, assigned_to_avatar: null, created_at: '2024-01-15T14:30:00', started_at: null, completed_at: null, estimated_minutes: 10 },
  { id: '5', task_number: 'TSK-005', type: 'count', priority: 'low', status: 'pending', from_location: 'B-03-02-04', to_location: 'B-03-02-04', item_sku: 'SKU-003', item_name: 'Temperature Sensor PT100', quantity: 0, assigned_to: null, assigned_to_avatar: null, created_at: '2024-01-15T10:00:00', started_at: null, completed_at: null, estimated_minutes: 15 },
  { id: '6', task_number: 'TSK-006', type: 'receive', priority: 'high', status: 'in_progress', from_location: 'DOCK-03', to_location: 'RECV-STAGE-02', item_sku: 'MULTI', item_name: 'Shipment INB-2024-002', quantity: 150, assigned_to: 'Mike Johnson', assigned_to_avatar: null, created_at: '2024-01-15T12:00:00', started_at: '2024-01-15T13:00:00', completed_at: null, estimated_minutes: 45 }
]

const mockCycleCounts: CycleCount[] = [
  { id: '1', count_number: 'CC-2024-001', zone: 'Zone A - Storage', bin_locations: ['A-01-01-01', 'A-01-01-02', 'A-01-02-01'], status: 'in_progress', scheduled_date: '2024-01-15', completed_date: null, total_bins: 25, counted_bins: 18, variance_items: 2, variance_value: 125.50, assigned_to: 'Tom Wilson', accuracy_percent: 97.5 },
  { id: '2', count_number: 'CC-2024-002', zone: 'Zone B - Electronics', bin_locations: ['B-01-01-01'], status: 'scheduled', scheduled_date: '2024-01-16', completed_date: null, total_bins: 15, counted_bins: 0, variance_items: 0, variance_value: 0, assigned_to: 'Lisa Brown', accuracy_percent: 0 },
  { id: '3', count_number: 'CC-2023-089', zone: 'Zone D - Cold Storage', bin_locations: ['D-01-01-01', 'D-01-02-01'], status: 'completed', scheduled_date: '2024-01-10', completed_date: '2024-01-10', total_bins: 12, counted_bins: 12, variance_items: 0, variance_value: 0, assigned_to: 'Tom Wilson', accuracy_percent: 100 }
]

// Enhanced Competitive Upgrade Mock Data
const mockWarehouseAIInsights = [
  { id: '1', type: 'success' as const, title: 'Inventory Accuracy', description: 'Warehouse inventory accuracy is at 99.2% this month.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Low Stock Alert', description: '5 items are below reorder point in Zone A.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Alerts' },
  { id: '3', type: 'info' as const, title: 'Space Optimization', description: 'Moving slow-movers to back racks could free up 15% picking space.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockWarehouseCollaborators = [
  { id: '1', name: 'Warehouse Team', avatar: '', role: 'Team', status: 'online' as const },
  { id: '2', name: 'Tom Wilson', avatar: '', role: 'Supervisor', status: 'online' as const },
]

const mockWarehousePredictions = [
  { id: '1', title: 'Inbound Volume', prediction: 'Expected 25% increase next week', confidence: 82, trend: 'up' as const, timeframe: 'Next 7 days' },
  { id: '2', title: 'Space Utilization', prediction: 'Zone B approaching 90% capacity', confidence: 78, trend: 'up' as const, timeframe: 'Next 14 days' },
]

const mockWarehouseActivities = [
  { id: '1', user: 'System', action: 'Completed', target: '32 pick tasks today', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Tom', action: 'Received', target: 'shipment PO-2024-156', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
]

const mockWarehouseQuickActions = [
  { id: '1', label: 'Add Inventory', icon: 'plus', action: () => toast.success('Add Inventory', { description: 'Enter item details and quantity' }), variant: 'default' as const },
  { id: '2', label: 'Cycle Count', icon: 'clipboard', action: () => toast.success('Cycle Count Started', { description: '47 locations queued for verification' }), variant: 'outline' as const },
]

export default function WarehouseClient() {
  const [activeTab, setActiveTab] = useState('inventory')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OutboundOrder | null>(null)
  const [selectedShipment, setSelectedShipment] = useState<InboundShipment | null>(null)
  const [inventoryFilter, setInventoryFilter] = useState<InventoryStatus | 'all'>('all')
  const [zoneFilter, setZoneFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats calculations
  const stats = useMemo(() => {
    const totalItems = mockInventory.length
    const lowStockItems = mockInventory.filter(i => i.status === 'low_stock').length
    const outOfStockItems = mockInventory.filter(i => i.status === 'out_of_stock').length
    const totalValue = mockInventory.reduce((sum, i) => sum + (i.quantity_on_hand * i.unit_cost), 0)
    const pendingInbound = mockInboundShipments.filter(s => s.status !== 'completed').length
    const pendingOutbound = mockOutboundOrders.filter(o => o.status !== 'shipped').length
    const activeTasks = mockTasks.filter(t => t.status === 'in_progress').length
    const pendingTasks = mockTasks.filter(t => t.status === 'pending').length
    const avgZoneUtilization = mockZones.reduce((sum, z) => sum + (z.used_units / z.capacity_units * 100), 0) / mockZones.length

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      pendingInbound,
      pendingOutbound,
      activeTasks,
      pendingTasks,
      avgZoneUtilization: avgZoneUtilization.toFixed(1)
    }
  }, [])

  // Filter functions
  const filteredInventory = useMemo(() => {
    return mockInventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bin_location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = inventoryFilter === 'all' || item.status === inventoryFilter
      const matchesZone = zoneFilter === 'all' || item.zone === zoneFilter
      return matchesSearch && matchesStatus && matchesZone
    })
  }, [searchQuery, inventoryFilter, zoneFilter])

  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      const matchesSearch = task.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.task_number.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      return matchesSearch && matchesPriority
    })
  }, [searchQuery, priorityFilter])

  // Helper functions
  const getInventoryStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'in_stock': return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'In Stock', icon: CheckCircle2 }
      case 'low_stock': return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Low Stock', icon: AlertTriangle }
      case 'out_of_stock': return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Out of Stock', icon: XCircle }
      case 'reserved': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Reserved', icon: Package }
      case 'damaged': return { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Damaged', icon: AlertCircle }
      case 'quarantine': return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Quarantine', icon: AlertTriangle }
      default: return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: status, icon: Package }
    }
  }

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Pending' }
      case 'allocated': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Allocated' }
      case 'picking': return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Picking' }
      case 'picked': return { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Picked' }
      case 'packing': return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Packing' }
      case 'packed': return { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400', label: 'Packed' }
      case 'shipped': return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Shipped' }
      case 'cancelled': return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' }
      default: return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: status }
    }
  }

  const getShipmentStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending': return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Pending' }
      case 'in_transit': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Transit' }
      case 'receiving': return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Receiving' }
      case 'putaway': return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Putaway' }
      case 'completed': return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Completed' }
      case 'cancelled': return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' }
      default: return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: status }
    }
  }

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Urgent' }
      case 'high': return { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' }
      case 'normal': return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Normal' }
      case 'low': return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Low' }
      default: return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: priority }
    }
  }

  const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'pick': return Package
      case 'putaway': return ArrowDownLeft
      case 'pack': return Boxes
      case 'count': return ClipboardList
      case 'replenish': return RefreshCw
      case 'move': return Move
      case 'receive': return ArrowDownLeft
      case 'ship': return ArrowUpRight
      default: return Package
    }
  }

  const getZoneTypeIcon = (type: ZoneType) => {
    switch (type) {
      case 'receiving': return ArrowDownLeft
      case 'storage': return Boxes
      case 'picking': return Package
      case 'packing': return Box
      case 'shipping': return ArrowUpRight
      case 'cold_storage': return ThermometerSnowflake
      case 'hazmat': return Flame
      case 'returns': return RotateCcw
      default: return WarehouseIcon
    }
  }

  // Handlers
  const handleCreateShipment = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 600)),
      {
        loading: 'Opening shipment form...',
        success: 'Create Shipment form ready',
        error: 'Failed to open shipment form'
      }
    )
  }

  const handleReceiveInventory = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 600)),
      {
        loading: 'Opening receiving form...',
        success: 'Receive Inventory form ready',
        error: 'Failed to open receiving form'
      }
    )
  }

  const handleStartInventoryCount = () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 600)),
      {
        loading: 'Starting inventory count...',
        success: 'Inventory count started - Count session is now active',
        error: 'Failed to start inventory count'
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
              <WarehouseIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Warehouse Management</h1>
              <p className="text-gray-600 dark:text-gray-400">SAP-level WMS • Inventory, Operations & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Scan className="w-4 h-4" />
              Scan Mode
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SKUs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockItems}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${(stats.totalValue / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inventory Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgZoneUtilization}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingInbound}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inbound</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOutbound}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Outbound</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTasks}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="inbound" className="gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              Inbound
            </TabsTrigger>
            <TabsTrigger value="outbound" className="gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Outbound
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="zones" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
              Zones & Bins
            </TabsTrigger>
            <TabsTrigger value="counts" className="gap-2">
              <Scan className="w-4 h-4" />
              Cycle Counts
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Inventory Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Inventory Management</h2>
                    <p className="text-white/90 max-w-2xl">
                      Track stock levels, manage bin locations, and optimize your warehouse inventory in real-time.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalItems}</div>
                      <div className="text-sm text-white/80">Total SKUs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-white/80">Total Value</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Plus, label: 'Add Item', color: 'text-green-500' },
                { icon: Search, label: 'Find SKU', color: 'text-blue-500' },
                { icon: Move, label: 'Transfer', color: 'text-purple-500' },
                { icon: ClipboardList, label: 'Cycle Count', color: 'text-orange-500' },
                { icon: AlertTriangle, label: 'Low Stock', color: 'text-yellow-500' },
                { icon: RefreshCw, label: 'Replenish', color: 'text-cyan-500' },
                { icon: Download, label: 'Export', color: 'text-indigo-500' },
                { icon: Upload, label: 'Import', color: 'text-gray-500' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50">
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by SKU, name, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={inventoryFilter}
                      onChange={(e) => setInventoryFilter(e.target.value as InventoryStatus | 'all')}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="reserved">Reserved</option>
                    </select>
                    <select
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Zones</option>
                      {mockZones.map(zone => (
                        <option key={zone.id} value={zone.name}>{zone.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">SKU</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Item</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Location</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">On Hand</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Available</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Reserved</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Flags</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => {
                        const statusBadge = getInventoryStatusBadge(item.status)
                        const StatusIcon = statusBadge.icon
                        return (
                          <tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-4">
                              <span className="font-mono text-sm text-gray-900 dark:text-white">{item.sku}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="font-mono text-sm">{item.bin_location}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                              {item.quantity_on_hand.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">
                              {item.quantity_available.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                              {item.quantity_reserved.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${statusBadge.color} gap-1`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusBadge.label}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center gap-1">
                                {item.requires_cold_storage && (
                                  <ThermometerSnowflake className="w-4 h-4 text-blue-500" title="Cold Storage" />
                                )}
                                {item.is_hazmat && (
                                  <Flame className="w-4 h-4 text-orange-500" title="Hazmat" />
                                )}
                                {item.is_serialized && (
                                  <Hash className="w-4 h-4 text-purple-500" title="Serialized" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inbound Tab */}
          <TabsContent value="inbound" className="space-y-6">
            {/* Inbound Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Inbound Shipments</h2>
                    <p className="text-white/90 max-w-2xl">
                      Manage incoming shipments, receiving processes, and putaway operations for seamless inventory flow.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.pendingInbound}</div>
                      <div className="text-sm text-white/80">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockInboundShipments.filter(s => s.status === 'receiving').length}</div>
                      <div className="text-sm text-white/80">Receiving</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {mockInboundShipments.map((shipment) => {
                const statusBadge = getShipmentStatusBadge(shipment.status)
                const progress = (shipment.received_units / shipment.total_units) * 100
                return (
                  <Card key={shipment.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{shipment.shipment_number}</h3>
                              <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{shipment.supplier}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">PO: {shipment.po_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Expected</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shipment.expected_date}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Carrier</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shipment.carrier}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Tracking</p>
                          <p className="font-mono text-sm text-cyan-600 dark:text-cyan-400">{shipment.tracking_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Dock Door</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shipment.dock_door || 'Not Assigned'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                          <p className="font-medium text-gray-900 dark:text-white">{shipment.assigned_to || 'Unassigned'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Receiving Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {shipment.received_units.toLocaleString()} / {shipment.total_units.toLocaleString()} units
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{shipment.received_items} of {shipment.total_items} items received</span>
                          <span>{progress.toFixed(0)}% complete</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" size="sm" onClick={() => setSelectedShipment(shipment)}>
                          View Details
                        </Button>
                        {shipment.status === 'in_transit' && (
                          <Button size="sm" className="gap-2">
                            <ArrowDownLeft className="w-4 h-4" />
                            Start Receiving
                          </Button>
                        )}
                        {shipment.status === 'receiving' && (
                          <Button size="sm" className="gap-2">
                            <Scan className="w-4 h-4" />
                            Continue Receiving
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Outbound Tab */}
          <TabsContent value="outbound" className="space-y-6">
            {/* Outbound Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Outbound Orders</h2>
                    <p className="text-white/90 max-w-2xl">
                      Manage order fulfillment, picking, packing, and shipping operations with real-time tracking.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.pendingOutbound}</div>
                      <div className="text-sm text-white/80">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockOutboundOrders.filter(o => o.priority === 'urgent').length}</div>
                      <div className="text-sm text-white/80">Urgent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {mockOutboundOrders.map((order) => {
                const statusBadge = getOrderStatusBadge(order.status)
                const priorityBadge = getPriorityBadge(order.priority)
                const progress = (order.picked_units / order.total_units) * 100
                return (
                  <Card key={order.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white">
                            <Package className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{order.order_number}</h3>
                              <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                              <Badge className={priorityBadge.color}>{priorityBadge.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer}</p>
                            {order.wave_id && (
                              <p className="text-xs text-gray-400 dark:text-gray-500">Wave: {order.wave_id}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Ship By</p>
                          <p className={`font-medium ${new Date(order.ship_by_date) <= new Date() ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {order.ship_by_date}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Carrier</p>
                          <p className="font-medium text-gray-900 dark:text-white">{order.carrier}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lines</p>
                          <p className="font-medium text-gray-900 dark:text-white">{order.picked_lines} / {order.total_lines}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Units</p>
                          <p className="font-medium text-gray-900 dark:text-white">{order.picked_units} / {order.total_units}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To</p>
                          <p className="font-medium text-gray-900 dark:text-white">{order.assigned_to || 'Unassigned'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Pick Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          View Details
                        </Button>
                        {order.status === 'allocated' && (
                          <Button size="sm" className="gap-2">
                            <Package className="w-4 h-4" />
                            Start Picking
                          </Button>
                        )}
                        {order.status === 'picked' && (
                          <Button size="sm" className="gap-2">
                            <Box className="w-4 h-4" />
                            Start Packing
                          </Button>
                        )}
                        {order.status === 'packed' && (
                          <Button size="sm" className="gap-2">
                            <Truck className="w-4 h-4" />
                            Ship Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Tasks Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Warehouse Tasks</h2>
                    <p className="text-white/90 max-w-2xl">
                      Assign, track, and complete warehouse tasks including picks, putaways, replenishments, and cycle counts.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.activeTasks}</div>
                      <div className="text-sm text-white/80">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.pendingTasks}</div>
                      <div className="text-sm text-white/80">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Warehouse Tasks</CardTitle>
                  <div className="flex gap-2">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                      className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const priorityBadge = getPriorityBadge(task.priority)
                    const TaskIcon = getTaskTypeIcon(task.type)
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            task.status === 'in_progress' ? 'bg-green-100 dark:bg-green-900/30' :
                            task.status === 'assigned' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <TaskIcon className={`w-5 h-5 ${
                              task.status === 'in_progress' ? 'text-green-600 dark:text-green-400' :
                              task.status === 'assigned' ? 'text-blue-600 dark:text-blue-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-gray-500">{task.task_number}</span>
                              <Badge className={priorityBadge.color}>{priorityBadge.label}</Badge>
                              <Badge variant="outline" className="capitalize">{task.type}</Badge>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">{task.item_name}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {task.from_location} → {task.to_location}
                              </span>
                              <span>Qty: {task.quantity}</span>
                              <span className="flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                Est. {task.estimated_minutes} min
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {task.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>{task.assigned_to.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{task.assigned_to}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                          <div className="flex gap-1">
                            {task.status === 'pending' && (
                              <Button size="sm" className="gap-1">
                                <Zap className="w-3 h-3" />
                                Assign
                              </Button>
                            )}
                            {task.status === 'assigned' && (
                              <Button size="sm" variant="outline" className="gap-1">
                                <Activity className="w-3 h-3" />
                                Start
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="w-3 h-3" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zones Tab */}
          <TabsContent value="zones" className="space-y-6">
            {/* Zones Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Zones & Bin Locations</h2>
                    <p className="text-white/90 max-w-2xl">
                      Configure warehouse zones, manage bin locations, and optimize storage layout for maximum efficiency.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockZones.length}</div>
                      <div className="text-sm text-white/80">Zones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.avgZoneUtilization}%</div>
                      <div className="text-sm text-white/80">Avg Utilization</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockZones.map((zone) => {
                const ZoneIcon = getZoneTypeIcon(zone.type)
                const utilization = (zone.used_units / zone.capacity_units) * 100
                return (
                  <Card key={zone.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            zone.type === 'cold_storage' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            zone.type === 'hazmat' ? 'bg-orange-100 dark:bg-orange-900/30' :
                            zone.type === 'receiving' ? 'bg-cyan-100 dark:bg-cyan-900/30' :
                            zone.type === 'shipping' ? 'bg-green-100 dark:bg-green-900/30' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <ZoneIcon className={`w-6 h-6 ${
                              zone.type === 'cold_storage' ? 'text-blue-600 dark:text-blue-400' :
                              zone.type === 'hazmat' ? 'text-orange-600 dark:text-orange-400' :
                              zone.type === 'receiving' ? 'text-cyan-600 dark:text-cyan-400' :
                              zone.type === 'shipping' ? 'text-green-600 dark:text-green-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{zone.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{zone.code}</p>
                          </div>
                        </div>
                        <Badge className={zone.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800'}>
                          {zone.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Capacity Utilization</span>
                            <span className="font-medium text-gray-900 dark:text-white">{utilization.toFixed(1)}%</span>
                          </div>
                          <Progress value={utilization} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Capacity</p>
                            <p className="font-medium text-gray-900 dark:text-white">{zone.capacity_units.toLocaleString()} units</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Bins</p>
                            <p className="font-medium text-gray-900 dark:text-white">{zone.bin_count}</p>
                          </div>
                          {zone.temperature_min !== null && (
                            <>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Temp Range</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {zone.temperature_min}°C - {zone.temperature_max}°C
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end mt-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Bins
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Cycle Counts Tab */}
          <TabsContent value="counts" className="space-y-6">
            {/* Cycle Counts Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Cycle Counts</h2>
                    <p className="text-white/90 max-w-2xl">
                      Schedule and perform cycle counts to maintain inventory accuracy and identify discrepancies.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockCycleCounts.filter(c => c.status === 'in_progress').length}</div>
                      <div className="text-sm text-white/80">In Progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockCycleCounts.filter(c => c.status === 'scheduled').length}</div>
                      <div className="text-sm text-white/80">Scheduled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {mockCycleCounts.map((count) => {
                const progress = (count.counted_bins / count.total_bins) * 100
                return (
                  <Card key={count.id} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                            <ClipboardList className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{count.count_number}</h3>
                              <Badge className={
                                count.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                count.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                count.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }>
                                {count.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{count.zone}</p>
                            <p className="text-xs text-gray-400">Assigned to: {count.assigned_to}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
                          <p className="font-medium text-gray-900 dark:text-white">{count.scheduled_date}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Bins Counted</p>
                          <p className="font-medium text-gray-900 dark:text-white">{count.counted_bins} / {count.total_bins}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Variances</p>
                          <p className={`font-medium ${count.variance_items > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {count.variance_items} items
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Variance Value</p>
                          <p className={`font-medium ${count.variance_value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${count.variance_value.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                          <p className={`font-medium ${count.accuracy_percent >= 98 ? 'text-green-600' : count.accuracy_percent >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {count.accuracy_percent}%
                          </p>
                        </div>
                      </div>

                      {count.status !== 'completed' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Count Progress</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex justify-end gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" size="sm">View Details</Button>
                        {count.status === 'scheduled' && (
                          <Button size="sm" className="gap-2">
                            <Scan className="w-4 h-4" />
                            Start Count
                          </Button>
                        )}
                        {count.status === 'in_progress' && (
                          <Button size="sm" className="gap-2">
                            <Scan className="w-4 h-4" />
                            Continue
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'inventory', label: 'Inventory', icon: Package },
                        { id: 'operations', label: 'Operations', icon: ClipboardList },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-cyan-500" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure basic warehouse management settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Warehouse Name</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display name for this warehouse</p>
                          </div>
                          <Input defaultValue="Main Distribution Center" className="w-64" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Time Zone</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Operating time zone for scheduling</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>America/New_York (EST)</option>
                            <option>America/Los_Angeles (PST)</option>
                            <option>Europe/London (GMT)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Auto-Refresh Dashboard</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically update stats and tasks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Unit System</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Measurement units for weights and dimensions</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>Metric (kg, cm)</option>
                            <option>Imperial (lb, in)</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Default Barcode Format</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Standard barcode format for scanning</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>Code 128</option>
                            <option>Code 39</option>
                            <option>QR Code</option>
                            <option>EAN-13</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'inventory' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Inventory Settings
                      </CardTitle>
                      <CardDescription>Configure inventory management rules and thresholds</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Low Stock Alert Threshold</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Percentage below reorder point to trigger alerts</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="number" defaultValue="20" className="w-20" />
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Auto-Reorder</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically create POs when stock is low</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">FIFO Enforcement</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enforce first-in-first-out picking</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Lot Tracking</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Track items by lot/batch number</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Serial Number Tracking</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Track individual item serial numbers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Expiry Date Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Days before expiry to alert</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="number" defaultValue="30" className="w-20" />
                            <span className="text-gray-500">days</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'operations' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-purple-500" />
                        Operations Settings
                      </CardTitle>
                      <CardDescription>Configure task management and workflow settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Auto Task Assignment</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically assign tasks to available workers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Wave Planning</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable wave-based order processing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Pick Path Optimization</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Optimize pick routes for efficiency</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Cycle Count Frequency</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How often to schedule cycle counts</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                            <option>Quarterly</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Task Priority Rules</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default priority escalation rules</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-green-500" />
                        Integrations
                      </CardTitle>
                      <CardDescription>Connect external systems and configure API access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        {[
                          { name: 'ERP System', icon: Database, status: 'Connected', color: 'green' },
                          { name: 'Shipping Carriers', icon: Truck, status: 'Connected', color: 'green' },
                          { name: 'Barcode Scanners', icon: Scan, status: 'Active', color: 'green' },
                          { name: 'Label Printers', icon: Printer, status: '2 Connected', color: 'green' },
                          { name: 'Email Notifications', icon: Mail, status: 'Configured', color: 'green' },
                          { name: 'Webhook Events', icon: Webhook, status: '5 Active', color: 'blue' }
                        ].map((integration, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <integration.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <Badge className={`bg-${integration.color}-100 text-${integration.color}-800 dark:bg-${integration.color}-900/30 dark:text-${integration.color}-400`}>
                                  {integration.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border rounded-lg dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium">API Access</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">REST API for external integrations</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input value="wms_api_key_••••••••••••••••" readOnly className="flex-1 font-mono text-sm" />
                          <Button variant="outline" size="sm">Regenerate</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'security' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Manage access controls and security policies</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Session Timeout</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Auto-logout after inactivity</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input type="number" defaultValue="30" className="w-20" />
                            <span className="text-gray-500">minutes</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">IP Whitelist</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Restrict access to specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all user actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Failed Login Lockout</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Attempts before account lockout</p>
                          </div>
                          <Input type="number" defaultValue="5" className="w-20" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-cyan-600 to-teal-600">Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-gray-500" />
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>System configuration and maintenance options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Debug Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable verbose logging for troubleshooting</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Data Retention</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep historical data</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>1 Year</option>
                            <option>2 Years</option>
                            <option>5 Years</option>
                            <option>Forever</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Database Maintenance</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last optimized: 2 days ago</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Optimize Now
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Export Configuration</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Backup all warehouse settings</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Import Configuration</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Restore settings from backup</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Import
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Purge Old Data
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset to Defaults
                          </Button>
                        </div>
                      </div>
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
              insights={mockWarehouseAIInsights}
              title="Warehouse Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockWarehouseCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockWarehousePredictions}
              title="Warehouse Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockWarehouseActivities}
            title="Warehouse Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockWarehouseQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Inventory Item Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedItem.name}</h3>
                  <p className="text-gray-500">{selectedItem.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{selectedItem.sku}</Badge>
                    <Badge variant="outline">{selectedItem.category}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">On Hand</p>
                  <p className="text-2xl font-bold">{selectedItem.quantity_on_hand}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="text-2xl font-bold text-green-600">{selectedItem.quantity_available}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500">Reserved</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedItem.quantity_reserved}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-xs text-gray-500">Incoming</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedItem.quantity_incoming}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedItem.bin_location}</p>
                  <p className="text-xs text-gray-400">{selectedItem.zone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Cost</p>
                  <p className="font-medium">${selectedItem.unit_cost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reorder Point</p>
                  <p className="font-medium">{selectedItem.reorder_point} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Counted</p>
                  <p className="font-medium">{selectedItem.last_counted}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="gap-2">
                  <Move className="w-4 h-4" />
                  Transfer
                </Button>
                <Button variant="outline" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Count
                </Button>
                <Button className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Item
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
