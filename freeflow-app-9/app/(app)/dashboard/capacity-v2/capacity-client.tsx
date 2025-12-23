'use client'
import { useState, useMemo } from 'react'
import { useCapacity, type Capacity, type ResourceType, type CapacityStatus } from '@/lib/hooks/use-capacity'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

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

export default function CapacityClient({ initialCapacity }: { initialCapacity: Capacity[] }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<ResourceType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CapacityStatus | 'all'>('all')
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const { capacity, loading, error } = useCapacity({ resourceType: resourceTypeFilter, status: statusFilter })
  const displayCapacity = capacity.length > 0 ? capacity : initialCapacity

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
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Export Schedule
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
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
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ {week.overbooked} overbooked</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
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
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
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
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
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
                                    <span className="text-green-600">✓</span>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">← Previous</button>
                  <button className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded">This Week</button>
                  <button className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Next →</button>
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
                    <span className="text-amber-600">⚠️</span>
                    <div>
                      <div className="font-medium text-amber-800 dark:text-amber-400">Marcus Johnson is overbooked</div>
                      <div className="text-sm text-amber-700 dark:text-amber-500">Consider redistributing 4h from Brand Refresh to maintain work-life balance.</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600">💡</span>
                    <div>
                      <div className="font-medium text-blue-800 dark:text-blue-400">Lisa Thompson has availability</div>
                      <div className="text-sm text-blue-700 dark:text-blue-500">20h available this week. Consider assigning to API Gateway testing.</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600">🚨</span>
                    <div>
                      <div className="font-medium text-red-800 dark:text-red-400">Brand Refresh project at risk</div>
                      <div className="text-sm text-red-700 dark:text-red-500">Only 1 team member assigned. Consider adding support to meet deadline.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
          </div>
        )}
      </div>
    </div>
  )
}
