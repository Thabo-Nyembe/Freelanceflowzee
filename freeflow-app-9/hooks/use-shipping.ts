'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
export type CarrierType = 'usps' | 'ups' | 'fedex' | 'dhl' | 'custom'

export interface Shipment {
  id: string
  orderId: string
  orderNumber: string
  trackingNumber?: string
  carrier: CarrierType
  carrierName: string
  status: ShipmentStatus
  origin: ShippingAddress
  destination: ShippingAddress
  packages: Package[]
  shippingMethod: string
  estimatedDelivery?: string
  actualDelivery?: string
  shippingCost: number
  insuranceValue?: number
  weight: number
  weightUnit: 'oz' | 'lb' | 'g' | 'kg'
  dimensions?: Dimensions
  trackingEvents: TrackingEvent[]
  label?: ShippingLabel
  customsInfo?: CustomsInfo
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ShippingAddress {
  name: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  email?: string
  isResidential: boolean
}

export interface Package {
  id: string
  weight: number
  dimensions: Dimensions
  itemCount: number
  description?: string
}

export interface Dimensions {
  length: number
  width: number
  height: number
  unit: 'in' | 'cm'
}

export interface TrackingEvent {
  id: string
  status: string
  description: string
  location?: string
  timestamp: string
}

export interface ShippingLabel {
  id: string
  url: string
  format: 'pdf' | 'png' | 'zpl'
  createdAt: string
}

export interface CustomsInfo {
  contents: 'merchandise' | 'gift' | 'documents' | 'sample' | 'returned_goods'
  nonDelivery: 'return' | 'abandon'
  items: CustomsItem[]
}

export interface CustomsItem {
  description: string
  quantity: number
  value: number
  weight: number
  originCountry: string
  hsCode?: string
}

export interface ShippingRate {
  id: string
  carrier: CarrierType
  carrierName: string
  service: string
  rate: number
  currency: string
  estimatedDays: number
  deliveryDate?: string
  guaranteed: boolean
}

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  regions?: string[]
  postalCodes?: string[]
  rates: ZoneRate[]
}

export interface ZoneRate {
  id: string
  method: string
  minWeight: number
  maxWeight: number
  baseRate: number
  perUnitRate: number
  freeShippingThreshold?: number
}

export interface ShippingStats {
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  avgDeliveryTime: number
  onTimeDeliveryRate: number
  totalShippingCost: number
  shipmentsByCarrier: { carrier: string; count: number }[]
  shipmentTrend: { date: string; count: number }[]
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockShipments: Shipment[] = [
  {
    id: 'ship-1',
    orderId: 'order-1',
    orderNumber: 'ORD-2024-001',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'ups',
    carrierName: 'UPS',
    status: 'in_transit',
    origin: { name: 'FreeFlow Warehouse', street1: '123 Shipping Lane', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'US', isResidential: false },
    destination: { name: 'John Smith', street1: '456 Main St', street2: 'Apt 2B', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', phone: '555-1234', email: 'john@example.com', isResidential: true },
    packages: [{ id: 'pkg-1', weight: 2.5, dimensions: { length: 12, width: 8, height: 6, unit: 'in' }, itemCount: 3 }],
    shippingMethod: 'UPS Ground',
    estimatedDelivery: '2024-03-25',
    shippingCost: 12.50,
    weight: 2.5,
    weightUnit: 'lb',
    dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
    trackingEvents: [
      { id: 'evt-1', status: 'In Transit', description: 'Package is in transit to destination', location: 'Chicago, IL', timestamp: '2024-03-21T14:30:00Z' },
      { id: 'evt-2', status: 'Departed Facility', description: 'Package departed UPS facility', location: 'Los Angeles, CA', timestamp: '2024-03-20T08:00:00Z' },
      { id: 'evt-3', status: 'Picked Up', description: 'Package picked up', location: 'Los Angeles, CA', timestamp: '2024-03-19T16:00:00Z' }
    ],
    label: { id: 'lbl-1', url: '/labels/ship-1.pdf', format: 'pdf', createdAt: '2024-03-19T15:00:00Z' },
    createdAt: '2024-03-19T15:00:00Z',
    updatedAt: '2024-03-21T14:30:00Z'
  },
  {
    id: 'ship-2',
    orderId: 'order-2',
    orderNumber: 'ORD-2024-002',
    trackingNumber: '9400111899223334445566',
    carrier: 'usps',
    carrierName: 'USPS',
    status: 'delivered',
    origin: { name: 'FreeFlow Warehouse', street1: '123 Shipping Lane', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'US', isResidential: false },
    destination: { name: 'Jane Doe', street1: '789 Oak Ave', city: 'Chicago', state: 'IL', postalCode: '60601', country: 'US', isResidential: true },
    packages: [{ id: 'pkg-2', weight: 0.5, dimensions: { length: 6, width: 4, height: 2, unit: 'in' }, itemCount: 1 }],
    shippingMethod: 'Priority Mail',
    estimatedDelivery: '2024-03-18',
    actualDelivery: '2024-03-17T14:22:00Z',
    shippingCost: 8.25,
    weight: 0.5,
    weightUnit: 'lb',
    trackingEvents: [
      { id: 'evt-4', status: 'Delivered', description: 'Delivered to mailbox', location: 'Chicago, IL', timestamp: '2024-03-17T14:22:00Z' }
    ],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-17T14:22:00Z'
  },
  {
    id: 'ship-3',
    orderId: 'order-3',
    orderNumber: 'ORD-2024-003',
    carrier: 'fedex',
    carrierName: 'FedEx',
    status: 'pending',
    origin: { name: 'FreeFlow Warehouse', street1: '123 Shipping Lane', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'US', isResidential: false },
    destination: { name: 'Bob Wilson', company: 'Wilson Corp', street1: '321 Business Blvd', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'US', isResidential: false },
    packages: [{ id: 'pkg-3', weight: 5, dimensions: { length: 18, width: 12, height: 10, unit: 'in' }, itemCount: 5 }],
    shippingMethod: 'FedEx Express',
    shippingCost: 45.00,
    weight: 5,
    weightUnit: 'lb',
    trackingEvents: [],
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T09:00:00Z'
  }
]

const mockZones: ShippingZone[] = [
  {
    id: 'zone-1',
    name: 'Domestic - Continental US',
    countries: ['US'],
    rates: [
      { id: 'rate-1', method: 'Standard', minWeight: 0, maxWeight: 5, baseRate: 5.99, perUnitRate: 0.50, freeShippingThreshold: 50 },
      { id: 'rate-2', method: 'Express', minWeight: 0, maxWeight: 5, baseRate: 12.99, perUnitRate: 1.00 }
    ]
  },
  {
    id: 'zone-2',
    name: 'International',
    countries: ['CA', 'MX', 'GB', 'DE', 'FR'],
    rates: [
      { id: 'rate-3', method: 'International Standard', minWeight: 0, maxWeight: 10, baseRate: 19.99, perUnitRate: 2.00 },
      { id: 'rate-4', method: 'International Express', minWeight: 0, maxWeight: 10, baseRate: 39.99, perUnitRate: 3.50 }
    ]
  }
]

const mockStats: ShippingStats = {
  totalShipments: 1250,
  pendingShipments: 45,
  inTransitShipments: 180,
  deliveredShipments: 1015,
  avgDeliveryTime: 3.5,
  onTimeDeliveryRate: 94.2,
  totalShippingCost: 15420.50,
  shipmentsByCarrier: [
    { carrier: 'UPS', count: 450 },
    { carrier: 'USPS', count: 520 },
    { carrier: 'FedEx', count: 280 }
  ],
  shipmentTrend: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    count: 15 + Math.floor(Math.random() * 10)
  }))
}

// ============================================================================
// HOOK
// ============================================================================

interface UseShippingOptions {
  
}

export function useShipping(options: UseShippingOptions = {}) {
  const {  } = options

  const [shipments, setShipments] = useState<Shipment[]>([])
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null)
  const [stats, setStats] = useState<ShippingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchShipping = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/shipping')
      const result = await response.json()
      if (result.success) {
        setShipments(Array.isArray(result.shipments) ? result.shipments : [])
        setZones(Array.isArray(result.zones) ? result.zones : [])
        setStats(result.stats || null)
        return result.shipments
      }
      setShipments([])
      return []
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch shipping data'))
      setShipments([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createShipment = useCallback(async (data: Partial<Shipment>) => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success && result.shipment) {
        setShipments(prev => [result.shipment, ...prev])
        return { success: true, shipment: result.shipment }
      }
      return { success: false, error: 'Failed to create shipment' }
    } catch (err) {
      console.error('Error creating shipment:', err)
      return { success: false, error: 'Failed to create shipment' }
    } finally {
      setIsCreating(false)
    }
  }, [])

  const updateShipment = useCallback(async (shipmentId: string, updates: Partial<Shipment>) => {
    setShipments(prev => prev.map(s => s.id === shipmentId ? {
      ...s,
      ...updates,
      updatedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const cancelShipment = useCallback(async (shipmentId: string) => {
    setShipments(prev => prev.filter(s => s.id !== shipmentId))
    return { success: true }
  }, [])

  const generateLabel = useCallback(async (shipmentId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const trackingNumber = `1Z${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    const label: ShippingLabel = {
      id: `lbl-${Date.now()}`,
      url: `/labels/${shipmentId}.pdf`,
      format: 'pdf',
      createdAt: new Date().toISOString()
    }

    setShipments(prev => prev.map(s => s.id === shipmentId ? {
      ...s,
      trackingNumber,
      label,
      status: 'processing' as const,
      updatedAt: new Date().toISOString()
    } : s))

    return { success: true, label, trackingNumber }
  }, [])

  const getRates = useCallback(async (origin: ShippingAddress, destination: ShippingAddress, packages: Package[]): Promise<ShippingRate[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const totalWeight = packages.reduce((sum, p) => sum + p.weight, 0)

    return [
      { id: 'rate-1', carrier: 'usps', carrierName: 'USPS', service: 'Priority Mail', rate: 8.50 + totalWeight * 0.50, currency: 'USD', estimatedDays: 3, guaranteed: false },
      { id: 'rate-2', carrier: 'ups', carrierName: 'UPS', service: 'Ground', rate: 12.00 + totalWeight * 0.75, currency: 'USD', estimatedDays: 5, guaranteed: true },
      { id: 'rate-3', carrier: 'ups', carrierName: 'UPS', service: '2-Day Air', rate: 25.00 + totalWeight * 1.50, currency: 'USD', estimatedDays: 2, guaranteed: true },
      { id: 'rate-4', carrier: 'fedex', carrierName: 'FedEx', service: 'Express', rate: 30.00 + totalWeight * 2.00, currency: 'USD', estimatedDays: 1, guaranteed: true }
    ]
  }, [])

  const trackShipment = useCallback(async (shipmentId: string) => {
    const shipment = shipments.find(s => s.id === shipmentId)
    if (!shipment?.trackingNumber) return { success: false, error: 'No tracking number' }

    // Simulate tracking update
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true, events: shipment.trackingEvents }
  }, [shipments])

  const markAsShipped = useCallback(async (shipmentId: string, trackingNumber?: string) => {
    setShipments(prev => prev.map(s => s.id === shipmentId ? {
      ...s,
      status: 'shipped' as const,
      trackingNumber: trackingNumber || s.trackingNumber,
      trackingEvents: [{
        id: `evt-${Date.now()}`,
        status: 'Shipped',
        description: 'Package has been shipped',
        timestamp: new Date().toISOString()
      }, ...s.trackingEvents],
      updatedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const markAsDelivered = useCallback(async (shipmentId: string) => {
    setShipments(prev => prev.map(s => s.id === shipmentId ? {
      ...s,
      status: 'delivered' as const,
      actualDelivery: new Date().toISOString(),
      trackingEvents: [{
        id: `evt-${Date.now()}`,
        status: 'Delivered',
        description: 'Package has been delivered',
        timestamp: new Date().toISOString()
      }, ...s.trackingEvents],
      updatedAt: new Date().toISOString()
    } : s))
    return { success: true }
  }, [])

  const createZone = useCallback(async (data: Partial<ShippingZone>) => {
    const zone: ShippingZone = {
      id: `zone-${Date.now()}`,
      name: data.name || 'New Zone',
      countries: data.countries || [],
      rates: data.rates || []
    }
    setZones(prev => [...prev, zone])
    return { success: true, zone }
  }, [])

  const updateZone = useCallback(async (zoneId: string, updates: Partial<ShippingZone>) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ...updates } : z))
    return { success: true }
  }, [])

  const deleteZone = useCallback(async (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId))
    return { success: true }
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchShipping()
  }, [fetchShipping])

  useEffect(() => { refresh() }, [refresh])

  // Computed values
  const pendingShipments = useMemo(() => shipments.filter(s => s.status === 'pending'), [shipments])
  const inTransitShipments = useMemo(() => shipments.filter(s => ['shipped', 'in_transit', 'out_for_delivery'].includes(s.status)), [shipments])
  const deliveredShipments = useMemo(() => shipments.filter(s => s.status === 'delivered'), [shipments])
  const failedShipments = useMemo(() => shipments.filter(s => ['failed', 'returned'].includes(s.status)), [shipments])
  const shipmentsByCarrier = useMemo(() => {
    const grouped: Record<CarrierType, Shipment[]> = { usps: [], ups: [], fedex: [], dhl: [], custom: [] }
    shipments.forEach(s => grouped[s.carrier].push(s))
    return grouped
  }, [shipments])

  return {
    shipments, zones, currentShipment, stats,
    pendingShipments, inTransitShipments, deliveredShipments, failedShipments, shipmentsByCarrier,
    isLoading, isCreating, error,
    refresh, createShipment, updateShipment, cancelShipment,
    generateLabel, getRates, trackShipment, markAsShipped, markAsDelivered,
    createZone, updateZone, deleteZone, setCurrentShipment
  }
}

export default useShipping
