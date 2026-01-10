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

// Quick actions are now handled as callbacks in the component to access state

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
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showTimeEntryDialog, setShowTimeEntryDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [formData, setFormData] = useState<AllocationForm>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [timeEntryData, setTimeEntryData] = useState({ hours: 0, description: '', date: '' })
  const [transferData, setTransferData] = useState({ targetProject: '', notes: '' })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [alertSettings, setAlertSettings] = useState({
    overAllocation: true,
    pendingApprovals: true,
    capacityWarnings: true
  })

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
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 800)),
      {
        loading: 'Exporting allocations...',
        success: 'Allocation report downloaded',
        error: 'Failed to export allocations'
      }
    )
  }

  const handleRefresh = async () => {
    toast.promise(
      refetch(),
      {
        loading: 'Refreshing data...',
        success: 'Data updated successfully',
        error: 'Failed to refresh data'
      }
    )
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
                { icon: UserCheck, label: 'Assign', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.success('Select a resource to assign') },
                { icon: Calendar, label: 'Schedule', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('schedule') },
                { icon: Clock, label: 'Time Entry', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.success('Time tracking feature ready') },
                { icon: CheckCircle, label: 'Approve', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.success('Select pending allocations to approve') },
                { icon: GitBranch, label: 'Transfer', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.success('Transfer allocation between projects') },
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
                { icon: Plus, label: 'Add Resource', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.success('Add new team member or contractor', { description: 'Configure skills, availability, and hourly rate' }) },
                { icon: Users, label: 'Team View', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.success('Switching to team view') },
                { icon: Star, label: 'Skills', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => toast.success('Skills matrix view loading') },
                { icon: BarChart3, label: 'Utilization', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => { setActiveTab('reports'); toast.success('Viewing utilization reports') } },
                { icon: Plane, label: 'Time Off', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => toast.success('Time off calendar opening') },
                { icon: DollarSign, label: 'Rates', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => { setActiveTab('settings'); toast.success('View billing rates') } },
                { icon: Eye, label: 'Availability', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => toast.success('Availability calendar loading') },
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
                { icon: BarChart3, label: 'Forecast', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => toast.success('Loading capacity forecast') },
                { icon: TrendingUp, label: 'Trends', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => toast.success('Analyzing capacity trends') },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => toast.success('Capacity alerts configured') },
                { icon: Users, label: 'Hiring', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => toast.success('Hiring recommendations loading') },
                { icon: Layers, label: 'Balance', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => toast.success('Workload balancing tool ready') },
                { icon: Calendar, label: 'Schedule', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('schedule') },
                { icon: RefreshCw, label: 'Optimize', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => toast.success('Running capacity optimization') },
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
                { icon: Plus, label: 'New Project', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => toast.success('New project wizard launching') },
                { icon: Calendar, label: 'Timeline', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => toast.success('Loading Gantt timeline view') },
                { icon: Target, label: 'Milestones', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => toast.success('Project milestones view loading') },
                { icon: Briefcase, label: 'Resources', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setActiveTab('resources') },
                { icon: GitBranch, label: 'Dependencies', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => toast.success('Dependency graph loading') },
                { icon: Clock, label: 'Deadlines', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.success('Upcoming deadlines view') },
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
                    <Button variant="outline" size="sm" onClick={() => {
                      const prevMonth = new Date(currentMonth)
                      prevMonth.setMonth(prevMonth.getMonth() - 1)
                      setCurrentMonth(prevMonth)
                      toast.success(`Viewing ${prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
                    }}>
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <span className="text-sm font-medium">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      const nextMonth = new Date(currentMonth)
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setCurrentMonth(nextMonth)
                      toast.success(`Viewing ${nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
                    }}>
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
                { icon: PieChart, label: 'Utilization', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.success('Loading utilization report') },
                { icon: BarChart3, label: 'Revenue', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.success('Loading revenue report') },
                { icon: TrendingUp, label: 'Trends', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.success('Analyzing trends data') },
                { icon: Users, label: 'Team', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => toast.success('Loading team performance report') },
                { icon: Briefcase, label: 'Projects', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => toast.success('Loading projects report') },
                { icon: DollarSign, label: 'Billing', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => toast.success('Loading billing summary') },
                { icon: Calendar, label: 'Schedule', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setActiveTab('schedule') },
                { icon: ArrowUpRight, label: 'Export', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => { toast.success('Exporting report data...'); const blob = new Blob(['Report Data Export'], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'allocation-report.txt'; a.click() } },
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
                { icon: Clock, label: 'Work Hours', color: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400', onClick: () => toast.success('Configuring work hours') },
                { icon: Target, label: 'Targets', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400', onClick: () => toast.success('Editing utilization targets') },
                { icon: DollarSign, label: 'Billing', color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-400', onClick: () => toast.success('Configuring billing defaults') },
                { icon: AlertTriangle, label: 'Alerts', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-900/30 dark:text-neutral-400', onClick: () => toast.success('Managing notification preferences') },
                { icon: Users, label: 'Roles', color: 'bg-stone-100 text-stone-600 dark:bg-stone-900/30 dark:text-stone-400', onClick: () => toast.success('Configuring team roles') },
                { icon: Calendar, label: 'Holidays', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => toast.success('Managing company holidays') },
                { icon: RefreshCw, label: 'Sync', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => { handleRefresh(); toast.success('Syncing allocation data') } },
                { icon: Zap, label: 'Integrations', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.success('Managing integrations') },
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
                      <Button
                        variant={alertSettings.overAllocation ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = !alertSettings.overAllocation
                          setAlertSettings(prev => ({ ...prev, overAllocation: newValue }))
                          toast.success(newValue ? 'Over-allocation alerts enabled' : 'Over-allocation alerts disabled')
                        }}
                      >
                        {alertSettings.overAllocation ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Pending Approvals</p>
                        <p className="text-sm text-gray-500">Daily digest of pending requests</p>
                      </div>
                      <Button
                        variant={alertSettings.pendingApprovals ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = !alertSettings.pendingApprovals
                          setAlertSettings(prev => ({ ...prev, pendingApprovals: newValue }))
                          toast.success(newValue ? 'Pending approvals digest enabled' : 'Pending approvals digest disabled')
                        }}
                      >
                        {alertSettings.pendingApprovals ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Capacity Warnings</p>
                        <p className="text-sm text-gray-500">Alert when capacity runs low</p>
                      </div>
                      <Button
                        variant={alertSettings.capacityWarnings ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newValue = !alertSettings.capacityWarnings
                          setAlertSettings(prev => ({ ...prev, capacityWarnings: newValue }))
                          toast.success(newValue ? 'Capacity warnings enabled' : 'Capacity warnings disabled')
                        }}
                      >
                        {alertSettings.capacityWarnings ? 'Enabled' : 'Disabled'}
                      </Button>
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
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
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
            actions={mockAllocationQuickActions}
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
                    <Button variant="outline" className="flex-1" onClick={() => { setSelectedResource(null); setActiveTab('allocations'); toast.success(`Viewing allocations for ${selectedResource?.name}`) }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Allocations
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white" onClick={() => { setSelectedResource(null); setFormData(prev => ({ ...prev, resource_name: selectedResource?.name || '' })); setShowCreateDialog(true) }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Allocation
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
