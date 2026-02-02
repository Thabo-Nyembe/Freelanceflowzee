'use client'

import { useState, useMemo, useEffect } from 'react'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/lib/hooks/use-expenses'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Receipt, DollarSign, CheckCircle, XCircle, Clock, Search,
  Upload, Camera, CreditCard, Plane, Car, Coffee, ShoppingBag,
  Building, Globe, TrendingUp, Calendar, FileText, Download, AlertTriangle,
  BarChart3, PieChart, Users, Send, Plus, ChevronRight,
  Banknote, MapPin, Shield, ArrowRight, Settings, Bell, Link2,
  Key, Database, RefreshCw, Mail, Webhook, Timer,
  Wallet, Building2, UserCog
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

import {
  CollapsibleInsightsPanel,
  InsightsToggleButton,
  useInsightsPanel
} from '@/components/ui/collapsible-insights-panel'

// Types
type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed' | 'processing'
type ExpenseCategory = 'travel' | 'meals' | 'transport' | 'lodging' | 'supplies' | 'software' | 'entertainment' | 'other'
type PaymentMethod = 'cash' | 'corporate_card' | 'personal_card' | 'bank_transfer'
type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'

interface ExpenseLineItem {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  merchant: string
  receipt?: string
  taxAmount?: number
  isBillable: boolean
  projectCode?: string
}

interface ExpenseReport {
  id: string
  title: string
  status: ExpenseStatus
  submittedBy: { id: string; name: string; email: string; avatar: string; department: string }
  approver?: { id: string; name: string; email: string; avatar: string }
  lineItems: ExpenseLineItem[]
  totalAmount: number
  currency: Currency
  paymentMethod: PaymentMethod
  createdAt: string
  submittedAt?: string
  approvedAt?: string
  reimbursedAt?: string
  notes?: string
  policyViolations: { rule: string; severity: 'warning' | 'error' }[]
  attachments: number
  tripId?: string
}

interface Policy {
  id: string
  name: string
  category: ExpenseCategory
  maxAmount: number
  requiresReceipt: boolean
  requiresApproval: boolean
  approvalThreshold: number
  notes: string
}

interface MileageEntry {
  id: string
  date: string
  origin: string
  destination: string
  distance: number
  rate: number
  purpose: string
  status: ExpenseStatus
}

interface PerDiem {
  id: string
  location: string
  startDate: string
  endDate: string
  dailyRate: number
  totalAmount: number
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
  status: ExpenseStatus
}

interface ExpensesClientProps {
  initialExpenses: any[]
}

// Mock Data
const mockEmployees = [
  { id: 'e1', name: 'Sarah Johnson', email: 'sarah@company.com', avatar: '/avatars/sarah.jpg', department: 'Engineering' },
  { id: 'e2', name: 'Mike Chen', email: 'mike@company.com', avatar: '/avatars/mike.jpg', department: 'Sales' },
  { id: 'e3', name: 'Emily Davis', email: 'emily@company.com', avatar: '/avatars/emily.jpg', department: 'Marketing' },
]

const mockReports: ExpenseReport[] = [
  {
    id: 'r1', title: 'Q1 Sales Conference - NYC', status: 'pending',
    submittedBy: mockEmployees[1], approver: mockEmployees[0],
    lineItems: [
      { id: 'l1', description: 'Flight to NYC', amount: 450, category: 'travel', date: '2024-01-15', merchant: 'Delta Airlines', isBillable: false, taxAmount: 0 },
      { id: 'l2', description: 'Hotel - 3 nights', amount: 890, category: 'lodging', date: '2024-01-15', merchant: 'Marriott Times Square', isBillable: false, taxAmount: 89 },
      { id: 'l3', description: 'Client dinner', amount: 245, category: 'meals', date: '2024-01-16', merchant: 'The Capital Grille', isBillable: true, projectCode: 'PRJ-2024-001', taxAmount: 24.5 },
      { id: 'l4', description: 'Uber rides', amount: 78, category: 'transport', date: '2024-01-17', merchant: 'Uber', isBillable: false, taxAmount: 0 },
    ],
    totalAmount: 1663, currency: 'USD', paymentMethod: 'corporate_card',
    createdAt: '2024-01-18', submittedAt: '2024-01-18',
    policyViolations: [{ rule: 'Meal expense exceeds $200 daily limit', severity: 'warning' }],
    attachments: 4
  },
  {
    id: 'r2', title: 'Software Licenses - January', status: 'approved',
    submittedBy: mockEmployees[0],
    lineItems: [
      { id: 'l5', description: 'GitHub Enterprise', amount: 1200, category: 'software', date: '2024-01-01', merchant: 'GitHub', isBillable: false, taxAmount: 0 },
      { id: 'l6', description: 'Figma Team', amount: 45, category: 'software', date: '2024-01-01', merchant: 'Figma', isBillable: false, taxAmount: 0 },
    ],
    totalAmount: 1245, currency: 'USD', paymentMethod: 'corporate_card',
    createdAt: '2024-01-05', submittedAt: '2024-01-05', approvedAt: '2024-01-06',
    policyViolations: [], attachments: 2
  },
  {
    id: 'r3', title: 'Office Supplies', status: 'reimbursed',
    submittedBy: mockEmployees[2],
    lineItems: [
      { id: 'l7', description: 'Printer paper & ink', amount: 89, category: 'supplies', date: '2024-01-10', merchant: 'Staples', isBillable: false, taxAmount: 8.9 },
      { id: 'l8', description: 'Standing desk mat', amount: 65, category: 'supplies', date: '2024-01-10', merchant: 'Amazon', isBillable: false, taxAmount: 6.5 },
    ],
    totalAmount: 154, currency: 'USD', paymentMethod: 'personal_card',
    createdAt: '2024-01-12', submittedAt: '2024-01-12', approvedAt: '2024-01-13', reimbursedAt: '2024-01-15',
    policyViolations: [], attachments: 2
  },
  {
    id: 'r4', title: 'Team Building Event', status: 'draft',
    submittedBy: mockEmployees[0],
    lineItems: [
      { id: 'l9', description: 'Escape room booking', amount: 320, category: 'entertainment', date: '2024-01-20', merchant: 'Escape Room NYC', isBillable: false, taxAmount: 32 },
    ],
    totalAmount: 320, currency: 'USD', paymentMethod: 'corporate_card',
    createdAt: '2024-01-19',
    policyViolations: [], attachments: 1
  },
]

const mockPolicies: Policy[] = [
  { id: 'p1', name: 'Meals', category: 'meals', maxAmount: 75, requiresReceipt: true, requiresApproval: true, approvalThreshold: 50, notes: 'Per person per meal' },
  { id: 'p2', name: 'Travel', category: 'travel', maxAmount: 1000, requiresReceipt: true, requiresApproval: true, approvalThreshold: 500, notes: 'Flights must be economy class' },
  { id: 'p3', name: 'Lodging', category: 'lodging', maxAmount: 300, requiresReceipt: true, requiresApproval: true, approvalThreshold: 200, notes: 'Per night maximum' },
  { id: 'p4', name: 'Software', category: 'software', maxAmount: 500, requiresReceipt: true, requiresApproval: true, approvalThreshold: 100, notes: 'Manager approval required' },
]

const mockMileage: MileageEntry[] = [
  { id: 'm1', date: '2024-01-15', origin: 'Office', destination: 'Client Site A', distance: 25, rate: 0.67, purpose: 'Client meeting', status: 'approved' },
  { id: 'm2', date: '2024-01-17', origin: 'Office', destination: 'Airport', distance: 18, rate: 0.67, purpose: 'Business travel', status: 'pending' },
]

const mockPerDiems: PerDiem[] = [
  { id: 'pd1', location: 'New York, NY', startDate: '2024-01-15', endDate: '2024-01-18', dailyRate: 79, totalAmount: 237, meals: { breakfast: true, lunch: true, dinner: true }, status: 'pending' },
]

// Competitive Upgrade Mock Data - Expensify/SAP Concur-level Expense Intelligence
const mockExpensesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Policy Compliance', description: 'All expense reports comply with company policy!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Compliance' },
  { id: '2', type: 'warning' as const, title: 'Receipt Missing', description: '5 expenses over $25 need receipts attached.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Documentation' },
  { id: '3', type: 'info' as const, title: 'AI Analysis', description: 'Travel spending 15% under budget this quarter.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockExpensesCollaborators = [
  { id: '1', name: 'Finance Manager', avatar: '/avatars/finance.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Approver', avatar: '/avatars/approver.jpg', status: 'online' as const, role: 'Approver' },
  { id: '3', name: 'Accountant', avatar: '/avatars/accountant.jpg', status: 'away' as const, role: 'Accountant' },
]

const mockExpensesPredictions = [
  { id: '1', title: 'Monthly Spend', prediction: 'Team expenses will reach $45K by month end', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Reimbursement', prediction: 'Average reimbursement time will drop to 3 days', confidence: 82, trend: 'down' as const, impact: 'medium' as const },
]

const mockExpensesActivities = [
  { id: '1', user: 'Finance Manager', action: 'Approved', target: '12 expense reports', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Approver', action: 'Requested', target: 'additional documentation', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Accountant', action: 'Processed', target: '$8,500 reimbursement batch', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside component to access state

export default function ExpensesClient({ initialExpenses }: ExpensesClientProps) {
  const insightsPanel = useInsightsPanel(false)
  const [activeTab, setActiveTab] = useState('reports')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReport, setSelectedReport] = useState<ExpenseReport | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showNewExpenseDialog, setShowNewExpenseDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')

  // Quick Actions Dialog States
  const [showScanReceiptDialog, setShowScanReceiptDialog] = useState(false)
  const [showGenerateReportDialog, setShowGenerateReportDialog] = useState(false)
  const [showAddMileageDialog, setShowAddMileageDialog] = useState(false)
  const [showPerDiemDialog, setShowPerDiemDialog] = useState(false)
  const [showLinkCardDialog, setShowLinkCardDialog] = useState(false)

  // Form states for dialogs
  const [scanReceiptFile, setScanReceiptFile] = useState<File | null>(null)
  const [scanReceiptProcessing, setScanReceiptProcessing] = useState(false)
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' })
  const [reportFormat, setReportFormat] = useState('pdf')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [mileageForm, setMileageForm] = useState({
    origin: '',
    destination: '',
    distance: 0,
    purpose: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [perDiemForm, setPerDiemForm] = useState({
    location: '',
    startDate: '',
    endDate: '',
    meals: { breakfast: true, lunch: true, dinner: true }
  })
  const [linkCardForm, setLinkCardForm] = useState({
    cardType: 'visa',
    lastFour: '',
    nickname: ''
  })

  // Database integration - use real expenses hooks
  const { data: dbExpenses, loading: expensesLoading, refetch } = useExpenses({ status: statusFilter as string })
  const { mutate: createExpense, loading: creating } = useCreateExpense()
  const { mutate: updateExpense, loading: updating } = useUpdateExpense()
  const { mutate: deleteExpense, loading: deleting } = useDeleteExpense()

  // Form state for new expense
  const [newExpenseForm, setNewExpenseForm] = useState({
    title: '',
    paymentMethod: 'corporate_card',
    notes: '',
    amount: 0,
    category: 'travel' as const
  })

  // Fetch expenses on mount
  useEffect(() => {
    refetch()
  }, [refetch])

  // Handle creating a new expense
  const handleCreateExpense = async () => {
    if (!newExpenseForm.title) {
      toast.error('Please enter a report title')
      return
    }
    try {
      await createExpense({
        expense_title: newExpenseForm.title,
        expense_category: newExpenseForm.category,
        amount: newExpenseForm.amount,
        total_amount: newExpenseForm.amount,
        currency: 'USD',
        status: 'draft',
        payment_method: newExpenseForm.paymentMethod,
        description: newExpenseForm.notes || null,
        expense_date: new Date().toISOString().split('T')[0]
      })
      setShowNewExpenseDialog(false)
      setNewExpenseForm({ title: '', paymentMethod: 'corporate_card', notes: '', amount: 0, category: 'travel' })
      toast.success('Expense report created')
      refetch()
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }

  const reports = mockReports
  const policies = mockPolicies
  const mileage = mockMileage
  const perDiems = mockPerDiems

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (statusFilter !== 'all' && report.status !== statusFilter) return false
      if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !report.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [reports, statusFilter, searchQuery])

  const stats = {
    totalExpenses: reports.reduce((sum, r) => sum + r.totalAmount, 0),
    pendingApproval: reports.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.totalAmount, 0),
    approved: reports.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.totalAmount, 0),
    reimbursed: reports.filter(r => r.status === 'reimbursed').reduce((sum, r) => sum + r.totalAmount, 0),
    pendingCount: reports.filter(r => r.status === 'pending').length,
    avgProcessingTime: 2.3
  }

  const getStatusColor = (status: ExpenseStatus) => {
    const colors: Record<ExpenseStatus, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      reimbursed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700'
    }
    return colors[status]
  }

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<ExpenseCategory, any> = {
      travel: Plane, meals: Coffee, transport: Car, lodging: Building,
      supplies: ShoppingBag, software: Globe, entertainment: Users, other: Receipt
    }
    return icons[category] || Receipt
  }

  const getCategoryColor = (category: ExpenseCategory) => {
    const colors: Record<ExpenseCategory, string> = {
      travel: 'bg-blue-100 text-blue-700',
      meals: 'bg-orange-100 text-orange-700',
      transport: 'bg-cyan-100 text-cyan-700',
      lodging: 'bg-purple-100 text-purple-700',
      supplies: 'bg-green-100 text-green-700',
      software: 'bg-indigo-100 text-indigo-700',
      entertainment: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category]
  }

  const openReportDetails = (report: ExpenseReport) => {
    setSelectedReport(report)
    setShowReportDialog(true)
  }

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    reports.forEach(report => {
      report.lineItems.forEach(item => {
        breakdown[item.category] = (breakdown[item.category] || 0) + item.amount
      })
    })
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1])
  }, [reports])

  // Handlers - Real Supabase operations
  const handleApproveExpense = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      toast.success('Expense "' + title + '" has been approved')
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to approve expense:', error)
      toast.error('Failed to approve expense')
    }
  }

  const handleRejectExpense = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'rejected'
      })
      toast.success('Expense "' + title + '" has been rejected')
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to reject expense:', error)
      toast.error('Failed to reject expense')
    }
  }

  const handleReimburseExpense = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'reimbursed',
        reimbursed_at: new Date().toISOString(),
        reimbursed: true
      })
      toast.success('Expense "' + title + '" has been marked as reimbursed')
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to reimburse expense:', error)
      toast.error('Failed to reimburse expense')
    }
  }

  const handleDeleteExpense = async (expenseId: string, title: string) => {
    try {
      await deleteExpense({ id: expenseId })
      toast.success('Expense "' + title + '" has been deleted')
      setShowReportDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const handleExportExpenses = async () => {
    toast.success('Export started')
    try {
      const response = await fetch('/api/expenses?action=export', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to export expenses')
      }

      const data = await response.json()
      toast.success('Export completed')
    } catch (error) {
      console.error('Failed to export expenses:', error)
      toast.error('Failed to export expenses')
    }
  }

  const handleSubmitReport = async (expenseId: string, title: string) => {
    try {
      await updateExpense({
        id: expenseId,
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      toast.success('Report "' + title + '" submitted for approval')
      refetch()
    } catch (error) {
      console.error('Failed to submit report:', error)
      toast.error('Failed to submit report')
    }
  }

  const handleAddReceipt = () => {
    setShowScanReceiptDialog(true)
  }

  // Scan Receipt Handler
  const handleScanReceipt = async () => {
    if (!scanReceiptFile) {
      toast.error('Please select a receipt file')
      return
    }
    setScanReceiptProcessing(true)
    toast.success('Scanning receipt...')
    try {
      const formData = new FormData()
      formData.append('file', scanReceiptFile)
      formData.append('action', 'scan_receipt')

      const response = await fetch('/api/expenses', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to scan receipt')
      }

      const data = await response.json()
      toast.success('Receipt scanned successfully')
      setScanReceiptFile(null)
      setShowScanReceiptDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to scan receipt:', error)
      toast.error('Failed to scan receipt')
    } finally {
      setScanReceiptProcessing(false)
    }
  }

  // Generate Report Handler
  const handleGenerateReport = async () => {
    if (!reportDateRange.start || !reportDateRange.end) {
      toast.error('Please select a date range')
      return
    }
    setGeneratingReport(true)
    toast.success('Generating report...')
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_report',
          startDate: reportDateRange.start,
          endDate: reportDateRange.end,
          format: reportFormat
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to generate report')
      }

      const data = await response.json()
      toast.success("Expense report generated for " + reportDateRange.start + " to " + reportDateRange.end)
      setReportDateRange({ start: '', end: '' })
      setShowGenerateReportDialog(false)
    } catch (error) {
      console.error('Failed to generate report:', error)
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  // Add Mileage Handler
  const handleAddMileage = async () => {
    if (!mileageForm.origin || !mileageForm.destination || !mileageForm.distance) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Adding mileage entry...')
    try {
      const reimbursement = mileageForm.distance * 0.67
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_mileage',
          expense_category: 'transport',
          origin: mileageForm.origin,
          destination: mileageForm.destination,
          distance: mileageForm.distance,
          rate: 0.67,
          purpose: mileageForm.purpose,
          date: mileageForm.date,
          amount: reimbursement
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to add mileage entry')
      }

      toast.success(mileageForm.distance + " miles - $" + reimbursement.toFixed(2) + " reimbursement")
      setMileageForm({
        origin: '',
        destination: '',
        distance: 0,
        purpose: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddMileageDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to add mileage entry:', error)
      toast.error('Failed to add mileage entry')
    }
  }

  // Request Per Diem Handler
  const handleRequestPerDiem = async () => {
    if (!perDiemForm.location || !perDiemForm.startDate || !perDiemForm.endDate) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success('Submitting per diem request...')
    try {
      const days = Math.ceil((new Date(perDiemForm.endDate).getTime() - new Date(perDiemForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
      const dailyRate = 79 // Default GSA rate
      const totalAmount = days * dailyRate

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_per_diem',
          expense_category: 'travel',
          location: perDiemForm.location,
          startDate: perDiemForm.startDate,
          endDate: perDiemForm.endDate,
          dailyRate,
          totalAmount,
          meals: perDiemForm.meals,
          days
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit per diem request')
      }

      toast.success(days + " days in " + perDiemForm.location + " - $" + totalAmount + " total")
      setPerDiemForm({
        location: '',
        startDate: '',
        endDate: '',
        meals: { breakfast: true, lunch: true, dinner: true }
      })
      setShowPerDiemDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to submit per diem request:', error)
      toast.error('Failed to submit per diem request')
    }
  }

  // Link Card Handler
  const handleLinkCard = async () => {
    if (!linkCardForm.lastFour || linkCardForm.lastFour.length !== 4) {
      toast.error('Please enter the last 4 digits of your card')
      return
    }
    toast.success('Linking card...')
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link_card',
          cardType: linkCardForm.cardType,
          lastFour: linkCardForm.lastFour,
          nickname: linkCardForm.nickname
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to link card')
      }

      toast.success("Card ending in " + linkCardForm.lastFour + " connected")
      setLinkCardForm({
        cardType: 'visa',
        lastFour: '',
        nickname: ''
      })
      setShowLinkCardDialog(false)
    } catch (error) {
      console.error('Failed to link card:', error)
      toast.error('Failed to link card')
    }
  }

  // Quick Actions with real dialog functionality
  const expensesQuickActions = [
    { id: '1', label: 'New Expense', icon: 'plus', action: () => setShowNewExpenseDialog(true), variant: 'default' as const },
    { id: '2', label: 'Scan Receipt', icon: 'camera', action: () => setShowScanReceiptDialog(true), variant: 'default' as const },
    { id: '3', label: 'Report', icon: 'file-text', action: () => setShowGenerateReportDialog(true), variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Receipt className="h-8 w-8" />
                Expense Management
              </h1>
              <p className="text-purple-100 mt-1">Track, submit, and manage expense reports</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-white text-purple-600 hover:bg-purple-50" onClick={() => setShowNewExpenseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Expense
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {[
              { label: 'Total Expenses', value: "$" + (stats.totalExpenses / 1000).toFixed(1) + "K", icon: DollarSign, trend: '+12.5%' },
              { label: 'Pending Approval', value: "$" + (stats.pendingApproval / 1000).toFixed(1) + "K", icon: Clock, count: stats.pendingCount },
              { label: 'Approved', value: "$" + (stats.approved / 1000).toFixed(1) + "K", icon: CheckCircle, trend: '+8.3%' },
              { label: 'Reimbursed', value: "$" + (stats.reimbursed / 1000).toFixed(1) + "K", icon: Banknote, trend: '+15.2%' },
              { label: 'Avg Processing', value: stats.avgProcessingTime + " days", icon: TrendingUp, trend: '-0.5 days' },
              { label: 'Policy Compliance', value: '94%', icon: Shield, trend: '+2.1%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-purple-200" />
                  {stat.trend && <span className="text-xs text-emerald-300">{stat.trend}</span>}
                  {stat.count !== undefined && <Badge className="bg-yellow-500 text-xs">{stat.count}</Badge>}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-purple-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="reports">Expense Reports</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="mileage">Mileage</TabsTrigger>
            <TabsTrigger value="per-diem">Per Diem</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Expense Reports Tab */}
          <TabsContent value="reports">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Expense Reports</h2>
                  <p className="text-emerald-100">Expensify-level expense management</p>
                  <p className="text-emerald-200 text-xs mt-1">Receipt scanning • Approval workflows • Reimbursements</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{dbExpenses?.length || reports.length}</p>
                    <p className="text-emerald-200 text-sm">Reports</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${(dbExpenses?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || stats.totalExpenses).toLocaleString()}</p>
                    <p className="text-emerald-200 text-sm">Total</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              {/* Report List */}
              <div className="flex-1">
                {/* Filters */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="reimbursed">Reimbursed</option>
                  </select>
                </div>

                {/* Quick Filters */}
                <div className="flex gap-2 mb-4">
                  {[
                    { label: 'My Reports', count: 3 },
                    { label: 'Needs Review', count: 2 },
                    { label: 'Policy Violations', count: 1 },
                    { label: 'This Month', count: 4 },
                  ].map((filter, i) => (
                    <button key={i} className="px-3 py-1.5 bg-white border rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                      {filter.label}
                      <Badge variant="secondary" className="text-xs">{filter.count}</Badge>
                    </button>
                  ))}
                </div>

                {/* Report Cards */}
                <div className="space-y-4">
                  {filteredReports.map(report => (
                    <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openReportDetails(report)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <Receipt className="h-6 w-6 text-purple-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{report.title}</h3>
                              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                              {report.policyViolations.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {report.policyViolations.length} violation{report.policyViolations.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={report.submittedBy.avatar} alt="User avatar" />
                                  <AvatarFallback>{report.submittedBy.name[0]}</AvatarFallback>
                                </Avatar>
                                {report.submittedBy.name}
                              </span>
                              <span>{report.submittedBy.department}</span>
                              <span>{report.lineItems.length} items</span>
                              <span>{report.attachments} receipts</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {report.lineItems.slice(0, 3).map((item, i) => {
                                const Icon = getCategoryIcon(item.category)
                                return (
                                  <div key={i} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                                    <Icon className="h-3 w-3" />
                                    {item.description.slice(0, 20)}...
                                  </div>
                                )
                              })}
                              {report.lineItems.length > 3 && (
                                <span className="text-xs text-gray-500">+{report.lineItems.length - 3} more</span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">${report.totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{report.currency}</p>
                            {report.submittedAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Submitted {new Date(report.submittedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-80 space-y-4">
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: 'Scan Receipt', icon: Camera, color: 'text-purple-600', onClick: () => setShowScanReceiptDialog(true) },
                      { label: 'Add Mileage', icon: Car, color: 'text-blue-600', onClick: () => setShowAddMileageDialog(true) },
                      { label: 'Request Per Diem', icon: Calendar, color: 'text-green-600', onClick: () => setShowPerDiemDialog(true) },
                      { label: 'Link Card Transaction', icon: CreditCard, color: 'text-orange-600', onClick: () => setShowLinkCardDialog(true) },
                    ].map((action, i) => (
                      <button key={i} onClick={action.onClick} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left">
                        <action.icon className={"h-5 w-5 " + action.color} />
                        <span className="text-sm">{action.label}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryBreakdown.slice(0, 5).map(([category, amount], i) => {
                      const Icon = getCategoryIcon(category as ExpenseCategory)
                      const total = stats.totalExpenses
                      const percent = ((amount / total) * 100).toFixed(0)
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4" />
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                            <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                          </div>
                          <Progress value={Number(percent)} className="h-1.5" />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Pending Approvals */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Needs Your Approval</span>
                      <Badge variant="secondary">{stats.pendingCount}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reports.filter(r => r.status === 'pending').slice(0, 3).map(report => (
                      <div key={report.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => openReportDetails(report)}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={report.submittedBy.avatar} alt="User avatar" />
                          <AvatarFallback>{report.submittedBy.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{report.submittedBy.name}</p>
                          <p className="text-xs text-gray-500">${report.totalAmount}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Receipts Tab */}
          <TabsContent value="receipts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Receipt Scanner</CardTitle>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowScanReceiptDialog(true)}>
                      <Camera className="h-4 w-4 mr-2" />
                      Scan Receipt
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-xl p-12 text-center">
                    <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Drop receipts here</h3>
                    <p className="text-gray-500 mb-4">or click to browse files</p>
                    <p className="text-sm text-gray-400">Supports JPG, PNG, PDF up to 10MB</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium mb-4">Recent Uploads</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">OCR Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Upload a receipt to extract data</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mileage Tab */}
          <TabsContent value="mileage">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Mileage Log</CardTitle>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddMileageDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trip
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mileage.map(entry => (
                        <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Car className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{entry.origin}</span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{entry.destination}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{entry.date}</span>
                              <span>{entry.distance} miles</span>
                              <span>{entry.purpose}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${(entry.distance * entry.rate).toFixed(2)}</p>
                            <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mileage Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">
                      {mileage.reduce((sum, m) => sum + m.distance, 0)} mi
                    </p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">IRS Rate</span>
                      <span className="font-medium">$0.67/mile</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pending Reimbursement</span>
                      <span className="font-medium">
                        ${mileage.filter(m => m.status === 'pending').reduce((sum, m) => sum + (m.distance * m.rate), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Per Diem Tab */}
          <TabsContent value="per-diem">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Per Diem Requests</CardTitle>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowPerDiemDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Request Per Diem
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {perDiems.map(pd => (
                      <div key={pd.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{pd.location}</h4>
                              <p className="text-sm text-gray-500">{pd.startDate} - {pd.endDate}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(pd.status)}>{pd.status}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-sm">
                          <div>
                            <span className="text-gray-500">Daily Rate</span>
                            <p className="font-medium">${pd.dailyRate}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total</span>
                            <p className="font-medium">${pd.totalAmount}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Meals Included</span>
                            <div className="flex gap-2 mt-1">
                              {pd.meals.breakfast && <Badge variant="outline">Breakfast</Badge>}
                              {pd.meals.lunch && <Badge variant="outline">Lunch</Badge>}
                              {pd.meals.dinner && <Badge variant="outline">Dinner</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">GSA Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { city: 'New York, NY', rate: 79 },
                      { city: 'San Francisco, CA', rate: 79 },
                      { city: 'Chicago, IL', rate: 59 },
                      { city: 'Other US Locations', rate: 59 },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.city}</span>
                        <span className="font-medium">${item.rate}/day</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <BarChart3 className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <PieChart className="h-16 w-16 text-gray-300" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Spenders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEmployees.map((emp, i) => {
                      const empTotal = reports.filter(r => r.submittedBy.id === emp.id).reduce((sum, r) => sum + r.totalAmount, 0)
                      return (
                        <div key={emp.id} className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                          <Avatar>
                            <AvatarImage src={emp.avatar} alt="User avatar" />
                            <AvatarFallback>{emp.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{emp.name}</p>
                            <p className="text-sm text-gray-500">{emp.department}</p>
                          </div>
                          <span className="font-semibold">${empTotal.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">2.3</p>
                      <p className="text-sm text-gray-500">Avg. Days to Approve</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">94%</p>
                      <p className="text-sm text-gray-500">Approval Rate</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">1.8</p>
                      <p className="text-sm text-gray-500">Avg. Days to Reimburse</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-orange-600">6%</p>
                      <p className="text-sm text-gray-500">Policy Violations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              {policies.map(policy => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={"p-3 rounded-lg " + getCategoryColor(policy.category)}>
                        {(() => {
                          const Icon = getCategoryIcon(policy.category)
                          return <Icon className="h-5 w-5" />
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{policy.name} Policy</h3>
                        <p className="text-sm text-gray-500 capitalize">{policy.category}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Maximum Amount</span>
                        <span className="font-medium">${policy.maxAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Approval Threshold</span>
                        <span className="font-medium">${policy.approvalThreshold}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Receipt Required</span>
                        <Badge variant={policy.requiresReceipt ? 'default' : 'secondary'}>
                          {policy.requiresReceipt ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Approval Required</span>
                        <Badge variant={policy.requiresApproval ? 'default' : 'secondary'}>
                          {policy.requiresApproval ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>

                    {policy.notes && (
                      <p className="text-sm text-gray-500 mt-4 pt-4 border-t">{policy.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Expensify Level */}
          <TabsContent value="settings">
            <Tabs value={settingsTab} onValueChange={setSettingsTab}>
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="general" className="gap-2">
                  <Settings className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="approvals" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approvals
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Company Settings</h3>
                        <p className="text-sm text-gray-500">Organization configuration</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input defaultValue="FreeFlow Inc." />
                      </div>
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
                            <SelectItem value="cad">CAD ($)</SelectItem>
                          </SelectContent>
                        </Select>
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
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Receipt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Expense Defaults</h3>
                        <p className="text-sm text-gray-500">Default expense settings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Categorize Expenses</Label>
                          <p className="text-xs text-gray-500">Use AI to categorize</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Require Receipts</Label>
                          <p className="text-xs text-gray-500">For all expenses over $25</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Mileage Tracking</Label>
                          <p className="text-xs text-gray-500">Track vehicle miles</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Per Diem</Label>
                          <p className="text-xs text-gray-500">GSA per diem rates</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Localization</h3>
                      <p className="text-sm text-gray-500">Regional preferences</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Number Format</Label>
                      <Select defaultValue="us">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">1,234.56</SelectItem>
                          <SelectItem value="eu">1.234,56</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Approvals Settings */}
              <TabsContent value="approvals" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Approval Workflow</h3>
                        <p className="text-sm text-gray-500">Configure approval process</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Approval Mode</Label>
                        <Select defaultValue="manager">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager Approval</SelectItem>
                            <SelectItem value="department">Department Head</SelectItem>
                            <SelectItem value="finance">Finance Team</SelectItem>
                            <SelectItem value="custom">Custom Workflow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Auto-Approve Threshold</Label>
                        <Select defaultValue="50">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No auto-approve</SelectItem>
                            <SelectItem value="25">Under $25</SelectItem>
                            <SelectItem value="50">Under $50</SelectItem>
                            <SelectItem value="100">Under $100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Multi-Level Approval</Label>
                          <p className="text-xs text-gray-500">For large expenses</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Delegate Approval</Label>
                          <p className="text-xs text-gray-500">Allow delegation</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Timer className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Timing & Deadlines</h3>
                        <p className="text-sm text-gray-500">Submission and approval windows</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Submission Deadline</Label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">Within 7 days</SelectItem>
                            <SelectItem value="14">Within 14 days</SelectItem>
                            <SelectItem value="30">Within 30 days</SelectItem>
                            <SelectItem value="60">Within 60 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Approval SLA</Label>
                        <Select defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 business day</SelectItem>
                            <SelectItem value="3">3 business days</SelectItem>
                            <SelectItem value="5">5 business days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Escalation</Label>
                          <p className="text-xs text-gray-500">Auto-escalate overdue</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Approval Chain</h3>
                      <p className="text-sm text-gray-500">Configure approval hierarchy</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    {[
                      { level: 'Level 1', threshold: '$0 - $500', approver: 'Direct Manager' },
                      { level: 'Level 2', threshold: '$500 - $2,000', approver: 'Department Head' },
                      { level: 'Level 3', threshold: '$2,000 - $10,000', approver: 'Finance Director' },
                      { level: 'Level 4', threshold: '$10,000+', approver: 'CFO' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        <Badge className="mb-2">{item.level}</Badge>
                        <div className="text-lg font-semibold text-purple-600">{item.threshold}</div>
                        <p className="text-sm text-gray-500">{item.approver}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Payments Settings */}
              <TabsContent value="payments" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Banknote className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Reimbursement Settings</h3>
                        <p className="text-sm text-gray-500">Configure payment options</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reimbursement Method</Label>
                        <Select defaultValue="ach">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ach">ACH Direct Deposit</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="payroll">Via Payroll</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Schedule</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Reimburse</Label>
                          <p className="text-xs text-gray-500">After approval</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Corporate Cards</h3>
                        <p className="text-sm text-gray-500">Card integration settings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Import Transactions</Label>
                          <p className="text-xs text-gray-500">Sync card expenses</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Match Receipts</Label>
                          <p className="text-xs text-gray-500">Auto-match with receipts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Reconciliation Alerts</Label>
                          <p className="text-xs text-gray-500">Missing receipt reminders</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        Connect Corporate Card
                      </Button>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Mileage Rates</h3>
                      <p className="text-sm text-gray-500">Configure mileage reimbursement</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>IRS Standard Rate</Label>
                      <Input defaultValue="$0.67" />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Rate</Label>
                      <Input defaultValue="$0.67" />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Select defaultValue="miles">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="miles">Miles</SelectItem>
                          <SelectItem value="km">Kilometers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                      <div>
                        <Label>GPS Tracking</Label>
                        <p className="text-xs text-gray-500">Auto-track trips</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Expense email alerts</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Expense Submitted', desc: 'When report is submitted', enabled: true },
                        { label: 'Expense Approved', desc: 'When report is approved', enabled: true },
                        { label: 'Expense Rejected', desc: 'When report is rejected', enabled: true },
                        { label: 'Reimbursement Sent', desc: 'When payment is processed', enabled: true },
                        { label: 'Pending Approval', desc: 'Awaiting your approval', enabled: true },
                        { label: 'Policy Violation', desc: 'Expense exceeds policy', enabled: true },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <UserCog className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Approver Notifications</h3>
                        <p className="text-sm text-gray-500">Alerts for approvers</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'New Expense Pending', desc: 'Report awaiting approval', enabled: true },
                        { label: 'Daily Digest', desc: 'Summary of pending items', enabled: true },
                        { label: 'Overdue Approvals', desc: 'Past SLA deadline', enabled: true },
                        { label: 'Large Expense Alert', desc: 'Expenses over threshold', enabled: true },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <Label className="font-medium">{item.label}</Label>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Bell className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Reminder Settings</h3>
                      <p className="text-sm text-gray-500">Automatic reminders</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Receipt Reminder</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day after</SelectItem>
                          <SelectItem value="3">3 days after</SelectItem>
                          <SelectItem value="7">7 days after</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Submission Reminder</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Approval Reminder</Label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day pending</SelectItem>
                          <SelectItem value="2">2 days pending</SelectItem>
                          <SelectItem value="3">3 days pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Integrations Settings */}
              <TabsContent value="integrations" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Link2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Connected Services</h3>
                      <p className="text-sm text-gray-500">Third-party integrations</p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { name: 'QuickBooks', desc: 'Accounting sync', status: 'connected', icon: '📊' },
                      { name: 'Xero', desc: 'Financial data', status: 'available', icon: '💰' },
                      { name: 'NetSuite', desc: 'ERP integration', status: 'available', icon: '🔗' },
                      { name: 'Slack', desc: 'Team notifications', status: 'connected', icon: '💬' },
                      { name: 'Google Workspace', desc: 'Receipt scanning', status: 'connected', icon: '📧' },
                      { name: 'SAP Concur', desc: 'Travel & expense', status: 'available', icon: '✈️' },
                    ].map((integration, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{integration.name}</div>
                            <p className="text-sm text-gray-500">{integration.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            integration.status === 'connected'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }>
                            {integration.status === 'connected' ? 'Connected' : 'Available'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {integration.status === 'connected' ? 'Configure' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <Webhook className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Webhooks</h3>
                        <p className="text-sm text-gray-500">Real-time expense events</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Webhook URL</Label>
                        <Input placeholder="https://api.yourapp.com/webhooks/expenses" />
                      </div>
                      <Button variant="outline" className="w-full gap-2">
                        <Plus className="w-4 h-4" />
                        Add Webhook
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Key className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">API Access</h3>
                        <p className="text-sm text-gray-500">Developer API keys</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                        ••••••••••••••••••••
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 gap-2">
                          Copy Key
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
                        <p className="text-sm text-gray-500">Security settings</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-xs text-gray-500">Require 2FA for approvers</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>SSO Only</Label>
                          <p className="text-xs text-gray-500">Require SSO login</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Audit Logging</Label>
                          <p className="text-xs text-gray-500">Log all changes</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>IP Restriction</Label>
                          <p className="text-xs text-gray-500">Limit by IP address</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Database className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Data Management</h3>
                        <p className="text-sm text-gray-500">Data retention & export</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Data Retention</Label>
                        <Select defaultValue="7">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 years</SelectItem>
                            <SelectItem value="5">5 years</SelectItem>
                            <SelectItem value="7">7 years</SelectItem>
                            <SelectItem value="10">10 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Archive</Label>
                          <p className="text-xs text-gray-500">Archive old reports</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="w-4 h-4" />
                        Export All Data
                      </Button>
                    </div>
                  </Card>
                </div>

                <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                      <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Reset All Policies</div>
                        <p className="text-sm text-gray-500">Restore default expense policies</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Reset
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Delete All Draft Reports</div>
                        <p className="text-sm text-gray-500">Remove all unsubmitted reports</p>
                      </div>
                      <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockExpensesAIInsights}
              title="Expense Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockExpensesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockExpensesPredictions}
              title="Spend Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockExpensesActivities}
            title="Expense Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={expensesQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>{selectedReport.title}</span>
                  <Badge className={getStatusColor(selectedReport.status)}>{selectedReport.status}</Badge>
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="h-[60vh]">
                <div className="space-y-6 pr-4">
                  {/* Summary */}
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={selectedReport.submittedBy.avatar} alt="User avatar" />
                        <AvatarFallback>{selectedReport.submittedBy.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedReport.submittedBy.name}</p>
                        <p className="text-sm text-gray-500">{selectedReport.submittedBy.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">${selectedReport.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{selectedReport.lineItems.length} items</p>
                    </div>
                  </div>

                  {/* Policy Violations */}
                  {selectedReport.policyViolations.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Policy Violations
                      </h4>
                      {selectedReport.policyViolations.map((violation, i) => (
                        <p key={i} className="text-sm text-red-700">{violation.rule}</p>
                      ))}
                    </div>
                  )}

                  {/* Line Items */}
                  <div>
                    <h4 className="font-medium mb-3">Expense Items</h4>
                    <div className="space-y-3">
                      {selectedReport.lineItems.map(item => {
                        const Icon = getCategoryIcon(item.category)
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className={"p-2 rounded-lg " + getCategoryColor(item.category)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.description}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{item.merchant}</span>
                                <span>{item.date}</span>
                                {item.isBillable && (
                                  <Badge variant="outline" className="text-xs">Billable</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${item.amount.toFixed(2)}</p>
                              {item.taxAmount && item.taxAmount > 0 && (
                                <p className="text-xs text-gray-500">+${item.taxAmount.toFixed(2)} tax</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="font-medium mb-3">Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-gray-500">Created:</span>
                        <span>{selectedReport.createdAt}</span>
                      </div>
                      {selectedReport.submittedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="text-gray-500">Submitted:</span>
                          <span>{selectedReport.submittedAt}</span>
                        </div>
                      )}
                      {selectedReport.approvedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-gray-500">Approved:</span>
                          <span>{selectedReport.approvedAt}</span>
                        </div>
                      )}
                      {selectedReport.reimbursedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-gray-500">Reimbursed:</span>
                          <span>{selectedReport.reimbursedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Actions */}
              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleRejectExpense(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {updating ? 'Rejecting...' : 'Reject'}
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveExpense(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {updating ? 'Approving...' : 'Approve'}
                  </Button>
                </div>
              )}
              {selectedReport.status === 'approved' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteExpense(selectedReport.id, selectedReport.title)}
                    disabled={deleting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleReimburseExpense(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    {updating ? 'Processing...' : 'Reimburse'}
                  </Button>
                </div>
              )}
              {selectedReport.status === 'draft' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteExpense(selectedReport.id, selectedReport.title)}
                    disabled={deleting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleSubmitReport(selectedReport.id, selectedReport.title)}
                    disabled={updating}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {updating ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Expense Dialog */}
      <Dialog open={showNewExpenseDialog} onOpenChange={setShowNewExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Expense Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Title</label>
              <Input
                placeholder="e.g., Q1 Sales Conference"
                value={newExpenseForm.title}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newExpenseForm.amount || ''}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={newExpenseForm.paymentMethod}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="corporate_card">Corporate Card</option>
                <option value="personal_card">Personal Card</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                rows={3}
                placeholder="Add any relevant notes..."
                value={newExpenseForm.notes}
                onChange={(e) => setNewExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewExpenseDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleCreateExpense}
                disabled={creating || !newExpenseForm.title}
              >
                {creating ? 'Creating...' : 'Create Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Receipt Dialog */}
      <Dialog open={showScanReceiptDialog} onOpenChange={setShowScanReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-purple-600" />
              Scan Receipt
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center">
              <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Drop your receipt here or click to browse</p>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                id="receipt-upload"
                onChange={(e) => setScanReceiptFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="receipt-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
              {scanReceiptFile && (
                <p className="mt-2 text-sm text-purple-600">{scanReceiptFile.name}</p>
              )}
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">AI-Powered OCR</h4>
              <p className="text-sm text-purple-700">
                Our AI will automatically extract merchant, amount, date, and category from your receipt.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setScanReceiptFile(null)
                setShowScanReceiptDialog(false)
              }}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleScanReceipt}
                disabled={scanReceiptProcessing || !scanReceiptFile}
              >
                {scanReceiptProcessing ? 'Processing...' : 'Scan Receipt'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateReportDialog} onOpenChange={setShowGenerateReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Generate Expense Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={reportDateRange.start}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={reportDateRange.end}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Export Format</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
              >
                <option value="pdf">PDF Report</option>
                <option value="csv">CSV Spreadsheet</option>
                <option value="excel">Excel Workbook</option>
              </select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Report Contents</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- All expense reports in date range</li>
                <li>- Category breakdown and totals</li>
                <li>- Policy compliance summary</li>
                <li>- Reimbursement status</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowGenerateReportDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleGenerateReport}
                disabled={generatingReport || !reportDateRange.start || !reportDateRange.end}
              >
                <Download className="h-4 w-4 mr-2" />
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Mileage Dialog */}
      <Dialog open={showAddMileageDialog} onOpenChange={setShowAddMileageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-600" />
              Add Mileage Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <Input
                type="date"
                value={mileageForm.date}
                onChange={(e) => setMileageForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Origin</label>
                <Input
                  placeholder="e.g., Office"
                  value={mileageForm.origin}
                  onChange={(e) => setMileageForm(prev => ({ ...prev, origin: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <Input
                  placeholder="e.g., Client Site"
                  value={mileageForm.destination}
                  onChange={(e) => setMileageForm(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Distance (miles)</label>
              <Input
                type="number"
                placeholder="0"
                value={mileageForm.distance || ''}
                onChange={(e) => setMileageForm(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Purpose</label>
              <Input
                placeholder="e.g., Client meeting"
                value={mileageForm.purpose}
                onChange={(e) => setMileageForm(prev => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
            {mileageForm.distance > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-blue-900">Estimated Reimbursement</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${(mileageForm.distance * 0.67).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">Based on IRS rate of $0.67/mile</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddMileageDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddMileage}
                disabled={!mileageForm.origin || !mileageForm.destination || !mileageForm.distance}
              >
                Add Mileage
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Per Diem Request Dialog */}
      <Dialog open={showPerDiemDialog} onOpenChange={setShowPerDiemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Request Per Diem
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                placeholder="e.g., New York, NY"
                value={perDiemForm.location}
                onChange={(e) => setPerDiemForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={perDiemForm.startDate}
                  onChange={(e) => setPerDiemForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={perDiemForm.endDate}
                  onChange={(e) => setPerDiemForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Meals Included</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={perDiemForm.meals.breakfast}
                    onChange={(e) => setPerDiemForm(prev => ({
                      ...prev,
                      meals: { ...prev.meals, breakfast: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Breakfast</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={perDiemForm.meals.lunch}
                    onChange={(e) => setPerDiemForm(prev => ({
                      ...prev,
                      meals: { ...prev.meals, lunch: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Lunch</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={perDiemForm.meals.dinner}
                    onChange={(e) => setPerDiemForm(prev => ({
                      ...prev,
                      meals: { ...prev.meals, dinner: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm">Dinner</span>
                </label>
              </div>
            </div>
            {perDiemForm.startDate && perDiemForm.endDate && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-green-900">Estimated Per Diem</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(Math.ceil((new Date(perDiemForm.endDate).getTime() - new Date(perDiemForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) * 79}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">Based on GSA rate of $79/day</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowPerDiemDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleRequestPerDiem}
                disabled={!perDiemForm.location || !perDiemForm.startDate || !perDiemForm.endDate}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Card Dialog */}
      <Dialog open={showLinkCardDialog} onOpenChange={setShowLinkCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              Link Corporate Card
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Type</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={linkCardForm.cardType}
                onChange={(e) => setLinkCardForm(prev => ({ ...prev, cardType: e.target.value }))}
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last 4 Digits</label>
              <Input
                placeholder="1234"
                maxLength={4}
                value={linkCardForm.lastFour}
                onChange={(e) => setLinkCardForm(prev => ({ ...prev, lastFour: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nickname (Optional)</label>
              <Input
                placeholder="e.g., Travel Card"
                value={linkCardForm.nickname}
                onChange={(e) => setLinkCardForm(prev => ({ ...prev, nickname: e.target.value }))}
              />
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Auto-Import Benefits</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>- Automatic transaction import</li>
                <li>- Smart receipt matching</li>
                <li>- Real-time spending alerts</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowLinkCardDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleLinkCard}
                disabled={linkCardForm.lastFour.length !== 4}
              >
                Link Card
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
