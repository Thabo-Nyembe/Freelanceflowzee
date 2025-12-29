// Financial Data - Revenue, Expenses, Transactions, Invoices
// All figures tell a strong growth story for investors

export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  account: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  status: 'cleared' | 'pending' | 'reconciled'
  payee?: string
  reference?: string
  customerId?: string
}

export interface Invoice {
  id: string
  number: string
  customer: string
  customerId: string
  company: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  notes?: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Expense {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  submittedBy: string
  receipt?: string
  notes?: string
}

// Bank Accounts
export const BANK_ACCOUNTS = [
  { id: 'bank-001', name: 'Operating Account', institution: 'Silicon Valley Bank', accountNumber: '****4521', type: 'checking', balance: 2847350.50, lastSync: '2025-01-28T10:30:00Z', status: 'connected' },
  { id: 'bank-002', name: 'Payroll Account', institution: 'Silicon Valley Bank', accountNumber: '****7832', type: 'checking', balance: 485000.00, lastSync: '2025-01-28T10:30:00Z', status: 'connected' },
  { id: 'bank-003', name: 'Reserve Account', institution: 'First Republic', accountNumber: '****3456', type: 'savings', balance: 1250000.00, lastSync: '2025-01-28T10:30:00Z', status: 'connected' },
  { id: 'bank-004', name: 'Corporate Card', institution: 'American Express', accountNumber: '****9012', type: 'credit', balance: -45890.00, lastSync: '2025-01-27T18:00:00Z', status: 'connected' },
]

// Recent Transactions
export const TRANSACTIONS: Transaction[] = [
  { id: 'txn-001', date: '2025-01-28', description: 'Nike - Enterprise License Q1', category: 'Subscription Revenue', account: 'Operating Account', amount: 75000, type: 'income', status: 'cleared', payee: 'Nike Inc', reference: 'INV-2025-0128', customerId: 'comp-002' },
  { id: 'txn-002', date: '2025-01-27', description: 'Spotify - Monthly Subscription', category: 'Subscription Revenue', account: 'Operating Account', amount: 12500, type: 'income', status: 'cleared', payee: 'Spotify AB', reference: 'INV-2025-0127', customerId: 'comp-001' },
  { id: 'txn-003', date: '2025-01-27', description: 'AWS Infrastructure', category: 'Cloud Services', account: 'Corporate Card', amount: -28450, type: 'expense', status: 'cleared', payee: 'Amazon Web Services' },
  { id: 'txn-004', date: '2025-01-26', description: 'Payroll - January 2nd Half', category: 'Payroll', account: 'Payroll Account', amount: -245000, type: 'expense', status: 'reconciled', payee: 'Gusto Payroll' },
  { id: 'txn-005', date: '2025-01-26', description: 'Airbnb - Subscription Renewal', category: 'Subscription Revenue', account: 'Operating Account', amount: 4200, type: 'income', status: 'cleared', payee: 'Airbnb Inc', reference: 'INV-2025-0126', customerId: 'comp-004' },
  { id: 'txn-006', date: '2025-01-25', description: 'Google Workspace', category: 'Software', account: 'Corporate Card', amount: -1890, type: 'expense', status: 'cleared', payee: 'Google LLC' },
  { id: 'txn-007', date: '2025-01-25', description: 'Stripe - Professional Services', category: 'Service Revenue', account: 'Operating Account', amount: 15000, type: 'income', status: 'cleared', payee: 'Stripe Inc', reference: 'INV-2025-0125', customerId: 'comp-005' },
  { id: 'txn-008', date: '2025-01-24', description: 'WeWork Office Rent', category: 'Rent', account: 'Operating Account', amount: -45000, type: 'expense', status: 'cleared', payee: 'WeWork' },
  { id: 'txn-009', date: '2025-01-24', description: 'Creative Studio NYC - Annual', category: 'Subscription Revenue', account: 'Operating Account', amount: 18960, type: 'income', status: 'cleared', payee: 'Creative Studio NYC', reference: 'INV-2025-0124', customerId: 'comp-006' },
  { id: 'txn-010', date: '2025-01-23', description: 'Marketing - LinkedIn Ads', category: 'Marketing', account: 'Corporate Card', amount: -15000, type: 'expense', status: 'pending', payee: 'LinkedIn' },
]

// Invoices
export const INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    number: 'INV-2025-0145',
    customer: 'James Rodriguez',
    customerId: 'cust-002',
    company: 'Nike',
    amount: 75000,
    status: 'sent',
    issueDate: '2025-01-28',
    dueDate: '2025-02-27',
    items: [
      { description: 'Enterprise License - Q1 2025', quantity: 1, unitPrice: 56250, total: 56250 },
      { description: 'Premium Support Package', quantity: 1, unitPrice: 18750, total: 18750 },
    ]
  },
  {
    id: 'inv-002',
    number: 'INV-2025-0144',
    customer: 'Sarah Mitchell',
    customerId: 'cust-001',
    company: 'Spotify',
    amount: 12500,
    status: 'paid',
    issueDate: '2025-01-15',
    dueDate: '2025-02-14',
    paidDate: '2025-01-27',
    items: [
      { description: 'Enterprise License - January 2025', quantity: 1, unitPrice: 12500, total: 12500 },
    ]
  },
  {
    id: 'inv-003',
    number: 'INV-2025-0143',
    customer: 'Emma Thompson',
    customerId: 'cust-003',
    company: 'Shopify',
    amount: 8500,
    status: 'sent',
    issueDate: '2025-01-20',
    dueDate: '2025-02-19',
    items: [
      { description: 'Enterprise License - January 2025', quantity: 1, unitPrice: 8500, total: 8500 },
    ]
  },
  {
    id: 'inv-004',
    number: 'INV-2025-0142',
    customer: 'David Kim',
    customerId: 'cust-004',
    company: 'Airbnb',
    amount: 4200,
    status: 'paid',
    issueDate: '2025-01-10',
    dueDate: '2025-02-09',
    paidDate: '2025-01-26',
    items: [
      { description: 'Business Plan - January 2025', quantity: 1, unitPrice: 4200, total: 4200 },
    ]
  },
  {
    id: 'inv-005',
    number: 'INV-2025-0141',
    customer: 'Marcus Johnson',
    customerId: 'cust-006',
    company: 'Creative Studio NYC',
    amount: 1580,
    status: 'overdue',
    issueDate: '2025-01-01',
    dueDate: '2025-01-15',
    items: [
      { description: 'Professional Plan - January 2025', quantity: 1, unitPrice: 1580, total: 1580 },
    ]
  },
  {
    id: 'inv-006',
    number: 'INV-2025-0140',
    customer: 'Lisa Wang',
    customerId: 'cust-005',
    company: 'Stripe',
    amount: 19000,
    status: 'paid',
    issueDate: '2025-01-05',
    dueDate: '2025-02-04',
    paidDate: '2025-01-25',
    items: [
      { description: 'Business Plan - January 2025', quantity: 1, unitPrice: 3800, total: 3800 },
      { description: 'Professional Services - Setup', quantity: 1, unitPrice: 15000, total: 15000 },
      { description: 'Training Sessions (2)', quantity: 2, unitPrice: 100, total: 200 },
    ]
  },
]

// Expenses
export const EXPENSES: Expense[] = [
  { id: 'exp-001', date: '2025-01-27', vendor: 'Amazon Web Services', category: 'Cloud Infrastructure', amount: 28450, status: 'approved', submittedBy: 'David Thompson' },
  { id: 'exp-002', date: '2025-01-25', vendor: 'Google LLC', category: 'Software', amount: 1890, status: 'paid', submittedBy: 'Emily Davis' },
  { id: 'exp-003', date: '2025-01-24', vendor: 'WeWork', category: 'Office Rent', amount: 45000, status: 'paid', submittedBy: 'Finance Team' },
  { id: 'exp-004', date: '2025-01-23', vendor: 'LinkedIn', category: 'Marketing', amount: 15000, status: 'pending', submittedBy: 'Sarah Johnson' },
  { id: 'exp-005', date: '2025-01-22', vendor: 'Figma', category: 'Design Tools', amount: 1200, status: 'approved', submittedBy: 'Lisa Park' },
  { id: 'exp-006', date: '2025-01-20', vendor: 'Datadog', category: 'Monitoring', amount: 2500, status: 'paid', submittedBy: 'David Thompson' },
  { id: 'exp-007', date: '2025-01-18', vendor: 'Zoom', category: 'Communication', amount: 850, status: 'paid', submittedBy: 'Robert Kim' },
  { id: 'exp-008', date: '2025-01-15', vendor: 'Anthropic', category: 'AI Services', amount: 8500, status: 'paid', submittedBy: 'Marcus Williams' },
]

// P&L Summary
export const PROFIT_LOSS = {
  revenue: {
    subscriptionRevenue: 847000,
    serviceRevenue: 125000,
    otherIncome: 15000,
    total: 987000
  },
  costOfRevenue: {
    cloudInfrastructure: 85200,
    paymentProcessing: 29610,
    support: 45000,
    total: 159810
  },
  grossProfit: 827190,
  grossMargin: 83.8,
  operatingExpenses: {
    salaries: 485000,
    marketing: 95000,
    sales: 65000,
    office: 48000,
    software: 25000,
    professional: 18000,
    other: 15000,
    total: 751000
  },
  operatingIncome: 76190,
  netIncome: 68571,
}

// Cash Flow Summary
export const CASH_FLOW = {
  operating: {
    netIncome: 68571,
    depreciation: 12500,
    arChange: -45000,
    apChange: 28000,
    total: 64071
  },
  investing: {
    equipment: -25000,
    software: -15000,
    total: -40000
  },
  financing: {
    loanRepayment: 0,
    dividends: 0,
    total: 0
  },
  netChange: 24071,
  beginningCash: 4558279.50,
  endingCash: 4582350.50
}

// Budget vs Actual
export const BUDGET_COMPARISON = [
  { category: 'Revenue', budgeted: 850000, actual: 987000, variance: 137000, variancePercent: 16.1 },
  { category: 'Cloud Services', budgeted: 90000, actual: 85200, variance: 4800, variancePercent: -5.3 },
  { category: 'Salaries', budgeted: 500000, actual: 485000, variance: 15000, variancePercent: -3.0 },
  { category: 'Marketing', budgeted: 100000, actual: 95000, variance: 5000, variancePercent: -5.0 },
  { category: 'Office & Rent', budgeted: 50000, actual: 48000, variance: 2000, variancePercent: -4.0 },
  { category: 'Software', budgeted: 28000, actual: 25000, variance: 3000, variancePercent: -10.7 },
]

// Financial KPIs
export const FINANCIAL_KPIS = {
  mrr: 847000,
  arr: 10164000,
  mrrGrowth: 18.5,
  netRevenue: 987000,
  grossMargin: 83.8,
  operatingMargin: 7.7,
  cashBalance: 4582350.50,
  runway: 24, // months
  burnRate: 425000,
  arDays: 32,
  currentRatio: 3.2,
  quickRatio: 2.8,
}

// Monthly Financial Trend
export const MONTHLY_FINANCIALS = [
  { month: 'Aug 2024', revenue: 645000, expenses: 520000, profit: 125000, cashFlow: 95000 },
  { month: 'Sep 2024', revenue: 698000, expenses: 545000, profit: 153000, cashFlow: 128000 },
  { month: 'Oct 2024', revenue: 752000, expenses: 580000, profit: 172000, cashFlow: 145000 },
  { month: 'Nov 2024', revenue: 789000, expenses: 610000, profit: 179000, cashFlow: 152000 },
  { month: 'Dec 2024', revenue: 823000, expenses: 695000, profit: 128000, cashFlow: 98000 },
  { month: 'Jan 2025', revenue: 987000, expenses: 918429, profit: 68571, cashFlow: 24071 },
]
