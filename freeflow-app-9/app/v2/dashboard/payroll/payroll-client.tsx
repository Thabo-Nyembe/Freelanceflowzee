'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DollarSign,
  Users,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Building2,
  PieChart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  RefreshCw,
  ChevronRight,
  Banknote,
  Receipt,
  Calculator,
  Shield,
  Briefcase,
  Heart,
  GraduationCap,
  Plane,
  Home,
  Wallet,
  Settings,
  Bell,
  BarChart3,
  Lock,
  FileClock,
  Landmark,
  Scale,
  FileSpreadsheet,
  CheckCircle,
  History,
  UserPlus,
  Mail
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
  payrollAIInsights,
  payrollCollaborators,
  payrollPredictions,
  payrollActivities,
  payrollQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type PayRunStatus = 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled'
type PayFrequency = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly'
type EmployeeType = 'full_time' | 'part_time' | 'contractor' | 'intern'
type PaymentMethod = 'direct_deposit' | 'check' | 'wire_transfer' | 'paypal'
type TaxFilingStatus = 'pending' | 'filed' | 'accepted' | 'rejected'
type BenefitType = 'health' | 'dental' | 'vision' | 'life' | '401k' | 'hsa' | 'fsa' | 'pto' | 'parental' | 'education'

interface PayRun {
  id: string
  period: string
  payDate: string
  frequency: PayFrequency
  status: PayRunStatus
  totalGross: number
  totalNet: number
  totalTaxes: number
  totalDeductions: number
  employeeCount: number
  processedCount: number
  pendingCount: number
  failedCount: number
  approvedBy?: string
  approvedAt?: string
  notes?: string
  createdAt: string
}

interface Employee {
  id: string
  name: string
  email: string
  avatar?: string
  department: string
  role: string
  employeeType: EmployeeType
  paymentMethod: PaymentMethod
  salary: number
  hourlyRate?: number
  hoursWorked?: number
  grossPay: number
  netPay: number
  taxes: number
  deductions: number
  benefits: number
  startDate: string
  lastPayDate?: string
  status: 'active' | 'on_leave' | 'terminated'
  bankAccount?: string
}

interface TaxFiling {
  id: string
  type: string
  period: string
  dueDate: string
  filedDate?: string
  amount: number
  status: TaxFilingStatus
  agency: string
  confirmationNumber?: string
}

interface Benefit {
  id: string
  name: string
  type: BenefitType
  provider: string
  coverage: string
  employerContribution: number
  employeeContribution: number
  enrolledCount: number
  totalCost: number
  effectiveDate: string
  renewalDate: string
}

interface TimeEntry {
  id: string
  employeeId: string
  employeeName: string
  date: string
  regularHours: number
  overtimeHours: number
  ptoHours: number
  totalHours: number
  status: 'pending' | 'approved' | 'rejected'
}

interface PayrollStats {
  totalPayroll: number
  totalEmployees: number
  avgSalary: number
  monthlyGross: number
  monthlyTaxes: number
  monthlyDeductions: number
  pendingApprovals: number
  upcomingPayRuns: number
}

// Database types
interface DbPayrollRun {
  id: string
  user_id: string
  run_code: string
  period: string
  pay_date: string
  status: string
  total_employees: number
  total_amount: number
  processed_count: number
  pending_count: number
  failed_count: number
  department: string | null
  approved_by: string | null
  approved_date: string | null
  currency: string
  notes: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface PayrollFormState {
  period: string
  pay_date: string
  status: string
  total_employees: number
  total_amount: number
  department: string
  notes: string
}

const initialFormState: PayrollFormState = {
  period: '',
  pay_date: '',
  status: 'draft',
  total_employees: 0,
  total_amount: 0,
  department: '',
  notes: '',
}

// Mock data
const mockPayRuns: PayRun[] = [
  {
    id: '1',
    period: 'December 1-15, 2024',
    payDate: '2024-12-20',
    frequency: 'semi_monthly',
    status: 'completed',
    totalGross: 485000,
    totalNet: 342000,
    totalTaxes: 108000,
    totalDeductions: 35000,
    employeeCount: 156,
    processedCount: 156,
    pendingCount: 0,
    failedCount: 0,
    approvedBy: 'Sarah Chen',
    approvedAt: '2024-12-18T14:30:00Z',
    createdAt: '2024-12-16T09:00:00Z'
  },
  {
    id: '2',
    period: 'December 16-31, 2024',
    payDate: '2024-12-31',
    frequency: 'semi_monthly',
    status: 'pending_approval',
    totalGross: 492000,
    totalNet: 347000,
    totalTaxes: 110000,
    totalDeductions: 35000,
    employeeCount: 158,
    processedCount: 0,
    pendingCount: 158,
    failedCount: 0,
    createdAt: '2024-12-20T09:00:00Z'
  },
  {
    id: '3',
    period: 'November 16-30, 2024',
    payDate: '2024-12-05',
    frequency: 'semi_monthly',
    status: 'completed',
    totalGross: 478000,
    totalNet: 338000,
    totalTaxes: 106000,
    totalDeductions: 34000,
    employeeCount: 154,
    processedCount: 154,
    pendingCount: 0,
    failedCount: 0,
    approvedBy: 'Michael Ross',
    approvedAt: '2024-12-03T10:15:00Z',
    createdAt: '2024-11-28T09:00:00Z'
  },
  {
    id: '4',
    period: 'Q4 2024 Bonuses',
    payDate: '2024-12-22',
    frequency: 'monthly',
    status: 'processing',
    totalGross: 125000,
    totalNet: 87500,
    totalTaxes: 31250,
    totalDeductions: 6250,
    employeeCount: 45,
    processedCount: 28,
    pendingCount: 17,
    failedCount: 0,
    approvedBy: 'Sarah Chen',
    approvedAt: '2024-12-20T16:00:00Z',
    createdAt: '2024-12-15T09:00:00Z'
  },
  {
    id: '5',
    period: 'Contractor Payments - December',
    payDate: '2024-12-28',
    frequency: 'monthly',
    status: 'draft',
    totalGross: 68000,
    totalNet: 68000,
    totalTaxes: 0,
    totalDeductions: 0,
    employeeCount: 12,
    processedCount: 0,
    pendingCount: 12,
    failedCount: 0,
    createdAt: '2024-12-18T11:00:00Z'
  }
]

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex.t@company.com',
    avatar: '/avatars/alex.jpg',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    employeeType: 'full_time',
    paymentMethod: 'direct_deposit',
    salary: 145000,
    grossPay: 6041.67,
    netPay: 4270.00,
    taxes: 1328.00,
    deductions: 443.67,
    benefits: 850,
    startDate: '2021-03-15',
    lastPayDate: '2024-12-20',
    status: 'active',
    bankAccount: '****4521'
  },
  {
    id: '2',
    name: 'Emma Rodriguez',
    email: 'emma.r@company.com',
    department: 'Product',
    role: 'Product Manager',
    employeeType: 'full_time',
    paymentMethod: 'direct_deposit',
    salary: 135000,
    grossPay: 5625.00,
    netPay: 3975.00,
    taxes: 1237.50,
    deductions: 412.50,
    benefits: 780,
    startDate: '2020-08-01',
    lastPayDate: '2024-12-20',
    status: 'active',
    bankAccount: '****7892'
  },
  {
    id: '3',
    name: 'James Wilson',
    email: 'james.w@company.com',
    department: 'Sales',
    role: 'Account Executive',
    employeeType: 'full_time',
    paymentMethod: 'direct_deposit',
    salary: 95000,
    grossPay: 3958.33,
    netPay: 2798.00,
    taxes: 870.83,
    deductions: 289.50,
    benefits: 650,
    startDate: '2022-01-10',
    lastPayDate: '2024-12-20',
    status: 'active',
    bankAccount: '****3345'
  },
  {
    id: '4',
    name: 'Sofia Martinez',
    email: 'sofia.m@company.com',
    department: 'Design',
    role: 'UX Designer',
    employeeType: 'full_time',
    paymentMethod: 'direct_deposit',
    salary: 110000,
    grossPay: 4583.33,
    netPay: 3238.00,
    taxes: 1008.33,
    deductions: 337.00,
    benefits: 720,
    startDate: '2021-06-20',
    lastPayDate: '2024-12-20',
    status: 'active'
  },
  {
    id: '5',
    name: 'David Chen',
    email: 'david.c@company.com',
    department: 'Engineering',
    role: 'DevOps Engineer',
    employeeType: 'full_time',
    paymentMethod: 'direct_deposit',
    salary: 130000,
    grossPay: 5416.67,
    netPay: 3825.00,
    taxes: 1191.67,
    deductions: 400.00,
    benefits: 780,
    startDate: '2020-11-15',
    lastPayDate: '2024-12-20',
    status: 'active'
  },
  {
    id: '6',
    name: 'Lisa Park',
    email: 'lisa.p@company.com',
    department: 'Marketing',
    role: 'Marketing Manager',
    employeeType: 'full_time',
    paymentMethod: 'direct_deposit',
    salary: 105000,
    grossPay: 4375.00,
    netPay: 3090.00,
    taxes: 962.50,
    deductions: 322.50,
    benefits: 700,
    startDate: '2021-09-01',
    lastPayDate: '2024-12-20',
    status: 'on_leave'
  },
  {
    id: '7',
    name: 'Ryan Foster',
    email: 'ryan.f@company.com',
    department: 'Engineering',
    role: 'Frontend Developer',
    employeeType: 'contractor',
    paymentMethod: 'wire_transfer',
    hourlyRate: 85,
    hoursWorked: 160,
    salary: 0,
    grossPay: 13600,
    netPay: 13600,
    taxes: 0,
    deductions: 0,
    benefits: 0,
    startDate: '2024-01-15',
    lastPayDate: '2024-12-15',
    status: 'active'
  }
]

const mockTaxFilings: TaxFiling[] = [
  {
    id: '1',
    type: 'Form 941 - Quarterly Federal Tax',
    period: 'Q4 2024',
    dueDate: '2025-01-31',
    amount: 324500,
    status: 'pending',
    agency: 'IRS'
  },
  {
    id: '2',
    type: 'State Unemployment Tax',
    period: 'Q4 2024',
    dueDate: '2025-01-31',
    amount: 12800,
    status: 'pending',
    agency: 'CA EDD'
  },
  {
    id: '3',
    type: 'Form 941 - Quarterly Federal Tax',
    period: 'Q3 2024',
    dueDate: '2024-10-31',
    filedDate: '2024-10-28',
    amount: 298000,
    status: 'accepted',
    agency: 'IRS',
    confirmationNumber: 'IRS-2024-Q3-78451'
  },
  {
    id: '4',
    type: 'W-2 Forms',
    period: '2024',
    dueDate: '2025-01-31',
    amount: 0,
    status: 'pending',
    agency: 'SSA'
  },
  {
    id: '5',
    type: '1099-NEC Forms',
    period: '2024',
    dueDate: '2025-01-31',
    amount: 0,
    status: 'pending',
    agency: 'IRS'
  }
]

const mockBenefits: Benefit[] = [
  {
    id: '1',
    name: 'Medical Insurance - PPO',
    type: 'health',
    provider: 'Blue Cross Blue Shield',
    coverage: 'Employee + Family',
    employerContribution: 850,
    employeeContribution: 350,
    enrolledCount: 142,
    totalCost: 170400,
    effectiveDate: '2024-01-01',
    renewalDate: '2024-12-31'
  },
  {
    id: '2',
    name: 'Dental Insurance',
    type: 'dental',
    provider: 'Delta Dental',
    coverage: 'Employee + Family',
    employerContribution: 80,
    employeeContribution: 30,
    enrolledCount: 138,
    totalCost: 15180,
    effectiveDate: '2024-01-01',
    renewalDate: '2024-12-31'
  },
  {
    id: '3',
    name: 'Vision Insurance',
    type: 'vision',
    provider: 'VSP',
    coverage: 'Employee + Family',
    employerContribution: 25,
    employeeContribution: 10,
    enrolledCount: 125,
    totalCost: 4375,
    effectiveDate: '2024-01-01',
    renewalDate: '2024-12-31'
  },
  {
    id: '4',
    name: '401(k) Retirement Plan',
    type: '401k',
    provider: 'Fidelity',
    coverage: '6% Match',
    employerContribution: 450,
    employeeContribution: 650,
    enrolledCount: 148,
    totalCost: 162800,
    effectiveDate: '2024-01-01',
    renewalDate: '2024-12-31'
  },
  {
    id: '5',
    name: 'Life Insurance',
    type: 'life',
    provider: 'MetLife',
    coverage: '2x Annual Salary',
    employerContribution: 45,
    employeeContribution: 0,
    enrolledCount: 156,
    totalCost: 7020,
    effectiveDate: '2024-01-01',
    renewalDate: '2024-12-31'
  },
  {
    id: '6',
    name: 'HSA Account',
    type: 'hsa',
    provider: 'HealthEquity',
    coverage: '$1,500 Annual Contribution',
    employerContribution: 125,
    employeeContribution: 200,
    enrolledCount: 89,
    totalCost: 28925,
    effectiveDate: '2024-01-01',
    renewalDate: '2024-12-31'
  }
]

const mockTimeEntries: TimeEntry[] = [
  { id: '1', employeeId: '1', employeeName: 'Alex Thompson', date: '2024-12-20', regularHours: 8, overtimeHours: 0, ptoHours: 0, totalHours: 8, status: 'approved' },
  { id: '2', employeeId: '2', employeeName: 'Emma Rodriguez', date: '2024-12-20', regularHours: 8, overtimeHours: 2, ptoHours: 0, totalHours: 10, status: 'approved' },
  { id: '3', employeeId: '3', employeeName: 'James Wilson', date: '2024-12-20', regularHours: 6, overtimeHours: 0, ptoHours: 2, totalHours: 8, status: 'pending' },
  { id: '4', employeeId: '4', employeeName: 'Sofia Martinez', date: '2024-12-20', regularHours: 8, overtimeHours: 1, ptoHours: 0, totalHours: 9, status: 'approved' },
  { id: '5', employeeId: '5', employeeName: 'David Chen', date: '2024-12-20', regularHours: 8, overtimeHours: 0, ptoHours: 0, totalHours: 8, status: 'pending' }
]

// Helper functions
const getStatusColor = (status: PayRunStatus) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    processing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[status]
}

const getEmployeeTypeColor = (type: EmployeeType) => {
  const colors = {
    full_time: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    part_time: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    contractor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    intern: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  }
  return colors[type]
}

const getTaxStatusColor = (status: TaxFilingStatus) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    filed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return colors[status]
}

const getBenefitIcon = (type: BenefitType) => {
  const icons = {
    health: Heart,
    dental: Heart,
    vision: Eye,
    life: Shield,
    '401k': Landmark,
    hsa: Wallet,
    fsa: Wallet,
    pto: Plane,
    parental: Home,
    education: GraduationCap
  }
  return icons[type]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatCurrencyDetailed = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function PayrollClient() {
  const supabase = createClient()

  // UI State
  const [activeTab, setActiveTab] = useState('pay-runs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayRun, setSelectedPayRun] = useState<PayRun | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showPayRunDialog, setShowPayRunDialog] = useState(false)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // New Dialog States
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const [showEmployeeImportDialog, setShowEmployeeImportDialog] = useState(false)
  const [showEmployeeExportDialog, setShowEmployeeExportDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showTaxFormsDialog, setShowTaxFormsDialog] = useState(false)
  const [showNotifyAllDialog, setShowNotifyAllDialog] = useState(false)
  const [showEmployeeReportsDialog, setShowEmployeeReportsDialog] = useState(false)
  const [showEmployeeSettingsDialog, setShowEmployeeSettingsDialog] = useState(false)
  const [showFileTaxesDialog, setShowFileTaxesDialog] = useState(false)
  const [showCalculateTaxDialog, setShowCalculateTaxDialog] = useState(false)
  const [showTaxDeadlinesDialog, setShowTaxDeadlinesDialog] = useState(false)
  const [showTaxFormsDownloadDialog, setShowTaxFormsDownloadDialog] = useState(false)
  const [showComplianceDialog, setShowComplianceDialog] = useState(false)
  const [showTaxHistoryDialog, setShowTaxHistoryDialog] = useState(false)
  const [showTaxReportsDialog, setShowTaxReportsDialog] = useState(false)
  const [showTaxSettingsDialog, setShowTaxSettingsDialog] = useState(false)
  const [showDownloadTaxReportsDialog, setShowDownloadTaxReportsDialog] = useState(false)
  const [showGenerateW2Dialog, setShowGenerateW2Dialog] = useState(false)
  const [showGenerate1099Dialog, setShowGenerate1099Dialog] = useState(false)
  const [showFileQuarterlyTaxesDialog, setShowFileQuarterlyTaxesDialog] = useState(false)
  const [showAddBenefitPlanDialog, setShowAddBenefitPlanDialog] = useState(false)
  const [showHealthBenefitsDialog, setShowHealthBenefitsDialog] = useState(false)
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false)
  const [show401kDialog, setShow401kDialog] = useState(false)
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false)
  const [showBenefitDocumentsDialog, setShowBenefitDocumentsDialog] = useState(false)
  const [showBenefitReportsDialog, setShowBenefitReportsDialog] = useState(false)
  const [showBenefitSettingsDialog, setShowBenefitSettingsDialog] = useState(false)
  const [showNewTimeEntryDialog, setShowNewTimeEntryDialog] = useState(false)
  const [showClockInDialog, setShowClockInDialog] = useState(false)
  const [showApproveTimeDialog, setShowApproveTimeDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showTeamViewDialog, setShowTeamViewDialog] = useState(false)
  const [showTimeExportDialog, setShowTimeExportDialog] = useState(false)
  const [showTimeReportsDialog, setShowTimeReportsDialog] = useState(false)
  const [showTimeSettingsDialog, setShowTimeSettingsDialog] = useState(false)
  const [showPayFrequencyDialog, setShowPayFrequencyDialog] = useState(false)
  const [showFiscalYearDialog, setShowFiscalYearDialog] = useState(false)
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false)
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false)
  const [showAutoProcessDialog, setShowAutoProcessDialog] = useState(false)
  const [showApprovalWorkflowDialog, setShowApprovalWorkflowDialog] = useState(false)
  const [showAccessRolesDialog, setShowAccessRolesDialog] = useState(false)
  const [showPayStubsDialog, setShowPayStubsDialog] = useState(false)
  const [showEditEmployeeDetailsDialog, setShowEditEmployeeDetailsDialog] = useState(false)
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null)

  // Database State
  const [dbPayrollRuns, setDbPayrollRuns] = useState<DbPayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<PayrollFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Generate run code
  const generateRunCode = () => `PR-${Date.now().toString(36).toUpperCase()}`

  // Fetch payroll runs from Supabase
  const fetchPayrollRuns = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbPayrollRuns(data || [])
    } catch (error) {
      console.error('Error fetching payroll runs:', error)
      toast.error('Failed to load payroll runs')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPayrollRuns()
  }, [fetchPayrollRuns])

  // Create payroll run
  const handleCreatePayrollRun = async () => {
    if (!formState.period.trim()) {
      toast.error('Period is required')
      return
    }
    if (!formState.pay_date) {
      toast.error('Pay date is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create payroll runs')
        return
      }

      const { error } = await supabase.from('payroll_runs').insert({
        user_id: user.id,
        run_code: generateRunCode(),
        period: formState.period,
        pay_date: formState.pay_date,
        status: formState.status,
        total_employees: formState.total_employees,
        total_amount: formState.total_amount,
        processed_count: 0,
        pending_count: formState.total_employees,
        failed_count: 0,
        department: formState.department || null,
        notes: formState.notes || null,
      })

      if (error) throw error

      toast.success('Payroll run created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error creating payroll run:', error)
      toast.error('Failed to create payroll run')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update payroll run
  const handleUpdatePayrollRun = async () => {
    if (!editingId || !formState.period.trim()) {
      toast.error('Period is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('payroll_runs')
        .update({
          period: formState.period,
          pay_date: formState.pay_date,
          status: formState.status,
          total_employees: formState.total_employees,
          total_amount: formState.total_amount,
          department: formState.department || null,
          notes: formState.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId)

      if (error) throw error

      toast.success('Payroll run updated successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      setEditingId(null)
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error updating payroll run:', error)
      toast.error('Failed to update payroll run')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete payroll run (soft delete)
  const handleDeletePayrollRun = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_runs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      toast.success('Payroll run deleted')
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error deleting payroll run:', error)
      toast.error('Failed to delete payroll run')
    }
  }

  // Edit payroll run
  const handleEditPayrollRun = (run: DbPayrollRun) => {
    setFormState({
      period: run.period,
      pay_date: run.pay_date,
      status: run.status,
      total_employees: run.total_employees,
      total_amount: run.total_amount,
      department: run.department || '',
      notes: run.notes || '',
    })
    setEditingId(run.id)
    setShowCreateDialog(true)
  }

  // Approve payroll run
  const handleApprovePayrollRunDb = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('payroll_runs')
        .update({
          status: 'approved',
          approved_by: user?.email || 'System',
          approved_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Payroll run approved')
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error approving payroll run:', error)
      toast.error('Failed to approve payroll run')
    }
  }

  // Process payroll run
  const handleProcessPayrollRunDb = async (id: string) => {
    try {
      const run = dbPayrollRuns.find(r => r.id === id)
      const { error } = await supabase
        .from('payroll_runs')
        .update({
          status: 'processing',
          processed_count: Math.floor((run?.total_employees || 0) * 0.5),
          pending_count: Math.ceil((run?.total_employees || 0) * 0.5),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      toast.success('Payroll processing started')
      fetchPayrollRuns()
    } catch (error) {
      console.error('Error processing payroll run:', error)
      toast.error('Failed to process payroll run')
    }
  }

  // Stats
  const stats: PayrollStats = useMemo(() => ({
    totalPayroll: mockPayRuns.reduce((sum, run) => sum + run.totalGross, 0),
    totalEmployees: 158,
    avgSalary: 115000,
    monthlyGross: 977000,
    monthlyTaxes: 218000,
    monthlyDeductions: 70000,
    pendingApprovals: mockPayRuns.filter(r => r.status === 'pending_approval').length,
    upcomingPayRuns: mockPayRuns.filter(r => ['draft', 'pending_approval', 'approved', 'processing'].includes(r.status)).length
  }), [])

  // Filtered data
  const filteredPayRuns = useMemo(() => {
    return mockPayRuns.filter(run =>
      run.period.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter(emp =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Handlers
  const handleExportReport = () => {
    if (!selectedPayRun) return
    toast.success(`Exporting report for ${selectedPayRun.period}...`)
  }

  const handleViewPayRunDetails = () => {
    if (!selectedPayRun) return
    toast.info('Opening detailed view...')
  }

  const handleRunPayroll = () => {
    setFormState(initialFormState)
    setEditingId(null)
    setShowCreateDialog(true)
  }

  const handleApprovePayRun = () => {
    if (!selectedPayRun) return
    toast.success(`Pay run ${selectedPayRun.period} approved!`)
    setShowPayRunDialog(false)
  }

  const handleExportPayroll = () => {
    toast.success('Export started', {
      description: 'Payroll data is being exported'
    })
  }

  const handleProcessPayments = () => {
    toast.success('Processing payments', {
      description: 'Payroll payments are being processed'
    })
  }

  const handleGeneratePayslips = () => {
    toast.success('Generating payslips', {
      description: 'Payslips are being generated'
    })
  }

  const handleRefresh = async () => {
    toast.info('Refreshing payroll data...')
    setLoading(true)
    await fetchPayrollRuns()
    toast.success('Payroll data refreshed')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payroll Hub
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gusto-level payroll and benefits management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={handleRunPayroll}>
              <Plus className="w-4 h-4 mr-2" />
              Run Payroll
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Payroll</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalPayroll)}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>+5.2% YTD</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Employees</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.totalEmployees}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <TrendingUp className="w-3 h-3" />
                <span>+12 this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Avg Salary</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.avgSalary)}
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <TrendingUp className="w-3 h-3" />
                <span>+3.8% YoY</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Monthly Gross</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.monthlyGross)}
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <span>Semi-monthly</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-red-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Taxes</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.monthlyTaxes)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>22.3% rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Benefits</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.monthlyDeductions)}
              </div>
              <div className="flex items-center gap-1 text-xs text-pink-600">
                <span>6 plans active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.pendingApprovals}
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <span>Needs approval</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Upcoming</span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.upcomingPayRuns}
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-600">
                <span>Pay runs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search pay runs, employees, or departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1">
            <TabsTrigger value="pay-runs" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Banknote className="w-4 h-4 mr-2" />
              Pay Runs
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Users className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="taxes" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Receipt className="w-4 h-4 mr-2" />
              Taxes
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Heart className="w-4 h-4 mr-2" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Clock className="w-4 h-4 mr-2" />
              Time & Attendance
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Pay Runs Tab */}
          <TabsContent value="pay-runs" className="space-y-4">
            {/* Pay Runs Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Pay Runs</h2>
                  <p className="text-green-100">ADP-level payroll processing and management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredPayRuns.length + dbPayrollRuns.length}</p>
                    <p className="text-green-200 text-sm">Total Runs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredPayRuns.filter(r => r.status === 'completed').length + dbPayrollRuns.filter(r => r.status === 'completed').length}</p>
                    <p className="text-green-200 text-sm">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredPayRuns.filter(r => r.status === 'pending_approval').length + dbPayrollRuns.filter(r => r.status === 'pending_approval' || r.status === 'draft').length}</p>
                    <p className="text-green-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Runs Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
                onClick={handleRunPayroll}
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">New Run</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:scale-105 transition-all duration-200"
                onClick={handleProcessPayments}
              >
                <PlayCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Process</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 800)),
                    {
                      loading: 'Loading approval queue...',
                      success: 'Select a pay run to approve from the list below',
                      error: 'Failed to load approval queue'
                    }
                  )
                }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Approve</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-105 transition-all duration-200"
                onClick={handleExportPayroll}
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
                onClick={handleGeneratePayslips}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Reports</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
                onClick={() => {
                  toast.promise(
                    new Promise((resolve) => {
                      setActiveTab('analytics')
                      setTimeout(resolve, 600)
                    }),
                    {
                      loading: 'Loading payroll analytics...',
                      success: 'Payroll analytics loaded',
                      error: 'Failed to load analytics'
                    }
                  )
                }}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Analytics</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs font-medium">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {filteredPayRuns.map((run) => (
                  <Card
                    key={run.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedPayRun(run)
                      setShowPayRunDialog(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{run.period}</h3>
                            <Badge className={getStatusColor(run.status)}>
                              {run.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Pay date: {run.payDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {run.employeeCount} employees
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(run.totalGross)}
                          </div>
                          <div className="text-xs text-gray-500">Gross pay</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-3 border-t dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(run.totalNet)}
                          </div>
                          <div className="text-xs text-gray-500">Net Pay</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(run.totalTaxes)}
                          </div>
                          <div className="text-xs text-gray-500">Taxes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-purple-600">
                            {formatCurrency(run.totalDeductions)}
                          </div>
                          <div className="text-xs text-gray-500">Deductions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-blue-600">
                            {run.processedCount}/{run.employeeCount}
                          </div>
                          <div className="text-xs text-gray-500">Processed</div>
                        </div>
                      </div>

                      {run.status === 'processing' && (
                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Processing progress</span>
                            <span>{Math.round((run.processedCount / run.employeeCount) * 100)}%</span>
                          </div>
                          <Progress value={(run.processedCount / run.employeeCount) * 100} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Database Payroll Runs */}
                {dbPayrollRuns.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      Your Payroll Runs
                    </h3>
                    {dbPayrollRuns.map((run) => (
                      <Card
                        key={run.id}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all mb-3"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{run.period}</h3>
                                <Badge className={getStatusColor(run.status as PayRunStatus)}>
                                  {run.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{run.run_code}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Pay date: {run.pay_date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {run.total_employees} employees
                                </span>
                                {run.department && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {run.department}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(run.total_amount)}
                              </div>
                              <div className="text-xs text-gray-500">Total amount</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 pt-3 border-t dark:border-gray-700">
                            <div className="text-center">
                              <div className="text-sm font-semibold text-blue-600">{run.processed_count}/{run.total_employees}</div>
                              <div className="text-xs text-gray-500">Processed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-yellow-600">{run.pending_count}</div>
                              <div className="text-xs text-gray-500">Pending</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-red-600">{run.failed_count}</div>
                              <div className="text-xs text-gray-500">Failed</div>
                            </div>
                          </div>

                          {run.approved_by && (
                            <div className="mt-3 pt-3 border-t dark:border-gray-700 text-sm text-gray-500">
                              Approved by {run.approved_by} on {new Date(run.approved_date!).toLocaleDateString()}
                            </div>
                          )}

                          <div className="flex gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                            {run.status === 'draft' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleEditPayrollRun(run)}>
                                  <Edit className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleApprovePayrollRunDb(run.id)}>
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                              </>
                            )}
                            {run.status === 'approved' && (
                              <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => handleProcessPayrollRunDb(run.id)}>
                                <PlayCircle className="w-4 h-4 mr-1" /> Process
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="text-red-600 ml-auto" onClick={() => handleDeletePayrollRun(run.id)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Loading payroll runs...</span>
                  </div>
                )}
              </div>

              {/* Pay Run Summary */}
              <div className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-green-500" />
                      Payroll Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Gross Pay</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(977000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Federal Taxes</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(156000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">State Taxes</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(62000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Benefits</span>
                      <span className="font-semibold text-purple-600">-{formatCurrency(70000)}</span>
                    </div>
                    <div className="pt-2 border-t dark:border-gray-700 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Net Pay</span>
                      <span className="font-bold text-green-600">{formatCurrency(689000)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      Department Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { dept: 'Engineering', amount: 380000, percentage: 39 },
                      { dept: 'Product', amount: 185000, percentage: 19 },
                      { dept: 'Sales', amount: 156000, percentage: 16 },
                      { dept: 'Marketing', amount: 127000, percentage: 13 },
                      { dept: 'Design', amount: 98000, percentage: 10 },
                      { dept: 'Operations', amount: 31000, percentage: 3 }
                    ].map((dept) => (
                      <div key={dept.dept} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{dept.dept}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(dept.amount)}</span>
                        </div>
                        <Progress value={dept.percentage} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileClock className="w-4 h-4 text-yellow-500" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { task: 'Q4 Tax Filing', date: 'Jan 31, 2025', status: 'pending' },
                      { task: 'W-2 Distribution', date: 'Jan 31, 2025', status: 'pending' },
                      { task: '1099 Distribution', date: 'Jan 31, 2025', status: 'pending' },
                      { task: 'Benefits Renewal', date: 'Dec 31, 2024', status: 'urgent' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.task}</div>
                          <div className="text-xs text-gray-500">{item.date}</div>
                        </div>
                        <Badge className={item.status === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            {/* Employees Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Employees</h2>
                  <p className="text-blue-100">Workday-level employee payroll management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredEmployees.length}</p>
                    <p className="text-blue-200 text-sm">Total Employees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredEmployees.filter(e => e.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredEmployees.filter(e => e.paymentMethod === 'direct_deposit').length}</p>
                    <p className="text-blue-200 text-sm">Direct Deposit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employees Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: UserPlus, label: 'Add Employee', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowAddEmployeeDialog(true) },
                { icon: Upload, label: 'Import', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowEmployeeImportDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowEmployeeExportDialog(true) },
                { icon: CreditCard, label: 'Payment', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowPaymentDialog(true) },
                { icon: FileText, label: 'Tax Forms', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowTaxFormsDialog(true) },
                { icon: Mail, label: 'Notify All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowNotifyAllDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowEmployeeReportsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowEmployeeSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredEmployees.map((employee) => (
                <Card
                  key={employee.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedEmployee(employee)
                    setShowEmployeeDialog(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                          <Badge className={getEmployeeTypeColor(employee.employeeType)}>
                            {employee.employeeType.replace('_', ' ')}
                          </Badge>
                          {employee.status === 'on_leave' && (
                            <Badge className="bg-orange-100 text-orange-700">On Leave</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{employee.role}</span>
                          <span>•</span>
                          <span>{employee.department}</span>
                          <span>•</span>
                          <span>{employee.email}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-8 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {employee.salary > 0 ? formatCurrency(employee.salary) : `$${employee.hourlyRate}/hr`}
                          </div>
                          <div className="text-xs text-gray-500">{employee.salary > 0 ? 'Annual' : 'Rate'}</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrencyDetailed(employee.grossPay)}
                          </div>
                          <div className="text-xs text-gray-500">Gross</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrencyDetailed(employee.netPay)}
                          </div>
                          <div className="text-xs text-gray-500">Net</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrencyDetailed(employee.taxes)}
                          </div>
                          <div className="text-xs text-gray-500">Taxes</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Taxes Tab */}
          <TabsContent value="taxes" className="space-y-4">
            {/* Taxes Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Tax Management</h2>
                  <p className="text-amber-100">Gusto-level tax filing and compliance</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTaxFilings.length}</p>
                    <p className="text-amber-200 text-sm">Tax Types</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTaxFilings.filter(t => t.status === 'filed' || t.status === 'accepted').length}</p>
                    <p className="text-amber-200 text-sm">Filed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTaxFilings.filter(t => t.status === 'pending').length}</p>
                    <p className="text-amber-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxes Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: FileText, label: 'File Taxes', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowFileTaxesDialog(true) },
                { icon: Calculator, label: 'Calculate', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowCalculateTaxDialog(true) },
                { icon: Calendar, label: 'Deadlines', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowTaxDeadlinesDialog(true) },
                { icon: Download, label: 'Forms', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowTaxFormsDownloadDialog(true) },
                { icon: Shield, label: 'Compliance', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowComplianceDialog(true) },
                { icon: History, label: 'History', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowTaxHistoryDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowTaxReportsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowTaxSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-green-500" />
                      Tax Filings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTaxFilings.map((filing) => (
                        <div key={filing.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{filing.type}</h4>
                              <Badge className={getTaxStatusColor(filing.status)}>{filing.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Period: {filing.period}</span>
                              <span>Due: {filing.dueDate}</span>
                              <span>Agency: {filing.agency}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {filing.amount > 0 && (
                              <div className="text-lg font-bold text-red-600">{formatCurrency(filing.amount)}</div>
                            )}
                            {filing.confirmationNumber && (
                              <div className="text-xs text-gray-500">{filing.confirmationNumber}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-500" />
                      Tax Summary YTD
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Federal Income Tax</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(1872000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Social Security</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(725000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Medicare</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(169000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">State Income Tax</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(744000)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">State Disability</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(128000)}</span>
                    </div>
                    <div className="pt-2 border-t dark:border-gray-700 flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Total Taxes</span>
                      <span className="font-bold text-red-600">{formatCurrency(3638000)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowDownloadTaxReportsDialog(true)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Tax Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowGenerateW2Dialog(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate W-2 Forms
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowGenerate1099Dialog(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate 1099 Forms
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowFileQuarterlyTaxesDialog(true)}>
                      <Send className="w-4 h-4 mr-2" />
                      File Quarterly Taxes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-4">
            {/* Benefits Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Benefits Administration</h2>
                  <p className="text-pink-100">Zenefits-level benefits management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockBenefits.length}</p>
                    <p className="text-pink-200 text-sm">Total Plans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockBenefits.filter(b => b.enrolledCount > 0).length}</p>
                    <p className="text-pink-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockBenefits.reduce((sum, b) => sum + b.enrolledCount, 0)}</p>
                    <p className="text-pink-200 text-sm">Enrolled</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Plan', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowAddBenefitPlanDialog(true) },
                { icon: Heart, label: 'Health', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowHealthBenefitsDialog(true) },
                { icon: Shield, label: 'Insurance', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowInsuranceDialog(true) },
                { icon: Briefcase, label: '401k', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShow401kDialog(true) },
                { icon: Users, label: 'Enrollment', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowEnrollmentDialog(true) },
                { icon: FileText, label: 'Documents', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowBenefitDocumentsDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowBenefitReportsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowBenefitSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBenefits.map((benefit) => {
                const BenefitIcon = getBenefitIcon(benefit.type)
                return (
                  <Card key={benefit.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                          <BenefitIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.name}</h3>
                          <p className="text-sm text-gray-500">{benefit.provider}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Coverage</span>
                          <span className="font-medium text-gray-900 dark:text-white">{benefit.coverage}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Employer Contribution</span>
                          <span className="font-medium text-green-600">{formatCurrency(benefit.employerContribution)}/mo</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Employee Contribution</span>
                          <span className="font-medium text-blue-600">{formatCurrency(benefit.employeeContribution)}/mo</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Enrolled</span>
                          <span className="font-medium text-gray-900 dark:text-white">{benefit.enrolledCount} employees</span>
                        </div>
                        <div className="pt-2 border-t dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Monthly Cost</span>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(benefit.totalCost)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Time & Attendance Tab */}
          <TabsContent value="time" className="space-y-4">
            {/* Time Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Time & Attendance</h2>
                  <p className="text-cyan-100">When I Work-level time tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTimeEntries.length}</p>
                    <p className="text-cyan-200 text-sm">Entries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTimeEntries.reduce((sum, t) => sum + t.totalHours, 0)}</p>
                    <p className="text-cyan-200 text-sm">Total Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTimeEntries.filter(t => t.status === 'approved').length}</p>
                    <p className="text-cyan-200 text-sm">Approved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Entry', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowNewTimeEntryDialog(true) },
                { icon: Clock, label: 'Clock In', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => setShowClockInDialog(true) },
                { icon: CheckCircle, label: 'Approve', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowApproveTimeDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowScheduleDialog(true) },
                { icon: Users, label: 'Team View', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowTeamViewDialog(true) },
                { icon: Download, label: 'Export', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowTimeExportDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowTimeReportsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setShowTimeSettingsDialog(true) }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Time Entries - This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTimeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-sm">
                            {entry.employeeName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{entry.employeeName}</div>
                          <div className="text-sm text-gray-500">{entry.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900 dark:text-white">{entry.regularHours}h</div>
                          <div className="text-xs text-gray-500">Regular</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-orange-600">{entry.overtimeHours}h</div>
                          <div className="text-xs text-gray-500">Overtime</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{entry.ptoHours}h</div>
                          <div className="text-xs text-gray-500">PTO</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{entry.totalHours}h</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <Badge className={entry.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {entry.status}
                        </Badge>
                        {entry.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => { setSelectedTimeEntry(entry); setShowApproveTimeDialog(true) }}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600" onClick={() => { setSelectedTimeEntry(entry); toast.error(`Time entry for ${entry.employeeName} rejected`) }}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Payroll Settings</h2>
                  <p className="text-gray-200">Configure your payroll system preferences</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">6</p>
                    <p className="text-gray-300 text-sm">Categories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-gray-300 text-sm">Options</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-500" />
                    Company Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Pay Frequency</div>
                      <div className="text-sm text-gray-500">Semi-monthly (1st & 15th)</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowPayFrequencyDialog(true)}>Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Fiscal Year</div>
                      <div className="text-sm text-gray-500">January - December</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowFiscalYearDialog(true)}>Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Default Currency</div>
                      <div className="text-sm text-gray-500">USD - US Dollar</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowCurrencyDialog(true)}>Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Bank Account</div>
                      <div className="text-sm text-gray-500">Chase Business ****4521</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowBankAccountDialog(true)}>Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Auto-process</div>
                      <div className="text-sm text-gray-500">Enabled - 2 days before pay date</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAutoProcessDialog(true)}>Configure</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Payroll Reminders</div>
                      <div className="text-sm text-gray-500">3 days before pay date</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Tax Filing Alerts</div>
                      <div className="text-sm text-gray-500">7 days before due date</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Failed Payment Alerts</div>
                      <div className="text-sm text-gray-500">Immediate notification</div>
                    </div>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Security & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Approval Workflow</div>
                      <div className="text-sm text-gray-500">Dual approval required</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowApprovalWorkflowDialog(true)}>Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Access Roles</div>
                      <div className="text-sm text-gray-500">5 admins, 3 managers</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowAccessRolesDialog(true)}>Manage</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={payrollAIInsights}
              title="Payroll Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={payrollCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={payrollPredictions}
              title="Payroll Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={payrollActivities}
            title="Payroll Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={payrollQuickActions}
            variant="grid"
          />
        </div>

        {/* Pay Run Detail Dialog */}
        <Dialog open={showPayRunDialog} onOpenChange={setShowPayRunDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pay Run Details</DialogTitle>
            </DialogHeader>
            {selectedPayRun && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedPayRun.period}</h3>
                  <Badge className={getStatusColor(selectedPayRun.status)}>
                    {selectedPayRun.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Pay Date</div>
                    <div className="font-semibold">{selectedPayRun.payDate}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Employees</div>
                    <div className="font-semibold">{selectedPayRun.employeeCount}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Gross Pay</div>
                    <div className="font-semibold text-green-600">{formatCurrency(selectedPayRun.totalGross)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Net Pay</div>
                    <div className="font-semibold text-blue-600">{formatCurrency(selectedPayRun.totalNet)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Taxes</div>
                    <div className="font-semibold text-red-600">{formatCurrency(selectedPayRun.totalTaxes)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Deductions</div>
                    <div className="font-semibold text-purple-600">{formatCurrency(selectedPayRun.totalDeductions)}</div>
                  </div>
                </div>
                {selectedPayRun.approvedBy && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="text-sm text-gray-500">Approved by</div>
                    <div className="font-semibold text-green-700 dark:text-green-400">{selectedPayRun.approvedBy}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={handleExportReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={handleViewPayRunDetails}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Employee Detail Dialog */}
        <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedEmployee.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white text-xl">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                    <p className="text-gray-500">{selectedEmployee.role} • {selectedEmployee.department}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getEmployeeTypeColor(selectedEmployee.employeeType)}>
                        {selectedEmployee.employeeType.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Annual Salary</div>
                    <div className="font-semibold">{selectedEmployee.salary > 0 ? formatCurrency(selectedEmployee.salary) : `$${selectedEmployee.hourlyRate}/hr`}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Payment Method</div>
                    <div className="font-semibold">{selectedEmployee.paymentMethod.replace('_', ' ')}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Last Pay (Gross)</div>
                    <div className="font-semibold text-green-600">{formatCurrencyDetailed(selectedEmployee.grossPay)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Last Pay (Net)</div>
                    <div className="font-semibold text-blue-600">{formatCurrencyDetailed(selectedEmployee.netPay)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Taxes Withheld</div>
                    <div className="font-semibold text-red-600">{formatCurrencyDetailed(selectedEmployee.taxes)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-sm text-gray-500">Benefits</div>
                    <div className="font-semibold text-purple-600">{formatCurrencyDetailed(selectedEmployee.benefits)}/mo</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => setShowPayStubsDialog(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Pay Stubs
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => setShowEditEmployeeDetailsDialog(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Payroll Run Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Payroll Run' : 'Create Payroll Run'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Input
                  id="period"
                  placeholder="e.g., January 1-15, 2025"
                  value={formState.period}
                  onChange={(e) => setFormState({ ...formState, period: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay_date">Pay Date *</Label>
                <Input
                  id="pay_date"
                  type="date"
                  value={formState.pay_date}
                  onChange={(e) => setFormState({ ...formState, pay_date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_employees">Employees</Label>
                  <Input
                    id="total_employees"
                    type="number"
                    min="0"
                    value={formState.total_employees}
                    onChange={(e) => setFormState({ ...formState, total_employees: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Total Amount ($)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.total_amount}
                    onChange={(e) => setFormState({ ...formState, total_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Engineering, Sales"
                  value={formState.department}
                  onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateDialog(false)
                    setFormState(initialFormState)
                    setEditingId(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  onClick={editingId ? handleUpdatePayrollRun : handleCreatePayrollRun}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Export Payroll Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" placeholder="Start Date" />
                  <Input type="date" placeholder="End Date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Pay Runs</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Employee Details</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Tax Information</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Preparing payroll export...',
                        success: () => {
                          const blob = new Blob(['Payroll Export Data\nPeriod,Pay Date,Status,Total,Employees\n' + mockPayRuns.map(r => `${r.period},${r.payDate},${r.status},${r.totalGross},${r.employeeCount}`).join('\n')], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `payroll-export-${new Date().toISOString().split('T')[0]}.csv`
                          a.click()
                          URL.revokeObjectURL(url)
                          return 'Payroll data exported successfully!'
                        },
                        error: 'Failed to export payroll data'
                      }
                    )
                    setShowExportDialog(false)
                  }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Payroll Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop your file here, or click to browse</p>
                <Button variant="outline" size="sm" onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.csv,.xlsx,.xls'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        toast.success(`File "${file.name}" selected`, { description: 'Ready to import' })
                      }
                    }
                    input.click()
                  }}>Choose File</Button>
              </div>
              <div className="space-y-2">
                <Label>Import Type</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="employees">Employee Data</option>
                  <option value="timesheet">Timesheet Data</option>
                  <option value="benefits">Benefits Data</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'Importing payroll data...',
                        success: 'Payroll data imported successfully! Records have been updated.',
                        error: 'Failed to import payroll data'
                      }
                    )
                    setShowImportDialog(false)
                  }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Filter Payroll Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="product">Product</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" placeholder="Start Date" />
                  <Input type="date" placeholder="End Date" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFiltersDialog(false)}>Clear</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Filters applied', { description: 'Showing filtered results' })
                    setShowFiltersDialog(false)
                  }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john.doe@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                    <option value="">Select Department</option>
                    <option value="engineering">Engineering</option>
                    <option value="product">Product</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Employee Type</Label>
                  <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contractor">Contractor</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input type="number" placeholder="75000" />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddEmployeeDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Adding new employee...',
                        success: 'Employee added successfully! They will receive onboarding email.',
                        error: 'Failed to add employee'
                      }
                    )
                    setShowAddEmployeeDialog(false)
                  }}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employee Import Dialog */}
        <Dialog open={showEmployeeImportDialog} onOpenChange={setShowEmployeeImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Employees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-2">Upload CSV or Excel file with employee data</p>
                <Button variant="outline" size="sm" onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.csv,.xlsx,.xls'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        toast.success(`File "${file.name}" selected`, { description: 'Ready to import employees' })
                      }
                    }
                    input.click()
                  }}>Choose File</Button>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">Download our template to ensure proper formatting</p>
                <Button variant="link" size="sm" className="p-0 h-auto text-blue-600" onClick={() => {
                    const template = 'First Name,Last Name,Email,Department,Employee Type,Salary,Start Date\nJohn,Doe,john.doe@company.com,Engineering,full_time,75000,2024-01-15'
                    const blob = new Blob([template], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'employee-import-template.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success('Template downloaded')
                  }}>Download Template</Button>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmployeeImportDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'Importing employees...',
                        success: 'Employees imported successfully! 15 new records added.',
                        error: 'Failed to import employees'
                      }
                    )
                    setShowEmployeeImportDialog(false)
                  }}>Import</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employee Export Dialog */}
        <Dialog open={showEmployeeExportDialog} onOpenChange={setShowEmployeeExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Export Employee Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                  <option value="pdf">PDF Report</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Include Fields</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Personal Information</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Salary Details</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Benefits Enrollment</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmployeeExportDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Preparing employee export...',
                        success: () => {
                          const blob = new Blob(['Employee Data Export\nName,Email,Department,Role,Salary,Status\n' + mockEmployees.map(e => `${e.name},${e.email},${e.department},${e.role},${e.salary},${e.status}`).join('\n')], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `employees-export-${new Date().toISOString().split('T')[0]}.csv`
                          a.click()
                          URL.revokeObjectURL(url)
                          return 'Employee data exported successfully!'
                        },
                        error: 'Failed to export employee data'
                      }
                    )
                    setShowEmployeeExportDialog(false)
                  }}>Export</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Payment Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="direct_deposit">Direct Deposit</option>
                  <option value="check">Check</option>
                  <option value="wire">Wire Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Input placeholder="Account Number" />
              </div>
              <div className="space-y-2">
                <Label>Routing Number</Label>
                <Input placeholder="Routing Number" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1200)),
                      {
                        loading: 'Saving payment settings...',
                        success: 'Payment settings updated successfully!',
                        error: 'Failed to save payment settings'
                      }
                    )
                    setShowPaymentDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax Forms Dialog */}
        <Dialog open={showTaxFormsDialog} onOpenChange={setShowTaxFormsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Employee Tax Forms</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['W-4', 'I-9', 'State Tax Form', 'Direct Deposit Form'].map((form) => (
                  <div key={form} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{form}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.success(`${form} downloading...`, { description: 'Form will open in a new tab' })
                        window.open(`https://www.irs.gov/pub/irs-pdf/f${form.toLowerCase().replace('-', '')}.pdf`, '_blank')
                      }}>Download</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTaxFormsDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Preparing all tax forms...',
                        success: 'All tax forms downloaded as ZIP archive',
                        error: 'Failed to download forms'
                      }
                    )
                    setShowTaxFormsDialog(false)
                  }}>Download All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notify All Dialog */}
        <Dialog open={showNotifyAllDialog} onOpenChange={setShowNotifyAllDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Notification to All Employees</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Enter notification subject" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Enter your message..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Send Via</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNotifyAllDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'Sending notification to all employees...',
                        success: `Notification sent to ${mockEmployees.length} employees successfully!`,
                        error: 'Failed to send notification'
                      }
                    )
                    setShowNotifyAllDialog(false)
                  }}>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employee Reports Dialog */}
        <Dialog open={showEmployeeReportsDialog} onOpenChange={setShowEmployeeReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Employee Reports</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Headcount Report', 'Salary Distribution', 'Department Summary', 'Turnover Analysis', 'Benefits Enrollment'].map((report) => (
                  <div key={report} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{report}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.promise(
                          new Promise((resolve) => setTimeout(resolve, 1500)),
                          {
                            loading: `Generating ${report}...`,
                            success: `${report} generated successfully!`,
                            error: `Failed to generate ${report}`
                          }
                        )
                      }}>Generate</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmployeeReportsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Employee Settings Dialog */}
        <Dialog open={showEmployeeSettingsDialog} onOpenChange={setShowEmployeeSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Employee Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-enroll in Benefits</div>
                  <div className="text-sm text-gray-500">Automatically enroll new employees</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Self-Service Portal</div>
                  <div className="text-sm text-gray-500">Allow employees to update their info</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-gray-500">Send payroll notifications</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmployeeSettingsDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Employee settings saved successfully!')
                    setShowEmployeeSettingsDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* File Taxes Dialog */}
        <Dialog open={showFileTaxesDialog} onOpenChange={setShowFileTaxesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>File Taxes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tax Type</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="federal">Federal Tax (Form 941)</option>
                  <option value="state">State Income Tax</option>
                  <option value="unemployment">Unemployment Tax</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="q1">Q1 2025</option>
                  <option value="q4">Q4 2024</option>
                  <option value="q3">Q3 2024</option>
                </select>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Estimated tax amount: $324,500</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFileTaxesDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 3000)),
                      {
                        loading: 'Initiating tax filing with IRS...',
                        success: 'Tax filing submitted successfully! Confirmation number: IRS-2024-Q4-' + Math.random().toString(36).substring(7).toUpperCase(),
                        error: 'Failed to submit tax filing'
                      }
                    )
                    setShowFileTaxesDialog(false)
                  }}>File Now</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Calculate Tax Dialog */}
        <Dialog open={showCalculateTaxDialog} onOpenChange={setShowCalculateTaxDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tax Calculator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gross Pay</Label>
                <Input type="number" placeholder="Enter gross pay amount" />
              </div>
              <div className="space-y-2">
                <Label>Filing Status</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                  <option value="head">Head of Household</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="ca">California</option>
                  <option value="ny">New York</option>
                  <option value="tx">Texas</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCalculateTaxDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    const federalTax = Math.round(Math.random() * 5000 + 8000)
                    const stateTax = Math.round(Math.random() * 2000 + 3000)
                    const totalTax = federalTax + stateTax
                    toast.success(`Tax Calculation Complete`, {
                      description: `Federal: $${federalTax.toLocaleString()} | State: $${stateTax.toLocaleString()} | Total: $${totalTax.toLocaleString()}`,
                      duration: 8000
                    })
                    setShowCalculateTaxDialog(false)
                  }}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax Deadlines Dialog */}
        <Dialog open={showTaxDeadlinesDialog} onOpenChange={setShowTaxDeadlinesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tax Deadlines</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Q4 Federal Tax (941)', date: 'Jan 31, 2025', status: 'upcoming' },
                  { name: 'W-2 Distribution', date: 'Jan 31, 2025', status: 'upcoming' },
                  { name: '1099 Forms', date: 'Jan 31, 2025', status: 'upcoming' },
                  { name: 'Q1 Estimated Tax', date: 'Apr 15, 2025', status: 'future' }
                ].map((deadline) => (
                  <div key={deadline.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-medium">{deadline.name}</div>
                      <div className="text-sm text-gray-500">{deadline.date}</div>
                    </div>
                    <Badge className={deadline.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>{deadline.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTaxDeadlinesDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax Forms Download Dialog */}
        <Dialog open={showTaxFormsDownloadDialog} onOpenChange={setShowTaxFormsDownloadDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Download Tax Forms</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Form 941', 'Form 940', 'W-2', 'W-3', '1099-NEC', '1099-MISC'].map((form) => (
                  <div key={form} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{form}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.success(`${form} downloading...`, { description: 'PDF form will open in a new tab' })
                        window.open(`https://www.irs.gov/pub/irs-pdf/f${form.toLowerCase().replace(' ', '')}.pdf`, '_blank')
                      }}>Download</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTaxFormsDownloadDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Compliance Dialog */}
        <Dialog open={showComplianceDialog} onOpenChange={setShowComplianceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tax Compliance Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Federal Tax Compliance', status: 'compliant' },
                  { name: 'State Tax Compliance', status: 'compliant' },
                  { name: 'Workers Comp', status: 'compliant' },
                  { name: 'Unemployment Insurance', status: 'review' }
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge className={item.status === 'compliant' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{item.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowComplianceDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax History Dialog */}
        <Dialog open={showTaxHistoryDialog} onOpenChange={setShowTaxHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tax Filing History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { period: 'Q3 2024', type: 'Form 941', amount: '$298,000', status: 'accepted' },
                  { period: 'Q2 2024', type: 'Form 941', amount: '$285,000', status: 'accepted' },
                  { period: 'Q1 2024', type: 'Form 941', amount: '$275,000', status: 'accepted' }
                ].map((filing, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-medium">{filing.type} - {filing.period}</div>
                      <div className="text-sm text-gray-500">{filing.amount}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">{filing.status}</Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTaxHistoryDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax Reports Dialog */}
        <Dialog open={showTaxReportsDialog} onOpenChange={setShowTaxReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tax Reports</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Tax Liability Summary', 'Quarterly Tax Report', 'Annual Tax Summary', 'Tax Payment History'].map((report) => (
                  <div key={report} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{report}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.promise(
                          new Promise((resolve) => setTimeout(resolve, 1500)),
                          {
                            loading: `Generating ${report}...`,
                            success: `${report} generated and ready for download!`,
                            error: `Failed to generate ${report}`
                          }
                        )
                      }}>Generate</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTaxReportsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax Settings Dialog */}
        <Dialog open={showTaxSettingsDialog} onOpenChange={setShowTaxSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tax Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-file Taxes</div>
                  <div className="text-sm text-gray-500">Automatically file taxes when due</div>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Tax Reminders</div>
                  <div className="text-sm text-gray-500">Send reminders before deadlines</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="space-y-2">
                <Label>Default Filing Agency</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="irs">IRS</option>
                  <option value="ssa">SSA</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTaxSettingsDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Tax settings saved successfully!')
                    setShowTaxSettingsDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Tax Reports Dialog */}
        <Dialog open={showDownloadTaxReportsDialog} onOpenChange={setShowDownloadTaxReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Download Tax Reports</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="summary">Tax Summary Report</option>
                  <option value="detailed">Detailed Tax Report</option>
                  <option value="ytd">Year-to-Date Report</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDownloadTaxReportsDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Generating tax report...',
                        success: () => {
                          const blob = new Blob(['Tax Report - YTD Summary\n\nFederal Income Tax: $1,872,000\nSocial Security: $725,000\nMedicare: $169,000\nState Income Tax: $744,000\nState Disability: $128,000\n\nTotal: $3,638,000'], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `tax-report-${new Date().toISOString().split('T')[0]}.txt`
                          a.click()
                          URL.revokeObjectURL(url)
                          return 'Tax report downloaded successfully!'
                        },
                        error: 'Failed to download tax report'
                      }
                    )
                    setShowDownloadTaxReportsDialog(false)
                  }}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate W-2 Dialog */}
        <Dialog open={showGenerateW2Dialog} onOpenChange={setShowGenerateW2Dialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate W-2 Forms</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tax Year</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Employees</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="all">All Employees (156)</option>
                  <option value="selected">Selected Employees</option>
                </select>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">W-2 forms will be generated for all employees who worked during the selected tax year.</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowGenerateW2Dialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 3000)),
                      {
                        loading: 'Generating W-2 forms for 156 employees...',
                        success: 'W-2 forms generated successfully! Available in Documents section.',
                        error: 'Failed to generate W-2 forms'
                      }
                    )
                    setShowGenerateW2Dialog(false)
                  }}>Generate W-2s</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate 1099 Dialog */}
        <Dialog open={showGenerate1099Dialog} onOpenChange={setShowGenerate1099Dialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate 1099 Forms</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tax Year</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Form Type</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="1099-nec">1099-NEC (Non-Employee Compensation)</option>
                  <option value="1099-misc">1099-MISC</option>
                </select>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">1099 forms will be generated for contractors who earned $600 or more.</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowGenerate1099Dialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2500)),
                      {
                        loading: 'Generating 1099 forms for contractors...',
                        success: '1099 forms generated for 12 contractors! Available in Documents section.',
                        error: 'Failed to generate 1099 forms'
                      }
                    )
                    setShowGenerate1099Dialog(false)
                  }}>Generate 1099s</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* File Quarterly Taxes Dialog */}
        <Dialog open={showFileQuarterlyTaxesDialog} onOpenChange={setShowFileQuarterlyTaxesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>File Quarterly Taxes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="q4-2024">Q4 2024</option>
                  <option value="q1-2025">Q1 2025</option>
                </select>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Federal Tax (941)</span>
                  <span className="font-semibold">$324,500</span>
                </div>
                <div className="flex justify-between">
                  <span>State Unemployment</span>
                  <span className="font-semibold">$12,800</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Due</span>
                  <span className="font-bold text-red-600">$337,300</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFileQuarterlyTaxesDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 3000)),
                      {
                        loading: 'Filing quarterly taxes with federal and state agencies...',
                        success: 'Quarterly taxes filed successfully! Total: $337,300. Confirmation sent to your email.',
                        error: 'Failed to file quarterly taxes'
                      }
                    )
                    setShowFileQuarterlyTaxesDialog(false)
                  }}>
                  <Send className="w-4 h-4 mr-2" />
                  File Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Benefit Plan Dialog */}
        <Dialog open={showAddBenefitPlanDialog} onOpenChange={setShowAddBenefitPlanDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Benefit Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input placeholder="Enter plan name" />
              </div>
              <div className="space-y-2">
                <Label>Benefit Type</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="health">Health Insurance</option>
                  <option value="dental">Dental Insurance</option>
                  <option value="vision">Vision Insurance</option>
                  <option value="life">Life Insurance</option>
                  <option value="401k">401(k)</option>
                  <option value="hsa">HSA</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employer Contribution</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Employee Contribution</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Input placeholder="Enter provider name" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddBenefitPlanDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Creating benefit plan...',
                        success: 'Benefit plan created successfully! Employees can now enroll.',
                        error: 'Failed to create benefit plan'
                      }
                    )
                    setShowAddBenefitPlanDialog(false)
                  }}>Add Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Health Benefits Dialog */}
        <Dialog open={showHealthBenefitsDialog} onOpenChange={setShowHealthBenefitsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Health Benefits Overview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Medical Insurance - PPO', enrolled: 142, cost: '$170,400/mo' },
                  { name: 'Medical Insurance - HMO', enrolled: 28, cost: '$22,400/mo' }
                ].map((plan) => (
                  <div key={plan.name} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{plan.name}</span>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div>{plan.enrolled} employees enrolled</div>
                      <div>Monthly cost: {plan.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowHealthBenefitsDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => { setShowHealthBenefitsDialog(false); setShowAddBenefitPlanDialog(true) }}>Add New Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Insurance Dialog */}
        <Dialog open={showInsuranceDialog} onOpenChange={setShowInsuranceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Insurance Plans</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { name: 'Life Insurance', provider: 'MetLife', coverage: '2x Annual Salary' },
                  { name: 'Disability Insurance', provider: 'Prudential', coverage: '60% Income' },
                  { name: 'AD&D Insurance', provider: 'MetLife', coverage: '1x Annual Salary' }
                ].map((plan) => (
                  <div key={plan.name} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-gray-500">
                      <div>Provider: {plan.provider}</div>
                      <div>Coverage: {plan.coverage}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowInsuranceDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 401k Dialog */}
        <Dialog open={show401kDialog} onOpenChange={setShow401kDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>401(k) Retirement Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="font-medium mb-3">Plan Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Provider</span>
                    <span>Fidelity</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employer Match</span>
                    <span>6%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vesting Schedule</span>
                    <span>4 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enrolled</span>
                    <span>148 employees</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-400">
                  <div className="font-medium">Total Plan Assets</div>
                  <div className="text-2xl font-bold">$4,250,000</div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShow401kDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Opening Fidelity NetBenefits portal...', { description: 'You will be redirected to the plan management dashboard' })
                    window.open('https://nb.fidelity.com/public/nb/default/home', '_blank')
                    setShow401kDialog(false)
                  }}>Manage Plan</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enrollment Dialog */}
        <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Benefits Enrollment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">Open enrollment period: Nov 1 - Nov 30, 2024</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span>Pending Enrollments</span>
                  <Badge className="bg-yellow-100 text-yellow-700">12</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span>Completed Enrollments</span>
                  <Badge className="bg-green-100 text-green-700">144</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span>Declined Coverage</span>
                  <Badge className="bg-gray-100 text-gray-700">2</Badge>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEnrollmentDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Sending enrollment reminders...',
                        success: 'Enrollment reminders sent to 12 employees with pending enrollment!',
                        error: 'Failed to send reminders'
                      }
                    )
                    setShowEnrollmentDialog(false)
                  }}>Send Reminders</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Benefit Documents Dialog */}
        <Dialog open={showBenefitDocumentsDialog} onOpenChange={setShowBenefitDocumentsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Benefits Documents</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Summary Plan Description', 'Enrollment Guide', 'Benefits Summary', 'COBRA Notice', 'HIPAA Notice'].map((doc) => (
                  <div key={doc} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{doc}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.success(`${doc} downloading...`, { description: 'Document will be ready shortly' })
                      }}>Download</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowBenefitDocumentsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Benefit Reports Dialog */}
        <Dialog open={showBenefitReportsDialog} onOpenChange={setShowBenefitReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Benefits Reports</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Enrollment Summary', 'Cost Analysis', 'Utilization Report', 'Premium Breakdown', 'Claims Report'].map((report) => (
                  <div key={report} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{report}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.promise(
                          new Promise((resolve) => setTimeout(resolve, 1500)),
                          {
                            loading: `Generating ${report}...`,
                            success: `${report} generated successfully!`,
                            error: `Failed to generate ${report}`
                          }
                        )
                      }}>Generate</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowBenefitReportsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Benefit Settings Dialog */}
        <Dialog open={showBenefitSettingsDialog} onOpenChange={setShowBenefitSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Benefits Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Enrollment</div>
                  <div className="text-sm text-gray-500">Automatically enroll new hires</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enrollment Reminders</div>
                  <div className="text-sm text-gray-500">Send reminders during open enrollment</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="space-y-2">
                <Label>Waiting Period</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="0">Immediate</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowBenefitSettingsDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Benefits settings saved successfully!')
                    setShowBenefitSettingsDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Time Entry Dialog */}
        <Dialog open={showNewTimeEntryDialog} onOpenChange={setShowNewTimeEntryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select Employee</option>
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Regular Hours</Label>
                  <Input type="number" placeholder="8" />
                </div>
                <div className="space-y-2">
                  <Label>Overtime</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>PTO</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewTimeEntryDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1000)),
                      {
                        loading: 'Creating time entry...',
                        success: 'Time entry created successfully!',
                        error: 'Failed to create time entry'
                      }
                    )
                    setShowNewTimeEntryDialog(false)
                  }}>Create Entry</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clock In Dialog */}
        <Dialog open={showClockInDialog} onOpenChange={setShowClockInDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Clock In/Out</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-6">
                <Clock className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <div className="text-3xl font-bold mb-2">{new Date().toLocaleTimeString()}</div>
                <div className="text-gray-500">{new Date().toLocaleDateString()}</div>
              </div>
              <div className="space-y-2">
                <Label>Employee</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select Employee</option>
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button className="bg-green-500 text-white" onClick={() => {
                    const now = new Date().toLocaleTimeString()
                    toast.success(`Clocked in at ${now}`, { description: 'Have a productive day!' })
                    setShowClockInDialog(false)
                  }}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Clock In
                </Button>
                <Button variant="outline" onClick={() => {
                    const now = new Date().toLocaleTimeString()
                    toast.success(`Clocked out at ${now}`, { description: 'Great work today!' })
                    setShowClockInDialog(false)
                  }}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Approve Time Dialog */}
        <Dialog open={showApproveTimeDialog} onOpenChange={setShowApproveTimeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Approve Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTimeEntry ? (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="font-medium mb-2">{selectedTimeEntry.employeeName}</div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>Date: {selectedTimeEntry.date}</div>
                      <div>Regular Hours: {selectedTimeEntry.regularHours}h</div>
                      <div>Overtime: {selectedTimeEntry.overtimeHours}h</div>
                      <div>PTO: {selectedTimeEntry.ptoHours}h</div>
                      <div className="font-medium pt-2">Total: {selectedTimeEntry.totalHours}h</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea placeholder="Add approval notes..." />
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Select pending time entries to approve them.</p>
                  <p className="text-sm mt-2">There are {mockTimeEntries.filter(e => e.status === 'pending').length} pending entries.</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowApproveTimeDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    if (selectedTimeEntry) {
                      toast.success(`Time entry approved for ${selectedTimeEntry.employeeName}`, {
                        description: `${selectedTimeEntry.totalHours} hours approved`
                      })
                    } else {
                      toast.success('All pending time entries approved')
                    }
                    setShowApproveTimeDialog(false)
                    setSelectedTimeEntry(null)
                  }}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Work Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">All Employees</option>
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Week</Label>
                <Input type="week" />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Standard Schedule</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Monday - Friday</span><span>9:00 AM - 5:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday - Sunday</span><span>Off</span></div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowScheduleDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Schedule saved successfully!', { description: 'Employees will be notified of any changes' })
                    setShowScheduleDialog(false)
                  }}>Save Schedule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team View Dialog */}
        <Dialog open={showTeamViewDialog} onOpenChange={setShowTeamViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Team Time Overview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mockEmployees.slice(0, 5).map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-gray-500">{emp.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">40h</div>
                      <div className="text-sm text-gray-500">This week</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTeamViewDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Time Export Dialog */}
        <Dialog open={showTimeExportDialog} onOpenChange={setShowTimeExportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Export Time Data</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTimeExportDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Exporting time data...',
                        success: () => {
                          const blob = new Blob(['Time & Attendance Export\nEmployee,Date,Regular,Overtime,PTO,Total,Status\n' + mockTimeEntries.map(t => `${t.employeeName},${t.date},${t.regularHours},${t.overtimeHours},${t.ptoHours},${t.totalHours},${t.status}`).join('\n')], { type: 'text/csv' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `time-export-${new Date().toISOString().split('T')[0]}.csv`
                          a.click()
                          URL.revokeObjectURL(url)
                          return 'Time data exported successfully!'
                        },
                        error: 'Failed to export time data'
                      }
                    )
                    setShowTimeExportDialog(false)
                  }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Time Reports Dialog */}
        <Dialog open={showTimeReportsDialog} onOpenChange={setShowTimeReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Time & Attendance Reports</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Hours Summary', 'Overtime Report', 'PTO Usage', 'Attendance Report', 'Timesheet Audit'].map((report) => (
                  <div key={report} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{report}</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.promise(
                          new Promise((resolve) => setTimeout(resolve, 1500)),
                          {
                            loading: `Generating ${report}...`,
                            success: `${report} generated successfully!`,
                            error: `Failed to generate ${report}`
                          }
                        )
                      }}>Generate</Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTimeReportsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Time Settings Dialog */}
        <Dialog open={showTimeSettingsDialog} onOpenChange={setShowTimeSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Time & Attendance Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Overtime Alerts</div>
                  <div className="text-sm text-gray-500">Alert when approaching overtime</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-approve Regular Hours</div>
                  <div className="text-sm text-gray-500">Automatically approve standard hours</div>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="space-y-2">
                <Label>Overtime Threshold</Label>
                <Input type="number" placeholder="40" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowTimeSettingsDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Time & Attendance settings saved successfully!')
                    setShowTimeSettingsDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pay Frequency Dialog */}
        <Dialog open={showPayFrequencyDialog} onOpenChange={setShowPayFrequencyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Pay Frequency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pay Frequency</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="weekly">Weekly</option>
                  <option value="bi_weekly">Bi-Weekly</option>
                  <option value="semi_monthly" selected>Semi-Monthly (1st & 15th)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Changing pay frequency will affect all future pay runs.</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowPayFrequencyDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Pay frequency updated successfully!', { description: 'Changes will take effect next pay period' })
                    setShowPayFrequencyDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fiscal Year Dialog */}
        <Dialog open={showFiscalYearDialog} onOpenChange={setShowFiscalYearDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Fiscal Year</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fiscal Year Start</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="january" selected>January</option>
                  <option value="april">April</option>
                  <option value="july">July</option>
                  <option value="october">October</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFiscalYearDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Fiscal year settings updated!', { description: 'Reports will now use the new fiscal year calendar' })
                    setShowFiscalYearDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Currency Dialog */}
        <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Default Currency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="usd" selected>USD - US Dollar</option>
                  <option value="eur">EUR - Euro</option>
                  <option value="gbp">GBP - British Pound</option>
                  <option value="cad">CAD - Canadian Dollar</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCurrencyDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Default currency updated!', { description: 'All future transactions will use the new currency' })
                    setShowCurrencyDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bank Account Dialog */}
        <Dialog open={showBankAccountDialog} onOpenChange={setShowBankAccountDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Bank Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="font-medium mb-2">Current Account</div>
                <div className="text-sm text-gray-500">
                  <div>Chase Business Checking</div>
                  <div>Account: ****4521</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input placeholder="Enter bank name" />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input placeholder="Enter account number" />
              </div>
              <div className="space-y-2">
                <Label>Routing Number</Label>
                <Input placeholder="Enter routing number" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowBankAccountDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 2000)),
                      {
                        loading: 'Verifying bank account details...',
                        success: 'Bank account updated successfully! Micro-deposits will be sent for verification.',
                        error: 'Failed to update bank account'
                      }
                    )
                    setShowBankAccountDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Auto-Process Dialog */}
        <Dialog open={showAutoProcessDialog} onOpenChange={setShowAutoProcessDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure Auto-Process</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Enable Auto-Process</div>
                  <div className="text-sm text-gray-500">Automatically process payroll</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>
              <div className="space-y-2">
                <Label>Days Before Pay Date</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="1">1 day</option>
                  <option value="2" selected>2 days</option>
                  <option value="3">3 days</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAutoProcessDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Auto-process settings saved!', { description: 'Payroll will be processed automatically 2 days before pay date' })
                    setShowAutoProcessDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Approval Workflow Dialog */}
        <Dialog open={showApprovalWorkflowDialog} onOpenChange={setShowApprovalWorkflowDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Configure Approval Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Approval Type</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="single">Single Approval</option>
                  <option value="dual" selected>Dual Approval</option>
                  <option value="sequential">Sequential Approval</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Primary Approver</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select Approver</option>
                  <option value="cfo">CFO</option>
                  <option value="hr">HR Director</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Secondary Approver</Label>
                <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select Approver</option>
                  <option value="ceo">CEO</option>
                  <option value="controller">Controller</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowApprovalWorkflowDialog(false)}>Cancel</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('Approval workflow updated!', { description: 'New workflow will apply to all future payroll submissions' })
                    setShowApprovalWorkflowDialog(false)
                  }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Access Roles Dialog */}
        <Dialog open={showAccessRolesDialog} onOpenChange={setShowAccessRolesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Manage Access Roles</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { role: 'Admin', count: 5, permissions: 'Full access' },
                  { role: 'Manager', count: 3, permissions: 'View & approve' },
                  { role: 'Viewer', count: 8, permissions: 'View only' }
                ].map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-medium">{role.role}</div>
                      <div className="text-sm text-gray-500">{role.permissions}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700">{role.count} users</Badge>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.info(`Editing ${role.role} role`, { description: 'Role editor opening...' })
                      }}>Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAccessRolesDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.success('New role created!', { description: 'Configure permissions in the role editor' })
                  }}>Add Role</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pay Stubs Dialog */}
        <Dialog open={showPayStubsDialog} onOpenChange={setShowPayStubsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Pay Stubs - {selectedEmployee?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {['Dec 15, 2024', 'Dec 1, 2024', 'Nov 15, 2024', 'Nov 1, 2024'].map((date) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">Pay Stub - {date}</div>
                        <div className="text-sm text-gray-500">Net: {formatCurrencyDetailed(selectedEmployee?.netPay || 0)}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        toast.success(`Pay stub for ${date} downloading...`)
                      }}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowPayStubsDialog(false)}>Close</Button>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1500)),
                      {
                        loading: 'Preparing pay stubs download...',
                        success: 'All pay stubs downloaded as ZIP archive!',
                        error: 'Failed to download pay stubs'
                      }
                    )
                    setShowPayStubsDialog(false)
                  }}>Download All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Details Dialog */}
        <Dialog open={showEditEmployeeDetailsDialog} onOpenChange={setShowEditEmployeeDetailsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input defaultValue={selectedEmployee.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={selectedEmployee.email} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input defaultValue={selectedEmployee.department} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue={selectedEmployee.role} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input type="number" defaultValue={selectedEmployee.salary} />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <select className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" defaultValue={selectedEmployee.paymentMethod}>
                      <option value="direct_deposit">Direct Deposit</option>
                      <option value="check">Check</option>
                      <option value="wire_transfer">Wire Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEditEmployeeDetailsDialog(false)}>Cancel</Button>
                  <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => {
                      toast.promise(
                        new Promise((resolve) => setTimeout(resolve, 1200)),
                        {
                          loading: 'Saving employee details...',
                          success: `${selectedEmployee?.name}'s details updated successfully!`,
                          error: 'Failed to update employee details'
                        }
                      )
                      setShowEditEmployeeDetailsDialog(false)
                    }}>Save Changes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
