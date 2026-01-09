'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAllocations, useAllocationMutations } from '@/lib/hooks/use-allocations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Briefcase,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Search,
  Plus,
  Settings,
  BarChart3,
  PieChart,
  DollarSign,
  UserCheck,
  Building,
  MapPin,
  Mail,
  Phone,
  Star,
  Target,
  Zap,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  CalendarRange,
  Layers,
  GitBranch,
  CheckCircle,
  ChevronRight,
  Percent,
  Award,
  Coffee,
  Plane,
  HeartPulse,
  Home,
  Loader2
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




// ============================================================================
// TYPE DEFINITIONS - Resource Guru Level Resource Management
// ============================================================================

type AllocationStatus = 'active' | 'pending' | 'completed' | 'cancelled' | 'on_hold'
type AllocationType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'freelance'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type ResourceStatus = 'available' | 'partially_available' | 'unavailable' | 'on_leave'
type TimeOffType = 'vacation' | 'sick' | 'personal' | 'holiday' | 'remote'
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

interface Skill {
  name: string
  level: SkillLevel
  years_experience: number
}

interface Resource {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  role: string
  department: string
  location: string
  status: ResourceStatus
  hourly_rate: number
  cost_rate: number
  capacity_hours: number
  allocated_hours: number
  utilization: number
  skills: Skill[]
  manager_id: string | null
  manager_name: string | null
  start_date: string
  timezone: string
  is_billable: boolean
}

interface Project {
  id: string
  name: string
  code: string
  client_name: string
  status: 'active' | 'planning' | 'completed' | 'on_hold'
  priority: Priority
  start_date: string
  end_date: string
  budget_hours: number
  allocated_hours: number
  consumed_hours: number
  budget_amount: number
  spent_amount: number
  pm_name: string
  pm_avatar: string
  color: string
  team_size: number
}

interface Allocation {
  id: string
  resource_id: string
  resource_name: string
  resource_avatar: string
  resource_role: string
  project_id: string
  project_name: string
  project_code: string
  project_color: string
  status: AllocationStatus
  allocation_type: AllocationType
  priority: Priority
  hours_per_week: number
  start_date: string
  end_date: string
  billable_rate: number
  cost_rate: number
  notes: string
  created_at: string
  updated_at: string
  approved_by: string | null
  approved_at: string | null
}

interface TimeOff {
  id: string
  resource_id: string
  resource_name: string
  resource_avatar: string
  type: TimeOffType
  start_date: string
  end_date: string
  hours: number
  status: 'approved' | 'pending' | 'rejected'
  notes: string
  approved_by: string | null
}

interface CapacityForecast {
  week: string
  total_capacity: number
  allocated_hours: number
  available_hours: number
  utilization: number
  over_allocated: boolean
}

interface UtilizationData {
  period: string
  billable_hours: number
  non_billable_hours: number
  time_off_hours: number
  available_hours: number
  utilization_rate: number
  billable_rate: number
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const mockResources: Resource[] = [
  {
    id: 'r1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    phone: '+1 (555) 123-4567',
    avatar: '',
    role: 'Senior Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    status: 'available',
    hourly_rate: 150,
    cost_rate: 85,
    capacity_hours: 40,
    allocated_hours: 32,
    utilization: 80,
    skills: [
      { name: 'React', level: 'expert', years_experience: 6 },
      { name: 'TypeScript', level: 'expert', years_experience: 5 },
      { name: 'Node.js', level: 'advanced', years_experience: 4 }
    ],
    manager_id: 'm1',
    manager_name: 'Mike Wilson',
    start_date: '2021-03-15',
    timezone: 'America/Los_Angeles',
    is_billable: true
  },
  {
    id: 'r2',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    phone: '+1 (555) 234-5678',
    avatar: '',
    role: 'Engineering Manager',
    department: 'Engineering',
    location: 'New York, NY',
    status: 'partially_available',
    hourly_rate: 200,
    cost_rate: 120,
    capacity_hours: 40,
    allocated_hours: 45,
    utilization: 112,
    skills: [
      { name: 'Leadership', level: 'expert', years_experience: 10 },
      { name: 'System Design', level: 'expert', years_experience: 12 },
      { name: 'Python', level: 'advanced', years_experience: 8 }
    ],
    manager_id: null,
    manager_name: null,
    start_date: '2019-01-10',
    timezone: 'America/New_York',
    is_billable: true
  },
  {
    id: 'r3',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    phone: '+1 (555) 345-6789',
    avatar: '',
    role: 'UX Designer',
    department: 'Design',
    location: 'Austin, TX',
    status: 'available',
    hourly_rate: 125,
    cost_rate: 70,
    capacity_hours: 40,
    allocated_hours: 36,
    utilization: 90,
    skills: [
      { name: 'Figma', level: 'expert', years_experience: 5 },
      { name: 'User Research', level: 'advanced', years_experience: 4 },
      { name: 'Prototyping', level: 'expert', years_experience: 5 }
    ],
    manager_id: 'm2',
    manager_name: 'Lisa Thompson',
    start_date: '2022-06-01',
    timezone: 'America/Chicago',
    is_billable: true
  },
  {
    id: 'r4',
    name: 'James Brown',
    email: 'james.brown@company.com',
    phone: '+1 (555) 456-7890',
    avatar: '',
    role: 'Backend Developer',
    department: 'Engineering',
    location: 'Seattle, WA',
    status: 'on_leave',
    hourly_rate: 140,
    cost_rate: 80,
    capacity_hours: 40,
    allocated_hours: 0,
    utilization: 0,
    skills: [
      { name: 'Go', level: 'expert', years_experience: 5 },
      { name: 'Kubernetes', level: 'advanced', years_experience: 3 },
      { name: 'PostgreSQL', level: 'expert', years_experience: 6 }
    ],
    manager_id: 'm1',
    manager_name: 'Mike Wilson',
    start_date: '2020-08-20',
    timezone: 'America/Los_Angeles',
    is_billable: true
  },
  {
    id: 'r5',
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phone: '+1 (555) 567-8901',
    avatar: '',
    role: 'DevOps Engineer',
    department: 'Operations',
    location: 'Denver, CO',
    status: 'available',
    hourly_rate: 160,
    cost_rate: 95,
    capacity_hours: 40,
    allocated_hours: 40,
    utilization: 100,
    skills: [
      { name: 'AWS', level: 'expert', years_experience: 7 },
      { name: 'Terraform', level: 'expert', years_experience: 5 },
      { name: 'Docker', level: 'advanced', years_experience: 6 }
    ],
    manager_id: 'm3',
    manager_name: 'David Kim',
    start_date: '2021-11-01',
    timezone: 'America/Denver',
    is_billable: true
  }
]

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Platform Redesign',
    code: 'PLAT-001',
    client_name: 'Internal',
    status: 'active',
    priority: 'high',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    budget_hours: 2400,
    allocated_hours: 1800,
    consumed_hours: 1200,
    budget_amount: 360000,
    spent_amount: 180000,
    pm_name: 'Lisa Thompson',
    pm_avatar: '',
    color: '#8B5CF6',
    team_size: 8
  },
  {
    id: 'p2',
    name: 'Mobile App V2',
    code: 'MOB-002',
    client_name: 'TechCorp Inc',
    status: 'active',
    priority: 'critical',
    start_date: '2024-02-01',
    end_date: '2024-08-31',
    budget_hours: 3200,
    allocated_hours: 2400,
    consumed_hours: 1600,
    budget_amount: 480000,
    spent_amount: 240000,
    pm_name: 'Mike Wilson',
    pm_avatar: '',
    color: '#EC4899',
    team_size: 12
  },
  {
    id: 'p3',
    name: 'API Migration',
    code: 'API-003',
    client_name: 'DataFlow Systems',
    status: 'planning',
    priority: 'medium',
    start_date: '2024-04-01',
    end_date: '2024-09-30',
    budget_hours: 1600,
    allocated_hours: 800,
    consumed_hours: 0,
    budget_amount: 240000,
    spent_amount: 0,
    pm_name: 'Sarah Chen',
    pm_avatar: '',
    color: '#14B8A6',
    team_size: 5
  },
  {
    id: 'p4',
    name: 'Security Audit',
    code: 'SEC-004',
    client_name: 'FinanceFirst',
    status: 'active',
    priority: 'high',
    start_date: '2024-01-15',
    end_date: '2024-03-31',
    budget_hours: 400,
    allocated_hours: 360,
    consumed_hours: 320,
    budget_amount: 64000,
    spent_amount: 51200,
    pm_name: 'David Kim',
    pm_avatar: '',
    color: '#F59E0B',
    team_size: 3
  },
  {
    id: 'p5',
    name: 'Training Portal',
    code: 'TRN-005',
    client_name: 'Internal',
    status: 'on_hold',
    priority: 'low',
    start_date: '2024-05-01',
    end_date: '2024-10-31',
    budget_hours: 800,
    allocated_hours: 0,
    consumed_hours: 0,
    budget_amount: 120000,
    spent_amount: 0,
    pm_name: 'Emma Davis',
    pm_avatar: '',
    color: '#6366F1',
    team_size: 0
  }
]

const mockAllocations: Allocation[] = [
  {
    id: 'a1',
    resource_id: 'r1',
    resource_name: 'Sarah Chen',
    resource_avatar: '',
    resource_role: 'Senior Developer',
    project_id: 'p1',
    project_name: 'Platform Redesign',
    project_code: 'PLAT-001',
    project_color: '#8B5CF6',
    status: 'active',
    allocation_type: 'full-time',
    priority: 'high',
    hours_per_week: 32,
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    billable_rate: 150,
    cost_rate: 85,
    notes: 'Lead frontend development',
    created_at: '2023-12-15T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    approved_by: 'Mike Wilson',
    approved_at: '2023-12-16T09:00:00Z'
  },
  {
    id: 'a2',
    resource_id: 'r2',
    resource_name: 'Mike Wilson',
    resource_avatar: '',
    resource_role: 'Engineering Manager',
    project_id: 'p2',
    project_name: 'Mobile App V2',
    project_code: 'MOB-002',
    project_color: '#EC4899',
    status: 'active',
    allocation_type: 'part-time',
    priority: 'critical',
    hours_per_week: 20,
    start_date: '2024-02-01',
    end_date: '2024-08-31',
    billable_rate: 200,
    cost_rate: 120,
    notes: 'Technical oversight and architecture review',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    approved_by: null,
    approved_at: null
  },
  {
    id: 'a3',
    resource_id: 'r3',
    resource_name: 'Emma Davis',
    resource_avatar: '',
    resource_role: 'UX Designer',
    project_id: 'p1',
    project_name: 'Platform Redesign',
    project_code: 'PLAT-001',
    project_color: '#8B5CF6',
    status: 'active',
    allocation_type: 'full-time',
    priority: 'high',
    hours_per_week: 36,
    start_date: '2024-01-01',
    end_date: '2024-04-30',
    billable_rate: 125,
    cost_rate: 70,
    notes: 'Lead UX design and user research',
    created_at: '2023-12-15T10:00:00Z',
    updated_at: '2024-01-10T16:00:00Z',
    approved_by: 'Lisa Thompson',
    approved_at: '2023-12-16T11:00:00Z'
  },
  {
    id: 'a4',
    resource_id: 'r5',
    resource_name: 'Alex Johnson',
    resource_avatar: '',
    resource_role: 'DevOps Engineer',
    project_id: 'p2',
    project_name: 'Mobile App V2',
    project_code: 'MOB-002',
    project_color: '#EC4899',
    status: 'active',
    allocation_type: 'full-time',
    priority: 'critical',
    hours_per_week: 40,
    start_date: '2024-02-01',
    end_date: '2024-08-31',
    billable_rate: 160,
    cost_rate: 95,
    notes: 'CI/CD pipeline and infrastructure setup',
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-02-01T08:00:00Z',
    approved_by: 'Mike Wilson',
    approved_at: '2024-01-26T14:00:00Z'
  },
  {
    id: 'a5',
    resource_id: 'r2',
    resource_name: 'Mike Wilson',
    resource_avatar: '',
    resource_role: 'Engineering Manager',
    project_id: 'p4',
    project_name: 'Security Audit',
    project_code: 'SEC-004',
    project_color: '#F59E0B',
    status: 'active',
    allocation_type: 'part-time',
    priority: 'high',
    hours_per_week: 25,
    start_date: '2024-01-15',
    end_date: '2024-03-31',
    billable_rate: 200,
    cost_rate: 120,
    notes: 'Security review and compliance oversight',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    approved_by: 'David Kim',
    approved_at: '2024-01-11T15:00:00Z'
  },
  {
    id: 'a6',
    resource_id: 'r1',
    resource_name: 'Sarah Chen',
    resource_avatar: '',
    resource_role: 'Senior Developer',
    project_id: 'p3',
    project_name: 'API Migration',
    project_code: 'API-003',
    project_color: '#14B8A6',
    status: 'pending',
    allocation_type: 'part-time',
    priority: 'medium',
    hours_per_week: 8,
    start_date: '2024-04-01',
    end_date: '2024-09-30',
    billable_rate: 150,
    cost_rate: 85,
    notes: 'API design consultation',
    created_at: '2024-02-01T14:00:00Z',
    updated_at: '2024-02-01T14:00:00Z',
    approved_by: null,
    approved_at: null
  }
]

const mockTimeOff: TimeOff[] = [
  { id: 't1', resource_id: 'r4', resource_name: 'James Brown', resource_avatar: '', type: 'vacation', start_date: '2024-02-12', end_date: '2024-02-23', hours: 80, status: 'approved', notes: 'Annual vacation', approved_by: 'Mike Wilson' },
  { id: 't2', resource_id: 'r1', resource_name: 'Sarah Chen', resource_avatar: '', type: 'sick', start_date: '2024-01-29', end_date: '2024-01-30', hours: 16, status: 'approved', notes: 'Doctor appointment', approved_by: 'Mike Wilson' },
  { id: 't3', resource_id: 'r3', resource_name: 'Emma Davis', resource_avatar: '', type: 'remote', start_date: '2024-02-05', end_date: '2024-02-09', hours: 40, status: 'approved', notes: 'Working from home', approved_by: 'Lisa Thompson' },
  { id: 't4', resource_id: 'r5', resource_name: 'Alex Johnson', resource_avatar: '', type: 'personal', start_date: '2024-03-01', end_date: '2024-03-01', hours: 8, status: 'pending', notes: 'Personal day', approved_by: null },
  { id: 't5', resource_id: 'r2', resource_name: 'Mike Wilson', resource_avatar: '', type: 'holiday', start_date: '2024-02-19', end_date: '2024-02-19', hours: 8, status: 'approved', notes: 'Presidents Day', approved_by: null }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: AllocationStatus): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'on_hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getResourceStatusColor = (status: ResourceStatus): string => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'partially_available': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'unavailable': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'on_leave': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getSkillLevelColor = (level: SkillLevel): string => {
  switch (level) {
    case 'expert': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'advanced': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'beginner': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getTimeOffIcon = (type: TimeOffType) => {
  switch (type) {
    case 'vacation': return <Plane className="w-4 h-4" />
    case 'sick': return <HeartPulse className="w-4 h-4" />
    case 'personal': return <Coffee className="w-4 h-4" />
    case 'holiday': return <Star className="w-4 h-4" />
    case 'remote': return <Home className="w-4 h-4" />
    default: return <Calendar className="w-4 h-4" />
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getUtilizationColor = (utilization: number): string => {
  if (utilization >= 100) return 'text-red-600'
  if (utilization >= 80) return 'text-green-600'
  if (utilization >= 50) return 'text-yellow-600'
  return 'text-gray-600'
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA - Resource Guru Level
// ============================================================================

const mockAllocationAIInsights = [
  { id: '1', type: 'success' as const, title: 'Optimal Balance', description: 'Team allocation at 85% utilization - healthy capacity buffer maintained.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Capacity' },
  { id: '2', type: 'warning' as const, title: 'Overallocation Risk', description: '4 resources are allocated over 100% for next sprint.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Planning' },
  { id: '3', type: 'info' as const, title: 'Skill Match', description: 'New project requires React expertise - 3 available resources identified.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Matching' },
]

const mockAllocationCollaborators = [
  { id: '1', name: 'Resource Manager', avatar: '/avatars/rm.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Project Lead', avatar: '/avatars/pl.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'Capacity Planner', avatar: '/avatars/cp.jpg', status: 'away' as const, role: 'Planner' },
]

const mockAllocationPredictions = [
  { id: '1', title: 'Capacity Forecast', prediction: 'Team will need 2 additional FTEs by Q2 based on pipeline', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Utilization Trend', prediction: 'Billable hours trending 15% higher than last quarter', confidence: 92, trend: 'up' as const, impact: 'medium' as const },
]

const mockAllocationActivities = [
  { id: '1', user: 'Resource Manager', action: 'Allocated', target: 'Sarah Chen to Project Phoenix', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Project Lead', action: 'Requested', target: 'Extension for Mike Johnson', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Flagged', target: 'Conflicting allocations for 2 resources', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning' as const },
]

// Quick actions will be defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Form state type
interface AllocationForm {
  resource_name: string
  resource_role: string
  project_name: string
  allocation_type: string
  status: string
  priority: string
  hours_per_week: number
  allocated_hours: number
  start_date: string
  end_date: string
  billable_rate: number
  notes: string
}

const initialFormState: AllocationForm = {
  resource_name: '',
  resource_role: '',
  project_name: '',
  allocation_type: 'full-time',
  status: 'pending',
  priority: 'medium',
  hours_per_week: 40,
  allocated_hours: 0,
  start_date: '',
  end_date: '',
  billable_rate: 150,
  notes: '',
}

export default function AllocationClient() {
  const supabase = createClient()

  // Supabase hooks
  const { allocations: dbAllocations, stats: dbStats, isLoading, refetch } = useAllocations()
  const {
    createAllocation,
    updateAllocation,
    deleteAllocation,
    activateAllocation,
    completeAllocation,
    cancelAllocation,
    isCreating,
    isUpdating,
    isDeleting
  } = useAllocationMutations()

  const [activeTab, setActiveTab] = useState('allocations')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AllocationStatus | 'all'>('all')
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [formData, setFormData] = useState<AllocationForm>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Quick action dialog states
  const [showCalendarDialog, setShowCalendarDialog] = useState(false)
  const [showCapacityReportDialog, setShowCapacityReportDialog] = useState(false)

  // Additional dialog states for buttons
  const [showAddResourceDialog, setShowAddResourceDialog] = useState(false)
  const [showTeamViewDialog, setShowTeamViewDialog] = useState(false)
  const [showSkillsDialog, setShowSkillsDialog] = useState(false)
  const [showUtilizationDialog, setShowUtilizationDialog] = useState(false)
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false)
  const [showRatesDialog, setShowRatesDialog] = useState(false)
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [showTimelineDialog, setShowTimelineDialog] = useState(false)
  const [showMilestonesDialog, setShowMilestonesDialog] = useState(false)
  const [showDependenciesDialog, setShowDependenciesDialog] = useState(false)
  const [showDeadlinesDialog, setShowDeadlinesDialog] = useState(false)
  const [showBillingReportDialog, setShowBillingReportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showWorkHoursDialog, setShowWorkHoursDialog] = useState(false)
  const [showTargetsDialog, setShowTargetsDialog] = useState(false)
  const [showBillingSettingsDialog, setShowBillingSettingsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showRolesDialog, setShowRolesDialog] = useState(false)
  const [showHolidaysDialog, setShowHolidaysDialog] = useState(false)
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [showIntegrationsDialog, setShowIntegrationsDialog] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState('February 2024')

  // Additional dialog states for previously toast-only buttons
  const [showAssignResourceDialog, setShowAssignResourceDialog] = useState(false)
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false)
  const [showApproveAllocationsDialog, setShowApproveAllocationsDialog] = useState(false)
  const [showTransferAllocationDialog, setShowTransferAllocationDialog] = useState(false)
  const [showCapacityTrendsDialog, setShowCapacityTrendsDialog] = useState(false)
  const [showHiringPlanDialog, setShowHiringPlanDialog] = useState(false)
  const [showWorkloadBalanceDialog, setShowWorkloadBalanceDialog] = useState(false)
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false)
  const [showTrendsReportDialog, setShowTrendsReportDialog] = useState(false)

  // Form states for new dialogs
  const [timeEntryData, setTimeEntryData] = useState({
    resource: '',
    project: '',
    hours: 0,
    date: '',
    description: ''
  })

  const [transferData, setTransferData] = useState({
    allocation: '',
    fromProject: '',
    toProject: '',
    hours: 0
  })

  // Quick actions with proper dialog handlers
  const allocationQuickActions = [
    { id: '1', label: 'New Allocation', icon: 'plus', action: () => { setFormData(initialFormState); setShowCreateDialog(true) }, variant: 'default' as const },
    { id: '2', label: 'View Calendar', icon: 'calendar', action: () => setShowCalendarDialog(true), variant: 'default' as const },
    { id: '3', label: 'Capacity Report', icon: 'chart', action: () => setShowCapacityReportDialog(true), variant: 'outline' as const },
  ]

  // Filtered data
  const filteredAllocations = useMemo(() => {
    return mockAllocations.filter(allocation => {
      const matchesSearch =
        allocation.resource_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allocation.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        allocation.project_code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const activeAllocations = mockAllocations.filter(a => a.status === 'active').length
    const totalHours = mockAllocations.reduce((acc, a) => acc + a.hours_per_week, 0)
    const totalBillable = mockAllocations.reduce((acc, a) => acc + (a.hours_per_week * a.billable_rate), 0)
    const avgUtilization = mockResources.reduce((acc, r) => acc + r.utilization, 0) / mockResources.length
    const availableResources = mockResources.filter(r => r.status === 'available').length
    const overAllocated = mockResources.filter(r => r.utilization > 100).length
    const pendingRequests = mockAllocations.filter(a => a.status === 'pending').length
    const activeProjects = mockProjects.filter(p => p.status === 'active').length

    return {
      activeAllocations,
      totalHours,
      totalBillable,
      avgUtilization,
      availableResources,
      totalResources: mockResources.length,
      overAllocated,
      pendingRequests,
      activeProjects
    }
  }, [])

  // CRUD Handlers
  const handleCreateAllocation = async () => {
    if (!formData.resource_name || !formData.project_name) {
      toast.error('Validation Error', { description: 'Resource and Project names are required' })
      return
    }
    try {
      await createAllocation({
        resource_name: formData.resource_name,
        resource_role: formData.resource_role,
        project_name: formData.project_name,
        allocation_type: formData.allocation_type,
        status: formData.status,
        priority: formData.priority,
        hours_per_week: formData.hours_per_week,
        allocated_hours: formData.allocated_hours,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        billable_rate: formData.billable_rate,
        notes: formData.notes,
      })
      toast.success('Allocation Created', { description: `${formData.resource_name} allocated to ${formData.project_name}` })
      setShowCreateDialog(false)
      setFormData(initialFormState)
      refetch()
    } catch (error: any) {
      toast.error('Failed to create allocation', { description: error.message })
    }
  }

  const handleUpdateAllocation = async () => {
    if (!editingId) return
    try {
      await updateAllocation({
        id: editingId,
        updates: {
          resource_name: formData.resource_name,
          resource_role: formData.resource_role,
          project_name: formData.project_name,
          allocation_type: formData.allocation_type,
          status: formData.status,
          priority: formData.priority,
          hours_per_week: formData.hours_per_week,
          allocated_hours: formData.allocated_hours,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          billable_rate: formData.billable_rate,
          notes: formData.notes,
        }
      })
      toast.success('Allocation Updated', { description: 'Changes saved successfully' })
      setShowEditDialog(false)
      setSelectedAllocation(null)
      setEditingId(null)
      setFormData(initialFormState)
      refetch()
    } catch (error: any) {
      toast.error('Failed to update allocation', { description: error.message })
    }
  }

  const handleDeleteAllocation = async (id: string, resourceName: string) => {
    try {
      await deleteAllocation(id)
      toast.success('Allocation Deleted', { description: `${resourceName}'s allocation removed` })
      setSelectedAllocation(null)
      refetch()
    } catch (error: any) {
      toast.error('Failed to delete allocation', { description: error.message })
    }
  }

  const handleApproveAllocation = async (id: string, resourceName: string) => {
    try {
      await activateAllocation(id)
      toast.success('Allocation Approved', { description: `${resourceName}'s allocation is now active` })
      refetch()
    } catch (error: any) {
      toast.error('Failed to approve allocation', { description: error.message })
    }
  }

  const handleCompleteAllocation = async (id: string, resourceName: string) => {
    try {
      await completeAllocation(id)
      toast.success('Allocation Completed', { description: `${resourceName}'s allocation marked complete` })
      refetch()
    } catch (error: any) {
      toast.error('Failed to complete allocation', { description: error.message })
    }
  }

  const handleCancelAllocation = async (id: string, resourceName: string) => {
    try {
      await cancelAllocation(id)
      toast.info('Allocation Cancelled', { description: `${resourceName}'s allocation was cancelled` })
      refetch()
    } catch (error: any) {
      toast.error('Failed to cancel allocation', { description: error.message })
    }
  }

  const openEditDialog = (allocation: Allocation) => {
    setFormData({
      resource_name: allocation.resource_name,
      resource_role: allocation.resource_role,
      project_name: allocation.project_name,
      allocation_type: allocation.allocation_type,
      status: allocation.status,
      priority: allocation.priority,
      hours_per_week: allocation.hours_per_week,
      allocated_hours: 0,
      start_date: allocation.start_date,
      end_date: allocation.end_date,
      billable_rate: allocation.billable_rate,
      notes: allocation.notes,
    })
    setEditingId(allocation.id)
    setShowEditDialog(true)
  }

  const handleExportAllocations = () => {
    toast.success('Exporting allocations', { description: 'Allocation report will be downloaded' })
  }

  const handleRefresh = async () => {
    toast.info('Refreshing...', { description: 'Fetching latest data' })
    await refetch()
    toast.success('Refreshed', { description: 'Data updated successfully' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-purple-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Allocation</h1>
              <p className="text-gray-500 dark:text-gray-400">Resource Guru level resource management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white"
              onClick={() => { setFormData(initialFormState); setShowCreateDialog(true) }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Allocation
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Allocations', value: stats.activeAllocations.toString(), icon: UserCheck, color: 'from-fuchsia-500 to-purple-500', change: 8.5 },
            { label: 'Total Hours/Week', value: `${stats.totalHours}h`, icon: Clock, color: 'from-blue-500 to-cyan-500', change: 12.3 },
            { label: 'Weekly Revenue', value: formatCurrency(stats.totalBillable), icon: DollarSign, color: 'from-green-500 to-emerald-500', change: 15.2 },
            { label: 'Avg Utilization', value: `${stats.avgUtilization.toFixed(0)}%`, icon: Percent, color: 'from-orange-500 to-amber-500', change: 3.4 },
            { label: 'Available', value: `${stats.availableResources}/${stats.totalResources}`, icon: Users, color: 'from-teal-500 to-cyan-500', change: 0 },
            { label: 'Over-Allocated', value: stats.overAllocated.toString(), icon: AlertTriangle, color: 'from-red-500 to-rose-500', change: -2.1 },
            { label: 'Pending', value: stats.pendingRequests.toString(), icon: Clock, color: 'from-yellow-500 to-orange-500', change: 5.0 },
            { label: 'Active Projects', value: stats.activeProjects.toString(), icon: Briefcase, color: 'from-purple-500 to-violet-500', change: 0 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="allocations" className="flex items-center gap-2">
              <CalendarRange className="w-4 h-4" />
              Allocations
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="capacity" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Capacity
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Allocations Tab */}
          <TabsContent value="allocations" className="mt-6">
            {/* Allocations Banner */}
            <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Resource Allocations</h2>
                  <p className="text-fuchsia-100">Resource Guru-level allocation management with real-time tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAllocations.length}</p>
                    <p className="text-fuchsia-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAllocations.filter(a => a.status === 'active').length}</p>
                    <p className="text-fuchsia-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAllocations.filter(a => a.status === 'pending').length}</p>
                    <p className="text-fuchsia-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allocations Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Allocation', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => { setFormData(initialFormState); setShowCreateDialog(true) } },
                { icon: UserCheck, label: 'Assign', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowAssignResourceDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('schedule') },
                { icon: Clock, label: 'Time Entry', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowTimeEntryDialog(true) },
                { icon: CheckCircle, label: 'Approve', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowApproveAllocationsDialog(true) },
                { icon: GitBranch, label: 'Transfer', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowTransferAllocationDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setActiveTab('reports') },
                { icon: Settings, label: 'Settings', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('settings') },
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

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>All Allocations</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search allocations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'active', 'pending', 'completed'] as const).map(status => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-fuchsia-600' : ''}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredAllocations.map(allocation => (
                    <div
                      key={allocation.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedAllocation(allocation)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={allocation.resource_avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white text-sm">
                            {allocation.resource_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {allocation.resource_name}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="font-medium" style={{ color: allocation.project_color }}>
                              {allocation.project_name}
                            </span>
                            <Badge className={getStatusColor(allocation.status)}>
                              {allocation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            {allocation.resource_role} • {allocation.allocation_type}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {allocation.hours_per_week}h/week
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {allocation.start_date} to {allocation.end_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(allocation.billable_rate)}/hr
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getPriorityColor(allocation.priority)}>
                            {allocation.priority}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-2">
                            {allocation.project_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="mt-6">
            {/* Resources Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Team Resources</h2>
                  <p className="text-blue-100">Manage team capacity, skills, and availability</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockResources.length}</p>
                    <p className="text-blue-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockResources.filter(r => r.status === 'available').length}</p>
                    <p className="text-blue-200 text-sm">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(mockResources.reduce((acc, r) => acc + r.utilization, 0) / mockResources.length).toFixed(0)}%</p>
                    <p className="text-blue-200 text-sm">Avg Util</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Resource', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowAddResourceDialog(true) },
                { icon: Users, label: 'Team View', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowTeamViewDialog(true) },
                { icon: Star, label: 'Skills', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowSkillsDialog(true) },
                { icon: BarChart3, label: 'Utilization', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowUtilizationDialog(true) },
                { icon: Plane, label: 'Time Off', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowTimeOffDialog(true) },
                { icon: DollarSign, label: 'Rates', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowRatesDialog(true) },
                { icon: Eye, label: 'Availability', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowAvailabilityDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setActiveTab('settings') },
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
              {mockResources.map(resource => (
                <Card
                  key={resource.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={resource.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
                          {resource.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{resource.name}</h3>
                        <p className="text-sm text-gray-500">{resource.role}</p>
                        <Badge className={`mt-1 ${getResourceStatusColor(resource.status)}`}>
                          {resource.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Utilization</span>
                        <span className={`font-semibold ${getUtilizationColor(resource.utilization)}`}>
                          {resource.utilization}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(resource.utilization, 100)}
                        className="h-2"
                      />

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Allocated</p>
                          <p className="font-semibold">{resource.allocated_hours}h/week</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="font-semibold">{resource.capacity_hours}h/week</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bill Rate</p>
                          <p className="font-semibold">${resource.hourly_rate}/hr</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Cost Rate</p>
                          <p className="font-semibold">${resource.cost_rate}/hr</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {resource.skills.slice(0, 3).map(skill => (
                            <Badge key={skill.name} variant="outline" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Capacity Tab */}
          <TabsContent value="capacity" className="mt-6">
            {/* Capacity Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Capacity Planning</h2>
                  <p className="text-orange-100">Forecast-level capacity management and workload balancing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockResources.reduce((acc, r) => acc + r.capacity_hours, 0)}h</p>
                    <p className="text-orange-200 text-sm">Total Capacity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockResources.reduce((acc, r) => acc + r.allocated_hours, 0)}h</p>
                    <p className="text-orange-200 text-sm">Allocated</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.max(0, mockResources.reduce((acc, r) => acc + (r.capacity_hours - r.allocated_hours), 0))}h</p>
                    <p className="text-orange-200 text-sm">Available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Forecast', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowCapacityReportDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowCapacityTrendsDialog(true) },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowAlertsDialog(true) },
                { icon: Users, label: 'Hiring', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowHiringPlanDialog(true) },
                { icon: Layers, label: 'Balance', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowWorkloadBalanceDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('schedule') },
                { icon: RefreshCw, label: 'Optimize', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowOptimizeDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('settings') },
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
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Team Capacity Overview</CardTitle>
                  <CardDescription>Weekly capacity and allocation forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockResources.map(resource => (
                      <div key={resource.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
                                {resource.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getUtilizationColor(resource.utilization)}`}>
                              {resource.utilization}%
                            </p>
                            <p className="text-xs text-gray-500">
                              {resource.allocated_hours}/{resource.capacity_hours}h
                            </p>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(resource.utilization, 100)}
                          className={`h-3 ${resource.utilization > 100 ? 'bg-red-100' : ''}`}
                        />
                        {resource.utilization > 100 && (
                          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Over-allocated by {resource.allocated_hours - resource.capacity_hours}h
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capacity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Total Capacity</span>
                        <span className="font-bold">{mockResources.reduce((acc, r) => acc + r.capacity_hours, 0)}h/week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Allocated</span>
                        <span className="font-bold">{mockResources.reduce((acc, r) => acc + r.allocated_hours, 0)}h/week</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Available</span>
                        <span className="font-bold text-green-600">
                          {Math.max(0, mockResources.reduce((acc, r) => acc + (r.capacity_hours - r.allocated_hours), 0))}h/week
                        </span>
                      </div>
                      <Progress
                        value={(mockResources.reduce((acc, r) => acc + r.allocated_hours, 0) / mockResources.reduce((acc, r) => acc + r.capacity_hours, 0)) * 100}
                        className="h-3"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Time Off</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTimeOff.slice(0, 4).map(timeOff => (
                        <div key={timeOff.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            timeOff.type === 'vacation' ? 'bg-blue-100 text-blue-600' :
                            timeOff.type === 'sick' ? 'bg-red-100 text-red-600' :
                            timeOff.type === 'remote' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getTimeOffIcon(timeOff.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{timeOff.resource_name}</p>
                            <p className="text-xs text-gray-500">{timeOff.start_date}</p>
                          </div>
                          <Badge variant={timeOff.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                            {timeOff.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            {/* Schedule Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Schedule</h2>
                  <p className="text-green-100">Gantt-level project timeline and milestone tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.length}</p>
                    <p className="text-green-200 text-sm">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'active').length}</p>
                    <p className="text-green-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.reduce((acc, p) => acc + p.team_size, 0)}</p>
                    <p className="text-green-200 text-sm">Team Size</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Project', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowNewProjectDialog(true) },
                { icon: Calendar, label: 'Timeline', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowTimelineDialog(true) },
                { icon: Target, label: 'Milestones', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowMilestonesDialog(true) },
                { icon: Briefcase, label: 'Resources', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('resources') },
                { icon: GitBranch, label: 'Dependencies', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => setShowDependenciesDialog(true) },
                { icon: Clock, label: 'Deadlines', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowDeadlinesDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setActiveTab('reports') },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('settings') },
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

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Schedule</CardTitle>
                    <CardDescription>Timeline view of all projects and allocations</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCalendarMonth('January 2024')}>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <span className="text-sm font-medium">{calendarMonth}</span>
                    <Button variant="outline" size="sm" onClick={() => setCalendarMonth('March 2024')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProjects.filter(p => p.status === 'active').map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <div>
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-xs text-gray-500">{project.code} • {project.client_name}</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 text-xs">Team Size</p>
                          <p className="font-semibold">{project.team_size} members</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Hours Used</p>
                          <p className="font-semibold">{project.consumed_hours}/{project.budget_hours}h</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Budget</p>
                          <p className="font-semibold">{formatCurrency(project.spent_amount)}/{formatCurrency(project.budget_amount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Timeline</p>
                          <p className="font-semibold">{project.start_date} - {project.end_date}</p>
                        </div>
                      </div>
                      <Progress
                        value={(project.consumed_hours / project.budget_hours) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            {/* Reports Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analytics & Reports</h2>
                  <p className="text-indigo-100">Tableau-level reporting with real-time insights</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{formatCurrency(stats.totalBillable)}</p>
                    <p className="text-indigo-200 text-sm">Weekly Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.avgUtilization.toFixed(0)}%</p>
                    <p className="text-indigo-200 text-sm">Avg Util</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">42%</p>
                    <p className="text-indigo-200 text-sm">Margin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: PieChart, label: 'Utilization', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowUtilizationDialog(true) },
                { icon: BarChart3, label: 'Revenue', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowCapacityReportDialog(true) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowTrendsReportDialog(true) },
                { icon: Users, label: 'Team', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowTeamViewDialog(true) },
                { icon: Briefcase, label: 'Projects', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('schedule') },
                { icon: DollarSign, label: 'Billing', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowBillingReportDialog(true) },
                { icon: Calendar, label: 'Schedule', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowCalendarDialog(true) },
                { icon: ArrowUpRight, label: 'Export', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowExportDialog(true) },
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Utilization by Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Engineering', 'Design', 'Operations'].map((dept, i) => {
                      const deptResources = mockResources.filter(r => r.department === dept)
                      const avgUtil = deptResources.length > 0
                        ? deptResources.reduce((acc, r) => acc + r.utilization, 0) / deptResources.length
                        : 0
                      return (
                        <div key={dept} className="flex items-center gap-4">
                          <div className="w-24 text-sm font-medium">{dept}</div>
                          <div className="flex-1">
                            <Progress value={avgUtil} className="h-3" />
                          </div>
                          <div className={`w-16 text-right font-semibold ${getUtilizationColor(avgUtil)}`}>
                            {avgUtil.toFixed(0)}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Project Allocation Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockProjects.slice(0, 4).map(project => (
                      <div key={project.id} className="flex items-center gap-4">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="w-32 text-sm font-medium truncate">{project.name}</div>
                        <div className="flex-1">
                          <Progress
                            value={(project.allocated_hours / project.budget_hours) * 100}
                            className="h-3"
                          />
                        </div>
                        <div className="w-20 text-right text-sm">
                          {project.allocated_hours}/{project.budget_hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Weekly Billable</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBillable)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Monthly Projection</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.totalBillable * 4)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Avg Bill Rate</p>
                      <p className="text-2xl font-bold">{formatCurrency(mockResources.reduce((acc, r) => acc + r.hourly_rate, 0) / mockResources.length)}/hr</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Gross Margin</p>
                      <p className="text-2xl font-bold text-green-600">42%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockResources
                      .sort((a, b) => b.utilization - a.utilization)
                      .slice(0, 5)
                      .map((resource, i) => (
                        <div key={resource.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {resource.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{resource.name}</p>
                            <p className="text-xs text-gray-500">{resource.role}</p>
                          </div>
                          <span className={`font-semibold ${getUtilizationColor(resource.utilization)}`}>
                            {resource.utilization}%
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Settings & Configuration</h2>
                  <p className="text-slate-100">Customize allocation rules, rates, and notifications</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">40h</p>
                    <p className="text-slate-200 text-sm">Work Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">80%</p>
                    <p className="text-slate-200 text-sm">Target Util</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">$150</p>
                    <p className="text-slate-200 text-sm">Default Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Clock, label: 'Work Hours', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => setShowWorkHoursDialog(true) },
                { icon: Target, label: 'Targets', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', onClick: () => setShowTargetsDialog(true) },
                { icon: DollarSign, label: 'Billing', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400', onClick: () => setShowBillingSettingsDialog(true) },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400', onClick: () => setShowAlertsDialog(true) },
                { icon: Users, label: 'Roles', color: 'bg-stone-100 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400', onClick: () => setShowRolesDialog(true) },
                { icon: Calendar, label: 'Holidays', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowHolidaysDialog(true) },
                { icon: RefreshCw, label: 'Sync', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowSyncDialog(true) },
                { icon: Zap, label: 'Integrations', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowIntegrationsDialog(true) },
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Working Hours
                  </CardTitle>
                  <CardDescription>Default working hours configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Standard Work Week</p>
                        <p className="text-sm text-gray-500">Default hours per week</p>
                      </div>
                      <Input type="number" defaultValue={40} className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Work Day Start</p>
                        <p className="text-sm text-gray-500">Default start time</p>
                      </div>
                      <Input type="time" defaultValue="09:00" className="w-32" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Work Day End</p>
                        <p className="text-sm text-gray-500">Default end time</p>
                      </div>
                      <Input type="time" defaultValue="18:00" className="w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Utilization Targets
                  </CardTitle>
                  <CardDescription>Team utilization thresholds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Target Utilization</p>
                        <p className="text-sm text-gray-500">Optimal utilization rate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={80} className="w-20 text-center" />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Over-allocation Warning</p>
                        <p className="text-sm text-gray-500">Threshold for alerts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={100} className="w-20 text-center" />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Under-utilization Warning</p>
                        <p className="text-sm text-gray-500">Low utilization threshold</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={50} className="w-20 text-center" />
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Billing Defaults
                  </CardTitle>
                  <CardDescription>Default rates and billing settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Default Bill Rate</p>
                        <p className="text-sm text-gray-500">Standard hourly rate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <Input type="number" defaultValue={150} className="w-24 text-center" />
                        <span className="text-gray-500">/hr</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Overtime Multiplier</p>
                        <p className="text-sm text-gray-500">Rate multiplier for overtime</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue={1.5} step={0.1} className="w-20 text-center" />
                        <span className="text-gray-500">x</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Alert and notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Over-allocation Alerts</p>
                        <p className="text-sm text-gray-500">Notify when resources are over-booked</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { /* TODO: Toggle over-allocation alerts */ }}>Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pending Approvals</p>
                        <p className="text-sm text-gray-500">Daily digest of pending requests</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { /* TODO: Toggle pending approvals */ }}>Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Capacity Warnings</p>
                        <p className="text-sm text-gray-500">Alert when capacity runs low</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => { /* TODO: Toggle capacity warnings */ }}>Enabled</Button>
                    </div>
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
              insights={mockAllocationAIInsights}
              title="Allocation Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAllocationCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAllocationPredictions}
              title="Capacity Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAllocationActivities}
            title="Allocation Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={allocationQuickActions}
            variant="grid"
          />
        </div>

        {/* Allocation Detail Dialog */}
        <Dialog open={!!selectedAllocation} onOpenChange={() => setSelectedAllocation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <CalendarRange className="w-5 h-5" />
                Allocation Details
              </DialogTitle>
              <DialogDescription>
                {selectedAllocation?.project_name} • {selectedAllocation?.project_code}
              </DialogDescription>
            </DialogHeader>
            {selectedAllocation && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white">
                        {selectedAllocation.resource_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedAllocation.resource_name}</h3>
                      <p className="text-gray-500">{selectedAllocation.resource_role}</p>
                    </div>
                    <Badge className={`ml-auto ${getStatusColor(selectedAllocation.status)}`}>
                      {selectedAllocation.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Hours/Week</p>
                      <p className="font-semibold">{selectedAllocation.hours_per_week}h</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Bill Rate</p>
                      <p className="font-semibold">${selectedAllocation.billable_rate}/hr</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="font-semibold">{selectedAllocation.start_date}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">End Date</p>
                      <p className="font-semibold">{selectedAllocation.end_date}</p>
                    </div>
                  </div>

                  {selectedAllocation.notes && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Notes</p>
                      <p className="text-sm">{selectedAllocation.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        openEditDialog(selectedAllocation)
                        setSelectedAllocation(null)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                      disabled={isDeleting}
                      onClick={() => handleDeleteAllocation(selectedAllocation.id, selectedAllocation.resource_name)}
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Delete
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Allocation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Allocation</DialogTitle>
              <DialogDescription>Assign a resource to a project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resource_name">Resource Name *</Label>
                  <Input
                    id="resource_name"
                    value={formData.resource_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource_role">Role</Label>
                  <Input
                    id="resource_role"
                    value={formData.resource_role}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_role: e.target.value }))}
                    placeholder="Senior Developer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  placeholder="Platform Redesign"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Allocation Type</Label>
                  <Select
                    value={formData.allocation_type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, allocation_type: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours_per_week">Hours/Week</Label>
                  <Input
                    id="hours_per_week"
                    type="number"
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billable_rate">Bill Rate ($/hr)</Label>
                  <Input
                    id="billable_rate"
                    type="number"
                    value={formData.billable_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, billable_rate: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Allocation notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAllocation} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Allocation Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Allocation</DialogTitle>
              <DialogDescription>Update allocation details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_resource_name">Resource Name *</Label>
                  <Input
                    id="edit_resource_name"
                    value={formData.resource_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_resource_role">Role</Label>
                  <Input
                    id="edit_resource_role"
                    value={formData.resource_role}
                    onChange={(e) => setFormData(prev => ({ ...prev, resource_role: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_project_name">Project Name *</Label>
                <Input
                  id="edit_project_name"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_hours">Hours/Week</Label>
                  <Input
                    id="edit_hours"
                    type="number"
                    value={formData.hours_per_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours_per_week: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_rate">Bill Rate ($/hr)</Label>
                  <Input
                    id="edit_rate"
                    type="number"
                    value={formData.billable_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, billable_rate: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_start">Start Date</Label>
                  <Input
                    id="edit_start"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_end">End Date</Label>
                  <Input
                    id="edit_end"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingId(null) }}>Cancel</Button>
              <Button onClick={handleUpdateAllocation} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resource Detail Dialog */}
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Resource Profile
              </DialogTitle>
            </DialogHeader>
            {selectedResource && (
              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white text-xl">
                        {selectedResource.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-xl">{selectedResource.name}</h3>
                      <p className="text-gray-500">{selectedResource.role}</p>
                      <p className="text-sm text-gray-400">{selectedResource.department}</p>
                    </div>
                    <Badge className={`ml-auto ${getResourceStatusColor(selectedResource.status)}`}>
                      {selectedResource.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedResource.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedResource.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedResource.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-gray-400" />
                      {selectedResource.department}
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Utilization</span>
                      <span className={`font-bold ${getUtilizationColor(selectedResource.utilization)}`}>
                        {selectedResource.utilization}%
                      </span>
                    </div>
                    <Progress value={Math.min(selectedResource.utilization, 100)} className="h-3" />
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedResource.allocated_hours}h allocated of {selectedResource.capacity_hours}h capacity
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-3">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedResource.skills.map(skill => (
                        <Badge key={skill.name} className={getSkillLevelColor(skill.level)}>
                          {skill.name} • {skill.level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => { setSelectedResource(null); setActiveTab('allocations'); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Allocations
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white" onClick={() => { setSelectedResource(null); setFormData(prev => ({ ...prev, resource_name: selectedResource.name, resource_role: selectedResource.role })); setShowCreateDialog(true) }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Allocation
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Calendar View Dialog */}
        <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                Allocation Calendar
              </DialogTitle>
              <DialogDescription>
                View resource allocations across your projects
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">{calendarMonth}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCalendarMonth('January 2024')}>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCalendarMonth('March 2024')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {mockAllocations.filter(a => a.status === 'active').slice(0, 4).map(allocation => (
                    <div key={allocation.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: allocation.project_color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{allocation.resource_name}</p>
                        <p className="text-xs text-gray-500">{allocation.project_name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {allocation.hours_per_week}h/week
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCalendarDialog(false)}>Close</Button>
              <Button onClick={() => { setShowCalendarDialog(false); setActiveTab('schedule') }}>
                <Calendar className="w-4 h-4 mr-2" />
                Open Full Calendar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Capacity Report Dialog */}
        <Dialog open={showCapacityReportDialog} onOpenChange={setShowCapacityReportDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                Capacity Report
              </DialogTitle>
              <DialogDescription>
                Team capacity and utilization overview
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{mockResources.reduce((acc, r) => acc + r.capacity_hours, 0)}h</p>
                  <p className="text-sm text-gray-500">Total Capacity</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{mockResources.reduce((acc, r) => acc + r.allocated_hours, 0)}h</p>
                  <p className="text-sm text-gray-500">Allocated</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(0, mockResources.reduce((acc, r) => acc + (r.capacity_hours - r.allocated_hours), 0))}h
                  </p>
                  <p className="text-sm text-gray-500">Available</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Resource Utilization</h4>
                {mockResources.map(resource => (
                  <div key={resource.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm truncate">{resource.name}</div>
                    <div className="flex-1">
                      <Progress value={Math.min(resource.utilization, 100)} className="h-2" />
                    </div>
                    <div className={`w-16 text-right text-sm font-medium ${getUtilizationColor(resource.utilization)}`}>
                      {resource.utilization}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCapacityReportDialog(false)}>Close</Button>
              <Button onClick={() => { setShowCapacityReportDialog(false); setActiveTab('capacity') }}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Resource Dialog */}
        <Dialog open={showAddResourceDialog} onOpenChange={setShowAddResourceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Add New Resource
              </DialogTitle>
              <DialogDescription>
                Add a team member to your resource pool
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input placeholder="Senior Developer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select defaultValue="engineering">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hourly Rate ($)</Label>
                  <Input type="number" defaultValue={150} />
                </div>
                <div className="space-y-2">
                  <Label>Capacity (hrs/week)</Label>
                  <Input type="number" defaultValue={40} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddResourceDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAddResourceDialog(false); /* TODO: Implement add resource functionality */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team View Dialog */}
        <Dialog open={showTeamViewDialog} onOpenChange={setShowTeamViewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Team Overview
              </DialogTitle>
              <DialogDescription>
                View your entire team at a glance
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{mockResources.length}</p>
                  <p className="text-sm text-gray-500">Total Resources</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{mockResources.filter(r => r.status === 'available').length}</p>
                  <p className="text-sm text-gray-500">Available</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{mockResources.filter(r => r.utilization > 100).length}</p>
                  <p className="text-sm text-gray-500">Over-allocated</p>
                </div>
              </div>
              <div className="space-y-3">
                {mockResources.map(resource => (
                  <div key={resource.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white text-sm">
                        {resource.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-xs text-gray-500">{resource.role} - {resource.department}</p>
                    </div>
                    <Badge className={getResourceStatusColor(resource.status)}>
                      {resource.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTeamViewDialog(false)}>Close</Button>
              <Button onClick={() => { setShowTeamViewDialog(false); setActiveTab('resources') }}>
                <Users className="w-4 h-4 mr-2" />
                View All Resources
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Skills Dialog */}
        <Dialog open={showSkillsDialog} onOpenChange={setShowSkillsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                Team Skills Matrix
              </DialogTitle>
              <DialogDescription>
                Overview of skills across your team
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                {mockResources.map(resource => (
                  <div key={resource.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resource.skills.map(skill => (
                        <Badge key={skill.name} className={getSkillLevelColor(skill.level)}>
                          {skill.name} - {skill.level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSkillsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Utilization Dialog */}
        <Dialog open={showUtilizationDialog} onOpenChange={setShowUtilizationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                Utilization Report
              </DialogTitle>
              <DialogDescription>
                Team utilization breakdown
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                {mockResources.map(resource => (
                  <div key={resource.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm truncate">{resource.name}</div>
                    <div className="flex-1">
                      <Progress value={Math.min(resource.utilization, 100)} className="h-3" />
                    </div>
                    <div className={`w-16 text-right font-semibold ${getUtilizationColor(resource.utilization)}`}>
                      {resource.utilization}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUtilizationDialog(false)}>Close</Button>
              <Button onClick={() => { setShowUtilizationDialog(false); setActiveTab('reports') }}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Full Reports
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Off Dialog */}
        <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Plane className="w-5 h-5" />
                Time Off Schedule
              </DialogTitle>
              <DialogDescription>
                Upcoming team time off and leave
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockTimeOff.map(timeOff => (
                  <div key={timeOff.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      timeOff.type === 'vacation' ? 'bg-blue-100 text-blue-600' :
                      timeOff.type === 'sick' ? 'bg-red-100 text-red-600' :
                      timeOff.type === 'remote' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getTimeOffIcon(timeOff.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{timeOff.resource_name}</p>
                      <p className="text-xs text-gray-500">{timeOff.start_date} to {timeOff.end_date} ({timeOff.hours}h)</p>
                    </div>
                    <Badge variant={timeOff.status === 'approved' ? 'default' : 'secondary'}>
                      {timeOff.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTimeOffDialog(false)}>Close</Button>
              <Button onClick={() => { setShowTimeOffDialog(false); /* TODO: Implement time off request functionality */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Request Time Off
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rates Dialog */}
        <Dialog open={showRatesDialog} onOpenChange={setShowRatesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                Billing Rates
              </DialogTitle>
              <DialogDescription>
                Team billing and cost rates
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockResources.map(resource => (
                  <div key={resource.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm">{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-xs text-gray-500">{resource.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${resource.hourly_rate}/hr</p>
                      <p className="text-xs text-gray-500">Cost: ${resource.cost_rate}/hr</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRatesDialog(false)}>Close</Button>
              <Button onClick={() => { setShowRatesDialog(false); /* TODO: Implement rate editor functionality */ }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Rates
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Availability Dialog */}
        <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                Resource Availability
              </DialogTitle>
              <DialogDescription>
                View who is available for new assignments
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockResources.map(resource => (
                  <div key={resource.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm">{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-xs text-gray-500">{resource.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{resource.capacity_hours - resource.allocated_hours}h available</p>
                      <p className="text-xs text-gray-500">{resource.allocated_hours}/{resource.capacity_hours}h allocated</p>
                    </div>
                    <Badge className={getResourceStatusColor(resource.status)}>
                      {resource.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Create New Project
              </DialogTitle>
              <DialogDescription>
                Add a new project to the schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input placeholder="Platform Redesign" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Code</Label>
                  <Input placeholder="PLAT-001" />
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input placeholder="Client Name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Hours</Label>
                  <Input type="number" defaultValue={1000} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowNewProjectDialog(false); /* TODO: Implement create project functionality */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Timeline Dialog */}
        <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                Project Timeline
              </DialogTitle>
              <DialogDescription>
                Gantt-style view of project schedules
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                {mockProjects.map(project => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <p className="font-medium">{project.name}</p>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{project.start_date} - {project.end_date}</span>
                      <span>{project.consumed_hours}/{project.budget_hours}h</span>
                    </div>
                    <Progress value={(project.consumed_hours / project.budget_hours) * 100} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>Close</Button>
              <Button onClick={() => { setShowTimelineDialog(false); setActiveTab('schedule') }}>
                <Calendar className="w-4 h-4 mr-2" />
                View Full Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Milestones Dialog */}
        <Dialog open={showMilestonesDialog} onOpenChange={setShowMilestonesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                Project Milestones
              </DialogTitle>
              <DialogDescription>
                Key milestones and deliverables
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                {mockProjects.filter(p => p.status === 'active').map(project => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <p className="font-medium">{project.name}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Phase 1 Complete</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span>Phase 2 In Progress - Due {project.end_date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMilestonesDialog(false)}>Close</Button>
              <Button onClick={() => { setShowMilestonesDialog(false); /* TODO: Implement add milestone functionality */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dependencies Dialog */}
        <Dialog open={showDependenciesDialog} onOpenChange={setShowDependenciesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <GitBranch className="w-5 h-5" />
                Project Dependencies
              </DialogTitle>
              <DialogDescription>
                View and manage project dependencies
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                {mockProjects.filter(p => p.status === 'active').slice(0, 3).map((project, i, arr) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                      <p className="font-medium">{project.name}</p>
                      {i < arr.length - 1 && (
                        <span className="text-gray-400">depends on</span>
                      )}
                      {i < arr.length - 1 && arr[i + 1] && (
                        <>
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: arr[i + 1].color }} />
                          <p className="font-medium">{arr[i + 1].name}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDependenciesDialog(false)}>Close</Button>
              <Button onClick={() => { setShowDependenciesDialog(false); /* TODO: Implement add dependency functionality */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Dependency
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deadlines Dialog */}
        <Dialog open={showDeadlinesDialog} onOpenChange={setShowDeadlinesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                Upcoming Deadlines
              </DialogTitle>
              <DialogDescription>
                Important dates and deadlines
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockProjects.filter(p => p.status === 'active').map(project => (
                  <div key={project.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <div className="flex-1">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{project.end_date}</p>
                      <p className="text-xs text-gray-500">End Date</p>
                    </div>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeadlinesDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Billing Report Dialog */}
        <Dialog open={showBillingReportDialog} onOpenChange={setShowBillingReportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                Billing Report
              </DialogTitle>
              <DialogDescription>
                Revenue and billing summary
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBillable)}</p>
                  <p className="text-sm text-gray-500">Weekly Billable</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalBillable * 4)}</p>
                  <p className="text-sm text-gray-500">Monthly Projection</p>
                </div>
              </div>
              <div className="space-y-3">
                {mockProjects.filter(p => p.status === 'active').map(project => (
                  <div key={project.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <div className="flex-1">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.client_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(project.spent_amount)}</p>
                      <p className="text-xs text-gray-500">of {formatCurrency(project.budget_amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBillingReportDialog(false)}>Close</Button>
              <Button onClick={() => { setShowBillingReportDialog(false); setActiveTab('reports') }}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Full Reports
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <ArrowUpRight className="w-5 h-5" />
                Export Data
              </DialogTitle>
              <DialogDescription>
                Choose export format and data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data to Export</Label>
                <Select defaultValue="allocations">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allocations">Allocations</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="utilization">Utilization Report</SelectItem>
                    <SelectItem value="all">All Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowExportDialog(false); /* TODO: Implement export functionality */ }}>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Work Hours Dialog */}
        <Dialog open={showWorkHoursDialog} onOpenChange={setShowWorkHoursDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                Work Hours Settings
              </DialogTitle>
              <DialogDescription>
                Configure default working hours
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Standard Work Week</p>
                  <p className="text-sm text-gray-500">Hours per week</p>
                </div>
                <Input type="number" defaultValue={40} className="w-20 text-center" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Work Day Start</p>
                  <p className="text-sm text-gray-500">Default start time</p>
                </div>
                <Input type="time" defaultValue="09:00" className="w-32" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Work Day End</p>
                  <p className="text-sm text-gray-500">Default end time</p>
                </div>
                <Input type="time" defaultValue="18:00" className="w-32" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWorkHoursDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowWorkHoursDialog(false); /* TODO: Implement save work hours settings functionality */ }}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Targets Dialog */}
        <Dialog open={showTargetsDialog} onOpenChange={setShowTargetsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                Utilization Targets
              </DialogTitle>
              <DialogDescription>
                Set team utilization thresholds
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Target Utilization</p>
                  <p className="text-sm text-gray-500">Optimal rate</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={80} className="w-20 text-center" />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Over-allocation Warning</p>
                  <p className="text-sm text-gray-500">Alert threshold</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={100} className="w-20 text-center" />
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTargetsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowTargetsDialog(false); /* TODO: Implement save utilization targets functionality */ }}>
                Save Targets
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Billing Settings Dialog */}
        <Dialog open={showBillingSettingsDialog} onOpenChange={setShowBillingSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                Billing Settings
              </DialogTitle>
              <DialogDescription>
                Configure billing defaults
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Bill Rate</p>
                  <p className="text-sm text-gray-500">Standard hourly rate</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <Input type="number" defaultValue={150} className="w-24 text-center" />
                  <span className="text-gray-500">/hr</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Overtime Multiplier</p>
                  <p className="text-sm text-gray-500">Rate for overtime</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={1.5} step={0.1} className="w-20 text-center" />
                  <span className="text-gray-500">x</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBillingSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowBillingSettingsDialog(false); /* TODO: Implement save billing settings functionality */ }}>
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                Alert Settings
              </DialogTitle>
              <DialogDescription>
                Configure notification preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Over-allocation Alerts</p>
                  <p className="text-sm text-gray-500">When resources are over-booked</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { /* TODO: Toggle alert */ }}>Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pending Approvals</p>
                  <p className="text-sm text-gray-500">Daily digest</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { /* TODO: Toggle alert */ }}>Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Capacity Warnings</p>
                  <p className="text-sm text-gray-500">Low capacity alerts</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => { /* TODO: Toggle alert */ }}>Enabled</Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Roles Dialog */}
        <Dialog open={showRolesDialog} onOpenChange={setShowRolesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Role Management
              </DialogTitle>
              <DialogDescription>
                Manage team roles and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {['Senior Developer', 'Engineering Manager', 'UX Designer', 'Backend Developer', 'DevOps Engineer'].map(role => (
                  <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{role}</span>
                    <Button variant="ghost" size="sm" onClick={() => { /* TODO: Edit role */ }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRolesDialog(false)}>Close</Button>
              <Button onClick={() => { /* TODO: Open role creator */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Holidays Dialog */}
        <Dialog open={showHolidaysDialog} onOpenChange={setShowHolidaysDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                Company Holidays
              </DialogTitle>
              <DialogDescription>
                Manage company-wide holidays
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {[
                  { name: "New Year's Day", date: '2024-01-01' },
                  { name: 'Presidents Day', date: '2024-02-19' },
                  { name: 'Memorial Day', date: '2024-05-27' },
                  { name: 'Independence Day', date: '2024-07-04' },
                  { name: 'Labor Day', date: '2024-09-02' }
                ].map(holiday => (
                  <div key={holiday.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-xs text-gray-500">{holiday.date}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { /* TODO: Implement edit holiday functionality */ }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHolidaysDialog(false)}>Close</Button>
              <Button onClick={() => { /* TODO: Implement add holiday functionality */ }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Holiday
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Dialog */}
        <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5" />
                Data Synchronization
              </DialogTitle>
              <DialogDescription>
                Sync with external systems
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Last Sync</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                  <Badge variant="default">Synced</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Auto-sync</p>
                    <p className="text-xs text-gray-500">Every 15 minutes</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { /* TODO: Implement auto-sync toggle functionality */ }}>Enabled</Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSyncDialog(false)}>Close</Button>
              <Button onClick={() => { /* TODO: Implement sync now functionality */ }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integrations Dialog */}
        <Dialog open={showIntegrationsDialog} onOpenChange={setShowIntegrationsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                Integrations
              </DialogTitle>
              <DialogDescription>
                Connect external services
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {[
                  { name: 'Slack', status: 'connected' },
                  { name: 'Jira', status: 'connected' },
                  { name: 'Google Calendar', status: 'disconnected' },
                  { name: 'Microsoft Teams', status: 'disconnected' }
                ].map(integration => (
                  <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{integration.name}</p>
                    </div>
                    <Button
                      variant={integration.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => { /* TODO: Implement integration connect/disconnect functionality */ }}
                    >
                      {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Resource Dialog */}
        <Dialog open={showAssignResourceDialog} onOpenChange={setShowAssignResourceDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <UserCheck className="w-5 h-5" />
                Assign Resource to Project
              </DialogTitle>
              <DialogDescription>
                Quick assignment of team members to projects
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Resource</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose a resource" /></SelectTrigger>
                  <SelectContent>
                    {mockResources.map(resource => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} - {resource.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Project</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choose a project" /></SelectTrigger>
                  <SelectContent>
                    {mockProjects.filter(p => p.status === 'active').map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hours per Week</Label>
                  <Input type="number" defaultValue={40} min={1} max={60} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignResourceDialog(false)}>Cancel</Button>
              <Button onClick={() => { setShowAssignResourceDialog(false); /* TODO: Implement assign resource functionality */ }}>
                <UserCheck className="w-4 h-4 mr-2" />
                Assign Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Entry Dialog */}
        <Dialog open={showTimeEntryDialog} onOpenChange={setShowTimeEntryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                Log Time Entry
              </DialogTitle>
              <DialogDescription>
                Record time worked on a project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Resource</Label>
                <Select
                  value={timeEntryData.resource}
                  onValueChange={(v) => setTimeEntryData(prev => ({ ...prev, resource: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select resource" /></SelectTrigger>
                  <SelectContent>
                    {mockResources.map(resource => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={timeEntryData.project}
                  onValueChange={(v) => setTimeEntryData(prev => ({ ...prev, project: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {mockProjects.filter(p => p.status === 'active').map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    value={timeEntryData.hours}
                    onChange={(e) => setTimeEntryData(prev => ({ ...prev, hours: Number(e.target.value) }))}
                    min={0.5}
                    max={24}
                    step={0.5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={timeEntryData.date}
                    onChange={(e) => setTimeEntryData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What did you work on?"
                  value={timeEntryData.description}
                  onChange={(e) => setTimeEntryData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTimeEntryDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowTimeEntryDialog(false);
                setTimeEntryData({ resource: '', project: '', hours: 0, date: '', description: '' });
                /* TODO: Implement log time entry functionality */
              }}>
                <Clock className="w-4 h-4 mr-2" />
                Log Time
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Allocations Dialog */}
        <Dialog open={showApproveAllocationsDialog} onOpenChange={setShowApproveAllocationsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                Pending Allocation Approvals
              </DialogTitle>
              <DialogDescription>
                Review and approve pending resource allocations
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {mockAllocations.filter(a => a.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>No pending allocations to approve</p>
                  </div>
                ) : (
                  mockAllocations.filter(a => a.status === 'pending').map(allocation => (
                    <div key={allocation.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white text-sm">
                          {allocation.resource_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{allocation.resource_name}</p>
                        <p className="text-sm text-gray-500">{allocation.project_name} - {allocation.hours_per_week}h/week</p>
                        <p className="text-xs text-gray-400">{allocation.start_date} to {allocation.end_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() => { handleCancelAllocation(allocation.id, allocation.resource_name) }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => { handleApproveAllocation(allocation.id, allocation.resource_name) }}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveAllocationsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Allocation Dialog */}
        <Dialog open={showTransferAllocationDialog} onOpenChange={setShowTransferAllocationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <GitBranch className="w-5 h-5" />
                Transfer Allocation
              </DialogTitle>
              <DialogDescription>
                Move an allocation between projects
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Allocation</Label>
                <Select
                  value={transferData.allocation}
                  onValueChange={(v) => {
                    const alloc = mockAllocations.find(a => a.id === v)
                    setTransferData(prev => ({
                      ...prev,
                      allocation: v,
                      fromProject: alloc?.project_name || '',
                      hours: alloc?.hours_per_week || 0
                    }))
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Choose allocation to transfer" /></SelectTrigger>
                  <SelectContent>
                    {mockAllocations.filter(a => a.status === 'active').map(allocation => (
                      <SelectItem key={allocation.id} value={allocation.id}>
                        {allocation.resource_name} - {allocation.project_name} ({allocation.hours_per_week}h/week)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {transferData.fromProject && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Current Project</p>
                  <p className="font-medium">{transferData.fromProject}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Transfer To Project</Label>
                <Select
                  value={transferData.toProject}
                  onValueChange={(v) => setTransferData(prev => ({ ...prev, toProject: v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select destination project" /></SelectTrigger>
                  <SelectContent>
                    {mockProjects.filter(p => p.status === 'active' && p.name !== transferData.fromProject).map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hours to Transfer</Label>
                <Input
                  type="number"
                  value={transferData.hours}
                  onChange={(e) => setTransferData(prev => ({ ...prev, hours: Number(e.target.value) }))}
                  min={1}
                  max={60}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowTransferAllocationDialog(false); setTransferData({ allocation: '', fromProject: '', toProject: '', hours: 0 }) }}>Cancel</Button>
              <Button onClick={() => {
                setShowTransferAllocationDialog(false);
                setTransferData({ allocation: '', fromProject: '', toProject: '', hours: 0 });
                /* TODO: Implement transfer allocation functionality */
              }}>
                <GitBranch className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Capacity Trends Dialog */}
        <Dialog open={showCapacityTrendsDialog} onOpenChange={setShowCapacityTrendsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                Capacity Trends Analysis
              </DialogTitle>
              <DialogDescription>
                Historical capacity and utilization trends
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                  <p className="text-sm text-gray-500">Utilization Growth</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                  <p className="text-sm text-gray-500">Avg Utilization</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">+3</p>
                  <p className="text-sm text-gray-500">Team Growth</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Monthly Trend</h4>
                {['January', 'February', 'March', 'April'].map((month, i) => (
                  <div key={month} className="flex items-center gap-4">
                    <div className="w-24 text-sm">{month}</div>
                    <div className="flex-1">
                      <Progress value={70 + (i * 5)} className="h-3" />
                    </div>
                    <div className="w-16 text-right text-sm font-medium">{70 + (i * 5)}%</div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCapacityTrendsDialog(false)}>Close</Button>
              <Button onClick={() => { setShowCapacityTrendsDialog(false); setActiveTab('reports') }}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hiring Plan Dialog */}
        <Dialog open={showHiringPlanDialog} onOpenChange={setShowHiringPlanDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Hiring Capacity Planner
              </DialogTitle>
              <DialogDescription>
                Plan future hiring based on capacity needs
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Current Gap</p>
                  <p className="text-2xl font-bold text-orange-600">-45h/week</p>
                  <p className="text-xs text-gray-400">Based on upcoming projects</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Recommended Hires</p>
                  <p className="text-2xl font-bold text-blue-600">2 FTEs</p>
                  <p className="text-xs text-gray-400">To meet Q2 demand</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Recommended Roles</h4>
                <div className="space-y-3">
                  {[
                    { role: 'Senior Frontend Developer', urgency: 'high', hours: 40 },
                    { role: 'UX Designer', urgency: 'medium', hours: 30 },
                    { role: 'DevOps Engineer', urgency: 'low', hours: 20 }
                  ].map(rec => (
                    <div key={rec.role} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{rec.role}</p>
                        <p className="text-xs text-gray-500">{rec.hours}h/week needed</p>
                      </div>
                      <Badge className={getPriorityColor(rec.urgency as Priority)}>
                        {rec.urgency}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHiringPlanDialog(false)}>Close</Button>
              <Button onClick={() => { setShowHiringPlanDialog(false); /* TODO: Implement export hiring plan functionality */ }}>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Export Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workload Balance Dialog */}
        <Dialog open={showWorkloadBalanceDialog} onOpenChange={setShowWorkloadBalanceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Layers className="w-5 h-5" />
                Workload Distribution Analysis
              </DialogTitle>
              <DialogDescription>
                Analyze and balance team workloads
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{mockResources.filter(r => r.utilization >= 70 && r.utilization <= 90).length}</p>
                  <p className="text-sm text-gray-500">Optimal (70-90%)</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">{mockResources.filter(r => r.utilization < 70).length}</p>
                  <p className="text-sm text-gray-500">Under-utilized</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{mockResources.filter(r => r.utilization > 100).length}</p>
                  <p className="text-sm text-gray-500">Over-allocated</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Rebalancing Suggestions</h4>
                <div className="space-y-3">
                  {mockResources.filter(r => r.utilization > 100).map(resource => (
                    <div key={resource.id} className="flex items-center gap-4 p-3 border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div className="flex-1">
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-gray-500">Move {resource.allocated_hours - resource.capacity_hours}h to available team members</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { /* TODO: Implement rebalance workload functionality */ }}>
                        Rebalance
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWorkloadBalanceDialog(false)}>Close</Button>
              <Button onClick={() => { setShowWorkloadBalanceDialog(false); /* TODO: Implement auto-balance functionality */ }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-Balance All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Optimize Dialog */}
        <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5" />
                Capacity Optimization
              </DialogTitle>
              <DialogDescription>
                Run optimization algorithms on team allocations
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Smart Allocation</p>
                      <p className="text-sm text-gray-500">AI-powered resource matching</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => { /* TODO: Implement smart allocation analysis */ }}>
                    Run Analysis
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Layers className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Load Balancing</p>
                      <p className="text-sm text-gray-500">Distribute workload evenly</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => { /* TODO: Implement workload balancing */ }}>
                    Balance Workload
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Utilization Optimizer</p>
                      <p className="text-sm text-gray-500">Maximize team efficiency</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => { /* TODO: Implement utilization optimizer */ }}>
                    Optimize
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOptimizeDialog(false)}>Close</Button>
              <Button onClick={() => { setShowOptimizeDialog(false); /* TODO: Implement full optimization functionality */ }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Trends Report Dialog */}
        <Dialog open={showTrendsReportDialog} onOpenChange={setShowTrendsReportDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5" />
                Trends Analysis Report
              </DialogTitle>
              <DialogDescription>
                Performance and allocation trends over time
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-xl font-bold text-green-600">+15%</p>
                  <p className="text-xs text-gray-500">Billable Hours</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-600">+8%</p>
                  <p className="text-xs text-gray-500">Utilization</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-xl font-bold text-purple-600">+22%</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-xl font-bold text-orange-600">-5%</p>
                  <p className="text-xs text-gray-500">Bench Time</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Utilization Trend (Last 6 Months)</h4>
                  <div className="space-y-2">
                    {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month, i) => (
                      <div key={month} className="flex items-center gap-4">
                        <div className="w-12 text-sm text-gray-500">{month}</div>
                        <div className="flex-1">
                          <Progress value={65 + (i * 5)} className="h-2" />
                        </div>
                        <div className="w-12 text-right text-sm">{65 + (i * 5)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Top Performing Projects</h4>
                  <div className="space-y-2">
                    {mockProjects.filter(p => p.status === 'active').slice(0, 3).map((project, i) => (
                      <div key={project.id} className="flex items-center gap-3 p-2 border rounded">
                        <span className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <span className="flex-1">{project.name}</span>
                        <Badge variant="outline">{formatCurrency(project.spent_amount)}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrendsReportDialog(false)}>Close</Button>
              <Button onClick={() => { setShowTrendsReportDialog(false); setShowExportDialog(true) }}>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
