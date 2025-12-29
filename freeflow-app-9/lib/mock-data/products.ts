// Products, Inventory & E-commerce Data
// For marketplaces, inventory management, and product catalogs

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  price: number
  compareAtPrice?: number
  cost: number
  sku: string
  barcode?: string
  inventory: number
  lowStockThreshold: number
  status: 'active' | 'draft' | 'archived'
  images: string[]
  variants?: ProductVariant[]
  tags: string[]
  vendor: string
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  inventory: number
  options: Record<string, string>
}

export interface Order {
  id: string
  orderNumber: string
  customer: string
  customerId: string
  email: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  shippingMethod: string
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  variantId?: string
  variantName?: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Address {
  name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

// Products
export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'FreeFlow Pro License',
    description: 'Professional license for teams up to 10 members',
    category: 'Software',
    subcategory: 'Licenses',
    price: 79,
    cost: 0,
    sku: 'FF-PRO-001',
    inventory: 999999,
    lowStockThreshold: 0,
    status: 'active',
    images: ['/products/pro-license.png'],
    tags: ['subscription', 'team', 'popular'],
    vendor: 'FreeFlow',
    createdAt: '2024-01-01',
    updatedAt: '2025-01-28'
  },
  {
    id: 'prod-002',
    name: 'FreeFlow Business License',
    description: 'Business license for teams up to 50 members with advanced features',
    category: 'Software',
    subcategory: 'Licenses',
    price: 199,
    cost: 0,
    sku: 'FF-BUS-001',
    inventory: 999999,
    lowStockThreshold: 0,
    status: 'active',
    images: ['/products/business-license.png'],
    tags: ['subscription', 'team', 'business'],
    vendor: 'FreeFlow',
    createdAt: '2024-01-01',
    updatedAt: '2025-01-28'
  },
  {
    id: 'prod-003',
    name: 'AI Content Pack - 1000 Credits',
    description: '1000 AI content generation credits for any AI feature',
    category: 'Add-ons',
    subcategory: 'AI Credits',
    price: 49,
    cost: 15,
    sku: 'FF-AI-1K',
    inventory: 999999,
    lowStockThreshold: 0,
    status: 'active',
    images: ['/products/ai-pack.png'],
    tags: ['ai', 'credits', 'add-on'],
    vendor: 'FreeFlow',
    createdAt: '2024-06-01',
    updatedAt: '2025-01-28'
  },
  {
    id: 'prod-004',
    name: 'Premium Support Package',
    description: '24/7 priority support with dedicated account manager',
    category: 'Services',
    subcategory: 'Support',
    price: 299,
    cost: 150,
    sku: 'FF-SUP-PREM',
    inventory: 100,
    lowStockThreshold: 10,
    status: 'active',
    images: ['/products/premium-support.png'],
    tags: ['support', 'premium', 'service'],
    vendor: 'FreeFlow',
    createdAt: '2024-01-01',
    updatedAt: '2025-01-28'
  },
  {
    id: 'prod-005',
    name: 'Custom Integration Package',
    description: 'Custom API integration and development services',
    category: 'Services',
    subcategory: 'Professional Services',
    price: 5000,
    cost: 2000,
    sku: 'FF-INT-CUST',
    inventory: 50,
    lowStockThreshold: 5,
    status: 'active',
    images: ['/products/integration.png'],
    tags: ['integration', 'custom', 'enterprise'],
    vendor: 'FreeFlow',
    createdAt: '2024-03-01',
    updatedAt: '2025-01-28'
  },
  {
    id: 'prod-006',
    name: 'Training Workshop (Virtual)',
    description: '4-hour virtual training workshop for up to 20 participants',
    category: 'Services',
    subcategory: 'Training',
    price: 1500,
    cost: 500,
    sku: 'FF-TRN-VRT',
    inventory: 200,
    lowStockThreshold: 20,
    status: 'active',
    images: ['/products/training.png'],
    tags: ['training', 'workshop', 'virtual'],
    vendor: 'FreeFlow',
    createdAt: '2024-01-01',
    updatedAt: '2025-01-28'
  },
]

// Recent Orders
export const ORDERS: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-2025-0845',
    customer: 'Sarah Mitchell',
    customerId: 'cust-001',
    email: 'sarah.mitchell@spotify.com',
    status: 'delivered',
    paymentStatus: 'paid',
    items: [
      { productId: 'prod-002', productName: 'FreeFlow Business License', sku: 'FF-BUS-001', quantity: 50, unitPrice: 199, total: 9950 },
      { productId: 'prod-004', productName: 'Premium Support Package', sku: 'FF-SUP-PREM', quantity: 1, unitPrice: 299, total: 299 },
    ],
    subtotal: 10249,
    tax: 922,
    shipping: 0,
    discount: 1024,
    total: 10147,
    shippingAddress: { name: 'Sarah Mitchell', company: 'Spotify', address1: '150 Greenwich St', city: 'New York', state: 'NY', postalCode: '10007', country: 'USA' },
    billingAddress: { name: 'Sarah Mitchell', company: 'Spotify', address1: '150 Greenwich St', city: 'New York', state: 'NY', postalCode: '10007', country: 'USA' },
    shippingMethod: 'Digital Delivery',
    createdAt: '2025-01-25T10:00:00Z',
    updatedAt: '2025-01-25T10:05:00Z'
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-2025-0844',
    customer: 'James Rodriguez',
    customerId: 'cust-002',
    email: 'james.r@nike.com',
    status: 'processing',
    paymentStatus: 'paid',
    items: [
      { productId: 'prod-005', productName: 'Custom Integration Package', sku: 'FF-INT-CUST', quantity: 1, unitPrice: 5000, total: 5000 },
      { productId: 'prod-006', productName: 'Training Workshop (Virtual)', sku: 'FF-TRN-VRT', quantity: 3, unitPrice: 1500, total: 4500 },
    ],
    subtotal: 9500,
    tax: 855,
    shipping: 0,
    discount: 0,
    total: 10355,
    shippingAddress: { name: 'James Rodriguez', company: 'Nike', address1: 'One Bowerman Dr', city: 'Beaverton', state: 'OR', postalCode: '97005', country: 'USA' },
    billingAddress: { name: 'James Rodriguez', company: 'Nike', address1: 'One Bowerman Dr', city: 'Beaverton', state: 'OR', postalCode: '97005', country: 'USA' },
    shippingMethod: 'Digital Delivery',
    createdAt: '2025-01-27T14:30:00Z',
    updatedAt: '2025-01-28T09:00:00Z'
  },
  {
    id: 'ord-003',
    orderNumber: 'ORD-2025-0843',
    customer: 'Emma Thompson',
    customerId: 'cust-003',
    email: 'emma.t@shopify.com',
    status: 'confirmed',
    paymentStatus: 'paid',
    items: [
      { productId: 'prod-003', productName: 'AI Content Pack - 1000 Credits', sku: 'FF-AI-1K', quantity: 10, unitPrice: 49, total: 490 },
    ],
    subtotal: 490,
    tax: 63.70,
    shipping: 0,
    discount: 49,
    total: 504.70,
    shippingAddress: { name: 'Emma Thompson', company: 'Shopify', address1: '150 Elgin St', city: 'Ottawa', state: 'ON', postalCode: 'K2P 1L4', country: 'Canada' },
    billingAddress: { name: 'Emma Thompson', company: 'Shopify', address1: '150 Elgin St', city: 'Ottawa', state: 'ON', postalCode: 'K2P 1L4', country: 'Canada' },
    shippingMethod: 'Digital Delivery',
    createdAt: '2025-01-28T08:15:00Z',
    updatedAt: '2025-01-28T08:20:00Z'
  },
  {
    id: 'ord-004',
    orderNumber: 'ORD-2025-0842',
    customer: 'Marcus Johnson',
    customerId: 'cust-006',
    email: 'marcus@creativestudio.io',
    status: 'pending',
    paymentStatus: 'pending',
    items: [
      { productId: 'prod-001', productName: 'FreeFlow Pro License', sku: 'FF-PRO-001', quantity: 15, unitPrice: 79, total: 1185 },
    ],
    subtotal: 1185,
    tax: 106.65,
    shipping: 0,
    discount: 0,
    total: 1291.65,
    shippingAddress: { name: 'Marcus Johnson', company: 'Creative Studio NYC', address1: '123 Broadway', city: 'New York', state: 'NY', postalCode: '10012', country: 'USA' },
    billingAddress: { name: 'Marcus Johnson', company: 'Creative Studio NYC', address1: '123 Broadway', city: 'New York', state: 'NY', postalCode: '10012', country: 'USA' },
    shippingMethod: 'Digital Delivery',
    createdAt: '2025-01-28T11:00:00Z',
    updatedAt: '2025-01-28T11:00:00Z'
  },
]

// Inventory Summary
export const INVENTORY_SUMMARY = {
  totalProducts: 6,
  activeProducts: 6,
  lowStockItems: 0,
  outOfStockItems: 0,
  totalValue: 2500000,
  topSelling: [
    { product: 'FreeFlow Pro License', sold: 1245, revenue: 98355 },
    { product: 'FreeFlow Business License', sold: 489, revenue: 97311 },
    { product: 'AI Content Pack', sold: 2340, revenue: 114660 },
    { product: 'Premium Support Package', sold: 156, revenue: 46644 },
  ]
}

// Order Stats
export const ORDER_STATS = {
  totalOrders: 2847,
  pendingOrders: 23,
  processingOrders: 45,
  completedOrders: 2698,
  cancelledOrders: 81,
  averageOrderValue: 845,
  totalRevenue: 2405915,
  thisMonth: {
    orders: 312,
    revenue: 263940,
    avgOrderValue: 846
  }
}
