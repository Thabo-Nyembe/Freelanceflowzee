'use client'

/**
 * Kazi Automations V2 - Client Component
 *
 * A comprehensive automation management dashboard for creating,
 * managing, and monitoring automated business rules and triggers.
 */

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Zap,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Clock,
  Webhook,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Settings,
  RefreshCw,
  History,
  PlayCircle,
  Activity,
  Sparkles,
  ArrowRight,
  Database,
  Mail,
  Bell,
  GitBranch,
  Loader2,
  Filter,
  FolderOpen,
  Target,
  Globe,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  Cpu,
  Layers,
  Timer,
  Shield,
  Rocket
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Types
interface Automation {
  id: string
  name: string
  description: string
  trigger: {
    type: 'event' | 'schedule' | 'condition' | 'webhook'
    event?: string
    schedule?: string
    condition?: string
  }
  actions: {
    type: string
    name: string
    config: any
  }[]
  is_active: boolean
  run_count: number
  last_triggered_at?: string
  category: string
  created_at: string
}

interface AutomationStats {
  totalAutomations: number
  activeAutomations: number
  triggersToday: number
  successRate: number
  timeSaved: string
  topAutomation: string
}

// Mock data
const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Auto-assign new tasks',
    description: 'Automatically assign tasks to team members based on workload',
    trigger: { type: 'event', event: 'task.created' },
    actions: [
      { type: 'condition', name: 'Check workload', config: {} },
      { type: 'assign-task', name: 'Assign to available member', config: {} }
    ],
    is_active: true,
    run_count: 234,
    last_triggered_at: new Date(Date.now() - 1800000).toISOString(),
    category: 'productivity',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: '2',
    name: 'Send invoice on project completion',
    description: 'Generate and send invoice when a project is marked complete',
    trigger: { type: 'event', event: 'project.completed' },
    actions: [
      { type: 'create-invoice', name: 'Generate invoice', config: {} },
      { type: 'email', name: 'Send to client', config: {} }
    ],
    is_active: true,
    run_count: 45,
    last_triggered_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'finance',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString()
  },
  {
    id: '3',
    name: 'Daily standup reminder',
    description: 'Send reminder to team 15 minutes before daily standup',
    trigger: { type: 'schedule', schedule: '0 9 45 * * 1-5' },
    actions: [
      { type: 'notification', name: 'Send reminder', config: {} }
    ],
    is_active: true,
    run_count: 120,
    last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
    category: 'communication',
    created_at: new Date(Date.now() - 86400000 * 90).toISOString()
  },
  {
    id: '4',
    name: 'Client health score alert',
    description: 'Alert when client health score drops below threshold',
    trigger: { type: 'condition', condition: 'client.health_score < 50' },
    actions: [
      { type: 'notification', name: 'Alert account manager', config: {} },
      { type: 'create-task', name: 'Create follow-up task', config: {} }
    ],
    is_active: true,
    run_count: 12,
    last_triggered_at: new Date(Date.now() - 259200000).toISOString(),
    category: 'sales',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString()
  },
  {
    id: '5',
    name: 'Overdue task escalation',
    description: 'Escalate tasks that are overdue by more than 2 days',
    trigger: { type: 'schedule', schedule: '0 0 8 * * *' },
    actions: [
      { type: 'condition', name: 'Find overdue tasks', config: {} },
      { type: 'notification', name: 'Notify manager', config: {} },
      { type: 'update-record', name: 'Mark as escalated', config: {} }
    ],
    is_active: false,
    run_count: 67,
    last_triggered_at: new Date(Date.now() - 604800000).toISOString(),
    category: 'productivity',
    created_at: new Date(Date.now() - 86400000 * 120).toISOString()
  }
]

const mockStats: AutomationStats = {
  totalAutomations: 42,
  activeAutomations: 38,
  triggersToday: 156,
  successRate: 98.4,
  timeSaved: '23 hours this week',
  topAutomation: 'Auto-assign new tasks'
}

// Trigger type configs
const triggerTypes = {
  event: { icon: <Zap className="h-4 w-4" />, color: 'bg-amber-500', label: 'Event' },
  schedule: { icon: <Clock className="h-4 w-4" />, color: 'bg-blue-500', label: 'Schedule' },
  condition: { icon: <GitBranch className="h-4 w-4" />, color: 'bg-purple-500', label: 'Condition' },
  webhook: { icon: <Webhook className="h-4 w-4" />, color: 'bg-green-500', label: 'Webhook' }
}

// Category configs
const categories = {
  productivity: { label: 'Productivity', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  finance: { label: 'Finance', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  communication: { label: 'Communication', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  sales: { label: 'Sales', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  support: { label: 'Support', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' }
}

// Quick automation suggestions
const quickAutomations = [
  {
    id: 'qa1',
    name: 'Welcome new clients',
    description: 'Send welcome email when a new client is added',
    trigger: 'event',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'qa2',
    name: 'Invoice reminders',
    description: 'Send reminder for unpaid invoices',
    trigger: 'schedule',
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: 'qa3',
    name: 'Task completion alerts',
    description: 'Notify when important tasks are completed',
    trigger: 'event',
    icon: <CheckCircle2 className="h-5 w-5" />
  },
  {
    id: 'qa4',
    name: 'Daily digest',
    description: 'Send daily summary of activities',
    trigger: 'schedule',
    icon: <Mail className="h-5 w-5" />
  }
]

export default function KaziAutomationsClient() {
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations)
  const [stats] = useState<AutomationStats>(mockStats)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('automations')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  // Filter automations
  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || automation.category === filterCategory
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && automation.is_active) ||
      (filterStatus === 'inactive' && !automation.is_active)

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Toggle automation
  const toggleAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.map(a =>
      a.id === id ? { ...a, is_active: !a.is_active } : a
    ))
    toast({
      title: 'Automation Updated',
      description: 'Automation status has been changed.'
    })
  }, [toast])

  // Delete automation
  const deleteAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id))
    toast({
      title: 'Automation Deleted',
      description: 'The automation has been removed.'
    })
  }, [toast])

  // Format time
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white">
                <Zap className="h-6 w-6" />
              </div>
              Kazi Automations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Set up rules and triggers to automate repetitive tasks
            </p>
          </div>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Automation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAutomations}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <PlayCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeAutomations}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.triggersToday}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
                  <p className="text-xs text-gray-500">Success</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.timeSaved}</p>
                  <p className="text-xs text-gray-500">Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Rocket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{stats.topAutomation}</p>
                  <p className="text-xs text-gray-500">Top Performer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Automations */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Quick Setup
                </CardTitle>
                <CardDescription>Popular automations you can set up in seconds</CardDescription>
              </div>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickAutomations.map((qa) => (
                <button
                  key={qa.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left group"
                  onClick={() => {
                    setIsCreateDialogOpen(true)
                    toast({
                      title: 'Quick Setup',
                      description: `Setting up "${qa.name}"...`
                    })
                  }}
                >
                  <div className={cn(
                    "p-2 rounded-lg text-white",
                    triggerTypes[qa.trigger as keyof typeof triggerTypes].color
                  )}>
                    {qa.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{qa.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{qa.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="automations" className="gap-2">
                <Zap className="h-4 w-4" />
                Automations
              </TabsTrigger>
              <TabsTrigger value="rules" className="gap-2">
                <Shield className="h-4 w-4" />
                Rules
              </TabsTrigger>
              <TabsTrigger value="logs" className="gap-2">
                <History className="h-4 w-4" />
                Activity Log
              </TabsTrigger>
            </TabsList>

            {activeTab === 'automations' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search automations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-white dark:bg-gray-800"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categories).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-4 mt-0">
            {filteredAutomations.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No automations found</h3>
                  <p className="text-gray-500 text-center max-w-md mb-6">
                    {searchQuery
                      ? `No automations match "${searchQuery}".`
                      : 'Create your first automation to start saving time.'}
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Automation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAutomations.map((automation) => (
                  <motion.div
                    key={automation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            {/* Trigger Icon */}
                            <div className={cn(
                              "p-3 rounded-xl text-white",
                              triggerTypes[automation.trigger.type].color
                            )}>
                              {triggerTypes[automation.trigger.type].icon}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {automation.name}
                                </h3>
                                <Badge className={categories[automation.category as keyof typeof categories]?.color || 'bg-gray-100'}>
                                  {categories[automation.category as keyof typeof categories]?.label || automation.category}
                                </Badge>
                                {automation.is_active ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {automation.description}
                              </p>

                              {/* Trigger Info */}
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  {triggerTypes[automation.trigger.type].icon}
                                  <span className="capitalize">{automation.trigger.type}</span>
                                  {automation.trigger.event && (
                                    <span className="text-gray-400">: {automation.trigger.event}</span>
                                  )}
                                  {automation.trigger.schedule && (
                                    <span className="text-gray-400">: Daily</span>
                                  )}
                                </div>
                                <span className="text-gray-300">|</span>
                                <span className="text-xs text-gray-500">
                                  {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats & Actions */}
                          <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {automation.run_count}
                                </p>
                                <p className="text-xs text-gray-500">Runs</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {formatTimeAgo(automation.last_triggered_at)}
                                </p>
                                <p className="text-xs text-gray-500">Last Run</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Switch
                                checked={automation.is_active}
                                onCheckedChange={() => toggleAutomation(automation.id)}
                              />

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <History className="h-4 w-4 mr-2" />
                                    View History
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => deleteAutomation(automation.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="mt-0">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Business Rules</CardTitle>
                <CardDescription>Define rules that control how automations behave</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Working Hours', description: 'Only run automations during business hours (9 AM - 6 PM)', active: true },
                    { name: 'Rate Limiting', description: 'Limit email automations to 100 per hour', active: true },
                    { name: 'Weekend Pause', description: 'Pause non-critical automations on weekends', active: false },
                    { name: 'Error Threshold', description: 'Disable automation after 5 consecutive failures', active: true }
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{rule.name}</p>
                          <p className="text-sm text-gray-500">{rule.description}</p>
                        </div>
                      </div>
                      <Switch checked={rule.active} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-0">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent automation executions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          i % 3 === 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"
                        )}>
                          {i % 3 === 0 ? (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {mockAutomations[i % mockAutomations.length].name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(new Date(Date.now() - i * 1800000).toISOString())}
                          </p>
                        </div>
                      </div>
                      <Badge variant={i % 3 === 0 ? "destructive" : "secondary"}>
                        {i % 3 === 0 ? 'Failed' : 'Success'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
              <DialogDescription>
                Set up a new automation rule to save time
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="e.g., Send welcome email to new clients" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="What does this automation do?" rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="condition">Condition</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  toast({
                    title: 'Automation Created',
                    description: 'Your new automation has been set up.'
                  })
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                Create Automation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
