'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users, UserPlus, Briefcase, Award, TrendingUp, DollarSign, Eye, MessageCircle, Mail, Star,
  Search, Filter, Calendar, Clock, Gift, Heart, Target, FileText, CheckCircle, XCircle,
  ChevronRight, ChevronDown, Building2, MapPin, Phone, Globe, GraduationCap, Medal, Zap,
  Settings, Download, Upload, MoreHorizontal, Edit3, Trash2, Send, Bell, BookOpen, Cake,
  Plane, Umbrella, Coffee, Home, Video, BarChart3, PieChart, TrendingDown, ArrowUpRight,
  UserCheck, UserMinus, Layers, Wallet, CreditCard, Percent, Shield, Lock, Key, Plus,
  Play, Award as Trophy, BookMarked, Monitor, FileCheck, Clipboard, Activity
} from 'lucide-react'

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
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
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
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'Engineering', 'Design', 'Product', 'Marketing', 'Sales'].map(dept => (
                <Button key={dept} variant={departmentFilter === dept.toLowerCase() ? 'default' : 'outline'} size="sm" onClick={() => setDepartmentFilter(dept.toLowerCase())} className={departmentFilter === dept.toLowerCase() ? 'bg-blue-600' : ''}>{dept === 'all' ? 'All Departments' : dept}</Button>
              ))}
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
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Time Off Requests</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Request Time Off</Button></CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockTimeOffRequests.map(request => (
                  <div key={request.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Avatar><AvatarFallback className="bg-blue-100 text-blue-700">{request.employeeName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <div className="flex-1"><p className="font-medium">{request.employeeName}</p><p className="text-sm text-gray-500">{request.type.charAt(0).toUpperCase() + request.type.slice(1)} • {request.days} day{request.days > 1 ? 's' : ''}</p></div>
                    <div className="text-right"><p className="text-sm">{request.startDate} - {request.endDate}</p><Badge className={getStatusColor(request.status)}>{request.status}</Badge></div>
                    {request.status === 'pending' && <div className="flex gap-2"><Button size="icon" variant="ghost" className="text-green-600"><CheckCircle className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-red-600"><XCircle className="h-4 w-4" /></Button></div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6 space-y-6">
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
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['salary', 'benefits', 'equity'].map(tab => (
                  <Button key={tab} variant={compensationTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setCompensationTab(tab)} className={compensationTab === tab ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>
              <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Report</Button>
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
                    <Button variant="outline" size="sm">{course.status === 'completed' ? 'View' : course.status === 'in_progress' ? 'Continue' : 'Start'}</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
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
                      { id: 'permissions', icon: Shield, label: 'Permissions' },
                      { id: 'integrations', icon: Zap, label: 'Integrations' },
                      { id: 'documents', icon: FileText, label: 'Documents' },
                      { id: 'surveys', icon: Clipboard, label: 'Surveys' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
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
                      <CardHeader><CardTitle>Organization Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4"><div><Label>Company Name</Label><Input defaultValue="Acme Corp" className="mt-1" /></div><div><Label>Industry</Label><Select defaultValue="tech"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tech">Technology</SelectItem><SelectItem value="finance">Finance</SelectItem><SelectItem value="healthcare">Healthcare</SelectItem></SelectContent></Select></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><Label>Fiscal Year Start</Label><Select defaultValue="january"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="january">January</SelectItem><SelectItem value="april">April</SelectItem><SelectItem value="july">July</SelectItem></SelectContent></Select></div><div><Label>Time Zone</Label><Select defaultValue="pst"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pst">Pacific Time</SelectItem><SelectItem value="est">Eastern Time</SelectItem><SelectItem value="utc">UTC</SelectItem></SelectContent></Select></div></div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle>Time Off Policies</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Accrual Based PTO</p><p className="text-sm text-gray-500">Employees accrue time off monthly</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Unlimited PTO</p><p className="text-sm text-gray-500">No set limit on time off</p></div><Switch /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Carryover Policy</p><p className="text-sm text-gray-500">Allow unused PTO to carry over</p></div><Switch defaultChecked /></div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'notifications' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Time Off Requests</p><p className="text-sm text-gray-500">Get notified of new requests</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Performance Reviews</p><p className="text-sm text-gray-500">Review cycle reminders</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Onboarding Tasks</p><p className="text-sm text-gray-500">New hire task notifications</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Work Anniversaries</p><p className="text-sm text-gray-500">Employee milestone alerts</p></div><Switch /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Birthday Reminders</p><p className="text-sm text-gray-500">Get reminded of birthdays</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Document Expiry</p><p className="text-sm text-gray-500">Alert when documents expire</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'permissions' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader><CardTitle>Privacy & Access Controls</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between"><div><p className="font-medium">Salary Visibility</p><p className="text-sm text-gray-500">Who can view compensation data</p></div><Select defaultValue="managers"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Everyone</SelectItem><SelectItem value="managers">Managers</SelectItem><SelectItem value="hr">HR Only</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Performance Data</p><p className="text-sm text-gray-500">Review visibility settings</p></div><Select defaultValue="managers"><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Everyone</SelectItem><SelectItem value="managers">Managers</SelectItem><SelectItem value="hr">HR Only</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Directory Access</p><p className="text-sm text-gray-500">Employee directory visibility</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Org Chart Access</p><p className="text-sm text-gray-500">Who can view org structure</p></div><Switch defaultChecked /></div>
                      <div className="flex items-center justify-between"><div><p className="font-medium">Self-Service Portal</p><p className="text-sm text-gray-500">Allow employees to update their info</p></div><Switch defaultChecked /></div>
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'integrations' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Connected Integrations</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Add Integration</Button></CardHeader>
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
                            <div><h4 className="font-medium">{integration.name}</h4><p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p></div>
                          </div>
                          <div className="flex items-center gap-3"><Badge className={getStatusColor(integration.status)}>{integration.status}</Badge><Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'documents' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Document Templates</CardTitle><Button onClick={() => setShowDocumentDialog(true)}><Upload className="h-4 w-4 mr-2" />Upload Template</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {mockDocuments.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600" /></div>
                            <div><h4 className="font-medium">{doc.name}</h4><p className="text-sm text-gray-500">{doc.type} • {doc.size} • Uploaded {doc.uploadedAt}</p></div>
                          </div>
                          <div className="flex items-center gap-3"><Badge className={getStatusColor(doc.status)}>{doc.status.replace('_', ' ')}</Badge><Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'surveys' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Employee Surveys</CardTitle><Button onClick={() => setShowSurveyDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Survey</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {mockSurveys.map(survey => (
                        <div key={survey.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div><h4 className="font-medium">{survey.title}</h4><p className="text-sm text-gray-500">{survey.type} • Closes: {survey.closesAt}</p></div>
                            <Badge className={getStatusColor(survey.status)}>{survey.status}</Badge>
                          </div>
                          {survey.status !== 'draft' && (
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div className="text-center p-2 bg-white dark:bg-gray-700 rounded"><p className="text-xl font-bold text-blue-600">{survey.responseRate}%</p><p className="text-xs text-gray-500">Response Rate</p></div>
                              <div className="text-center p-2 bg-white dark:bg-gray-700 rounded"><p className="text-xl font-bold text-green-600">{survey.avgScore}/5</p><p className="text-xs text-gray-500">Avg Score</p></div>
                              <div className="text-center p-2 bg-white dark:bg-gray-700 rounded"><p className="text-xl font-bold">{survey.responses}/{survey.totalInvited}</p><p className="text-xs text-gray-500">Responses</p></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
                <DialogFooter><Button variant="outline" onClick={() => setShowProfileDialog(false)}>Close</Button><Button><Edit3 className="h-4 w-4 mr-2" />Edit Profile</Button></DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Employee Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add New Employee</DialogTitle><DialogDescription>Enter the new employee's information</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Full Name</Label><Input placeholder="John Doe" className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" placeholder="john@company.com" className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Department</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="engineering">Engineering</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="product">Product</SelectItem><SelectItem value="marketing">Marketing</SelectItem></SelectContent></Select></div><div><Label>Position</Label><Input placeholder="Software Engineer" className="mt-1" /></div></div>
              <div><Label>Start Date</Label><Input type="date" className="mt-1" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Add Employee</Button></DialogFooter>
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
            <DialogFooter><Button variant="outline" onClick={() => setShowDocumentDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Upload Document</Button></DialogFooter>
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
                  <Input placeholder="Key Result 1" />
                  <Input placeholder="Key Result 2" />
                  <Button variant="outline" size="sm" className="w-full"><Plus className="h-4 w-4 mr-2" />Add Key Result</Button>
                </div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowGoalDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Create Goal</Button></DialogFooter>
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
            <DialogFooter><Button variant="outline" onClick={() => setShowSurveyDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Create Survey</Button></DialogFooter>
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
            <DialogFooter><Button variant="outline" onClick={() => setShowReviewDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Start Review</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
