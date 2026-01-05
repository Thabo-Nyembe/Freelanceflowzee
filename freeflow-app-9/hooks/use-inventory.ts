'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
export type MovementType = 'in' | 'out' | 'adjustment' | 'transfer'

export interface InventoryItem {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  subcategory?: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint: number
  reorderQuantity: number
  unitPrice: number
  currency: string
  status: InventoryStatus
  location: InventoryLocation
  supplier?: InventorySupplier
  images: string[]
  variants: ItemVariant[]
  tags: string[]
  barcode?: string
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  lastCountedAt?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryLocation {
  id: string
  name: string
  type: 'warehouse' | 'store' | 'fulfillment_center'
  address?: string
  zone?: string
  bin?: string
}

export interface InventorySupplier {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  leadTime: number // days
}

export interface ItemVariant {
  id: string
  name: string
  sku: string
  attributes: Record<string, string>
  quantity: number
  unitPrice: number
}

export interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: MovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string
  locationFrom?: string
  locationTo?: string
  performedBy: string
  performedByName: string
  createdAt: string
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  supplierName: string
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  expectedDeliveryAt?: string
  receivedAt?: string
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  itemId: string
  itemName: string
  sku: string
  quantity: number
  receivedQuantity: number
  unitPrice: number
  total: number
}

export interface InventoryStats {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  pendingOrders: number
  itemsByCategory: { category: string; count: number; value: number }[]
  movementTrend: { date: string; in: number; out: number }[]
  topSellingItems: { id: string; name: string; sold: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockItems: InventoryItem[] = [
  { id: 'item-1', sku: 'WDG-001', name: 'Premium Widget', description: 'High-quality widget for various applications', category: 'Widgets', quantity: 150, reservedQuantity: 20, availableQuantity: 130, reorderPoint: 50, reorderQuantity: 100, unitPrice: 29.99, currency: 'USD', status: 'in_stock', location: { id: 'loc-1', name: 'Main Warehouse', type: 'warehouse', zone: 'A', bin: '12' }, supplier: { id: 'sup-1', name: 'Widget Co', email: 'orders@widgetco.com', leadTime: 7 }, images: [], variants: [], tags: ['premium', 'bestseller'], barcode: '123456789', createdAt: '2024-01-15', updatedAt: '2024-03-20' },
  { id: 'item-2', sku: 'GDG-002', name: 'Standard Gadget', category: 'Gadgets', quantity: 25, reservedQuantity: 5, availableQuantity: 20, reorderPoint: 30, reorderQuantity: 50, unitPrice: 49.99, currency: 'USD', status: 'low_stock', location: { id: 'loc-1', name: 'Main Warehouse', type: 'warehouse', zone: 'B', bin: '05' }, images: [], variants: [{ id: 'var-1', name: 'Blue', sku: 'GDG-002-BL', attributes: { color: 'Blue' }, quantity: 15, unitPrice: 49.99 }, { id: 'var-2', name: 'Red', sku: 'GDG-002-RD', attributes: { color: 'Red' }, quantity: 10, unitPrice: 49.99 }], tags: ['popular'], createdAt: '2024-02-01', updatedAt: '2024-03-19' },
  { id: 'item-3', sku: 'ACC-003', name: 'Accessory Pack', category: 'Accessories', quantity: 0, reservedQuantity: 0, availableQuantity: 0, reorderPoint: 20, reorderQuantity: 40, unitPrice: 14.99, currency: 'USD', status: 'out_of_stock', location: { id: 'loc-1', name: 'Main Warehouse', type: 'warehouse' }, images: [], variants: [], tags: [], createdAt: '2024-01-20', updatedAt: '2024-03-18' }
]

const mockMovements: StockMovement[] = [
  { id: 'mov-1', itemId: 'item-1', itemName: 'Premium Widget', type: 'in', quantity: 50, previousQuantity: 100, newQuantity: 150, reason: 'Purchase order received', reference: 'PO-001', performedBy: 'user-1', performedByName: 'Alex Chen', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'mov-2', itemId: 'item-2', itemName: 'Standard Gadget', type: 'out', quantity: 10, previousQuantity: 35, newQuantity: 25, reason: 'Customer order fulfilled', reference: 'ORD-123', performedBy: 'user-2', performedByName: 'Sarah Miller', createdAt: '2024-03-20T09:30:00Z' },
  { id: 'mov-3', itemId: 'item-3', itemName: 'Accessory Pack', type: 'adjustment', quantity: -5, previousQuantity: 5, newQuantity: 0, reason: 'Damaged items written off', performedBy: 'user-1', performedByName: 'Alex Chen', createdAt: '2024-03-18T14:00:00Z' }
]

const mockOrders: PurchaseOrder[] = [
  { id: 'po-1', orderNumber: 'PO-002', supplierId: 'sup-1', supplierName: 'Widget Co', status: 'confirmed', items: [{ itemId: 'item-3', itemName: 'Accessory Pack', sku: 'ACC-003', quantity: 40, receivedQuantity: 0, unitPrice: 10.00, total: 400 }], subtotal: 400, tax: 32, shipping: 15, total: 447, currency: 'USD', expectedDeliveryAt: '2024-03-25', createdBy: 'user-1', createdAt: '2024-03-19', updatedAt: '2024-03-19' }
]

const mockStats: InventoryStats = {
  totalItems: 156,
  totalValue: 125000,
  lowStockItems: 12,
  outOfStockItems: 3,
  pendingOrders: 5,
  itemsByCategory: [{ category: 'Widgets', count: 45, value: 45000 }, { category: 'Gadgets', count: 62, value: 55000 }, { category: 'Accessories', count: 49, value: 25000 }],
  movementTrend: Array.from({ length: 7 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], in: 50 + Math.floor(Math.random() * 30), out: 40 + Math.floor(Math.random() * 25) })),
  topSellingItems: [{ id: 'item-1', name: 'Premium Widget', sold: 520 }, { id: 'item-2', name: 'Standard Gadget', sold: 380 }]
}

// ============================================================================
// HOOK
// ============================================================================

interface UseInventoryOptions {
  
}

export function useInventory(options: UseInventoryOptions = {}) {
  const {  } = options

  const [items, setItems] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null)
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInventory = useCallback(async () => {
    }, [])

  const updateItem = useCallback(async (itemId: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      ...updates,
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true }
  }, [])

  const deleteItem = useCallback(async (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId))
    return { success: true }
  }, [])

  const adjustStock = useCallback(async (itemId: string, quantity: number, reason: string, type: MovementType = 'adjustment') => {
    const item = items.find(i => i.id === itemId)
    if (!item) return { success: false, error: 'Item not found' }

    const newQuantity = type === 'in' ? item.quantity + quantity : type === 'out' ? item.quantity - quantity : item.quantity + quantity

    if (newQuantity < 0) return { success: false, error: 'Insufficient stock' }

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId,
      itemName: item.name,
      type,
      quantity: Math.abs(quantity),
      previousQuantity: item.quantity,
      newQuantity,
      reason,
      performedBy: 'user-1',
      performedByName: 'You',
      createdAt: new Date().toISOString()
    }

    setMovements(prev => [movement, ...prev])

    const status: InventoryStatus = newQuantity === 0 ? 'out_of_stock' : newQuantity <= item.reorderPoint ? 'low_stock' : 'in_stock'

    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      quantity: newQuantity,
      availableQuantity: newQuantity - i.reservedQuantity,
      status,
      updatedAt: new Date().toISOString()
    } : i))

    return { success: true, movement }
  }, [items])

  const reserveStock = useCallback(async (itemId: string, quantity: number, reference: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return { success: false, error: 'Item not found' }
    if (item.availableQuantity < quantity) return { success: false, error: 'Insufficient available stock' }

    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      reservedQuantity: i.reservedQuantity + quantity,
      availableQuantity: i.availableQuantity - quantity,
      updatedAt: new Date().toISOString()
    } : i))

    return { success: true }
  }, [items])

  const releaseReservation = useCallback(async (itemId: string, quantity: number) => {
    setItems(prev => prev.map(i => i.id === itemId ? {
      ...i,
      reservedQuantity: Math.max(0, i.reservedQuantity - quantity),
      availableQuantity: i.availableQuantity + quantity,
      updatedAt: new Date().toISOString()
    } : i))
    return { success: true }
  }, [])

  const transferStock = useCallback(async (itemId: string, quantity: number, fromLocationId: string, toLocationId: string) => {
    return adjustStock(itemId, 0, `Transfer from ${fromLocationId} to ${toLocationId}`, 'transfer')
  }, [adjustStock])

  const createPurchaseOrder = useCallback(async (data: Partial<PurchaseOrder>) => {
    const order: PurchaseOrder = {
      id: `po-${Date.now()}`,
      orderNumber: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplierId: data.supplierId || '',
      supplierName: data.supplierName || '',
      status: 'draft',
      items: data.items || [],
      subtotal: data.subtotal || 0,
      tax: data.tax || 0,
      shipping: data.shipping || 0,
      total: data.total || 0,
      currency: data.currency || 'USD',
      createdBy: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    } as PurchaseOrder
    setPurchaseOrders(prev => [order, ...prev])
    return { success: true, order }
  }, [purchaseOrders.length])

  const updatePurchaseOrderStatus = useCallback(async (orderId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      status,
      receivedAt: status === 'received' ? new Date().toISOString() : o.receivedAt,
      updatedAt: new Date().toISOString()
    } : o))
    return { success: true }
  }, [])

  const receiveOrder = useCallback(async (orderId: string, receivedItems: { itemId: string; quantity: number }[]) => {
    const order = purchaseOrders.find(o => o.id === orderId)
    if (!order) return { success: false, error: 'Order not found' }

    for (const received of receivedItems) {
      await adjustStock(received.itemId, received.quantity, `Received from PO ${order.orderNumber}`, 'in')
    }

    await updatePurchaseOrderStatus(orderId, 'received')
    return { success: true }
  }, [purchaseOrders, adjustStock, updatePurchaseOrderStatus])

  const searchItems = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase()
    return items.filter(i =>
      i.name.toLowerCase().includes(lowerQuery) ||
      i.sku.toLowerCase().includes(lowerQuery) ||
      i.barcode?.includes(query)
    )
  }, [items])

  const getStatusColor = useCallback((status: InventoryStatus): string => {
    switch (status) {
      case 'in_stock': return '#22c55e'
      case 'low_stock': return '#f59e0b'
      case 'out_of_stock': return '#ef4444'
      case 'discontinued': return '#6b7280'
    }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchInventory()
  }, [fetchInventory])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const inStockItems = useMemo(() => items.filter(i => i.status === 'in_stock'), [items])
  const lowStockItems = useMemo(() => items.filter(i => i.status === 'low_stock'), [items])
  const outOfStockItems = useMemo(() => items.filter(i => i.status === 'out_of_stock'), [items])
  const needsReorder = useMemo(() => items.filter(i => i.availableQuantity <= i.reorderPoint), [items])
  const totalValue = useMemo(() => items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0), [items])
  const pendingOrders = useMemo(() => purchaseOrders.filter(o => !['received', 'cancelled'].includes(o.status)), [purchaseOrders])
  const categories = useMemo(() => [...new Set(items.map(i => i.category))], [items])

  return {
    items, movements, purchaseOrders, currentItem, stats, categories,
    inStockItems, lowStockItems, outOfStockItems, needsReorder, pendingOrders, totalValue,
    isLoading, error,
    refresh, createItem, updateItem, deleteItem,
    adjustStock, reserveStock, releaseReservation, transferStock,
    createPurchaseOrder, updatePurchaseOrderStatus, receiveOrder,
    searchItems, getStatusColor, setCurrentItem
  }
}

export default useInventory
