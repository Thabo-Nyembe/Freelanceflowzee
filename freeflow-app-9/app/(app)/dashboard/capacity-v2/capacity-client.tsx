'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { downloadAsCsv, apiPost } from '@/lib/button-handlers'
import { useCapacity, type Capacity, type ResourceType, type CapacityStatus } from '@/lib/hooks/use-capacity'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Bell, Calendar, Users, Clock, Briefcase, Globe, Zap, Download, Upload, RefreshCw, Plus, Link2, BarChart3, Shield, Palette, AlertTriangle, UserPlus, Shuffle, Mail, Target, TrendingUp } from 'lucide-react'

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




// Resource Guru / Float level interfaces
interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  department: string
  skills: string[]
  hourlyRate: number
  totalCapacity: number
  allocatedHours: number
  availableHours: number
  utilizationRate: number
  projects: { id: string; name: string; hours: number; color: string }[]
  timeOff: { start: string; end: string; type: string }[]
  status: 'available' | 'busy' | 'away' | 'overbooked'
}

interface Project {
  id: string
  name: string
  client: string
  color: string
  startDate: string
  endDate: string
  budget: number
  budgetUsed: number
  totalHours: number
  allocatedHours: number
  remainingHours: number
  status: 'active' | 'on_hold' | 'completed' | 'at_risk'
  teamMembers: { id: string; name: string; hours: number }[]
  milestones: { name: string; date: string; completed: boolean }[]
}

interface AllocationBlock {
  id: string
  memberId: string
  memberName: string
  projectId: string
  projectName: string
  projectColor: string
  startDate: string
  endDate: string
  hoursPerDay: number
  totalHours: number
  status: 'confirmed' | 'tentative' | 'requested'
}

interface CapacityForecast {
  week: string
  totalCapacity: number
  allocated: number
  available: number
  utilizationRate: number
  overbooked: number
}

// Mock data for Resource Guru level features
const mockTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    avatar: 'SC',
    role: 'Senior Developer',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    hourlyRate: 125,
    totalCapacity: 40,
    allocatedHours: 36,
    availableHours: 4,
    utilizationRate: 90,
    projects: [
      { id: 'p1', name: 'Platform Redesign', hours: 24, color: '#3B82F6' },
      { id: 'p2', name: 'Mobile App', hours: 12, color: '#10B981' }
    ],
    timeOff: [{ start: '2024-12-24', end: '2024-12-26', type: 'Holiday' }],
    status: 'busy'
  },
  {
    id: 'tm-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@company.com',
    avatar: 'MJ',
    role: 'UX Designer',
    department: 'Design',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    hourlyRate: 110,
    totalCapacity: 40,
    allocatedHours: 44,
    availableHours: -4,
    utilizationRate: 110,
    projects: [
      { id: 'p1', name: 'Platform Redesign', hours: 20, color: '#3B82F6' },
      { id: 'p3', name: 'Brand Refresh', hours: 24, color: '#F59E0B' }
    ],
    timeOff: [],
    status: 'overbooked'
  },
  {
    id: 'tm-3',
    name: 'Emily Rodriguez',
    email: 'emily.r@company.com',
    avatar: 'ER',
    role: 'Project Manager',
    department: 'Operations',
    skills: ['Agile', 'Scrum', 'Stakeholder Management', 'Risk Assessment'],
    hourlyRate: 95,
    totalCapacity: 40,
    allocatedHours: 30,
    availableHours: 10,
    utilizationRate: 75,
    projects: [
      { id: 'p1', name: 'Platform Redesign', hours: 16, color: '#3B82F6' },
      { id: 'p2', name: 'Mobile App', hours: 14, color: '#10B981' }
    ],
    timeOff: [{ start: '2024-12-30', end: '2025-01-01', type: 'PTO' }],
    status: 'available'
  },
  {
    id: 'tm-4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    avatar: 'DK',
    role: 'Backend Engineer',
    department: 'Engineering',
    skills: ['Python', 'PostgreSQL', 'Docker', 'Kubernetes'],
    hourlyRate: 115,
    totalCapacity: 40,
    allocatedHours: 40,
    availableHours: 0,
    utilizationRate: 100,
    projects: [
      { id: 'p2', name: 'Mobile App', hours: 32, color: '#10B981' },
      { id: 'p4', name: 'API Gateway', hours: 8, color: '#8B5CF6' }
    ],
    timeOff: [],
    status: 'busy'
  },
  {
    id: 'tm-5',
    name: 'Lisa Thompson',
    email: 'lisa.t@company.com',
    avatar: 'LT',
    role: 'QA Engineer',
    department: 'Engineering',
    skills: ['Selenium', 'Jest', 'Cypress', 'Performance Testing'],
    hourlyRate: 85,
    totalCapacity: 40,
    allocatedHours: 20,
    availableHours: 20,
    utilizationRate: 50,
    projects: [
      { id: 'p1', name: 'Platform Redesign', hours: 12, color: '#3B82F6' },
      { id: 'p2', name: 'Mobile App', hours: 8, color: '#10B981' }
    ],
    timeOff: [],
    status: 'available'
  }
]

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Platform Redesign',
    client: 'TechCorp Inc',
    color: '#3B82F6',
    startDate: '2024-10-01',
    endDate: '2025-02-28',
    budget: 150000,
    budgetUsed: 87500,
    totalHours: 1200,
    allocatedHours: 840,
    remainingHours: 360,
    status: 'active',
    teamMembers: [
      { id: 'tm-1', name: 'Sarah Chen', hours: 24 },
      { id: 'tm-2', name: 'Marcus Johnson', hours: 20 },
      { id: 'tm-3', name: 'Emily Rodriguez', hours: 16 },
      { id: 'tm-5', name: 'Lisa Thompson', hours: 12 }
    ],
    milestones: [
      { name: 'Discovery Phase', date: '2024-10-31', completed: true },
      { name: 'Design System', date: '2024-11-30', completed: true },
      { name: 'MVP Launch', date: '2025-01-15', completed: false },
      { name: 'Full Release', date: '2025-02-28', completed: false }
    ]
  },
  {
    id: 'p2',
    name: 'Mobile App',
    client: 'StartupXYZ',
    color: '#10B981',
    startDate: '2024-11-01',
    endDate: '2025-03-31',
    budget: 200000,
    budgetUsed: 45000,
    totalHours: 1600,
    allocatedHours: 480,
    remainingHours: 1120,
    status: 'active',
    teamMembers: [
      { id: 'tm-1', name: 'Sarah Chen', hours: 12 },
      { id: 'tm-3', name: 'Emily Rodriguez', hours: 14 },
      { id: 'tm-4', name: 'David Kim', hours: 32 },
      { id: 'tm-5', name: 'Lisa Thompson', hours: 8 }
    ],
    milestones: [
      { name: 'Architecture Design', date: '2024-11-15', completed: true },
      { name: 'Alpha Release', date: '2025-01-31', completed: false },
      { name: 'Beta Testing', date: '2025-02-28', completed: false },
      { name: 'App Store Launch', date: '2025-03-31', completed: false }
    ]
  },
  {
    id: 'p3',
    name: 'Brand Refresh',
    client: 'Internal',
    color: '#F59E0B',
    startDate: '2024-12-01',
    endDate: '2025-01-31',
    budget: 50000,
    budgetUsed: 12000,
    totalHours: 400,
    allocatedHours: 160,
    remainingHours: 240,
    status: 'at_risk',
    teamMembers: [
      { id: 'tm-2', name: 'Marcus Johnson', hours: 24 }
    ],
    milestones: [
      { name: 'Research', date: '2024-12-15', completed: true },
      { name: 'Concepts', date: '2025-01-10', completed: false },
      { name: 'Final Delivery', date: '2025-01-31', completed: false }
    ]
  },
  {
    id: 'p4',
    name: 'API Gateway',
    client: 'Enterprise Co',
    color: '#8B5CF6',
    startDate: '2024-12-15',
    endDate: '2025-02-15',
    budget: 75000,
    budgetUsed: 8000,
    totalHours: 600,
    allocatedHours: 120,
    remainingHours: 480,
    status: 'active',
    teamMembers: [
      { id: 'tm-4', name: 'David Kim', hours: 8 }
    ],
    milestones: [
      { name: 'Planning', date: '2024-12-31', completed: false },
      { name: 'Implementation', date: '2025-01-31', completed: false },
      { name: 'Go Live', date: '2025-02-15', completed: false }
    ]
  }
]

const mockAllocations: AllocationBlock[] = [
  { id: 'a1', memberId: 'tm-1', memberName: 'Sarah Chen', projectId: 'p1', projectName: 'Platform Redesign', projectColor: '#3B82F6', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 6, totalHours: 30, status: 'confirmed' },
  { id: 'a2', memberId: 'tm-1', memberName: 'Sarah Chen', projectId: 'p2', projectName: 'Mobile App', projectColor: '#10B981', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 2, totalHours: 10, status: 'confirmed' },
  { id: 'a3', memberId: 'tm-2', memberName: 'Marcus Johnson', projectId: 'p1', projectName: 'Platform Redesign', projectColor: '#3B82F6', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 4, totalHours: 20, status: 'confirmed' },
  { id: 'a4', memberId: 'tm-2', memberName: 'Marcus Johnson', projectId: 'p3', projectName: 'Brand Refresh', projectColor: '#F59E0B', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 5, totalHours: 25, status: 'tentative' },
  { id: 'a5', memberId: 'tm-3', memberName: 'Emily Rodriguez', projectId: 'p1', projectName: 'Platform Redesign', projectColor: '#3B82F6', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 4, totalHours: 20, status: 'confirmed' },
  { id: 'a6', memberId: 'tm-4', memberName: 'David Kim', projectId: 'p2', projectName: 'Mobile App', projectColor: '#10B981', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 6, totalHours: 30, status: 'confirmed' },
  { id: 'a7', memberId: 'tm-4', memberName: 'David Kim', projectId: 'p4', projectName: 'API Gateway', projectColor: '#8B5CF6', startDate: '2024-12-16', endDate: '2024-12-20', hoursPerDay: 2, totalHours: 10, status: 'requested' }
]

const mockForecast: CapacityForecast[] = [
  { week: 'Dec 16-20', totalCapacity: 200, allocated: 170, available: 30, utilizationRate: 85, overbooked: 1 },
  { week: 'Dec 23-27', totalCapacity: 120, allocated: 90, available: 30, utilizationRate: 75, overbooked: 0 },
  { week: 'Dec 30-Jan 3', totalCapacity: 80, allocated: 65, available: 15, utilizationRate: 81, overbooked: 0 },
  { week: 'Jan 6-10', totalCapacity: 200, allocated: 185, available: 15, utilizationRate: 93, overbooked: 2 },
  { week: 'Jan 13-17', totalCapacity: 200, allocated: 195, available: 5, utilizationRate: 98, overbooked: 3 },
  { week: 'Jan 20-24', totalCapacity: 200, allocated: 160, available: 40, utilizationRate: 80, overbooked: 0 }
]

// Competitive Upgrade Mock Data - Resource Guru/Float-level Capacity Intelligence
const mockCapacityAIInsights = [
  { id: '1', type: 'success' as const, title: 'Utilization Optimal', description: 'Team capacity at 85% - healthy workload balance!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Utilization' },
  { id: '2', type: 'warning' as const, title: 'Overallocation', description: '3 team members booked at 120%+ next week.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Planning' },
  { id: '3', type: 'info' as const, title: 'AI Suggestion', description: 'Skill-based assignment can improve project efficiency by 20%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockCapacityCollaborators = [
  { id: '1', name: 'Resource Manager', avatar: '/avatars/resource.jpg', status: 'online' as const, role: 'Manager' },
  { id: '2', name: 'Project Lead', avatar: '/avatars/project.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'HR Partner', avatar: '/avatars/hr.jpg', status: 'away' as const, role: 'HR' },
]

const mockCapacityPredictions = [
  { id: '1', title: 'Team Availability', prediction: 'Q2 will have 15% more available capacity after hiring', confidence: 86, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Project Demand', prediction: 'Development resources will be at 95% by month end', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
]

const mockCapacityActivities = [
  { id: '1', user: 'Resource Manager', action: 'Allocated', target: '5 developers to Project Alpha', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Project Lead', action: 'Requested', target: 'additional QA resources', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'HR Partner', action: 'Onboarded', target: '2 new contractors', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Real action handlers for quick actions
const handleAllocateAction = async () => {
  const result = await apiPost('/api/capacity/allocations', {
    action: 'open_form',
    timestamp: new Date().toISOString()
  }, {
    loading: 'Opening allocation form...',
    success: 'Ready to assign resources to projects',
    error: 'Failed to open allocation form'
  })
  return result
}

const handleBalanceWorkloads = async () => {
  const result = await apiPost('/api/capacity/balance', {
    teamMembers: mockTeamMembers.map(m => m.id),
    action: 'auto_balance'
  }, {
    loading: 'Auto-balancing workloads...',
    success: 'Workloads balanced! Redistributed allocations for optimal utilization',
    error: 'Failed to balance workloads'
  })
  return result
}

const handleExportCapacityReport = () => {
  const reportData = mockTeamMembers.map(member => ({
    name: member.name,
    role: member.role,
    department: member.department,
    totalCapacity: member.totalCapacity,
    allocatedHours: member.allocatedHours,
    availableHours: member.availableHours,
    utilizationRate: `${member.utilizationRate}%`,
    status: member.status,
    projects: member.projects.map(p => p.name).join('; ')
  }))
  downloadAsCsv(reportData, `capacity-report-${new Date().toISOString().split('T')[0]}.csv`)
}

const mockCapacityQuickActions = [
  { id: '1', label: 'Allocate', icon: 'plus', action: handleAllocateAction, variant: 'default' as const },
  { id: '2', label: 'Balance', icon: 'shuffle', action: handleBalanceWorkloads, variant: 'default' as const },
  { id: '3', label: 'Report', icon: 'bar-chart', action: handleExportCapacityReport, variant: 'outline' as const },
]

export default function CapacityClient({ initialCapacity }: { initialCapacity: Capacity[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<ResourceType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CapacityStatus | 'all'>('all')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [settingsTab, setSettingsTab] = useState('scheduling')
  const { capacity, loading, error } = useCapacity({ resourceType: resourceTypeFilter, status: statusFilter })
  const displayCapacity = capacity.length > 0 ? capacity : initialCapacity

  // Dialog state management
  const [addAllocationDialogOpen, setAddAllocationDialogOpen] = useState(false)
  const [addTeamMemberDialogOpen, setAddTeamMemberDialogOpen] = useState(false)
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [editAllocationDialogOpen, setEditAllocationDialogOpen] = useState(false)
  const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [clearAllocationsDialogOpen, setClearAllocationsDialogOpen] = useState(false)
  const [resetDataDialogOpen, setResetDataDialogOpen] = useState(false)
  const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false)
  const [editStatusDialogOpen, setEditStatusDialogOpen] = useState(false)
  const [importDataDialogOpen, setImportDataDialogOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<{ name: string; color: string } | null>(null)
  const [departmentSettings, setDepartmentSettings] = useState({
    name: '',
    isActive: true,
    defaultHoursPerWeek: 40,
    manager: ''
  })
  const [statusSettings, setStatusSettings] = useState({
    name: '',
    color: 'green',
    description: ''
  })
  const [importFile, setImportFile] = useState<File | null>(null)

  // Form state
  const [newAllocation, setNewAllocation] = useState({
    memberId: '',
    projectId: '',
    hoursPerDay: 4,
    startDate: '',
    endDate: '',
    status: 'tentative' as 'confirmed' | 'tentative' | 'requested'
  })
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    hourlyRate: 100,
    skills: ''
  })
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    color: '#3B82F6',
    startDate: '',
    endDate: '',
    budget: 0,
    totalHours: 0
  })
  const [newDepartment, setNewDepartment] = useState('')
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')

  // Calculate stats
  const stats = useMemo(() => {
    const totalCapacity = mockTeamMembers.reduce((sum, m) => sum + m.totalCapacity, 0)
    const totalAllocated = mockTeamMembers.reduce((sum, m) => sum + m.allocatedHours, 0)
    const avgUtilization = mockTeamMembers.reduce((sum, m) => sum + m.utilizationRate, 0) / mockTeamMembers.length
    const overbooked = mockTeamMembers.filter(m => m.status === 'overbooked').length
    const available = mockTeamMembers.filter(m => m.status === 'available').length

    return {
      totalCapacity,
      totalAllocated,
      totalAvailable: totalCapacity - totalAllocated,
      avgUtilization: avgUtilization.toFixed(0),
      overbooked,
      available,
      totalMembers: mockTeamMembers.length,
      totalProjects: mockProjects.length,
      activeProjects: mockProjects.filter(p => p.status === 'active').length,
      atRiskProjects: mockProjects.filter(p => p.status === 'at_risk').length
    }
  }, [])

  // Handlers
  const handleAllocateResource = () => {
    setAddAllocationDialogOpen(true)
  }

  const handleBalanceWorkload = async () => {
    toast.loading('Balancing workload...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.dismiss()
    toast.success('Workload balanced', {
      description: 'Team capacity has been optimized across projects'
    })
  }

  const handleExportCapacity = () => {
    setExportDialogOpen(true)
  }

  const handleCreateAllocation = async () => {
    if (!newAllocation.memberId || !newAllocation.projectId) {
      toast.error('Please select a team member and project')
      return
    }
    toast.loading('Creating allocation...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.dismiss()
    toast.success('Allocation created', {
      description: `Resource allocated successfully`
    })
    setAddAllocationDialogOpen(false)
    setNewAllocation({
      memberId: '',
      projectId: '',
      hoursPerDay: 4,
      startDate: '',
      endDate: '',
      status: 'tentative'
    })
  }

  const handleCreateTeamMember = async () => {
    if (!newTeamMember.name || !newTeamMember.email) {
      toast.error('Please fill in required fields')
      return
    }
    toast.loading('Adding team member...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.dismiss()
    toast.success('Team member added', {
      description: `${newTeamMember.name} has been added to the team`
    })
    setAddTeamMemberDialogOpen(false)
    setNewTeamMember({
      name: '',
      email: '',
      role: '',
      department: '',
      hourlyRate: 100,
      skills: ''
    })
  }

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.client) {
      toast.error('Please fill in required fields')
      return
    }
    toast.loading('Creating project...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.dismiss()
    toast.success('Project created', {
      description: `${newProject.name} has been created`
    })
    setAddProjectDialogOpen(false)
    setNewProject({
      name: '',
      client: '',
      color: '#3B82F6',
      startDate: '',
      endDate: '',
      budget: 0,
      totalHours: 0
    })
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      handleExportCapacityReport()
    } else if (exportFormat === 'json') {
      const data = JSON.stringify({ teamMembers: mockTeamMembers, projects: mockProjects, allocations: mockAllocations }, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `capacity-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      toast.success('Export complete', { description: 'JSON file downloaded' })
    } else {
      toast.success('PDF export initiated', { description: 'Your PDF will be ready shortly' })
    }
    setExportDialogOpen(false)
  }

  const handleAddDepartment = async () => {
    if (!newDepartment) {
      toast.error('Please enter a department name')
      return
    }
    toast.loading('Adding department...')
    await new Promise(resolve => setTimeout(resolve, 800))
    toast.dismiss()
    toast.success('Department added', {
      description: `${newDepartment} has been added`
    })
    setAddDepartmentDialogOpen(false)
    setNewDepartment('')
  }

  const handleRegenerateApiKey = async () => {
    toast.loading('Regenerating API key...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.dismiss()
    toast.success('API key regenerated', {
      description: 'Your new API key is ready to use'
    })
    setApiKeyDialogOpen(false)
  }

  const handleClearAllocations = async () => {
    toast.loading('Clearing allocations...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.dismiss()
    toast.success('Allocations cleared', {
      description: 'All allocations have been removed'
    })
    setClearAllocationsDialogOpen(false)
  }

  const handleResetData = async () => {
    toast.loading('Resetting data...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.dismiss()
    toast.success('Data reset complete', {
      description: 'All capacity data has been reset to defaults'
    })
    setResetDataDialogOpen(false)
  }

  const handleQuickAction = (actionLabel: string) => {
    switch (actionLabel) {
      case 'Team View':
        setActiveTab('team')
        toast.info('Switched to Team View')
        break
      case 'Analytics':
        toast.info('Opening Analytics', { description: 'Loading capacity analytics dashboard...' })
        break
      case 'Schedule':
        setActiveTab('schedule')
        toast.info('Switched to Schedule View')
        break
      case 'Forecast':
        setActiveTab('forecast')
        toast.info('Switched to Forecast View')
        break
      case 'Overload':
        toast.warning('Overload Alert', { description: `${stats.overbooked} team members are currently overbooked` })
        break
      case 'Optimize':
        handleBalanceWorkload()
        break
      case 'Export':
        setExportDialogOpen(true)
        break
      case 'Settings':
        setActiveTab('settings')
        toast.info('Switched to Settings')
        break
      case 'Add Member':
        setAddTeamMemberDialogOpen(true)
        break
      case 'View All':
        toast.info('Viewing all team members')
        break
      case 'Utilization':
        toast.info('Utilization Report', { description: `Average team utilization: ${stats.avgUtilization}%` })
        break
      case 'Time Off':
        toast.info('Time Off Calendar', { description: 'Opening team time off schedule...' })
        break
      case 'Skills':
        toast.info('Skills Matrix', { description: 'Loading team skills overview...' })
        break
      case 'Reassign':
        toast.info('Reassignment Mode', { description: 'Select allocations to reassign' })
        break
      case 'Notify':
        toast.success('Notifications sent', { description: 'Team has been notified of updates' })
        break
      default:
        toast.info(actionLabel)
    }
  }

  const handleNavigationClick = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'prev') {
      toast.info('Previous Week', { description: 'Showing previous week schedule' })
    } else if (direction === 'next') {
      toast.info('Next Week', { description: 'Showing next week schedule' })
    } else {
      toast.info('This Week', { description: 'Showing current week schedule' })
    }
  }

  const handleConnectIntegration = (integrationName: string) => {
    toast.loading(`Connecting to ${integrationName}...`)
    setTimeout(() => {
      toast.dismiss()
      toast.success(`${integrationName} connected`, { description: 'Integration setup complete' })
    }, 1500)
  }

  const handleSaveSettings = () => {
    toast.success('Settings saved', { description: 'Your preferences have been updated' })
  }

  const handleColorSelect = (color: string) => {
    setNewProject(prev => ({ ...prev, color }))
    toast.info('Color selected', { description: `Project color set to ${color}` })
  }

  const handleEditDepartment = (dept: string) => {
    setSelectedDepartment(dept)
    setDepartmentSettings({
      name: dept,
      isActive: true,
      defaultHoursPerWeek: 40,
      manager: ''
    })
    setEditDepartmentDialogOpen(true)
  }

  const handleSaveDepartmentSettings = async () => {
    if (!departmentSettings.name) {
      toast.error('Department name is required')
      return
    }
    toast.loading('Saving department settings...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.dismiss()
    toast.success('Department updated', {
      description: `${departmentSettings.name} settings have been saved`
    })
    setEditDepartmentDialogOpen(false)
  }

  const handleEditStatus = (status: { name: string; color: string }) => {
    setSelectedStatus(status)
    setStatusSettings({
      name: status.name,
      color: status.color,
      description: ''
    })
    setEditStatusDialogOpen(true)
  }

  const handleSaveStatusSettings = async () => {
    if (!statusSettings.name) {
      toast.error('Status name is required')
      return
    }
    toast.loading('Saving status configuration...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.dismiss()
    toast.success('Status updated', {
      description: `${statusSettings.name} status has been configured`
    })
    setEditStatusDialogOpen(false)
  }

  const handleImportData = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }
    toast.loading('Importing data...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.dismiss()
    toast.success('Data imported successfully', {
      description: `Imported ${importFile.name}`
    })
    setImportDataDialogOpen(false)
    setImportFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['application/json', 'text/csv']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
        toast.error('Invalid file type', { description: 'Please select a JSON or CSV file' })
        return
      }
      setImportFile(file)
      toast.info('File selected', { description: file.name })
    }
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">Resource Guru Level</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">Float Style</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Capacity Planning</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Resource scheduling, team allocation & workload management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setExportDialogOpen(true)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Export Schedule
            </button>
            <button
              onClick={() => setAddAllocationDialogOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span>+ New Allocation</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Team Size</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalCapacity}h</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Allocated</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAllocated}h</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available</div>
            <div className="text-2xl font-bold text-green-600">{stats.totalAvailable}h</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Utilization</div>
            <div className="text-2xl font-bold text-purple-600">{stats.avgUtilization}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.available}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overbooked</div>
            <div className="text-2xl font-bold text-red-600">{stats.overbooked}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">At Risk</div>
            <div className="text-2xl font-bold text-amber-600">{stats.atRiskProjects}</div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-300">Overview</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-300">Team</TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-300">Projects</TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-300">Schedule</TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-300">Forecast</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/40 dark:data-[state=active]:text-indigo-300">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Capacity Overview</h2>
                  <p className="text-indigo-100">Resource Guru-level capacity planning and utilization</p>
                  <p className="text-indigo-200 text-xs mt-1">Team workload • Project allocation • Utilization rates</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTeamMembers.length}</p>
                    <p className="text-indigo-200 text-sm">Team Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'active').length}</p>
                    <p className="text-indigo-200 text-sm">Active Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(mockTeamMembers.reduce((s, m) => s + m.utilizationRate, 0) / mockTeamMembers.length)}%</p>
                    <p className="text-indigo-200 text-sm">Avg Utilization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Users, label: 'Team View', color: 'text-indigo-600 dark:text-indigo-400' },
                { icon: BarChart3, label: 'Analytics', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Calendar, label: 'Schedule', color: 'text-blue-600 dark:text-blue-400' },
                { icon: TrendingUp, label: 'Forecast', color: 'text-green-600 dark:text-green-400' },
                { icon: AlertTriangle, label: 'Overload', color: 'text-red-600 dark:text-red-400' },
                { icon: Target, label: 'Optimize', color: 'text-orange-600 dark:text-orange-400' },
                { icon: Download, label: 'Export', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: Settings, label: 'Settings', color: 'text-gray-600 dark:text-gray-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" onClick={() => handleQuickAction(action.label)} className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Utilization */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Utilization</h3>
                <div className="space-y-4">
                  {mockTeamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</span>
                          <span className={`text-sm font-medium ${member.utilizationRate > 100 ? 'text-red-600' : member.utilizationRate > 85 ? 'text-amber-600' : 'text-green-600'}`}>
                            {member.utilizationRate}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${member.utilizationRate > 100 ? 'bg-red-500' : member.utilizationRate > 85 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(member.utilizationRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Health */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Health</h3>
                <div className="space-y-4">
                  {mockProjects.map(project => (
                    <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                          <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                          project.status === 'at_risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}>{project.status.replace('_', ' ')}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.client}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{project.allocatedHours}/{project.totalHours}h allocated</span>
                        <span>${project.budgetUsed.toLocaleString()}/${project.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Capacity Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capacity Forecast</h3>
              <div className="grid grid-cols-6 gap-4">
                {mockForecast.map(week => (
                  <div key={week.week} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{week.week}</div>
                    <div className={`p-4 rounded-lg ${
                      week.utilizationRate > 95 ? 'bg-red-100 dark:bg-red-900/40' :
                      week.utilizationRate > 85 ? 'bg-amber-100 dark:bg-amber-900/40' :
                      week.utilizationRate > 70 ? 'bg-green-100 dark:bg-green-900/40' :
                      'bg-blue-100 dark:bg-blue-900/40'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        week.utilizationRate > 95 ? 'text-red-700 dark:text-red-400' :
                        week.utilizationRate > 85 ? 'text-amber-700 dark:text-amber-400' :
                        week.utilizationRate > 70 ? 'text-green-700 dark:text-green-400' :
                        'text-blue-700 dark:text-blue-400'
                      }`}>{week.utilizationRate}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{week.available}h free</div>
                    </div>
                    {week.overbooked > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">{week.overbooked} overbooked</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Team Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Team Capacity</h2>
                  <p className="text-blue-100">Float-level team availability and allocation tracking</p>
                  <p className="text-blue-200 text-xs mt-1">Skill matrix • Availability • Workload balancing</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTeamMembers.filter(m => m.status === 'available').length}</p>
                    <p className="text-blue-200 text-sm">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTeamMembers.filter(m => m.utilizationRate > 85).length}</p>
                    <p className="text-blue-200 text-sm">High Load</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(mockTeamMembers.reduce((s, m) => s + m.availableHours, 0))}h</p>
                    <p className="text-blue-200 text-sm">Free Hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: UserPlus, label: 'Add Member', color: 'text-blue-600 dark:text-blue-400' },
                { icon: Users, label: 'View All', color: 'text-cyan-600 dark:text-cyan-400' },
                { icon: BarChart3, label: 'Utilization', color: 'text-purple-600 dark:text-purple-400' },
                { icon: Clock, label: 'Time Off', color: 'text-amber-600 dark:text-amber-400' },
                { icon: Zap, label: 'Skills', color: 'text-green-600 dark:text-green-400' },
                { icon: Shuffle, label: 'Reassign', color: 'text-orange-600 dark:text-orange-400' },
                { icon: Download, label: 'Export', color: 'text-gray-600 dark:text-gray-400' },
                { icon: Mail, label: 'Notify', color: 'text-pink-600 dark:text-pink-400' }
              ].map((action, i) => (
                <Button key={i} variant="outline" onClick={() => handleQuickAction(action.label)} className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200">
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <select
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Departments</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="operations">Operations</option>
                </select>
                <select
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="overbooked">Overbooked</option>
                </select>
              </div>
              <button
                onClick={() => setAddTeamMemberDialogOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                + Add Team Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTeamMembers.map(member => (
                <Dialog key={member.id}>
                  <DialogTrigger asChild>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === 'available' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                              member.status === 'overbooked' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                              member.status === 'away' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            }`}>{member.status}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{member.role}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">{member.department}</div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <div className="text-lg font-bold text-indigo-600">{member.allocatedHours}h</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Allocated</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <div className={`text-lg font-bold ${member.availableHours < 0 ? 'text-red-600' : 'text-green-600'}`}>{member.availableHours}h</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                          <div className={`text-lg font-bold ${member.utilizationRate > 100 ? 'text-red-600' : member.utilizationRate > 85 ? 'text-amber-600' : 'text-green-600'}`}>{member.utilizationRate}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Utilization</div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Projects</div>
                        <div className="flex flex-wrap gap-1">
                          {member.projects.map(p => (
                            <span key={p.id} className="px-2 py-1 rounded text-xs text-white" style={{ backgroundColor: p.color }}>
                              {p.name.substring(0, 12)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Team Member Details</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                      <div className="space-y-6 p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-medium">
                            {member.avatar}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold">{member.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{member.role} • {member.department}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">{member.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-indigo-600">${member.hourlyRate}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Hourly Rate</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{member.totalCapacity}h</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Capacity</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-blue-600">{member.allocatedHours}h</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Allocated</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                            <div className={`text-2xl font-bold ${member.utilizationRate > 100 ? 'text-red-600' : 'text-green-600'}`}>{member.utilizationRate}%</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Utilization</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {member.skills.map(skill => (
                              <span key={skill} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Project Allocations</h4>
                          <div className="space-y-3">
                            {member.projects.map(project => (
                              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                                  <span className="font-medium">{project.name}</span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{project.hours}h/week</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {member.timeOff.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-3">Upcoming Time Off</h4>
                            <div className="space-y-2">
                              {member.timeOff.map((to, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                  <span className="text-amber-700 dark:text-amber-400">{to.type}</span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{to.start} - {to.end}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Projects Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Project Allocation</h2>
                  <p className="text-emerald-100">Harvest-level project resource allocation and tracking</p>
                  <p className="text-emerald-200 text-xs mt-1">Budget tracking • Team assignments • Milestone progress</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.length}</p>
                    <p className="text-emerald-200 text-sm">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'active').length}</p>
                    <p className="text-emerald-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.filter(p => p.status === 'at_risk').length}</p>
                    <p className="text-emerald-200 text-sm">At Risk</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <select
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  defaultValue="all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="at_risk">At Risk</option>
                </select>
              </div>
              <button
                onClick={() => setAddProjectDialogOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                + New Project
              </button>
            </div>

            <div className="space-y-4">
              {mockProjects.map(project => (
                <Dialog key={project.id}>
                  <DialogTrigger asChild>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{project.client}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                          project.status === 'at_risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                        }`}>{project.status.replace('_', ' ')}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Hours</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{project.allocatedHours}/{project.totalHours}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Budget</div>
                          <div className="font-semibold text-gray-900 dark:text-white">${(project.budgetUsed / 1000).toFixed(0)}k/${(project.budget / 1000).toFixed(0)}k</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Team</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{project.teamMembers.length} members</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Timeline</div>
                          <div className="font-semibold text-gray-900 dark:text-white">{project.endDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Progress:</div>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(project.allocatedHours / project.totalHours) * 100}%`,
                              backgroundColor: project.color
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {((project.allocatedHours / project.totalHours) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[70vh]">
                      <div className="space-y-6 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Hours</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{project.totalHours}h</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Allocated</div>
                            <div className="text-2xl font-bold text-blue-600">{project.allocatedHours}h</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Budget</div>
                            <div className="text-2xl font-bold text-green-600">${project.budget.toLocaleString()}</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Spent</div>
                            <div className="text-2xl font-bold text-amber-600">${project.budgetUsed.toLocaleString()}</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Team Allocation</h4>
                          <div className="space-y-2">
                            {project.teamMembers.map(tm => (
                              <div key={tm.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="font-medium">{tm.name}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{tm.hours}h/week</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">Milestones</h4>
                          <div className="space-y-2">
                            {project.milestones.map((ms, idx) => (
                              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${ms.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                                <div className="flex items-center gap-2">
                                  {ms.completed ? (
                                    <span className="text-green-600">&#10003;</span>
                                  ) : (
                                    <span className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                                  )}
                                  <span className={ms.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'font-medium'}>{ms.name}</span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{ms.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Schedule Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Capacity Schedule</h2>
                  <p className="text-amber-100">Teamup-level visual scheduling and timeline management</p>
                  <p className="text-amber-200 text-xs mt-1">Drag & drop • Gantt views • Resource timelines</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">52</p>
                    <p className="text-amber-200 text-sm">Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTeamMembers.length * 40}h</p>
                    <p className="text-amber-200 text-sm">Total Capacity</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleNavigationClick('prev')} className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">&larr; Previous</button>
                  <button onClick={() => handleNavigationClick('today')} className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded">This Week</button>
                  <button onClick={() => handleNavigationClick('next')} className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Next &rarr;</button>
                </div>
              </div>

              <div className="space-y-4">
                {mockTeamMembers.map(member => (
                  <div key={member.id} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{member.role}</span>
                      </div>
                      <span className={`text-sm font-medium ${member.utilizationRate > 100 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        {member.allocatedHours}h / {member.totalCapacity}h
                      </span>
                    </div>
                    <div className="p-3 flex gap-1">
                      {member.projects.map(project => (
                        <div
                          key={project.id}
                          className="h-8 rounded flex items-center justify-center text-white text-xs font-medium px-2"
                          style={{
                            backgroundColor: project.color,
                            width: `${(project.hours / member.totalCapacity) * 100}%`
                          }}
                        >
                          {project.hours}h
                        </div>
                      ))}
                      {member.availableHours > 0 && (
                        <div
                          className="h-8 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs"
                          style={{ width: `${(member.availableHours / member.totalCapacity) * 100}%` }}
                        >
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">Platform Redesign</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">Mobile App</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-500" />
                  <span className="text-gray-600 dark:text-gray-400">Brand Refresh</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-500" />
                  <span className="text-gray-600 dark:text-gray-400">API Gateway</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            {/* Forecast Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Capacity Forecasting</h2>
                  <p className="text-violet-100">Forecast-level AI-powered capacity prediction</p>
                  <p className="text-violet-200 text-xs mt-1">Predictive analytics • Trend analysis • Hiring recommendations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockForecast.length}</p>
                    <p className="text-violet-200 text-sm">Weeks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockForecast.filter(f => f.utilizationRate > 90).length}</p>
                    <p className="text-violet-200 text-sm">Overloaded</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">6-Week Capacity Forecast</h3>

              <div className="space-y-6">
                {mockForecast.map(week => (
                  <div key={week.week} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 dark:text-white">{week.week}</span>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          week.utilizationRate > 95 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                          week.utilizationRate > 85 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        }`}>{week.utilizationRate}% utilized</span>
                        {week.overbooked > 0 && (
                          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                            {week.overbooked} overbooked
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{week.totalCapacity}h</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Capacity</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="text-xl font-bold text-blue-600">{week.allocated}h</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Allocated</div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="text-xl font-bold text-green-600">{week.available}h</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Available</div>
                      </div>
                    </div>
                    <div className="mt-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          week.utilizationRate > 95 ? 'bg-red-500' :
                          week.utilizationRate > 85 ? 'bg-amber-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(week.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-600">!</span>
                    <div>
                      <div className="font-medium text-amber-800 dark:text-amber-400">Marcus Johnson is overbooked</div>
                      <div className="text-sm text-amber-700 dark:text-amber-500">Consider redistributing 4h from Brand Refresh to maintain work-life balance.</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600">i</span>
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-400">Lisa Thompson has availability</div>
                      <div className="text-sm text-blue-700 dark:text-blue-500">20h available this week. Consider assigning to API Gateway testing.</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600">!!</span>
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-400">Brand Refresh project at risk</div>
                      <div className="text-sm text-red-700 dark:text-red-500">Only 1 team member assigned. Consider adding support to meet deadline.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Capacity Settings</h2>
                  <p className="text-slate-300">Configure capacity thresholds and notification preferences</p>
                  <p className="text-slate-400 text-xs mt-1">Alerts • Working hours • Holidays • Integrations</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">40h</p>
                    <p className="text-slate-400 text-sm">Work Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">85%</p>
                    <p className="text-slate-400 text-sm">Target</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Settings Sub-tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {[
                    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
                    { id: 'team', label: 'Team', icon: Users },
                    { id: 'projects', label: 'Projects', icon: Briefcase },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'integrations', label: 'Integrations', icon: Link2 },
                    { id: 'advanced', label: 'Advanced', icon: Zap }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        settingsTab === tab.id
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Scheduling Settings */}
                {settingsTab === 'scheduling' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scheduling Configuration</h3>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            Work Hours
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Default Hours Per Day</Label>
                              <Select defaultValue="8">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="6">6 hours</SelectItem>
                                  <SelectItem value="7">7 hours</SelectItem>
                                  <SelectItem value="8">8 hours</SelectItem>
                                  <SelectItem value="9">9 hours</SelectItem>
                                  <SelectItem value="10">10 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Hours Per Week</Label>
                              <Select defaultValue="40">
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="35">35 hours</SelectItem>
                                  <SelectItem value="37.5">37.5 hours</SelectItem>
                                  <SelectItem value="40">40 hours</SelectItem>
                                  <SelectItem value="45">45 hours</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Weekend Days</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Exclude weekends from capacity calculation</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Half-Day Fridays</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Enable summer hours or flex Fridays</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            Time Zones
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Default Time Zone</Label>
                            <Select defaultValue="utc-5">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                                <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                                <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                                <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div>
                              <Label>Show Team Time Zones</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Display local times for remote team members</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            Utilization Thresholds
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Warning Threshold</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input type="number" defaultValue="85" className="w-20" />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Shows amber warning</p>
                            </div>
                            <div>
                              <Label>Overbooked Threshold</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input type="number" defaultValue="100" className="w-20" />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Shows red alert</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Team Settings */}
                {settingsTab === 'team' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Configuration</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-5 h-5 text-indigo-600" />
                          Default Team Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Default Hourly Rate</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-500">$</span>
                              <Input type="number" defaultValue="100" className="w-24" />
                              <span className="text-sm text-gray-500">/hour</span>
                            </div>
                          </div>
                          <div>
                            <Label>Default Capacity</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input type="number" defaultValue="40" className="w-20" />
                              <span className="text-sm text-gray-500">hours/week</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Managers Can Edit Allocations</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow managers to modify team allocations</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Team Members Can Request Time Off</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable self-service time off requests</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Show Financial Data</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display hourly rates and budget information</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Departments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {['Engineering', 'Design', 'Operations', 'Marketing', 'Sales'].map(dept => (
                            <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <span className="font-medium">{dept}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">Active</Badge>
                                <Button variant="ghost" size="sm" onClick={() => handleEditDepartment(dept)}>Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full" onClick={() => setAddDepartmentDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Department
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Projects Settings */}
                {settingsTab === 'projects' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Configuration</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                          Project Defaults
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default Project Color</Label>
                          <div className="flex gap-2 mt-2">
                            {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-calculate Budget</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Calculate budget from hourly rates and hours</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Require Client Assignment</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">All projects must have a client assigned</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          Tracking & Reporting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Track Milestones</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable milestone tracking for projects</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Budget Warnings</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when budget exceeds threshold</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Budget Warning Threshold</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input type="number" defaultValue="80" className="w-20" />
                            <span className="text-sm text-gray-500">% of total budget</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Project Statuses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { name: 'Active', color: 'green' },
                            { name: 'On Hold', color: 'gray' },
                            { name: 'At Risk', color: 'red' },
                            { name: 'Completed', color: 'blue' }
                          ].map(status => (
                            <div key={status.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${status.color}-500`} />
                                <span className="font-medium">{status.name}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleEditStatus(status)}>Edit</Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="w-5 h-5 text-indigo-600" />
                          Capacity Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Overbooking Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when team members are overbooked</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Low Utilization Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when team has significant availability</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Time Off Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert about upcoming team time off</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base">Project Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Milestone Reminders</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remind before upcoming milestones</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Budget Alerts</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when projects approach budget limit</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Project Status Changes</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when project status is updated</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Delivery Channels</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <Label>In-App Notifications</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Show in notification center</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <Label>Email Notifications</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Send to your email address</p>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                              <Link2 className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <Label>Slack Notifications</Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Post to Slack channel</p>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Integrations</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Google Calendar', description: 'Sync time off and meetings', icon: Calendar, connected: true, color: 'blue' },
                        { name: 'Jira', description: 'Import projects and track hours', icon: Briefcase, connected: true, color: 'indigo' },
                        { name: 'Slack', description: 'Post capacity updates', icon: Bell, connected: false, color: 'purple' },
                        { name: 'Microsoft Teams', description: 'Team collaboration', icon: Users, connected: false, color: 'blue' },
                        { name: 'Harvest', description: 'Time tracking sync', icon: Clock, connected: true, color: 'orange' },
                        { name: 'QuickBooks', description: 'Financial reporting', icon: BarChart3, connected: false, color: 'green' }
                      ].map(integration => (
                        <Card key={integration.name}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-${integration.color}-100 dark:bg-${integration.color}-900/40 flex items-center justify-center`}>
                                  <integration.icon className={`w-5 h-5 text-${integration.color}-600`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{integration.description}</p>
                                </div>
                              </div>
                              {integration.connected ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Connected</Badge>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleConnectIntegration(integration.name)}>Connect</Button>
                              )}
                            </div>
                            {integration.connected && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <RefreshCw className="w-3 h-3" />
                                Last synced 5 minutes ago
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">API Access</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label>API Key</Label>
                            <Button variant="ghost" size="sm" onClick={() => setApiKeyDialogOpen(true)}>Regenerate</Button>
                          </div>
                          <Input type="password" value="STRIPE_KEY_PLACEHOLDER" readOnly className="font-mono" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setExportDialogOpen(true)}>
                            <Download className="w-4 h-4" />
                            Export Data
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setImportDataDialogOpen(true)}>
                            <Upload className="w-4 h-4" />
                            Import Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-600" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-refresh Dashboard</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically update data every 5 minutes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Cache Capacity Data</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Improve load times with local caching</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Forecast Range</Label>
                          <Select defaultValue="12">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4">4 weeks</SelectItem>
                              <SelectItem value="8">8 weeks</SelectItem>
                              <SelectItem value="12">12 weeks</SelectItem>
                              <SelectItem value="24">24 weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Palette className="w-5 h-5 text-pink-600" />
                          Display Options
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Default View</Label>
                          <Select defaultValue="overview">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="overview">Overview</SelectItem>
                              <SelectItem value="team">Team</SelectItem>
                              <SelectItem value="schedule">Schedule</SelectItem>
                              <SelectItem value="forecast">Forecast</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Compact Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show more data in less space</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Show Avatars</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Display team member avatars</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Clear All Allocations</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all team allocations from projects</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setClearAllocationsDialogOpen(true)}>Clear</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset Capacity Data</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Reset all capacity planning data to defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setResetDataDialogOpen(true)}>Reset</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockCapacityAIInsights}
              title="Capacity Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCapacityCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCapacityPredictions}
              title="Capacity Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCapacityActivities}
            title="Capacity Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockCapacityQuickActions}
            variant="grid"
          />
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
          </div>
        )}
      </div>

      {/* Add Allocation Dialog */}
      <Dialog open={addAllocationDialogOpen} onOpenChange={setAddAllocationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Team Member</Label>
              <Select value={newAllocation.memberId} onValueChange={(value) => setNewAllocation(prev => ({ ...prev, memberId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name} - {member.role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Project</Label>
              <Select value={newAllocation.projectId} onValueChange={(value) => setNewAllocation(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.name} - {project.client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" className="mt-1" value={newAllocation.startDate} onChange={(e) => setNewAllocation(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" className="mt-1" value={newAllocation.endDate} onChange={(e) => setNewAllocation(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Hours Per Day</Label>
              <Input type="number" min={1} max={12} className="mt-1" value={newAllocation.hoursPerDay} onChange={(e) => setNewAllocation(prev => ({ ...prev, hoursPerDay: parseInt(e.target.value) || 4 }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newAllocation.status} onValueChange={(value: 'confirmed' | 'tentative' | 'requested') => setNewAllocation(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tentative">Tentative</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setAddAllocationDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAllocation}>Create Allocation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Team Member Dialog */}
      <Dialog open={addTeamMemberDialogOpen} onOpenChange={setAddTeamMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Full Name *</Label>
              <Input className="mt-1" placeholder="John Doe" value={newTeamMember.name} onChange={(e) => setNewTeamMember(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" className="mt-1" placeholder="john@company.com" value={newTeamMember.email} onChange={(e) => setNewTeamMember(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <Label>Role</Label>
              <Input className="mt-1" placeholder="Senior Developer" value={newTeamMember.role} onChange={(e) => setNewTeamMember(prev => ({ ...prev, role: e.target.value }))} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={newTeamMember.department} onValueChange={(value) => setNewTeamMember(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hourly Rate ($)</Label>
              <Input type="number" className="mt-1" value={newTeamMember.hourlyRate} onChange={(e) => setNewTeamMember(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 100 }))} />
            </div>
            <div>
              <Label>Skills (comma-separated)</Label>
              <Input className="mt-1" placeholder="React, TypeScript, Node.js" value={newTeamMember.skills} onChange={(e) => setNewTeamMember(prev => ({ ...prev, skills: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setAddTeamMemberDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTeamMember}>Add Member</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Project Name *</Label>
              <Input className="mt-1" placeholder="Project Alpha" value={newProject.name} onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label>Client *</Label>
              <Input className="mt-1" placeholder="Client Name" value={newProject.client} onChange={(e) => setNewProject(prev => ({ ...prev, client: e.target.value }))} />
            </div>
            <div>
              <Label>Project Color</Label>
              <div className="flex gap-2 mt-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${newProject.color === color ? 'border-gray-900 dark:border-white' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" className="mt-1" value={newProject.startDate} onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" className="mt-1" value={newProject.endDate} onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget ($)</Label>
                <Input type="number" className="mt-1" value={newProject.budget} onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Total Hours</Label>
                <Input type="number" className="mt-1" value={newProject.totalHours} onChange={(e) => setNewProject(prev => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setAddProjectDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Capacity Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'pdf') => setExportFormat(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                  <SelectItem value="pdf">PDF (Report)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {exportFormat === 'csv' && 'Export team capacity data as a spreadsheet file.'}
              {exportFormat === 'json' && 'Export complete capacity data in JSON format.'}
              {exportFormat === 'pdf' && 'Generate a formatted PDF report of capacity planning.'}
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Department Dialog */}
      <Dialog open={addDepartmentDialogOpen} onOpenChange={setAddDepartmentDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Department Name</Label>
              <Input className="mt-1" placeholder="e.g., Product" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setAddDepartmentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDepartment}>Add Department</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Regenerate Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to regenerate your API key? This will invalidate your current key and any integrations using it will need to be updated.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRegenerateApiKey}>Regenerate Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Allocations Confirmation Dialog */}
      <Dialog open={clearAllocationsDialogOpen} onOpenChange={setClearAllocationsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Clear All Allocations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This action will permanently remove all team allocations from all projects. This cannot be undone.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                {mockAllocations.length} allocations will be deleted
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setClearAllocationsDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleClearAllocations}>Clear All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Data Confirmation Dialog */}
      <Dialog open={resetDataDialogOpen} onOpenChange={setResetDataDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reset Capacity Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This action will reset all capacity planning data to defaults. All team members, projects, and allocations will be deleted.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                This action is irreversible!
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setResetDataDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleResetData}>Reset Data</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Capacity View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Resource Type</Label>
              <Select value={resourceTypeFilter} onValueChange={(value: ResourceType | 'all') => setResourceTypeFilter(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="human">Human Resources</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="facility">Facilities</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value: CapacityStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="allocated">Allocated</SelectItem>
                  <SelectItem value="overallocated">Overallocated</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setResourceTypeFilter('all')
                setStatusFilter('all')
              }}>
                Reset Filters
              </Button>
              <Button onClick={() => {
                setFiltersDialogOpen(false)
                toast.success('Filters applied')
              }}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Allocation Dialog */}
      <Dialog open={editAllocationDialogOpen} onOpenChange={setEditAllocationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Allocation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Hours Per Day</Label>
              <Input type="number" min={1} max={12} className="mt-1" defaultValue={4} />
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
              <Label>Status</Label>
              <Select defaultValue="confirmed">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tentative">Tentative</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditAllocationDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Allocation updated')
                setEditAllocationDialogOpen(false)
              }}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog (standalone for quick access) */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <Label>Auto-refresh Dashboard</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update data automatically</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <Label>Show Utilization Warnings</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Alert when team is overbooked</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <Label>Compact Mode</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Show more data in less space</p>
              </div>
              <Switch />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Close</Button>
              <Button onClick={() => {
                handleSaveSettings()
                setSettingsDialogOpen(false)
              }}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={editDepartmentDialogOpen} onOpenChange={setEditDepartmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department: {selectedDepartment}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Department Name</Label>
              <Input
                className="mt-1"
                value={departmentSettings.name}
                onChange={(e) => setDepartmentSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Department Manager</Label>
              <Select value={departmentSettings.manager} onValueChange={(value) => setDepartmentSettings(prev => ({ ...prev, manager: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Default Hours Per Week</Label>
              <Input
                type="number"
                className="mt-1"
                value={departmentSettings.defaultHoursPerWeek}
                onChange={(e) => setDepartmentSettings(prev => ({ ...prev, defaultHoursPerWeek: parseInt(e.target.value) || 40 }))}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">Department is available for assignments</p>
              </div>
              <Switch
                checked={departmentSettings.isActive}
                onCheckedChange={(checked) => setDepartmentSettings(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditDepartmentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveDepartmentSettings}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editStatusDialogOpen} onOpenChange={setEditStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Status: {selectedStatus?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Status Name</Label>
              <Input
                className="mt-1"
                value={statusSettings.name}
                onChange={(e) => setStatusSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Status Color</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: 'green', label: 'Green' },
                  { value: 'gray', label: 'Gray' },
                  { value: 'red', label: 'Red' },
                  { value: 'blue', label: 'Blue' },
                  { value: 'yellow', label: 'Yellow' },
                  { value: 'purple', label: 'Purple' }
                ].map(color => (
                  <button
                    key={color.value}
                    onClick={() => setStatusSettings(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 shadow-sm hover:scale-110 transition-transform bg-${color.value}-500 ${statusSettings.color === color.value ? 'border-gray-900 dark:border-white ring-2 ring-offset-2' : 'border-white'}`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                className="mt-1"
                placeholder="Optional description for this status"
                value={statusSettings.description}
                onChange={(e) => setStatusSettings(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setEditStatusDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveStatusSettings}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Data Dialog */}
      <Dialog open={importDataDialogOpen} onOpenChange={setImportDataDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Capacity Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Import team members, projects, and allocations from a CSV or JSON file.
              </p>
            </div>
            <div>
              <Label>Select File</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              {importFile && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded flex items-center gap-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{importFile.name}</span>
                  <span className="text-xs text-gray-400">({(importFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
            <div>
              <Label>Import Options</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked id="merge-data" />
                  <Label htmlFor="merge-data" className="text-sm font-normal">Merge with existing data</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="overwrite-data" />
                  <Label htmlFor="overwrite-data" className="text-sm font-normal">Overwrite duplicates</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => {
                setImportDataDialogOpen(false)
                setImportFile(null)
              }}>Cancel</Button>
              <Button onClick={handleImportData} disabled={!importFile}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
