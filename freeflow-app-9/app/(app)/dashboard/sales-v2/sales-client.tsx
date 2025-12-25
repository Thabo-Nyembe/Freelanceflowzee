'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DollarSign, TrendingUp, TrendingDown, Users, Target, Award, Phone, Mail,
  Calendar, CheckCircle2, XCircle, Clock, BarChart3, Plus, Search, Filter,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Building2, Briefcase, UserPlus,
  MessageSquare, FileText, Activity, PieChart, LineChart, Globe, MapPin, Star,
  Zap, RefreshCw, Edit, Trash2, ExternalLink, ArrowRight, Settings, Package,
  FileSignature, Receipt, Percent, Flag, ShieldCheck, AlertTriangle, Trophy,
  Gift, Layers, Map, Navigation, Compass, LayoutGrid, Rocket, Sparkles,
  ChevronRight, ChevronDown, Copy, Download, Upload, Share2, Eye, Heart,
  ThumbsUp, MessageCircle, Send, Bookmark, Tag, Hash, AtSign, Link2, Loader2,
  Webhook, Key, Shield, HardDrive, AlertOctagon, Bell, CreditCard
} from 'lucide-react'

// Salesforce Sales Cloud level types
type DealStage = 'prospecting' | 'qualification' | 'needs_analysis' | 'value_proposition' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
type DealType = 'new_business' | 'existing_business' | 'renewal' | 'upsell' | 'cross_sell'
type AccountType = 'customer' | 'prospect' | 'partner' | 'competitor' | 'investor' | 'vendor'
type ForecastCategory = 'pipeline' | 'best_case' | 'commit' | 'closed' | 'omitted'
type TerritoryType = 'geographic' | 'industry' | 'account_size' | 'named_accounts'
type QuoteStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'declined'

interface Account {
  id: string
  name: string
  industry: string
  type: AccountType
  website?: string
  phone?: string
  address?: string
  annualRevenue: number
  employees: number
  owner: string
  ownerAvatar?: string
  createdAt: string
  lastActivity: string
  deals: number
  contacts: number
  status: 'active' | 'inactive' | 'churned'
  rating: 'hot' | 'warm' | 'cold'
  tier: 'enterprise' | 'mid_market' | 'smb'
  territory?: string
  parentAccount?: string
}

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  mobile?: string
  title: string
  department: string
  accountId: string
  accountName: string
  avatar?: string
  leadSource: string
  status: 'lead' | 'mql' | 'sql' | 'qualified' | 'customer' | 'churned'
  lastContact: string
  createdAt: string
  leadScore: number
  isDecisionMaker: boolean
  reportsTo?: string
  linkedin?: string
}

interface Opportunity {
  id: string
  name: string
  accountId: string
  accountName: string
  amount: number
  stage: DealStage
  probability: number
  closeDate: string
  owner: string
  ownerAvatar?: string
  type: DealType
  leadSource: string
  nextStep?: string
  description?: string
  createdAt: string
  updatedAt: string
  forecastCategory: ForecastCategory
  competitors?: string[]
  products: { name: string; quantity: number; price: number }[]
  expectedRevenue: number
  lossReason?: string
  wonReason?: string
  contactRoles: { contactId: string; contactName: string; role: string; isPrimary: boolean }[]
}

interface SalesActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo' | 'site_visit'
  subject: string
  description?: string
  relatedTo: string
  relatedType: 'account' | 'contact' | 'opportunity'
  owner: string
  dueDate?: string
  completedDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  duration?: number
  outcome?: string
  createdAt: string
}

interface Quote {
  id: string
  opportunityId: string
  opportunityName: string
  accountName: string
  quoteNumber: string
  status: QuoteStatus
  validUntil: string
  subtotal: number
  discount: number
  tax: number
  total: number
  lineItems: { productName: string; quantity: number; unitPrice: number; discount: number; total: number }[]
  createdAt: string
  sentAt?: string
  approvedBy?: string
  terms?: string
}

interface Forecast {
  id: string
  period: string
  owner: string
  ownerAvatar?: string
  quota: number
  pipeline: number
  bestCase: number
  commit: number
  closed: number
  gap: number
  attainment: number
  opportunities: { id: string; name: string; amount: number; category: ForecastCategory }[]
}

interface Territory {
  id: string
  name: string
  type: TerritoryType
  owner: string
  accounts: number
  opportunities: number
  pipelineValue: number
  closedWon: number
  quota: number
  attainment: number
  regions?: string[]
  industries?: string[]
}

interface Product {
  id: string
  name: string
  code: string
  category: string
  price: number
  description: string
  isActive: boolean
}

interface Commission {
  id: string
  salesperson: string
  period: string
  deals: number
  revenue: number
  commissionRate: number
  commissionAmount: number
  status: 'pending' | 'approved' | 'paid'
}

// Mock data
const mockAccounts: Account[] = [
  { id: '1', name: 'Acme Corporation', industry: 'Technology', type: 'customer', website: 'acme.com', phone: '+1-555-0100', address: 'San Francisco, CA', annualRevenue: 50000000, employees: 500, owner: 'Sarah Chen', createdAt: '2023-01-15', lastActivity: '2024-12-24', deals: 5, contacts: 12, status: 'active', rating: 'hot', tier: 'enterprise' },
  { id: '2', name: 'TechStart Inc', industry: 'Software', type: 'prospect', website: 'techstart.io', phone: '+1-555-0200', address: 'New York, NY', annualRevenue: 15000000, employees: 150, owner: 'Mike Johnson', createdAt: '2024-06-20', lastActivity: '2024-12-23', deals: 2, contacts: 4, status: 'active', rating: 'warm', tier: 'mid_market' },
  { id: '3', name: 'Global Industries', industry: 'Manufacturing', type: 'customer', website: 'globalind.com', phone: '+1-555-0300', address: 'Chicago, IL', annualRevenue: 200000000, employees: 2500, owner: 'Sarah Chen', createdAt: '2022-08-10', lastActivity: '2024-12-22', deals: 8, contacts: 25, status: 'active', rating: 'hot', tier: 'enterprise' },
  { id: '4', name: 'InnovateTech', industry: 'Technology', type: 'partner', website: 'innovatetech.ai', phone: '+1-555-0400', address: 'Austin, TX', annualRevenue: 30000000, employees: 200, owner: 'Lisa Park', createdAt: '2024-02-15', lastActivity: '2024-12-21', deals: 3, contacts: 8, status: 'active', rating: 'warm', tier: 'mid_market' },
  { id: '5', name: 'FinanceFirst', industry: 'Financial Services', type: 'customer', website: 'financefirst.com', phone: '+1-555-0500', address: 'Boston, MA', annualRevenue: 100000000, employees: 1000, owner: 'Mike Johnson', createdAt: '2023-05-20', lastActivity: '2024-12-20', deals: 6, contacts: 15, status: 'active', rating: 'hot', tier: 'enterprise' }
]

const mockContacts: Contact[] = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@acme.com', phone: '+1-555-1001', mobile: '+1-555-1002', title: 'VP of Engineering', department: 'Engineering', accountId: '1', accountName: 'Acme Corporation', leadSource: 'Website', status: 'customer', lastContact: '2024-12-24', createdAt: '2023-01-15', leadScore: 85, isDecisionMaker: true, linkedin: 'linkedin.com/in/johnsmith' },
  { id: '2', firstName: 'Emily', lastName: 'Davis', email: 'emily@techstart.io', phone: '+1-555-2001', title: 'CEO', department: 'Executive', accountId: '2', accountName: 'TechStart Inc', leadSource: 'Referral', status: 'sql', lastContact: '2024-12-23', createdAt: '2024-06-20', leadScore: 92, isDecisionMaker: true },
  { id: '3', firstName: 'Robert', lastName: 'Wilson', email: 'rwilson@globalind.com', phone: '+1-555-3001', title: 'CTO', department: 'Technology', accountId: '3', accountName: 'Global Industries', leadSource: 'Trade Show', status: 'customer', lastContact: '2024-12-22', createdAt: '2022-08-10', leadScore: 78, isDecisionMaker: true },
  { id: '4', firstName: 'Jennifer', lastName: 'Brown', email: 'jbrown@innovatetech.ai', phone: '+1-555-4001', title: 'Director of Partnerships', department: 'Business Development', accountId: '4', accountName: 'InnovateTech', leadSource: 'LinkedIn', status: 'qualified', lastContact: '2024-12-21', createdAt: '2024-02-15', leadScore: 67, isDecisionMaker: false },
  { id: '5', firstName: 'Michael', lastName: 'Garcia', email: 'mgarcia@financefirst.com', phone: '+1-555-5001', title: 'VP of Technology', department: 'IT', accountId: '5', accountName: 'FinanceFirst', leadSource: 'Cold Call', status: 'customer', lastContact: '2024-12-20', createdAt: '2023-05-20', leadScore: 72, isDecisionMaker: true }
]

const mockOpportunities: Opportunity[] = [
  { id: '1', name: 'Enterprise License Deal', accountId: '1', accountName: 'Acme Corporation', amount: 250000, stage: 'negotiation', probability: 75, closeDate: '2025-01-15', owner: 'Sarah Chen', type: 'new_business', leadSource: 'Website', nextStep: 'Final contract review', createdAt: '2024-10-01', updatedAt: '2024-12-24', forecastCategory: 'commit', products: [{ name: 'Enterprise Suite', quantity: 1, price: 200000 }, { name: 'Premium Support', quantity: 1, price: 50000 }], expectedRevenue: 187500, contactRoles: [{ contactId: '1', contactName: 'John Smith', role: 'Decision Maker', isPrimary: true }], competitors: ['CompetitorA', 'CompetitorB'] },
  { id: '2', name: 'Platform Upgrade', accountId: '3', accountName: 'Global Industries', amount: 180000, stage: 'proposal', probability: 60, closeDate: '2025-02-01', owner: 'Sarah Chen', type: 'upsell', leadSource: 'Account Manager', nextStep: 'Demo scheduled', createdAt: '2024-11-15', updatedAt: '2024-12-23', forecastCategory: 'best_case', products: [{ name: 'Platform Pro', quantity: 1, price: 150000 }, { name: 'Data Analytics', quantity: 1, price: 30000 }], expectedRevenue: 108000, contactRoles: [{ contactId: '3', contactName: 'Robert Wilson', role: 'Technical Evaluator', isPrimary: true }] },
  { id: '3', name: 'New Implementation', accountId: '2', accountName: 'TechStart Inc', amount: 85000, stage: 'qualification', probability: 40, closeDate: '2025-03-01', owner: 'Mike Johnson', type: 'new_business', leadSource: 'Referral', nextStep: 'Discovery call', createdAt: '2024-12-01', updatedAt: '2024-12-22', forecastCategory: 'pipeline', products: [{ name: 'Starter Suite', quantity: 1, price: 85000 }], expectedRevenue: 34000, contactRoles: [{ contactId: '2', contactName: 'Emily Davis', role: 'Economic Buyer', isPrimary: true }] },
  { id: '4', name: 'Annual Renewal', accountId: '5', accountName: 'FinanceFirst', amount: 120000, stage: 'closed_won', probability: 100, closeDate: '2024-12-15', owner: 'Mike Johnson', type: 'renewal', leadSource: 'Account Manager', createdAt: '2024-09-01', updatedAt: '2024-12-15', forecastCategory: 'closed', products: [{ name: 'Enterprise Suite', quantity: 1, price: 100000 }, { name: 'Premium Support', quantity: 1, price: 20000 }], expectedRevenue: 120000, contactRoles: [{ contactId: '5', contactName: 'Michael Garcia', role: 'Decision Maker', isPrimary: true }], wonReason: 'Strong relationship, competitive pricing' },
  { id: '5', name: 'Partner Integration', accountId: '4', accountName: 'InnovateTech', amount: 95000, stage: 'prospecting', probability: 20, closeDate: '2025-04-01', owner: 'Lisa Park', type: 'new_business', leadSource: 'Partner', nextStep: 'Initial call scheduled', createdAt: '2024-12-10', updatedAt: '2024-12-21', forecastCategory: 'pipeline', products: [{ name: 'Partner Edition', quantity: 1, price: 95000 }], expectedRevenue: 19000, contactRoles: [{ contactId: '4', contactName: 'Jennifer Brown', role: 'Champion', isPrimary: true }] },
  { id: '6', name: 'Team Expansion', accountId: '1', accountName: 'Acme Corporation', amount: 45000, stage: 'closed_won', probability: 100, closeDate: '2024-12-01', owner: 'Sarah Chen', type: 'existing_business', leadSource: 'Upsell', createdAt: '2024-11-01', updatedAt: '2024-12-01', forecastCategory: 'closed', products: [{ name: 'Additional Users', quantity: 50, price: 900 }], expectedRevenue: 45000, contactRoles: [{ contactId: '1', contactName: 'John Smith', role: 'Decision Maker', isPrimary: true }], wonReason: 'Organic growth, great product adoption' }
]

const mockActivities: SalesActivity[] = [
  { id: '1', type: 'call', subject: 'Discovery call with John Smith', relatedTo: 'Acme Corporation', relatedType: 'account', owner: 'Sarah Chen', dueDate: '2024-12-26', status: 'pending', priority: 'high', duration: 30, createdAt: '2024-12-24' },
  { id: '2', type: 'email', subject: 'Send proposal document', relatedTo: 'Enterprise License Deal', relatedType: 'opportunity', owner: 'Sarah Chen', dueDate: '2024-12-25', status: 'completed', completedDate: '2024-12-24', priority: 'high', outcome: 'Proposal sent, awaiting feedback', createdAt: '2024-12-23' },
  { id: '3', type: 'demo', subject: 'Product demo for technical team', description: 'Demo new features to technical team', relatedTo: 'TechStart Inc', relatedType: 'account', owner: 'Mike Johnson', dueDate: '2024-12-27', status: 'pending', priority: 'high', duration: 60, createdAt: '2024-12-22' },
  { id: '4', type: 'task', subject: 'Update CRM records', relatedTo: 'Global Industries', relatedType: 'account', owner: 'Sarah Chen', dueDate: '2024-12-24', status: 'overdue', priority: 'low', createdAt: '2024-12-20' },
  { id: '5', type: 'meeting', subject: 'Quarterly Business Review', description: 'QBR with executive team', relatedTo: 'FinanceFirst', relatedType: 'account', owner: 'Mike Johnson', dueDate: '2024-12-28', status: 'pending', priority: 'critical', duration: 90, createdAt: '2024-12-22' },
  { id: '6', type: 'site_visit', subject: 'On-site assessment', relatedTo: 'Global Industries', relatedType: 'account', owner: 'Sarah Chen', dueDate: '2024-12-30', status: 'pending', priority: 'medium', createdAt: '2024-12-23' }
]

const mockQuotes: Quote[] = [
  { id: 'Q-001', opportunityId: '1', opportunityName: 'Enterprise License Deal', accountName: 'Acme Corporation', quoteNumber: 'Q-2024-001', status: 'sent', validUntil: '2025-01-31', subtotal: 250000, discount: 25000, tax: 18000, total: 243000, lineItems: [{ productName: 'Enterprise Suite', quantity: 1, unitPrice: 200000, discount: 20000, total: 180000 }, { productName: 'Premium Support', quantity: 1, unitPrice: 50000, discount: 5000, total: 45000 }], createdAt: '2024-12-20', sentAt: '2024-12-21' },
  { id: 'Q-002', opportunityId: '2', opportunityName: 'Platform Upgrade', accountName: 'Global Industries', quoteNumber: 'Q-2024-002', status: 'pending_approval', validUntil: '2025-02-15', subtotal: 180000, discount: 18000, tax: 12960, total: 174960, lineItems: [{ productName: 'Platform Pro', quantity: 1, unitPrice: 150000, discount: 15000, total: 135000 }, { productName: 'Data Analytics', quantity: 1, unitPrice: 30000, discount: 3000, total: 27000 }], createdAt: '2024-12-22' }
]

const mockForecasts: Forecast[] = [
  { id: 'f1', period: 'Q1 2025', owner: 'Sarah Chen', quota: 500000, pipeline: 430000, bestCase: 350000, commit: 295000, closed: 165000, gap: 40000, attainment: 33, opportunities: [{ id: '1', name: 'Enterprise License Deal', amount: 250000, category: 'commit' }, { id: '2', name: 'Platform Upgrade', amount: 180000, category: 'best_case' }] },
  { id: 'f2', period: 'Q1 2025', owner: 'Mike Johnson', quota: 400000, pipeline: 205000, bestCase: 180000, commit: 120000, closed: 120000, gap: 80000, attainment: 30, opportunities: [{ id: '3', name: 'New Implementation', amount: 85000, category: 'pipeline' }, { id: '4', name: 'Annual Renewal', amount: 120000, category: 'closed' }] },
  { id: 'f3', period: 'Q1 2025', owner: 'Lisa Park', quota: 350000, pipeline: 95000, bestCase: 75000, commit: 0, closed: 0, gap: 275000, attainment: 0, opportunities: [{ id: '5', name: 'Partner Integration', amount: 95000, category: 'pipeline' }] }
]

const mockTerritories: Territory[] = [
  { id: 't1', name: 'West Coast Enterprise', type: 'geographic', owner: 'Sarah Chen', accounts: 25, opportunities: 12, pipelineValue: 2500000, closedWon: 850000, quota: 2000000, attainment: 42.5, regions: ['California', 'Oregon', 'Washington'] },
  { id: 't2', name: 'East Coast Mid-Market', type: 'geographic', owner: 'Mike Johnson', accounts: 45, opportunities: 18, pipelineValue: 1800000, closedWon: 620000, quota: 1500000, attainment: 41.3, regions: ['New York', 'New Jersey', 'Massachusetts'] },
  { id: 't3', name: 'Technology Vertical', type: 'industry', owner: 'Lisa Park', accounts: 30, opportunities: 8, pipelineValue: 950000, closedWon: 280000, quota: 1000000, attainment: 28, industries: ['Software', 'SaaS', 'Technology'] }
]

const mockProducts: Product[] = [
  { id: 'p1', name: 'Starter Suite', code: 'STARTER-01', category: 'Subscriptions', price: 5000, description: 'Basic features for small teams', isActive: true },
  { id: 'p2', name: 'Professional Suite', code: 'PRO-01', category: 'Subscriptions', price: 15000, description: 'Advanced features for growing teams', isActive: true },
  { id: 'p3', name: 'Enterprise Suite', code: 'ENT-01', category: 'Subscriptions', price: 50000, description: 'Full features for large organizations', isActive: true },
  { id: 'p4', name: 'Premium Support', code: 'SUP-PREM', category: 'Services', price: 10000, description: '24/7 priority support', isActive: true },
  { id: 'p5', name: 'Implementation Services', code: 'IMPL-01', category: 'Services', price: 25000, description: 'Professional implementation', isActive: true },
  { id: 'p6', name: 'Training Package', code: 'TRAIN-01', category: 'Services', price: 5000, description: 'User training sessions', isActive: true }
]

const mockCommissions: Commission[] = [
  { id: 'c1', salesperson: 'Sarah Chen', period: 'December 2024', deals: 2, revenue: 295000, commissionRate: 8, commissionAmount: 23600, status: 'pending' },
  { id: 'c2', salesperson: 'Mike Johnson', period: 'December 2024', deals: 1, revenue: 120000, commissionRate: 8, commissionAmount: 9600, status: 'pending' },
  { id: 'c3', salesperson: 'Lisa Park', period: 'December 2024', deals: 0, revenue: 0, commissionRate: 8, commissionAmount: 0, status: 'pending' }
]

// Helper functions
const getStageColor = (stage: DealStage): string => {
  const colors: Record<DealStage, string> = {
    prospecting: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    qualification: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    needs_analysis: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    value_proposition: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    proposal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    closed_won: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[stage]
}

const getForecastColor = (category: ForecastCategory): string => {
  const colors: Record<ForecastCategory, string> = {
    pipeline: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    best_case: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    commit: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    omitted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[category]
}

const getQuoteStatusColor = (status: QuoteStatus): string => {
  const colors: Record<QuoteStatus, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    sent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getActivityIcon = (type: SalesActivity['type']) => {
  const icons: Record<SalesActivity['type'], typeof Phone> = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    task: CheckCircle2,
    note: FileText,
    demo: Layers,
    site_visit: MapPin
  }
  return icons[type]
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

const getLeadScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
  if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
  return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
}

export default function SalesClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [forecastPeriod, setForecastPeriod] = useState('Q1 2025')
  const [settingsTab, setSettingsTab] = useState('general')

  // Stats calculations
  const stats = useMemo(() => {
    const totalPipeline = mockOpportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).reduce((acc, o) => acc + o.amount, 0)
    const wonDeals = mockOpportunities.filter(o => o.stage === 'closed_won')
    const wonAmount = wonDeals.reduce((acc, o) => acc + o.amount, 0)
    const totalDeals = mockOpportunities.length
    const winRate = (wonDeals.length / mockOpportunities.filter(o => ['closed_won', 'closed_lost'].includes(o.stage)).length) * 100 || 0
    const avgDealSize = totalPipeline / mockOpportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).length || 0
    const weightedPipeline = mockOpportunities.filter(o => !['closed_won', 'closed_lost'].includes(o.stage)).reduce((acc, o) => acc + o.expectedRevenue, 0)
    const commitAmount = mockOpportunities.filter(o => o.forecastCategory === 'commit').reduce((acc, o) => acc + o.amount, 0)
    const totalQuota = mockForecasts.reduce((acc, f) => acc + f.quota, 0)

    return {
      totalPipeline, wonAmount, winRate, avgDealSize, weightedPipeline, commitAmount, totalQuota,
      totalAccounts: mockAccounts.length,
      totalContacts: mockContacts.length,
      pendingActivities: mockActivities.filter(a => a.status === 'pending').length,
      wonDeals: wonDeals.length,
      overdueActivities: mockActivities.filter(a => a.status === 'overdue').length
    }
  }, [])

  // Pipeline stages for funnel
  const pipelineStages = useMemo(() => {
    const stages: DealStage[] = ['prospecting', 'qualification', 'needs_analysis', 'value_proposition', 'proposal', 'negotiation', 'closed_won']
    return stages.map(stage => ({
      name: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      key: stage,
      count: mockOpportunities.filter(o => o.stage === stage).length,
      amount: mockOpportunities.filter(o => o.stage === stage).reduce((a, o) => a + o.amount, 0),
      color: stage === 'closed_won' ? 'from-green-500 to-emerald-500' :
             stage === 'negotiation' ? 'from-orange-500 to-amber-500' :
             stage === 'proposal' ? 'from-purple-500 to-pink-500' :
             stage === 'value_proposition' ? 'from-indigo-500 to-violet-500' :
             stage === 'needs_analysis' ? 'from-cyan-500 to-teal-500' :
             stage === 'qualification' ? 'from-blue-500 to-cyan-500' : 'from-gray-500 to-slate-500'
    }))
  }, [])

  const filteredOpportunities = useMemo(() => {
    return mockOpportunities.filter(opp => {
      const matchesSearch = opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.accountName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStage = stageFilter === 'all' || opp.stage === stageFilter
      return matchesSearch && matchesStage
    })
  }, [searchQuery, stageFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-white/20 text-white border-white/30">Salesforce Sales Cloud Level</Badge>
                <Badge className="bg-white/20 text-white border-white/30">AI-Powered CRM</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-1">Sales Dashboard</h1>
              <p className="text-green-100">Enterprise sales management and forecasting</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-200" />
                <Input
                  placeholder="Search deals, accounts..."
                  className="pl-10 w-64 bg-white/10 border-white/30 text-white placeholder:text-green-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/20">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button className="bg-white text-green-600 hover:bg-green-50">
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Pipeline', value: formatCurrency(stats.totalPipeline), change: 18.5, icon: DollarSign, gradient: 'from-green-400 to-emerald-500' },
              { label: 'Closed Won', value: formatCurrency(stats.wonAmount), change: 25.3, icon: Trophy, gradient: 'from-yellow-400 to-orange-500' },
              { label: 'Win Rate', value: `${stats.winRate.toFixed(0)}%`, change: 5.2, icon: Target, gradient: 'from-blue-400 to-cyan-500' },
              { label: 'Weighted', value: formatCurrency(stats.weightedPipeline), change: 12.8, icon: BarChart3, gradient: 'from-purple-400 to-pink-500' },
              { label: 'Commit', value: formatCurrency(stats.commitAmount), change: 8.0, icon: CheckCircle2, gradient: 'from-teal-400 to-cyan-500' },
              { label: 'Accounts', value: stats.totalAccounts.toString(), change: 15.0, icon: Building2, gradient: 'from-indigo-400 to-purple-500' },
              { label: 'Won Deals', value: stats.wonDeals.toString(), change: 20.0, icon: Star, gradient: 'from-amber-400 to-orange-500' },
              { label: 'Activities', value: stats.pendingActivities.toString(), change: -10.0, icon: Activity, gradient: 'from-rose-400 to-pink-500' }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-green-200">{stat.label}</div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <BarChart3 className="w-4 h-4 mr-2" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <Briefcase className="w-4 h-4 mr-2" />Opportunities
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <Building2 className="w-4 h-4 mr-2" />Accounts
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <Users className="w-4 h-4 mr-2" />Contacts
            </TabsTrigger>
            <TabsTrigger value="quotes" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <FileSignature className="w-4 h-4 mr-2" />Quotes
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <TrendingUp className="w-4 h-4 mr-2" />Forecasts
            </TabsTrigger>
            <TabsTrigger value="territories" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <Map className="w-4 h-4 mr-2" />Territories
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <Package className="w-4 h-4 mr-2" />Products
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
              <Settings className="w-4 h-4 mr-2" />Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Pipeline Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Sales Pipeline
                </CardTitle>
                <CardDescription>Deal flow across stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {pipelineStages.map((stage, idx) => {
                    const maxAmount = Math.max(...pipelineStages.map(s => s.amount))
                    const height = maxAmount > 0 ? Math.max(40, (stage.amount / maxAmount) * 150) : 40
                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <div
                          className={`w-full bg-gradient-to-b ${stage.color} rounded-t-lg flex flex-col items-center justify-end p-2 transition-all duration-500`}
                          style={{ height: `${height}px` }}
                        >
                          <span className="text-white font-bold text-lg">{stage.count}</span>
                          <span className="text-white/80 text-xs">{formatCurrency(stage.amount)}</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 w-full p-2 text-center rounded-b-lg">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{stage.name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Deals */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    Hot Deals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOpportunities.filter(o => o.stage !== 'closed_lost').slice(0, 5).map((opp) => (
                      <div key={opp.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedOpportunity(opp)}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-white">{opp.name}</p>
                            <Badge className={getStageColor(opp.stage)}>{opp.stage.replace('_', ' ')}</Badge>
                            <Badge className={getForecastColor(opp.forecastCategory)}>{opp.forecastCategory}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{opp.accountName} • {opp.owner}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">{formatCurrency(opp.amount)}</p>
                          <p className="text-xs text-gray-500">Close: {opp.closeDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Today's Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActivities.filter(a => a.status === 'pending' || a.status === 'overdue').slice(0, 6).map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className={`flex items-start gap-3 p-3 rounded-lg ${activity.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                          <div className={`p-2 rounded-lg ${activity.priority === 'critical' ? 'bg-red-100 text-red-600' : activity.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{activity.subject}</p>
                            <p className="text-xs text-gray-500">{activity.relatedTo}</p>
                            <p className="text-xs text-gray-400">{activity.dueDate}</p>
                          </div>
                          {activity.status === 'overdue' && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard & Forecast Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Sales Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockForecasts.sort((a, b) => b.closed - a.closed).map((forecast, idx) => (
                      <div key={forecast.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                          {idx + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{forecast.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{forecast.owner}</p>
                          <p className="text-sm text-gray-500">{forecast.attainment}% of quota</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(forecast.closed)}</p>
                          <Progress value={forecast.attainment} className="h-2 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-500" />
                    Forecast Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'Pipeline', amount: stats.totalPipeline, color: 'bg-gray-400' },
                      { label: 'Best Case', amount: mockForecasts.reduce((a, f) => a + f.bestCase, 0), color: 'bg-blue-500' },
                      { label: 'Commit', amount: stats.commitAmount, color: 'bg-green-500' },
                      { label: 'Closed', amount: stats.wonAmount, color: 'bg-emerald-600' },
                      { label: 'Quota', amount: stats.totalQuota, color: 'bg-purple-500' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {['all', 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'].map((stage) => (
                  <Button key={stage} variant={stageFilter === stage ? 'default' : 'outline'} size="sm" onClick={() => setStageFilter(stage)} className="capitalize">
                    {stage === 'all' ? 'All Stages' : stage.replace('_', ' ')}
                  </Button>
                ))}
              </div>
              <Button><Plus className="w-4 h-4 mr-2" />New Opportunity</Button>
            </div>

            <div className="grid gap-4">
              {filteredOpportunities.map((opp) => (
                <Card key={opp.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedOpportunity(opp)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{opp.name}</h3>
                          <Badge className={getStageColor(opp.stage)}>{opp.stage.replace('_', ' ')}</Badge>
                          <Badge className={getForecastColor(opp.forecastCategory)}>{opp.forecastCategory}</Badge>
                          <Badge variant="outline">{opp.type.replace('_', ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{opp.accountName}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Close: {opp.closeDate}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{opp.owner}</span>
                        </div>
                        {opp.nextStep && (
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Next:</strong> {opp.nextStep}</p>
                          </div>
                        )}
                        {opp.products.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {opp.products.map((p, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{p.name}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(opp.amount)}</p>
                        <p className="text-sm text-gray-500">Weighted: {formatCurrency(opp.expectedRevenue)}</p>
                        <div className="mt-2">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-sm text-gray-500">Probability</span>
                            <span className="font-medium">{opp.probability}%</span>
                          </div>
                          <Progress value={opp.probability} className="h-2 w-24" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid gap-4">
              {mockAccounts.map((account) => (
                <Card key={account.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedAccount(account)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{account.name}</h3>
                            <Badge className={account.type === 'customer' ? 'bg-green-100 text-green-700' : account.type === 'prospect' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>{account.type}</Badge>
                            <Badge className={account.rating === 'hot' ? 'bg-red-100 text-red-700' : account.rating === 'warm' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}>{account.rating}</Badge>
                            <Badge variant="outline">{account.tier.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{account.industry}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {account.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{account.website}</span>}
                            {account.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{account.address}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div><p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(account.annualRevenue)}</p><p className="text-xs text-gray-500">Revenue</p></div>
                        <div><p className="text-xl font-bold text-gray-900 dark:text-white">{account.employees}</p><p className="text-xs text-gray-500">Employees</p></div>
                        <div><p className="text-xl font-bold text-gray-900 dark:text-white">{account.deals}</p><p className="text-xs text-gray-500">Deals</p></div>
                        <div><p className="text-xl font-bold text-gray-900 dark:text-white">{account.contacts}</p><p className="text-xs text-gray-500">Contacts</p></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockContacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">{contact.firstName[0]}{contact.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{contact.firstName} {contact.lastName}</h3>
                          {contact.isDecisionMaker && <Badge className="bg-yellow-100 text-yellow-700 text-xs">DM</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{contact.title}</p>
                        <p className="text-sm text-gray-400">{contact.accountName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getLeadScoreColor(contact.leadScore)}>Score: {contact.leadScore}</Badge>
                          <Badge className={contact.status === 'customer' ? 'bg-green-100 text-green-700' : contact.status === 'sql' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{contact.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="w-4 h-4" /></Button>
                          {contact.linkedin && <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="w-4 h-4" /></Button>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quotes & Proposals</h2>
              <Button><Plus className="w-4 h-4 mr-2" />Create Quote</Button>
            </div>

            <div className="grid gap-4">
              {mockQuotes.map((quote) => (
                <Card key={quote.id} className="cursor-pointer hover:shadow-lg" onClick={() => setSelectedQuote(quote)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-gray-500">{quote.quoteNumber}</span>
                          <Badge className={getQuoteStatusColor(quote.status)}>{quote.status.replace('_', ' ')}</Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{quote.opportunityName}</h3>
                        <p className="text-sm text-gray-500">{quote.accountName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(quote.total)}</p>
                        <p className="text-sm text-gray-500">Valid until {quote.validUntil}</p>
                        {quote.discount > 0 && <p className="text-sm text-orange-500">-{formatCurrency(quote.discount)} discount</p>}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {quote.lineItems.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{item.productName}</Badge>
                      ))}
                      {quote.lineItems.length > 3 && <Badge variant="outline" className="text-xs">+{quote.lineItems.length - 3} more</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Forecasts - {forecastPeriod}</h2>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                  <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {mockForecasts.map((forecast) => (
                <Card key={forecast.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">{forecast.owner.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{forecast.owner}</h3>
                          <p className="text-sm text-gray-500">{forecast.period}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{forecast.attainment}%</p>
                        <p className="text-sm text-gray-500">Quota Attainment</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mb-4">
                      {[
                        { label: 'Quota', value: forecast.quota, color: 'text-purple-600' },
                        { label: 'Pipeline', value: forecast.pipeline, color: 'text-gray-600' },
                        { label: 'Best Case', value: forecast.bestCase, color: 'text-blue-600' },
                        { label: 'Commit', value: forecast.commit, color: 'text-green-600' },
                        { label: 'Closed', value: forecast.closed, color: 'text-emerald-600' }
                      ].map(item => (
                        <div key={item.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className={`text-xl font-bold ${item.color}`}>{formatCurrency(item.value)}</p>
                          <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <Progress value={forecast.attainment} className="h-3" />
                    {forecast.gap > 0 && <p className="text-sm text-red-600 mt-2">Gap to quota: {formatCurrency(forecast.gap)}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Territories Tab */}
          <TabsContent value="territories" className="space-y-6">
            <div className="grid gap-4">
              {mockTerritories.map((territory) => (
                <Card key={territory.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{territory.name}</h3>
                          <Badge variant="outline">{territory.type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">Owner: {territory.owner}</p>
                        <div className="flex gap-2 flex-wrap">
                          {territory.regions?.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                          {territory.industries?.map(i => <Badge key={i} variant="outline" className="text-xs">{i}</Badge>)}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div><p className="text-xl font-bold text-gray-900 dark:text-white">{territory.accounts}</p><p className="text-xs text-gray-500">Accounts</p></div>
                        <div><p className="text-xl font-bold text-blue-600">{formatCurrency(territory.pipelineValue)}</p><p className="text-xs text-gray-500">Pipeline</p></div>
                        <div><p className="text-xl font-bold text-green-600">{formatCurrency(territory.closedWon)}</p><p className="text-xs text-gray-500">Closed</p></div>
                        <div><p className="text-xl font-bold text-purple-600">{territory.attainment}%</p><p className="text-xs text-gray-500">Attainment</p></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Product Catalog</h2>
              <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="font-mono text-xs">{product.code}</Badge>
                      <Badge className={product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{product.category}</Badge>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(product.price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Salesforce Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'pipeline', label: 'Pipeline', icon: Target },
                        { id: 'automation', label: 'Automation', icon: Zap },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Shield }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Sales Stats Sidebar */}
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">CRM Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">{formatCurrency(stats.totalPipeline)}</div>
                      <div className="text-xs opacity-80">Total Pipeline</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{stats.winRate.toFixed(0)}%</div>
                        <div className="text-xs opacity-80">Win Rate</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{stats.wonDeals}</div>
                        <div className="text-xs opacity-80">Won Deals</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Quota Attainment</span>
                        <span>{((stats.wonAmount / stats.totalQuota) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(stats.wonAmount / stats.totalQuota) * 100} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-green-600" />
                          CRM Settings
                        </CardTitle>
                        <CardDescription>Configure your CRM profile and preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="FreeFlow Inc" />
                          </div>
                          <div className="space-y-2">
                            <Label>Fiscal Year Start</Label>
                            <Select defaultValue="january">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="january">January</SelectItem>
                                <SelectItem value="april">April</SelectItem>
                                <SelectItem value="july">July</SelectItem>
                                <SelectItem value="october">October</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="jpy">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="pst">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Multi-Currency Support</div>
                            <div className="text-sm text-gray-500">Enable multiple currencies for deals</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          Commission Settings
                        </CardTitle>
                        <CardDescription>Configure sales commission calculations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Commission Rate</Label>
                            <Input defaultValue="8%" />
                          </div>
                          <div className="space-y-2">
                            <Label>Commission Basis</Label>
                            <Select defaultValue="revenue">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="revenue">Revenue</SelectItem>
                                <SelectItem value="profit">Profit</SelectItem>
                                <SelectItem value="margin">Margin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Tiered Commissions</div>
                            <div className="text-sm text-gray-500">Apply different rates based on quota attainment</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Split Commissions</div>
                            <div className="text-sm text-gray-500">Allow commission splits between team members</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'pipeline' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Pipeline Stages
                        </CardTitle>
                        <CardDescription>Configure deal stages and probabilities</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {['Prospecting', 'Qualification', 'Needs Analysis', 'Value Proposition', 'Proposal', 'Negotiation'].map((stage, idx) => (
                          <div key={stage} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex-1">
                              <Input defaultValue={stage} />
                            </div>
                            <div className="w-24">
                              <Input defaultValue={`${(idx + 1) * 15}%`} className="text-center" />
                            </div>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Stage
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          Forecasting Settings
                        </CardTitle>
                        <CardDescription>Configure forecast categories and quotas</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Forecast Period</Label>
                          <Select defaultValue="quarterly">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">AI Forecast Predictions</div>
                            <div className="text-sm text-gray-500">Use AI to predict deal outcomes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Weighted Pipeline</div>
                            <div className="text-sm text-gray-500">Calculate expected value based on probability</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'automation' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-600" />
                          Lead Scoring
                        </CardTitle>
                        <CardDescription>Configure automatic lead scoring rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-600" />
                            <div>
                              <div className="font-medium text-yellow-800 dark:text-yellow-400">Einstein Lead Scoring</div>
                              <div className="text-sm text-yellow-600 dark:text-yellow-500">AI-powered lead prioritization</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Website Visit</span>
                              <span className="text-sm text-gray-500">+10 points</span>
                            </div>
                            <Progress value={40} className="h-2" />
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Email Open</span>
                              <span className="text-sm text-gray-500">+5 points</span>
                            </div>
                            <Progress value={20} className="h-2" />
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Demo Request</span>
                              <span className="text-sm text-gray-500">+25 points</span>
                            </div>
                            <Progress value={100} className="h-2" />
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium">Decision Maker</span>
                              <span className="text-sm text-gray-500">+20 points</span>
                            </div>
                            <Progress value={80} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-blue-600" />
                          Workflow Automation
                        </CardTitle>
                        <CardDescription>Configure automated workflows</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-create Follow-up Tasks</div>
                            <div className="text-sm text-gray-500">Create tasks after deals move stages</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Deal Aging Alerts</div>
                            <div className="text-sm text-gray-500">Alert when deals stall in a stage</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-assign Leads</div>
                            <div className="text-sm text-gray-500">Round-robin lead assignment</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Win/Loss Analysis</div>
                            <div className="text-sm text-gray-500">Require reason when closing deals</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Deal Notifications
                        </CardTitle>
                        <CardDescription>Configure notifications for deals and pipeline</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Deal Stage Changes</div>
                            <div className="text-sm text-gray-500">Notify when deals move stages</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Deal Won/Lost</div>
                            <div className="text-sm text-gray-500">Notify when deals are closed</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Quote Accepted</div>
                            <div className="text-sm text-gray-500">Notify when quotes are accepted</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Close Date Approaching</div>
                            <div className="text-sm text-gray-500">Notify before close dates</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          Activity Reminders
                        </CardTitle>
                        <CardDescription>Configure activity and task reminders</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Task Due Reminders</div>
                            <div className="text-sm text-gray-500">Remind before tasks are due</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Overdue Task Alerts</div>
                            <div className="text-sm text-gray-500">Alert when tasks become overdue</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Meeting Reminders</div>
                            <div className="text-sm text-gray-500">Send reminders before meetings</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-indigo-600" />
                          Connected Services
                        </CardTitle>
                        <CardDescription>Manage CRM integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold">S</span>
                            </div>
                            <div>
                              <div className="font-medium">Salesforce</div>
                              <div className="text-sm text-gray-500">Bi-directional sync enabled</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
                              <span className="text-white font-bold">G</span>
                            </div>
                            <div>
                              <div className="font-medium">Gmail</div>
                              <div className="text-sm text-gray-500">Email sync active</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                              <span className="text-white font-bold">L</span>
                            </div>
                            <div>
                              <div className="font-medium">LinkedIn Sales Navigator</div>
                              <div className="text-sm text-gray-500">Contact enrichment enabled</div>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold">H</span>
                            </div>
                            <div>
                              <div className="font-medium">HubSpot</div>
                              <div className="text-sm text-gray-500">Not connected</div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">Connect</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API credentials</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly className="font-mono" />
                            <Button variant="outline">Copy</Button>
                            <Button variant="outline">Regenerate</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://your-server.com/webhooks/sales" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Webhook Events</div>
                            <div className="text-sm text-gray-500">deal.created, deal.won, deal.lost</div>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Configure data retention and export</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Data Retention Period</Label>
                          <Select defaultValue="forever">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1year">1 Year</SelectItem>
                              <SelectItem value="3years">3 Years</SelectItem>
                              <SelectItem value="5years">5 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Upload className="w-4 h-4 mr-2" />
                            Import Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Configure security and access controls</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-500">Require 2FA for all users</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Field-Level Security</div>
                            <div className="text-sm text-gray-500">Control field visibility by role</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Audit Trail</div>
                            <div className="text-sm text-gray-500">Log all data changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Clear All Pipeline</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all deals</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Reset CRM</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Reset all CRM settings and data</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Opportunity Detail Dialog */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-500" />
              {selectedOpportunity?.name}
            </DialogTitle>
            <DialogDescription>{selectedOpportunity?.accountName}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedOpportunity && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStageColor(selectedOpportunity.stage)}>{selectedOpportunity.stage.replace('_', ' ')}</Badge>
                  <Badge className={getForecastColor(selectedOpportunity.forecastCategory)}>{selectedOpportunity.forecastCategory}</Badge>
                  <Badge variant="outline">{selectedOpportunity.type.replace('_', ' ')}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(selectedOpportunity.amount)}</p>
                    <p className="text-sm text-gray-500">Deal Value</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">{selectedOpportunity.probability}%</p>
                    <p className="text-sm text-gray-500">Probability</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(selectedOpportunity.expectedRevenue)}</p>
                    <p className="text-sm text-gray-500">Weighted Value</p>
                  </div>
                </div>

                {selectedOpportunity.products.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Products</h4>
                    <div className="space-y-2">
                      {selectedOpportunity.products.map((p, idx) => (
                        <div key={idx} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-900 dark:text-white">{p.name} x{p.quantity}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(p.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOpportunity.contactRoles.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Contact Roles</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedOpportunity.contactRoles.map((cr, idx) => (
                        <Badge key={idx} variant={cr.isPrimary ? 'default' : 'outline'}>{cr.contactName} - {cr.role}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOpportunity.nextStep && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="font-medium mb-1 text-gray-900 dark:text-white">Next Step</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedOpportunity.nextStep}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700"><ArrowRight className="w-4 h-4 mr-2" />Advance Stage</Button>
                  <Button variant="outline" className="flex-1"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                  <Button variant="outline"><FileSignature className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Quote Detail Dialog */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-purple-500" />
              Quote {selectedQuote?.quoteNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={getQuoteStatusColor(selectedQuote.status)}>{selectedQuote.status.replace('_', ' ')}</Badge>
                <span className="text-sm text-gray-500">Valid until {selectedQuote.validUntil}</span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Product</th>
                      <th className="text-right p-3 text-sm font-medium">Qty</th>
                      <th className="text-right p-3 text-sm font-medium">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium">Discount</th>
                      <th className="text-right p-3 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedQuote.lineItems.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-3">{item.productName}</td>
                        <td className="text-right p-3">{item.quantity}</td>
                        <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right p-3 text-orange-600">-{formatCurrency(item.discount)}</td>
                        <td className="text-right p-3 font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr className="border-t"><td colSpan={4} className="text-right p-3">Subtotal</td><td className="text-right p-3 font-medium">{formatCurrency(selectedQuote.subtotal)}</td></tr>
                    <tr><td colSpan={4} className="text-right p-3 text-orange-600">Discount</td><td className="text-right p-3 text-orange-600">-{formatCurrency(selectedQuote.discount)}</td></tr>
                    <tr><td colSpan={4} className="text-right p-3">Tax</td><td className="text-right p-3">{formatCurrency(selectedQuote.tax)}</td></tr>
                    <tr className="border-t"><td colSpan={4} className="text-right p-3 font-bold text-lg">Total</td><td className="text-right p-3 font-bold text-lg text-green-600">{formatCurrency(selectedQuote.total)}</td></tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1"><Send className="w-4 h-4 mr-2" />Send to Customer</Button>
                <Button variant="outline"><Download className="w-4 h-4 mr-2" />Download PDF</Button>
                <Button variant="outline"><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
