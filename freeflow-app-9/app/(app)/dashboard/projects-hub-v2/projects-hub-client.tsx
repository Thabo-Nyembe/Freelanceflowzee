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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FolderOpen, Plus, Search, Filter, DollarSign, Users, CheckCircle2, Calendar, TrendingUp,
  Briefcase, Eye, Edit, Clock, Target, BarChart3, Settings, ArrowUpRight, Trash2, LayoutGrid,
  List, GanttChartSquare, ChevronDown, MoreHorizontal, Flag, Tag, MessageSquare, Archive, Star,
  Sparkles, Zap, Timer, AlertTriangle, CheckSquare, Play, Pause, Milestone, GitBranch, Layers,
  PieChart, ArrowRight, RefreshCw, Copy, Workflow, FileText, Bell, Shield, Link, ExternalLink
} from 'lucide-react'

// Types
type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'on_hold'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type SprintStatus = 'upcoming' | 'active' | 'completed'

interface Project {
  id: string
  name: string
  description?: string
  projectCode: string
  status: ProjectStatus
  priority: Priority
  progress: number
  budget?: number
  spent: number
  startDate?: string
  endDate?: string
  teamMembers: string[]
  tags: string[]
  tasksTotal: number
  tasksCompleted: number
}

interface Sprint {
  id: string
  name: string
  goal: string
  status: SprintStatus
  startDate: string
  endDate: string
  velocity: number
  tasksTotal: number
  tasksCompleted: number
}

interface BacklogItem {
  id: string
  title: string
  description: string
  priority: Priority
  points: number
  type: 'feature' | 'bug' | 'improvement' | 'task'
  assignee?: string
  sprint?: string
}

interface RoadmapItem {
  id: string
  title: string
  quarter: string
  status: 'planned' | 'in_progress' | 'completed'
  progress: number
  projectIds: string[]
}

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  runsCount: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  tasksCount: number
  usageCount: number
}

// Mock Data
const statusColumns = [
  { id: 'planning', label: 'Planning', color: 'bg-purple-500', icon: '📋' },
  { id: 'active', label: 'In Progress', color: 'bg-blue-500', icon: '🚀' },
  { id: 'review', label: 'Review', color: 'bg-yellow-500', icon: '👀' },
  { id: 'completed', label: 'Completed', color: 'bg-green-500', icon: '✅' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-gray-500', icon: '⏸️' }
]

const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Critical' },
  high: { color: 'bg-orange-500', label: 'High' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  low: { color: 'bg-gray-400', label: 'Low' }
}

const mockProjects: Project[] = [
  { id: '1', name: 'Website Redesign', description: 'Complete overhaul of company website', projectCode: 'WEB-001', status: 'active', priority: 'high', progress: 65, budget: 50000, spent: 32500, startDate: '2024-01-01', endDate: '2024-03-31', teamMembers: ['Sarah', 'Mike', 'Emily'], tags: ['frontend', 'design'], tasksTotal: 24, tasksCompleted: 16 },
  { id: '2', name: 'Mobile App v2', description: 'Next version of mobile application', projectCode: 'MOB-002', status: 'active', priority: 'critical', progress: 40, budget: 80000, spent: 32000, startDate: '2024-01-15', endDate: '2024-05-30', teamMembers: ['Alex', 'Jordan', 'Taylor'], tags: ['mobile', 'ios', 'android'], tasksTotal: 48, tasksCompleted: 19 },
  { id: '3', name: 'API Integration', description: 'Third-party API integrations', projectCode: 'API-003', status: 'review', priority: 'medium', progress: 90, budget: 25000, spent: 22500, startDate: '2024-01-10', endDate: '2024-02-28', teamMembers: ['Mike', 'Alex'], tags: ['backend', 'api'], tasksTotal: 12, tasksCompleted: 11 },
  { id: '4', name: 'Security Audit', description: 'Comprehensive security review', projectCode: 'SEC-004', status: 'planning', priority: 'high', progress: 10, budget: 15000, spent: 1500, startDate: '2024-02-01', endDate: '2024-02-29', teamMembers: ['Jordan'], tags: ['security'], tasksTotal: 8, tasksCompleted: 1 },
  { id: '5', name: 'Documentation Update', description: 'Update all technical documentation', projectCode: 'DOC-005', status: 'completed', priority: 'low', progress: 100, budget: 5000, spent: 4800, startDate: '2023-12-01', endDate: '2024-01-15', teamMembers: ['Emily'], tags: ['docs'], tasksTotal: 15, tasksCompleted: 15 },
  { id: '6', name: 'Performance Optimization', description: 'System performance improvements', projectCode: 'PERF-006', status: 'on_hold', priority: 'medium', progress: 25, budget: 20000, spent: 5000, startDate: '2024-01-20', endDate: '2024-04-15', teamMembers: ['Sarah', 'Alex'], tags: ['performance'], tasksTotal: 20, tasksCompleted: 5 }
]

const mockSprints: Sprint[] = [
  { id: '1', name: 'Sprint 1 - Foundation', goal: 'Set up core infrastructure', status: 'completed', startDate: '2024-01-01', endDate: '2024-01-14', velocity: 42, tasksTotal: 15, tasksCompleted: 15 },
  { id: '2', name: 'Sprint 2 - Features', goal: 'Implement main features', status: 'active', startDate: '2024-01-15', endDate: '2024-01-28', velocity: 38, tasksTotal: 18, tasksCompleted: 12 },
  { id: '3', name: 'Sprint 3 - Polish', goal: 'Bug fixes and polish', status: 'upcoming', startDate: '2024-01-29', endDate: '2024-02-11', velocity: 0, tasksTotal: 10, tasksCompleted: 0 }
]

const mockBacklog: BacklogItem[] = [
  { id: '1', title: 'User authentication flow', description: 'Implement OAuth2 authentication', priority: 'critical', points: 8, type: 'feature', assignee: 'Alex', sprint: '2' },
  { id: '2', title: 'Dashboard widgets', description: 'Add customizable dashboard widgets', priority: 'high', points: 5, type: 'feature', sprint: '2' },
  { id: '3', title: 'Fix login timeout', description: 'Session expires too quickly', priority: 'high', points: 3, type: 'bug', assignee: 'Mike' },
  { id: '4', title: 'API rate limiting', description: 'Implement rate limiting for API', priority: 'medium', points: 5, type: 'improvement' },
  { id: '5', title: 'Mobile responsive fixes', description: 'Fix layout issues on mobile', priority: 'medium', points: 3, type: 'bug', sprint: '3' },
  { id: '6', title: 'Export to PDF', description: 'Add PDF export functionality', priority: 'low', points: 8, type: 'feature' }
]

const mockRoadmap: RoadmapItem[] = [
  { id: '1', title: 'Q1 - Platform Launch', quarter: 'Q1 2024', status: 'in_progress', progress: 65, projectIds: ['1', '2'] },
  { id: '2', title: 'Q2 - Enterprise Features', quarter: 'Q2 2024', status: 'planned', progress: 0, projectIds: ['4'] },
  { id: '3', title: 'Q3 - Scale & Optimize', quarter: 'Q3 2024', status: 'planned', progress: 0, projectIds: ['6'] },
  { id: '4', title: 'Q4 - Global Expansion', quarter: 'Q4 2024', status: 'planned', progress: 0, projectIds: [] }
]

const mockAutomations: Automation[] = [
  { id: '1', name: 'Auto-assign reviewer', trigger: 'When task moves to Review', action: 'Assign to team lead', enabled: true, runsCount: 45 },
  { id: '2', name: 'Notify on overdue', trigger: 'When task is overdue', action: 'Send Slack notification', enabled: true, runsCount: 12 },
  { id: '3', name: 'Close completed sprint', trigger: 'When all tasks done', action: 'Move sprint to completed', enabled: false, runsCount: 3 },
  { id: '4', name: 'Auto-label bugs', trigger: 'When issue contains "bug"', action: 'Add bug label', enabled: true, runsCount: 28 }
]

const mockTemplates: Template[] = [
  { id: '1', name: 'Website Project', description: 'Standard website development template', category: 'Development', tasksCount: 25, usageCount: 15 },
  { id: '2', name: 'Mobile App', description: 'iOS and Android app development', category: 'Development', tasksCount: 40, usageCount: 8 },
  { id: '3', name: 'Marketing Campaign', description: 'Full marketing campaign workflow', category: 'Marketing', tasksCount: 18, usageCount: 22 },
  { id: '4', name: 'Bug Triage', description: 'Bug investigation and fix workflow', category: 'Support', tasksCount: 8, usageCount: 45 },
  { id: '5', name: 'Sprint Planning', description: 'Agile sprint setup template', category: 'Agile', tasksCount: 12, usageCount: 30 }
]

export default function ProjectsHubClient() {
  const [activeTab, setActiveTab] = useState('projects')
  const [viewType, setViewType] = useState<'board' | 'list' | 'timeline'>('board')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = selectedFilter === 'all' || project.status === selectedFilter || project.priority === selectedFilter
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, selectedFilter])

  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, Project[]> = {}
    statusColumns.forEach(col => {
      grouped[col.id] = filteredProjects.filter(p => p.status === col.id)
    })
    return grouped
  }, [filteredProjects])

  const stats = useMemo(() => ({
    total: mockProjects.length,
    active: mockProjects.filter(p => p.status === 'active').length,
    completed: mockProjects.filter(p => p.status === 'completed').length,
    onTrack: mockProjects.filter(p => p.progress >= 50 && p.status !== 'on_hold').length,
    totalBudget: mockProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: mockProjects.reduce((sum, p) => sum + p.spent, 0),
    avgProgress: Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length),
    overdue: mockProjects.filter(p => p.endDate && new Date(p.endDate) < new Date() && p.status !== 'completed').length
  }), [])

  const statsCards = [
    { label: 'Total Projects', value: stats.total.toString(), icon: FolderOpen, color: 'from-blue-500 to-blue-600', trend: '+2' },
    { label: 'Active', value: stats.active.toString(), icon: Play, color: 'from-green-500 to-green-600', trend: '' },
    { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', trend: '+1' },
    { label: 'On Track', value: stats.onTrack.toString(), icon: Target, color: 'from-purple-500 to-purple-600', trend: '' },
    { label: 'Total Budget', value: `$${(stats.totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'from-amber-500 to-amber-600', trend: '' },
    { label: 'Spent', value: `$${(stats.totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'from-orange-500 to-orange-600', trend: '' },
    { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: BarChart3, color: 'from-indigo-500 to-indigo-600', trend: '+5%' },
    { label: 'Overdue', value: stats.overdue.toString(), icon: AlertTriangle, color: 'from-red-500 to-red-600', trend: '' }
  ]

  const getStatusColor = (status: string): string => statusColumns.find(c => c.id === status)?.color || 'bg-gray-500'
  const getPriorityConfig = (priority: Priority) => priorityConfig[priority] || priorityConfig.medium

  const getSprintStatusColor = (status: SprintStatus): string => {
    const colors: Record<SprintStatus, string> = { upcoming: 'bg-gray-100 text-gray-700', active: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700' }
    return colors[status] || 'bg-gray-100'
  }

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = { feature: 'bg-purple-100 text-purple-700', bug: 'bg-red-100 text-red-700', improvement: 'bg-blue-100 text-blue-700', task: 'bg-gray-100 text-gray-700' }
    return colors[type] || 'bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><Briefcase className="h-6 w-6 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects Hub</h1><p className="text-gray-500 dark:text-gray-400">GitHub Projects level management</p></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search projects..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filter</Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={() => setShowNewProjectDialog(true)}><Plus className="h-4 w-4 mr-2" />New Project</Button>
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
            <TabsTrigger value="projects" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><LayoutGrid className="h-4 w-4 mr-2" />Projects</TabsTrigger>
            <TabsTrigger value="roadmap" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Milestone className="h-4 w-4 mr-2" />Roadmap</TabsTrigger>
            <TabsTrigger value="sprints" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><RefreshCw className="h-4 w-4 mr-2" />Sprints</TabsTrigger>
            <TabsTrigger value="backlog" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Layers className="h-4 w-4 mr-2" />Backlog</TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><BarChart3 className="h-4 w-4 mr-2" />Insights</TabsTrigger>
            <TabsTrigger value="automations" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Workflow className="h-4 w-4 mr-2" />Automations</TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><FileText className="h-4 w-4 mr-2" />Templates</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Button variant={viewType === 'board' ? 'default' : 'outline'} size="sm" onClick={() => setViewType('board')}><LayoutGrid className="h-4 w-4 mr-1" />Board</Button>
              <Button variant={viewType === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewType('list')}><List className="h-4 w-4 mr-1" />List</Button>
              <Button variant={viewType === 'timeline' ? 'default' : 'outline'} size="sm" onClick={() => setViewType('timeline')}><GanttChartSquare className="h-4 w-4 mr-1" />Timeline</Button>
            </div>

            {viewType === 'board' && (
              <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
                {statusColumns.map(column => (
                  <div key={column.id} className="min-w-[280px]">
                    <div className="flex items-center justify-between mb-3 px-2">
                      <div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${column.color}`} /><h3 className="font-semibold">{column.label}</h3><Badge variant="secondary" className="text-xs">{projectsByStatus[column.id]?.length || 0}</Badge></div>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-3">
                      {projectsByStatus[column.id]?.map(project => (
                        <Card key={project.id} className={`cursor-pointer hover:shadow-lg border-l-4 ${getStatusColor(project.status)}`} onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2"><h4 className="font-semibold text-sm">{project.name}</h4><Badge variant="outline" className="text-xs"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(project.priority).color} mr-1`} />{getPriorityConfig(project.priority).label}</Badge></div>
                            <div className="flex items-center justify-between text-xs mb-2"><span className="text-gray-500">{project.projectCode}</span><span>{project.tasksCompleted}/{project.tasksTotal} tasks</span></div>
                            <Progress value={project.progress} className="h-1.5 mb-2" />
                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-1">{project.teamMembers.slice(0, 3).map((m, i) => <Avatar key={i} className="h-5 w-5 border-2 border-white"><AvatarFallback className="text-[8px]">{m.slice(0, 2)}</AvatarFallback></Avatar>)}</div>
                              {project.endDate && <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewType === 'list' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th><th className="px-4 py-3"></th></tr></thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredProjects.map(project => (
                        <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedProject(project); setShowProjectDialog(true) }}>
                          <td className="px-4 py-4"><div><p className="font-medium">{project.name}</p><p className="text-xs text-gray-500">{project.projectCode}</p></div></td>
                          <td className="px-4 py-4"><Badge className={getStatusColor(project.status)}>{statusColumns.find(c => c.id === project.status)?.label}</Badge></td>
                          <td className="px-4 py-4"><div className="w-24"><div className="flex justify-between text-xs mb-1"><span>{project.progress}%</span></div><Progress value={project.progress} className="h-1.5" /></div></td>
                          <td className="px-4 py-4">{project.budget ? <div><span className="font-medium">${(project.spent / 1000).toFixed(0)}K</span><span className="text-gray-500"> / ${(project.budget / 1000).toFixed(0)}K</span></div> : '-'}</td>
                          <td className="px-4 py-4">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-4"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {viewType === 'timeline' && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><GanttChartSquare className="h-5 w-5" />Project Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredProjects.map(project => (
                      <div key={project.id} className="flex items-center gap-4">
                        <div className="w-48 truncate text-sm font-medium">{project.name}</div>
                        <div className="flex-1 relative h-8 bg-muted rounded"><div className={`absolute h-full rounded ${getStatusColor(project.status)} opacity-80`} style={{ left: '10%', width: `${Math.max(project.progress, 10)}%` }}><div className="px-2 text-xs text-white truncate leading-8">{project.progress}%</div></div></div>
                        <div className="w-20 text-right text-sm text-gray-500">{project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Roadmap</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Add Milestone</Button></CardHeader>
              <CardContent className="space-y-6">
                {mockRoadmap.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div><h3 className="font-semibold text-lg">{item.title}</h3><p className="text-sm text-gray-500">{item.quarter}</p></div>
                      <Badge className={item.status === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{item.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2"><span className="text-sm text-gray-500">{item.progress}% complete</span></div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex items-center gap-2 mt-3"><span className="text-xs text-gray-500">{item.projectIds.length} projects linked</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="mt-6">
            <div className="grid grid-cols-3 gap-6">
              {mockSprints.map(sprint => (
                <Card key={sprint.id} className={`border-gray-200 dark:border-gray-700 ${sprint.status === 'active' ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between"><CardTitle className="text-lg">{sprint.name}</CardTitle><Badge className={getSprintStatusColor(sprint.status)}>{sprint.status}</Badge></div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{sprint.goal}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm"><span>Tasks</span><span className="font-medium">{sprint.tasksCompleted}/{sprint.tasksTotal}</span></div>
                      <Progress value={(sprint.tasksCompleted / sprint.tasksTotal) * 100} className="h-2" />
                      <div className="flex justify-between text-sm"><span>Velocity</span><span className="font-medium">{sprint.velocity} pts</span></div>
                      <div className="text-xs text-gray-500">{sprint.startDate} - {sprint.endDate}</div>
                    </div>
                    {sprint.status === 'active' && <Button className="w-full mt-4"><Play className="h-4 w-4 mr-2" />View Sprint Board</Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Backlog Tab */}
          <TabsContent value="backlog" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Product Backlog</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Add Item</Button></CardHeader>
              <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
                {mockBacklog.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><h4 className="font-medium">{item.title}</h4><Badge className={getTypeColor(item.type)}>{item.type}</Badge></div>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(item.priority).color} mr-1`} />{getPriorityConfig(item.priority).label}</Badge>
                    <Badge variant="secondary">{item.points} pts</Badge>
                    {item.assignee && <Avatar className="h-8 w-8"><AvatarFallback>{item.assignee.slice(0, 2)}</AvatarFallback></Avatar>}
                    {item.sprint && <Badge className="bg-blue-100 text-blue-700">Sprint {item.sprint}</Badge>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Project Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusColumns.map(col => {
                      const count = mockProjects.filter(p => p.status === col.id).length
                      const percentage = (count / mockProjects.length) * 100
                      return (
                        <div key={col.id}>
                          <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${col.color}`} /><span className="text-sm">{col.label}</span></div><span className="text-sm font-medium">{count}</span></div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Budget Overview</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center mb-6"><p className="text-4xl font-bold">${(stats.totalSpent / 1000).toFixed(0)}K</p><p className="text-gray-500">of ${(stats.totalBudget / 1000).toFixed(0)}K spent</p></div>
                  <Progress value={(stats.totalSpent / stats.totalBudget) * 100} className="h-3 mb-4" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"><p className="text-2xl font-bold text-green-600">${((stats.totalBudget - stats.totalSpent) / 1000).toFixed(0)}K</p><p className="text-xs text-gray-500">Remaining</p></div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><p className="text-2xl font-bold text-blue-600">{Math.round((stats.totalSpent / stats.totalBudget) * 100)}%</p><p className="text-xs text-gray-500">Utilized</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Automations Tab */}
          <TabsContent value="automations" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Workflow Automations</CardTitle><Button><Plus className="h-4 w-4 mr-2" />Create Automation</Button></CardHeader>
              <CardContent className="space-y-4">
                {mockAutomations.map(auto => (
                  <div key={auto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${auto.enabled ? 'bg-green-100' : 'bg-gray-100'}`}><Workflow className={`h-5 w-5 ${auto.enabled ? 'text-green-600' : 'text-gray-400'}`} /></div>
                    <div className="flex-1"><h4 className="font-medium">{auto.name}</h4><p className="text-sm text-gray-500">{auto.trigger} → {auto.action}</p></div>
                    <Badge variant="outline">{auto.runsCount} runs</Badge>
                    <Switch checked={auto.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="grid grid-cols-3 gap-6">
              {mockTemplates.map(template => (
                <Card key={template.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div><Badge variant="outline">{template.category}</Badge></div>
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500"><span>{template.tasksCount} tasks</span><span>Used {template.usageCount} times</span></div>
                    <Button className="w-full mt-4" variant="outline"><Copy className="h-4 w-4 mr-2" />Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Project Updates</p><p className="text-sm text-gray-500">Get notified on project changes</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Task Assignments</p><p className="text-sm text-gray-500">When tasks are assigned to you</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Due Date Reminders</p><p className="text-sm text-gray-500">Reminder before due dates</p></div><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Sprint Updates</p><p className="text-sm text-gray-500">Sprint start and end notifications</p></div><Switch /></div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Permissions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">Default Visibility</p><p className="text-sm text-gray-500">New project visibility</p></div><Select defaultValue="team"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="team">Team Only</SelectItem><SelectItem value="private">Private</SelectItem></SelectContent></Select></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Allow Guest Access</p><p className="text-sm text-gray-500">External collaborators</p></div><Switch /></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Require Approval</p><p className="text-sm text-gray-500">For project creation</p></div><Switch /></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Project Detail Dialog */}
        <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
          <DialogContent className="max-w-3xl">
            {selectedProject && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${getStatusColor(selectedProject.status)}`}><Briefcase className="h-5 w-5 text-white" /></div><div><DialogTitle className="text-xl">{selectedProject.name}</DialogTitle><p className="text-sm text-gray-500">{selectedProject.projectCode}</p></div></div>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Status</p><Badge className={getStatusColor(selectedProject.status)}>{statusColumns.find(c => c.id === selectedProject.status)?.label}</Badge></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Priority</p><Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(selectedProject.priority).color} mr-1`} />{getPriorityConfig(selectedProject.priority).label}</Badge></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Budget</p><p className="text-xl font-bold">${selectedProject.budget?.toLocaleString() || 0}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-1">Progress</p><div className="flex items-center gap-2"><p className="text-xl font-bold">{selectedProject.progress}%</p><Progress value={selectedProject.progress} className="flex-1 h-2" /></div></CardContent></Card>
                  </div>
                  {selectedProject.description && <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-2">Description</p><p>{selectedProject.description}</p></CardContent></Card>}
                  <Card><CardContent className="p-4"><p className="text-sm text-gray-500 mb-2">Team Members</p><div className="flex gap-2">{selectedProject.teamMembers.map((m, i) => <Avatar key={i}><AvatarFallback>{m.slice(0, 2)}</AvatarFallback></Avatar>)}</div></CardContent></Card>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowProjectDialog(false)}>Close</Button><Button><Edit className="h-4 w-4 mr-2" />Edit Project</Button></DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* New Project Dialog */}
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogContent><DialogHeader><DialogTitle>Create New Project</DialogTitle><DialogDescription>Set up a new project with details</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Project Name</Label><Input placeholder="Enter project name" className="mt-1" /></div>
              <div><Label>Description</Label><Textarea placeholder="Describe the project..." className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Budget</Label><Input type="number" placeholder="0" className="mt-1" /></div><div><Label>Priority</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select priority" /></SelectTrigger><SelectContent>{Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div></div>
              <div className="grid grid-cols-2 gap-4"><div><Label>Start Date</Label><Input type="date" className="mt-1" /></div><div><Label>Due Date</Label><Input type="date" className="mt-1" /></div></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-blue-600 to-indigo-600">Create Project</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
