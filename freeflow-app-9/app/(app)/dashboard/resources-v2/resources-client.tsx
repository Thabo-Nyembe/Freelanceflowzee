'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users, Calendar, Target, BarChart3, Clock, Briefcase, Star,
  Settings, Plus, Search, Filter, LayoutGrid, List, ChevronRight,
  UserPlus, CalendarDays, Award, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, PauseCircle, Mail, Phone, MapPin,
  Building, DollarSign, RefreshCw, ArrowUpRight, ArrowDownRight,
  Zap, Timer, Activity, Eye, BookOpen, Layers, Hash, GitBranch,
  Coffee, Plane, FileText, MessageSquare, Bell, Sparkles
} from 'lucide-react'

// ============================================================================
// TYPE DEFINITIONS - Resource Guru Level Resource Management
// ============================================================================

type ResourceStatus = 'available' | 'assigned' | 'overallocated' | 'on_leave' | 'sick' | 'training' | 'offboarding'
type ResourceType = 'developer' | 'designer' | 'manager' | 'qa' | 'devops' | 'contractor' | 'analyst' | 'architect'
type SkillLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director'
type BookingStatus = 'tentative' | 'confirmed' | 'cancelled' | 'completed'
type LeaveType = 'vacation' | 'sick' | 'personal' | 'parental' | 'training' | 'conference'

interface Skill {
  id: string
  name: string
  category: string
  level: 1 | 2 | 3 | 4 | 5
  years_experience: number
  certified: boolean
  last_used: string
}

interface Booking {
  id: string
  project_id: string
  project_name: string
  client_name: string
  start_date: string
  end_date: string
  hours_per_day: number
  total_hours: number
  status: BookingStatus
  billable: boolean
  rate_override?: number
  notes: string
}

interface TimeEntry {
  id: string
  date: string
  project_name: string
  hours: number
  description: string
  billable: boolean
  approved: boolean
}

interface Leave {
  id: string
  type: LeaveType
  start_date: string
  end_date: string
  days: number
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

interface Resource {
  id: string
  name: string
  email: string
  phone?: string
  avatar: string
  status: ResourceStatus
  type: ResourceType
  skill_level: SkillLevel
  department: string
  team: string
  manager: string
  location: string
  timezone: string
  hire_date: string
  capacity_hours: number
  allocated_hours: number
  utilization: number
  hourly_rate: number
  cost_rate: number
  currency: string
  skills: Skill[]
  bookings: Booking[]
  time_entries: TimeEntry[]
  leaves: Leave[]
  certifications: string[]
  projects_count: number
  billable_percentage: number
  availability_next_week: number
  tags: string[]
}

interface Team {
  id: string
  name: string
  department: string
  manager: Resource
  members: Resource[]
  total_capacity: number
  total_allocated: number
  avg_utilization: number
}

interface CapacityPlan {
  week: string
  total_capacity: number
  total_booked: number
  available_capacity: number
  utilization_percentage: number
}

// ============================================================================
// MOCK DATA - Resource Guru Level Comprehensive
// ============================================================================

const mockSkills: Skill[] = [
  { id: 's1', name: 'React', category: 'Frontend', level: 5, years_experience: 5, certified: true, last_used: '2024-02-20' },
  { id: 's2', name: 'TypeScript', category: 'Languages', level: 5, years_experience: 4, certified: true, last_used: '2024-02-20' },
  { id: 's3', name: 'Node.js', category: 'Backend', level: 4, years_experience: 4, certified: false, last_used: '2024-02-18' },
  { id: 's4', name: 'Python', category: 'Languages', level: 3, years_experience: 2, certified: false, last_used: '2024-01-15' },
  { id: 's5', name: 'Figma', category: 'Design', level: 5, years_experience: 3, certified: true, last_used: '2024-02-20' },
  { id: 's6', name: 'AWS', category: 'Cloud', level: 4, years_experience: 3, certified: true, last_used: '2024-02-19' },
  { id: 's7', name: 'Kubernetes', category: 'DevOps', level: 4, years_experience: 2, certified: true, last_used: '2024-02-15' },
  { id: 's8', name: 'Cypress', category: 'Testing', level: 4, years_experience: 2, certified: false, last_used: '2024-02-17' },
]

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    phone: '+1 555-0101',
    avatar: '/avatars/sarah.jpg',
    status: 'assigned',
    type: 'developer',
    skill_level: 'senior',
    department: 'Engineering',
    team: 'Platform Team',
    manager: 'Michael Rodriguez',
    location: 'San Francisco, CA',
    timezone: 'America/Los_Angeles',
    hire_date: '2021-03-15',
    capacity_hours: 40,
    allocated_hours: 36,
    utilization: 90,
    hourly_rate: 150,
    cost_rate: 85,
    currency: 'USD',
    skills: [mockSkills[0], mockSkills[1], mockSkills[2]],
    bookings: [
      { id: 'b1', project_id: 'p1', project_name: 'Platform V2.0', client_name: 'Internal', start_date: '2024-01-15', end_date: '2024-03-31', hours_per_day: 6, total_hours: 360, status: 'confirmed', billable: true, notes: 'Lead frontend development' },
      { id: 'b2', project_id: 'p2', project_name: 'Client Portal', client_name: 'Acme Corp', start_date: '2024-02-01', end_date: '2024-02-28', hours_per_day: 2, total_hours: 40, status: 'confirmed', billable: true, rate_override: 175, notes: 'Technical consulting' },
    ],
    time_entries: [
      { id: 't1', date: '2024-02-20', project_name: 'Platform V2.0', hours: 6, description: 'Component library updates', billable: true, approved: true },
      { id: 't2', date: '2024-02-20', project_name: 'Client Portal', hours: 2, description: 'API integration review', billable: true, approved: true },
    ],
    leaves: [],
    certifications: ['AWS Solutions Architect', 'React Developer Certification'],
    projects_count: 3,
    billable_percentage: 92,
    availability_next_week: 8,
    tags: ['frontend', 'react', 'typescript', 'team-lead'],
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.r@company.com',
    phone: '+1 555-0102',
    avatar: '/avatars/michael.jpg',
    status: 'overallocated',
    type: 'manager',
    skill_level: 'lead',
    department: 'Engineering',
    team: 'Platform Team',
    manager: 'Jessica Brown',
    location: 'New York, NY',
    timezone: 'America/New_York',
    hire_date: '2019-06-01',
    capacity_hours: 40,
    allocated_hours: 48,
    utilization: 120,
    hourly_rate: 200,
    cost_rate: 120,
    currency: 'USD',
    skills: [mockSkills[0], mockSkills[1], mockSkills[2], mockSkills[5]],
    bookings: [
      { id: 'b3', project_id: 'p1', project_name: 'Platform V2.0', client_name: 'Internal', start_date: '2024-01-15', end_date: '2024-03-31', hours_per_day: 8, total_hours: 480, status: 'confirmed', billable: false, notes: 'Technical leadership' },
      { id: 'b4', project_id: 'p3', project_name: 'Enterprise Migration', client_name: 'TechCo Inc', start_date: '2024-02-01', end_date: '2024-04-30', hours_per_day: 4, total_hours: 240, status: 'confirmed', billable: true, notes: 'Architecture consulting' },
    ],
    time_entries: [],
    leaves: [],
    certifications: ['PMP', 'AWS Solutions Architect Pro'],
    projects_count: 5,
    billable_percentage: 65,
    availability_next_week: 0,
    tags: ['leadership', 'architecture', 'mentoring'],
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily.w@company.com',
    phone: '+1 555-0103',
    avatar: '/avatars/emily.jpg',
    status: 'assigned',
    type: 'designer',
    skill_level: 'senior',
    department: 'Design',
    team: 'UX Team',
    manager: 'David Kim',
    location: 'Los Angeles, CA',
    timezone: 'America/Los_Angeles',
    hire_date: '2020-09-01',
    capacity_hours: 40,
    allocated_hours: 32,
    utilization: 80,
    hourly_rate: 130,
    cost_rate: 75,
    currency: 'USD',
    skills: [mockSkills[4]],
    bookings: [
      { id: 'b5', project_id: 'p1', project_name: 'Platform V2.0', client_name: 'Internal', start_date: '2024-01-15', end_date: '2024-03-31', hours_per_day: 5, total_hours: 300, status: 'confirmed', billable: true, notes: 'UI/UX design' },
    ],
    time_entries: [],
    leaves: [
      { id: 'l1', type: 'vacation', start_date: '2024-03-10', end_date: '2024-03-15', days: 4, status: 'approved' },
    ],
    certifications: ['Figma Professional', 'Nielsen Norman UX Certification'],
    projects_count: 2,
    billable_percentage: 88,
    availability_next_week: 16,
    tags: ['ux', 'figma', 'design-system'],
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.k@company.com',
    phone: '+1 555-0104',
    avatar: '/avatars/david.jpg',
    status: 'assigned',
    type: 'qa',
    skill_level: 'mid',
    department: 'Engineering',
    team: 'Quality Team',
    manager: 'Michael Rodriguez',
    location: 'Seattle, WA',
    timezone: 'America/Los_Angeles',
    hire_date: '2022-01-10',
    capacity_hours: 40,
    allocated_hours: 35,
    utilization: 87.5,
    hourly_rate: 100,
    cost_rate: 55,
    currency: 'USD',
    skills: [mockSkills[7], mockSkills[1]],
    bookings: [
      { id: 'b6', project_id: 'p1', project_name: 'Platform V2.0', client_name: 'Internal', start_date: '2024-02-01', end_date: '2024-03-31', hours_per_day: 7, total_hours: 280, status: 'confirmed', billable: true, notes: 'Test automation' },
    ],
    time_entries: [],
    leaves: [],
    certifications: ['ISTQB Foundation'],
    projects_count: 2,
    billable_percentage: 95,
    availability_next_week: 10,
    tags: ['testing', 'automation', 'cypress'],
  },
  {
    id: '5',
    name: 'Jessica Brown',
    email: 'jessica.b@company.com',
    phone: '+1 555-0105',
    avatar: '/avatars/jessica.jpg',
    status: 'available',
    type: 'devops',
    skill_level: 'senior',
    department: 'Engineering',
    team: 'Infrastructure Team',
    manager: 'Michael Rodriguez',
    location: 'Austin, TX',
    timezone: 'America/Chicago',
    hire_date: '2020-04-15',
    capacity_hours: 40,
    allocated_hours: 24,
    utilization: 60,
    hourly_rate: 140,
    cost_rate: 80,
    currency: 'USD',
    skills: [mockSkills[5], mockSkills[6]],
    bookings: [
      { id: 'b7', project_id: 'p4', project_name: 'Infrastructure Upgrade', client_name: 'Internal', start_date: '2024-02-15', end_date: '2024-03-15', hours_per_day: 6, total_hours: 120, status: 'confirmed', billable: false, notes: 'K8s migration' },
    ],
    time_entries: [],
    leaves: [],
    certifications: ['AWS DevOps Pro', 'CKA'],
    projects_count: 1,
    billable_percentage: 45,
    availability_next_week: 32,
    tags: ['devops', 'kubernetes', 'aws', 'terraform'],
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex.t@company.com',
    avatar: '/avatars/alex.jpg',
    status: 'on_leave',
    type: 'developer',
    skill_level: 'mid',
    department: 'Engineering',
    team: 'Mobile Team',
    manager: 'Michael Rodriguez',
    location: 'Denver, CO',
    timezone: 'America/Denver',
    hire_date: '2022-08-01',
    capacity_hours: 40,
    allocated_hours: 0,
    utilization: 0,
    hourly_rate: 110,
    cost_rate: 60,
    currency: 'USD',
    skills: [mockSkills[0], mockSkills[1]],
    bookings: [],
    time_entries: [],
    leaves: [
      { id: 'l2', type: 'parental', start_date: '2024-02-01', end_date: '2024-04-01', days: 40, status: 'approved', reason: 'Paternity leave' },
    ],
    certifications: [],
    projects_count: 0,
    billable_percentage: 0,
    availability_next_week: 0,
    tags: ['mobile', 'react-native'],
  },
  {
    id: '7',
    name: 'Lisa Park',
    email: 'lisa.p@company.com',
    avatar: '/avatars/lisa.jpg',
    status: 'training',
    type: 'analyst',
    skill_level: 'junior',
    department: 'Analytics',
    team: 'Data Team',
    manager: 'David Kim',
    location: 'Chicago, IL',
    timezone: 'America/Chicago',
    hire_date: '2023-11-01',
    capacity_hours: 40,
    allocated_hours: 16,
    utilization: 40,
    hourly_rate: 80,
    cost_rate: 45,
    currency: 'USD',
    skills: [mockSkills[3]],
    bookings: [],
    time_entries: [],
    leaves: [],
    certifications: [],
    projects_count: 1,
    billable_percentage: 30,
    availability_next_week: 40,
    tags: ['data', 'python', 'sql', 'new-hire'],
  },
  {
    id: '8',
    name: 'James Wilson',
    email: 'james.w@contractor.com',
    avatar: '/avatars/james.jpg',
    status: 'assigned',
    type: 'contractor',
    skill_level: 'senior',
    department: 'Engineering',
    team: 'Platform Team',
    manager: 'Michael Rodriguez',
    location: 'Remote - UK',
    timezone: 'Europe/London',
    hire_date: '2024-01-15',
    capacity_hours: 32,
    allocated_hours: 32,
    utilization: 100,
    hourly_rate: 180,
    cost_rate: 180,
    currency: 'GBP',
    skills: [mockSkills[0], mockSkills[1], mockSkills[5]],
    bookings: [
      { id: 'b8', project_id: 'p1', project_name: 'Platform V2.0', client_name: 'Internal', start_date: '2024-01-15', end_date: '2024-03-31', hours_per_day: 8, total_hours: 400, status: 'confirmed', billable: true, notes: 'Backend development' },
    ],
    time_entries: [],
    leaves: [],
    certifications: ['AWS Developer Associate'],
    projects_count: 1,
    billable_percentage: 100,
    availability_next_week: 0,
    tags: ['contractor', 'backend', 'aws'],
  },
]

const mockTeams: Team[] = [
  {
    id: 't1',
    name: 'Platform Team',
    department: 'Engineering',
    manager: mockResources[1],
    members: [mockResources[0], mockResources[1], mockResources[7]],
    total_capacity: 112,
    total_allocated: 116,
    avg_utilization: 103.5,
  },
  {
    id: 't2',
    name: 'UX Team',
    department: 'Design',
    manager: mockResources[2],
    members: [mockResources[2]],
    total_capacity: 40,
    total_allocated: 32,
    avg_utilization: 80,
  },
  {
    id: 't3',
    name: 'Quality Team',
    department: 'Engineering',
    manager: mockResources[3],
    members: [mockResources[3]],
    total_capacity: 40,
    total_allocated: 35,
    avg_utilization: 87.5,
  },
  {
    id: 't4',
    name: 'Infrastructure Team',
    department: 'Engineering',
    manager: mockResources[4],
    members: [mockResources[4]],
    total_capacity: 40,
    total_allocated: 24,
    avg_utilization: 60,
  },
]

const mockCapacityPlan: CapacityPlan[] = [
  { week: 'Feb 19-25', total_capacity: 280, total_booked: 231, available_capacity: 49, utilization_percentage: 82.5 },
  { week: 'Feb 26-Mar 3', total_capacity: 280, total_booked: 245, available_capacity: 35, utilization_percentage: 87.5 },
  { week: 'Mar 4-10', total_capacity: 280, total_booked: 210, available_capacity: 70, utilization_percentage: 75 },
  { week: 'Mar 11-17', total_capacity: 240, total_booked: 198, available_capacity: 42, utilization_percentage: 82.5 },
  { week: 'Mar 18-24', total_capacity: 280, total_booked: 252, available_capacity: 28, utilization_percentage: 90 },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: ResourceStatus) => {
  const colors = {
    available: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    assigned: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    overallocated: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    on_leave: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
    sick: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
    training: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400',
    offboarding: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
  }
  return colors[status]
}

const getStatusIcon = (status: ResourceStatus) => {
  const icons = {
    available: CheckCircle2,
    assigned: Briefcase,
    overallocated: AlertTriangle,
    on_leave: Plane,
    sick: Coffee,
    training: BookOpen,
    offboarding: XCircle,
  }
  return icons[status]
}

const getTypeColor = (type: ResourceType) => {
  const colors = {
    developer: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-400',
    designer: 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900/30 dark:text-pink-400',
    manager: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400',
    qa: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400',
    devops: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
    contractor: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400',
    analyst: 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-400',
    architect: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400',
  }
  return colors[type]
}

const getSkillLevelColor = (level: SkillLevel) => {
  const colors = {
    junior: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/30 dark:text-sky-400',
    mid: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    senior: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
    lead: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
    principal: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    director: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
  }
  return colors[level]
}

const getUtilizationColor = (utilization: number) => {
  if (utilization > 100) return 'text-red-600 dark:text-red-400'
  if (utilization >= 90) return 'text-amber-600 dark:text-amber-400'
  if (utilization >= 70) return 'text-green-600 dark:text-green-400'
  return 'text-blue-600 dark:text-blue-400'
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ResourcesClient() {
  const [activeTab, setActiveTab] = useState('resources')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockResources.length
    const available = mockResources.filter(r => r.status === 'available').length
    const assigned = mockResources.filter(r => r.status === 'assigned').length
    const overallocated = mockResources.filter(r => r.status === 'overallocated').length
    const onLeave = mockResources.filter(r => r.status === 'on_leave' || r.status === 'sick').length
    const totalCapacity = mockResources.reduce((sum, r) => sum + r.capacity_hours, 0)
    const totalAllocated = mockResources.reduce((sum, r) => sum + r.allocated_hours, 0)
    const avgUtilization = mockResources.filter(r => r.status !== 'on_leave').reduce((sum, r) => sum + r.utilization, 0) /
      mockResources.filter(r => r.status !== 'on_leave').length
    const avgBillable = mockResources.reduce((sum, r) => sum + r.billable_percentage, 0) / total
    const contractors = mockResources.filter(r => r.type === 'contractor').length
    const avgHourlyRate = mockResources.reduce((sum, r) => sum + r.hourly_rate, 0) / total

    return {
      total, available, assigned, overallocated, onLeave,
      totalCapacity, totalAllocated, avgUtilization, avgBillable,
      contractors, avgHourlyRate,
      availabilityNextWeek: mockResources.reduce((sum, r) => sum + r.availability_next_week, 0),
      totalSkills: new Set(mockResources.flatMap(r => r.skills.map(s => s.name))).size,
    }
  }, [])

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(mockResources.map(r => r.department))]
  }, [])

  // Filter resources
  const filteredResources = useMemo(() => {
    return mockResources.filter(resource => {
      const matchesSearch = searchQuery === '' ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || resource.status === statusFilter
      const matchesType = typeFilter === 'all' || resource.type === typeFilter
      const matchesDepartment = departmentFilter === 'all' || resource.department === departmentFilter
      return matchesSearch && matchesStatus && matchesType && matchesDepartment
    })
  }, [searchQuery, statusFilter, typeFilter, departmentFilter])

  // Get all unique skills
  const allSkills = useMemo(() => {
    const skillMap = new Map<string, { name: string; category: string; count: number; avgLevel: number }>()
    mockResources.forEach(r => {
      r.skills.forEach(s => {
        const existing = skillMap.get(s.name)
        if (existing) {
          existing.count++
          existing.avgLevel = (existing.avgLevel * (existing.count - 1) + s.level) / existing.count
        } else {
          skillMap.set(s.name, { name: s.name, category: s.category, count: 1, avgLevel: s.level })
        }
      })
    })
    return Array.from(skillMap.values()).sort((a, b) => b.count - a.count)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Resource Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Resource Guru level workforce planning and allocation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
            <Button className="bg-gradient-to-r from-sky-600 to-blue-600 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Resources', value: stats.total, icon: Users, color: 'from-sky-500 to-blue-500' },
            { label: 'Available', value: stats.available, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'Assigned', value: stats.assigned, icon: Briefcase, color: 'from-blue-500 to-cyan-500' },
            { label: 'Overallocated', value: stats.overallocated, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
            { label: 'Avg Utilization', value: `${Math.round(stats.avgUtilization)}%`, icon: TrendingUp, color: 'from-purple-500 to-violet-500' },
            { label: 'Billable Rate', value: `${Math.round(stats.avgBillable)}%`, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
            { label: 'Contractors', value: stats.contractors, icon: Hash, color: 'from-orange-500 to-amber-500' },
            { label: 'Total Skills', value: stats.totalSkills, icon: Star, color: 'from-pink-500 to-rose-500' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="resources" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <CalendarDays className="w-4 h-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Star className="w-4 h-4 mr-2" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="workload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Workload
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search resources, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/80 dark:bg-slate-900/80"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ResourceStatus | 'all')}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="overallocated">Overallocated</option>
                <option value="on_leave">On Leave</option>
                <option value="training">Training</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredResources.map((resource) => {
                const StatusIcon = getStatusIcon(resource.status)

                return (
                  <Card
                    key={resource.id}
                    className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => setSelectedResource(resource)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-14 h-14 border-2 border-white dark:border-slate-800 shadow-lg">
                          <AvatarImage src={resource.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-500 text-white text-lg">
                            {resource.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                            {resource.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {resource.team} • {resource.department}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getStatusColor(resource.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {resource.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(resource.type)}>
                              {resource.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getUtilizationColor(resource.utilization)}`}>
                            {resource.utilization}%
                          </div>
                          <div className="text-xs text-slate-500">Utilization</div>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Capacity</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {resource.allocated_hours}/{resource.capacity_hours}h
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              resource.utilization > 100 ? 'bg-red-500' :
                              resource.utilization >= 90 ? 'bg-amber-500' :
                              'bg-sky-500'
                            }`}
                            style={{ width: `${Math.min(resource.utilization, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Contact & Location */}
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          {resource.location.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(resource.hourly_rate, resource.currency)}/hr
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 rounded-full text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
                          >
                            {skill.name}
                          </span>
                        ))}
                        {resource.skills.length > 4 && (
                          <span className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            +{resource.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Footer Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Briefcase className="w-4 h-4" />
                            {resource.projects_count} projects
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-4 h-4" />
                            {resource.billable_percentage}% billable
                          </span>
                        </div>
                        {resource.availability_next_week > 0 && (
                          <span className="text-green-600 font-medium">
                            {resource.availability_next_week}h available
                          </span>
                        )}
                      </div>

                      {/* Active Leaves */}
                      {resource.leaves.filter(l => l.status === 'approved').length > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                            <Plane className="w-4 h-4" />
                            <span>
                              {resource.leaves[0].type}: {formatDate(resource.leaves[0].start_date)} - {formatDate(resource.leaves[0].end_date)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-sky-500" />
                  Capacity Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCapacityPlan.map((week, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-32 text-sm font-medium text-slate-900 dark:text-white">
                        {week.week}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">
                            {week.total_booked}h booked / {week.total_capacity}h capacity
                          </span>
                          <span className={`font-medium ${
                            week.utilization_percentage > 90 ? 'text-red-600' :
                            week.utilization_percentage > 80 ? 'text-amber-600' :
                            'text-green-600'
                          }`}>
                            {week.utilization_percentage}%
                          </span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              week.utilization_percentage > 90 ? 'bg-red-500' :
                              week.utilization_percentage > 80 ? 'bg-amber-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${week.utilization_percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <div className="text-lg font-bold text-green-600">{week.available_capacity}h</div>
                        <div className="text-xs text-slate-500">available</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skills Matrix */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-sky-500" />
                    Skills Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allSkills.map((skill) => (
                      <div key={skill.name} className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900 dark:text-white">{skill.name}</span>
                            <Badge variant="outline">{skill.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-6 h-2 rounded ${
                                  level <= Math.round(skill.avgLevel)
                                    ? 'bg-sky-500'
                                    : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-slate-500 ml-2">
                              {skill.count} {skill.count === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Categories */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-sky-500" />
                    Skill Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Frontend', 'Backend', 'Languages', 'Cloud', 'DevOps', 'Design', 'Testing'].map((category) => {
                      const count = allSkills.filter(s => s.category === category).length
                      const total = allSkills.length
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-slate-900 dark:text-white">{category}</span>
                            <span className="text-slate-600 dark:text-slate-400">{count} skills</span>
                          </div>
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"
                              style={{ width: `${(count / total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Workload Tab */}
          <TabsContent value="workload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockTeams.map((team) => (
                <Card key={team.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-sky-500" />
                        {team.name}
                      </span>
                      <Badge variant="outline" className={
                        team.avg_utilization > 100 ? 'bg-red-100 text-red-700 border-red-300' :
                        team.avg_utilization > 90 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                        'bg-green-100 text-green-700 border-green-300'
                      }>
                        {Math.round(team.avg_utilization)}% avg
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-500 text-white text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {member.name}
                              </span>
                              <span className={`text-sm font-bold ${getUtilizationColor(member.utilization)}`}>
                                {member.utilization}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  member.utilization > 100 ? 'bg-red-500' :
                                  member.utilization >= 90 ? 'bg-amber-500' :
                                  'bg-sky-500'
                                }`}
                                style={{ width: `${Math.min(member.utilization, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {team.total_allocated}h / {team.total_capacity}h allocated
                      </span>
                      <span className="text-slate-500">
                        {team.members.length} members
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-500" />
                  Active Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockResources.flatMap(r => r.bookings.map(b => ({ ...b, resource: r }))).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={booking.resource.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-500 text-white text-sm">
                          {booking.resource.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {booking.resource.name}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {booking.project_name}
                          </span>
                          {booking.billable && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              Billable
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                          <span>{booking.hours_per_day}h/day</span>
                          <span>{booking.total_hours}h total</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-300' :
                        booking.status === 'tentative' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Overallocation alerts', enabled: true },
                    { label: 'Booking confirmations', enabled: true },
                    { label: 'Leave request notifications', enabled: true },
                    { label: 'Capacity threshold warnings', enabled: false },
                    { label: 'Weekly utilization reports', enabled: true },
                    { label: 'Skill expiry reminders', enabled: false },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{setting.label}</span>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors ${
                        setting.enabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
                      } relative cursor-pointer`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          setting.enabled ? 'right-1' : 'left-1'
                        }`} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Capacity Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Default weekly capacity', value: '40 hours', icon: Clock },
                    { label: 'Overallocation threshold', value: '100%', icon: AlertTriangle },
                    { label: 'Warning threshold', value: '90%', icon: Activity },
                    { label: 'Billable target', value: '75%', icon: DollarSign },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                          <setting.icon className="w-4 h-4 text-sky-600" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{setting.label}</span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{setting.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Resource Detail Dialog */}
        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedResource && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={selectedResource.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-500 text-white text-lg">
                        {selectedResource.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">{selectedResource.name}</h2>
                      <p className="text-sm text-slate-500 font-normal">
                        {selectedResource.skill_level} {selectedResource.type} • {selectedResource.department}
                      </p>
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedResource.team} | Reports to {selectedResource.manager}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6 py-4">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{selectedResource.email}</span>
                        </div>
                        {selectedResource.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{selectedResource.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3 mb-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{selectedResource.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{selectedResource.timezone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity & Rate */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-center">
                        <div className="text-2xl font-bold text-sky-600">{selectedResource.utilization}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Utilization</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                        <div className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(selectedResource.hourly_rate, selectedResource.currency)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Hourly Rate</div>
                      </div>
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedResource.billable_percentage}%</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Billable</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Skills ({selectedResource.skills.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedResource.skills.map((skill) => (
                          <div key={skill.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <span className="font-medium text-sm">{skill.name}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((l) => (
                                <div
                                  key={l}
                                  className={`w-2 h-2 rounded-full ${
                                    l <= skill.level ? 'bg-sky-500' : 'bg-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {skill.certified && (
                              <Award className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    {selectedResource.certifications.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedResource.certifications.map((cert, idx) => (
                            <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                              <Award className="w-3 h-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Active Bookings */}
                    {selectedResource.bookings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Active Bookings</h4>
                        <div className="space-y-2">
                          {selectedResource.bookings.map((booking) => (
                            <div key={booking.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{booking.project_name}</span>
                                <Badge variant="outline" className={
                                  booking.billable ? 'bg-green-100 text-green-700 border-green-300' : ''
                                }>
                                  {booking.billable ? 'Billable' : 'Non-billable'}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-500">
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)} • {booking.hours_per_day}h/day
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
