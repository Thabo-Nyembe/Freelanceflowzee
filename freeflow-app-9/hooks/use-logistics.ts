'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type WarehouseStatus = 'active' | 'inactive' | 'maintenance'
export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled'

export interface Warehouse {
  id: string
  name: string
  code: string
  type: 'distribution' | 'fulfillment' | 'return' | 'overflow'
  status: WarehouseStatus
  address: WarehouseAddress
  contact: WarehouseContact
  capacity: WarehouseCapacity
  operatingHours: OperatingHours
  zones: WarehouseZone[]
  stats: WarehouseStats
  createdAt: string
  updatedAt: string
}

export interface WarehouseAddress {
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  coordinates?: { lat: number; lng: number }
}

export interface WarehouseContact {
  name: string
  email: string
  phone: string
}

export interface WarehouseCapacity {
  totalLocations: number
  usedLocations: number
  totalPallets: number
  usedPallets: number
  totalSqFt: number
}

export interface OperatingHours {
  monday: { open: string; close: string } | null
  tuesday: { open: string; close: string } | null
  wednesday: { open: string; close: string } | null
  thursday: { open: string; close: string } | null
  friday: { open: string; close: string } | null
  saturday: { open: string; close: string } | null
  sunday: { open: string; close: string } | null
}

export interface WarehouseZone {
  id: string
  name: string
  type: 'picking' | 'bulk' | 'cold' | 'hazmat' | 'returns'
  locations: number
  usedLocations: number
}

export interface WarehouseStats {
  ordersProcessed: number
  itemsPicked: number
  accuracyRate: number
  avgFulfillmentTime: number
}

export interface InventoryTransfer {
  id: string
  transferNumber: string
  fromWarehouseId: string
  fromWarehouseName: string
  toWarehouseId: string
  toWarehouseName: string
  status: TransferStatus
  items: TransferItem[]
  totalQuantity: number
  totalValue: number
  notes?: string
  requestedBy: string
  requestedByName: string
  approvedBy?: string
  approvedByName?: string
  shippedAt?: string
  receivedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TransferItem {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  receivedQuantity?: number
  unitCost: number
}

export interface Supplier {
  id: string
  name: string
  code: string
  contactName: string
  email: string
  phone: string
  address: WarehouseAddress
  paymentTerms: string
  leadTime: number
  minOrderValue?: number
  rating: number
  status: 'active' | 'inactive' | 'blocked'
  products: SupplierProduct[]
  orders: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface SupplierProduct {
  productId: string
  productName: string
  sku: string
  supplierSku?: string
  cost: number
  moq: number
  leadTime: number
}

export interface Route {
  id: string
  name: string
  description?: string
  warehouseId: string
  warehouseName: string
  stops: RouteStop[]
  totalDistance: number
  estimatedTime: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  driver?: { id: string; name: string }
  vehicle?: { id: string; name: string; plate: string }
  scheduledDate: string
  startedAt?: string
  completedAt?: string
}

export interface RouteStop {
  id: string
  sequence: number
  type: 'delivery' | 'pickup' | 'return'
  orderId?: string
  address: WarehouseAddress
  customerName: string
  estimatedArrival: string
  actualArrival?: string
  status: 'pending' | 'arrived' | 'completed' | 'skipped'
  notes?: string
}

export interface LogisticsStats {
  totalWarehouses: number
  activeWarehouses: number
  totalCapacity: number
  usedCapacity: number
  pendingTransfers: number
  activeSuppliers: number
  plannedRoutes: number
  ordersToday: number
  deliveriesToday: number
  avgDeliveryTime: number
  capacityByWarehouse: { id: string; name: string; used: number; total: number }[]
  transferTrend: { date: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Main Distribution Center',
    code: 'DC-001',
    type: 'distribution',
    status: 'active',
    address: { street1: '1000 Logistics Blvd', city: 'Dallas', state: 'TX', postalCode: '75001', country: 'US', coordinates: { lat: 32.7767, lng: -96.7970 } },
    contact: { name: 'Mike Johnson', email: 'mike@warehouse.com', phone: '555-0100' },
    capacity: { totalLocations: 5000, usedLocations: 3850, totalPallets: 2000, usedPallets: 1650, totalSqFt: 150000 },
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: null
    },
    zones: [
      { id: 'zone-1', name: 'Zone A - Picking', type: 'picking', locations: 2000, usedLocations: 1800 },
      { id: 'zone-2', name: 'Zone B - Bulk', type: 'bulk', locations: 2500, usedLocations: 1800 },
      { id: 'zone-3', name: 'Zone C - Cold Storage', type: 'cold', locations: 500, usedLocations: 250 }
    ],
    stats: { ordersProcessed: 15420, itemsPicked: 89500, accuracyRate: 99.2, avgFulfillmentTime: 2.5 },
    createdAt: '2023-01-15',
    updatedAt: '2024-03-20'
  },
  {
    id: 'wh-2',
    name: 'East Coast Fulfillment',
    code: 'FC-002',
    type: 'fulfillment',
    status: 'active',
    address: { street1: '500 Harbor Way', city: 'Newark', state: 'NJ', postalCode: '07102', country: 'US', coordinates: { lat: 40.7357, lng: -74.1724 } },
    contact: { name: 'Sarah Lee', email: 'sarah@warehouse.com', phone: '555-0200' },
    capacity: { totalLocations: 3000, usedLocations: 2100, totalPallets: 1200, usedPallets: 950, totalSqFt: 85000 },
    operatingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '09:00', close: '17:00' },
      sunday: null
    },
    zones: [
      { id: 'zone-4', name: 'Pick Zone', type: 'picking', locations: 2000, usedLocations: 1600 },
      { id: 'zone-5', name: 'Returns', type: 'returns', locations: 1000, usedLocations: 500 }
    ],
    stats: { ordersProcessed: 12800, itemsPicked: 68200, accuracyRate: 99.5, avgFulfillmentTime: 1.8 },
    createdAt: '2023-06-01',
    updatedAt: '2024-03-20'
  }
]

const mockTransfers: InventoryTransfer[] = [
  {
    id: 'trans-1',
    transferNumber: 'TRF-2024-001',
    fromWarehouseId: 'wh-1',
    fromWarehouseName: 'Main Distribution Center',
    toWarehouseId: 'wh-2',
    toWarehouseName: 'East Coast Fulfillment',
    status: 'in_transit',
    items: [
      { id: 'ti-1', productId: 'prod-1', productName: 'Premium Widget', sku: 'WDG-001', quantity: 500, unitCost: 15.00 },
      { id: 'ti-2', productId: 'prod-2', productName: 'Standard Gadget', sku: 'GDG-002', quantity: 300, unitCost: 8.50 }
    ],
    totalQuantity: 800,
    totalValue: 10050,
    requestedBy: 'user-1',
    requestedByName: 'Alex Chen',
    approvedBy: 'user-2',
    approvedByName: 'Manager',
    shippedAt: '2024-03-19T10:00:00Z',
    createdAt: '2024-03-18T14:00:00Z',
    updatedAt: '2024-03-19T10:00:00Z'
  }
]

const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Global Parts Co',
    code: 'GPC-001',
    contactName: 'David Wang',
    email: 'david@globalparts.com',
    phone: '555-3000',
    address: { street1: '888 Industrial Park', city: 'Shenzhen', state: 'GD', postalCode: '518000', country: 'CN' },
    paymentTerms: 'Net 30',
    leadTime: 21,
    minOrderValue: 5000,
    rating: 4.8,
    status: 'active',
    products: [
      { productId: 'prod-1', productName: 'Premium Widget', sku: 'WDG-001', supplierSku: 'GP-WDG-A1', cost: 12.00, moq: 100, leadTime: 21 }
    ],
    orders: 45,
    totalSpent: 125000,
    createdAt: '2022-03-15',
    updatedAt: '2024-03-01'
  }
]

const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Downtown Delivery Route',
    warehouseId: 'wh-2',
    warehouseName: 'East Coast Fulfillment',
    stops: [
      { id: 'stop-1', sequence: 1, type: 'delivery', orderId: 'order-1', address: { street1: '100 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'US' }, customerName: 'John Smith', estimatedArrival: '2024-03-21T09:00:00Z', status: 'pending' },
      { id: 'stop-2', sequence: 2, type: 'delivery', orderId: 'order-2', address: { street1: '200 Broadway', city: 'New York', state: 'NY', postalCode: '10002', country: 'US' }, customerName: 'Jane Doe', estimatedArrival: '2024-03-21T10:00:00Z', status: 'pending' }
    ],
    totalDistance: 25.5,
    estimatedTime: 120,
    status: 'planned',
    driver: { id: 'driver-1', name: 'Tom Wilson' },
    vehicle: { id: 'vehicle-1', name: 'Delivery Van #3', plate: 'ABC-1234' },
    scheduledDate: '2024-03-21'
  }
]

const mockStats: LogisticsStats = {
  totalWarehouses: 5,
  activeWarehouses: 4,
  totalCapacity: 15000,
  usedCapacity: 11200,
  pendingTransfers: 8,
  activeSuppliers: 25,
  plannedRoutes: 12,
  ordersToday: 450,
  deliveriesToday: 380,
  avgDeliveryTime: 2.3,
  capacityByWarehouse: [
    { id: 'wh-1', name: 'Main DC', used: 77, total: 100 },
    { id: 'wh-2', name: 'East Coast', used: 70, total: 100 }
  ],
  transferTrend: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    count: 5 + Math.floor(Math.random() * 5)
  }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseLogisticsOptions {
  
}

export function useLogistics(options: UseLogisticsOptions = {}) {
  const {  } = options

  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null)
  const [stats, setStats] = useState<LogisticsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLogistics = useCallback(async () => {
    }, [])

  const updateWarehouse = useCallback(async (warehouseId: string, updates: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => w.id === warehouseId ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w))
    return { success: true }
  }, [])

  // Transfer operations
  const createTransfer = useCallback(async (data: Partial<InventoryTransfer>) => {
    const transfer: InventoryTransfer = {
      id: `trans-${Date.now()}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`,
      fromWarehouseId: data.fromWarehouseId || '',
      fromWarehouseName: data.fromWarehouseName || '',
      toWarehouseId: data.toWarehouseId || '',
      toWarehouseName: data.toWarehouseName || '',
      status: 'pending',
      items: data.items || [],
      totalQuantity: data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
      totalValue: data.items?.reduce((sum, i) => sum + i.quantity * i.unitCost, 0) || 0,
      requestedBy: 'user-1',
      requestedByName: 'You',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as InventoryTransfer
    setTransfers(prev => [transfer, ...prev])
    return { success: true, transfer }
  }, [transfers.length])

  const approveTransfer = useCallback(async (transferId: string) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? {
      ...t,
      status: 'pending' as const,
      approvedBy: 'user-1',
      approvedByName: 'You',
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const shipTransfer = useCallback(async (transferId: string) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? {
      ...t,
      status: 'in_transit' as const,
      shippedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const receiveTransfer = useCallback(async (transferId: string, receivedItems?: { itemId: string; receivedQuantity: number }[]) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? {
      ...t,
      status: 'completed' as const,
      items: receivedItems ? t.items.map(item => {
        const received = receivedItems.find(r => r.itemId === item.id)
        return received ? { ...item, receivedQuantity: received.receivedQuantity } : { ...item, receivedQuantity: item.quantity }
      }) : t.items.map(item => ({ ...item, receivedQuantity: item.quantity })),
      receivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  const cancelTransfer = useCallback(async (transferId: string) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? {
      ...t,
      status: 'cancelled' as const,
      updatedAt: new Date().toISOString()
    } : t))
    return { success: true }
  }, [])

  // Supplier operations
  const createSupplier = useCallback(async (data: Partial<Supplier>) => {
    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name || 'New Supplier',
      code: data.code || `SUP-${Date.now()}`,
      contactName: data.contactName || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || { street1: '', city: '', state: '', postalCode: '', country: '' },
      paymentTerms: data.paymentTerms || 'Net 30',
      leadTime: data.leadTime || 14,
      rating: 0,
      status: 'active',
      products: [],
      orders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as Supplier
    setSuppliers(prev => [...prev, supplier])
    return { success: true, supplier }
  }, [])

  const updateSupplier = useCallback(async (supplierId: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    return { success: true }
  }, [])

  // Route operations
  const createRoute = useCallback(async (data: Partial<Route>) => {
    const route: Route = {
      id: `route-${Date.now()}`,
      name: data.name || 'New Route',
      warehouseId: data.warehouseId || '',
      warehouseName: data.warehouseName || '',
      stops: data.stops || [],
      totalDistance: data.totalDistance || 0,
      estimatedTime: data.estimatedTime || 0,
      status: 'planned',
      scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
      ...data
    } as Route
    setRoutes(prev => [...prev, route])
    return { success: true, route }
  }, [])

  const startRoute = useCallback(async (routeId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? {
      ...r,
      status: 'in_progress' as const,
      startedAt: new Date().toISOString()
    } : r))
    return { success: true }
  }, [])

  const completeRoute = useCallback(async (routeId: string) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? {
      ...r,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      stops: r.stops.map(s => ({ ...s, status: 'completed' as const }))
    } : r))
    return { success: true }
  }, [])

  const updateRouteStop = useCallback(async (routeId: string, stopId: string, updates: Partial<RouteStop>) => {
    setRoutes(prev => prev.map(r => r.id === routeId ? {
      ...r,
      stops: r.stops.map(s => s.id === stopId ? { ...s, ...updates } : s)
    } : r))
    return { success: true }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchLogistics()
  }, [fetchLogistics])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const activeWarehouses = useMemo(() => warehouses.filter(w => w.status === 'active'), [warehouses])
  const pendingTransfers = useMemo(() => transfers.filter(t => t.status === 'pending'), [transfers])
  const inTransitTransfers = useMemo(() => transfers.filter(t => t.status === 'in_transit'), [transfers])
  const activeSuppliers = useMemo(() => suppliers.filter(s => s.status === 'active'), [suppliers])
  const plannedRoutes = useMemo(() => routes.filter(r => r.status === 'planned'), [routes])
  const activeRoutes = useMemo(() => routes.filter(r => r.status === 'in_progress'), [routes])
  const totalCapacityUsed = useMemo(() => {
    const total = warehouses.reduce((sum, w) => sum + w.capacity.totalLocations, 0)
    const used = warehouses.reduce((sum, w) => sum + w.capacity.usedLocations, 0)
    return total > 0 ? (used / total * 100).toFixed(1) : 0
  }, [warehouses])

  return {
    warehouses, transfers, suppliers, routes, currentWarehouse, stats,
    activeWarehouses, pendingTransfers, inTransitTransfers, activeSuppliers, plannedRoutes, activeRoutes,
    totalCapacityUsed,
    isLoading, error,
    refresh,
    createWarehouse, updateWarehouse, setCurrentWarehouse,
    createTransfer, approveTransfer, shipTransfer, receiveTransfer, cancelTransfer,
    createSupplier, updateSupplier,
    createRoute, startRoute, completeRoute, updateRouteStop
  }
}

export default useLogistics
