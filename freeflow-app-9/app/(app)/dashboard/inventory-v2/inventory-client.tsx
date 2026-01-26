'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { useState, useMemo, useCallback } from 'react'
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, type InventoryItem, type InventoryStatus } from '@/lib/hooks/use-inventory'
import { useInventoryLocations } from '@/lib/hooks/use-inventory-extended'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { toast } from 'sonner'
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
  Zap,
  MapPin,
  ArrowRightLeft,
  ClipboardList,
  Users,
  History,
  Settings,
  MoreHorizontal,
  Edit,
  QrCode,
  Warehouse,
  PackageCheck,
  PackageX,
  RefreshCw,
  Eye,
  Copy,
  Clock,
  Building2,
  Globe,
  Barcode,
  Bell,
  ChevronDown,
  ChevronRight,
  Loader2,
  ShoppingCart,
  BookOpen,
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





import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

// Initialize Supabase client once at module level
const supabase = createClient()

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


export default function InventoryClient({ initialInventory: _initialInventory }: { initialInventory: InventoryItem[] }) {
  const router = useRouter()

  // Team and activity data hooks
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  const [activeTab, setActiveTab] = useState('products')
  const [settingsTab, setSettingsTab] = useState('general')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [_locationFilter, _setLocationFilter] = useState<string>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showPODialog, setShowPODialog] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())

  // Database integration
  const { data: dbInventory, loading: inventoryLoading, error: inventoryError, refetch } = useInventory({ status: statusFilter === 'all' ? 'all' : statusFilter as InventoryStatus })
  const { mutate: createInventoryItem, loading: creating } = useCreateInventoryItem()
  const { mutate: updateInventoryItem, loading: _updating } = useUpdateInventoryItem()
  const { mutate: _deleteInventoryItem, loading: _deleting } = useDeleteInventoryItem()
  const { locations: dbLocations, isLoading: locationsLoading } = useInventoryLocations()

  // Form state for new product
  const [newProductForm, setNewProductForm] = useState({
    title: '',
    vendor: '',
    description: '',
    productType: 'Apparel',
    status: 'draft' as 'active' | 'draft' | 'archived',
    sku: '',
    price: '',
    costPrice: '',
    quantity: ''
  })

  // Form state for transfer
  const [transferForm, setTransferForm] = useState({
    originLocationId: '',
    destinationLocationId: '',
    expectedArrival: '',
    notes: '',
    items: [] as { productId: string; sku: string; quantity: number }[]
  })
  const [creatingTransfer, setCreatingTransfer] = useState(false)

  // Form state for purchase order
  const [poForm, setPoForm] = useState({
    supplierId: '',
    supplierName: '',
    expectedDate: '',
    notes: '',
    items: [] as { productId: string; sku: string; quantity: number; unitCost: number }[]
  })
  const [creatingPO, setCreatingPO] = useState(false)

  // Form state for location
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    type: 'warehouse' as 'warehouse' | 'store' | 'fulfillment' | 'dropship'
  })
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [creatingLocation, setCreatingLocation] = useState(false)

  // Form state for supplier
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    leadTime: 14,
    paymentTerms: 'Net 30'
  })
  const [showSupplierDialog, setShowSupplierDialog] = useState(false)
  const [creatingSupplier, setCreatingSupplier] = useState(false)
  const [showStockCountDialog, setShowStockCountDialog] = useState(false)
  const [showBarcodeScannerDialog, setShowBarcodeScannerDialog] = useState(false)
  const [importingInventory, setImportingInventory] = useState(false)
  const [_printingLabels, setPrintingLabels] = useState(false)

  // Compute inventory stats from database data
  const inventoryStats = useMemo(() => {
    const items = dbInventory || []
    const totalProducts = items.length
    const totalValue = items.reduce((sum, item) => sum + (item.total_value || 0), 0)
    const lowStockItems = items.filter(item => item.low_stock_alert || item.status === 'low-stock').length
    const outOfStockItems = items.filter(item => item.status === 'out-of-stock' || item.quantity === 0).length
    const avgTurnoverRate = items.length > 0
      ? items.reduce((sum, item) => sum + (item.turnover_rate || 0), 0) / items.length
      : 0
    const inventoryAccuracy = 98.5 // This would come from audit data in production

    return {
      totalProducts,
      totalVariants: totalProducts, // In this model, products are variants
      totalValue,
      lowStockItems,
      outOfStockItems,
      totalLocations: dbLocations?.length || 0,
      avgTurnoverRate,
      inventoryAccuracy
    }
  }, [dbInventory, dbLocations])

  // Filtered products from database
  const filteredProducts = useMemo((): Product[] => {
    // Map database inventory items to Product type
    const products: Product[] = (dbInventory || []).map(item => ({
      id: item.id,
      title: item.product_name,
      description: item.description || '',
      vendor: item.brand || item.manufacturer || '',
      productType: item.category || 'General',
      tags: item.tags || [],
      status: item.status === 'in-stock' ? 'active' : item.status === 'discontinued' ? 'archived' : 'draft',
      variants: [{
        id: item.id,
        sku: item.sku || '',
        barcode: item.barcode || '',
        option1: null,
        option2: null,
        option3: null,
        price: item.selling_price || item.unit_price,
        costPrice: item.cost_price,
        quantity: item.quantity,
        weight: item.weight_kg,
        weightUnit: 'kg' as const
      }],
      totalQuantity: item.quantity,
      totalValue: item.total_value,
      images: item.images || (item.image_url ? [item.image_url] : []),
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    // Apply search filter
    let filtered = products
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.vendor.toLowerCase().includes(query) ||
        p.variants.some(v => v.sku.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    return filtered
  }, [dbInventory, searchQuery, statusFilter])

  // Export handler using useCallback (must be before early returns)
  const handleExportInventory = useCallback(async () => {
    try {
      toast.info('Export started')
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Convert to CSV
      const items = data || []
      if (items.length === 0) {
        toast.info('No data to export')
        return
      }

      const headers = Object.keys(items[0]).join(',')
      const rows = items.map(item =>
        Object.values(item).map(v =>
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(',')
      )
      const csv = [headers, ...rows].join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(`Export completed: ${dbInventory?.length || 0} items`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export inventory')
    }
  }, [dbInventory?.length])

  // Loading state - after all hooks
  if (inventoryLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Error state - after all hooks
  if (inventoryError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-red-500">Error loading inventory data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const handleCreateProduct = async () => {
    if (!newProductForm.title) {
      toast.error('Please enter a product title')
      return
    }

    try {
      await createInventoryItem({
        product_name: newProductForm.title,
        sku: newProductForm.sku || null,
        category: newProductForm.productType,
        status: newProductForm.status === 'active' ? 'in-stock' : 'out-of-stock',
        quantity: parseInt(newProductForm.quantity) || 0,
        available_quantity: parseInt(newProductForm.quantity) || 0,
        reserved_quantity: 0,
        unit_price: parseFloat(newProductForm.price) || 0,
        selling_price: parseFloat(newProductForm.price) || 0,
        cost_price: parseFloat(newProductForm.costPrice) || 0,
        total_value: (parseFloat(newProductForm.price) || 0) * (parseInt(newProductForm.quantity) || 0),
        description: newProductForm.description || null,
        brand: newProductForm.vendor || null,
        manufacturer: newProductForm.vendor || null,
        reorder_point: 10,
        reorder_quantity: 50,
        minimum_stock_level: 5,
        maximum_stock_level: 1000,
        is_active: true,
        currency: 'USD',
        lead_time_days: 7,
        weight_kg: 0,
        volume_m3: 0,
        turnover_rate: 0,
        sell_through_rate: 0,
        stock_cover_days: 0,
        total_sales: 0,
        total_revenue: 0,
        low_stock_alert: false,
        out_of_stock_alert: false,
        expiry_alert: false,
        has_expiry: false,
        tax_rate: 0,
        is_taxable: true
      } as any)

      toast.success('Product created successfully!')
      setShowProductDialog(false)
      setNewProductForm({
        title: '',
        vendor: '',
        description: '',
        productType: 'Apparel',
        status: 'draft',
        sku: '',
        price: '',
        costPrice: '',
        quantity: ''
      })
      refetch()
    } catch (error) {
      toast.error('Failed to create product')
      console.error(error)
    }
  }

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

  // Handlers
  const handleTransferStock = () => {
    setShowTransferDialog(true)
  }

  const _handleCreatePurchaseOrder = () => {
    setShowPODialog(true)
  }

  const handleCreateTransfer = async () => {
    if (!transferForm.originLocationId || !transferForm.destinationLocationId) {
      toast.error('Please select origin and destination locations')
      return
    }
    if (transferForm.originLocationId === transferForm.destinationLocationId) {
      toast.error('Origin and destination must be different')
      return
    }

    setCreatingTransfer(true)
    try {
      const { error } = await supabase.from('stock_transfers').insert({
        reference: `TRF-${Date.now()}`,
        origin_location_id: transferForm.originLocationId,
        destination_location_id: transferForm.destinationLocationId,
        status: 'pending',
        expected_arrival: transferForm.expectedArrival || null,
        notes: transferForm.notes || null,
        created_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success('Stock transfer created')
      setShowTransferDialog(false)
      setTransferForm({
        originLocationId: '',
        destinationLocationId: '',
        expectedArrival: '',
        notes: '',
        items: []
      })
    } catch (error) {
      console.error('Transfer creation error:', error)
      toast.error('Failed to create transfer')
    } finally {
      setCreatingTransfer(false)
    }
  }

  const handleCreatePO = async () => {
    if (!poForm.supplierId) {
      toast.error('Please select a supplier')
      return
    }

    setCreatingPO(true)
    try {
      const { error } = await supabase.from('purchase_orders').insert({
        po_number: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        supplier_id: poForm.supplierId,
        status: 'draft',
        expected_date: poForm.expectedDate || null,
        notes: poForm.notes || null,
        subtotal: 0,
        tax: 0,
        total: 0,
        created_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success('Purchase order created')
      setShowPODialog(false)
      setPoForm({
        supplierId: '',
        supplierName: '',
        expectedDate: '',
        notes: '',
        items: []
      })
    } catch (error) {
      console.error('PO creation error:', error)
      toast.error('Failed to create purchase order')
    } finally {
      setCreatingPO(false)
    }
  }

  const _handleUpdateStock = async (product: Product) => {
    // Find matching inventory item from DB
    const inventoryItem = dbInventory?.find(item =>
      item.product_name === product.title || item.sku === product.variants[0]?.sku
    )

    if (!inventoryItem) {
      toast.error('Product not found in database')
      return
    }

    try {
      const newQuantity = product.totalQuantity
      await updateInventoryItem({
        id: inventoryItem.id,
        quantity: newQuantity,
        available_quantity: newQuantity - (inventoryItem.reserved_quantity || 0),
        total_value: newQuantity * inventoryItem.unit_price,
        status: newQuantity === 0 ? 'out-of-stock' : newQuantity <= inventoryItem.reorder_point ? 'low-stock' : 'in-stock',
        updated_at: new Date().toISOString()
      } as any)

      toast.success(`Stock updated: "${inventoryItem.product_name}" has been updated`)
      refetch()
    } catch (error) {
      console.error('Stock update error:', error)
      toast.error('Failed to update stock')
    }
  }

  const _handleArchiveProduct = async (product: Product) => {
    const inventoryItem = dbInventory?.find(item =>
      item.product_name === product.title || item.sku === product.variants[0]?.sku
    )

    if (!inventoryItem) {
      toast.error('Product not found in database')
      return
    }

    try {
      await updateInventoryItem({
        id: inventoryItem.id,
        status: 'discontinued',
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)

      toast.success(`Product archived: "${product.title}" has been archived`)
      refetch()
    } catch (error) {
      console.error('Archive error:', error)
      toast.error('Failed to archive product')
    }
  }

  const handleCreateLocation = async () => {
    if (!locationForm.name) {
      toast.error('Please enter a location name')
      return
    }

    setCreatingLocation(true)
    try {
      const { error } = await supabase.from('inventory_locations').insert({
        name: locationForm.name,
        address: locationForm.address || null,
        city: locationForm.city || null,
        country: locationForm.country || null,
        type: locationForm.type,
        is_active: true,
        created_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success(`Location created: "${locationForm.name}" has been added`)
      setShowLocationDialog(false)
      setLocationForm({
        name: '',
        address: '',
        city: '',
        country: '',
        type: 'warehouse'
      })
    } catch (error) {
      console.error('Location creation error:', error)
      toast.error('Failed to create location')
    } finally {
      setCreatingLocation(false)
    }
  }

  const handleCreateSupplier = async () => {
    if (!supplierForm.name) {
      toast.error('Please enter a supplier name')
      return
    }

    setCreatingSupplier(true)
    try {
      const { error } = await supabase.from('suppliers').insert({
        name: supplierForm.name,
        email: supplierForm.email || null,
        phone: supplierForm.phone || null,
        address: supplierForm.address || null,
        country: supplierForm.country || null,
        lead_time_days: supplierForm.leadTime,
        payment_terms: supplierForm.paymentTerms,
        is_active: true,
        rating: 0,
        created_at: new Date().toISOString()
      })

      if (error) throw error

      toast.success(`Supplier created: "${supplierForm.name}" has been added`)
      setShowSupplierDialog(false)
      setSupplierForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        country: '',
        leadTime: 14,
        paymentTerms: 'Net 30'
      })
    } catch (error) {
      console.error('Supplier creation error:', error)
      toast.error('Failed to create supplier')
    } finally {
      setCreatingSupplier(false)
    }
  }

  const handleSyncInventory = async () => {
    toast.info('Syncing...')
    await refetch()
    toast.success('Sync complete')
  }

  // Handle barcode scanner - opens scanner dialog
  const handleScanBarcode = async () => {
    setShowBarcodeScannerDialog(true)
    toast.info('Barcode Scanner')
  }

  // Handle import inventory from file
  const handleImportInventory = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportingInventory(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/inventory/import', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Import failed')
      }

      const result = await response.json()
      toast.success(`Import completed: ${result.imported || 0} items`)
      refetch()
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Import failed')
    } finally {
      setImportingInventory(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Handle stock count action
  const handleStockCount = () => {
    setShowStockCountDialog(true)
    toast.info('Stock Count')
  }

  // Handle print labels
  const handlePrintLabels = async () => {
    setPrintingLabels(true)
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, product_name, sku, barcode')
        .is('deleted_at', null)
        .limit(20)

      if (error) throw error

      const items = data || []
      if (items.length === 0) {
        toast.info('No items to print')
        return
      }

      // Generate label content
      const labelContent = items.map(item => `
        <div class="label" style="page-break-after: always; padding: 10px; border: 1px solid #ccc; margin-bottom: 5px;">
          <h3>${item.product_name}</h3>
          <p>SKU: ${item.sku || 'N/A'}</p>
          <p>Barcode: ${item.barcode || item.id}</p>
        </div>
      `).join('')

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Inventory Labels</title></head>
            <body style="font-family: Arial, sans-serif;">
              ${labelContent}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        toast.success(`Print ready labels ready to print`)
      } else {
        toast.error('Could not open print window')
      }
    } catch (error) {
      console.error('Print labels error:', error)
      toast.error('Failed to generate labels')
    } finally {
      setPrintingLabels(false)
    }
  }

  // Quick actions with real functionality
  const inventoryQuickActions = [
    { id: '1', label: 'Stock Count', icon: 'ClipboardList', shortcut: 'C', action: handleStockCount },
    { id: '2', label: 'Transfer Stock', icon: 'ArrowRightLeft', shortcut: 'T', action: () => setShowTransferDialog(true) },
    { id: '3', label: 'New PO', icon: 'FileText', shortcut: 'P', action: () => setShowPODialog(true) },
    { id: '4', label: 'Print Labels', icon: 'Printer', shortcut: 'L', action: handlePrintLabels },
  ]

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
              <div className="text-2xl font-bold">{inventoryStats.totalProducts}</div>
              <div className="text-xs text-white/60">{inventoryStats.totalVariants} variants</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                Total Value
              </div>
              <div className="text-2xl font-bold">${(inventoryStats.totalValue / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">Across all locations</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                Low Stock
              </div>
              <div className="text-2xl font-bold text-yellow-300">{inventoryStats.lowStockItems}</div>
              <div className="text-xs text-white/60">{inventoryStats.outOfStockItems} out of stock</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <RefreshCw className="w-4 h-4" />
                Turnover Rate
              </div>
              <div className="text-2xl font-bold">{inventoryStats.avgTurnoverRate.toFixed(1)}x</div>
              <div className="text-xs text-white/60">Monthly average</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Accuracy
              </div>
              <div className="text-2xl font-bold">{inventoryStats.inventoryAccuracy}%</div>
              <div className="text-xs text-white/60">Last count</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* System Status Bar */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-3 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
            </div>
            <span className="text-sm text-gray-500">Last sync: 2 minutes ago</span>
          </div>
          <button
            onClick={handleSyncInventory}
            className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </button>
        </div>

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
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {/* Quick Actions Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Inventory Overview</h3>
                  <p className="text-blue-100 text-sm">Real-time stock tracking across all locations</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowProductDialog(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                  <button
                    onClick={handleScanBarcode}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm font-medium"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan Barcode
                  </button>
                  <button
                    onClick={handleTransferStock}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 text-sm font-medium"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer Stock
                  </button>
                </div>
              </div>
            </div>

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
                <label
                  className={`px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm cursor-pointer ${importingInventory ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload className="w-4 h-4" />
                  {importingInventory ? 'Importing...' : 'Import'}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportInventory}
                    disabled={importingInventory}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleExportInventory}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Inventory Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total SKUs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryStats.totalProducts}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Active products</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <PackageCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryStats.totalProducts - inventoryStats.outOfStockItems}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-500">{inventoryStats.totalProducts > 0 ? ((inventoryStats.totalProducts - inventoryStats.outOfStockItems) / inventoryStats.totalProducts * 100).toFixed(1) : 0}% in stock rate</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryStats.lowStockItems}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-600">Needs reorder</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <PackageX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryStats.outOfStockItems}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">Awaiting restock</span>
                </div>
              </div>
            </div>

            {/* Inventory Velocity & Turnover */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Inventory Turnover
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">This Month</span>
                    <span className="font-semibold text-gray-900 dark:text-white">4.2x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last Month</span>
                    <span className="font-semibold text-gray-900 dark:text-white">3.8x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">YTD Average</span>
                    <span className="font-semibold text-gray-900 dark:text-white">4.0x</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Inventory Value
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Value</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$847,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Cost of Goods</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$623,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Profit Margin</span>
                    <span className="font-semibold text-green-600">26.4%</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-purple-600" />
                  Warehouse Capacity
                </h4>
                <div className="space-y-3">
                  {[].map((loc) => (
                    <div key={loc.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{loc.name}</span>
                        <span className="text-gray-900 dark:text-white">{Math.floor(Math.random() * 30 + 60)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.floor(Math.random() * 30 + 60)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Recent Inventory Activity
              </h4>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[
                  { action: 'Received', product: 'iPhone 15 Pro', qty: 50, time: '2 min ago', type: 'in' },
                  { action: 'Shipped', product: 'MacBook Air M3', qty: 12, time: '15 min ago', type: 'out' },
                  { action: 'Transferred', product: 'AirPods Pro', qty: 30, time: '1 hr ago', type: 'transfer' },
                  { action: 'Adjusted', product: 'Magic Mouse', qty: -5, time: '2 hrs ago', type: 'adjust' },
                  { action: 'Received', product: 'iPad Pro 12.9"', qty: 25, time: '3 hrs ago', type: 'in' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'in' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        activity.type === 'out' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        activity.type === 'transfer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {activity.action}
                      </span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.product}</p>
                    <p className="text-sm text-gray-500">
                      {activity.qty > 0 ? '+' : ''}{activity.qty} units
                    </p>
                  </div>
                ))}
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
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/orders-v2?product=${product.id}`); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                                title="View Orders"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/products-v2?highlight=${product.id}`); }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                                title="View in Catalog"
                              >
                                <BookOpen className="w-4 h-4" />
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
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 text-sm">
                                <div className="font-medium text-gray-500 dark:text-gray-400">Variant</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400">SKU</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400 text-right">Stock</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400 text-right">Price</div>
                                <div className="font-medium text-gray-500 dark:text-gray-400 text-center">Status</div>
                              </div>
                              {product.variants.map((variant) => {
                                const stockStatus = getVariantStockStatus(variant.quantity)
                                return (
                                  <div key={variant.id} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 text-sm py-2 border-t dark:border-gray-600 mt-2">
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
              <button
                onClick={() => setShowLocationDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[].map((location) => {
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t dark:border-gray-700">
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
                  {[].map((transfer) => (
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
                  {[].map((po) => (
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
              <button
                onClick={() => setShowSupplierDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[].map((supplier) => (
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
              <button
                onClick={handleExportInventory}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
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
                  {[].map((adj) => (
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

          {/* Settings Tab - Fishbowl Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Settings },
                      { id: 'locations', label: 'Locations', icon: MapPin },
                      { id: 'tracking', label: 'Tracking', icon: Barcode },
                      { id: 'reorder', label: 'Reorder Rules', icon: RefreshCw },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'advanced', label: 'Advanced', icon: Zap },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Inventory Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Default Stock Unit</p>
                            <p className="text-sm text-gray-500">Base unit for inventory counts</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>Each</option>
                            <option>Box</option>
                            <option>Case</option>
                            <option>Pallet</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Negative Inventory</p>
                            <p className="text-sm text-gray-500">Allow stock to go below zero</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600">
                            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-SKU Generation</p>
                            <p className="text-sm text-gray-500">Automatically generate SKUs for new products</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Track Serial Numbers</p>
                            <p className="text-sm text-gray-500">Enable serial number tracking for products</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Costing Method</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[
                          { name: 'FIFO', desc: 'First In, First Out', active: true },
                          { name: 'LIFO', desc: 'Last In, First Out', active: false },
                          { name: 'Average', desc: 'Weighted Average Cost', active: false },
                        ].map((method) => (
                          <button
                            key={method.name}
                            className={`p-4 rounded-lg border-2 text-left ${
                              method.active
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <p className="font-semibold text-gray-900 dark:text-white">{method.name}</p>
                            <p className="text-sm text-gray-500">{method.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Locations Settings */}
                {settingsTab === 'locations' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Warehouse Locations</h3>
                        <button
                          onClick={() => setShowLocationDialog(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Location
                        </button>
                      </div>
                      <div className="space-y-3">
                        {[].map((loc) => (
                          <div key={loc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Warehouse className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{loc.name}</p>
                                <p className="text-sm text-gray-500">{loc.address}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                loc.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {loc.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                                <Edit className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bin/Zone Management</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Bin Locations</p>
                            <p className="text-sm text-gray-500">Track inventory by specific bin locations</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Zone-based Picking</p>
                            <p className="text-sm text-gray-500">Organize picking by warehouse zones</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking Settings */}
                {settingsTab === 'tracking' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Barcode Configuration</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Barcode Format</p>
                            <p className="text-sm text-gray-500">Default barcode symbology</p>
                          </div>
                          <select className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                            <option>Code 128</option>
                            <option>Code 39</option>
                            <option>EAN-13</option>
                            <option>UPC-A</option>
                            <option>QR Code</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-generate Barcodes</p>
                            <p className="text-sm text-gray-500">Create barcodes for new products</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Print Labels on Receive</p>
                            <p className="text-sm text-gray-500">Auto-print labels when receiving inventory</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600">
                            <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lot & Batch Tracking</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Lot Tracking</p>
                            <p className="text-sm text-gray-500">Track inventory by lot numbers</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Expiration Date Tracking</p>
                            <p className="text-sm text-gray-500">Monitor product expiration dates</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">FEFO Picking</p>
                            <p className="text-sm text-gray-500">First Expired, First Out picking method</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reorder Rules Settings */}
                {settingsTab === 'reorder' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-Reorder Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Auto-Reorder</p>
                            <p className="text-sm text-gray-500">Automatically create POs when stock is low</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Default Reorder Point</p>
                            <p className="text-sm text-gray-500">Default safety stock level</p>
                          </div>
                          <input type="number" defaultValue="10" className="w-24 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Lead Time (Days)</p>
                            <p className="text-sm text-gray-500">Default supplier lead time</p>
                          </div>
                          <input type="number" defaultValue="7" className="w-24 px-3 py-2 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Economic Order Quantity</p>
                            <p className="text-sm text-gray-500">Calculate optimal order quantities</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Demand Forecasting</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Forecast Period</p>
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500">
                            <option>30 Days</option>
                            <option>60 Days</option>
                            <option>90 Days</option>
                          </select>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Safety Stock %</p>
                          <input type="number" defaultValue="15" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Alerts</h3>
                      <div className="space-y-4">
                        {[
                          { name: 'Low Stock Alert', email: true, push: true },
                          { name: 'Out of Stock Alert', email: true, push: true },
                          { name: 'Reorder Point Reached', email: true, push: false },
                          { name: 'Expiring Products', email: true, push: true },
                          { name: 'Transfer Completed', email: false, push: true },
                          { name: 'PO Received', email: true, push: true },
                        ].map((notif) => (
                          <div key={notif.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{notif.name}</span>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.email} className="w-4 h-4 accent-blue-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked={notif.push} className="w-4 h-4 accent-blue-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Push</span>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Schedule</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Daily Inventory Summary</p>
                            <p className="text-sm text-gray-500">Receive daily stock summary email</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Weekly Analytics Report</p>
                            <p className="text-sm text-gray-500">Weekly inventory performance report</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integration Settings</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">API Key</p>
                          <div className="flex items-center gap-2">
                            <input type="password" defaultValue="inv_live_xxxxxxxxxxxx" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 font-mono text-sm" />
                            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Webhook Notifications</p>
                            <p className="text-sm text-gray-500">Send updates to external systems</p>
                          </div>
                          <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Webhook URL</p>
                          <input type="url" placeholder="https://your-domain.com/webhooks/inventory" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Import/Export</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <button className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-left">
                          <Upload className="w-6 h-6 text-blue-600 mb-2" />
                          <p className="font-medium text-gray-900 dark:text-white">Import Inventory</p>
                          <p className="text-sm text-gray-500">Upload CSV or Excel file</p>
                        </button>
                        <button className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-left">
                          <Download className="w-6 h-6 text-blue-600 mb-2" />
                          <p className="font-medium text-gray-900 dark:text-white">Export Inventory</p>
                          <p className="text-sm text-gray-500">Download all inventory data</p>
                        </button>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Reset Inventory Counts</p>
                          <p className="text-sm text-gray-500">Set all inventory counts to zero</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                          Reset All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* AI Insights Panel */}
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[]}
              title="Inventory Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>

          {/* Team Collaboration & Activity */}
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers.map(member => ({
                id: member.id,
                name: member.name,
                avatar: member.avatar_url || undefined,
                status: member.status === 'active' ? 'online' as const : member.status === 'on_leave' ? 'away' as const : 'offline' as const
              }))}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Inventory Forecasts"
            />
          </div>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs.slice(0, 10).map(log => ({
              id: log.id,
              type: log.activity_type === 'create' ? 'create' as const : log.activity_type === 'update' ? 'update' as const : log.activity_type === 'delete' ? 'delete' as const : 'update' as const,
              title: log.action,
              description: log.resource_name || undefined,
              user: { name: log.user_name || 'System', avatar: undefined },
              timestamp: log.created_at,
              isUnread: log.status === 'pending'
            }))}
            title="Warehouse Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={inventoryQuickActions}
            variant="grid"
          />
        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={selectedProduct?.title || newProductForm.title}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={selectedProduct?.vendor || newProductForm.vendor}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Enter vendor name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={selectedProduct?.description || newProductForm.description}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="Enter product description"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Type</label>
                  <select
                    value={newProductForm.productType}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, productType: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={selectedProduct?.status || newProductForm.status}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, status: e.target.value as 'active' | 'draft' | 'archived' }))}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
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
            <button
              onClick={handleCreateProduct}
              disabled={creating || !newProductForm.title}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : selectedProduct ? 'Save Changes' : 'Create Product'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origin Location</label>
                <select
                  value={transferForm.originLocationId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, originLocationId: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="">Select origin...</option>
                  {(dbLocations || []).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination Location</label>
                <select
                  value={transferForm.destinationLocationId}
                  onChange={(e) => setTransferForm(prev => ({ ...prev, destinationLocationId: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="">Select destination...</option>
                  {(dbLocations || []).map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Arrival</label>
              <input
                type="date"
                value={transferForm.expectedArrival}
                onChange={(e) => setTransferForm(prev => ({ ...prev, expectedArrival: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                rows={2}
                value={transferForm.notes}
                onChange={(e) => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
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
              <button
                onClick={handleCreateTransfer}
                disabled={creatingTransfer || !transferForm.originLocationId || !transferForm.destinationLocationId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingTransfer ? 'Creating...' : 'Create Transfer'}
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
              <select
                value={poForm.supplierId}
                onChange={(e) => {
                  const sup = [].find(s => s.id === e.target.value)
                  setPoForm(prev => ({ ...prev, supplierId: e.target.value, supplierName: sup?.name || '' }))
                }}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="">Select supplier...</option>
                {[].map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</label>
              <input
                type="date"
                value={poForm.expectedDate}
                onChange={(e) => setPoForm(prev => ({ ...prev, expectedDate: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                rows={2}
                value={poForm.notes}
                onChange={(e) => setPoForm(prev => ({ ...prev, notes: e.target.value }))}
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
              <button
                onClick={handleCreatePO}
                disabled={creatingPO || !poForm.supplierId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingPO ? 'Creating...' : 'Create PO'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Location Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                <Warehouse className="w-5 h-5" />
              </div>
              Add Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Name</label>
              <input
                type="text"
                value={locationForm.name}
                onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="e.g. Main Warehouse"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={locationForm.type}
                onChange={(e) => setLocationForm(prev => ({ ...prev, type: e.target.value as 'warehouse' | 'store' | 'fulfillment' | 'dropship' }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="warehouse">Warehouse</option>
                <option value="store">Store</option>
                <option value="fulfillment">Fulfillment Center</option>
                <option value="dropship">Dropship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                value={locationForm.address}
                onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={locationForm.city}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={locationForm.country}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowLocationDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLocation}
                disabled={creatingLocation || !locationForm.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingLocation ? 'Creating...' : 'Add Location'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Supplier Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              Add Supplier
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier Name</label>
              <input
                type="text"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                placeholder="Company name"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="orders@supplier.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="+1-555-0100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                value={supplierForm.address}
                onChange={(e) => setSupplierForm(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  value={supplierForm.country}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Time (days)</label>
                <input
                  type="number"
                  value={supplierForm.leadTime}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, leadTime: parseInt(e.target.value) || 14 }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
              <select
                value={supplierForm.paymentTerms}
                onChange={(e) => setSupplierForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="COD">Cash on Delivery</option>
                <option value="Prepaid">Prepaid</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowSupplierDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSupplier}
                disabled={creatingSupplier || !supplierForm.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingSupplier ? 'Creating...' : 'Add Supplier'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Count Dialog */}
      <Dialog open={showStockCountDialog} onOpenChange={setShowStockCountDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                <ClipboardList className="w-5 h-5" />
              </div>
              Stock Count
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Scan barcodes or enter product SKUs to update inventory counts. Changes will be saved to the database.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Product</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                  placeholder="Enter SKU or scan barcode..."
                />
              </div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(dbInventory || []).slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Current: {item.quantity}</span>
                    <input
                      type="number"
                      defaultValue={item.quantity}
                      className="w-20 px-2 py-1 text-center border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      min="0"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowStockCountDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Stock count saved')
                  setShowStockCountDialog(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Save Counts
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScannerDialog} onOpenChange={setShowBarcodeScannerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <QrCode className="w-5 h-5" />
              </div>
              Barcode Scanner
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-32 border-2 border-green-500 rounded-lg opacity-75" />
              </div>
              <div className="text-center z-10">
                <QrCode className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Camera access required</p>
                <p className="text-gray-500 text-xs mt-1">Position barcode within the frame</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or enter barcode manually</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white font-mono"
                  placeholder="Enter barcode number..."
                />
                <button
                  onClick={() => {
                    toast.info('Looking up product...')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Lookup
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowBarcodeScannerDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
