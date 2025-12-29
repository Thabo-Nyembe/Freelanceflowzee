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
  PieChart, ArrowRight, RefreshCw, Copy, Workflow, FileText, Bell, Shield, Link, ExternalLink, Activity,
  Key, Webhook, Database, Lock, Palette, AlertOctagon, Mail, Globe, Upload, Download,
  BellRing, Slack, MessageCircle, Inbox, Layout, Gauge, Code, Rss, Monitor, Smartphone,
  Package, Hash, Columns, ChevronRight
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

import { EnhancedDashboardWidget } from '@/components/ui/enhanced-dashboard-widgets'
import { SkeletonCard } from '@/components/ui/enhanced-loading-states'

// Centralized Mock Data - Investor-Ready
import {
  projectsHubProjects,
  projectsHubSprints,
  projectsHubBacklog,
  projectsHubRoadmap,
  projectsHubAutomations,
  projectsHubTemplates,
  projectsHubIssues,
  projectsHubEpics,
  projectsHubReports,
  projectsHubIntegrations,
  projectsHubAIInsights,
  projectsHubCollaborators,
  projectsHubPredictions,
  projectsHubActivities,
  projectsHubQuickActions,
  projectsStatusColumns,
} from '@/lib/mock-data/adapters'

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

interface Issue {
  id: string
  key: string
  title: string
  description: string
  type: 'story' | 'bug' | 'task' | 'epic' | 'subtask'
  status: 'open' | 'in_progress' | 'in_review' | 'done' | 'blocked'
  priority: Priority
  assignee?: string
  reporter: string
  labels: string[]
  storyPoints?: number
  timeEstimate?: number
  timeSpent?: number
  createdAt: string
  updatedAt: string
  dueDate?: string
  epicId?: string
  sprintId?: string
  comments: Comment[]
  attachments: number
  watchers: string[]
}

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

interface Epic {
  id: string
  key: string
  name: string
  summary: string
  status: 'to_do' | 'in_progress' | 'done'
  color: string
  startDate: string
  dueDate: string
  progress: number
  issuesCount: number
  issuesCompleted: number
}

interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'user' | 'url'
  required: boolean
  options?: string[]
  appliesTo: string[]
}

interface Activity {
  id: string
  type: 'comment' | 'status_change' | 'assignment' | 'priority_change' | 'label_add' | 'sprint_move'
  user: string
  issueKey: string
  details: string
  timestamp: string
}

interface Report {
  id: string
  name: string
  type: 'burndown' | 'velocity' | 'cumulative_flow' | 'sprint_report' | 'version_report' | 'epic_report'
  description: string
  lastGenerated: string
  isFavorite: boolean
}

interface Integration {
  id: string
  name: string
  type: 'github' | 'gitlab' | 'slack' | 'confluence' | 'bitbucket' | 'teams'
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  icon: string
}

// Use centralized mock data - mapped to local variable names for compatibility
const statusColumns = projectsStatusColumns
const mockProjects = projectsHubProjects as Project[]
const mockSprints = projectsHubSprints
const mockBacklog = projectsHubBacklog
const mockRoadmap = projectsHubRoadmap
const mockAutomations = projectsHubAutomations
const mockTemplates = projectsHubTemplates
const mockIssues = projectsHubIssues as Issue[]
const mockEpics = projectsHubEpics as Epic[]
const mockActivities = projectsHubActivities as Activity[]
const mockReports = projectsHubReports as Report[]
const mockIntegrations = projectsHubIntegrations as Integration[]
const mockProjectsAIInsights = projectsHubAIInsights
const mockProjectsCollaborators = projectsHubCollaborators
const mockProjectsPredictions = projectsHubPredictions
const mockProjectsActivities = projectsHubActivities
const mockProjectsQuickActions = projectsHubQuickActions

const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Critical' },
  high: { color: 'bg-orange-500', label: 'High' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  low: { color: 'bg-gray-400', label: 'Low' }
}

// Custom fields mock data (kept local as it's specific to this component)
const mockCustomFields: CustomField[] = [
  { id: '1', name: 'Customer Impact', type: 'select', required: false, options: ['Low', 'Medium', 'High', 'Critical'], appliesTo: ['bug', 'story'] },
  { id: '2', name: 'Technical Debt', type: 'select', required: false, options: ['Yes', 'No'], appliesTo: ['task', 'bug'] },
  { id: '3', name: 'Release Version', type: 'text', required: true, appliesTo: ['story', 'bug', 'task'] },
  { id: '4', name: 'QA Contact', type: 'user', required: false, appliesTo: ['story', 'bug'] },
  { id: '5', name: 'Documentation Link', type: 'url', required: false, appliesTo: ['story', 'epic'] }
]

const getIssueTypeColor = (type: Issue['type']): string => {
  const colors = { story: 'bg-green-100 text-green-700', bug: 'bg-red-100 text-red-700', task: 'bg-blue-100 text-blue-700', epic: 'bg-purple-100 text-purple-700', subtask: 'bg-gray-100 text-gray-700' }
  return colors[type] || 'bg-gray-100'
}

const getIssueStatusColor = (status: Issue['status']): string => {
  const colors = { open: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', in_review: 'bg-yellow-100 text-yellow-700', done: 'bg-green-100 text-green-700', blocked: 'bg-red-100 text-red-700' }
  return colors[status] || 'bg-gray-100'
}

const getIntegrationStatusColor = (status: Integration['status']): string => {
  const colors = { connected: 'bg-green-100 text-green-700', disconnected: 'bg-gray-100 text-gray-700', error: 'bg-red-100 text-red-700' }
  return colors[status] || 'bg-gray-100'
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = { comment: MessageSquare, status_change: RefreshCw, assignment: Users, priority_change: Flag, label_add: Tag, sprint_move: GitBranch }
  return icons[type] || MessageSquare
}

export default function ProjectsHubClient() {
  const [activeTab, setActiveTab] = useState('projects')
  const [viewType, setViewType] = useState<'board' | 'list' | 'timeline'>('board')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showProjectDialog, setShowProjectDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [settingsTab, setSettingsTab] = useState('general')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [showIssueDialog, setShowIssueDialog] = useState(false)

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
            {/* Projects Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Projects Hub</h2>
                  <p className="text-violet-100">Monday.com-level project management</p>
                  <p className="text-violet-200 text-xs mt-1">Board • Timeline • Automations • Insights</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockProjects.length}</p>
                    <p className="text-violet-200 text-sm">Projects</p>
                  </div>
                </div>
              </div>
            </div>
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
          <TabsContent value="insights" className="mt-6 space-y-6">
            {/* Reports Section */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Reports & Analytics</CardTitle><Button variant="outline"><Plus className="h-4 w-4 mr-2" />Create Report</Button></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {mockReports.map(report => (
                    <div key={report.id} className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {report.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          <span className="font-medium">{report.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{report.type.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{report.description}</p>
                      <p className="text-xs text-gray-400">Last generated: {new Date(report.lastGenerated).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Epics Progress */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Epics Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEpics.map(epic => (
                    <div key={epic.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: epic.color }} />
                          <div><p className="font-medium">{epic.name}</p><p className="text-xs text-gray-500">{epic.key}</p></div>
                        </div>
                        <Badge className={epic.status === 'done' ? 'bg-green-100 text-green-700' : epic.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{epic.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{epic.summary}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">{epic.issuesCompleted}/{epic.issuesCount} issues</span>
                        <span className="text-sm font-medium">{epic.progress}%</span>
                      </div>
                      <Progress value={epic.progress} className="h-2" />
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{epic.startDate} - {epic.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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

            {/* Activity Stream */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {mockActivities.map(activity => {
                      const ActivityIcon = getActivityIcon(activity.type)
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ActivityIcon className="h-4 w-4 text-blue-600" /></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.user}</span>
                              <Badge variant="outline" className="text-xs">{activity.issueKey}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Issue Breakdown */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Issues Overview</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b"><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Key</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Summary</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th></tr></thead>
                    <tbody className="divide-y">
                      {mockIssues.map(issue => (
                        <tr key={issue.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => { setSelectedIssue(issue); setShowIssueDialog(true) }}>
                          <td className="px-4 py-3"><span className="text-blue-600 font-medium">{issue.key}</span></td>
                          <td className="px-4 py-3"><p className="font-medium">{issue.title}</p></td>
                          <td className="px-4 py-3"><Badge className={getIssueTypeColor(issue.type)}>{issue.type}</Badge></td>
                          <td className="px-4 py-3"><Badge className={getIssueStatusColor(issue.status)}>{issue.status.replace('_', ' ')}</Badge></td>
                          <td className="px-4 py-3"><Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(issue.priority).color} mr-1`} />{getPriorityConfig(issue.priority).label}</Badge></td>
                          <td className="px-4 py-3">{issue.assignee ? <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{issue.assignee.slice(0, 2)}</AvatarFallback></Avatar> : <span className="text-gray-400">Unassigned</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Project Settings</h2>
                <p className="text-sm text-gray-500">Configure your project management platform</p>
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
                        { id: 'integrations', icon: Link, label: 'Integrations' },
                        { id: 'custom_fields', icon: Tag, label: 'Custom Fields' },
                        { id: 'permissions', icon: Shield, label: 'Permissions' },
                        { id: 'workflow', icon: Workflow, label: 'Workflow' },
                      ].map((item) => (
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
                          <Layout className="h-5 w-5" />
                          Display Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Default View</Label>
                            <Select defaultValue="board">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="board">Board View</SelectItem>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="timeline">Timeline View</SelectItem>
                                <SelectItem value="calendar">Calendar View</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Projects Per Page</Label>
                            <Select defaultValue="20">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 projects</SelectItem>
                                <SelectItem value="20">20 projects</SelectItem>
                                <SelectItem value="50">50 projects</SelectItem>
                                <SelectItem value="100">100 projects</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Progress Bars</div>
                            <div className="text-sm text-gray-500">Display progress bars on project cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Show Budget Information</div>
                            <div className="text-sm text-gray-500">Display budget and spending on project cards</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Compact Mode</div>
                            <div className="text-sm text-gray-500">Use a more compact layout for project lists</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Project Defaults
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Project Key Prefix</Label>
                            <Input defaultValue="PRJ" />
                          </div>
                          <div className="space-y-2">
                            <Label>Default Sprint Length</Label>
                            <Select defaultValue="2">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Week</SelectItem>
                                <SelectItem value="2">2 Weeks</SelectItem>
                                <SelectItem value="3">3 Weeks</SelectItem>
                                <SelectItem value="4">4 Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Story Point Scale</Label>
                            <Select defaultValue="fibonacci">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fibonacci">Fibonacci (1,2,3,5,8,13)</SelectItem>
                                <SelectItem value="linear">Linear (1,2,3,4,5)</SelectItem>
                                <SelectItem value="tshirt">T-Shirt (XS,S,M,L,XL)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Issue Type</Label>
                            <Select defaultValue="story">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="story">Story</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="bug">Bug</SelectItem>
                                <SelectItem value="epic">Epic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Enable Time Tracking</div>
                            <div className="text-sm text-gray-500">Track time spent on issues</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-generate Project Keys</div>
                            <div className="text-sm text-gray-500">Automatically generate project keys from names</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Regional Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                <SelectItem value="gmt">GMT</SelectItem>
                                <SelectItem value="cet">Central European Time (CET)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="mdy">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Week Start Day</Label>
                            <Select defaultValue="monday">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sunday">Sunday</SelectItem>
                                <SelectItem value="monday">Monday</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select defaultValue="usd">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                <SelectItem value="jpy">JPY (¥)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                            <div className="font-medium">Issue Assigned to Me</div>
                            <div className="text-sm text-gray-500">When issues are assigned to you</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Issue Status Changed</div>
                            <div className="text-sm text-gray-500">When watching issue status changes</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Mentioned in Comments</div>
                            <div className="text-sm text-gray-500">When someone @mentions you</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Due Date Approaching</div>
                            <div className="text-sm text-gray-500">Issues due within 24 hours</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Daily Summary Email</div>
                            <div className="text-sm text-gray-500">Receive daily digest of activity</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BellRing className="h-5 w-5" />
                          In-App Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Started/Ended</div>
                            <div className="text-sm text-gray-500">Sprint lifecycle notifications</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">New Comments</div>
                            <div className="text-sm text-gray-500">Comments on issues you're watching</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Automation Runs</div>
                            <div className="text-sm text-gray-500">When automations execute actions</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Integration Errors</div>
                            <div className="text-sm text-gray-500">When integrations fail to sync</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Slack className="h-5 w-5" />
                          Slack Integration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Slack className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">Slack Connected</div>
                              <div className="text-sm text-gray-500">#engineering channel</div>
                            </div>
                            <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <Button variant="outline" size="sm">Configure Channel</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Post New Issues</div>
                            <div className="text-sm text-gray-500">Share new issues to Slack</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Updates</div>
                            <div className="text-sm text-gray-500">Post sprint start/end notifications</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Release Notifications</div>
                            <div className="text-sm text-gray-500">Announce new releases to Slack</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5" />
                          Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="border rounded-lg divide-y">
                          {[
                            { url: 'https://api.company.com/webhooks/jira', events: ['issue.created', 'issue.updated'], status: 'active' },
                            { url: 'https://hooks.zapier.com/hooks/catch/123456', events: ['sprint.completed'], status: 'active' },
                          ].map((webhook, i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                              <div>
                                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{webhook.url}</code>
                                <div className="flex items-center gap-2 mt-2">
                                  {webhook.events.map(event => (
                                    <Badge key={event} variant="secondary" className="text-xs">{event}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">{webhook.status}</Badge>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Link className="h-5 w-5" />
                            Connected Services
                          </CardTitle>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Integration
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockIntegrations.map(integration => (
                          <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <div className="font-medium">{integration.name}</div>
                                <div className="text-sm text-gray-500">
                                  {integration.lastSync ? `Last sync: ${new Date(integration.lastSync).toLocaleString()}` : 'Never synced'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getIntegrationStatusColor(integration.status)}>{integration.status}</Badge>
                              <Button variant="ghost" size="sm">Configure</Button>
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
                            <div className="font-medium">API Token</div>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Regenerate
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border text-sm">
                              prj_live_•••••••••••••••••••••••
                            </code>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">24,567</div>
                            <div className="text-sm text-gray-500">API Calls (30 days)</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-2xl font-bold">89ms</div>
                            <div className="text-sm text-gray-500">Avg Response Time</div>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View API Documentation
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Developer Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">REST API</div>
                            <div className="text-sm text-gray-500">Access projects via REST endpoints</div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">GraphQL API</div>
                            <div className="text-sm text-gray-500">Query projects with GraphQL</div>
                          </div>
                          <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">CLI Tool</div>
                            <div className="text-sm text-gray-500">Command-line interface for automation</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Custom Fields Settings */}
                {settingsTab === 'custom_fields' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Custom Fields
                          </CardTitle>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockCustomFields.map(field => (
                          <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Tag className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{field.name}</div>
                                <div className="text-sm text-gray-500">
                                  Type: {field.type} • Applies to: {field.appliesTo.join(', ')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {field.required && <Badge variant="outline">Required</Badge>}
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Hash className="h-5 w-5" />
                          Field Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { type: 'Text', description: 'Single or multi-line text', icon: FileText },
                            { type: 'Number', description: 'Numeric values', icon: Hash },
                            { type: 'Date', description: 'Date or datetime', icon: Calendar },
                            { type: 'Select', description: 'Single choice dropdown', icon: ChevronDown },
                            { type: 'Multi-select', description: 'Multiple choice', icon: CheckSquare },
                            { type: 'User', description: 'Team member picker', icon: Users },
                          ].map((item) => (
                            <div key={item.type} className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <item.icon className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{item.type}</span>
                              </div>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          ))}
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
                          <Shield className="h-5 w-5" />
                          Project Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Default Project Visibility</div>
                            <div className="text-sm text-gray-500">Visibility for new projects</div>
                          </div>
                          <Select defaultValue="team">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="team">Team Only</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Allow External Collaborators</div>
                            <div className="text-sm text-gray-500">Invite users outside organization</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Admin Approval</div>
                            <div className="text-sm text-gray-500">For creating new projects</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="h-5 w-5" />
                          Role Permissions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Allow Issue Deletion</div>
                            <div className="text-sm text-gray-500">Who can delete issues</div>
                          </div>
                          <Select defaultValue="admin">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admins Only</SelectItem>
                              <SelectItem value="lead">Project Leads</SelectItem>
                              <SelectItem value="all">All Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Export Restrictions</div>
                            <div className="text-sm text-gray-500">Who can export project data</div>
                          </div>
                          <Select defaultValue="lead">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admins Only</SelectItem>
                              <SelectItem value="lead">Project Leads</SelectItem>
                              <SelectItem value="all">All Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Sprint Management</div>
                            <div className="text-sm text-gray-500">Who can start/complete sprints</div>
                          </div>
                          <Select defaultValue="lead">
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admins Only</SelectItem>
                              <SelectItem value="lead">Project Leads</SelectItem>
                              <SelectItem value="all">All Members</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700 border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Archive All Projects</div>
                            <div className="text-sm text-gray-500">Move all projects to archive</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-600">Delete All Data</div>
                            <div className="text-sm text-gray-500">Permanently delete all projects and issues</div>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Workflow Settings */}
                {settingsTab === 'workflow' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Columns className="h-5 w-5" />
                          Issue Status Workflow
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 overflow-x-auto py-4">
                          {['Open', 'In Progress', 'In Review', 'Done'].map((status, i) => (
                            <div key={status} className="flex items-center">
                              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium whitespace-nowrap">
                                {status}
                              </div>
                              {i < 3 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
                            </div>
                          ))}
                        </div>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Status
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="h-5 w-5" />
                          Transition Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Comment on Block</div>
                            <div className="text-sm text-gray-500">Force comment when moving to Blocked</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Auto-assign on In Progress</div>
                            <div className="text-sm text-gray-500">Assign to current user when starting work</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Require Reviewer for Review</div>
                            <div className="text-sm text-gray-500">Must have reviewer before moving to Review</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium">Prevent Reopening Done Issues</div>
                            <div className="text-sm text-gray-500">Require admin approval to reopen</div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          Automation Rules
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockAutomations.map(auto => (
                          <div key={auto.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className={`p-2 rounded-lg ${auto.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <Workflow className={`h-5 w-5 ${auto.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{auto.name}</h4>
                              <p className="text-sm text-gray-500">{auto.trigger} → {auto.action}</p>
                            </div>
                            <Badge variant="outline">{auto.runsCount} runs</Badge>
                            <Switch checked={auto.enabled} />
                          </div>
                        ))}
                        <Button variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Automation Rule
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockProjects.length}</div>
                            <div className="text-sm text-gray-500">Projects</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">{mockIssues.length}</div>
                            <div className="text-sm text-gray-500">Issues</div>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <div className="text-2xl font-bold">12.4 MB</div>
                            <div className="text-sm text-gray-500">Storage Used</div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
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
          {/* AI Insights Panel */}
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockProjectsAIInsights}
              title="Project Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>

          {/* Team Collaboration & Activity */}
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockProjectsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockProjectsPredictions}
              title="Project Forecasts"
            />
          </div>
        </div>

        {/* Activity Feed & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockProjectsActivities}
            title="Project Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockProjectsQuickActions}
            variant="grid"
          />
        </div>

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

        {/* Issue Detail Dialog */}
        <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedIssue && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <Badge className={getIssueTypeColor(selectedIssue.type)}>{selectedIssue.type}</Badge>
                    <DialogTitle className="text-xl">{selectedIssue.key}: {selectedIssue.title}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-6 mt-4">
                  {/* Main Content */}
                  <div className="col-span-2 space-y-6">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base">Description</CardTitle></CardHeader>
                      <CardContent><p className="text-gray-600 dark:text-gray-400">{selectedIssue.description}</p></CardContent>
                    </Card>

                    {/* Activity Section */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Activity</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedIssue.comments.length > 0 ? (
                            selectedIssue.comments.map(comment => (
                              <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Avatar className="h-8 w-8"><AvatarFallback>{comment.author.slice(0, 2)}</AvatarFallback></Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{comment.author}</span>
                                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No comments yet</p>
                          )}
                          <div className="pt-4 border-t">
                            <Textarea placeholder="Add a comment..." className="mb-2" />
                            <Button size="sm">Add Comment</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Time Tracking */}
                    {(selectedIssue.timeEstimate || selectedIssue.timeSpent) && (
                      <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Timer className="h-4 w-4" />Time Tracking</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">{selectedIssue.timeSpent || 0}h</p>
                              <p className="text-xs text-gray-500">Time Spent</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-2xl font-bold">{selectedIssue.timeEstimate || 0}h</p>
                              <p className="text-xs text-gray-500">Estimated</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">{Math.max((selectedIssue.timeEstimate || 0) - (selectedIssue.timeSpent || 0), 0)}h</p>
                              <p className="text-xs text-gray-500">Remaining</p>
                            </div>
                          </div>
                          {selectedIssue.timeEstimate && selectedIssue.timeSpent && (
                            <Progress value={(selectedIssue.timeSpent / selectedIssue.timeEstimate) * 100} className="h-2 mt-4" />
                          )}
                          <Button variant="outline" size="sm" className="mt-4"><Timer className="h-4 w-4 mr-2" />Log Time</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div><Label className="text-xs text-gray-500">Status</Label><div className="mt-1"><Badge className={getIssueStatusColor(selectedIssue.status)}>{selectedIssue.status.replace('_', ' ')}</Badge></div></div>
                        <div><Label className="text-xs text-gray-500">Priority</Label><div className="mt-1"><Badge variant="outline"><span className={`w-2 h-2 rounded-full ${getPriorityConfig(selectedIssue.priority).color} mr-1`} />{getPriorityConfig(selectedIssue.priority).label}</Badge></div></div>
                        <div><Label className="text-xs text-gray-500">Assignee</Label><div className="mt-1 flex items-center gap-2">{selectedIssue.assignee ? <><Avatar className="h-6 w-6"><AvatarFallback>{selectedIssue.assignee.slice(0, 2)}</AvatarFallback></Avatar><span>{selectedIssue.assignee}</span></> : <span className="text-gray-400">Unassigned</span>}</div></div>
                        <div><Label className="text-xs text-gray-500">Reporter</Label><div className="mt-1 flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback>{selectedIssue.reporter.slice(0, 2)}</AvatarFallback></Avatar><span>{selectedIssue.reporter}</span></div></div>
                        {selectedIssue.storyPoints && <div><Label className="text-xs text-gray-500">Story Points</Label><div className="mt-1"><Badge variant="secondary">{selectedIssue.storyPoints} pts</Badge></div></div>}
                        {selectedIssue.dueDate && <div><Label className="text-xs text-gray-500">Due Date</Label><div className="mt-1 flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span>{new Date(selectedIssue.dueDate).toLocaleDateString()}</span></div></div>}
                        <div><Label className="text-xs text-gray-500">Labels</Label><div className="mt-1 flex flex-wrap gap-1">{selectedIssue.labels.map((label, i) => <Badge key={i} variant="outline" className="text-xs">{label}</Badge>)}</div></div>
                        <div><Label className="text-xs text-gray-500">Watchers</Label><div className="mt-1 flex -space-x-1">{selectedIssue.watchers.map((w, i) => <Avatar key={i} className="h-6 w-6 border-2 border-white"><AvatarFallback className="text-xs">{w.slice(0, 2)}</AvatarFallback></Avatar>)}</div></div>
                        <div><Label className="text-xs text-gray-500">Created</Label><p className="mt-1 text-sm">{new Date(selectedIssue.createdAt).toLocaleString()}</p></div>
                        <div><Label className="text-xs text-gray-500">Updated</Label><p className="mt-1 text-sm">{new Date(selectedIssue.updatedAt).toLocaleString()}</p></div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <Label className="text-xs text-gray-500">Attachments</Label>
                        <div className="mt-2 p-3 border-2 border-dashed rounded-lg text-center text-gray-500 text-sm">
                          {selectedIssue.attachments > 0 ? (
                            <p>{selectedIssue.attachments} file(s) attached</p>
                          ) : (
                            <p>No attachments</p>
                          )}
                          <Button variant="ghost" size="sm" className="mt-2"><Plus className="h-4 w-4 mr-1" />Add Attachment</Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <Label className="text-xs text-gray-500">Linked Issues</Label>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="w-full justify-start text-gray-500"><Link className="h-4 w-4 mr-2" />Link an issue</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => setShowIssueDialog(false)}>Close</Button>
                  <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600"><ArrowRight className="h-4 w-4 mr-2" />Move to In Progress</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
