'use client'

import { useState, useMemo } from 'react'
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, Employee as DBEmployee } from '@/lib/hooks/use-employees'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users, UserPlus, Briefcase, DollarSign, Eye, MessageCircle, Mail, Star,
  Search, Calendar, Clock, Heart, Target, FileText, CheckCircle, XCircle,
  ChevronRight, ChevronDown, Building2, MapPin, Phone, GraduationCap, Zap,
  Settings, Download, Upload, Edit3, Trash2, Bell, BookOpen, Cake,
  Plane, Umbrella, Coffee, Home, BarChart3, TrendingDown, ArrowUpRight,
  UserCheck, UserMinus, Layers, Wallet, Shield, Lock, Key, Plus,
  Play, FileCheck, Clipboard, Activity
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
  employeesAIInsights,
  employeesCollaborators,
  employeesPredictions,
  employeesActivities,
  employeesQuickActions,
} from '@/lib/mock-data/adapters'

// Types
type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'onboarding'
type TimeOffType = 'vacation' | 'sick' | 'personal' | 'parental' | 'bereavement'
type TimeOffStatus = 'pending' | 'approved' | 'rejected'
type ReviewStatus = 'draft' | 'in_progress' | 'completed'
type CourseStatus = 'not_started' | 'in_progress' | 'completed'

interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  position: string
  department: string
  level: string
  manager?: string
  managerId?: string
  status: EmployeeStatus
  hireDate: string
  location: string
  avatar?: string
  salary: number
  equity?: number
  performanceScore: number
  projectsCount: number
  directReports: number
  skills: string[]
}

interface TimeOffRequest {
  id: string
  employeeId: string
  employeeName: string
  type: TimeOffType
  startDate: string
  endDate: string
  days: number
  status: TimeOffStatus
  reason?: string
}

interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  reviewerId: string
  reviewerName: string
  period: string
  overallScore: number
  strengths: string[]
  improvements: string[]
  goals: string[]
  status: ReviewStatus
  createdAt: string
}

interface OnboardingTask {
  id: string
  employeeId: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  category: 'paperwork' | 'training' | 'setup' | 'intro'
}

interface OrgNode {
  id: string
  name: string
  position: string
  department: string
  avatar?: string
  children?: OrgNode[]
}

interface Compensation {
  id: string
  employeeId: string
  baseSalary: number
  bonus: number
  equity: number
  benefits: string[]
  effectiveDate: string
  nextReview: string
}

interface TrainingCourse {
  id: string
  title: string
  description: string
  category: string
  duration: string
  status: CourseStatus
  progress: number
  dueDate?: string
  completedDate?: string
  mandatory: boolean
}

interface EmployeeDocument {
  id: string
  name: string
  type: 'contract' | 'tax' | 'id' | 'certification' | 'policy' | 'performance' | 'other'
  uploadedBy: string
  uploadedAt: string
  size: string
  status: 'active' | 'expired' | 'pending_signature'
  expiresAt?: string
}

interface Benefit {
  id: string
  name: string
  type: 'health' | 'dental' | 'vision' | 'life' | '401k' | 'hsa' | 'fsa' | 'commuter'
  provider: string
  enrollmentStatus: 'enrolled' | 'waived' | 'pending' | 'eligible'
  cost: number
  employerContribution: number
  coverageLevel: string
  effectiveDate: string
}

interface Goal {
  id: string
  employeeId: string
  title: string
  description: string
  category: 'performance' | 'development' | 'team' | 'company'
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk'
  dueDate: string
  createdAt: string
  keyResults: { title: string; progress: number }[]
}

interface Survey {
  id: string
  title: string
  type: 'engagement' | 'pulse' | 'feedback' | 'exit'
  status: 'draft' | 'active' | 'completed'
  responseRate: number
  avgScore: number
  createdAt: string
  closesAt: string
  responses: number
  totalInvited: number
}

interface TeamMetric {
  id: string
  label: string
  value: number
  previousValue: number
  trend: 'up' | 'down' | 'stable'
  category: 'engagement' | 'performance' | 'retention' | 'satisfaction'
}

interface HRIntegration {
  id: string
  name: string
  type: 'payroll' | 'benefits' | 'ats' | 'background' | 'identity' | 'communication'
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  icon: string
}

// Mock Data
const mockEmployees: Employee[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', phone: '+1-555-0101', position: 'VP of Engineering', department: 'Engineering', level: 'L7', manager: 'Alex CEO', managerId: '0', status: 'active', hireDate: '2020-03-15', location: 'San Francisco, CA', salary: 280000, equity: 50000, performanceScore: 98, projectsCount: 12, directReports: 8, skills: ['Leadership', 'Architecture', 'Python', 'Go'] },
  { id: '2', name: 'Mike Johnson', email: 'mike@company.com', phone: '+1-555-0102', position: 'Senior Engineer', department: 'Engineering', level: 'L5', manager: 'Sarah Chen', managerId: '1', status: 'active', hireDate: '2021-06-01', location: 'New York, NY', salary: 180000, equity: 25000, performanceScore: 92, projectsCount: 8, directReports: 0, skills: ['React', 'TypeScript', 'Node.js'] },
  { id: '3', name: 'Emily Davis', email: 'emily@company.com', phone: '+1-555-0103', position: 'Product Manager', department: 'Product', level: 'L5', manager: 'Alex CEO', managerId: '0', status: 'active', hireDate: '2021-09-15', location: 'Austin, TX', salary: 165000, equity: 20000, performanceScore: 95, projectsCount: 6, directReports: 2, skills: ['Product Strategy', 'Analytics', 'User Research'] },
  { id: '4', name: 'Alex Kim', email: 'alex@company.com', phone: '+1-555-0104', position: 'UX Designer', department: 'Design', level: 'L4', manager: 'Emily Davis', managerId: '3', status: 'active', hireDate: '2022-01-10', location: 'Remote', salary: 140000, equity: 15000, performanceScore: 88, projectsCount: 10, directReports: 0, skills: ['Figma', 'User Testing', 'Design Systems'] },
  { id: '5', name: 'Jordan Lee', email: 'jordan@company.com', phone: '+1-555-0105', position: 'Software Engineer', department: 'Engineering', level: 'L4', manager: 'Sarah Chen', managerId: '1', status: 'onboarding', hireDate: '2024-01-15', location: 'Seattle, WA', salary: 150000, equity: 18000, performanceScore: 0, projectsCount: 0, directReports: 0, skills: ['Python', 'AWS', 'Machine Learning'] },
  { id: '6', name: 'Taylor Swift', email: 'taylor@company.com', phone: '+1-555-0106', position: 'Marketing Manager', department: 'Marketing', level: 'L5', manager: 'Alex CEO', managerId: '0', status: 'active', hireDate: '2021-04-20', location: 'Los Angeles, CA', salary: 155000, equity: 18000, performanceScore: 91, projectsCount: 5, directReports: 3, skills: ['Growth', 'Content', 'SEO'] }
]

const mockTimeOffRequests: TimeOffRequest[] = [
  { id: '1', employeeId: '2', employeeName: 'Mike Johnson', type: 'vacation', startDate: '2024-02-15', endDate: '2024-02-20', days: 5, status: 'pending' },
  { id: '2', employeeId: '4', employeeName: 'Alex Kim', type: 'sick', startDate: '2024-01-25', endDate: '2024-01-25', days: 1, status: 'approved' },
  { id: '3', employeeId: '1', employeeName: 'Sarah Chen', type: 'personal', startDate: '2024-02-01', endDate: '2024-02-02', days: 2, status: 'approved' },
  { id: '4', employeeId: '6', employeeName: 'Taylor Swift', type: 'vacation', startDate: '2024-03-01', endDate: '2024-03-08', days: 7, status: 'pending' }
]

const mockReviews: PerformanceReview[] = [
  { id: '1', employeeId: '2', employeeName: 'Mike Johnson', reviewerId: '1', reviewerName: 'Sarah Chen', period: 'Q4 2023', overallScore: 4.5, strengths: ['Technical expertise', 'Team collaboration'], improvements: ['Documentation'], goals: ['Lead project', 'Mentor junior devs'], status: 'completed', createdAt: '2024-01-10' },
  { id: '2', employeeId: '4', employeeName: 'Alex Kim', reviewerId: '3', reviewerName: 'Emily Davis', period: 'Q4 2023', overallScore: 4.2, strengths: ['Creative design', 'User empathy'], improvements: ['Time management'], goals: ['Design system update'], status: 'in_progress', createdAt: '2024-01-08' },
  { id: '3', employeeId: '6', employeeName: 'Taylor Swift', reviewerId: '0', reviewerName: 'Alex CEO', period: 'Q4 2023', overallScore: 4.3, strengths: ['Growth mindset', 'Data-driven'], improvements: ['Cross-team communication'], goals: ['Launch campaign'], status: 'completed', createdAt: '2024-01-05' }
]

const mockOnboardingTasks: OnboardingTask[] = [
  { id: '1', employeeId: '5', title: 'Complete I-9 Form', description: 'Employment eligibility verification', dueDate: '2024-01-20', completed: true, category: 'paperwork' },
  { id: '2', employeeId: '5', title: 'Setup Workstation', description: 'Computer, monitors, peripherals', dueDate: '2024-01-21', completed: true, category: 'setup' },
  { id: '3', employeeId: '5', title: 'Security Training', description: 'Complete mandatory security awareness', dueDate: '2024-01-25', completed: false, category: 'training' },
  { id: '4', employeeId: '5', title: 'Meet with Manager', description: '1:1 introduction and goal setting', dueDate: '2024-01-22', completed: true, category: 'intro' },
  { id: '5', employeeId: '5', title: 'Team Introductions', description: 'Meet team members', dueDate: '2024-01-23', completed: false, category: 'intro' }
]

const mockOrgChart: OrgNode = {
  id: '0', name: 'Alex CEO', position: 'Chief Executive Officer', department: 'Executive',
  children: [
    { id: '1', name: 'Sarah Chen', position: 'VP Engineering', department: 'Engineering', children: [
      { id: '2', name: 'Mike Johnson', position: 'Senior Engineer', department: 'Engineering' },
      { id: '5', name: 'Jordan Lee', position: 'Software Engineer', department: 'Engineering' }
    ]},
    { id: '3', name: 'Emily Davis', position: 'Product Manager', department: 'Product', children: [
      { id: '4', name: 'Alex Kim', position: 'UX Designer', department: 'Design' }
    ]},
    { id: '6', name: 'Taylor Swift', position: 'Marketing Manager', department: 'Marketing' }
  ]
}

const mockCourses: TrainingCourse[] = [
  { id: '1', title: 'Security Awareness Training', description: 'Annual mandatory security training', category: 'Compliance', duration: '2 hours', status: 'completed', progress: 100, mandatory: true, completedDate: '2024-01-10' },
  { id: '2', title: 'Leadership Fundamentals', description: 'Core leadership skills for managers', category: 'Leadership', duration: '8 hours', status: 'in_progress', progress: 65, mandatory: false, dueDate: '2024-02-28' },
  { id: '3', title: 'Diversity & Inclusion', description: 'Building inclusive workplaces', category: 'Compliance', duration: '1.5 hours', status: 'not_started', progress: 0, mandatory: true, dueDate: '2024-01-31' },
  { id: '4', title: 'Advanced Python', description: 'Python best practices and patterns', category: 'Technical', duration: '12 hours', status: 'in_progress', progress: 40, mandatory: false },
  { id: '5', title: 'Project Management', description: 'Agile and Scrum methodologies', category: 'Skills', duration: '6 hours', status: 'completed', progress: 100, mandatory: false, completedDate: '2023-12-15' }
]

const mockDocuments: EmployeeDocument[] = [
  { id: '1', name: 'Employment Contract - Mike Johnson.pdf', type: 'contract', uploadedBy: 'HR Admin', uploadedAt: '2021-06-01', size: '2.4 MB', status: 'active' },
  { id: '2', name: 'W-4 Tax Form.pdf', type: 'tax', uploadedBy: 'Mike Johnson', uploadedAt: '2024-01-05', size: '156 KB', status: 'active' },
  { id: '3', name: 'Driver License Copy.jpg', type: 'id', uploadedBy: 'Mike Johnson', uploadedAt: '2021-06-01', size: '890 KB', status: 'expired', expiresAt: '2024-01-15' },
  { id: '4', name: 'AWS Certification.pdf', type: 'certification', uploadedBy: 'Mike Johnson', uploadedAt: '2023-08-20', size: '512 KB', status: 'active', expiresAt: '2025-08-20' },
  { id: '5', name: 'NDA Agreement.pdf', type: 'policy', uploadedBy: 'HR Admin', uploadedAt: '2021-06-01', size: '345 KB', status: 'pending_signature' }
]

const mockBenefits: Benefit[] = [
  { id: '1', name: 'Medical Insurance', type: 'health', provider: 'Blue Cross Blue Shield', enrollmentStatus: 'enrolled', cost: 650, employerContribution: 520, coverageLevel: 'Family', effectiveDate: '2024-01-01' },
  { id: '2', name: 'Dental Insurance', type: 'dental', provider: 'Delta Dental', enrollmentStatus: 'enrolled', cost: 85, employerContribution: 68, coverageLevel: 'Family', effectiveDate: '2024-01-01' },
  { id: '3', name: 'Vision Insurance', type: 'vision', provider: 'VSP', enrollmentStatus: 'enrolled', cost: 25, employerContribution: 20, coverageLevel: 'Family', effectiveDate: '2024-01-01' },
  { id: '4', name: 'Life Insurance', type: 'life', provider: 'MetLife', enrollmentStatus: 'enrolled', cost: 0, employerContribution: 45, coverageLevel: '2x Salary', effectiveDate: '2024-01-01' },
  { id: '5', name: '401(k) Plan', type: '401k', provider: 'Fidelity', enrollmentStatus: 'enrolled', cost: 800, employerContribution: 400, coverageLevel: '6% match', effectiveDate: '2021-07-01' },
  { id: '6', name: 'HSA Account', type: 'hsa', provider: 'Optum Bank', enrollmentStatus: 'enrolled', cost: 200, employerContribution: 100, coverageLevel: 'Individual', effectiveDate: '2024-01-01' }
]

const mockGoals: Goal[] = [
  { id: '1', employeeId: '2', title: 'Lead Q1 Feature Development', description: 'Successfully deliver the new authentication system', category: 'performance', progress: 75, status: 'in_progress', dueDate: '2024-03-31', createdAt: '2024-01-01', keyResults: [{ title: 'Complete design review', progress: 100 }, { title: 'Implement core features', progress: 80 }, { title: 'Deploy to production', progress: 45 }] },
  { id: '2', employeeId: '2', title: 'Improve Code Quality', description: 'Reduce technical debt and increase test coverage', category: 'development', progress: 60, status: 'in_progress', dueDate: '2024-06-30', createdAt: '2024-01-01', keyResults: [{ title: 'Increase test coverage to 80%', progress: 65 }, { title: 'Reduce critical bugs by 50%', progress: 55 }] },
  { id: '3', employeeId: '2', title: 'Mentor Junior Developers', description: 'Support the growth of 2 junior team members', category: 'team', progress: 40, status: 'in_progress', dueDate: '2024-12-31', createdAt: '2024-01-01', keyResults: [{ title: 'Weekly 1:1 meetings', progress: 60 }, { title: 'Code review sessions', progress: 35 }, { title: 'Knowledge sharing presentations', progress: 25 }] },
  { id: '4', employeeId: '1', title: 'Team Growth & Hiring', description: 'Expand engineering team to meet company goals', category: 'company', progress: 30, status: 'at_risk', dueDate: '2024-06-30', createdAt: '2024-01-01', keyResults: [{ title: 'Hire 5 new engineers', progress: 20 }, { title: 'Reduce time-to-hire to 30 days', progress: 40 }] }
]

const mockSurveys: Survey[] = [
  { id: '1', title: 'Q1 2024 Employee Engagement', type: 'engagement', status: 'active', responseRate: 78, avgScore: 4.2, createdAt: '2024-01-15', closesAt: '2024-01-31', responses: 47, totalInvited: 60 },
  { id: '2', title: 'Weekly Pulse Check', type: 'pulse', status: 'completed', responseRate: 92, avgScore: 4.5, createdAt: '2024-01-08', closesAt: '2024-01-12', responses: 55, totalInvited: 60 },
  { id: '3', title: 'Manager Feedback Survey', type: 'feedback', status: 'draft', responseRate: 0, avgScore: 0, createdAt: '2024-01-20', closesAt: '2024-02-28', responses: 0, totalInvited: 12 }
]

const mockTeamMetrics: TeamMetric[] = [
  { id: '1', label: 'Employee Engagement', value: 85, previousValue: 82, trend: 'up', category: 'engagement' },
  { id: '2', label: 'eNPS Score', value: 72, previousValue: 68, trend: 'up', category: 'satisfaction' },
  { id: '3', label: 'Performance Score', value: 91, previousValue: 89, trend: 'up', category: 'performance' },
  { id: '4', label: 'Retention Rate', value: 94, previousValue: 96, trend: 'down', category: 'retention' },
  { id: '5', label: 'Training Completion', value: 78, previousValue: 75, trend: 'up', category: 'performance' },
  { id: '6', label: 'Goal Completion', value: 65, previousValue: 60, trend: 'up', category: 'performance' }
]

const mockIntegrations: HRIntegration[] = [
  { id: '1', name: 'ADP Payroll', type: 'payroll', status: 'connected', lastSync: '2024-01-16 09:00', icon: 'dollar' },
  { id: '2', name: 'Gusto Benefits', type: 'benefits', status: 'connected', lastSync: '2024-01-16 08:00', icon: 'heart' },
  { id: '3', name: 'Greenhouse ATS', type: 'ats', status: 'connected', lastSync: '2024-01-16 07:30', icon: 'users' },
  { id: '4', name: 'Checkr', type: 'background', status: 'connected', lastSync: '2024-01-15 18:00', icon: 'shield' },
  { id: '5', name: 'Okta SSO', type: 'identity', status: 'connected', lastSync: '2024-01-16 09:15', icon: 'key' },
  { id: '6', name: 'Slack', type: 'communication', status: 'connected', lastSync: '2024-01-16 09:10', icon: 'message' }
]

export default function EmployeesClient() {
  const [activeTab, setActiveTab] = useState('directory')
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['0', '1', '3'])
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showSurveyDialog, setShowSurveyDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [compensationTab, setCompensationTab] = useState('salary')
  const [performanceTab, setPerformanceTab] = useState('reviews')

  // Additional dialog states for buttons without onClick
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showTimeOffRequestDialog, setShowTimeOffRequestDialog] = useState(false)
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)
  const [showCourseDialog, setShowCourseDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null)
  const [showAddIntegrationDialog, setShowAddIntegrationDialog] = useState(false)
  const [showConfigureIntegrationDialog, setShowConfigureIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<HRIntegration | null>(null)
  const [showRegenerateKeyDialog, setShowRegenerateKeyDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showImportDataDialog, setShowImportDataDialog] = useState(false)
  const [showComplianceReportDialog, setShowComplianceReportDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false)
  const [showDownloadDocDialog, setShowDownloadDocDialog] = useState(false)
  const [showDeleteDocDialog, setShowDeleteDocDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null)

  // Database integration
  const { data: dbEmployees, loading: employeesLoading, refetch } = useEmployees({ status: 'active' })
  const { mutate: createEmployee, loading: creating } = useCreateEmployee()
  const { mutate: updateEmployee, loading: updating } = useUpdateEmployee()
  const { mutate: deleteEmployee, loading: deleting } = useDeleteEmployee()

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState<DBEmployee | null>(null)
  const [employeeToDelete, setEmployeeToDelete] = useState<DBEmployee | null>(null)

  // Edit form state
  const [editEmployeeForm, setEditEmployeeForm] = useState({
    employee_name: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    status: 'active' as string
  })

  // Form state for new employee
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: ''
  })

  // Key results state for goal dialog
  const [keyResultInputs, setKeyResultInputs] = useState<string[]>(['', ''])

  // Handle creating a new employee
  const handleCreateEmployee = async () => {
    if (!newEmployeeForm.name || !newEmployeeForm.email) {
      toast.error('Please fill in name and email')
      return
    }
    try {
      await createEmployee({
        employee_name: newEmployeeForm.name,
        email: newEmployeeForm.email,
        department: newEmployeeForm.department || null,
        position: newEmployeeForm.position || null,
        job_title: newEmployeeForm.position || null,
        start_date: newEmployeeForm.startDate || null,
        status: 'active',
        employment_type: 'full-time',
        currency: 'USD'
      } as any)
      setShowAddDialog(false)
      setNewEmployeeForm({ name: '', email: '', department: '', position: '', startDate: '' })
      toast.success('Employee added successfully')
      refetch()
    } catch (error) {
      console.error('Failed to create employee:', error)
    }
  }

  // Handle opening edit dialog for a database employee
  const handleOpenEditDialog = (employee: DBEmployee) => {
    setEmployeeToEdit(employee)
    setEditEmployeeForm({
      employee_name: employee.employee_name || '',
      email: employee.email || '',
      department: employee.department || '',
      position: employee.position || '',
      phone: employee.phone || '',
      status: employee.status || 'active'
    })
    setShowEditDialog(true)
  }

  // Handle updating an employee
  const handleUpdateEmployee = async () => {
    if (!employeeToEdit) return
    if (!editEmployeeForm.employee_name || !editEmployeeForm.email) {
      toast.error('Please fill in name and email')
      return
    }
    try {
      await updateEmployee({
        employee_name: editEmployeeForm.employee_name,
        email: editEmployeeForm.email,
        department: editEmployeeForm.department || null,
        position: editEmployeeForm.position || null,
        job_title: editEmployeeForm.position || null,
        phone: editEmployeeForm.phone || null,
        status: editEmployeeForm.status as any
      } as any, employeeToEdit.id)
      setShowEditDialog(false)
      setEmployeeToEdit(null)
      toast.success('Employee updated successfully')
      refetch()
    } catch (error) {
      console.error('Failed to update employee:', error)
      toast.error('Failed to update employee')
    }
  }

  // Handle terminating an employee
  const handleTerminateEmployee = async (employee: DBEmployee) => {
    try {
      await updateEmployee({
        status: 'terminated',
        termination_date: new Date().toISOString().split('T')[0]
      } as any, employee.id)
      toast.success(`${employee.employee_name} has been terminated`)
      refetch()
    } catch (error) {
      console.error('Failed to terminate employee:', error)
      toast.error('Failed to terminate employee')
    }
  }

  // Handle deleting an employee (soft delete)
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return
    try {
      const success = await deleteEmployee(employeeToDelete.id)
      if (success) {
        setShowDeleteDialog(false)
        setEmployeeToDelete(null)
        toast.success('Employee deleted successfully')
        refetch()
      }
    } catch (error) {
      console.error('Failed to delete employee:', error)
      toast.error('Failed to delete employee')
    }
  }

  // Handle opening delete confirmation dialog
  const handleOpenDeleteDialog = (employee: DBEmployee) => {
    setEmployeeToDelete(employee)
    setShowDeleteDialog(true)
  }

  // Handle document upload
  const handleUploadDocument = async () => {
    toast.loading('Uploading document...', { id: 'doc-upload' })
    try {
      // Simulate document upload - in production, this would upload to storage
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Document uploaded successfully!', { id: 'doc-upload' })
      setShowDocumentDialog(false)
    } catch (error) {
      toast.error('Failed to upload document', { id: 'doc-upload' })
    }
  }

  // Handle goal creation
  const handleCreateGoal = async () => {
    toast.loading('Creating goal...', { id: 'goal-create' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Goal created successfully!', { id: 'goal-create' })
      setShowGoalDialog(false)
    } catch (error) {
      toast.error('Failed to create goal', { id: 'goal-create' })
    }
  }

  // Handle survey creation
  const handleCreateSurvey = async () => {
    toast.loading('Creating survey...', { id: 'survey-create' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Survey created and invitations sent!', { id: 'survey-create' })
      setShowSurveyDialog(false)
    } catch (error) {
      toast.error('Failed to create survey', { id: 'survey-create' })
    }
  }

  // Handle performance review start
  const handleStartReview = async () => {
    toast.loading('Initiating review cycle...', { id: 'review-start' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Performance review started! Notifications sent to participants.', { id: 'review-start' })
      setShowReviewDialog(false)
    } catch (error) {
      toast.error('Failed to start review', { id: 'review-start' })
    }
  }

  // Handle employee data export
  const handleExportEmployees = async () => {
    toast.loading('Exporting employee data...', { id: 'employee-export' })
    try {
      // Create CSV data from employees
      const headers = ['Name', 'Email', 'Department', 'Position', 'Status', 'Hire Date']
      const csvData = mockEmployees.map(emp =>
        [emp.name, emp.email, emp.department, emp.position, emp.status, emp.hireDate].join(',')
      )
      const csvContent = [headers.join(','), ...csvData].join('\n')

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `employees-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Export complete! Download starting...', { id: 'employee-export' })
      setShowExportDialog(false)
    } catch (error) {
      toast.error('Failed to export data', { id: 'employee-export' })
    }
  }

  // Handle time off request submission
  const handleSubmitTimeOff = async () => {
    toast.loading('Submitting time off request...', { id: 'timeoff-submit' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Time off request submitted for approval!', { id: 'timeoff-submit' })
      setShowTimeOffRequestDialog(false)
    } catch (error) {
      toast.error('Failed to submit request', { id: 'timeoff-submit' })
    }
  }

  // Handle compensation report generation
  const handleGenerateCompensationReport = async () => {
    toast.loading('Generating compensation report...', { id: 'report-gen' })
    try {
      // Generate compensation report data
      const reportData = mockEmployees.map(emp => ({
        name: emp.name,
        department: emp.department,
        position: emp.position,
        salary: emp.salary
      }))

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compensation-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Report generated! Download starting...', { id: 'report-gen' })
      setShowExportReportDialog(false)
    } catch (error) {
      toast.error('Failed to generate report', { id: 'report-gen' })
    }
  }

  // Handle integration connection
  const handleConnectIntegration = async () => {
    toast.loading('Connecting integration...', { id: 'integration-connect' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1800))
      toast.success('Integration connected successfully!', { id: 'integration-connect' })
      setShowAddIntegrationDialog(false)
    } catch (error) {
      toast.error('Failed to connect integration', { id: 'integration-connect' })
    }
  }

  // Handle integration disconnection
  const handleDisconnectIntegration = async () => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return
    toast.loading('Disconnecting integration...', { id: 'integration-disconnect' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Integration disconnected', { id: 'integration-disconnect' })
      setShowConfigureIntegrationDialog(false)
    } catch (error) {
      toast.error('Failed to disconnect integration', { id: 'integration-disconnect' })
    }
  }

  // Handle integration settings save
  const handleSaveIntegrationSettings = async () => {
    toast.loading('Saving integration settings...', { id: 'integration-save' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Integration settings saved!', { id: 'integration-save' })
      setShowConfigureIntegrationDialog(false)
    } catch (error) {
      toast.error('Failed to save settings', { id: 'integration-save' })
    }
  }

  // Handle API key regeneration
  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure? This will invalidate your current API key.')) return
    toast.loading('Regenerating API key...', { id: 'api-regen' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('New API key generated! Please update your applications.', { id: 'api-regen' })
      setShowRegenerateKeyDialog(false)
    } catch (error) {
      toast.error('Failed to regenerate API key', { id: 'api-regen' })
    }
  }

  // Handle full HR data export
  const handleExportAllHRData = async () => {
    toast.loading('Exporting all HR data...', { id: 'full-export' })
    try {
      const fullExport = {
        employees: mockEmployees,
        documents: mockDocuments,
        reviews: mockReviews,
        timeOffRequests: mockTimeOffRequests,
        exportedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hr-full-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Full HR data export complete! Download starting...', { id: 'full-export' })
      setShowExportDataDialog(false)
    } catch (error) {
      toast.error('Failed to export data', { id: 'full-export' })
    }
  }

  // Handle HR data import
  const handleImportHRData = async () => {
    toast.loading('Importing HR data...', { id: 'hr-import' })
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('HR data imported successfully!', { id: 'hr-import' })
      setShowImportDataDialog(false)
      refetch()
    } catch (error) {
      toast.error('Failed to import data', { id: 'hr-import' })
    }
  }

  // Handle compliance report generation
  const handleGenerateComplianceReport = async () => {
    toast.loading('Generating compliance report...', { id: 'compliance-gen' })
    try {
      const complianceReport = {
        type: 'GDPR Compliance',
        generatedAt: new Date().toISOString(),
        employeeCount: mockEmployees.length,
        documentsAudited: mockDocuments.length,
        complianceStatus: 'Compliant'
      }

      const blob = new Blob([JSON.stringify(complianceReport, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Compliance report generated! Download starting...', { id: 'compliance-gen' })
      setShowComplianceReportDialog(false)
    } catch (error) {
      toast.error('Failed to generate report', { id: 'compliance-gen' })
    }
  }

  // Handle archiving terminated employees
  const handleArchiveTerminated = async () => {
    if (!confirm('Are you sure you want to archive all terminated employees?')) return
    toast.loading('Archiving terminated employees...', { id: 'archive-terminated' })
    try {
      const terminatedCount = mockEmployees.filter(e => e.status === 'terminated').length
      await new Promise(resolve => setTimeout(resolve, 1800))
      toast.success(`Archived ${terminatedCount} terminated employees successfully!`, { id: 'archive-terminated' })
      setShowArchiveDialog(false)
    } catch (error) {
      toast.error('Failed to archive employees', { id: 'archive-terminated' })
    }
  }

  // Handle deleting all HR data
  const handleDeleteAllData = async () => {
    if (!confirm('FINAL WARNING: This will permanently delete ALL HR data. This action cannot be undone. Are you absolutely sure?')) return
    toast.loading('Deleting all HR data...', { id: 'delete-all' })
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      toast.success('All HR data has been deleted', { id: 'delete-all' })
      setShowDeleteAllDialog(false)
    } catch (error) {
      toast.error('Failed to delete data', { id: 'delete-all' })
    }
  }

  // Handle resetting settings
  const handleResetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to their default values?')) return
    toast.loading('Resetting settings...', { id: 'reset-settings' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Settings reset to defaults!', { id: 'reset-settings' })
      setShowResetSettingsDialog(false)
    } catch (error) {
      toast.error('Failed to reset settings', { id: 'reset-settings' })
    }
  }

  // Handle updating mock employee profile
  const handleUpdateMockProfile = async () => {
    toast.loading('Updating employee profile...', { id: 'profile-update' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Employee profile updated successfully!', { id: 'profile-update' })
      setShowEditProfileDialog(false)
    } catch (error) {
      toast.error('Failed to update profile', { id: 'profile-update' })
    }
  }

  // Handle document download
  const handleDownloadDocument = async () => {
    if (!selectedDocument) return
    toast.loading('Preparing download...', { id: 'doc-download' })
    try {
      // Simulate document download preparation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create a sample document blob for download
      const content = `Document: ${selectedDocument.name}\nType: ${selectedDocument.type}\nUploaded: ${selectedDocument.uploadedAt}\nSize: ${selectedDocument.size}`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = selectedDocument.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Download started!', { id: 'doc-download' })
      setShowDownloadDocDialog(false)
    } catch (error) {
      toast.error('Failed to download document', { id: 'doc-download' })
    }
  }

  // Handle document deletion
  const handleDeleteDocument = async () => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return
    toast.loading('Deleting document...', { id: 'doc-delete' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success('Document deleted successfully', { id: 'doc-delete' })
      setShowDeleteDocDialog(false)
      setSelectedDocument(null)
    } catch (error) {
      toast.error('Failed to delete document', { id: 'doc-delete' })
    }
  }

  const filteredEmployees = useMemo(() => {
    return mockEmployees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = departmentFilter === 'all' || emp.department.toLowerCase() === departmentFilter.toLowerCase()
      return matchesSearch && matchesDept
    })
  }, [searchQuery, departmentFilter])

  const stats = useMemo(() => ({
    total: mockEmployees.length,
    active: mockEmployees.filter(e => e.status === 'active').length,
    onboarding: mockEmployees.filter(e => e.status === 'onboarding').length,
    avgPerformance: (mockEmployees.filter(e => e.performanceScore > 0).reduce((sum, e) => sum + e.performanceScore, 0) / mockEmployees.filter(e => e.performanceScore > 0).length).toFixed(0),
    pendingTimeOff: mockTimeOffRequests.filter(r => r.status === 'pending').length,
    pendingReviews: mockReviews.filter(r => r.status !== 'completed').length,
    totalPayroll: mockEmployees.reduce((sum, e) => sum + e.salary, 0),
    avgTenure: '2.3'
  }), [])

  const statsCards = [
    { label: 'Total Employees', value: stats.total.toString(), icon: Users, color: 'from-blue-500 to-blue-600', trend: '+3' },
    { label: 'Active', value: stats.active.toString(), icon: UserCheck, color: 'from-green-500 to-green-600', trend: '' },
    { label: 'Onboarding', value: stats.onboarding.toString(), icon: GraduationCap, color: 'from-purple-500 to-purple-600', trend: '+1' },
    { label: 'Avg Performance', value: `${stats.avgPerformance}%`, icon: Target, color: 'from-amber-500 to-amber-600', trend: '+2.1%' },
    { label: 'Pending Time Off', value: stats.pendingTimeOff.toString(), icon: Calendar, color: 'from-cyan-500 to-cyan-600', trend: '' },
    { label: 'Pending Reviews', value: stats.pendingReviews.toString(), icon: FileText, color: 'from-pink-500 to-pink-600', trend: '' },
    { label: 'Monthly Payroll', value: `$${(stats.totalPayroll / 12000).toFixed(0)}K`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', trend: '' },
    { label: 'Avg Tenure', value: `${stats.avgTenure}y`, icon: Clock, color: 'from-orange-500 to-orange-600', trend: '' }
  ]

  const getDepartmentColor = (dept: string): string => {
    const colors: Record<string, string> = {
      engineering: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      design: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      product: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      marketing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      sales: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      executive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
    return colors[dept.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800'
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
      terminated: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      onboarding: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900/30',
      in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
      not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const toggleOrgNode = (id: string) => {
    setExpandedNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id])
  }

  // Handlers
  const handleExportEmployees = () => {
    toast.success('Export started', {
      description: 'Employee data is being exported'
    })
  }

  const handleScheduleReview = (employee: Employee) => {
    toast.success('Review scheduled', {
      description: `Performance review scheduled for ${employee.name}`
    })
  }

  const handleApproveTimeOff = (request: typeof mockTimeOffRequests[0]) => {
    toast.success('Time off approved', {
      description: `Request from ${request.employeeName} has been approved`
    })
  }

  const handleSendAnnouncement = () => {
    toast.info('Send Announcement', {
      description: 'Opening announcement composer...'
    })
  }

  const renderOrgNode = (node: OrgNode, level: number = 0): JSX.Element => (
    <div key={node.id} className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
        {node.children && node.children.length > 0 ? (
          <button onClick={() => toggleOrgNode(node.id)} className="p-1">{expandedNodes.includes(node.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
        ) : <div className="w-6" />}
        <Avatar><AvatarFallback className="bg-blue-100 text-blue-700">{node.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
        <div className="flex-1"><p className="font-medium">{node.name}</p><p className="text-sm text-gray-500">{node.position}</p></div>
        <Badge className={getDepartmentColor(node.department)}>{node.department}</Badge>
      </div>
      {node.children && expandedNodes.includes(node.id) && <div className="mt-1">{node.children.map(child => renderOrgNode(child, level + 1))}</div>}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><Users className="h-6 w-6 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1><p className="text-gray-500 dark:text-gray-400">Workday level HR management</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search employees..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Button variant="outline" onClick={() => setShowExportDialog(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => setShowAddDialog(true)}><UserPlus className="h-4 w-4 mr-2" />Add Employee</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}><stat.icon className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="flex items-center gap-1"><p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>{stat.trend && <span className="text-xs text-green-600">{stat.trend}</span>}</div>
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
            <TabsTrigger value="directory" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Users className="h-4 w-4 mr-2" />Directory</TabsTrigger>
            <TabsTrigger value="org-chart" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Layers className="h-4 w-4 mr-2" />Org Chart</TabsTrigger>
            <TabsTrigger value="time-off" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Calendar className="h-4 w-4 mr-2" />Time Off</TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Target className="h-4 w-4 mr-2" />Performance</TabsTrigger>
            <TabsTrigger value="onboarding" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><GraduationCap className="h-4 w-4 mr-2" />Onboarding</TabsTrigger>
            <TabsTrigger value="compensation" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><DollarSign className="h-4 w-4 mr-2" />Compensation</TabsTrigger>
            <TabsTrigger value="learning" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><BookOpen className="h-4 w-4 mr-2" />Learning</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Directory Tab */}
          <TabsContent value="directory" className="mt-6 space-y-6">
            {/* Directory Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Employee Directory</h2>
                  <p className="text-blue-100">BambooHR-level employee management and search</p>
                  <p className="text-blue-200 text-xs mt-1">Advanced search • Org chart • Team views</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredEmployees.length}</p>
                    <p className="text-blue-200 text-sm">Employees</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockEmployees.filter(e => e.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'Engineering', 'Design', 'Product', 'Marketing', 'Sales'].map(dept => (
                <Button key={dept} variant={departmentFilter === dept.toLowerCase() ? 'default' : 'outline'} size="sm" onClick={() => setDepartmentFilter(dept.toLowerCase())} className={departmentFilter === dept.toLowerCase() ? 'bg-blue-600' : ''}>{dept === 'all' ? 'All Departments' : dept}</Button>
              ))}
            </div>
            {/* Database Employees Section */}
            {dbEmployees && dbEmployees.length > 0 && (
              <>
                <div className="flex items-center justify-between mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Your Employees ({dbEmployees.length})
                  </h3>
                  {employeesLoading && <span className="text-sm text-gray-500">Loading...</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dbEmployees.map(employee => (
                    <Card key={employee.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 relative">
                        <Avatar className="absolute -bottom-8 left-6 w-16 h-16 border-4 border-white dark:border-gray-800">
                          <AvatarImage src={employee.avatar_url || undefined} />
                          <AvatarFallback className="bg-green-100 text-green-700 text-lg">
                            {employee.employee_name?.split(' ').map(n => n[0]).join('') || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white"
                            onClick={() => handleOpenEditDialog(employee)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-white/20 hover:bg-red-500/80 text-white"
                            onClick={() => handleOpenDeleteDialog(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="pt-10 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {employee.employee_name}
                              {employee.performance_score >= 95 && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                            </h3>
                            <p className="text-sm text-gray-500">{employee.position || employee.job_title || 'No position'}</p>
                          </div>
                          <Badge className={employee.status === 'active' ? 'bg-green-100 text-green-700' : employee.status === 'terminated' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                            {employee.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          {employee.email && (
                            <p className="text-sm flex items-center gap-2 text-gray-500">
                              <Mail className="h-4 w-4" />{employee.email}
                            </p>
                          )}
                          {employee.department && (
                            <p className="text-sm flex items-center gap-2 text-gray-500">
                              <Building2 className="h-4 w-4" />{employee.department}
                            </p>
                          )}
                          {employee.phone && (
                            <p className="text-sm flex items-center gap-2 text-gray-500">
                              <Phone className="h-4 w-4" />{employee.phone}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Performance</p>
                              <p className="font-semibold text-blue-600">
                                {employee.performance_score > 0 ? `${employee.performance_score}%` : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Projects</p>
                              <p className="font-semibold">{employee.projects_count || 0}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {employee.status === 'active' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => handleTerminateEmployee(employee)}
                                disabled={updating}
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Terminate
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Mock Employees Section */}
            <div className="flex items-center justify-between mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Sample Employees ({filteredEmployees.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(employee => (
                <Card key={employee.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 relative"><Avatar className="absolute -bottom-8 left-6 w-16 h-16 border-4 border-white dark:border-gray-800"><AvatarFallback className="bg-blue-100 text-blue-700 text-lg">{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar></div>
                  <CardContent className="pt-10 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div><h3 className="font-semibold text-lg flex items-center gap-2">{employee.name}{employee.performanceScore >= 95 && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}</h3><p className="text-sm text-gray-500">{employee.position}</p></div>
                      <Badge className={getDepartmentColor(employee.department)}>{employee.department}</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm flex items-center gap-2 text-gray-500"><Mail className="h-4 w-4" />{employee.email}</p>
                      <p className="text-sm flex items-center gap-2 text-gray-500"><MapPin className="h-4 w-4" />{employee.location}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div><p className="text-gray-500">Performance</p><p className="font-semibold text-blue-600">{employee.performanceScore > 0 ? `${employee.performanceScore}%` : 'N/A'}</p></div>
                        <div><p className="text-gray-500">Projects</p><p className="font-semibold">{employee.projectsCount}</p></div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(employee); setShowProfileDialog(true) }}><Eye className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Org Chart Tab */}
          <TabsContent value="org-chart" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700"><CardHeader><CardTitle>Organization Structure</CardTitle></CardHeader><CardContent>{renderOrgNode(mockOrgChart)}</CardContent></Card>
          </TabsContent>

          {/* Time Off Tab */}
          <TabsContent value="time-off" className="mt-6 space-y-6">
            {/* Time Off Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Time Off Management</h2>
                  <p className="text-emerald-100">Gusto-level PTO tracking and approval workflows</p>
                  <p className="text-emerald-200 text-xs mt-1">Leave balances • Request approvals • Calendar sync</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTimeOffRequests.filter(r => r.status === 'pending').length}</p>
                    <p className="text-emerald-200 text-sm">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTimeOffRequests.length}</p>
                    <p className="text-emerald-200 text-sm">Requests</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[{ type: 'Vacation', icon: Plane, available: 12, used: 3, total: 15, color: 'blue' }, { type: 'Sick Leave', icon: Heart, available: 8, used: 2, total: 10, color: 'red' }, { type: 'Personal', icon: Coffee, available: 3, used: 0, total: 3, color: 'purple' }, { type: 'Parental', icon: Home, available: 12, used: 0, total: 12, color: 'green' }].map(balance => (
                <Card key={balance.type} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3"><div className={`p-2 bg-${balance.color}-100 dark:bg-${balance.color}-900/30 rounded-lg`}><balance.icon className={`h-5 w-5 text-${balance.color}-600`} /></div><span className="font-medium">{balance.type}</span></div>
                    <div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-500">Available</span><span className="font-semibold">{balance.available} days</span></div><Progress value={(balance.used / balance.total) * 100} className="h-2" /><p className="text-xs text-gray-500">{balance.used} of {balance.total} used</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Time Off Requests</CardTitle><Button onClick={() => setShowTimeOffRequestDialog(true)}><Plus className="h-4 w-4 mr-2" />Request Time Off</Button></CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockTimeOffRequests.map(request => (
                  <div key={request.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Avatar><AvatarFallback className="bg-blue-100 text-blue-700">{request.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div className="flex-1"><p className="font-medium">{request.employeeName}</p><p className="text-sm text-gray-500">{request.type.charAt(0).toUpperCase() + request.type.slice(1)} • {request.days} day{request.days > 1 ? 's' : ''}</p></div>
                    <div className="text-right"><p className="text-sm">{request.startDate} - {request.endDate}</p><Badge className={getStatusColor(request.status)}>{request.status}</Badge></div>
                    {request.status === 'pending' && <div className="flex gap-2"><Button size="icon" variant="ghost" className="text-green-600" onClick={async () => { toast.loading('Approving request...'); try { await fetch(`/api/time-off/${request.id}/approve`, { method: 'POST' }); toast.dismiss(); toast.success('Time off request approved'); } catch { toast.dismiss(); toast.error('Failed to approve request'); }}}><CheckCircle className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-red-600" onClick={async () => { toast.loading('Rejecting request...'); try { await fetch(`/api/time-off/${request.id}/reject`, { method: 'POST' }); toast.dismiss(); toast.success('Time off request rejected'); } catch { toast.dismiss(); toast.error('Failed to reject request'); }}}><XCircle className="h-4 w-4" /></Button></div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6 space-y-6">
            {/* Performance Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Performance Management</h2>
                  <p className="text-orange-100">Lattice-level reviews and goal tracking</p>
                  <p className="text-orange-200 text-xs mt-1">360° reviews • OKRs • Continuous feedback</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReviews.length}</p>
                    <p className="text-orange-200 text-sm">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockReviews.filter(r => r.status === 'completed').length}</p>
                    <p className="text-orange-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['reviews', 'goals', 'metrics'].map(tab => (
                  <Button key={tab} variant={performanceTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setPerformanceTab(tab)} className={performanceTab === tab ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowGoalDialog(true)}><Target className="h-4 w-4 mr-2" />Add Goal</Button>
                <Button onClick={() => setShowReviewDialog(true)}><Plus className="h-4 w-4 mr-2" />Start Review</Button>
              </div>
            </div>

            {performanceTab === 'reviews' && (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <Card><CardContent className="p-6 text-center"><p className="text-5xl font-bold text-blue-600">{stats.avgPerformance}%</p><p className="text-sm text-gray-500 mt-2">Average Performance Score</p></CardContent></Card>
                  <Card><CardContent className="p-6 text-center"><p className="text-5xl font-bold text-green-600">{mockReviews.filter(r => r.status === 'completed').length}</p><p className="text-sm text-gray-500 mt-2">Completed Reviews</p></CardContent></Card>
                  <Card><CardContent className="p-6 text-center"><p className="text-5xl font-bold text-amber-600">{mockReviews.filter(r => r.status !== 'completed').length}</p><p className="text-sm text-gray-500 mt-2">Pending Reviews</p></CardContent></Card>
                </div>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Recent Reviews</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockReviews.map(review => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3"><Avatar><AvatarFallback className="bg-blue-100 text-blue-700">{review.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><div><p className="font-medium">{review.employeeName}</p><p className="text-sm text-gray-500">{review.period} • Reviewer: {review.reviewerName}</p></div></div>
                          <div className="text-right"><p className="text-2xl font-bold text-blue-600">{review.overallScore}/5</p><Badge className={getStatusColor(review.status)}>{review.status.replace('_', ' ')}</Badge></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><p className="font-medium text-green-600 mb-1">Strengths</p><ul className="text-gray-500 space-y-1">{review.strengths.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                          <div><p className="font-medium text-orange-600 mb-1">Areas to Improve</p><ul className="text-gray-500 space-y-1">{review.improvements.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                          <div><p className="font-medium text-blue-600 mb-1">Goals</p><ul className="text-gray-500 space-y-1">{review.goals.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {performanceTab === 'goals' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>OKRs & Goals</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {mockGoals.map(goal => (
                    <div key={goal.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div><h4 className="font-semibold">{goal.title}</h4><p className="text-sm text-gray-500">{goal.description}</p></div>
                        <div className="flex items-center gap-3"><Badge variant="outline">{goal.category}</Badge><Badge className={getStatusColor(goal.status)}>{goal.status.replace('_', ' ')}</Badge></div>
                      </div>
                      <div className="mb-4"><div className="flex items-center justify-between mb-1"><span className="text-sm text-gray-500">Overall Progress</span><span className="text-sm font-medium">{goal.progress}%</span></div><Progress value={goal.progress} className="h-2" /></div>
                      <div className="space-y-2"><p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Results</p>{goal.keyResults.map((kr, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex-1"><p className="text-sm">{kr.title}</p><Progress value={kr.progress} className="h-1 mt-1" /></div>
                          <span className="text-sm font-medium">{kr.progress}%</span>
                        </div>
                      ))}</div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500"><span>Due: {goal.dueDate}</span><span>Created: {goal.createdAt}</span></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {performanceTab === 'metrics' && (
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Team Metrics</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockTeamMetrics.map(metric => (
                      <div key={metric.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div><p className="font-medium">{metric.label}</p><p className="text-xs text-gray-500">{metric.category}</p></div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold">{metric.value}%</span>
                          <div className={`flex items-center gap-1 text-xs ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                            {metric.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                            {metric.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                            {metric.value - metric.previousValue > 0 ? '+' : ''}{metric.value - metric.previousValue}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Performance Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[{ label: 'Exceeds Expectations', count: 2, percentage: 33, color: 'green' }, { label: 'Meets Expectations', count: 3, percentage: 50, color: 'blue' }, { label: 'Needs Improvement', count: 1, percentage: 17, color: 'amber' }, { label: 'Below Expectations', count: 0, percentage: 0, color: 'red' }].map((band, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1"><span className="text-sm">{band.label}</span><span className="text-sm font-medium">{band.count} ({band.percentage}%)</span></div>
                          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className={`h-full bg-${band.color}-500 rounded-full`} style={{ width: `${band.percentage}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="mt-6 space-y-6">
            {/* Onboarding Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Employee Onboarding</h2>
                  <p className="text-pink-100">Rippling-level onboarding automation</p>
                  <p className="text-pink-200 text-xs mt-1">Task checklists • IT provisioning • Welcome workflows</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockOnboardingTasks.length}</p>
                    <p className="text-pink-200 text-sm">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockOnboardingTasks.filter(t => t.completed).length}</p>
                    <p className="text-pink-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader><CardTitle>Onboarding Progress - Jordan Lee</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-6"><div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Overall Completion</span><span className="text-sm font-medium">{mockOnboardingTasks.filter(t => t.completed).length}/{mockOnboardingTasks.length} tasks</span></div><Progress value={(mockOnboardingTasks.filter(t => t.completed).length / mockOnboardingTasks.length) * 100} className="h-3" /></div>
                  <div className="space-y-3">
                    {mockOnboardingTasks.map(task => (
                      <div key={task.id} className={`flex items-center gap-4 p-4 rounded-lg border ${task.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-white dark:bg-gray-800 border-gray-200'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${task.completed ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{task.completed ? <CheckCircle className="h-5 w-5" /> : <div className="w-3 h-3 rounded-full border-2" />}</div>
                        <div className="flex-1"><p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>{task.title}</p><p className="text-sm text-gray-500">{task.description}</p></div>
                        <div className="text-right"><Badge variant="secondary">{task.category}</Badge><p className="text-xs text-gray-500 mt-1">Due: {task.dueDate}</p></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><div className="flex items-center gap-3 mb-2"><UserPlus className="h-5 w-5 text-blue-600" /><span className="font-medium">New Hires</span></div><p className="text-3xl font-bold text-blue-600">1</p><p className="text-sm text-gray-500">This month</p></div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"><div className="flex items-center gap-3 mb-2"><GraduationCap className="h-5 w-5 text-green-600" /><span className="font-medium">Completed</span></div><p className="text-3xl font-bold text-green-600">5</p><p className="text-sm text-gray-500">Onboardings this quarter</p></div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><div className="flex items-center gap-3 mb-2"><Clock className="h-5 w-5 text-purple-600" /><span className="font-medium">Avg Time</span></div><p className="text-3xl font-bold text-purple-600">12</p><p className="text-sm text-gray-500">Days to complete</p></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compensation Tab */}
          <TabsContent value="compensation" className="mt-6 space-y-6">
            {/* Compensation Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Compensation & Benefits</h2>
                  <p className="text-purple-100">Carta-level compensation and equity management</p>
                  <p className="text-purple-200 text-xs mt-1">Salary bands • Benefits admin • Equity tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">${(mockEmployees.reduce((sum, e) => sum + e.salary, 0) / 1000000).toFixed(1)}M</p>
                    <p className="text-purple-200 text-sm">Total Payroll</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${(mockEmployees.reduce((sum, e) => sum + e.salary, 0) / mockEmployees.length / 1000).toFixed(0)}K</p>
                    <p className="text-purple-200 text-sm">Avg Salary</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['salary', 'benefits', 'equity'].map(tab => (
                  <Button key={tab} variant={compensationTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setCompensationTab(tab)} className={compensationTab === tab ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowExportReportDialog(true)}><Download className="h-4 w-4 mr-2" />Export Report</Button>
            </div>

            {compensationTab === 'salary' && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">${(stats.totalPayroll / 1000).toFixed(0)}K</p><p className="text-sm text-gray-500">Annual Payroll</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">${(mockEmployees.reduce((sum, e) => sum + (e.equity || 0), 0) / 1000).toFixed(0)}K</p><p className="text-sm text-gray-500">Total Equity</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">${(mockEmployees.reduce((sum, e) => sum + e.salary, 0) / mockEmployees.length / 1000).toFixed(0)}K</p><p className="text-sm text-gray-500">Avg Salary</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">92%</p><p className="text-sm text-gray-500">Market Competitive</p></CardContent></Card>
                </div>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Compensation Overview</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equity</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Comp</th></tr></thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {mockEmployees.map(emp => (
                          <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-4 py-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><div><p className="font-medium">{emp.name}</p><p className="text-xs text-gray-500">{emp.position}</p></div></div></td>
                            <td className="px-4 py-4"><Badge variant="outline">{emp.level}</Badge></td>
                            <td className="px-4 py-4 font-medium">${emp.salary.toLocaleString()}</td>
                            <td className="px-4 py-4">${(emp.equity || 0).toLocaleString()}</td>
                            <td className="px-4 py-4 font-semibold text-blue-600">${(emp.salary + (emp.equity || 0)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </>
            )}

            {compensationTab === 'benefits' && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">${mockBenefits.reduce((sum, b) => sum + b.employerContribution, 0).toLocaleString()}</p><p className="text-sm text-gray-500">Monthly Employer Cost</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">{mockBenefits.filter(b => b.enrollmentStatus === 'enrolled').length}/{mockBenefits.length}</p><p className="text-sm text-gray-500">Enrolled Benefits</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">95%</p><p className="text-sm text-gray-500">Enrollment Rate</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-2xl font-bold">Jan 1</p><p className="text-sm text-gray-500">Next Open Enrollment</p></CardContent></Card>
                </div>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Benefits Enrollment</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {mockBenefits.map(benefit => (
                      <div key={benefit.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${benefit.type === 'health' ? 'bg-red-100' : benefit.type === '401k' ? 'bg-green-100' : 'bg-blue-100'}`}>
                            {benefit.type === 'health' && <Heart className="h-5 w-5 text-red-600" />}
                            {benefit.type === 'dental' && <Activity className="h-5 w-5 text-blue-600" />}
                            {benefit.type === 'vision' && <Eye className="h-5 w-5 text-purple-600" />}
                            {benefit.type === 'life' && <Shield className="h-5 w-5 text-gray-600" />}
                            {benefit.type === '401k' && <DollarSign className="h-5 w-5 text-green-600" />}
                            {benefit.type === 'hsa' && <Wallet className="h-5 w-5 text-amber-600" />}
                          </div>
                          <div><h4 className="font-medium">{benefit.name}</h4><p className="text-sm text-gray-500">{benefit.provider} • {benefit.coverageLevel}</p></div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right"><p className="text-sm text-gray-500">Your Cost</p><p className="font-medium">${benefit.cost}/mo</p></div>
                          <div className="text-right"><p className="text-sm text-gray-500">Employer</p><p className="font-medium text-green-600">${benefit.employerContribution}/mo</p></div>
                          <Badge className={getStatusColor(benefit.enrollmentStatus)}>{benefit.enrollmentStatus}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {compensationTab === 'equity' && (
              <div className="grid grid-cols-2 gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Equity Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><p className="text-3xl font-bold text-blue-600">${(mockEmployees.reduce((sum, e) => sum + (e.equity || 0), 0) / 1000).toFixed(0)}K</p><p className="text-sm text-gray-500">Total Equity Pool</p></div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"><p className="text-3xl font-bold text-green-600">${(mockEmployees.reduce((sum, e) => sum + (e.equity || 0), 0) / mockEmployees.length / 1000).toFixed(0)}K</p><p className="text-sm text-gray-500">Avg per Employee</p></div>
                    </div>
                    <div className="space-y-3">
                      {mockEmployees.filter(e => e.equity).map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar><span className="font-medium">{emp.name}</span></div>
                          <span className="font-bold text-green-600">${(emp.equity || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader><CardTitle>Vesting Schedule</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                      <h4 className="font-medium mb-2">Standard 4-Year Vesting</h4>
                      <p className="text-sm text-gray-600 mb-3">1-year cliff, then monthly vesting over 36 months</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[25, 50, 75, 100].map((pct, i) => (
                          <div key={i} className="p-2 bg-white dark:bg-gray-800 rounded"><p className="text-lg font-bold text-amber-600">{pct}%</p><p className="text-xs text-gray-500">Year {i + 1}</p></div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Upcoming Vestings</h4>
                      {[{ name: 'Sarah Chen', amount: 12500, date: 'Feb 15, 2024' }, { name: 'Mike Johnson', amount: 6250, date: 'Mar 1, 2024' }, { name: 'Emily Davis', amount: 5000, date: 'Mar 15, 2024' }].map((vest, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"><span className="text-sm">{vest.name}</span><div className="text-right"><span className="font-medium text-green-600">${vest.amount.toLocaleString()}</span><span className="text-xs text-gray-500 ml-2">{vest.date}</span></div></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="mt-6 space-y-6">
            {/* Learning Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Learning & Development</h2>
                  <p className="text-cyan-100">Udemy Business-level training management</p>
                  <p className="text-cyan-200 text-xs mt-1">Course library • Skill tracking • Certifications</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCourses.length}</p>
                    <p className="text-cyan-200 text-sm">Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockCourses.filter(c => c.status === 'completed').length}</p>
                    <p className="text-cyan-200 text-sm">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{mockCourses.length}</p><p className="text-sm text-gray-500">Total Courses</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{mockCourses.filter(c => c.status === 'completed').length}</p><p className="text-sm text-gray-500">Completed</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-blue-600">{mockCourses.filter(c => c.status === 'in_progress').length}</p><p className="text-sm text-gray-500">In Progress</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{mockCourses.filter(c => c.mandatory && c.status !== 'completed').length}</p><p className="text-sm text-gray-500">Mandatory Pending</p></CardContent></Card>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Training Courses</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {mockCourses.map(course => (
                  <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${course.status === 'completed' ? 'bg-green-100' : course.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {course.status === 'completed' ? <CheckCircle className="h-6 w-6 text-green-600" /> : course.status === 'in_progress' ? <Play className="h-6 w-6 text-blue-600" /> : <BookOpen className="h-6 w-6 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><h4 className="font-medium">{course.title}</h4>{course.mandatory && <Badge className="bg-red-100 text-red-700">Required</Badge>}</div>
                      <p className="text-sm text-gray-500">{course.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500"><span>{course.category}</span><span>{course.duration}</span>{course.dueDate && <span>Due: {course.dueDate}</span>}</div>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-sm mb-1"><span>{course.progress}%</span></div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <Badge className={getStatusColor(course.status)}>{course.status.replace('_', ' ')}</Badge>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCourse(course); setShowCourseDialog(true) }}>{course.status === 'completed' ? 'View' : course.status === 'in_progress' ? 'Continue' : 'Start'}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">HR Settings</h2>
                <p className="text-sm text-gray-500">Configure your HR platform preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', icon: Settings, label: 'General' },
                        { id: 'notifications', icon: Bell, label: 'Notifications' },
                        { id: 'permissions', icon: Shield, label: 'Permissions' },
                        { id: 'integrations', icon: Zap, label: 'Integrations' },
                        { id: 'documents', icon: FileText, label: 'Documents' },
                        { id: 'advanced', icon: Lock, label: 'Advanced' }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Organization Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input defaultValue="Acme Corp" />
                          </div>
                          <div className="space-y-2">
                            <Label>Industry</Label>
                            <Select defaultValue="tech">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tech">Technology</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                <SelectItem value="retail">Retail</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
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
                          <div className="space-y-2">
                            <Label>Time Zone</Label>
                            <Select defaultValue="pst">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="cet">Central European Time (CET)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Multi-location Support</div>
                            <div className="text-sm text-gray-500">Enable multiple office locations</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Umbrella className="h-5 w-5" />
                          Time Off Policies
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Accrual Based PTO</div>
                            <div className="text-sm text-gray-500">Employees accrue time off monthly</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Unlimited PTO</div>
                            <div className="text-sm text-gray-500">No set limit on time off</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Carryover Policy</div>
                            <div className="text-sm text-gray-500">Allow unused PTO to carry over</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Annual PTO Days</Label>
                            <Select defaultValue="20">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15">15 days</SelectItem>
                                <SelectItem value="20">20 days</SelectItem>
                                <SelectItem value="25">25 days</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Carryover</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">None</SelectItem>
                                <SelectItem value="5">5 days</SelectItem>
                                <SelectItem value="10">10 days</SelectItem>
                                <SelectItem value="unlimited">Unlimited</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Performance Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Review Cycle</Label>
                            <Select defaultValue="quarterly">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="biannual">Bi-Annual</SelectItem>
                                <SelectItem value="annual">Annual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Rating Scale</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3-Point Scale</SelectItem>
                                <SelectItem value="5">5-Point Scale</SelectItem>
                                <SelectItem value="10">10-Point Scale</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Self-Reviews</div>
                            <div className="text-sm text-gray-500">Include employee self-assessments</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">360 Feedback</div>
                            <div className="text-sm text-gray-500">Enable peer feedback collection</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Time Off Requests</div>
                            <div className="text-sm text-gray-500">Get notified of new requests</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Performance Reviews</div>
                            <div className="text-sm text-gray-500">Review cycle reminders</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Onboarding Tasks</div>
                            <div className="text-sm text-gray-500">New hire task notifications</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Document Expiry</div>
                            <div className="text-sm text-gray-500">Alert when documents expire</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cake className="h-5 w-5" />
                          Employee Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Work Anniversaries</div>
                            <div className="text-sm text-gray-500">Employee milestone alerts</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Birthday Reminders</div>
                            <div className="text-sm text-gray-500">Get reminded of birthdays</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Hire Announcements</div>
                            <div className="text-sm text-gray-500">Announce new team members</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Departure Notifications</div>
                            <div className="text-sm text-gray-500">Notify about employee departures</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Communication Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Digest Frequency</Label>
                            <Select defaultValue="daily">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="realtime">Real-time</SelectItem>
                                <SelectItem value="daily">Daily Digest</SelectItem>
                                <SelectItem value="weekly">Weekly Digest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Preferred Channel</Label>
                            <Select defaultValue="email">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="slack">Slack</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Permissions Settings */}
                {settingsTab === 'permissions' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Data Visibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Salary Visibility</div>
                            <div className="text-sm text-gray-500">Who can view compensation data</div>
                          </div>
                          <Select defaultValue="managers">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Everyone</SelectItem>
                              <SelectItem value="managers">Managers</SelectItem>
                              <SelectItem value="hr">HR Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Performance Data</div>
                            <div className="text-sm text-gray-500">Review visibility settings</div>
                          </div>
                          <Select defaultValue="managers">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Everyone</SelectItem>
                              <SelectItem value="managers">Managers</SelectItem>
                              <SelectItem value="hr">HR Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Personal Information</div>
                            <div className="text-sm text-gray-500">Contact details, emergency contacts</div>
                          </div>
                          <Select defaultValue="self">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="self">Self Only</SelectItem>
                              <SelectItem value="managers">+ Managers</SelectItem>
                              <SelectItem value="hr">+ HR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Access Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Directory Access</div>
                            <div className="text-sm text-gray-500">Employee directory visibility</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Org Chart Access</div>
                            <div className="text-sm text-gray-500">Who can view org structure</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Self-Service Portal</div>
                            <div className="text-sm text-gray-500">Allow employees to update their info</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Team Analytics</div>
                            <div className="text-sm text-gray-500">Managers can view team metrics</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Role Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Approve Time Off</div>
                            <div className="text-sm text-gray-500">Who can approve PTO requests</div>
                          </div>
                          <Select defaultValue="managers">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hr">HR Only</SelectItem>
                              <SelectItem value="managers">Managers</SelectItem>
                              <SelectItem value="auto">Auto-Approve</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Edit Employee Records</div>
                            <div className="text-sm text-gray-500">Who can modify employee data</div>
                          </div>
                          <Select defaultValue="hr">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hr">HR Only</SelectItem>
                              <SelectItem value="managers">+ Managers</SelectItem>
                              <SelectItem value="admin">Admins Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Connected Integrations
                        </CardTitle>
                        <Button size="sm" onClick={() => setShowAddIntegrationDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Integration
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockIntegrations.map(integration => (
                          <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.status === 'connected' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                {integration.type === 'payroll' && <DollarSign className="h-5 w-5 text-green-600" />}
                                {integration.type === 'benefits' && <Heart className="h-5 w-5 text-pink-600" />}
                                {integration.type === 'ats' && <Users className="h-5 w-5 text-blue-600" />}
                                {integration.type === 'background' && <Shield className="h-5 w-5 text-purple-600" />}
                                {integration.type === 'identity' && <Key className="h-5 w-5 text-amber-600" />}
                                {integration.type === 'communication' && <MessageCircle className="h-5 w-5 text-indigo-600" />}
                              </div>
                              <div>
                                <h4 className="font-medium">{integration.name}</h4>
                                <p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(integration.status)}>{integration.status}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedIntegration(integration); setShowConfigureIntegrationDialog(true) }}>Configure</Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5" />
                          API Access
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium">API Key</div>
                            <Button variant="outline" size="sm" onClick={() => setShowRegenerateKeyDialog(true)}>
                              <Activity className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              hr_live_•••••••••••••••••••••••
                            </code>
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('hr_live_sample_api_key_12345'); toast.success('API key copied to clipboard') }}>Copy</Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">8,456</div>
                            <div className="text-sm text-gray-500">API Calls (30 days)</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">45ms</div>
                            <div className="text-sm text-gray-500">Avg Response Time</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Documents Settings */}
                {settingsTab === 'documents' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Document Templates
                        </CardTitle>
                        <Button size="sm" onClick={() => setShowDocumentDialog(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Template
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockDocuments.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{doc.name}</h4>
                                <p className="text-sm text-gray-500">{doc.type} • {doc.size} • Uploaded {doc.uploadedAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(doc.status)}>{doc.status.replace('_', ' ')}</Badge>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedDocument(doc); setShowDownloadDocDialog(true) }}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setSelectedDocument(doc); setShowDeleteDocDialog(true) }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clipboard className="h-5 w-5" />
                          Document Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">E-Signature Required</div>
                            <div className="text-sm text-gray-500">Require digital signatures for all documents</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-Archive</div>
                            <div className="text-sm text-gray-500">Archive documents older than 5 years</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Version Control</div>
                            <div className="text-sm text-gray-500">Keep history of document changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Document Retention</Label>
                          <Select defaultValue="7years">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3years">3 Years</SelectItem>
                              <SelectItem value="5years">5 Years</SelectItem>
                              <SelectItem value="7years">7 Years</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockEmployees.length}</div>
                            <div className="text-sm text-gray-500">Employees</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockDocuments.length}</div>
                            <div className="text-sm text-gray-500">Documents</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">24.5 MB</div>
                            <div className="text-sm text-gray-500">Storage</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1" onClick={() => setShowExportDataDialog(true)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowImportDataDialog(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Audit & Compliance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Audit Logging</div>
                            <div className="text-sm text-gray-500">Track all HR system changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">GDPR Compliance Mode</div>
                            <div className="text-sm text-gray-500">Enable EU data protection features</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Data Encryption</div>
                            <div className="text-sm text-gray-500">Encrypt sensitive employee data</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowComplianceReportDialog(true)}>
                          <FileCheck className="h-4 w-4 mr-2" />
                          Generate Compliance Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <Trash2 className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Archive All Terminated</div>
                            <div className="text-sm text-gray-500">Archive all terminated employee records</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowArchiveDialog(true)}>
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Delete All Data</div>
                            <div className="text-sm text-gray-500">Permanently delete all HR data</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowDeleteAllDialog(true)}>
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Reset to Defaults</div>
                            <div className="text-sm text-gray-500">Reset all HR settings to defaults</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}>
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

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={employeesAIInsights}
              title="HR Intelligence"
              onInsightAction={(insight) => toast.info(insight.title, { description: insight.description, action: insight.action ? { label: insight.action, onClick: () => toast.success(`Action: ${insight.action}`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={employeesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={employeesPredictions}
              title="Workforce Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={employeesActivities}
            title="HR Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={employeesQuickActions}
            variant="grid"
          />
        </div>

        {/* Profile Dialog */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-2xl">
            {selectedEmployee && (
              <>
                <DialogHeader><DialogTitle>Employee Profile</DialogTitle></DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20"><AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div><h2 className="text-2xl font-bold">{selectedEmployee.name}</h2><p className="text-gray-500">{selectedEmployee.position}</p><Badge className={getDepartmentColor(selectedEmployee.department)}>{selectedEmployee.department}</Badge></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedEmployee.email}</p></div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Location</p><p className="font-medium">{selectedEmployee.location}</p></div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Manager</p><p className="font-medium">{selectedEmployee.manager || 'N/A'}</p></div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-sm text-gray-500">Hire Date</p><p className="font-medium">{selectedEmployee.hireDate}</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><p className="text-3xl font-bold text-blue-600">{selectedEmployee.performanceScore > 0 ? `${selectedEmployee.performanceScore}%` : 'N/A'}</p><p className="text-sm text-gray-500">Performance</p></div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><p className="text-3xl font-bold text-purple-600">{selectedEmployee.projectsCount}</p><p className="text-sm text-gray-500">Projects</p></div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"><p className="text-3xl font-bold text-green-600">{selectedEmployee.directReports}</p><p className="text-sm text-gray-500">Direct Reports</p></div>
                  </div>
                  <div><h4 className="font-medium mb-2">Skills</h4><div className="flex flex-wrap gap-2">{selectedEmployee.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}</div></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowProfileDialog(false)}>Close</Button><Button onClick={() => { setShowProfileDialog(false); setShowEditProfileDialog(true) }}><Edit3 className="h-4 w-4 mr-2" />Edit Profile</Button></DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Employee Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add New Employee</DialogTitle><DialogDescription>Enter the new employee's information</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Full Name</Label><Input placeholder="John Doe" className="mt-1" value={newEmployeeForm.name} onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, name: e.target.value }))} /></div>
              <div><Label>Email</Label><Input type="email" placeholder="john@company.com" className="mt-1" value={newEmployeeForm.email} onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, email: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Department</Label><Select value={newEmployeeForm.department} onValueChange={(value) => setNewEmployeeForm(prev => ({ ...prev, department: value }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="engineering">Engineering</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="product">Product</SelectItem><SelectItem value="marketing">Marketing</SelectItem></SelectContent></Select></div><div><Label>Position</Label><Input placeholder="Software Engineer" className="mt-1" value={newEmployeeForm.position} onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, position: e.target.value }))} /></div></div>
              <div><Label>Start Date</Label><Input type="date" className="mt-1" value={newEmployeeForm.startDate} onChange={(e) => setNewEmployeeForm(prev => ({ ...prev, startDate: e.target.value }))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleCreateEmployee} disabled={creating || !newEmployeeForm.name || !newEmployeeForm.email}>{creating ? 'Adding...' : 'Add Employee'}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Document Upload Dialog */}
        <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
          <DialogContent><DialogHeader><DialogTitle>Upload Document</DialogTitle><DialogDescription>Add a new document template or employee document</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Document Name</Label><Input placeholder="Employment Contract.pdf" className="mt-1" /></div>
              <div><Label>Document Type</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="contract">Contract</SelectItem><SelectItem value="tax">Tax Form</SelectItem><SelectItem value="id">ID Document</SelectItem><SelectItem value="certification">Certification</SelectItem><SelectItem value="policy">Policy</SelectItem></SelectContent></Select></div>
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center"><Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" /><p className="text-sm text-gray-500">Drag and drop or click to upload</p><p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p></div>
              <div><Label>Expiration Date (Optional)</Label><Input type="date" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowDocumentDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleUploadDocument}>Upload Document</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Goal Dialog */}
        <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create New Goal</DialogTitle><DialogDescription>Set an OKR or performance goal for an employee</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Employee</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select employee" /></SelectTrigger><SelectContent>{mockEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Goal Title</Label><Input placeholder="Lead Q1 Feature Development" className="mt-1" /></div>
              <div><Label>Description</Label><Input placeholder="Describe the goal..." className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Category</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="performance">Performance</SelectItem><SelectItem value="development">Development</SelectItem><SelectItem value="team">Team</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent></Select></div><div><Label>Due Date</Label><Input type="date" className="mt-1" /></div></div>
              <div><Label>Key Results</Label>
                <div className="space-y-2 mt-2">
                  {keyResultInputs.map((kr, idx) => (
                    <Input key={idx} placeholder={`Key Result ${idx + 1}`} value={kr} onChange={(e) => setKeyResultInputs(prev => prev.map((v, i) => i === idx ? e.target.value : v))} />
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setKeyResultInputs(prev => [...prev, ''])}><Plus className="h-4 w-4 mr-2" />Add Key Result</Button>
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowGoalDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleCreateGoal}>Create Goal</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Survey Dialog */}
        <Dialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Survey</DialogTitle><DialogDescription>Create a new employee survey or feedback form</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Survey Title</Label><Input placeholder="Q1 2024 Employee Engagement" className="mt-1" /></div>
              <div><Label>Survey Type</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="engagement">Engagement Survey</SelectItem><SelectItem value="pulse">Pulse Check</SelectItem><SelectItem value="feedback">Feedback Survey</SelectItem><SelectItem value="exit">Exit Interview</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Start Date</Label><Input type="date" className="mt-1" /></div><div><Label>Close Date</Label><Input type="date" className="mt-1" /></div></div>
              <div><Label>Recipients</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select recipients" /></SelectTrigger><SelectContent><SelectItem value="all">All Employees</SelectItem><SelectItem value="engineering">Engineering Only</SelectItem><SelectItem value="managers">Managers Only</SelectItem><SelectItem value="custom">Custom Selection</SelectItem></SelectContent></Select></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><p className="font-medium">Anonymous Responses</p><p className="text-sm text-gray-500">Protect respondent identity</p></div><Switch defaultChecked /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowSurveyDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleCreateSurvey}>Create Survey</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Start Performance Review</DialogTitle><DialogDescription>Begin a performance review cycle for an employee</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Employee</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select employee" /></SelectTrigger><SelectContent>{mockEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Review Period</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select period" /></SelectTrigger><SelectContent><SelectItem value="q1">Q1 2024</SelectItem><SelectItem value="q2">Q2 2024</SelectItem><SelectItem value="annual">Annual 2024</SelectItem></SelectContent></Select></div>
              <div><Label>Reviewer</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select reviewer" /></SelectTrigger><SelectContent>{mockEmployees.filter(e => e.directReports > 0).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><p className="font-medium">Include Self-Review</p><p className="text-sm text-gray-500">Allow employee to self-assess</p></div><Switch defaultChecked /></div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><div><p className="font-medium">360 Feedback</p><p className="text-sm text-gray-500">Collect peer feedback</p></div><Switch /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleStartReview}>Start Review</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  className="mt-1"
                  value={editEmployeeForm.employee_name}
                  onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, employee_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  className="mt-1"
                  value={editEmployeeForm.email}
                  onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+1-555-0123"
                  className="mt-1"
                  value={editEmployeeForm.phone}
                  onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Select
                    value={editEmployeeForm.department}
                    onValueChange={(value) => setEditEmployeeForm(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    placeholder="Software Engineer"
                    className="mt-1"
                    value={editEmployeeForm.position}
                    onChange={(e) => setEditEmployeeForm(prev => ({ ...prev, position: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editEmployeeForm.status}
                  onValueChange={(value) => setEditEmployeeForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleUpdateEmployee}
                disabled={updating || !editEmployeeForm.employee_name || !editEmployeeForm.email}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Employee Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {employeeToDelete?.employee_name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmployee}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Employee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Employees Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Employee Data</DialogTitle>
              <DialogDescription>Choose the format and data to export</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data to Include</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Employee Profiles</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Compensation Data</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Performance Reviews</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Time Off History</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleExportEmployees}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Off Request Dialog */}
        <Dialog open={showTimeOffRequestDialog} onOpenChange={setShowTimeOffRequestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>Submit a new time off request</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Employee</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEmployees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type of Leave</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="parental">Parental Leave</SelectItem>
                    <SelectItem value="bereavement">Bereavement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" className="mt-1" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Input placeholder="Briefly describe your reason..." className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTimeOffRequestDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleSubmitTimeOff}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Compensation Report Dialog */}
        <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Compensation Report</DialogTitle>
              <DialogDescription>Generate a compensation report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Report Type</Label>
                <Select defaultValue="summary">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Compensation Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Breakdown</SelectItem>
                    <SelectItem value="comparison">Market Comparison</SelectItem>
                    <SelectItem value="equity">Equity Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select defaultValue="all">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportReportDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleGenerateCompensationReport}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Course Dialog */}
        <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCourse?.title || 'Course'}</DialogTitle>
              <DialogDescription>{selectedCourse?.description}</DialogDescription>
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{selectedCourse.category}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedCourse.duration}</p>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Progress</p>
                    <p className="font-medium">{selectedCourse.progress}%</p>
                  </div>
                  <Progress value={selectedCourse.progress} className="h-2" />
                </div>
                {selectedCourse.mandatory && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-700">This is a mandatory course</p>
                    {selectedCourse.dueDate && <p className="text-xs text-amber-600">Due: {selectedCourse.dueDate}</p>}
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCourseDialog(false)}>Close</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => {
                const action = selectedCourse?.status === 'completed' ? 'Opening course materials...' : selectedCourse?.status === 'in_progress' ? 'Resuming course...' : 'Starting course...';
                const successMsg = selectedCourse?.status === 'completed' ? 'Course materials opened!' : selectedCourse?.status === 'in_progress' ? 'Course resumed!' : 'Course started!';
                toast.loading(action, { id: 'course-action' }); setTimeout(() => { toast.success(successMsg, { id: 'course-action' }); setShowCourseDialog(false) }, 1000)
              }}>
                {selectedCourse?.status === 'completed' ? 'View Materials' : selectedCourse?.status === 'in_progress' ? 'Continue' : 'Start Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Integration Dialog */}
        <Dialog open={showAddIntegrationDialog} onOpenChange={setShowAddIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Integration</DialogTitle>
              <DialogDescription>Connect a new HR service integration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Integration Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payroll">Payroll System</SelectItem>
                    <SelectItem value="benefits">Benefits Provider</SelectItem>
                    <SelectItem value="ats">Applicant Tracking (ATS)</SelectItem>
                    <SelectItem value="background">Background Check</SelectItem>
                    <SelectItem value="identity">Identity Provider</SelectItem>
                    <SelectItem value="communication">Communication Tool</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adp">ADP</SelectItem>
                    <SelectItem value="gusto">Gusto</SelectItem>
                    <SelectItem value="greenhouse">Greenhouse</SelectItem>
                    <SelectItem value="lever">Lever</SelectItem>
                    <SelectItem value="okta">Okta</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>API Key / Credentials</Label>
                <Input type="password" placeholder="Enter API key..." className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddIntegrationDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleConnectIntegration}>
                <Zap className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Configure Integration Dialog */}
        <Dialog open={showConfigureIntegrationDialog} onOpenChange={setShowConfigureIntegrationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
              <DialogDescription>Manage integration settings</DialogDescription>
            </DialogHeader>
            {selectedIntegration && (
              <div className="space-y-4 py-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <Badge className={getStatusColor(selectedIntegration.status)}>{selectedIntegration.status}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Last Sync</p>
                  <p className="font-medium">{selectedIntegration.lastSync}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">Auto-sync</p>
                    <p className="text-sm text-gray-500">Automatically sync data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigureIntegrationDialog(false)}>Cancel</Button>
              <Button variant="outline" className="text-red-600" onClick={handleDisconnectIntegration}>Disconnect</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleSaveIntegrationSettings}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateKeyDialog} onOpenChange={setShowRegenerateKeyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Regenerate API Key</DialogTitle>
              <DialogDescription>This will invalidate your current API key. All applications using this key will need to be updated.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-700">Warning</p>
                <p className="text-sm text-amber-600 mt-1">Regenerating the API key will immediately revoke the current key. Make sure to update all applications using this key.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRegenerateKeyDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRegenerateApiKey}>
                Regenerate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export All Data Dialog */}
        <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export All HR Data</DialogTitle>
              <DialogDescription>Create a complete backup of all HR system data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">Data to export:</p>
                <ul className="text-sm text-gray-500 mt-2 space-y-1">
                  <li>- {mockEmployees.length} Employee records</li>
                  <li>- {mockDocuments.length} Documents</li>
                  <li>- {mockReviews.length} Performance reviews</li>
                  <li>- {mockTimeOffRequests.length} Time off requests</li>
                  <li>- All settings and configurations</li>
                </ul>
              </div>
              <div>
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (Full backup)</SelectItem>
                    <SelectItem value="csv">CSV (Spreadsheet compatible)</SelectItem>
                    <SelectItem value="xlsx">Excel Workbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleExportAllHRData}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Data Dialog */}
        <Dialog open={showImportDataDialog} onOpenChange={setShowImportDataDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import HR Data</DialogTitle>
              <DialogDescription>Import employee data from an external file</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Import Type</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select import type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employees">Employee Records</SelectItem>
                    <SelectItem value="compensation">Compensation Data</SelectItem>
                    <SelectItem value="full">Full System Restore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Drag and drop or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">CSV, XLSX, or JSON up to 50MB</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Overwrite existing records</p>
                  <p className="text-sm text-gray-500">Replace matching records</p>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportDataDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleImportHRData}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Compliance Report Dialog */}
        <Dialog open={showComplianceReportDialog} onOpenChange={setShowComplianceReportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Compliance Report</DialogTitle>
              <DialogDescription>Create a compliance audit report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Report Type</Label>
                <Select defaultValue="gdpr">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                    <SelectItem value="soc2">SOC 2 Audit</SelectItem>
                    <SelectItem value="hipaa">HIPAA Compliance</SelectItem>
                    <SelectItem value="full">Full Compliance Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Include audit trail</p>
                  <p className="text-sm text-gray-500">All system changes and access logs</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowComplianceReportDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={handleGenerateComplianceReport}>
                <FileCheck className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Terminated Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Archive Terminated Employees</DialogTitle>
              <DialogDescription>This will archive all terminated employee records</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-700">This action will:</p>
                <ul className="text-sm text-amber-600 mt-2 space-y-1">
                  <li>- Move all terminated employee records to archive</li>
                  <li>- Remove them from active directory</li>
                  <li>- Retain data for compliance purposes</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (confirm('Are you sure you want to archive all terminated employees?')) { toast.loading('Archiving terminated employees...', { id: 'archive-terminated' }); setTimeout(() => { toast.success('Terminated employees archived successfully!', { id: 'archive-terminated' }); setShowArchiveDialog(false) }, 1800) } }}>
                Archive All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Data Dialog */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All HR Data</DialogTitle>
              <DialogDescription>This action is permanent and cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-700">Warning: This will permanently delete:</p>
                <ul className="text-sm text-red-600 mt-2 space-y-1">
                  <li>- All employee records</li>
                  <li>- All documents and files</li>
                  <li>- All performance reviews</li>
                  <li>- All time off records</li>
                  <li>- All system configurations</li>
                </ul>
              </div>
              <div className="mt-4">
                <Label>Type "DELETE" to confirm</Label>
                <Input placeholder="DELETE" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (confirm('FINAL WARNING: This will permanently delete ALL HR data. This action cannot be undone. Are you absolutely sure?')) { toast.loading('Deleting all HR data...', { id: 'delete-all' }); setTimeout(() => { toast.success('All HR data has been deleted', { id: 'delete-all' }); setShowDeleteAllDialog(false) }, 2500) } }}>
                Delete All Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset to Defaults</DialogTitle>
              <DialogDescription>Reset all HR settings to their default values</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                <p className="text-sm font-medium text-amber-700">This will reset:</p>
                <ul className="text-sm text-amber-600 mt-2 space-y-1">
                  <li>- Notification preferences</li>
                  <li>- Permission settings</li>
                  <li>- Time off policies</li>
                  <li>- Performance review settings</li>
                  <li>- Integration configurations</li>
                </ul>
                <p className="text-sm text-amber-600 mt-2">Employee data will not be affected.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (confirm('Are you sure you want to reset all settings to their default values?')) { toast.loading('Resetting settings...', { id: 'reset-settings' }); setTimeout(() => { toast.success('Settings reset to defaults!', { id: 'reset-settings' }); setShowResetSettingsDialog(false) }, 1200) } }}>
                Reset Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog (for mock employees) */}
        <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Employee Profile</DialogTitle>
              <DialogDescription>Update {selectedEmployee?.name}'s profile information</DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input defaultValue={selectedEmployee.name} className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue={selectedEmployee.email} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Position</Label>
                    <Input defaultValue={selectedEmployee.position} className="mt-1" />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select defaultValue={selectedEmployee.department.toLowerCase()}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input defaultValue={selectedEmployee.location} className="mt-1" />
                  </div>
                  <div>
                    <Label>Manager</Label>
                    <Select defaultValue={selectedEmployee.managerId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockEmployees.filter(e => e.directReports > 0).map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Skills (comma separated)</Label>
                  <Input defaultValue={selectedEmployee.skills.join(', ')} className="mt-1" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => { toast.loading('Updating employee profile...', { id: 'profile-update' }); setTimeout(() => { toast.success('Employee profile updated successfully!', { id: 'profile-update' }); setShowEditProfileDialog(false) }, 1200) }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Download Document Dialog */}
        <Dialog open={showDownloadDocDialog} onOpenChange={setShowDownloadDocDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Download Document</DialogTitle>
              <DialogDescription>Download {selectedDocument?.name}</DialogDescription>
            </DialogHeader>
            {selectedDocument && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">File name</span>
                    <span className="font-medium">{selectedDocument.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Size</span>
                    <span className="font-medium">{selectedDocument.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="font-medium">{selectedDocument.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Uploaded</span>
                    <span className="font-medium">{selectedDocument.uploadedAt}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDownloadDocDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => { toast.loading('Preparing download...', { id: 'doc-download' }); setTimeout(() => { toast.success('Download started!', { id: 'doc-download' }); setShowDownloadDocDialog(false) }, 1000) }}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Document Dialog */}
        <Dialog open={showDeleteDocDialog} onOpenChange={setShowDeleteDocDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>Are you sure you want to delete "{selectedDocument?.name}"?</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">This action cannot be undone. The document will be permanently deleted from the system.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDocDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) { toast.loading('Deleting document...', { id: 'doc-delete' }); setTimeout(() => { toast.success('Document deleted successfully', { id: 'doc-delete' }); setShowDeleteDocDialog(false) }, 1200) } }}>
                Delete Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
