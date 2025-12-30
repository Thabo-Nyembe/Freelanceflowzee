'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  const supabase = createClientComponentClient()

  // UI State
  const [activeTab, setActiveTab] = useState('pay-runs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPayRun, setSelectedPayRun] = useState<PayRun | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showPayRunDialog, setShowPayRunDialog] = useState(false)
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

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
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
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
          <Button variant="outline" size="sm">
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
                onClick={() => toast.info('Select a pay run to approve')}
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
                onClick={() => toast.info('Analytics view coming soon')}
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
                { icon: UserPlus, label: 'Add Employee', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Upload, label: 'Import', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Download, label: 'Export', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: CreditCard, label: 'Payment', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: FileText, label: 'Tax Forms', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Mail, label: 'Notify All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
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
                { icon: FileText, label: 'File Taxes', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Calculator, label: 'Calculate', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Calendar, label: 'Deadlines', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Download, label: 'Forms', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Shield, label: 'Compliance', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: History, label: 'History', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
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
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download Tax Reports
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate W-2 Forms
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate 1099 Forms
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
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
                { icon: Plus, label: 'Add Plan', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Heart, label: 'Health', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Shield, label: 'Insurance', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Briefcase, label: '401k', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Users, label: 'Enrollment', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: FileText, label: 'Documents', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
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
                { icon: Plus, label: 'New Entry', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Clock, label: 'Clock In', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
                { icon: CheckCircle, label: 'Approve', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Calendar, label: 'Schedule', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Users, label: 'Team View', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Download, label: 'Export', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
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
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-600">
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
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Fiscal Year</div>
                      <div className="text-sm text-gray-500">January - December</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Default Currency</div>
                      <div className="text-sm text-gray-500">USD - US Dollar</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
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
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Auto-process</div>
                      <div className="text-sm text-gray-500">Enabled - 2 days before pay date</div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
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
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Access Roles</div>
                      <div className="text-sm text-gray-500">5 admins, 3 managers</div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
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
              onInsightAction={(insight) => console.log('Insight action:', insight)}
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
                  <Button className="flex-1" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Pay Stubs
                  </Button>
                  <Button className="flex-1" variant="outline">
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
      </div>
    </div>
  )
}
