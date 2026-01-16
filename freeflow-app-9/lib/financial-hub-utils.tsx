// ============================================================================
// FINANCIAL HUB UTILITIES
// ============================================================================
// Complete TypeScript interfaces, mock data, and utility functions
// for the Financial Hub system
// ============================================================================

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: string
  description: string
  amount: number
  date: string
  client?: string
  project?: string
  vendor?: string
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: 'bank_transfer' | 'credit_card' | 'paypal' | 'platform' | 'cash'
  invoice?: string
  recurring?: boolean
  nextDue?: string
  campaign?: string
  platform?: string
  product?: string
  quantity?: number
  unitPrice?: number
  tags: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: string
  number: string
  client: string
  clientEmail?: string
  project: string
  amount: number
  issueDate: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paidAmount: number
  paidDate?: string
  currency: string
  taxRate: number
  items: InvoiceItem[]
  notes?: string
  terms?: string
  discount?: number
  subtotal?: number
  taxAmount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Client {
  id: string
  name: string
  email?: string
  totalRevenue: number
  activeProjects: number
  completedProjects: number
  averageProjectValue: number
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor'
  lastPayment: string
  outstandingAmount: number
  creditRating: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
  relationship: 'enterprise' | 'growth' | 'standard' | 'new'
}

export interface FinancialInsight {
  id: string
  type: 'revenue_optimization' | 'cash_flow' | 'cost_reduction' | 'risk_alert'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  potentialValue: number
  actionable: boolean
  confidence: number
  category: 'pricing' | 'operations' | 'expenses' | 'growth'
}

export interface FinancialOverview {
  totalRevenue: number
  monthlyRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  monthlyGrowth: number
  quarterlyGrowth: number
  yearlyGrowth: number
  cashFlow: number
  accountsReceivable: number
  accountsPayable: number
}

export interface FinancialAnalytics {
  revenuePerClient: number
  averageProjectValue: number
  clientRetentionRate: number
  projectProfitability: number
  operationalEfficiency: number
  burnRate: number
  runwayMonths: number
  breakEvenPoint: number
  roi: number
  costPerAcquisition: number
}

export interface TaxInfo {
  quarterlyEstimate: number
  yearToDateTax: number
  deductions: {
    homeOffice: number
    equipment: number
    software: number
    professional: number
  }
  documents: string[]
}

export interface FinancialGoal {
  target: number
  current: number
  progress: number
}

export interface FinancialGoals {
  monthlyRevenue: FinancialGoal
  quarterlyGrowth: FinancialGoal
  profitMargin: FinancialGoal
  clientAcquisition: FinancialGoal
  emergencyFund: FinancialGoal
}

export interface Report {
  id: string
  type: 'profit_loss' | 'cash_flow' | 'tax_summary' | 'expense_report' | 'revenue_analysis'
  title: string
  dateFrom: string
  dateTo: string
  generatedAt: string
  status: 'generating' | 'ready' | 'failed'
  format: 'pdf' | 'csv' | 'xlsx' | 'json'
  fileUrl?: string
  fileSize?: number
  data?: any
}

// ============================================================================
// MOCK DATA
// ============================================================================
// MIGRATED: Batch #10 - Removed mock data, using database hooks

export const MOCK_TRANSACTIONS: Transaction[] = []

const MOCK_TRANSACTIONS_OLD_REMOVED = [
  {
    id: 'txn_001',
    type: 'income',
    category: 'project_payment',
    description: 'Brand Identity Package - TechCorp Inc.',
    amount: 8500,
    date: '2024-02-01',
    client: 'TechCorp Inc.',
    project: 'Brand Identity 2024',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    invoice: 'INV-2024-001',
    tags: ['branding', 'design', 'milestone']
  },
  {
    id: 'txn_002',
    type: 'expense',
    category: 'software',
    description: 'Adobe Creative Cloud - Annual Subscription',
    amount: 899,
    date: '2024-01-31',
    vendor: 'Adobe Inc.',
    status: 'completed',
    paymentMethod: 'credit_card',
    recurring: true,
    nextDue: '2025-01-31',
    tags: ['software', 'recurring', 'tools']
  },
  {
    id: 'txn_003',
    type: 'income',
    category: 'consulting',
    description: 'Design Consultation - RetailMax Corp',
    amount: 2500,
    date: '2024-01-28',
    client: 'RetailMax Corp',
    project: 'Store Redesign Consultation',
    status: 'completed',
    paymentMethod: 'paypal',
    tags: ['consulting', 'strategy']
  },
  {
    id: 'txn_004',
    type: 'expense',
    category: 'marketing',
    description: 'Google Ads - Brand Awareness Campaign',
    amount: 1200,
    date: '2024-01-25',
    campaign: 'Brand Awareness Q1',
    status: 'completed',
    paymentMethod: 'credit_card',
    tags: ['marketing', 'advertising']
  },
  {
    id: 'txn_005',
    type: 'income',
    category: 'product_sales',
    description: 'Logo Template Pack V3 - Marketplace Sales',
    amount: 450,
    date: '2024-01-20',
    platform: 'KAZI Marketplace',
    product: 'Logo Template Pack V3',
    quantity: 15,
    unitPrice: 30,
    status: 'completed',
    paymentMethod: 'platform',
    tags: ['digital-products', 'passive-income']
  },
  {
    id: 'txn_006',
    type: 'expense',
    category: 'software',
    description: 'Figma Professional Plan - Annual',
    amount: 720,
    date: '2024-01-15',
    vendor: 'Figma Inc.',
    status: 'completed',
    paymentMethod: 'credit_card',
    recurring: true,
    nextDue: '2025-01-15',
    tags: ['software', 'design', 'tools']
  },
  {
    id: 'txn_007',
    type: 'income',
    category: 'project_payment',
    description: 'Website Development - StartupXYZ',
    amount: 5500,
    date: '2024-01-18',
    client: 'StartupXYZ',
    project: 'MVP Website',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    invoice: 'INV-2024-005',
    tags: ['web-development', 'startup']
  },
  {
    id: 'txn_008',
    type: 'expense',
    category: 'operations',
    description: 'Co-working Space Membership',
    amount: 450,
    date: '2024-02-01',
    vendor: 'WeWork',
    status: 'completed',
    paymentMethod: 'credit_card',
    recurring: true,
    nextDue: '2024-03-01',
    tags: ['operations', 'workspace']
  }
]

export const MOCK_INVOICES: Invoice[] = []

const MOCK_INVOICES_OLD = [
  {
    id: 'INV-2024-007',
    number: 'INV-2024-007',
    client: 'TechCorp Inc.',
    clientEmail: 'billing@techcorp.com',
    project: 'Website Redesign',
    amount: 12500,
    issueDate: '2024-02-01',
    dueDate: '2024-02-15',
    status: 'sent',
    paidAmount: 0,
    currency: 'USD',
    taxRate: 0,
    items: [
      { description: 'UI/UX Design', quantity: 1, rate: 7500, amount: 7500 },
      { description: 'Frontend Development', quantity: 1, rate: 5000, amount: 5000 }
    ],
    notes: 'Payment due within 14 days of invoice date',
    terms: 'Net 14'
  },
  {
    id: 'INV-2024-006',
    number: 'INV-2024-006',
    client: 'RetailMax Corp',
    clientEmail: 'accounts@retailmax.com',
    project: 'Brand Identity Package',
    amount: 8750,
    issueDate: '2024-01-15',
    dueDate: '2024-01-30',
    status: 'overdue',
    paidAmount: 0,
    currency: 'USD',
    taxRate: 8.25,
    items: [
      { description: 'Logo Design', quantity: 1, rate: 3500, amount: 3500 },
      { description: 'Brand Guidelines', quantity: 1, rate: 2500, amount: 2500 },
      { description: 'Business Cards', quantity: 1, rate: 2000, amount: 2000 }
    ],
    notes: 'Tax: 8.25% California sales tax applied',
    terms: 'Net 15'
  },
  {
    id: 'INV-2024-005',
    number: 'INV-2024-005',
    client: 'StartupXYZ',
    clientEmail: 'founder@startupxyz.com',
    project: 'MVP Design Sprint',
    amount: 5500,
    issueDate: '2024-01-05',
    dueDate: '2024-01-20',
    status: 'paid',
    paidAmount: 5500,
    paidDate: '2024-01-18',
    currency: 'USD',
    taxRate: 0,
    items: [
      { description: '5-Day Design Sprint', quantity: 1, rate: 5500, amount: 5500 }
    ],
    notes: 'Paid early - excellent client!',
    terms: 'Net 15'
  },
  {
    id: 'INV-2024-004',
    number: 'INV-2024-004',
    client: 'Digital Agency Co',
    clientEmail: 'projects@digitalagency.com',
    project: 'Logo Design',
    amount: 2500,
    issueDate: '2024-01-10',
    dueDate: '2024-01-25',
    status: 'paid',
    paidAmount: 2500,
    paidDate: '2024-01-23',
    currency: 'USD',
    taxRate: 0,
    items: [
      { description: 'Logo Design & Branding', quantity: 1, rate: 2500, amount: 2500 }
    ],
    terms: 'Net 15'
  }
]

export const MOCK_CLIENTS: Client[] = []

const MOCK_CLIENTS_OLD = [
  {
    id: 'client_001',
    name: 'TechCorp Inc.',
    email: 'billing@techcorp.com',
    totalRevenue: 45600,
    activeProjects: 2,
    completedProjects: 8,
    averageProjectValue: 5700,
    paymentHistory: 'excellent',
    lastPayment: '2024-02-01',
    outstandingAmount: 12500,
    creditRating: 'A+',
    relationship: 'enterprise'
  },
  {
    id: 'client_002',
    name: 'StartupXYZ',
    email: 'founder@startupxyz.com',
    totalRevenue: 28900,
    activeProjects: 1,
    completedProjects: 5,
    averageProjectValue: 5780,
    paymentHistory: 'excellent',
    lastPayment: '2024-01-18',
    outstandingAmount: 0,
    creditRating: 'A',
    relationship: 'growth'
  },
  {
    id: 'client_003',
    name: 'RetailMax Corp',
    email: 'accounts@retailmax.com',
    totalRevenue: 67800,
    activeProjects: 1,
    completedProjects: 12,
    averageProjectValue: 5650,
    paymentHistory: 'fair',
    lastPayment: '2024-01-28',
    outstandingAmount: 8750,
    creditRating: 'B+',
    relationship: 'enterprise'
  }
]

export const MOCK_INSIGHTS: FinancialInsight[] = []

const MOCK_INSIGHTS_OLD = [
  {
    id: 'insight_001',
    type: 'revenue_optimization',
    title: 'Premium Pricing Opportunity',
    description: 'Your average project value increased 34% this quarter. Consider implementing premium pricing for enterprise clients.',
    impact: 'high',
    potentialValue: 15600,
    actionable: true,
    confidence: 92,
    category: 'pricing'
  },
  {
    id: 'insight_002',
    type: 'cash_flow',
    title: 'Invoice Collection Optimization',
    description: 'You have 1 overdue invoice totaling $8,750. Following up within 48 hours increases collection rate by 40%.',
    impact: 'medium',
    potentialValue: 8400,
    actionable: true,
    confidence: 87,
    category: 'operations'
  },
  {
    id: 'insight_003',
    type: 'cost_reduction',
    title: 'Subscription Optimization',
    description: 'Annual software subscriptions could save you $2,400/year vs monthly billing. Consider upgrading Adobe and other tools.',
    impact: 'low',
    potentialValue: 2400,
    actionable: true,
    confidence: 95,
    category: 'expenses'
  }
]

export const MOCK_FINANCIAL_OVERVIEW: FinancialOverview = {
  totalRevenue: 0,
  monthlyRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  profitMargin: 0,
  monthlyGrowth: 0,
  quarterlyGrowth: 0,
  yearlyGrowth: 0,
  cashFlow: 0,
  accountsReceivable: 0,
  accountsPayable: 0
}

export const MOCK_ANALYTICS: FinancialAnalytics = {
  revenuePerClient: 0,
  averageProjectValue: 0,
  clientRetentionRate: 0,
  projectProfitability: 0,
  operationalEfficiency: 0,
  burnRate: 0,
  runwayMonths: 0,
  breakEvenPoint: 0,
  roi: 0,
  costPerAcquisition: 0
}

export const MOCK_TAX_INFO: TaxInfo = {
  quarterlyEstimate: 0,
  yearToDateTax: 0,
  deductions: {
    homeOffice: 0,
    equipment: 0,
    software: 0,
    professional: 0
  },
  documents: []
}

export const MOCK_GOALS: FinancialGoals = {
  monthlyRevenue: { target: 0, current: 0, progress: 0 },
  quarterlyGrowth: { target: 0, current: 0, progress: 0 },
  profitMargin: { target: 0, current: 0, progress: 0 },
  clientAcquisition: { target: 0, current: 0, progress: 0 },
  emergencyFund: { target: 0, current: 0, progress: 0 }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export const getTransactionTypeColor = (type: 'income' | 'expense'): string => {
  return type === 'income'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200'
}

export const getInvoiceStatusColor = (status: Invoice['status']): string => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 border-green-200'
    case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getInsightImpactColor = (impact: FinancialInsight['impact']): string => {
  switch (impact) {
    case 'high': return 'border-red-300 bg-red-50'
    case 'medium': return 'border-yellow-300 bg-yellow-50'
    case 'low': return 'border-green-300 bg-green-50'
    default: return 'border-gray-300 bg-gray-50'
  }
}

export const calculateInvoiceTotal = (invoice: Invoice): number => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const discount = invoice.discount || 0
  const taxAmount = (subtotal - discount) * (invoice.taxRate / 100)
  return subtotal - discount + taxAmount
}

export const calculateInvoiceSubtotal = (invoice: Invoice): number => {
  return invoice.items.reduce((sum, item) => sum + item.amount, 0)
}

export const calculateInvoiceTax = (invoice: Invoice): number => {
  const subtotal = calculateInvoiceSubtotal(invoice)
  const discount = invoice.discount || 0
  return (subtotal - discount) * (invoice.taxRate / 100)
}

export const isInvoiceOverdue = (invoice: Invoice): boolean => {
  if (invoice.status === 'paid') return false
  return new Date(invoice.dueDate) < new Date()
}

export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const getPaymentMethodLabel = (method: Transaction['paymentMethod']): string => {
  const labels: Record<Transaction['paymentMethod'], string> = {
    bank_transfer: 'Bank Transfer',
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    platform: 'Platform Payment',
    cash: 'Cash'
  }
  return labels[method] || method
}

export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: string,
  endDate: string
): Transaction[] => {
  return transactions.filter(txn => {
    const txnDate = new Date(txn.date)
    return txnDate >= new Date(startDate) && txnDate <= new Date(endDate)
  })
}

export const filterInvoicesByStatus = (
  invoices: Invoice[],
  status: Invoice['status'] | 'all'
): Invoice[] => {
  if (status === 'all') return invoices
  return invoices.filter(inv => inv.status === status)
}

export const calculateTotalRevenue = (transactions: Transaction[]): number => {
  return transactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0)
}

export const calculateTotalExpenses = (transactions: Transaction[]): number => {
  return transactions
    .filter(txn => txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0)
}

export const calculateNetProfit = (transactions: Transaction[]): number => {
  return calculateTotalRevenue(transactions) - calculateTotalExpenses(transactions)
}

export const groupTransactionsByCategory = (transactions: Transaction[]): Record<string, Transaction[]> => {
  return transactions.reduce((groups, txn) => {
    const category = txn.category
    if (!groups[category]) groups[category] = []
    groups[category].push(txn)
    return groups
  }, {} as Record<string, Transaction[]>)
}

export const getTransactionCategories = (transactions: Transaction[]): string[] => {
  const categories = new Set(transactions.map(txn => txn.category))
  return Array.from(categories).sort()
}

// Export all at once for convenience
export const FinancialUtils = {
  formatCurrency,
  formatPercent,
  formatDate,
  getTransactionTypeColor,
  getInvoiceStatusColor,
  getInsightImpactColor,
  calculateInvoiceTotal,
  calculateInvoiceSubtotal,
  calculateInvoiceTax,
  isInvoiceOverdue,
  getDaysUntilDue,
  getPaymentMethodLabel,
  filterTransactionsByDateRange,
  filterInvoicesByStatus,
  calculateTotalRevenue,
  calculateTotalExpenses,
  calculateNetProfit,
  groupTransactionsByCategory,
  getTransactionCategories
}
