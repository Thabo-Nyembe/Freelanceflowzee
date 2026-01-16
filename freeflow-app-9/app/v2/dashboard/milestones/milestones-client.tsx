'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Target, Calendar, Flag, AlertTriangle, CheckCircle2, Clock,
  Link2, TrendingUp, ArrowRight, FileText,
  BarChart3, Settings, Plus, Search, LayoutGrid, List,
  GitBranch, Milestone, Zap, Shield, AlertCircle, XCircle,
  PauseCircle, PlayCircle, Timer, DollarSign, Briefcase,
  Eye, MessageSquare, Bell, ArrowUpRight, ArrowDownRight,
  RefreshCw, CalendarDays, Package,
  Sliders, Webhook, Lock, Mail, Globe, Database, Archive, Trash2, Terminal, Copy, Download
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
// TYPE DEFINITIONS - Monday.com Level Milestone Management
// ============================================================================

type MilestoneStatus = 'not_started' | 'in_progress' | 'at_risk' | 'blocked' | 'completed' | 'cancelled' | 'on_hold'
type MilestoneType = 'project' | 'release' | 'phase' | 'checkpoint' | 'gate' | 'delivery' | 'launch' | 'review'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type HealthScore = 'on_track' | 'at_risk' | 'off_track' | 'blocked'
type DependencyType = 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish'
type DeliverableStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected'

interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  email: string
  workload: number // percentage
  tasks_assigned: number
  tasks_completed: number
}

interface Deliverable {
  id: string
  name: string
  description: string
  status: DeliverableStatus
  assignee: TeamMember
  due_date: string
  completed_date?: string
  attachments: number
  comments: number
  priority: Priority
}

interface Dependency {
  id: string
  source_milestone_id: string
  source_milestone_name: string
  target_milestone_id: string
  target_milestone_name: string
  type: DependencyType
  lag_days: number
  is_blocking: boolean
  status: 'satisfied' | 'pending' | 'at_risk' | 'violated'
}

interface StatusUpdate {
  id: string
  author: TeamMember
  content: string
  created_at: string
  health_change?: { from: HealthScore; to: HealthScore }
  progress_change?: { from: number; to: number }
  attachments: string[]
  reactions: { emoji: string; count: number }[]
}

interface Risk {
  id: string
  title: string
  description: string
  probability: 'low' | 'medium' | 'high' | 'very_high'
  impact: 'low' | 'medium' | 'high' | 'critical'
  mitigation: string
  status: 'identified' | 'mitigating' | 'mitigated' | 'occurred'
  owner: TeamMember
}

interface BudgetItem {
  category: string
  planned: number
  actual: number
  forecast: number
  variance: number
}

interface Milestone {
  id: string
  name: string
  description: string
  status: MilestoneStatus
  type: MilestoneType
  priority: Priority
  health: HealthScore
  project_id: string
  project_name: string
  owner: TeamMember
  team: TeamMember[]
  start_date: string
  due_date: string
  completed_date?: string
  progress: number
  deliverables: Deliverable[]
  dependencies_in: Dependency[]
  dependencies_out: Dependency[]
  status_updates: StatusUpdate[]
  risks: Risk[]
  budget: {
    total: number
    spent: number
    forecast: number
    currency: string
    items: BudgetItem[]
  }
  tags: string[]
  watchers: number
  comments: number
  is_critical_path: boolean
  created_at: string
  updated_at: string
}

interface MilestoneReport {
  id: string
  name: string
  type: 'status' | 'progress' | 'budget' | 'risk' | 'timeline'
  generated_at: string
  period: string
  metrics: {
    label: string
    value: string
    change: number
    trend: 'up' | 'down' | 'stable'
  }[]
}

// ============================================================================
// MOCK DATA - Monday.com Level Comprehensive
// ============================================================================

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', role: 'Project Manager', email: 'sarah@company.com', workload: 85, tasks_assigned: 12, tasks_completed: 8 },
  { id: '2', name: 'Michael Rodriguez', avatar: '/avatars/michael.jpg', role: 'Lead Developer', email: 'michael@company.com', workload: 92, tasks_assigned: 15, tasks_completed: 11 },
  { id: '3', name: 'Emily Watson', avatar: '/avatars/emily.jpg', role: 'Designer', email: 'emily@company.com', workload: 78, tasks_assigned: 8, tasks_completed: 6 },
  { id: '4', name: 'David Kim', avatar: '/avatars/david.jpg', role: 'QA Engineer', email: 'david@company.com', workload: 65, tasks_assigned: 10, tasks_completed: 9 },
  { id: '5', name: 'Jessica Brown', avatar: '/avatars/jessica.jpg', role: 'DevOps', email: 'jessica@company.com', workload: 70, tasks_assigned: 7, tasks_completed: 5 },
]

const mockMilestones: Milestone[] = [
  {
    id: '1',
    name: 'Platform V2.0 Launch',
    description: 'Complete redesign and launch of the platform with new features',
    status: 'in_progress',
    type: 'launch',
    priority: 'critical',
    health: 'at_risk',
    project_id: 'p1',
    project_name: 'Platform Modernization',
    owner: mockTeamMembers[0],
    team: mockTeamMembers.slice(0, 4),
    start_date: '2024-01-15',
    due_date: '2024-03-31',
    progress: 72,
    deliverables: [
      { id: 'd1', name: 'UI Components Library', description: 'Complete component system', status: 'approved', assignee: mockTeamMembers[2], due_date: '2024-02-15', completed_date: '2024-02-12', attachments: 8, comments: 24, priority: 'high' },
      { id: 'd2', name: 'API Integration', description: 'Backend API connections', status: 'in_progress', assignee: mockTeamMembers[1], due_date: '2024-03-01', attachments: 5, comments: 18, priority: 'critical' },
      { id: 'd3', name: 'User Authentication', description: 'OAuth and SSO implementation', status: 'review', assignee: mockTeamMembers[1], due_date: '2024-02-28', attachments: 3, comments: 12, priority: 'high' },
      { id: 'd4', name: 'Performance Optimization', description: 'Load time improvements', status: 'pending', assignee: mockTeamMembers[3], due_date: '2024-03-15', attachments: 2, comments: 6, priority: 'medium' },
    ],
    dependencies_in: [
      { id: 'dep1', source_milestone_id: '3', source_milestone_name: 'Infrastructure Upgrade', target_milestone_id: '1', target_milestone_name: 'Platform V2.0 Launch', type: 'finish_to_start', lag_days: 5, is_blocking: true, status: 'satisfied' }
    ],
    dependencies_out: [
      { id: 'dep2', source_milestone_id: '1', source_milestone_name: 'Platform V2.0 Launch', target_milestone_id: '5', target_milestone_name: 'Marketing Campaign', type: 'finish_to_start', lag_days: 0, is_blocking: true, status: 'pending' }
    ],
    status_updates: [
      { id: 'su1', author: mockTeamMembers[0], content: 'API integration running 2 days behind schedule due to third-party delays. Implementing workaround.', created_at: '2024-02-20T14:30:00Z', health_change: { from: 'on_track', to: 'at_risk' }, progress_change: { from: 68, to: 72 }, attachments: [], reactions: [{ emoji: '👍', count: 5 }, { emoji: '🔥', count: 2 }] },
      { id: 'su2', author: mockTeamMembers[1], content: 'UI Components library completed ahead of schedule! Great work team.', created_at: '2024-02-12T10:00:00Z', progress_change: { from: 45, to: 55 }, attachments: ['design-review.pdf'], reactions: [{ emoji: '🎉', count: 8 }, { emoji: '⭐', count: 4 }] },
    ],
    risks: [
      { id: 'r1', title: 'Third-party API Delays', description: 'External vendor API integration taking longer than expected', probability: 'high', impact: 'medium', mitigation: 'Developing fallback solution with mock data', status: 'mitigating', owner: mockTeamMembers[1] },
      { id: 'r2', title: 'Resource Constraints', description: 'Team at capacity with current workload', probability: 'medium', impact: 'high', mitigation: 'Considering contractor support for non-critical tasks', status: 'identified', owner: mockTeamMembers[0] },
    ],
    budget: {
      total: 150000,
      spent: 98500,
      forecast: 145000,
      currency: 'USD',
      items: [
        { category: 'Development', planned: 80000, actual: 52000, forecast: 78000, variance: 2000 },
        { category: 'Design', planned: 30000, actual: 28500, forecast: 30000, variance: 0 },
        { category: 'Infrastructure', planned: 25000, actual: 12000, forecast: 24000, variance: 1000 },
        { category: 'Testing', planned: 15000, actual: 6000, forecast: 13000, variance: 2000 },
      ]
    },
    tags: ['critical', 'q1-2024', 'platform', 'launch'],
    watchers: 24,
    comments: 156,
    is_critical_path: true,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: '2',
    name: 'Mobile App Beta Release',
    description: 'Beta release of mobile application for iOS and Android',
    status: 'in_progress',
    type: 'release',
    priority: 'high',
    health: 'on_track',
    project_id: 'p2',
    project_name: 'Mobile Experience',
    owner: mockTeamMembers[1],
    team: mockTeamMembers.slice(1, 4),
    start_date: '2024-02-01',
    due_date: '2024-04-15',
    progress: 58,
    deliverables: [
      { id: 'd5', name: 'iOS Native App', description: 'SwiftUI implementation', status: 'in_progress', assignee: mockTeamMembers[1], due_date: '2024-03-20', attachments: 12, comments: 32, priority: 'high' },
      { id: 'd6', name: 'Android Native App', description: 'Kotlin implementation', status: 'in_progress', assignee: mockTeamMembers[4], due_date: '2024-03-25', attachments: 10, comments: 28, priority: 'high' },
      { id: 'd7', name: 'Push Notifications', description: 'FCM/APNS integration', status: 'pending', assignee: mockTeamMembers[4], due_date: '2024-04-01', attachments: 2, comments: 8, priority: 'medium' },
    ],
    dependencies_in: [],
    dependencies_out: [],
    status_updates: [
      { id: 'su3', author: mockTeamMembers[1], content: 'Both iOS and Android apps passing initial QA tests. On track for beta.', created_at: '2024-02-18T11:00:00Z', progress_change: { from: 50, to: 58 }, attachments: [], reactions: [{ emoji: '👍', count: 6 }] },
    ],
    risks: [
      { id: 'r3', title: 'App Store Approval Delays', description: 'Potential delays in App Store review process', probability: 'medium', impact: 'medium', mitigation: 'Early submission with buffer time', status: 'identified', owner: mockTeamMembers[1] },
    ],
    budget: {
      total: 85000,
      spent: 42000,
      forecast: 82000,
      currency: 'USD',
      items: [
        { category: 'Development', planned: 60000, actual: 32000, forecast: 58000, variance: 2000 },
        { category: 'Testing', planned: 15000, actual: 6000, forecast: 14000, variance: 1000 },
        { category: 'Design', planned: 10000, actual: 4000, forecast: 10000, variance: 0 },
      ]
    },
    tags: ['mobile', 'beta', 'q2-2024'],
    watchers: 18,
    comments: 89,
    is_critical_path: false,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-02-18T11:00:00Z',
  },
  {
    id: '3',
    name: 'Infrastructure Upgrade',
    description: 'Cloud infrastructure modernization and scaling improvements',
    status: 'completed',
    type: 'project',
    priority: 'high',
    health: 'on_track',
    project_id: 'p3',
    project_name: 'DevOps Excellence',
    owner: mockTeamMembers[4],
    team: [mockTeamMembers[4], mockTeamMembers[1]],
    start_date: '2024-01-01',
    due_date: '2024-02-15',
    completed_date: '2024-02-12',
    progress: 100,
    deliverables: [
      { id: 'd8', name: 'Kubernetes Migration', description: 'Move to K8s cluster', status: 'approved', assignee: mockTeamMembers[4], due_date: '2024-01-30', completed_date: '2024-01-28', attachments: 15, comments: 42, priority: 'critical' },
      { id: 'd9', name: 'CI/CD Pipeline', description: 'GitHub Actions setup', status: 'approved', assignee: mockTeamMembers[4], due_date: '2024-02-10', completed_date: '2024-02-08', attachments: 8, comments: 21, priority: 'high' },
      { id: 'd10', name: 'Monitoring Setup', description: 'Prometheus & Grafana', status: 'approved', assignee: mockTeamMembers[1], due_date: '2024-02-15', completed_date: '2024-02-12', attachments: 6, comments: 15, priority: 'medium' },
    ],
    dependencies_in: [],
    dependencies_out: [
      { id: 'dep1', source_milestone_id: '3', source_milestone_name: 'Infrastructure Upgrade', target_milestone_id: '1', target_milestone_name: 'Platform V2.0 Launch', type: 'finish_to_start', lag_days: 5, is_blocking: true, status: 'satisfied' }
    ],
    status_updates: [
      { id: 'su4', author: mockTeamMembers[4], content: 'All infrastructure components deployed and verified. Milestone complete!', created_at: '2024-02-12T16:00:00Z', progress_change: { from: 95, to: 100 }, attachments: ['final-report.pdf'], reactions: [{ emoji: '🎉', count: 12 }, { emoji: '🚀', count: 8 }] },
    ],
    risks: [],
    budget: {
      total: 45000,
      spent: 42500,
      forecast: 42500,
      currency: 'USD',
      items: [
        { category: 'Cloud Services', planned: 25000, actual: 24000, forecast: 24000, variance: 1000 },
        { category: 'Tools & Licenses', planned: 10000, actual: 9500, forecast: 9500, variance: 500 },
        { category: 'Consulting', planned: 10000, actual: 9000, forecast: 9000, variance: 1000 },
      ]
    },
    tags: ['infrastructure', 'devops', 'completed'],
    watchers: 15,
    comments: 78,
    is_critical_path: true,
    created_at: '2023-12-15T09:00:00Z',
    updated_at: '2024-02-12T16:00:00Z',
  },
  {
    id: '4',
    name: 'Security Compliance Audit',
    description: 'SOC 2 Type II certification preparation and audit',
    status: 'at_risk',
    type: 'gate',
    priority: 'critical',
    health: 'at_risk',
    project_id: 'p4',
    project_name: 'Compliance',
    owner: mockTeamMembers[3],
    team: [mockTeamMembers[3], mockTeamMembers[4]],
    start_date: '2024-02-01',
    due_date: '2024-04-30',
    progress: 35,
    deliverables: [
      { id: 'd11', name: 'Policy Documentation', description: 'Security policies update', status: 'in_progress', assignee: mockTeamMembers[3], due_date: '2024-03-01', attachments: 20, comments: 35, priority: 'critical' },
      { id: 'd12', name: 'Vulnerability Assessment', description: 'Penetration testing', status: 'pending', assignee: mockTeamMembers[4], due_date: '2024-03-15', attachments: 3, comments: 8, priority: 'high' },
      { id: 'd13', name: 'Access Control Review', description: 'RBAC implementation', status: 'pending', assignee: mockTeamMembers[3], due_date: '2024-04-01', attachments: 5, comments: 12, priority: 'high' },
    ],
    dependencies_in: [],
    dependencies_out: [],
    status_updates: [
      { id: 'su5', author: mockTeamMembers[3], content: 'Policy documentation taking longer due to new regulatory requirements. May need additional resources.', created_at: '2024-02-19T09:00:00Z', health_change: { from: 'on_track', to: 'at_risk' }, attachments: [], reactions: [{ emoji: '⚠️', count: 3 }] },
    ],
    risks: [
      { id: 'r4', title: 'Regulatory Changes', description: 'New compliance requirements added mid-project', probability: 'high', impact: 'high', mitigation: 'Working with legal team to understand full scope', status: 'mitigating', owner: mockTeamMembers[3] },
    ],
    budget: {
      total: 75000,
      spent: 28000,
      forecast: 85000,
      currency: 'USD',
      items: [
        { category: 'Consulting', planned: 40000, actual: 18000, forecast: 50000, variance: -10000 },
        { category: 'Tools', planned: 20000, actual: 8000, forecast: 20000, variance: 0 },
        { category: 'Training', planned: 15000, actual: 2000, forecast: 15000, variance: 0 },
      ]
    },
    tags: ['compliance', 'soc2', 'security', 'critical'],
    watchers: 20,
    comments: 45,
    is_critical_path: false,
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-02-19T09:00:00Z',
  },
  {
    id: '5',
    name: 'Marketing Campaign Launch',
    description: 'Product launch marketing campaign and GTM strategy',
    status: 'not_started',
    type: 'launch',
    priority: 'high',
    health: 'on_track',
    project_id: 'p5',
    project_name: 'Go-To-Market',
    owner: mockTeamMembers[2],
    team: [mockTeamMembers[2]],
    start_date: '2024-04-01',
    due_date: '2024-05-15',
    progress: 0,
    deliverables: [
      { id: 'd14', name: 'Campaign Assets', description: 'Marketing materials', status: 'pending', assignee: mockTeamMembers[2], due_date: '2024-04-15', attachments: 0, comments: 5, priority: 'high' },
      { id: 'd15', name: 'Landing Pages', description: 'Campaign landing pages', status: 'pending', assignee: mockTeamMembers[2], due_date: '2024-04-20', attachments: 0, comments: 3, priority: 'high' },
    ],
    dependencies_in: [
      { id: 'dep2', source_milestone_id: '1', source_milestone_name: 'Platform V2.0 Launch', target_milestone_id: '5', target_milestone_name: 'Marketing Campaign', type: 'finish_to_start', lag_days: 0, is_blocking: true, status: 'pending' }
    ],
    dependencies_out: [],
    status_updates: [],
    risks: [],
    budget: {
      total: 50000,
      spent: 0,
      forecast: 50000,
      currency: 'USD',
      items: [
        { category: 'Advertising', planned: 30000, actual: 0, forecast: 30000, variance: 0 },
        { category: 'Content', planned: 15000, actual: 0, forecast: 15000, variance: 0 },
        { category: 'Events', planned: 5000, actual: 0, forecast: 5000, variance: 0 },
      ]
    },
    tags: ['marketing', 'gtm', 'q2-2024'],
    watchers: 12,
    comments: 8,
    is_critical_path: false,
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-01T09:00:00Z',
  },
  {
    id: '6',
    name: 'Data Analytics Platform',
    description: 'Build comprehensive analytics and reporting system',
    status: 'in_progress',
    type: 'project',
    priority: 'medium',
    health: 'on_track',
    project_id: 'p6',
    project_name: 'Data Intelligence',
    owner: mockTeamMembers[1],
    team: [mockTeamMembers[1], mockTeamMembers[3]],
    start_date: '2024-02-15',
    due_date: '2024-05-31',
    progress: 25,
    deliverables: [
      { id: 'd16', name: 'Data Pipeline', description: 'ETL infrastructure', status: 'in_progress', assignee: mockTeamMembers[1], due_date: '2024-03-31', attachments: 8, comments: 22, priority: 'high' },
      { id: 'd17', name: 'Dashboard Builder', description: 'Custom dashboard creation', status: 'pending', assignee: mockTeamMembers[3], due_date: '2024-04-30', attachments: 3, comments: 10, priority: 'medium' },
      { id: 'd18', name: 'Report Generator', description: 'Automated reporting', status: 'pending', assignee: mockTeamMembers[1], due_date: '2024-05-15', attachments: 2, comments: 6, priority: 'medium' },
    ],
    dependencies_in: [],
    dependencies_out: [],
    status_updates: [
      { id: 'su6', author: mockTeamMembers[1], content: 'Data pipeline architecture finalized. Starting implementation phase.', created_at: '2024-02-17T14:00:00Z', progress_change: { from: 15, to: 25 }, attachments: ['architecture.pdf'], reactions: [{ emoji: '👍', count: 4 }] },
    ],
    risks: [],
    budget: {
      total: 95000,
      spent: 18000,
      forecast: 90000,
      currency: 'USD',
      items: [
        { category: 'Development', planned: 55000, actual: 12000, forecast: 52000, variance: 3000 },
        { category: 'Infrastructure', planned: 25000, actual: 4000, forecast: 24000, variance: 1000 },
        { category: 'Tools', planned: 15000, actual: 2000, forecast: 14000, variance: 1000 },
      ]
    },
    tags: ['analytics', 'data', 'q2-2024'],
    watchers: 16,
    comments: 38,
    is_critical_path: false,
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-17T14:00:00Z',
  },
]

const mockReports: MilestoneReport[] = [
  {
    id: 'rep1',
    name: 'Weekly Status Report',
    type: 'status',
    generated_at: '2024-02-19T08:00:00Z',
    period: 'Week of Feb 12-18',
    metrics: [
      { label: 'On Track', value: '4', change: 0, trend: 'stable' },
      { label: 'At Risk', value: '2', change: 1, trend: 'up' },
      { label: 'Completed', value: '1', change: 1, trend: 'up' },
    ]
  },
  {
    id: 'rep2',
    name: 'Budget Analysis',
    type: 'budget',
    generated_at: '2024-02-18T10:00:00Z',
    period: 'Q1 2024',
    metrics: [
      { label: 'Total Budget', value: '$500K', change: 0, trend: 'stable' },
      { label: 'Spent', value: '$229K', change: 15, trend: 'up' },
      { label: 'Forecast', value: '$494K', change: -2, trend: 'down' },
    ]
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: MilestoneStatus) => {
  const colors = {
    not_started: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400',
    at_risk: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
    blocked: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-400',
    on_hold: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return colors[status]
}

const getStatusIcon = (status: MilestoneStatus) => {
  const icons = {
    not_started: Clock,
    in_progress: PlayCircle,
    at_risk: AlertTriangle,
    blocked: XCircle,
    completed: CheckCircle2,
    cancelled: XCircle,
    on_hold: PauseCircle,
  }
  return icons[status]
}

const getHealthColor = (health: HealthScore) => {
  const colors = {
    on_track: 'text-green-600 dark:text-green-400',
    at_risk: 'text-amber-600 dark:text-amber-400',
    off_track: 'text-red-600 dark:text-red-400',
    blocked: 'text-red-600 dark:text-red-400',
  }
  return colors[health]
}

const getPriorityColor = (priority: Priority) => {
  const colors = {
    critical: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400',
  }
  return colors[priority]
}

const getTypeIcon = (type: MilestoneType) => {
  const icons = {
    project: Briefcase,
    release: Package,
    phase: GitBranch,
    checkpoint: Flag,
    gate: Shield,
    delivery: Package,
    launch: Zap,
    review: Eye,
  }
  return icons[type]
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

const getDaysRemaining = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

// ============================================================================
// COMPONENT
// ============================================================================

// Mock data for AI-powered competitive upgrade components
const mockMilestonesAIInsights = [
  { id: '1', type: 'success' as const, title: 'Ahead of Schedule', description: 'Product Launch milestone is 5 days ahead. Team velocity increased!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Progress' },
  { id: '2', type: 'warning' as const, title: 'At Risk', description: 'Q4 Release has 3 blocked dependencies. Immediate action needed.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Blockers' },
  { id: '3', type: 'info' as const, title: 'Milestone Pattern', description: 'Sprint milestones average 2 days early completion. Great trend!', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockMilestonesCollaborators = [
  { id: '1', name: 'Project Manager', avatar: '/avatars/pm.jpg', status: 'online' as const, role: 'PM' },
  { id: '2', name: 'Tech Lead', avatar: '/avatars/tech.jpg', status: 'online' as const, role: 'Engineering' },
  { id: '3', name: 'Product Owner', avatar: '/avatars/po.jpg', status: 'away' as const, role: 'Product' },
]

const mockMilestonesPredictions = [
  { id: '1', title: 'Delivery Forecast', prediction: 'Current velocity suggests Q1 goals will be met 1 week early', confidence: 87, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Resource Need', prediction: 'Backend milestone may need additional developer by Feb', confidence: 72, trend: 'up' as const, impact: 'medium' as const },
]

const mockMilestonesActivities = [
  { id: '1', user: 'Project Manager', action: 'Completed', target: 'Sprint 23 milestone', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Tech Lead', action: 'Updated', target: 'API v2 milestone scope', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Product Owner', action: 'Created', target: 'Q2 roadmap milestones', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component to access state setters

// Database milestone type (matches Supabase schema)
interface DbMilestone {
  id: string
  user_id: string
  milestone_code: string
  name: string
  description: string | null
  type: string
  status: string
  priority: string
  due_date: string | null
  days_remaining: number
  progress: number
  owner_name: string | null
  owner_email: string | null
  team_name: string | null
  deliverables: number
  completed_deliverables: number
  budget: number
  spent: number
  currency: string
  dependencies: number
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Form state for creating/editing milestones
interface MilestoneFormState {
  name: string
  description: string
  type: MilestoneType
  status: MilestoneStatus
  priority: Priority
  due_date: string
  owner_name: string
  owner_email: string
  team_name: string
  budget: string
}

const initialFormState: MilestoneFormState = {
  name: '',
  description: '',
  type: 'project',
  status: 'not_started',
  priority: 'medium',
  due_date: '',
  owner_name: '',
  owner_email: '',
  team_name: '',
  budget: '0',
}

export default function MilestonesClient() {
  const supabase = createClient()

  // Core state
  const [activeTab, setActiveTab] = useState('milestones')
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | 'all'>('all')
  const [priorityFilter, _setPriorityFilter] = useState<Priority | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase data state
  const [dbMilestones, setDbMilestones] = useState<DbMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [_editingMilestone, _setEditingMilestone] = useState<DbMilestone | null>(null)
  const [formState, setFormState] = useState<MilestoneFormState>(initialFormState)

  // Dialog states for quick actions
  const [showTimelineDialog, setShowTimelineDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showRisksDialog, setShowRisksDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showPurgeDialog, setShowPurgeDialog] = useState(false)

  // Quick actions with proper dialog openers
  const milestonesQuickActions = [
    { id: '1', label: 'New Milestone', icon: 'plus', action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'View Timeline', icon: 'calendar', action: () => setShowTimelineDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export Report', icon: 'download', action: () => setShowExportDialog(true), variant: 'outline' as const },
  ]

  // Fetch milestones from Supabase
  const fetchMilestones = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbMilestones(data || [])
    } catch (error) {
      console.error('Error fetching milestones:', error)
      toast.error('Failed to load milestones')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  // Create milestone
  const handleCreateMilestone = async () => {
    if (!formState.name.trim()) {
      toast.error('Milestone name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create milestones')
        return
      }

      const milestoneCode = `MS-${Date.now().toString(36).toUpperCase()}`
      const dueDate = formState.due_date ? new Date(formState.due_date) : null
      const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

      const { error } = await supabase.from('milestones').insert({
        user_id: user.id,
        milestone_code: milestoneCode,
        name: formState.name,
        description: formState.description || null,
        type: formState.type,
        status: formState.status,
        priority: formState.priority,
        due_date: formState.due_date || null,
        days_remaining: daysRemaining,
        progress: 0,
        owner_name: formState.owner_name || null,
        owner_email: formState.owner_email || null,
        team_name: formState.team_name || null,
        budget: parseFloat(formState.budget) || 0,
        spent: 0,
        currency: 'USD',
        deliverables: 0,
        completed_deliverables: 0,
        dependencies: 0,
      })

      if (error) throw error

      toast.success('Milestone created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchMilestones()
    } catch (error) {
      console.error('Error creating milestone:', error)
      toast.error('Failed to create milestone')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update milestone status
  const handleUpdateStatus = async (milestoneId: string, newStatus: MilestoneStatus) => {
    try {
      const progress = newStatus === 'completed' ? 100 : newStatus === 'not_started' ? 0 : undefined

      const updateData: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
      if (progress !== undefined) updateData.progress = progress

      const { error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId)

      if (error) throw error

      toast.success(`Milestone marked as ${newStatus.replace('_', ' ')}`)
      fetchMilestones()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update milestone status')
    }
  }

  // Update milestone progress (available for future use)
  const _handleUpdateProgress = async (milestoneId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId)

      if (error) throw error
      toast.success('Progress updated')
      fetchMilestones()
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  // Delete/Archive milestone (available for future use)
  const _handleArchiveMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', milestoneId)

      if (error) throw error
      toast.success('Milestone archived')
      fetchMilestones()
    } catch (error) {
      console.error('Error archiving milestone:', error)
      toast.error('Failed to archive milestone')
    }
  }

  // Delete milestone permanently (available for future use)
  const _handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)

      if (error) throw error
      toast.success('Milestone deleted')
      fetchMilestones()
    } catch (error) {
      console.error('Error deleting milestone:', error)
      toast.error('Failed to delete milestone')
    }
  }

  // Complete milestone (available for future use)
  const _handleCompleteMilestone = async (milestone: Milestone | DbMilestone) => {
    await handleUpdateStatus(milestone.id, 'completed')
  }

  // Export milestones report
  const handleExportReport = () => {
    const csvContent = dbMilestones.map(m =>
      `${m.name},${m.status},${m.priority},${m.progress}%,${m.due_date || 'N/A'}`
    ).join('\n')

    const blob = new Blob([`Name,Status,Priority,Progress,Due Date\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `milestones-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  // Sync/Refresh data
  const handleSync = async () => {
    setLoading(true)
    await fetchMilestones()
    toast.success('Data synced')
  }

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockMilestones.length
    const completed = mockMilestones.filter(m => m.status === 'completed').length
    const inProgress = mockMilestones.filter(m => m.status === 'in_progress').length
    const atRisk = mockMilestones.filter(m => m.health === 'at_risk' || m.health === 'off_track').length
    const onTrack = mockMilestones.filter(m => m.health === 'on_track').length
    const criticalPath = mockMilestones.filter(m => m.is_critical_path).length
    const totalBudget = mockMilestones.reduce((sum, m) => sum + m.budget.total, 0)
    const spentBudget = mockMilestones.reduce((sum, m) => sum + m.budget.spent, 0)
    const avgProgress = mockMilestones.reduce((sum, m) => sum + m.progress, 0) / total
    const totalDeliverables = mockMilestones.reduce((sum, m) => sum + m.deliverables.length, 0)
    const completedDeliverables = mockMilestones.reduce((sum, m) =>
      sum + m.deliverables.filter(d => d.status === 'approved').length, 0)
    const totalRisks = mockMilestones.reduce((sum, m) => sum + m.risks.length, 0)
    const upcomingDeadlines = mockMilestones.filter(m => {
      const days = getDaysRemaining(m.due_date)
      return days > 0 && days <= 14
    }).length

    return {
      total, completed, inProgress, atRisk, onTrack, criticalPath,
      totalBudget, spentBudget, avgProgress, totalDeliverables,
      completedDeliverables, totalRisks, upcomingDeadlines,
      completionRate: Math.round((completed / total) * 100),
      budgetUtilization: Math.round((spentBudget / totalBudget) * 100),
      deliverableRate: Math.round((completedDeliverables / totalDeliverables) * 100),
    }
  }, [])

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    return mockMilestones.filter(milestone => {
      const matchesSearch = searchQuery === '' ||
        milestone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        milestone.project_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || milestone.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || milestone.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [searchQuery, statusFilter, priorityFilter])

  // Get all dependencies for visualization
  const allDependencies = useMemo(() => {
    const deps: Dependency[] = []
    mockMilestones.forEach(m => {
      deps.push(...m.dependencies_in, ...m.dependencies_out)
    })
    return [...new Map(deps.map(d => [d.id, d])).values()]
  }, [])

  // Additional handlers (available for future use)
  const _handleAddDependency = (_milestoneId: string) => {
    toast.info('Add Dependency')
  }

  const _handleExportTimeline = () => {
    toast.success('Exporting timeline')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Milestone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Milestone Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monday.com level project milestone tracking and delivery management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button
              className="bg-gradient-to-r from-rose-600 to-pink-600 text-white"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Milestone
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Milestones', value: stats.total, icon: Target, color: 'from-rose-500 to-pink-500' },
            { label: 'In Progress', value: stats.inProgress, icon: PlayCircle, color: 'from-blue-500 to-cyan-500' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
            { label: 'At Risk', value: stats.atRisk, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
            { label: 'On Track', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
            { label: 'Critical Path', value: stats.criticalPath, icon: Zap, color: 'from-red-500 to-rose-500' },
            { label: 'Budget Used', value: `${stats.budgetUtilization}%`, icon: DollarSign, color: 'from-purple-500 to-violet-500' },
            { label: 'Deliverables', value: `${stats.completedDeliverables}/${stats.totalDeliverables}`, icon: Package, color: 'from-indigo-500 to-blue-500' },
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
              <TabsTrigger value="milestones" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />
                Milestones
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <CalendarDays className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="deliverables" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Deliverables
              </TabsTrigger>
              <TabsTrigger value="dependencies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Link2 className="w-4 h-4 mr-2" />
                Dependencies
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search milestones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/80 dark:bg-slate-900/80"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as MilestoneStatus | 'all')}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="at_risk">At Risk</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            {/* Milestones Overview Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Milestone Dashboard</h3>
                  <p className="text-rose-100 mb-4">Track project milestones and deliverables</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-rose-100">Total Milestones</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-rose-100">On Track</p>
                      <p className="text-xl font-bold">{stats.onTrack}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-rose-100">At Risk</p>
                      <p className="text-xl font-bold">{stats.atRisk}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Target className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Milestone', color: 'text-rose-500', action: () => setShowCreateDialog(true) },
                { icon: CalendarDays, label: 'Timeline', color: 'text-blue-500', action: () => setActiveTab('timeline') },
                { icon: Package, label: 'Deliverables', color: 'text-green-500', action: () => setActiveTab('deliverables') },
                { icon: Link2, label: 'Dependencies', color: 'text-purple-500', action: () => setActiveTab('dependencies') },
                { icon: AlertTriangle, label: 'Risks', color: 'text-amber-500', action: () => setShowRisksDialog(true) },
                { icon: BarChart3, label: 'Reports', color: 'text-indigo-500', action: () => setActiveTab('reports') },
                { icon: Download, label: 'Export', color: 'text-cyan-500', action: handleExportReport },
                { icon: RefreshCw, label: 'Refresh', color: 'text-pink-500', action: handleSync },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.action}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredMilestones.map((milestone) => {
                const StatusIcon = getStatusIcon(milestone.status)
                const TypeIcon = getTypeIcon(milestone.type)
                const daysRemaining = getDaysRemaining(milestone.due_date)

                return (
                  <Card
                    key={milestone.id}
                    className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 group"
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center`}>
                            <TypeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                              {milestone.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {milestone.project_name}
                            </p>
                          </div>
                        </div>
                        {milestone.is_critical_path && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400">
                            <Zap className="w-3 h-3 mr-1" />
                            Critical
                          </Badge>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={getStatusColor(milestone.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(milestone.priority)}>
                          <Flag className="w-3 h-3 mr-1" />
                          {milestone.priority}
                        </Badge>
                        <Badge variant="outline" className={getHealthColor(milestone.health)}>
                          {milestone.health === 'on_track' ? <TrendingUp className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {milestone.health.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(milestone.due_date)}
                        </div>
                        <div className={`flex items-center gap-1 ${
                          daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          <Timer className="w-4 h-4" />
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)} days overdue`
                            : daysRemaining === 0
                            ? 'Due today'
                            : `${daysRemaining} days left`}
                        </div>
                      </div>

                      {/* Team & Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex -space-x-2">
                          {milestone.team.slice(0, 4).map((member, idx) => (
                            <Avatar key={idx} className="w-8 h-8 border-2 border-white dark:border-slate-900">
                              <AvatarImage src={member.avatar} alt="User avatar" />
                              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {milestone.team.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-slate-900">
                              +{milestone.team.length - 4}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {milestone.deliverables.filter(d => d.status === 'approved').length}/{milestone.deliverables.length}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {milestone.comments}
                          </span>
                          {milestone.risks.length > 0 && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              {milestone.risks.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Budget Bar */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Budget</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatCurrency(milestone.budget.spent)} / {formatCurrency(milestone.budget.total)}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              milestone.budget.spent > milestone.budget.total
                                ? 'bg-red-500'
                                : milestone.budget.spent > milestone.budget.total * 0.9
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((milestone.budget.spent / milestone.budget.total) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {/* Timeline Overview Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Timeline View</h2>
                  <p className="text-rose-100">Visualize milestone schedules with Gantt-style timeline</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockMilestones.length}</p>
                    <p className="text-rose-200 text-sm">Milestones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">Q1-Q2</p>
                    <p className="text-rose-200 text-sm">Timeframe</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-rose-500" />
                  Project Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="w-64 text-sm font-medium text-slate-600 dark:text-slate-400">Milestone</div>
                    <div className="flex-1 flex items-center">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
                        <div key={idx} className="flex-1 text-center text-xs text-slate-500">{month}</div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline rows */}
                  <div className="space-y-4">
                    {mockMilestones.map((milestone) => {
                      const TypeIcon = getTypeIcon(milestone.type)
                      const startPercent = Math.max(0, Math.min(100, ((new Date(milestone.start_date).getMonth()) / 6) * 100))
                      const endPercent = Math.max(0, Math.min(100, ((new Date(milestone.due_date).getMonth() + 1) / 6) * 100))
                      const width = endPercent - startPercent

                      return (
                        <div key={milestone.id} className="flex items-center gap-4">
                          <div className="w-64 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center`}>
                              <TypeIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                                {milestone.name}
                              </p>
                              <p className="text-xs text-slate-500">{milestone.progress}%</p>
                            </div>
                          </div>
                          <div className="flex-1 relative h-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <div
                              className={`absolute top-1 bottom-1 rounded-md ${
                                milestone.status === 'completed'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                  : milestone.health === 'at_risk'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                  : 'bg-gradient-to-r from-rose-500 to-pink-500'
                              }`}
                              style={{ left: `${startPercent}%`, width: `${width}%` }}
                            >
                              <div
                                className="h-full bg-white/30 rounded-l-md"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                            {milestone.is_critical_path && (
                              <Zap className="absolute -top-2 -right-2 w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-rose-500 to-pink-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-500 to-orange-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">At Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Critical Path</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockMilestones.filter(m => m.deliverables.length > 0).map((milestone) => (
                <Card key={milestone.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{milestone.name}</span>
                      <Badge variant="outline">
                        {milestone.deliverables.filter(d => d.status === 'approved').length}/{milestone.deliverables.length} Complete
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {milestone.deliverables.map((deliverable) => (
                        <div
                          key={deliverable.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-rose-500/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              deliverable.status === 'approved'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : deliverable.status === 'in_progress'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : deliverable.status === 'review'
                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                              {deliverable.status === 'approved' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : deliverable.status === 'in_progress' ? (
                                <PlayCircle className="w-4 h-4 text-blue-600" />
                              ) : deliverable.status === 'review' ? (
                                <Eye className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {deliverable.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Due: {formatDate(deliverable.due_date)} • {deliverable.assignee.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getPriorityColor(deliverable.priority)}>
                              {deliverable.priority}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {deliverable.attachments}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {deliverable.comments}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-rose-500" />
                  Milestone Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allDependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${
                        dep.status === 'satisfied'
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : dep.status === 'at_risk'
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                          : dep.status === 'violated'
                          ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {dep.source_milestone_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <ArrowRight className="w-5 h-5" />
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {dep.type.replace(/_/g, ' ')}
                            </span>
                            {dep.lag_days > 0 && (
                              <span className="text-xs text-slate-500">+{dep.lag_days}d</span>
                            )}
                            <ArrowRight className="w-5 h-5" />
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {dep.target_milestone_name}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {dep.is_blocking && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Blocking
                          </Badge>
                        )}
                        <Badge variant="outline" className={
                          dep.status === 'satisfied'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : dep.status === 'at_risk'
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : dep.status === 'violated'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }>
                          {dep.status === 'satisfied' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {dep.status === 'at_risk' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {dep.status === 'violated' && <XCircle className="w-3 h-3 mr-1" />}
                          {dep.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Cards */}
              <div className="lg:col-span-2 space-y-6">
                {mockReports.map((report) => (
                  <Card key={report.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-rose-500" />
                          {report.name}
                        </span>
                        <Badge variant="outline">{report.period}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {report.metrics.map((metric, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</span>
                              <span className={`text-sm flex items-center ${
                                metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                              }`}>
                                {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                                 metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                                {metric.change !== 0 && `${metric.change > 0 ? '+' : ''}${metric.change}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">On-Time Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Avg Progress</span>
                      <span className="text-lg font-bold text-blue-600">{Math.round(stats.avgProgress)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active Risks</span>
                      <span className="text-lg font-bold text-amber-600">{stats.totalRisks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Upcoming (14d)</span>
                      <span className="text-lg font-bold text-rose-600">{stats.upcomingDeadlines}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Generate Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Status Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Budget Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Risk Assessment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Progress Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'milestones', label: 'Milestones', icon: Target },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your milestone management preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default View Mode</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Grid View</option>
                              <option>List View</option>
                              <option>Timeline View</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>MMM DD, YYYY</option>
                              <option>DD/MM/YYYY</option>
                              <option>YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Show Completed Milestones</p>
                              <p className="text-sm text-muted-foreground">Display completed milestones in list</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-expand Details</p>
                              <p className="text-sm text-muted-foreground">Expand milestone details on click</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Show Budget Info</p>
                              <p className="text-sm text-muted-foreground">Display budget on milestone cards</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'milestones' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Milestone Configuration</CardTitle>
                        <CardDescription>Configure milestone behavior and automation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Priority</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Medium</option>
                              <option>Low</option>
                              <option>High</option>
                              <option>Critical</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Risk Threshold (%)</Label>
                            <Input type="number" defaultValue="80" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-update Status</p>
                              <p className="text-sm text-muted-foreground">Update status based on progress</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Track Dependencies</p>
                              <p className="text-sm text-muted-foreground">Enable dependency tracking</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Critical Path Analysis</p>
                              <p className="text-sm text-muted-foreground">Highlight critical path items</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how you receive milestone updates</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Due Date Reminders', description: 'Get notified before milestones are due', enabled: true },
                          { title: 'Status Change Alerts', description: 'Notify when status changes', enabled: true },
                          { title: 'Risk Alerts', description: 'Alert when milestones become at risk', enabled: true },
                          { title: 'Budget Warnings', description: 'Warn when over budget threshold', enabled: false },
                          { title: 'Team Assignment Updates', description: 'Notify on team changes', enabled: true },
                          { title: 'Weekly Summary', description: 'Weekly progress summary email', enabled: false },
                        ].map((notification, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Choose where to receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: Bell, label: 'In-App', active: true },
                            { icon: Globe, label: 'Slack', active: false },
                            { icon: MessageSquare, label: 'SMS', active: false },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                              <Switch defaultChecked={channel.active} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Project Integrations</CardTitle>
                        <CardDescription>Connect with project management tools</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Jira', description: 'Sync with Jira epics', connected: true },
                            { name: 'Asana', description: 'Connect Asana milestones', connected: false },
                            { name: 'Monday.com', description: 'Sync with Monday boards', connected: false },
                            { name: 'GitHub', description: 'Track GitHub milestones', connected: true },
                            { name: 'Slack', description: 'Team notifications', connected: true },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <Database className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys for integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="ms_sk_xxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => { navigator.clipboard.writeText('ms_sk_xxxxxxxxxxxxx'); toast.success('API Key Copied'); }}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage milestone access permissions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { role: 'Admin', access: 'Full Access', users: 2 },
                            { role: 'Project Manager', access: 'Create & Edit', users: 5 },
                            { role: 'Team Member', access: 'View & Comment', users: 15 },
                            { role: 'Viewer', access: 'View Only', users: 8 },
                          ].map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{role.role}</p>
                                  <p className="text-sm text-muted-foreground">{role.access}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">{role.users} users</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Automation Rules</CardTitle>
                        <CardDescription>Configure advanced automation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Auto-update Status', description: 'Update status based on progress', enabled: true },
                          { title: 'Risk Auto-detection', description: 'Detect at-risk milestones automatically', enabled: true },
                          { title: 'Dependency Alerts', description: 'Alert on dependency changes', enabled: false },
                          { title: 'Parent Progress Update', description: 'Update parent milestone progress', enabled: true },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your milestone data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleExportReport}>
                            <Download className="w-5 h-5" />
                            <span>Export Data</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setShowArchiveDialog(true)}>
                            <Archive className="w-5 h-5" />
                            <span>Archive Old</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleSync}>
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset Stats</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600" onClick={() => setShowPurgeDialog(true)}>
                            <Trash2 className="w-5 h-5" />
                            <span>Purge Completed</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Reset All Milestones</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Delete all milestone data</p>
                          </div>
                          <Button variant="destructive" size="sm">Reset</Button>
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
              insights={mockMilestonesAIInsights}
              title="Milestone Intelligence"
              onInsightAction={(insight) => toast.info(insight.title`) } : undefined })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMilestonesCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMilestonesPredictions}
              title="Delivery Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMilestonesActivities}
            title="Milestone Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={milestonesQuickActions}
            variant="grid"
          />
        </div>

        {/* Milestone Detail Dialog */}
        <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {selectedMilestone && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedMilestone.name}</h2>
                      <p className="text-sm text-slate-500 font-normal">{selectedMilestone.project_name}</p>
                    </div>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedMilestone.description}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6 py-4">
                    {/* Status and Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                          <Badge variant="outline" className={getStatusColor(selectedMilestone.status)}>
                            {selectedMilestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Health</span>
                          <span className={`font-medium ${getHealthColor(selectedMilestone.health)}`}>
                            {selectedMilestone.health.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Progress</span>
                          <span className="text-2xl font-bold text-rose-600">{selectedMilestone.progress}%</span>
                        </div>
                        <Progress value={selectedMilestone.progress} className="h-2" />
                      </div>
                    </div>

                    {/* Team */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Team ({selectedMilestone.team.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMilestone.team.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} alt="User avatar" />
                              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-slate-500">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Budget Breakdown</h4>
                      <div className="space-y-2">
                        {selectedMilestone.budget.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-32">{item.category}</span>
                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${(item.actual / item.planned) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-900 dark:text-white w-24 text-right">
                              {formatCurrency(item.actual)} / {formatCurrency(item.planned)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    {selectedMilestone.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Active Risks</h4>
                        <div className="space-y-2">
                          {selectedMilestone.risks.map((risk) => (
                            <div key={risk.id} className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-amber-900 dark:text-amber-200">{risk.title}</span>
                                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                                  {risk.probability} probability
                                </Badge>
                              </div>
                              <p className="text-sm text-amber-800 dark:text-amber-300">{risk.mitigation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Updates */}
                    {selectedMilestone.status_updates.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Recent Updates</h4>
                        <div className="space-y-3">
                          {selectedMilestone.status_updates.map((update) => (
                            <div key={update.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={update.author.avatar} alt="User avatar" />
                                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-xs">
                                    {update.author.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{update.author.name}</span>
                                <span className="text-xs text-slate-500">{formatDate(update.created_at)}</span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{update.content}</p>
                              {update.reactions.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {update.reactions.map((reaction, idx) => (
                                    <span key={idx} className="text-sm">
                                      {reaction.emoji} {reaction.count}
                                    </span>
                                  ))}
                                </div>
                              )}
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

        {/* Create Milestone Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                Create New Milestone
              </DialogTitle>
              <DialogDescription>
                Add a new milestone to track project progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Milestone Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Product Launch Q1"
                  value={formState.name}
                  onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this milestone"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.type}
                    onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value as MilestoneType }))}
                  >
                    <option value="project">Project</option>
                    <option value="release">Release</option>
                    <option value="phase">Phase</option>
                    <option value="checkpoint">Checkpoint</option>
                    <option value="gate">Gate</option>
                    <option value="delivery">Delivery</option>
                    <option value="launch">Launch</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.priority}
                    onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formState.due_date}
                    onChange={(e) => setFormState(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (USD)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0"
                    value={formState.budget}
                    onChange={(e) => setFormState(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Name</Label>
                  <Input
                    id="owner_name"
                    placeholder="Project owner"
                    value={formState.owner_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, owner_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_name">Team Name</Label>
                  <Input
                    id="team_name"
                    placeholder="Assigned team"
                    value={formState.team_name}
                    onChange={(e) => setFormState(prev => ({ ...prev, team_name: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateMilestone}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Milestone'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Timeline View Dialog */}
        <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                Timeline View
              </DialogTitle>
              <DialogDescription>
                Visualize milestone schedules with Gantt-style timeline
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="space-y-4">
                {mockMilestones.slice(0, 4).map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-32 text-sm font-medium truncate">{milestone.name}</div>
                    <div className="flex-1">
                      <Progress value={milestone.progress} className="h-3" />
                    </div>
                    <div className="w-20 text-right text-sm text-slate-600">{milestone.progress}%</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                Switch to the Timeline tab for full Gantt-style view
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>
                Close
              </Button>
              <Button onClick={() => { setShowTimelineDialog(false); setActiveTab('timeline'); }}>
                Open Full Timeline
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Report Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-500" />
                Export Report
              </DialogTitle>
              <DialogDescription>
                Export milestone data in various formats
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => { handleExportReport(); setShowExportDialog(false); }}>
                  <FileText className="w-5 h-5" />
                  <span>CSV Format</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => { handleExportReport(); setShowExportDialog(false); }}>
                  <FileText className="w-5 h-5" />
                  <span>JSON Format</span>
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Export includes {dbMilestones.length > 0 ? dbMilestones.length : mockMilestones.length} milestones with progress, status, and budget data.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Risks Overview Dialog */}
        <Dialog open={showRisksDialog} onOpenChange={setShowRisksDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Risk Assessment
              </DialogTitle>
              <DialogDescription>
                Active risks across all milestones
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {mockMilestones.flatMap(m => m.risks.map(r => ({ ...r, milestone: m.name }))).length > 0 ? (
                    mockMilestones.flatMap(m => m.risks.map(r => ({ ...r, milestone: m.name }))).map((risk) => (
                      <div key={risk.id} className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-amber-900 dark:text-amber-200">{risk.title}</span>
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                            {risk.probability} / {risk.impact}
                          </Badge>
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">{risk.description}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Milestone: {risk.milestone}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active risks identified</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowRisksDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Old Milestones Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-slate-500" />
                Archive Old Milestones
              </DialogTitle>
              <DialogDescription>
                Archive completed milestones older than 30 days
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This will archive {mockMilestones.filter(m => m.status === 'completed').length} completed milestones.
                  Archived milestones can be restored from the archive.
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">This action can be undone</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                toast.loading('Archiving milestones...', { id: 'archive-milestones' })
                try {
                  const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'archive' }) })
                  if (!res.ok) throw new Error('Archive failed')
                  toast.success('Milestones Archived', { id: 'archive-milestones', description: 'Old milestones archived successfully' })
                  setShowArchiveDialog(false)
                } catch { toast.error('Archive failed', { id: 'archive-milestones' }) }
              }}>
                Archive Milestones
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Purge Completed Dialog */}
        <Dialog open={showPurgeDialog} onOpenChange={setShowPurgeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Purge Completed Milestones
              </DialogTitle>
              <DialogDescription>
                Permanently delete all completed milestones
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  This will permanently delete {mockMilestones.filter(m => m.status === 'completed').length} completed milestones.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Warning: This action is irreversible</span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPurgeDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={async () => {
                toast.loading('Purging milestones...', { id: 'purge-milestones' })
                try {
                  const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'purge-completed' }) })
                  if (!res.ok) throw new Error('Purge failed')
                  toast.success('Milestones Purged', { id: 'purge-milestones', description: 'Completed milestones removed' })
                  setShowPurgeDialog(false)
                } catch { toast.error('Purge failed', { id: 'purge-milestones' }) }
              }}>
                Purge Milestones
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
