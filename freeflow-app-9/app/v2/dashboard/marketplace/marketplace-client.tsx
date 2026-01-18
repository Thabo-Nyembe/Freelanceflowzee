'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useCreateCoupon, useCoupons } from '@/lib/hooks/use-coupon-extended'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Store, Package, Users, Star, Download, TrendingUp, Rocket, Trophy,
  DollarSign, Search, Filter, Grid, List, Heart, ExternalLink, MoreHorizontal,
  Plus, Settings, Eye, CreditCard, Award, Shield, Zap, Tag, Percent,
  Clock, CheckCircle, XCircle,
  Layers, BarChart3, MessageSquare, Crown, Sparkles, ThumbsUp, RefreshCw, Mail, MapPin, FileText, Receipt, PieChart, Activity, Target, Megaphone, Wallet, Bell, ThumbsDown, Reply, Edit, Trash2, Copy, Code, Bitcoin, Send, AlertTriangle
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

// Supabase hooks for real marketplace data
import { useMarketplaceApps, useFeaturedApps, type MarketplaceApp } from '@/lib/hooks/use-marketplace'

// Types
type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock' | 'pending_review'
type VendorStatus = 'active' | 'pending' | 'suspended' | 'verified' | 'featured'
type PricingModel = 'free' | 'one_time' | 'subscription' | 'freemium' | 'usage_based'
type Category = 'productivity' | 'analytics' | 'marketing' | 'security' | 'collaboration' | 'design' | 'development' | 'finance' | 'communication' | 'automation'
type OrderStatus = 'pending' | 'processing' | 'completed' | 'refunded' | 'cancelled' | 'disputed'
type ReviewStatus = 'pending' | 'approved' | 'flagged' | 'hidden'

interface Product {
  id: string
  name: string
  description: string
  shortDescription: string
  vendor: Vendor
  category: Category
  subcategory: string
  price: number
  compareAtPrice?: number
  pricingModel: PricingModel
  status: ProductStatus
  images: string[]
  rating: number
  reviewCount: number
  downloads: number
  installs: number
  activeInstalls: number
  isFeatured: boolean
  isVerified: boolean
  isBestseller: boolean
  isNew: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  version: string
  compatibility: string[]
  features: string[]
  requirements: string[]
  changelog: ChangelogEntry[]
}

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

interface Vendor {
  id: string
  name: string
  logo?: string
  description: string
  website: string
  email: string
  phone?: string
  status: VendorStatus
  productCount: number
  totalSales: number
  totalRevenue: number
  rating: number
  reviewCount: number
  isVerified: boolean
  isFeatured: boolean
  joinedAt: string
  location: string
  supportEmail: string
  responseTime: string
}

interface Review {
  id: string
  productId: string
  productName: string
  author: { name: string; avatar?: string; company?: string }
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  helpful: number
  notHelpful: number
  createdAt: string
  verified: boolean
  status: ReviewStatus
  response?: { content: string; date: string }
}

interface Collection {
  id: string
  name: string
  description: string
  productCount: number
  image: string
  isFeatured: boolean
  curator: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  product: { id: string; name: string; vendor: string }
  customer: { name: string; email: string; company?: string }
  status: OrderStatus
  amount: number
  currency: string
  paymentMethod: string
  license: string
  date: string
  expiresAt?: string
  invoice?: string
}

interface SalesMetric {
  date: string
  revenue: number
  orders: number
  installs: number
  uninstalls: number
}

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_trial'
  value: number
  products: string[]
  usageLimit: number
  usedCount: number
  minPurchase?: number
  expiresAt: string
  status: 'active' | 'expired' | 'disabled'
  createdAt: string
}

interface Bundle {
  id: string
  name: string
  description: string
  products: string[]
  discount: number
  price: number
  originalPrice: number
  sales: number
  status: 'active' | 'draft'
  createdAt: string
}

interface PaymentProvider {
  id: string
  name: string
  type: 'card' | 'bank' | 'crypto' | 'wallet'
  status: 'active' | 'inactive' | 'pending'
  transactions: number
  volume: number
  fee: number
  logo: string
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  createdAt: string
  status: 'active' | 'revoked'
}

interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'failed' | 'disabled'
  lastTriggered?: string
  successRate: number
  createdAt: string
}

// Mock Data
const mockVendors: Vendor[] = [
  { id: 'v1', name: 'ProTools Inc', description: 'Enterprise productivity solutions powering 10,000+ businesses worldwide', website: 'https://protools.com', email: 'contact@protools.com', phone: '+1-555-0123', status: 'verified', productCount: 12, totalSales: 4520, totalRevenue: 245000, rating: 4.8, reviewCount: 234, isVerified: true, isFeatured: true, joinedAt: '2022-01-15', location: 'San Francisco, CA', supportEmail: 'support@protools.com', responseTime: '< 2 hours' },
  { id: 'v2', name: 'DataFlow Labs', description: 'Advanced analytics and business intelligence solutions', website: 'https://dataflow.io', email: 'hello@dataflow.io', status: 'verified', productCount: 8, totalSales: 3200, totalRevenue: 186000, rating: 4.6, reviewCount: 156, isVerified: true, isFeatured: true, joinedAt: '2022-06-20', location: 'New York, NY', supportEmail: 'help@dataflow.io', responseTime: '< 4 hours' },
  { id: 'v3', name: 'SecureStack', description: 'Enterprise security and compliance automation', website: 'https://securestack.dev', email: 'team@securestack.dev', status: 'featured', productCount: 5, totalSales: 2800, totalRevenue: 312000, rating: 4.9, reviewCount: 89, isVerified: true, isFeatured: true, joinedAt: '2023-02-10', location: 'Austin, TX', supportEmail: 'security@securestack.dev', responseTime: '< 1 hour' },
  { id: 'v4', name: 'AutomateHQ', description: 'Workflow automation and integration platform', website: 'https://automatehq.com', email: 'info@automatehq.com', status: 'active', productCount: 6, totalSales: 1890, totalRevenue: 94500, rating: 4.5, reviewCount: 78, isVerified: true, isFeatured: false, joinedAt: '2023-05-15', location: 'Seattle, WA', supportEmail: 'support@automatehq.com', responseTime: '< 6 hours' }
]

const mockProducts: Product[] = [
  {
    id: 'p1', name: 'Analytics Pro', description: 'Comprehensive analytics dashboard with real-time insights, custom reports, AI-powered predictions, and advanced data visualization.', shortDescription: 'Advanced analytics for modern businesses', vendor: mockVendors[1], category: 'analytics', subcategory: 'Business Intelligence', price: 49, compareAtPrice: 79, pricingModel: 'subscription', status: 'active', images: [], rating: 4.8, reviewCount: 234, downloads: 15420, installs: 12350, activeInstalls: 11200, isFeatured: true, isVerified: true, isBestseller: true, isNew: false, tags: ['analytics', 'dashboard', 'reporting', 'AI', 'visualization'], createdAt: '2023-06-15', updatedAt: '2024-01-10', version: '3.2.1', compatibility: ['Chrome', 'Firefox', 'Safari', 'Edge'], features: ['Real-time analytics', 'Custom dashboards', 'AI insights', 'Export to PDF/CSV', '50+ integrations'], requirements: ['Modern browser', 'Internet connection'],
    changelog: [{ version: '3.2.1', date: '2024-01-10', changes: ['Bug fixes', 'Performance improvements'] }]
  },
  {
    id: 'p2', name: 'TaskMaster', description: 'Complete project management solution with kanban boards, time tracking, team collaboration, and resource management.', shortDescription: 'Project management made simple', vendor: mockVendors[0], category: 'productivity', subcategory: 'Project Management', price: 29, pricingModel: 'subscription', status: 'active', images: [], rating: 4.6, reviewCount: 456, downloads: 28900, installs: 24500, activeInstalls: 22100, isFeatured: true, isVerified: true, isBestseller: true, isNew: false, tags: ['project management', 'kanban', 'collaboration', 'time tracking'], createdAt: '2023-03-20', updatedAt: '2024-01-12', version: '2.8.0', compatibility: ['Chrome', 'Firefox', 'Safari'], features: ['Kanban boards', 'Time tracking', 'Team chat', 'File sharing', 'Gantt charts'], requirements: ['Modern browser'],
    changelog: [{ version: '2.8.0', date: '2024-01-12', changes: ['New Gantt view', 'Improved mobile experience'] }]
  },
  {
    id: 'p3', name: 'SecureVault', description: 'Enterprise-grade security solution with end-to-end encryption, access control, audit logging, and compliance automation.', shortDescription: 'Protect your sensitive data', vendor: mockVendors[2], category: 'security', subcategory: 'Data Protection', price: 99, compareAtPrice: 149, pricingModel: 'subscription', status: 'active', images: [], rating: 4.9, reviewCount: 89, downloads: 8500, installs: 7200, activeInstalls: 6800, isFeatured: false, isVerified: true, isBestseller: false, isNew: false, tags: ['security', 'encryption', 'compliance', 'audit'], createdAt: '2023-09-01', updatedAt: '2024-01-08', version: '1.5.2', compatibility: ['All browsers'], features: ['End-to-end encryption', 'Access control', 'Audit logs', 'Compliance reports', 'SSO integration'], requirements: ['Enterprise plan'],
    changelog: [{ version: '1.5.2', date: '2024-01-08', changes: ['SOC2 compliance updates'] }]
  },
  {
    id: 'p4', name: 'FormBuilder Pro', description: 'Drag-and-drop form builder with conditional logic, payment integrations, and advanced analytics.', shortDescription: 'Build forms in minutes', vendor: mockVendors[0], category: 'productivity', subcategory: 'Forms', price: 0, pricingModel: 'freemium', status: 'active', images: [], rating: 4.5, reviewCount: 678, downloads: 45200, installs: 38900, activeInstalls: 35000, isFeatured: false, isVerified: true, isBestseller: true, isNew: false, tags: ['forms', 'surveys', 'no-code', 'payments'], createdAt: '2022-11-10', updatedAt: '2024-01-05', version: '4.1.0', compatibility: ['All browsers'], features: ['Drag-and-drop builder', 'Conditional logic', '50+ integrations', 'Payment collection', 'Analytics'], requirements: ['None'],
    changelog: [{ version: '4.1.0', date: '2024-01-05', changes: ['Stripe integration', 'New templates'] }]
  },
  {
    id: 'p5', name: 'Email Automator', description: 'Automated email marketing with templates, A/B testing, scheduling, and performance analytics.', shortDescription: 'Automate your email campaigns', vendor: mockVendors[1], category: 'marketing', subcategory: 'Email Marketing', price: 39, pricingModel: 'subscription', status: 'active', images: [], rating: 4.4, reviewCount: 312, downloads: 18700, installs: 15400, activeInstalls: 14200, isFeatured: true, isVerified: true, isBestseller: false, isNew: false, tags: ['email', 'automation', 'marketing', 'templates'], createdAt: '2023-05-25', updatedAt: '2024-01-11', version: '2.3.0', compatibility: ['Chrome', 'Firefox', 'Safari'], features: ['Email templates', 'A/B testing', 'Analytics', 'Segmentation', 'Drip campaigns'], requirements: ['Email list'],
    changelog: [{ version: '2.3.0', date: '2024-01-11', changes: ['AI subject line generator'] }]
  },
  {
    id: 'p6', name: 'WorkflowBot', description: 'AI-powered workflow automation with 500+ integrations, custom triggers, and advanced logic.', shortDescription: 'Automate anything', vendor: mockVendors[3], category: 'automation', subcategory: 'Workflow', price: 59, pricingModel: 'subscription', status: 'active', images: [], rating: 4.7, reviewCount: 145, downloads: 12800, installs: 10200, activeInstalls: 9500, isFeatured: true, isVerified: true, isBestseller: false, isNew: true, tags: ['automation', 'workflow', 'integrations', 'AI'], createdAt: '2024-01-01', updatedAt: '2024-01-15', version: '1.0.0', compatibility: ['All platforms'], features: ['500+ integrations', 'Custom triggers', 'AI actions', 'Team collaboration', 'Version control'], requirements: ['API access'],
    changelog: [{ version: '1.0.0', date: '2024-01-01', changes: ['Initial release'] }]
  }
]

const mockCollections: Collection[] = [
  { id: 'c1', name: 'Staff Picks', description: 'Hand-selected by our team for exceptional quality', productCount: 12, image: '', isFeatured: true, curator: 'Editorial Team', createdAt: '2024-01-01' },
  { id: 'c2', name: 'New This Week', description: 'Fresh additions to the marketplace', productCount: 8, image: '', isFeatured: true, curator: 'System', createdAt: '2024-01-15' },
  { id: 'c3', name: 'Essential Tools', description: 'Must-have apps for every business', productCount: 15, image: '', isFeatured: true, curator: 'Editorial Team', createdAt: '2023-12-01' },
  { id: 'c4', name: 'Top Free Apps', description: 'Best free tools available', productCount: 20, image: '', isFeatured: false, curator: 'System', createdAt: '2024-01-10' },
  { id: 'c5', name: 'Enterprise Solutions', description: 'Built for scale and security', productCount: 10, image: '', isFeatured: true, curator: 'Enterprise Team', createdAt: '2023-11-15' },
  { id: 'c6', name: 'AI & Automation', description: 'Smart tools powered by AI', productCount: 18, image: '', isFeatured: true, curator: 'AI Team', createdAt: '2024-01-08' }
]

const mockReviews: Review[] = [
  { id: 'r1', productId: 'p1', productName: 'Analytics Pro', author: { name: 'John Davidson', company: 'TechCorp' }, rating: 5, title: 'Excellent analytics tool!', content: 'This has transformed how we track our business metrics. The AI insights are surprisingly accurate and have helped us identify trends we would have missed.', pros: ['Easy to use', 'Great visualizations', 'Accurate AI predictions'], cons: ['Steep learning curve initially'], helpful: 45, notHelpful: 2, createdAt: '2024-01-10', verified: true, status: 'approved', response: { content: 'Thank you for the wonderful review! We\'re glad the AI insights are helping your team.', date: '2024-01-11' } },
  { id: 'r2', productId: 'p1', productName: 'Analytics Pro', author: { name: 'Sarah Miller' }, rating: 4, title: 'Great features, minor bugs', content: 'Love the dashboard customization. Had some issues with exports but support was helpful and responsive.', pros: ['Customizable dashboards', 'Great support'], cons: ['Export bugs', 'Occasional slow loading'], helpful: 23, notHelpful: 1, createdAt: '2024-01-08', verified: true, status: 'approved' },
  { id: 'r3', productId: 'p2', productName: 'TaskMaster', author: { name: 'Mike Roberts', company: 'StartupXYZ' }, rating: 5, title: 'Best project management tool', content: 'We switched from competitors and never looked back. The kanban feature is amazing and the mobile app works flawlessly.', pros: ['Intuitive UI', 'Great mobile app', 'Excellent integrations'], cons: [], helpful: 67, notHelpful: 3, createdAt: '2024-01-05', verified: true, status: 'approved' },
  { id: 'r4', productId: 'p3', productName: 'SecureVault', author: { name: 'Emily Chen', company: 'FinanceHub' }, rating: 5, title: 'Essential for compliance', content: 'The compliance reporting alone is worth the price. Passed our SOC2 audit with flying colors thanks to SecureVault.', pros: ['Compliance ready', 'Excellent documentation', 'Fast support'], cons: ['Premium pricing'], helpful: 34, notHelpful: 0, createdAt: '2024-01-03', verified: true, status: 'approved' },
  { id: 'r5', productId: 'p4', productName: 'FormBuilder Pro', author: { name: 'Alex Thompson' }, rating: 4, title: 'Great free tier', content: 'The free tier is generous enough for small businesses. Upgraded to pro for payment collection and it\'s been smooth.', pros: ['Generous free tier', 'Easy to use', 'Good templates'], cons: ['Limited conditional logic on free plan'], helpful: 89, notHelpful: 5, createdAt: '2024-01-01', verified: true, status: 'approved' }
]

const mockOrders: Order[] = [
  { id: 'o1', orderNumber: 'ORD-2024-001234', product: { id: 'p1', name: 'Analytics Pro', vendor: 'DataFlow Labs' }, customer: { name: 'Acme Corp', email: 'billing@acme.com', company: 'Acme Corporation' }, status: 'completed', amount: 49, currency: 'USD', paymentMethod: 'Credit Card', license: 'LIC-APR-001234', date: '2024-01-15', expiresAt: '2025-01-15', invoice: 'INV-001234' },
  { id: 'o2', orderNumber: 'ORD-2024-001235', product: { id: 'p2', name: 'TaskMaster', vendor: 'ProTools Inc' }, customer: { name: 'Tech Solutions', email: 'finance@techsol.io' }, status: 'completed', amount: 29, currency: 'USD', paymentMethod: 'PayPal', license: 'LIC-TM-001235', date: '2024-01-14', expiresAt: '2025-01-14', invoice: 'INV-001235' },
  { id: 'o3', orderNumber: 'ORD-2024-001236', product: { id: 'p3', name: 'SecureVault', vendor: 'SecureStack' }, customer: { name: 'FinanceHub Ltd', email: 'accounts@finhub.com', company: 'FinanceHub Ltd' }, status: 'processing', amount: 99, currency: 'USD', paymentMethod: 'Wire Transfer', license: 'Pending', date: '2024-01-16' },
  { id: 'o4', orderNumber: 'ORD-2024-001230', product: { id: 'p5', name: 'Email Automator', vendor: 'DataFlow Labs' }, customer: { name: 'Marketing Pro', email: 'team@marketpro.co' }, status: 'refunded', amount: 39, currency: 'USD', paymentMethod: 'Credit Card', license: 'Revoked', date: '2024-01-10', invoice: 'INV-001230' },
  { id: 'o5', orderNumber: 'ORD-2024-001237', product: { id: 'p6', name: 'WorkflowBot', vendor: 'AutomateHQ' }, customer: { name: 'Startup Inc', email: 'hello@startup.io' }, status: 'pending', amount: 59, currency: 'USD', paymentMethod: 'Credit Card', license: 'Pending', date: '2024-01-16' }
]

const mockCoupons: Coupon[] = [
  { id: 'c1', code: 'WELCOME20', type: 'percentage', value: 20, products: ['all'], usageLimit: 500, usedCount: 234, minPurchase: 29, expiresAt: '2024-03-31', status: 'active', createdAt: '2024-01-01' },
  { id: 'c2', code: 'SUMMER50', type: 'fixed', value: 50, products: ['p1', 'p2', 'p3'], usageLimit: 100, usedCount: 67, minPurchase: 99, expiresAt: '2024-06-30', status: 'active', createdAt: '2024-01-10' },
  { id: 'c3', code: 'FREETRIAL', type: 'free_trial', value: 14, products: ['all'], usageLimit: 1000, usedCount: 456, expiresAt: '2024-12-31', status: 'active', createdAt: '2024-01-01' },
  { id: 'c4', code: 'NEWYEAR25', type: 'percentage', value: 25, products: ['all'], usageLimit: 200, usedCount: 200, expiresAt: '2024-01-31', status: 'expired', createdAt: '2023-12-25' }
]

const mockBundles: Bundle[] = [
  { id: 'b1', name: 'Productivity Suite', description: 'Complete productivity toolkit including TaskMaster, FormBuilder Pro, and Email Automator', products: ['p2', 'p4', 'p5'], discount: 30, price: 59, originalPrice: 84, sales: 156, status: 'active', createdAt: '2024-01-01' },
  { id: 'b2', name: 'Analytics Bundle', description: 'Full analytics stack with Analytics Pro and WorkflowBot', products: ['p1', 'p6'], discount: 25, price: 81, originalPrice: 108, sales: 89, status: 'active', createdAt: '2024-01-05' },
  { id: 'b3', name: 'Enterprise Security Pack', description: 'Comprehensive security solution for enterprise customers', products: ['p3'], discount: 15, price: 84, originalPrice: 99, sales: 34, status: 'draft', createdAt: '2024-01-10' }
]

const mockPaymentProviders: PaymentProvider[] = [
  { id: 'pp1', name: 'Stripe', type: 'card', status: 'active', transactions: 4560, volume: 342000, fee: 2.9, logo: 'stripe' },
  { id: 'pp2', name: 'PayPal', type: 'wallet', status: 'active', transactions: 2340, volume: 186000, fee: 3.49, logo: 'paypal' },
  { id: 'pp3', name: 'Apple Pay', type: 'wallet', status: 'active', transactions: 890, volume: 67000, fee: 2.9, logo: 'apple' },
  { id: 'pp4', name: 'Wire Transfer', type: 'bank', status: 'active', transactions: 45, volume: 156000, fee: 0.5, logo: 'bank' },
  { id: 'pp5', name: 'Crypto (ETH/BTC)', type: 'crypto', status: 'pending', transactions: 0, volume: 0, fee: 1.0, logo: 'crypto' }
]

const mockAPIKeys: APIKey[] = [
  { id: 'ak1', name: 'Production API', key: 'STRIPE_KEY_PLACEHOLDER', permissions: ['read', 'write', 'delete'], lastUsed: '2024-01-16 09:23', createdAt: '2023-06-15', status: 'active' },
  { id: 'ak2', name: 'Staging API', key: 'sk_test_xxxxxxxxxxxxxxxx', permissions: ['read', 'write'], lastUsed: '2024-01-15 14:45', createdAt: '2023-08-20', status: 'active' },
  { id: 'ak3', name: 'Analytics Integration', key: 'STRIPE_KEY_PLACEHOLDER', permissions: ['read'], lastUsed: '2024-01-16 08:00', createdAt: '2024-01-01', status: 'active' },
  { id: 'ak4', name: 'Old Mobile App', key: 'STRIPE_KEY_PLACEHOLDER', permissions: ['read'], lastUsed: '2023-11-30', createdAt: '2022-03-10', status: 'revoked' }
]

const mockWebhooks: Webhook[] = [
  { id: 'wh1', url: 'https://api.acme.com/webhooks/marketplace', events: ['order.created', 'order.completed', 'review.created'], status: 'active', lastTriggered: '2024-01-16 09:15', successRate: 99.8, createdAt: '2023-06-01' },
  { id: 'wh2', url: 'https://hooks.slack.com/services/xxx', events: ['order.created', 'review.flagged'], status: 'active', lastTriggered: '2024-01-16 09:23', successRate: 100, createdAt: '2023-08-15' },
  { id: 'wh3', url: 'https://analytics.internal.io/ingest', events: ['install', 'uninstall', 'usage'], status: 'failed', lastTriggered: '2024-01-14 23:45', successRate: 78.5, createdAt: '2024-01-01' }
]

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Shopify App Store Level
// ============================================================================

const mockMarketplaceAIInsights = [
  { id: '1', type: 'success' as const, title: 'Top Seller', description: 'Your product "Analytics Pro" has reached 10K+ installs. Featured badge earned!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Review Alert', description: '2 negative reviews received today. Response recommended within 24h.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Reviews' },
  { id: '3', type: 'info' as const, title: 'Market Trend', description: 'AI-powered tools are trending. Consider adding AI features to boost visibility.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Trends' },
]

const mockMarketplaceCollaborators = [
  { id: '1', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'online' as const, role: 'Developer' },
  { id: '3', name: 'Support Lead', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockMarketplacePredictions = [
  { id: '1', title: 'Revenue Forecast', prediction: 'Marketplace revenue expected to grow 25% next quarter', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Install Growth', prediction: 'New products could reach 5K installs in first month', confidence: 78, trend: 'up' as const, impact: 'medium' as const },
]

const mockMarketplaceActivities = [
  { id: '1', user: 'Customer', action: 'Purchased', target: 'Pro Analytics subscription', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Product Manager', action: 'Published', target: 'New version 2.5.0', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Support', action: 'Resolved', target: 'Customer support ticket #4521', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are now defined inside the component to access state setters

export default function MarketplaceClient() {


  const [activeTab, setActiveTab] = useState('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [selectedPricing, setSelectedPricing] = useState<PricingModel | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [wishlist, setWishlist] = useState<string[]>(['p1', 'p3'])
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showCouponDialog, setShowCouponDialog] = useState(false)
  const [showBundleDialog, setShowBundleDialog] = useState(false)
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [analyticsTab, setAnalyticsTab] = useState('overview')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCouponEditor, setShowCouponEditor] = useState<string | null>(null)

  // New listing, checkout, contact, and cart state
  const [showNewListingDialog, setShowNewListingDialog] = useState(false)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [cart, setCart] = useState<Product[]>([])
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null)
  const [contactProduct, setContactProduct] = useState<Product | null>(null)

  // New dialog states for buttons without onClick handlers
  const [showWishlistDialog, setShowWishlistDialog] = useState(false)
  const [showInstallDialog, setShowInstallDialog] = useState(false)
  const [installProduct, setInstallProduct] = useState<Product | null>(null)
  const [showLearnMoreDialog, setShowLearnMoreDialog] = useState(false)
  const [showVisitStoreDialog, setShowVisitStoreDialog] = useState(false)
  const [showFollowDialog, setShowFollowDialog] = useState(false)
  const [showApplyVendorDialog, setShowApplyVendorDialog] = useState(false)
  const [showExportReviewsDialog, setShowExportReviewsDialog] = useState(false)
  const [showRespondAllDialog, setShowRespondAllDialog] = useState(false)
  const [showExportOrdersDialog, setShowExportOrdersDialog] = useState(false)
  const [showGenerateReportDialog, setShowGenerateReportDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showMoreOptionsDialog, setShowMoreOptionsDialog] = useState(false)
  const [selectedOrderForOptions, setSelectedOrderForOptions] = useState<Order | null>(null)
  const [showProcessOrdersDialog, setShowProcessOrdersDialog] = useState(false)
  const [showGenerateInvoicesDialog, setShowGenerateInvoicesDialog] = useState(false)
  const [showProcessPayoutsDialog, setShowProcessPayoutsDialog] = useState(false)
  const [showSendNotificationsDialog, setShowSendNotificationsDialog] = useState(false)
  const [showExportCSVDialog, setShowExportCSVDialog] = useState(false)
  const [showAddProviderDialog, setShowAddProviderDialog] = useState(false)
  const [showDownloadInvoiceDialog, setShowDownloadInvoiceDialog] = useState(false)
  const [showVendorStoreDialog, setShowVendorStoreDialog] = useState(false)
  const [selectedVendorForStore, setSelectedVendorForStore] = useState<Vendor | null>(null)

  // Database state
  const [dbApps, setDbApps] = useState<any[]>([])
  const [dbWebhooks, setDbWebhooks] = useState<any[]>([])
  const [dbApiKeys, setDbApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Database integration
  const { create: createCouponMutation, isLoading: creatingCoupon } = useCreateCoupon()
  const { data: dbCoupons, refresh: refreshCoupons } = useCoupons()

  // Supabase hooks for real marketplace data
  const { apps: dbMarketplaceApps, loading: loadingApps } = useMarketplaceApps({ status: 'published' })
  const { featuredApps: dbFeaturedApps } = useFeaturedApps()

  // Map database marketplace apps to Product format
  const activeProducts: Product[] = useMemo(() => {
    if (dbMarketplaceApps && dbMarketplaceApps.length > 0) {
      return dbMarketplaceApps.map((app: MarketplaceApp) => {
        // Create a default vendor object
        const defaultVendor: Vendor = {
          id: app.user_id,
          name: app.developer_name || 'Unknown Developer',
          description: '',
          website: app.developer_website || '',
          email: app.developer_email || '',
          status: app.developer_verified ? 'verified' : 'active',
          productCount: 1,
          totalSales: 0,
          totalRevenue: 0,
          rating: app.average_rating,
          reviewCount: app.total_reviews,
          isVerified: app.developer_verified,
          isPartner: false,
          partnerLevel: undefined,
          joinedAt: app.created_at,
          location: '',
          categories: [app.category]
        }

        const statusMap: Record<string, ProductStatus> = {
          'published': 'active',
          'pending': 'pending_review',
          'rejected': 'archived',
          'suspended': 'archived',
          'archived': 'archived',
          'approved': 'active'
        }

        const pricingMap: Record<string, PricingModel> = {
          'free': 'free',
          'freemium': 'freemium',
          'paid': 'one_time',
          'subscription': 'subscription',
          'usage_based': 'usage_based'
        }

        return {
          id: app.id,
          name: app.app_name,
          description: app.description || '',
          shortDescription: app.short_description || '',
          vendor: defaultVendor,
          category: app.category as Category,
          subcategory: app.subcategory || '',
          price: app.price || 0,
          pricingModel: pricingMap[app.pricing_model] || 'free',
          status: statusMap[app.status] || 'active',
          images: app.screenshots || [],
          rating: app.average_rating,
          reviewCount: app.total_reviews,
          downloads: app.total_downloads,
          installs: app.total_installs,
          activeInstalls: app.total_installs,
          isFeatured: app.is_featured,
          isVerified: app.is_verified,
          isBestseller: app.total_downloads > 1000,
          isNew: new Date(app.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
          tags: app.tags || [],
          createdAt: app.created_at,
          updatedAt: app.updated_at,
          version: app.version || '1.0.0',
          compatibility: [],
          features: [],
          requirements: app.permissions || [],
          changelog: []
        } as Product
      })
    }
    return mockProducts
  }, [dbMarketplaceApps])

  // Form state for marketplace coupon
  const [marketplaceCouponForm, setMarketplaceCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'free_trial',
    value: '',
    usageLimit: '',
    minPurchase: '',
    expiresAt: '',
    applicableProducts: 'all'
  })

  // Form state for bundle
  const [bundleForm, setBundleForm] = useState({
    name: '', description: '', products: [] as string[], discount: '', price: ''
  })

  // Form state for API key
  const [apiKeyForm, setApiKeyForm] = useState({
    name: '', permissions: ['read'] as string[], expiration: 'never'
  })

  // Form state for webhook
  const [webhookForm, setWebhookForm] = useState({
    url: '', events: [] as string[], secret: ''
  })

  // Fetch webhooks from Supabase
  const fetchWebhooks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.from('webhooks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      setDbWebhooks(data || [])
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    }
  }, [])

  // Fetch API keys from Supabase
  const fetchApiKeys = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      setDbApiKeys(data || [])
    } catch (error) {
      console.error('Error fetching API keys:', error)
    }
  }, [])

  // Fetch marketplace apps from Supabase
  const fetchMarketplaceApps = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('marketplace_apps').select('*').eq('status', 'published').order('total_downloads', { ascending: false })
      if (error) throw error
      setDbApps(data || [])
    } catch (error) {
      console.error('Error fetching marketplace apps:', error)
    }
  }, [])

  useEffect(() => {
    fetchWebhooks()
    fetchApiKeys()
    fetchMarketplaceApps()
  }, [fetchWebhooks, fetchApiKeys, fetchMarketplaceApps])

  const handleCreateMarketplaceCoupon = async () => {
    if (!marketplaceCouponForm.code || !marketplaceCouponForm.value) {
      toast.error('Please enter coupon code and value')
      return
    }

    try {
      await createCouponMutation({
        code: marketplaceCouponForm.code.toUpperCase(),
        name: `Marketplace Coupon - ${marketplaceCouponForm.code}`,
        discount_type: marketplaceCouponForm.discountType === 'percentage' ? 'percent_off' : 'amount_off',
        discount_value: parseFloat(marketplaceCouponForm.value),
        max_redemptions: marketplaceCouponForm.usageLimit ? parseInt(marketplaceCouponForm.usageLimit) : null,
        min_purchase: marketplaceCouponForm.minPurchase ? parseFloat(marketplaceCouponForm.minPurchase) : 0,
        expires_at: marketplaceCouponForm.expiresAt || null,
        is_active: true,
        duration: 'once',
        times_redeemed: 0
      })

      toast.success('Coupon created successfully!')
      setShowCouponDialog(false)
      setMarketplaceCouponForm({
        code: '',
        discountType: 'percentage',
        value: '',
        usageLimit: '',
        minPurchase: '',
        expiresAt: '',
        applicableProducts: 'all'
      })
      refreshCoupons()
    } catch (error) {
      toast.error('Failed to create coupon')
      console.error(error)
    }
  }

  // Create API key handler
  const handleCreateApiKey = async () => {
    if (!apiKeyForm.name) {
      toast.error('Please enter a key name')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Please sign in'); return }
      const keyPrefix = 'mk_' + Math.random().toString(36).substring(2, 8)
      const keyHash = 'hashed_' + Math.random().toString(36).substring(2, 20)
      const expiresAt = apiKeyForm.expiration === 'never' ? null : new Date(Date.now() + parseInt(apiKeyForm.expiration) * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase.from('api_keys').insert({
        user_id: user.id, name: apiKeyForm.name, key_prefix: keyPrefix, key_hash: keyHash,
        scopes: apiKeyForm.permissions, expires_at: expiresAt, is_active: true
      })
      if (error) throw error
      toast.success('API key created!')
      setShowAPIKeyDialog(false)
      setApiKeyForm({ name: '', permissions: ['read'], expiration: 'never' })
      fetchApiKeys()
    } catch (error) {
      toast.error('Failed to create API key')
      console.error(error)
    } finally { setIsSubmitting(false) }
  }

  // Delete API key handler
  const handleDeleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id)
      if (error) throw error
      toast.success('API key deleted')
      fetchApiKeys()
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  // Create webhook handler
  const handleCreateWebhook = async () => {
    if (!webhookForm.url || webhookForm.events.length === 0) {
      toast.error('Please enter URL and select events')
      return
    }
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Please sign in'); return }

      const { error } = await supabase.from('webhooks').insert({
        user_id: user.id, name: `Webhook ${webhookForm.url.split('/').pop()}`,
        url: webhookForm.url, secret: webhookForm.secret || null, events: webhookForm.events, is_active: true
      })
      if (error) throw error
      toast.success('Webhook created!')
      setShowWebhookDialog(false)
      setWebhookForm({ url: '', events: [], secret: '' })
      fetchWebhooks()
    } catch (error) {
      toast.error('Failed to create webhook')
      console.error(error)
    } finally { setIsSubmitting(false) }
  }

  // Delete webhook handler
  const handleDeleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from('webhooks').delete().eq('id', id)
      if (error) throw error
      toast.success('Webhook deleted')
      fetchWebhooks()
    } catch (error) {
      toast.error('Failed to delete webhook')
    }
  }

  // Toggle webhook event selection
  const toggleWebhookEvent = (event: string) => {
    setWebhookForm(prev => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter(e => e !== event) : [...prev.events, event]
    }))
  }

  // Toggle API key permission
  const toggleApiKeyPermission = (perm: string) => {
    setApiKeyForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
    }))
  }

  // Use real products when available, fallback to mock
  const filteredProducts = useMemo(() => {
    return activeProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesPricing = selectedPricing === 'all' || product.pricingModel === selectedPricing
      return matchesSearch && matchesCategory && matchesPricing && product.status === 'active'
    })
  }, [activeProducts, searchQuery, selectedCategory, selectedPricing])

  // Stats - use real data when available
  const stats = useMemo(() => ({
    totalProducts: activeProducts.length,
    totalVendors: mockVendors.length,
    totalDownloads: activeProducts.reduce((sum, p) => sum + p.downloads, 0),
    totalInstalls: activeProducts.reduce((sum, p) => sum + p.activeInstalls, 0),
    avgRating: activeProducts.length > 0 ? (activeProducts.reduce((sum, p) => sum + p.rating, 0) / activeProducts.length).toFixed(1) : '0',
    totalRevenue: mockVendors.reduce((sum, v) => sum + v.totalRevenue, 0),
    totalReviews: mockReviews.length,
    pendingOrders: mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length
  }), [activeProducts])

  const statsCards = [
    { label: 'Total Apps', value: stats.totalProducts.toString(), icon: Package, color: 'from-violet-500 to-violet-600', trend: '+12%' },
    { label: 'Vendors', value: stats.totalVendors.toString(), icon: Users, color: 'from-purple-500 to-purple-600', trend: '+5%' },
    { label: 'Downloads', value: `${(stats.totalDownloads / 1000).toFixed(0)}K`, icon: Download, color: 'from-blue-500 to-blue-600', trend: '+23%' },
    { label: 'Active Installs', value: `${(stats.totalInstalls / 1000).toFixed(0)}K`, icon: Zap, color: 'from-green-500 to-green-600', trend: '+18%' },
    { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'from-amber-500 to-amber-600', trend: '+0.2' },
    { label: 'Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', trend: '+31%' },
    { label: 'Reviews', value: stats.totalReviews.toString(), icon: MessageSquare, color: 'from-pink-500 to-pink-600', trend: '+8' },
    { label: 'Pending', value: stats.pendingOrders.toString(), icon: Clock, color: 'from-orange-500 to-orange-600', trend: '' }
  ]

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  const getCategoryIcon = (category: Category) => {
    const icons: Record<Category, JSX.Element> = {
      productivity: <Zap className="w-4 h-4" />, analytics: <BarChart3 className="w-4 h-4" />,
      marketing: <Megaphone className="w-4 h-4" />, security: <Shield className="w-4 h-4" />,
      collaboration: <Users className="w-4 h-4" />, design: <Layers className="w-4 h-4" />,
      development: <Code className="w-4 h-4" />, finance: <Wallet className="w-4 h-4" />,
      communication: <MessageSquare className="w-4 h-4" />, automation: <RefreshCw className="w-4 h-4" />
    }
    return icons[category] || <Package className="w-4 h-4" />
  }

  const getCategoryColor = (category: Category): string => {
    const colors: Record<Category, string> = {
      productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      analytics: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      marketing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      collaboration: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      design: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      development: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      communication: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      automation: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const getStatusColor = (status: OrderStatus | ReviewStatus): string => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
      disputed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      flagged: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      hidden: 'bg-gray-100 text-gray-700 dark:bg-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const formatPrice = (price: number, model: PricingModel): string => {
    if (model === 'free') return 'Free'
    if (model === 'freemium') return 'Free+'
    if (model === 'usage_based') return 'Usage-based'
    if (model === 'one_time') return `$${price}`
    return `$${price}/mo`
  }

  // Handlers
  const handleAddToWishlist = (product: Product) => {
    toast.success(product.name + ' added to your wishlist')
    setWishlist(prev => [...prev, product.id])
  }

  const handleRemoveFromWishlist = (product: Product) => {
    toast.success(product.name + ' removed from your wishlist')
    setWishlist(prev => prev.filter(id => id !== product.id))
  }

  const handlePurchaseProduct = (product: Product) => {
    setCheckoutProduct(product)
    setShowCheckoutDialog(true)
  }

  const handleSubmitReview = (product: Product) => {
    toast.success('Review submitted')
    setShowReviewDialog(false)
  }

  const handleContactSeller = (product: Product) => {
    setContactProduct(product)
    setShowContactDialog(true)
  }

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const isAlreadyInCart = prev.some(p => p.id === product.id)
      if (isAlreadyInCart) {
        toast.info(product.name + ' is already in your cart')
        return prev
      }
      toast.success(product.name + ' has been added to your cart')
      return [...prev, product]
    })
  }

  const handleRemoveFromCart = (product: Product) => {
    setCart(prev => prev.filter(p => p.id !== product.id))
    toast.success(product.name + ' has been removed from your cart')
  }

  // Quick actions defined inside component to access state setters
  const marketplaceQuickActions = [
    { id: '1', label: 'Add Product', icon: 'plus', action: () => setShowNewListingDialog(true), variant: 'default' as const },
    { id: '2', label: 'View Analytics', icon: 'chart', action: () => { setAnalyticsTab('overview'); setActiveTab('analytics') }, variant: 'default' as const },
    { id: '3', label: 'Manage Reviews', icon: 'message', action: () => setActiveTab('reviews'), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Marketplace</h1>
              <p className="text-gray-500 dark:text-gray-400">Shopify App Store level marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search apps..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowWishlistDialog(true)}><Heart className="h-4 w-4 mr-2" />Wishlist ({wishlist.length})</Button>
            <Button onClick={() => setShowNewListingDialog(true)} className="bg-gradient-to-r from-violet-600 to-purple-600"><Plus className="h-4 w-4 mr-2" />Submit App</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      {stat.trend && <span className="text-xs text-green-600">{stat.trend}</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="browse" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Store className="h-4 w-4 mr-2" />Browse</TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Sparkles className="h-4 w-4 mr-2" />Featured</TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Layers className="h-4 w-4 mr-2" />Collections</TabsTrigger>
            <TabsTrigger value="vendors" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Users className="h-4 w-4 mr-2" />Vendors</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><MessageSquare className="h-4 w-4 mr-2" />Reviews</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Receipt className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6 space-y-6">
            {/* Marketplace Stats Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Marketplace Hub</h2>
                  <p className="text-violet-200">Discover apps to supercharge your workflow</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{activeProducts.length}</div>
                    <p className="text-violet-200 text-sm">Total Apps</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-violet-200 text-sm">Installed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">4.8</div>
                    <p className="text-violet-200 text-sm">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Productivity', icon: Zap, count: 24, color: 'bg-blue-100 text-blue-600' },
                { name: 'Analytics', icon: BarChart3, count: 18, color: 'bg-green-100 text-green-600' },
                { name: 'Marketing', icon: Megaphone, count: 15, color: 'bg-orange-100 text-orange-600' },
                { name: 'Security', icon: Shield, count: 12, color: 'bg-red-100 text-red-600' },
                { name: 'Automation', icon: RefreshCw, count: 20, color: 'bg-purple-100 text-purple-600' },
                { name: 'Development', icon: Code, count: 22, color: 'bg-cyan-100 text-cyan-600' },
              ].map((cat) => (
                <button key={cat.name} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all text-left">
                  <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.count} apps</p>
                </button>
              ))}
            </div>

            {/* Trending Apps */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  Trending This Week
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setCurrentPage(1)
                  setSelectedCategory('all')
                  toast.success('All apps loaded')
                }}>View All</Button>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {activeProducts.slice(0, 5).map((product, idx) => (
                    <div key={product.id} className="flex-shrink-0 w-48 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-violet-600">#{idx + 1}</span>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white mb-1">{product.name}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{product.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{product.downloads.toLocaleString()} installs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4" /></Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
                  </div>
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as Category | 'all')}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPricing} onValueChange={(v) => setSelectedPricing(v as PricingModel | 'all')}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Pricing" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pricing</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="one_time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <span className="text-sm text-gray-500">{filteredProducts.length} apps found</span>
                </div>
              </CardContent>
            </Card>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
              {filteredProducts.map(product => (
                <Card key={product.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow group">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-t-lg flex items-center justify-center relative">
                      <Package className="w-12 h-12 text-violet-300" />
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-gray-800/80" onClick={() => toggleWishlist(product.id)}>
                        <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      {product.isNew && <Badge className="absolute top-2 left-2 bg-green-500 text-white">New</Badge>}
                      {product.isFeatured && <Badge className="absolute top-2 left-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white"><Sparkles className="h-3 w-3 mr-1" />Featured</Badge>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold line-clamp-1">{product.name}</h4>
                        {product.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">by {product.vendor.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{product.shortDescription}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getCategoryColor(product.category)}>{getCategoryIcon(product.category)}<span className="ml-1">{product.category}</span></Badge>
                        {product.isBestseller && <Badge className="bg-orange-100 text-orange-700">Bestseller</Badge>}
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{product.rating} ({product.reviewCount})</span>
                        <span className="flex items-center gap-1 text-gray-500"><Download className="h-4 w-4" />{(product.downloads / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-lg font-bold text-violet-600">{formatPrice(product.price, product.pricingModel)}</p>
                        <Button size="sm" onClick={() => { setSelectedProduct(product); setShowProductDialog(true) }}><Eye className="h-4 w-4 mr-1" />View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Featured Tab */}
          <TabsContent value="featured" className="mt-6 space-y-8">
            {/* Editor's Pick Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-8 w-8" />
                <div>
                  <h2 className="text-xl font-bold">Editor's Choice Apps</h2>
                  <p className="text-amber-100 text-sm">Handpicked by our expert team for exceptional quality</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-amber-100">Featured Apps</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-amber-100">Avg Rating</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">156K</p>
                  <p className="text-sm text-amber-100">Total Installs</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-amber-100">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Featured Spotlight */}
            <Card className="border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-8 flex flex-col justify-center">
                  <Badge className="w-fit bg-white/20 text-white mb-4"><Zap className="h-3 w-3 mr-1" />App of the Week</Badge>
                  <h2 className="text-2xl font-bold text-white mb-2">Analytics Pro Suite</h2>
                  <p className="text-violet-200 mb-4">The most comprehensive analytics solution for growing businesses. Track, analyze, and optimize your entire operation.</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}</div>
                    <span className="text-white">4.9 (2,847 reviews)</span>
                  </div>
                  <div className="flex gap-3">
                    <Button className="bg-white text-violet-600 hover:bg-violet-50" onClick={() => { setInstallProduct(activeProducts[0]); setShowInstallDialog(true) }}><Download className="h-4 w-4 mr-2" />Install Now</Button>
                    <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => setShowLearnMoreDialog(true)}>Learn More</Button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-semibold mb-4">Key Features</h3>
                  <div className="space-y-3">
                    {['Real-time dashboard with 50+ metrics', 'AI-powered insights and predictions', 'Custom report builder', 'Team collaboration tools', 'API access & webhooks', '24/7 priority support'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Starting at</p>
                        <p className="text-2xl font-bold">$49<span className="text-sm font-normal text-gray-500">/month</span></p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">14-day free trial</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Featured Apps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeProducts.filter(p => p.isFeatured).map(product => (
                <Card key={product.id} className="border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 h-40 flex items-center justify-center"><Package className="h-20 w-20 text-white/30" /></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><h3 className="text-xl font-bold">{product.name}</h3>{product.isVerified && <Shield className="h-5 w-5 text-blue-500" />}</div>
                          <p className="text-sm text-gray-500">by {product.vendor.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-violet-600">{formatPrice(product.price, product.pricingModel)}</p>
                          {product.compareAtPrice && <p className="text-sm text-gray-400 line-through">${product.compareAtPrice}/mo</p>}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{product.shortDescription}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{product.rating}</span>
                          <span className="flex items-center gap-1 text-gray-500"><Download className="h-4 w-4" />{(product.downloads / 1000).toFixed(0)}K</span>
                          <span className="flex items-center gap-1 text-gray-500"><Zap className="h-4 w-4" />{(product.activeInstalls / 1000).toFixed(0)}K active</span>
                        </div>
                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { setInstallProduct(product); setShowInstallDialog(true) }}><Download className="h-4 w-4 mr-2" />Install</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Vendor Spotlight */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" />Featured Vendor of the Month</CardTitle>
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">Top Partner</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-2xl">TP</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">TechPro Solutions</h3>
                      <Shield className="h-5 w-5 text-blue-500" />
                      <Badge className="bg-violet-100 text-violet-700">Elite Partner</Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Industry-leading provider of enterprise productivity and security solutions. Trusted by over 10,000 businesses worldwide.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                      <div className="text-center"><p className="text-xl font-bold">15</p><p className="text-xs text-gray-500">Products</p></div>
                      <div className="text-center"><p className="text-xl font-bold">4.9</p><p className="text-xs text-gray-500">Avg Rating</p></div>
                      <div className="text-center"><p className="text-xl font-bold">45K</p><p className="text-xs text-gray-500">Customers</p></div>
                      <div className="text-center"><p className="text-xl font-bold">$2.3M</p><p className="text-xs text-gray-500">Revenue</p></div>
                      <div className="text-center"><p className="text-xl font-bold">&lt;2hr</p><p className="text-xs text-gray-500">Response</p></div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => setShowVisitStoreDialog(true)}><ExternalLink className="h-4 w-4 mr-2" />Visit Store</Button>
                      <Button variant="outline" onClick={() => { setContactProduct(activeProducts[0]); setShowContactDialog(true) }}><Mail className="h-4 w-4 mr-2" />Contact</Button>
                      <Button variant="outline" onClick={() => setShowFollowDialog(true)}><Heart className="h-4 w-4 mr-2" />Follow</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rising Stars */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-orange-500" />Rising Stars</CardTitle>
                <p className="text-sm text-gray-500">New apps gaining traction this month</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    { name: 'DataSync Pro', growth: '+245%', installs: '2.3K', category: 'Integration' },
                    { name: 'AI Writer', growth: '+189%', installs: '1.8K', category: 'AI Tools' },
                    { name: 'SecureVault', growth: '+156%', installs: '1.5K', category: 'Security' },
                  ].map((app, i) => (
                    <div key={i} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center"><Package className="h-6 w-6 text-white" /></div>
                        <div>
                          <h4 className="font-semibold">{app.name}</h4>
                          <Badge variant="outline" className="text-xs">{app.category}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{app.installs} installs</span>
                        <Badge className="bg-green-100 text-green-700"><TrendingUp className="h-3 w-3 mr-1" />{app.growth}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollections.map((collection, i) => (
                <Card key={collection.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className={`h-36 bg-gradient-to-br ${['from-violet-500 to-purple-500', 'from-blue-500 to-cyan-500', 'from-green-500 to-emerald-500', 'from-orange-500 to-red-500', 'from-pink-500 to-rose-500', 'from-indigo-500 to-violet-500'][i % 6]} flex items-center justify-center`}>
                      <Layers className="h-14 w-14 text-white/30" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">{collection.isFeatured && <Crown className="h-4 w-4 text-amber-500" />}<h4 className="font-semibold">{collection.name}</h4></div>
                      <p className="text-sm text-gray-500 mb-3">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{collection.productCount} apps</Badge>
                        <span className="text-xs text-gray-400">by {collection.curator}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="mt-6 space-y-6">
            {/* Vendor Stats Overview */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Vendor Ecosystem</h2>
                  <p className="text-indigo-200 text-sm">Partner network performance overview</p>
                </div>
                <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => setShowApplyVendorDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />Apply as Vendor
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockVendors.length}</p>
                  <p className="text-sm text-indigo-100">Total Vendors</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockVendors.filter(v => v.isVerified).length}</p>
                  <p className="text-sm text-indigo-100">Verified</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-indigo-100">Avg Rating</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">$1.2M</p>
                  <p className="text-sm text-indigo-100">Total Revenue</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-indigo-100">Products</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">&lt;4hr</p>
                  <p className="text-sm text-indigo-100">Avg Response</p>
                </div>
              </div>
            </div>

            {/* Vendor Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { tier: 'Elite', icon: Crown, color: 'from-amber-500 to-orange-500', count: 2, perks: 'Priority placement, reduced fees' },
                { tier: 'Gold', icon: Award, color: 'from-yellow-500 to-amber-500', count: 5, perks: 'Featured listings, analytics' },
                { tier: 'Silver', icon: Shield, color: 'from-gray-400 to-gray-500', count: 12, perks: 'Standard features, support' },
                { tier: 'Bronze', icon: Users, color: 'from-orange-700 to-amber-700', count: 28, perks: 'Basic marketplace access' },
              ].map((t, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                      <t.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-semibold">{t.tier} Partners</h4>
                    <p className="text-2xl font-bold">{t.count}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.perks}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Vendor Directory */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vendor Directory</CardTitle>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Tiers" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="elite">Elite</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sort By" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockVendors.map(vendor => (
                    <div key={vendor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl">{vendor.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{vendor.name}</h3>
                            {vendor.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                            {vendor.isFeatured && <Badge className="bg-amber-100 text-amber-700"><Crown className="h-3 w-3 mr-1" />Featured</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.location}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Response: {vendor.responseTime}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{vendor.description}</p>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{vendor.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">{vendor.productCount} products</span>
                            <span className="text-sm text-gray-500">{(vendor.totalSales / 1000).toFixed(1)}K sales</span>
                            <span className="text-sm font-medium text-green-600">${(vendor.totalRevenue / 1000).toFixed(0)}K revenue</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { window.location.href = `mailto:${vendor.email || 'vendor@example.com'}`; toast.success('Email client opened') }}><Mail className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => { setSelectedVendorForStore(vendor); setShowVendorStoreDialog(true) }}><ExternalLink className="h-4 w-4 mr-1" />Store</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Vendor Performance Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" />Top Sellers</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockVendors.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{v.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-medium">{v.name}</p><p className="text-xs text-gray-500">{v.productCount} products</p></div>
                        <span className="font-semibold text-green-600">${(v.totalRevenue / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" />Highest Rated</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockVendors.sort((a, b) => b.rating - a.rating).slice(0, 5).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs">{v.name.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1"><p className="font-medium">{v.name}</p><p className="text-xs text-gray-500">{v.totalSales} reviews</p></div>
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="font-semibold">{v.rating}</span></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6 space-y-6">
            {/* Reviews Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Review Management</h2>
                  <p className="text-amber-100 text-sm">Monitor and respond to customer feedback</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => setShowExportReviewsDialog(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button className="bg-white text-amber-700 hover:bg-amber-50" onClick={() => setShowRespondAllDialog(true)}><MessageSquare className="h-4 w-4 mr-2" />Respond All</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockReviews.length}</p>
                  <p className="text-sm text-amber-100">Total Reviews</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">4.7</p>
                  <p className="text-sm text-amber-100">Avg Rating</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-sm text-amber-100">Positive</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockReviews.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-amber-100">Pending</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockReviews.filter(r => r.response).length}</p>
                  <p className="text-sm text-amber-100">Responded</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">2.3h</p>
                  <p className="text-sm text-amber-100">Avg Response</p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {[5, 4, 3, 2, 1].map(stars => {
                const counts = [156, 89, 23, 8, 4]
                const pct = [56, 32, 8, 3, 1]
                return (
                  <Card key={stars} className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(stars)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                        {[...Array(5-stars)].map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
                      </div>
                      <p className="text-xl font-bold">{counts[5-stars]}</p>
                      <p className="text-xs text-gray-500">{pct[5-stars]}% of reviews</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockReviews.map(review => (
                  <div key={review.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedReview(review); setShowReviewDialog(true) }}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10"><AvatarFallback className="bg-violet-100 text-violet-700">{review.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.author.name}</span>
                            {review.author.company && <span className="text-sm text-gray-500">• {review.author.company}</span>}
                            {review.verified && <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                          </div>
                          <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div>
                          <span className="text-sm text-gray-500">for {review.productName}</span>
                        </div>
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{review.helpful}</span>
                          <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" />{review.notHelpful}</span>
                          {review.response && <Badge variant="outline"><Reply className="h-3 w-3 mr-1" />Responded</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-6 space-y-6">
            {/* Orders Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Order Management</h2>
                  <p className="text-emerald-200 text-sm">Track and manage all marketplace transactions</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => setShowExportOrdersDialog(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={() => setShowGenerateReportDialog(true)}><FileText className="h-4 w-4 mr-2" />Generate Report</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockOrders.length}</p>
                  <p className="text-sm text-emerald-100">Total Orders</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockOrders.filter(o => o.status === 'completed').length}</p>
                  <p className="text-sm text-emerald-100">Completed</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockOrders.filter(o => o.status === 'pending').length}</p>
                  <p className="text-sm text-emerald-100">Pending</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockOrders.filter(o => o.status === 'processing').length}</p>
                  <p className="text-sm text-emerald-100">Processing</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">${mockOrders.reduce((sum, o) => sum + o.amount, 0)}</p>
                  <p className="text-sm text-emerald-100">Revenue</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">$32.40</p>
                  <p className="text-sm text-emerald-100">Avg Order</p>
                </div>
              </div>
            </div>

            {/* Order Filters & Actions */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search orders..." className="pl-10 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[130px]"><SelectValue placeholder="Payment" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" className="w-[150px]" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      toast.success('Orders refreshed')
                    }}><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}><Filter className="h-4 w-4 mr-1" />Filters</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {mockOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-4"><input type="checkbox" className="rounded" /></td>
                          <td className="px-4 py-4">
                            <span className="font-mono text-sm text-violet-600">{order.orderNumber}</span>
                            <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center"><Package className="h-5 w-5 text-white" /></div>
                              <div><p className="font-medium">{order.product.name}</p><p className="text-xs text-gray-500">{order.product.vendor}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8"><AvatarFallback className="bg-gray-100 text-gray-600 text-xs">{order.customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                              <div><p className="font-medium">{order.customer.name}</p><p className="text-xs text-gray-500">{order.customer.email}</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-4"><span className="font-semibold">${order.amount}</span></td>
                          <td className="px-4 py-4"><span className="text-green-600 font-medium">${(order.amount * 0.15).toFixed(2)}</span></td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(order.status)}>{order.status}</Badge></td>
                          <td className="px-4 py-4 text-sm text-gray-500">{order.date}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderDialog(true) }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => { const invoiceData = `Invoice: ${order.orderNumber}\nAmount: $${order.amount}\nDate: ${order.date}\nProduct: ${order.product.name}`; const blob = new Blob([invoiceData], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `invoice-${order.orderNumber}.txt`; link.click(); URL.revokeObjectURL(url); toast.success('Invoice downloaded') }}><FileText className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedOrderForOptions(order); setShowMoreOptionsDialog(true) }}><MoreHorizontal className="h-4 w-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-gray-500">Showing 1-{mockOrders.length} of {mockOrders.length} orders</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => { setCurrentPage(currentPage - 1) }}>Previous</Button>
                    <Button variant="outline" size="sm" className={currentPage === 1 ? 'bg-violet-50 text-violet-700' : ''} onClick={() => setCurrentPage(1)}>1</Button>
                    <Button variant="outline" size="sm" className={currentPage === 2 ? 'bg-violet-50 text-violet-700' : ''} onClick={() => setCurrentPage(2)}>2</Button>
                    <Button variant="outline" size="sm" className={currentPage === 3 ? 'bg-violet-50 text-violet-700' : ''} onClick={() => setCurrentPage(3)}>3</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Revenue by Day</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const values = [65, 85, 70, 90, 75, 45, 30]
                      return (
                        <div key={day} className="flex items-center gap-2">
                          <span className="w-8 text-xs text-gray-500">{day}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${values[i]}%` }} />
                          </div>
                          <span className="text-xs font-medium w-12 text-right">${(values[i] * 50).toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Payment Methods</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { method: 'Credit Card', pct: 58, icon: CreditCard, color: 'bg-blue-500' },
                      { method: 'PayPal', pct: 28, icon: Wallet, color: 'bg-indigo-500' },
                      { method: 'Crypto', pct: 10, icon: Bitcoin, color: 'bg-orange-500' },
                      { method: 'Other', pct: 4, icon: MoreHorizontal, color: 'bg-gray-500' },
                    ].map(pm => (
                      <div key={pm.method} className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${pm.color} rounded-lg flex items-center justify-center`}><pm.icon className="h-4 w-4 text-white" /></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1"><span className="text-sm">{pm.method}</span><span className="text-sm font-medium">{pm.pct}%</span></div>
                          <Progress value={pm.pct} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowProcessOrdersDialog(true)}><RefreshCw className="h-4 w-4 mr-2" />Process Pending Orders</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowGenerateInvoicesDialog(true)}><FileText className="h-4 w-4 mr-2" />Generate Invoices</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowProcessPayoutsDialog(true)}><DollarSign className="h-4 w-4 mr-2" />Process Payouts</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowSendNotificationsDialog(true)}><Send className="h-4 w-4 mr-2" />Send Notifications</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowExportCSVDialog(true)}><Download className="h-4 w-4 mr-2" />Export to CSV</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Overview */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Marketplace Analytics</h2>
                  <p className="text-violet-200 text-sm">Performance insights and trends</p>
                </div>
                <select className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm">
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Last 90 Days</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">$124,580</p>
                  <p className="text-green-300 text-xs">+18.2% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold">3,847</p>
                  <p className="text-green-300 text-xs">+12.5% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Avg Order Value</p>
                  <p className="text-2xl font-bold">$32.38</p>
                  <p className="text-green-300 text-xs">+5.1% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Active Users</p>
                  <p className="text-2xl font-bold">12.4K</p>
                  <p className="text-green-300 text-xs">+8.3% vs last period</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-violet-200 text-sm mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold">2.1%</p>
                  <p className="text-green-300 text-xs">-0.4% vs last period</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><PieChart className="h-5 w-5 text-violet-500" /><span className="text-sm">Conversion Rate</span></div><p className="text-2xl font-bold mt-2">3.2%</p><p className="text-xs text-green-600">+0.4% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" /><span className="text-sm">Page Views</span></div><p className="text-2xl font-bold mt-2">45.2K</p><p className="text-xs text-green-600">+12% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Target className="h-5 w-5 text-green-500" /><span className="text-sm">Install Rate</span></div><p className="text-2xl font-bold mt-2">8.7%</p><p className="text-xs text-green-600">+1.2% from last month</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /><span className="text-sm">Avg Session</span></div><p className="text-2xl font-bold mt-2">4m 32s</p><p className="text-xs text-green-600">+23s from last month</p></CardContent></Card>
            </div>

            {/* Revenue & Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const values = [65, 78, 82, 90, 88, 45, 38]
                    const amounts = [4250, 5120, 5380, 5920, 5780, 2940, 2480]
                    return (
                      <div key={day} className="flex items-center gap-4">
                        <span className="w-10 text-sm text-gray-500">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                          <div className="bg-violet-500 h-3 rounded-full" style={{ width: `${values[idx]}%` }} />
                        </div>
                        <span className="w-20 text-sm font-medium text-right">${amounts[idx].toLocaleString()}</span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{ name: 'Analytics', value: 35, amount: 43603, color: 'bg-purple-500' }, { name: 'Productivity', value: 28, amount: 34882, color: 'bg-blue-500' }, { name: 'Security', value: 20, amount: 24916, color: 'bg-red-500' }, { name: 'Marketing', value: 12, amount: 14950, color: 'bg-orange-500' }, { name: 'Other', value: 5, amount: 6229, color: 'bg-gray-500' }].map(cat => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="w-24 text-sm">{cat.name}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3"><div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.value}%` }} /></div>
                        <span className="w-20 text-sm font-medium text-right">${cat.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* App Performance & User Behavior */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Top Performing Apps</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeProducts.slice(0, 5).map((product, i) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-gray-500">{i + 1}</span>
                        <div className="flex-1"><p className="font-medium">{product.name}</p><p className="text-xs text-gray-500">{product.vendor.name}</p></div>
                        <Badge variant="outline">{(product.downloads / 1000).toFixed(0)}K</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>User Acquisition</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { source: 'Organic Search', users: 4520, pct: 42 },
                    { source: 'Direct', users: 2840, pct: 26 },
                    { source: 'Referrals', users: 1680, pct: 16 },
                    { source: 'Social Media', users: 980, pct: 9 },
                    { source: 'Email', users: 780, pct: 7 },
                  ].map((src) => (
                    <div key={src.source} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{src.source}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{src.users.toLocaleString()}</span>
                        <Badge variant="outline" className="text-xs">{src.pct}%</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Retention Metrics</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">87%</p>
                      <p className="text-xs text-gray-500">Day 1 Retention</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">64%</p>
                      <p className="text-xs text-gray-500">Day 7 Retention</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">48%</p>
                      <p className="text-xs text-gray-500">Day 30 Retention</p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-amber-600">35%</p>
                      <p className="text-xs text-gray-500">Day 90 Retention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { app: 'Analytics Pro', user: 'john@example.com', amount: 49, time: '2 min ago' },
                      { app: 'Security Suite', user: 'sarah@company.io', amount: 99, time: '15 min ago' },
                      { app: 'Marketing Tools', user: 'mike@startup.co', amount: 29, time: '1 hr ago' },
                      { app: 'Automation Hub', user: 'lisa@agency.com', amount: 79, time: '2 hrs ago' },
                      { app: 'Dev Toolkit', user: 'alex@dev.io', amount: 149, time: '3 hrs ago' },
                    ].map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tx.app}</p>
                          <p className="text-sm text-gray-500">{tx.user}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${tx.amount}</p>
                          <p className="text-xs text-gray-500">{tx.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>AI Insights</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700 dark:text-green-400">Growth Opportunity</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Analytics apps are trending 40% higher than last month. Consider featuring more analytics tools.</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-700 dark:text-blue-400">Conversion Tip</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Users who view 3+ apps have 2.5x higher conversion rate. Consider app recommendations.</p>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-700 dark:text-amber-400">Attention Needed</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">5 apps have ratings below 3.5 stars. Review quality and consider removal.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="flex gap-6">
              <Card className="w-64 h-fit border-gray-200 dark:border-gray-700">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'notifications', icon: Bell, label: 'Notifications' },
                      { id: 'payments', icon: CreditCard, label: 'Payments' },
                      { id: 'coupons', icon: Tag, label: 'Coupons' },
                      { id: 'developers', icon: Code, label: 'Developers' },
                      { id: 'security', icon: Shield, label: 'Security' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <item.icon className="h-4 w-4" />{item.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
              <div className="flex-1 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Marketplace Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Store Name</Label><Input defaultValue="My App Store" className="mt-1" /></div><div><Label>Default Currency</Label><Select defaultValue="usd"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="usd">USD</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem></SelectContent></Select></div></div>
                        <div><Label>Store Description</Label><Textarea defaultValue="Enterprise app marketplace" className="mt-1" /></div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Display Options</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Show Prices</p><p className="text-sm text-gray-500">Display app prices to visitors</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Show Reviews</p><p className="text-sm text-gray-500">Display user reviews</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Vendor Badges</p><p className="text-sm text-gray-500">Show verified vendor badges</p></div><Switch defaultChecked /></div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'notifications' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">New App Alerts</p><p className="text-sm text-gray-500">Get notified when new apps are added</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Review Responses</p><p className="text-sm text-gray-500">Notifications when vendors respond</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Price Drops</p><p className="text-sm text-gray-500">Alert when wishlist items drop in price</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Digest</p><p className="text-sm text-gray-500">Summary of marketplace activity</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Order Updates</p><p className="text-sm text-gray-500">Notifications for order status changes</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Security Alerts</p><p className="text-sm text-gray-500">Notify on suspicious activity</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'payments' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Payment Providers</CardTitle><Button onClick={() => setShowAddProviderDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Provider</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {mockPaymentProviders.map(provider => (
                        <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${provider.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                              <CreditCard className="h-6 w-6 text-violet-600" />
                            </div>
                            <div><h4 className="font-medium">{provider.name}</h4><p className="text-sm text-gray-500">{provider.type} • {provider.fee}% fee</p></div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right"><p className="text-sm text-gray-500">Volume</p><p className="font-bold">${(provider.volume / 1000).toFixed(0)}K</p></div>
                            <div className="text-right"><p className="text-sm text-gray-500">Transactions</p><p className="font-medium">{provider.transactions}</p></div>
                            <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                            <Switch checked={provider.status === 'active'} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'coupons' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Active Coupons ({(dbCoupons?.length || 0) + mockCoupons.length})</CardTitle><Button onClick={() => setShowCouponDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Coupon</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {(dbCoupons || []).map((coupon: any) => (
                          <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-violet-500">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${coupon.is_active ? 'bg-violet-100' : 'bg-gray-100'}`}>
                                <Percent className="h-6 w-6 text-violet-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2"><h4 className="font-mono font-bold">{coupon.code}</h4><Badge className={coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{coupon.is_active ? 'active' : 'inactive'}</Badge></div>
                                <p className="text-sm text-gray-500">{coupon.discount_type === 'percent_off' ? `${coupon.discount_value}% off` : `$${coupon.discount_value} off`} {coupon.expires_at && `• Expires ${new Date(coupon.expires_at).toLocaleDateString()}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="font-medium">{coupon.times_redeemed || 0}/{coupon.max_redemptions || 'Unlimited'}</p><Progress value={coupon.max_redemptions ? ((coupon.times_redeemed || 0) / coupon.max_redemptions) * 100 : 0} className="w-20 h-2" /></div>
                              <Button variant="ghost" size="icon" onClick={() => setShowCouponEditor(coupon.id)}><Edit className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        {mockCoupons.map(coupon => (
                          <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${coupon.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Percent className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2"><h4 className="font-mono font-bold">{coupon.code}</h4><Badge className={getStatusColor(coupon.status)}>{coupon.status}</Badge></div>
                                <p className="text-sm text-gray-500">{coupon.type === 'percentage' ? `${coupon.value}% off` : coupon.type === 'fixed' ? `$${coupon.value} off` : `${coupon.value} day trial`} • Expires {coupon.expiresAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="font-medium">{coupon.usedCount}/{coupon.usageLimit}</p><Progress value={(coupon.usedCount / coupon.usageLimit) * 100} className="w-20 h-2" /></div>
                              <Button variant="ghost" size="icon" onClick={() => setShowCouponEditor(coupon.id)}><Edit className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Bundles</CardTitle><Button onClick={() => setShowBundleDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Bundle</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {mockBundles.map(bundle => (
                          <div key={bundle.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div><h4 className="font-medium">{bundle.name}</h4><p className="text-sm text-gray-500">{bundle.products.length} apps • {bundle.discount}% discount</p></div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="text-lg font-bold text-violet-600">${bundle.price}</p><p className="text-sm text-gray-400 line-through">${bundle.originalPrice}</p></div>
                              <Badge variant="outline">{bundle.sales} sales</Badge>
                              <Badge className={getStatusColor(bundle.status)}>{bundle.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'developers' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>API Keys ({dbApiKeys.length + mockAPIKeys.length})</CardTitle><Button onClick={() => setShowAPIKeyDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Key</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {dbApiKeys.map(apiKey => (
                          <div key={apiKey.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-violet-500">
                            <div>
                              <div className="flex items-center gap-2"><h4 className="font-medium">{apiKey.name}</h4><Badge className={apiKey.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{apiKey.is_active ? 'active' : 'inactive'}</Badge></div>
                              <p className="font-mono text-sm text-gray-500">{apiKey.key_prefix}...</p>
                              <div className="flex items-center gap-2 mt-1">{(apiKey.scopes || []).map((p: string) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm text-gray-500"><p>Used: {apiKey.usage_count} times</p><p>Created: {new Date(apiKey.created_at).toLocaleDateString()}</p></div>
                              <Button variant="ghost" size="icon" onClick={() => toast.promise(navigator.clipboard.writeText(apiKey.key_prefix), { loading: 'Copying key prefix...', success: 'Key prefix copied to clipboard', error: 'Failed to copy key prefix' })}><Copy className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteApiKey(apiKey.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        {mockAPIKeys.map(apiKey => (
                          <div key={apiKey.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2"><h4 className="font-medium">{apiKey.name}</h4><Badge className={getStatusColor(apiKey.status)}>{apiKey.status}</Badge></div>
                              <p className="font-mono text-sm text-gray-500">{apiKey.key}</p>
                              <div className="flex items-center gap-2 mt-1">{apiKey.permissions.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-sm text-gray-500"><p>Last used: {apiKey.lastUsed}</p><p>Created: {apiKey.createdAt}</p></div>
                              <Button variant="ghost" size="icon" onClick={() => toast.promise(navigator.clipboard.writeText(apiKey.key), { loading: 'Copying API key...', success: 'API key copied to clipboard', error: 'Failed to copy API key' })}><Copy className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={async () => {
                                if (confirm('Are you sure you want to revoke this API key?')) {
                                  setDbApiKeys(prev => prev.filter(k => k.id !== apiKey.id))
                                  toast.success('API key revoked')
                                }
                              }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Webhooks ({dbWebhooks.length + mockWebhooks.length})</CardTitle><Button onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button></CardHeader>
                      <CardContent className="space-y-4">
                        {dbWebhooks.map(webhook => (
                          <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-violet-500">
                            <div>
                              <div className="flex items-center gap-2"><Code className="h-4 w-4 text-violet-500" /><span className="font-mono text-sm">{webhook.url}</span></div>
                              <div className="flex items-center gap-2 mt-1">{(webhook.events || []).map((e: string) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="text-sm">Deliveries: {webhook.total_deliveries || 0}</p><p className="text-xs text-gray-500">Created: {new Date(webhook.created_at).toLocaleDateString()}</p></div>
                              <Badge className={webhook.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{webhook.is_active ? 'active' : 'inactive'}</Badge>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteWebhook(webhook.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                        {mockWebhooks.map(webhook => (
                          <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <div className="flex items-center gap-2"><Code className="h-4 w-4 text-gray-400" /><span className="font-mono text-sm">{webhook.url}</span></div>
                              <div className="flex items-center gap-2 mt-1">{webhook.events.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right"><p className="text-sm"><span className={webhook.successRate >= 95 ? 'text-green-600' : 'text-amber-600'}>{webhook.successRate}%</span> success</p>{webhook.lastTriggered && <p className="text-xs text-gray-500">Last: {webhook.lastTriggered}</p>}</div>
                              <Badge className={getStatusColor(webhook.status)}>{webhook.status}</Badge>
                              <Button variant="ghost" size="icon" onClick={() => {
                                toast.success('Webhook test successful')
                              }}><RefreshCw className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'security' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Privacy & Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Public Profile</p><p className="text-sm text-gray-500">Allow vendors to see your profile</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Review Visibility</p><p className="text-sm text-gray-500">Show your reviews publicly</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Usage Analytics</p><p className="text-sm text-gray-500">Share anonymous usage data</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Two-Factor Auth</p><p className="text-sm text-gray-500">Require 2FA for purchases</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">API Rate Limiting</p><p className="text-sm text-gray-500">Limit API requests per minute</p></div><Select defaultValue="100"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="50">50/min</SelectItem><SelectItem value="100">100/min</SelectItem><SelectItem value="500">500/min</SelectItem></SelectContent></Select></div>
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
              insights={mockMarketplaceAIInsights}
              title="Marketplace Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMarketplaceCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMarketplacePredictions}
              title="Marketplace Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMarketplaceActivities}
            title="Marketplace Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={marketplaceQuickActions}
            variant="grid"
          />
        </div>

        {/* Product Detail Dialog */}
        <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">{selectedProduct.name}{selectedProduct.isVerified && <Shield className="h-5 w-5 text-blue-500" />}{selectedProduct.isBestseller && <Badge className="bg-orange-100 text-orange-700">Bestseller</Badge>}</DialogTitle>
                  <DialogDescription>by {selectedProduct.vendor.name} • v{selectedProduct.version}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 h-48 rounded-lg flex items-center justify-center"><Package className="h-24 w-24 text-violet-300" /></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4"><span className="flex items-center gap-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" />{selectedProduct.rating} ({selectedProduct.reviewCount} reviews)</span><span className="flex items-center gap-1 text-gray-500"><Download className="h-4 w-4" />{(selectedProduct.downloads / 1000).toFixed(0)}K</span><span className="flex items-center gap-1 text-gray-500"><Zap className="h-4 w-4" />{(selectedProduct.activeInstalls / 1000).toFixed(0)}K active</span></div>
                    <div className="text-right"><p className="text-3xl font-bold text-violet-600">{formatPrice(selectedProduct.price, selectedProduct.pricingModel)}</p>{selectedProduct.compareAtPrice && <p className="text-sm text-gray-400 line-through">${selectedProduct.compareAtPrice}/mo</p>}</div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>
                  <div><h4 className="font-semibold mb-3">Features</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">{selectedProduct.features.map((f, i) => <div key={i} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm">{f}</span></div>)}</div></div>
                  <div><h4 className="font-semibold mb-3">Tags</h4><div className="flex flex-wrap gap-2">{selectedProduct.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div></div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => toggleWishlist(selectedProduct.id)}><Heart className={`h-4 w-4 mr-2 ${wishlist.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />Wishlist</Button>
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { setInstallProduct(selectedProduct); setShowProductDialog(false); setShowInstallDialog(true) }}><Download className="h-4 w-4 mr-2" />Install Now</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl">
            {selectedReview && (
              <>
                <DialogHeader>
                  <DialogTitle>Review Details</DialogTitle>
                  <DialogDescription>Review for {selectedReview.productName}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{selectedReview.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div><p className="font-medium">{selectedReview.author.name}</p>{selectedReview.author.company && <p className="text-sm text-gray-500">{selectedReview.author.company}</p>}</div>
                    {selectedReview.verified && <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Verified Purchase</Badge>}
                  </div>
                  <div className="flex items-center gap-2"><div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />)}</div><span className="text-gray-500">{selectedReview.createdAt}</span></div>
                  <h4 className="font-semibold text-lg">{selectedReview.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedReview.content}</p>
                  {selectedReview.pros.length > 0 && <div><h5 className="font-medium text-green-700 mb-2">Pros</h5><ul className="space-y-1">{selectedReview.pros.map((p, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />{p}</li>)}</ul></div>}
                  {selectedReview.cons.length > 0 && <div><h5 className="font-medium text-red-700 mb-2">Cons</h5><ul className="space-y-1">{selectedReview.cons.map((c, i) => <li key={i} className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4 text-red-500" />{c}</li>)}</ul></div>}
                  {selectedReview.response && <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"><p className="text-sm text-gray-500 mb-2">Vendor Response • {selectedReview.response.date}</p><p className="text-sm">{selectedReview.response.content}</p></div>}
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowReviewDialog(false)}>Close</Button></DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Order Dialog */}
        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
          <DialogContent className="max-w-lg">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>{selectedOrder.orderNumber}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div><p className="font-semibold">{selectedOrder.product.name}</p><p className="text-sm text-gray-500">{selectedOrder.product.vendor}</p></div>
                    <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div><Label className="text-gray-500">Customer</Label><p className="font-medium">{selectedOrder.customer.name}</p><p className="text-sm text-gray-500">{selectedOrder.customer.email}</p></div>
                    <div><Label className="text-gray-500">Amount</Label><p className="text-xl font-bold">${selectedOrder.amount}</p><p className="text-sm text-gray-500">{selectedOrder.paymentMethod}</p></div>
                    <div><Label className="text-gray-500">License</Label><p className="font-mono text-sm">{selectedOrder.license}</p></div>
                    <div><Label className="text-gray-500">Date</Label><p>{selectedOrder.date}</p>{selectedOrder.expiresAt && <p className="text-sm text-gray-500">Expires: {selectedOrder.expiresAt}</p>}</div>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  {selectedOrder.invoice && <Button variant="outline" onClick={() => setShowDownloadInvoiceDialog(true)}><FileText className="h-4 w-4 mr-2" />Download Invoice</Button>}
                  <Button variant="outline" onClick={() => setShowOrderDialog(false)}>Close</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Coupon Dialog */}
        <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create Coupon</DialogTitle><DialogDescription>Create a new discount coupon for your marketplace</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Coupon Code</Label><Input placeholder="SUMMER25" className="mt-1 font-mono" value={marketplaceCouponForm.code} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Discount Type</Label><Select value={marketplaceCouponForm.discountType} onValueChange={(v) => setMarketplaceCouponForm(prev => ({ ...prev, discountType: v as 'percentage' | 'fixed' | 'free_trial' }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage Off</SelectItem><SelectItem value="fixed">Fixed Amount</SelectItem><SelectItem value="free_trial">Free Trial Days</SelectItem></SelectContent></Select></div>
                <div><Label>Value</Label><Input type="number" placeholder="25" className="mt-1" value={marketplaceCouponForm.value} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, value: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Usage Limit</Label><Input type="number" placeholder="100" className="mt-1" value={marketplaceCouponForm.usageLimit} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, usageLimit: e.target.value }))} /></div><div><Label>Min Purchase</Label><Input type="number" placeholder="0" className="mt-1" value={marketplaceCouponForm.minPurchase} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, minPurchase: e.target.value }))} /></div></div>
              <div><Label>Expires At</Label><Input type="date" className="mt-1" value={marketplaceCouponForm.expiresAt} onChange={(e) => setMarketplaceCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))} /></div>
              <div><Label>Applicable Products</Label><Select value={marketplaceCouponForm.applicableProducts} onValueChange={(v) => setMarketplaceCouponForm(prev => ({ ...prev, applicableProducts: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select products" /></SelectTrigger><SelectContent><SelectItem value="all">All Products</SelectItem><SelectItem value="selected">Selected Products</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowCouponDialog(false)}>Cancel</Button><Button onClick={handleCreateMarketplaceCoupon} disabled={creatingCoupon || !marketplaceCouponForm.code || !marketplaceCouponForm.value} className="bg-gradient-to-r from-violet-600 to-purple-600">{creatingCoupon ? 'Creating...' : 'Create Coupon'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bundle Dialog */}
        <Dialog open={showBundleDialog} onOpenChange={setShowBundleDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create Bundle</DialogTitle><DialogDescription>Create a product bundle with discounted pricing</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Bundle Name</Label><Input placeholder="Productivity Suite" className="mt-1" /></div>
              <div><Label>Description</Label><Textarea placeholder="Describe what's included..." className="mt-1" /></div>
              <div><Label>Select Products</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {activeProducts.slice(0, 4).map(p => <div key={p.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"><input type="checkbox" /><span className="text-sm">{p.name}</span></div>)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Discount %</Label><Input type="number" placeholder="25" className="mt-1" /></div><div><Label>Bundle Price</Label><Input type="number" placeholder="99" className="mt-1" /></div></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowBundleDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                toast.success('Bundle created successfully!')
                setShowBundleDialog(false)
              }}>Create Bundle</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Key Dialog */}
        <Dialog open={showAPIKeyDialog} onOpenChange={setShowAPIKeyDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create API Key</DialogTitle><DialogDescription>Generate a new API key for integrations</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Key Name</Label><Input placeholder="Production API" className="mt-1" value={apiKeyForm.name} onChange={(e) => setApiKeyForm(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['read', 'write', 'delete', 'admin'].map(perm => <Badge key={perm} variant="outline" className={`cursor-pointer hover:bg-violet-50 ${apiKeyForm.permissions.includes(perm) ? 'bg-violet-100 border-violet-500' : ''}`} onClick={() => toggleApiKeyPermission(perm)}>{perm}</Badge>)}
                </div>
              </div>
              <div><Label>Expiration</Label><Select value={apiKeyForm.expiration} onValueChange={(v) => setApiKeyForm(prev => ({ ...prev, expiration: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select expiration" /></SelectTrigger><SelectContent><SelectItem value="never">Never</SelectItem><SelectItem value="30">30 days</SelectItem><SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem></SelectContent></Select></div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200"><p className="text-sm text-amber-700">API keys are shown only once after creation. Make sure to copy it!</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowAPIKeyDialog(false)}>Cancel</Button><Button onClick={handleCreateApiKey} disabled={isSubmitting || !apiKeyForm.name} className="bg-gradient-to-r from-violet-600 to-purple-600">{isSubmitting ? 'Creating...' : 'Generate Key'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add Webhook</DialogTitle><DialogDescription>Configure a webhook endpoint for event notifications</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Endpoint URL</Label><Input placeholder="https://your-api.com/webhooks" className="mt-1" value={webhookForm.url} onChange={(e) => setWebhookForm(prev => ({ ...prev, url: e.target.value }))} /></div>
              <div><Label>Events</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {['order.created', 'order.completed', 'order.refunded', 'review.created', 'review.flagged', 'install', 'uninstall'].map(event => (
                    <div key={event} className={`flex items-center gap-2 p-2 rounded cursor-pointer ${webhookForm.events.includes(event) ? 'bg-violet-100 dark:bg-violet-900/30' : 'bg-gray-50 dark:bg-gray-800'}`} onClick={() => toggleWebhookEvent(event)}><input type="checkbox" checked={webhookForm.events.includes(event)} readOnly /><span className="text-sm font-mono">{event}</span></div>
                  ))}
                </div>
              </div>
              <div><Label>Secret (Optional)</Label><Input placeholder="whsec_xxxxxxxxx" className="mt-1 font-mono" value={webhookForm.secret} onChange={(e) => setWebhookForm(prev => ({ ...prev, secret: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button><Button onClick={handleCreateWebhook} disabled={isSubmitting || !webhookForm.url || webhookForm.events.length === 0} className="bg-gradient-to-r from-violet-600 to-purple-600">{isSubmitting ? 'Adding...' : 'Add Webhook'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Listing Dialog */}
        <Dialog open={showNewListingDialog} onOpenChange={setShowNewListingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Listing</DialogTitle>
              <DialogDescription>Create a new product listing for the marketplace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>Product Name</Label><Input placeholder="My Awesome App" className="mt-1" /></div>
                <div><Label>Category</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Short Description</Label><Input placeholder="Brief description of your product" className="mt-1" /></div>
              <div><Label>Full Description</Label><Textarea placeholder="Detailed description of features and benefits..." className="mt-1" rows={4} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div><Label>Pricing Model</Label>
                  <Select>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select pricing" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="one_time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Price</Label><Input type="number" placeholder="49" className="mt-1" /></div>
                <div><Label>Version</Label><Input placeholder="1.0.0" className="mt-1" /></div>
              </div>
              <div><Label>Tags</Label><Input placeholder="productivity, automation, AI (comma separated)" className="mt-1" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewListingDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Product listing created successfully!')
                setShowNewListingDialog(false)
              }} className="bg-gradient-to-r from-violet-600 to-purple-600">Create Listing</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Checkout Dialog */}
        <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Complete Purchase</DialogTitle>
              <DialogDescription>Review your order and complete checkout</DialogDescription>
            </DialogHeader>
            {checkoutProduct && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{checkoutProduct.name}</h4>
                    <p className="text-sm text-gray-500">by {checkoutProduct.vendor.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-violet-600">{formatPrice(checkoutProduct.price, checkoutProduct.pricingModel)}</p>
                    {checkoutProduct.compareAtPrice && <p className="text-sm text-gray-400 line-through">${checkoutProduct.compareAtPrice}/mo</p>}
                  </div>
                </div>
                <div className="space-y-3">
                  <div><Label>Payment Method</Label>
                    <Select defaultValue="card">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card"><div className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Credit Card</div></SelectItem>
                        <SelectItem value="paypal"><div className="flex items-center gap-2"><Wallet className="h-4 w-4" />PayPal</div></SelectItem>
                        <SelectItem value="crypto"><div className="flex items-center gap-2"><Bitcoin className="h-4 w-4" />Crypto</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Coupon Code (Optional)</Label><Input placeholder="Enter coupon code" className="mt-1" /></div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm"><span>Subtotal</span><span>${checkoutProduct.price}</span></div>
                  <div className="flex justify-between text-sm"><span>Tax</span><span>$0.00</span></div>
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-violet-600">${checkoutProduct.price}</span></div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Purchase completed successfully!')
                setShowCheckoutDialog(false)
                setCheckoutProduct(null)
              }} className="bg-gradient-to-r from-violet-600 to-purple-600"><CreditCard className="h-4 w-4 mr-2" />Complete Purchase</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contact Seller Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Contact Seller</DialogTitle>
              <DialogDescription>{contactProduct ? `Send a message to ${contactProduct.vendor.name}` : 'Send a message to the seller'}</DialogDescription>
            </DialogHeader>
            {contactProduct && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar><AvatarFallback className="bg-violet-100 text-violet-700">{contactProduct.vendor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{contactProduct.vendor.name}</p>
                    <p className="text-sm text-gray-500">Response time: {contactProduct.vendor.responseTime}</p>
                  </div>
                  {contactProduct.vendor.isVerified && <Badge className="bg-blue-100 text-blue-700"><Shield className="h-3 w-3 mr-1" />Verified</Badge>}
                </div>
                <div><Label>Regarding</Label><Input value={contactProduct.name} disabled className="mt-1 bg-gray-50" /></div>
                <div><Label>Subject</Label><Input placeholder="Question about pricing..." className="mt-1" /></div>
                <div><Label>Message</Label><Textarea placeholder="Type your message here..." className="mt-1" rows={4} /></div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span>A copy will be sent to your email</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowContactDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Message sent!')
                setShowContactDialog(false)
                setContactProduct(null)
              }} className="bg-gradient-to-r from-violet-600 to-purple-600"><Send className="h-4 w-4 mr-2" />Send Message</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Wishlist Dialog */}
        <Dialog open={showWishlistDialog} onOpenChange={setShowWishlistDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>My Wishlist</DialogTitle>
              <DialogDescription>Apps you've saved for later</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {wishlist.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <p className="text-sm text-gray-400">Browse apps and click the heart icon to save them here</p>
                </div>
              ) : (
                activeProducts.filter(p => wishlist.includes(p.id)).map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-violet-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.vendor.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-violet-600">{formatPrice(product.price, product.pricingModel)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => toggleWishlist(product.id)}>
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWishlistDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Install App Dialog */}
        <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Install App</DialogTitle>
              <DialogDescription>Confirm installation of {installProduct?.name}</DialogDescription>
            </DialogHeader>
            {installProduct && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{installProduct.name}</h4>
                    <p className="text-sm text-gray-500">by {installProduct.vendor.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{installProduct.rating} ({installProduct.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">This app will:</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Access your account information</span></div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Integrate with your existing workflows</span></div>
                    <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Send notifications about updates</span></div>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700">By installing, you agree to the app's terms of service and privacy policy.</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInstallDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                toast.success('App installed successfully!')
                setShowInstallDialog(false)
                setInstallProduct(null)
              }}>
                <Download className="h-4 w-4 mr-2" />Install App
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Learn More Dialog */}
        <Dialog open={showLearnMoreDialog} onOpenChange={setShowLearnMoreDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Analytics Pro Suite</DialogTitle>
              <DialogDescription>Comprehensive analytics solution for growing businesses</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 h-48 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-24 w-24 text-violet-300" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Features</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Real-time analytics dashboard</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />AI-powered insights</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Custom report builder</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Team collaboration</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Pricing</h4>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-violet-600">$49<span className="text-sm font-normal text-gray-500">/month</span></p>
                    <p className="text-sm text-gray-500">14-day free trial included</p>
                    <Badge className="mt-2 bg-green-100 text-green-700">Save 20% annually</Badge>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLearnMoreDialog(false)}>Close</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { setShowLearnMoreDialog(false); setInstallProduct(activeProducts[0]); setShowInstallDialog(true) }}>
                <Download className="h-4 w-4 mr-2" />Start Free Trial
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Visit Store Dialog */}
        <Dialog open={showVisitStoreDialog} onOpenChange={setShowVisitStoreDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Visit Vendor Store</DialogTitle>
              <DialogDescription>You're about to visit TechPro Solutions store</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl">TP</AvatarFallback></Avatar>
                <div>
                  <h4 className="font-semibold text-lg">TechPro Solutions</h4>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-500">Verified Elite Partner</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm">4.9 (2,847 reviews)</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
                <div><p className="text-xl font-bold">15</p><p className="text-xs text-gray-500">Products</p></div>
                <div><p className="text-xl font-bold">45K</p><p className="text-xs text-gray-500">Customers</p></div>
                <div><p className="text-xl font-bold">$2.3M</p><p className="text-xs text-gray-500">Revenue</p></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVisitStoreDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                window.open('https://techpro.marketplace.example.com', '_blank')
                toast.success('Store opened')
                setShowVisitStoreDialog(false)
              }}>
                <ExternalLink className="h-4 w-4 mr-2" />Visit Store
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Follow Vendor Dialog */}
        <Dialog open={showFollowDialog} onOpenChange={setShowFollowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Follow TechPro Solutions</DialogTitle>
              <DialogDescription>Get notified about new products and updates</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-12 w-12"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">TP</AvatarFallback></Avatar>
                <div>
                  <h4 className="font-semibold">TechPro Solutions</h4>
                  <p className="text-sm text-gray-500">15 products • 45K followers</p>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium">Notification preferences:</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New product releases</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Product updates</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Special offers</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFollowDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                toast.success('Now following TechPro Solutions!')
                setShowFollowDialog(false)
              }}>
                <Heart className="h-4 w-4 mr-2" />Follow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Apply as Vendor Dialog */}
        <Dialog open={showApplyVendorDialog} onOpenChange={setShowApplyVendorDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Become a Vendor</DialogTitle>
              <DialogDescription>Apply to sell your products on the marketplace</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Company Name</Label><Input placeholder="Your company name" className="mt-1" /></div>
              <div><Label>Business Email</Label><Input type="email" placeholder="contact@yourcompany.com" className="mt-1" /></div>
              <div><Label>Website</Label><Input placeholder="https://yourcompany.com" className="mt-1" /></div>
              <div><Label>Business Type</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select business type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software Company</SelectItem>
                    <SelectItem value="agency">Digital Agency</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Tell us about your products</Label><Textarea placeholder="Describe the products you plan to sell..." className="mt-1" rows={3} /></div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700">Vendor applications are typically reviewed within 2-3 business days.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyVendorDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                toast.success('Application submitted!')
                setShowApplyVendorDialog(false)
              }}>
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Reviews Dialog */}
        <Dialog open={showExportReviewsDialog} onOpenChange={setShowExportReviewsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Reviews</DialogTitle>
              <DialogDescription>Download review data in your preferred format</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date Range</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Review content</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Ratings breakdown</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Author information</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-sm">Vendor responses</span></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportReviewsDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const blob = new Blob([JSON.stringify({ reviews: mockReviews, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `reviews-export-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Export complete')
                setShowExportReviewsDialog(false)
              }}>
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Respond All Dialog */}
        <Dialog open={showRespondAllDialog} onOpenChange={setShowRespondAllDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bulk Response</DialogTitle>
              <DialogDescription>Send a response to multiple reviews at once</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Reviews without response:</p>
                <p className="text-2xl font-bold">{mockReviews.filter(r => !r.response).length} reviews</p>
              </div>
              <div><Label>Response Template</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thank">Thank You Response</SelectItem>
                    <SelectItem value="apology">Apology Response</SelectItem>
                    <SelectItem value="followup">Follow-up Response</SelectItem>
                    <SelectItem value="custom">Custom Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Response Message</Label><Textarea placeholder="Thank you for your review! We appreciate your feedback..." className="mt-1" rows={4} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="positive-only" />
                <label htmlFor="positive-only" className="text-sm">Only respond to positive reviews (4-5 stars)</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRespondAllDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const unreviewedCount = mockReviews.filter(r => !r.response).length
                toast.success('Responses sent!')
                setShowRespondAllDialog(false)
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />Send Responses
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Orders Dialog */}
        <Dialog open={showExportOrdersDialog} onOpenChange={setShowExportOrdersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Orders</DialogTitle>
              <DialogDescription>Download order data for reporting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Order Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div><Label>From Date</Label><Input type="date" className="mt-1" /></div>
                <div><Label>To Date</Label><Input type="date" className="mt-1" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportOrdersDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const blob = new Blob([JSON.stringify({ orders: mockOrders, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `orders-export-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Export complete')
                setShowExportOrdersDialog(false)
              }}>
                <Download className="h-4 w-4 mr-2" />Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Report Dialog */}
        <Dialog open={showGenerateReportDialog} onOpenChange={setShowGenerateReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
              <DialogDescription>Create a comprehensive order report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Report Type</Label>
                <Select defaultValue="summary">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="product">Product Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Time Period</Label>
                <Select defaultValue="month">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include Sections:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Revenue breakdown</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Order statistics</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Product performance</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-sm">Customer insights</span></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateReportDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const reportData = {
                  generatedAt: new Date().toISOString(),
                  summary: { totalOrders: mockOrders.length, totalRevenue: mockOrders.reduce((sum, o) => sum + o.amount, 0), avgOrderValue: mockOrders.reduce((sum, o) => sum + o.amount, 0) / mockOrders.length },
                  orders: mockOrders,
                  products: activeProducts.slice(0, 10)
                }
                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `marketplace-report-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Report generated!')
                setShowGenerateReportDialog(false)
              }}>
                <FileText className="h-4 w-4 mr-2" />Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
              <DialogDescription>Filter orders by multiple criteria</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Order Status</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Payment Method</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All methods" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Amount Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-1">
                  <Input placeholder="Min $" type="number" />
                  <Input placeholder="Max $" type="number" />
                </div>
              </div>
              <div><Label>Product</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All products" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {activeProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCurrentPage(1)
                toast.success('Filters cleared')
                setShowFiltersDialog(false)
              }}>Clear All</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                setCurrentPage(1)
                toast.success('Filters applied')
                setShowFiltersDialog(false)
              }}>
                <Filter className="h-4 w-4 mr-2" />Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* More Options Dialog */}
        <Dialog open={showMoreOptionsDialog} onOpenChange={setShowMoreOptionsDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Order Actions</DialogTitle>
              <DialogDescription>{selectedOrderForOptions?.orderNumber}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Order marked as complete')
                setShowMoreOptionsDialog(false)
              }}>
                <CheckCircle className="h-4 w-4 mr-2" />Mark as Complete
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                if (!confirm('Are you sure you want to process a refund for this order?')) return
                toast.success('Refund initiated')
                setShowMoreOptionsDialog(false)
              }}>
                <DollarSign className="h-4 w-4 mr-2" />Process Refund
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Email sent to customer')
                setShowMoreOptionsDialog(false)
              }}>
                <Mail className="h-4 w-4 mr-2" />Email Customer
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('License renewed')
                setShowMoreOptionsDialog(false)
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />Renew License
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={() => {
                if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return
                toast.success('Order cancelled')
                setShowMoreOptionsDialog(false)
              }}>
                <XCircle className="h-4 w-4 mr-2" />Cancel Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Process Orders Dialog */}
        <Dialog open={showProcessOrdersDialog} onOpenChange={setShowProcessOrdersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Process Pending Orders</DialogTitle>
              <DialogDescription>Bulk process all pending orders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 mb-2">Pending orders to process:</p>
                <p className="text-2xl font-bold">{mockOrders.filter(o => o.status === 'pending').length} orders</p>
              </div>
              <div className="space-y-2">
                <Label>Processing Options:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Send confirmation emails</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Generate licenses</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-sm">Notify vendors</span></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProcessOrdersDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const pendingCount = mockOrders.filter(o => o.status === 'pending').length
                toast.success('Orders processed!')
                setShowProcessOrdersDialog(false)
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />Process Orders
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Generate Invoices Dialog */}
        <Dialog open={showGenerateInvoicesDialog} onOpenChange={setShowGenerateInvoicesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Invoices</DialogTitle>
              <DialogDescription>Create invoices for orders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Order Selection</Label>
                <Select defaultValue="pending">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Orders without invoices</SelectItem>
                    <SelectItem value="all">All orders (regenerate)</SelectItem>
                    <SelectItem value="month">This month's orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Invoice Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Send to customers automatically</span></div>
                <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-sm">Include detailed breakdown</span></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateInvoicesDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const invoiceCount = mockOrders.filter(o => o.status === 'completed').length
                toast.success('Invoices generated!')
                setShowGenerateInvoicesDialog(false)
              }}>
                <FileText className="h-4 w-4 mr-2" />Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Process Payouts Dialog */}
        <Dialog open={showProcessPayoutsDialog} onOpenChange={setShowProcessPayoutsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Process Payouts</DialogTitle>
              <DialogDescription>Send earnings to vendors</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 mb-2">Total payout amount:</p>
                <p className="text-2xl font-bold text-green-600">${(mockOrders.reduce((sum, o) => sum + o.amount, 0) * 0.85).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">After 15% platform fee</p>
              </div>
              <div><Label>Payout Method</Label>
                <Select defaultValue="bank">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe Connect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Minimum Threshold</Label><Input type="number" defaultValue="50" className="mt-1" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProcessPayoutsDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const payoutAmount = (mockOrders.reduce((sum, o) => sum + o.amount, 0) * 0.85).toFixed(2)
                toast.success('Payouts processed!')
                setShowProcessPayoutsDialog(false)
              }}>
                <DollarSign className="h-4 w-4 mr-2" />Process Payouts
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Notifications Dialog */}
        <Dialog open={showSendNotificationsDialog} onOpenChange={setShowSendNotificationsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Notifications</DialogTitle>
              <DialogDescription>Notify customers about their orders</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Notification Type</Label>
                <Select defaultValue="reminder">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Payment Reminder</SelectItem>
                    <SelectItem value="update">Order Update</SelectItem>
                    <SelectItem value="promo">Promotional</SelectItem>
                    <SelectItem value="renewal">Renewal Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Recipients</Label>
                <Select defaultValue="pending">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Customers with pending orders</SelectItem>
                    <SelectItem value="all">All customers</SelectItem>
                    <SelectItem value="expiring">Customers with expiring licenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Message</Label><Textarea placeholder="Enter your notification message..." className="mt-1" rows={3} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Send via email</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendNotificationsDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const recipientCount = mockOrders.filter(o => o.status === 'pending').length
                toast.success('Notifications sent!')
                setShowSendNotificationsDialog(false)
              }}>
                <Send className="h-4 w-4 mr-2" />Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export CSV Dialog */}
        <Dialog open={showExportCSVDialog} onOpenChange={setShowExportCSVDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export to CSV</DialogTitle>
              <DialogDescription>Download order data as CSV file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Data to Export</Label>
                <Select defaultValue="orders">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="revenue">Revenue Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Columns to Include:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Order ID</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Date</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Customer</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Amount</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Status</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-sm">Product</span></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportCSVDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const csvHeader = 'Order ID,Date,Customer,Amount,Status\n'
                const csvRows = mockOrders.map(o => `${o.orderNumber},${o.date},${o.customerName},${o.amount},${o.status}`).join('\n')
                const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('CSV exported!')
                setShowExportCSVDialog(false)
              }}>
                <Download className="h-4 w-4 mr-2" />Download CSV
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Payment Provider Dialog */}
        <Dialog open={showAddProviderDialog} onOpenChange={setShowAddProviderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Provider</DialogTitle>
              <DialogDescription>Connect a new payment gateway</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Provider</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select provider" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="braintree">Braintree</SelectItem>
                    <SelectItem value="coinbase">Coinbase Commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>API Key</Label><Input placeholder="Enter your API key" className="mt-1 font-mono" /></div>
              <div><Label>Secret Key</Label><Input type="password" placeholder="Enter your secret key" className="mt-1 font-mono" /></div>
              <div><Label>Environment</Label>
                <Select defaultValue="test">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test/Sandbox</SelectItem>
                    <SelectItem value="live">Live/Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700">Test your integration before going live to ensure everything works correctly.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProviderDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                toast.success('Payment provider added!')
                setShowAddProviderDialog(false)
              }}>
                <Plus className="h-4 w-4 mr-2" />Add Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Download Invoice Dialog */}
        <Dialog open={showDownloadInvoiceDialog} onOpenChange={setShowDownloadInvoiceDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Download Invoice</DialogTitle>
              <DialogDescription>Select invoice format and options</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include:</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Company details</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" defaultChecked /><span className="text-sm">Tax breakdown</span></div>
                  <div className="flex items-center gap-2"><input type="checkbox" /><span className="text-sm">Payment history</span></div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDownloadInvoiceDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => {
                const invoiceData = { generatedAt: new Date().toISOString(), order: selectedOrderForOptions, format: 'PDF' }
                const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/pdf' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `invoice-${selectedOrderForOptions?.orderNumber || 'unknown'}.pdf`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Invoice downloaded!')
                setShowDownloadInvoiceDialog(false)
                setShowOrderDialog(false)
              }}>
                <Download className="h-4 w-4 mr-2" />Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Vendor Store Dialog */}
        <Dialog open={showVendorStoreDialog} onOpenChange={setShowVendorStoreDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVendorForStore?.name} Store</DialogTitle>
              <DialogDescription>Browse products from this vendor</DialogDescription>
            </DialogHeader>
            {selectedVendorForStore && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Avatar className="h-16 w-16"><AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xl">{selectedVendorForStore.name.charAt(0)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{selectedVendorForStore.name}</h3>
                      {selectedVendorForStore.isVerified && <Shield className="h-4 w-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{selectedVendorForStore.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{selectedVendorForStore.rating}</span>
                      <span>{selectedVendorForStore.productCount} products</span>
                      <span className="text-green-600">${(selectedVendorForStore.totalRevenue / 1000).toFixed(0)}K revenue</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {activeProducts.filter(p => p.vendor.id === selectedVendorForStore.id || mockVendors.indexOf(selectedVendorForStore) < 2).slice(0, 4).map(product => (
                    <div key={product.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-full h-24 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center mb-3">
                        <Package className="h-8 w-8 text-violet-300" />
                      </div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{product.shortDescription}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-violet-600">{formatPrice(product.price, product.pricingModel)}</span>
                        <Button size="sm" onClick={() => { setInstallProduct(product); setShowVendorStoreDialog(false); setShowInstallDialog(true) }}>
                          <Download className="h-4 w-4 mr-1" />Install
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVendorStoreDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
