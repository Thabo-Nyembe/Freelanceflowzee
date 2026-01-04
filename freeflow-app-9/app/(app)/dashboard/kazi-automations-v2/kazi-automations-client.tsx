'use client'

/**
 * Kazi Automations V2 - Client Component
 *
 * A comprehensive automation management dashboard for creating,
 * managing, and monitoring automated business rules and triggers.
 */

import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useKaziAutomations, Automation } from '@/hooks/use-kazi-automations'
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
  CheckCircle2,
  XCircle,
  Settings,
  History,
  PlayCircle,
  Activity,
  Sparkles,
  ArrowRight,
  Mail,
  GitBranch,
  Loader2,
  Users,
  DollarSign,
  Timer,
  Shield,
  Rocket,
  Play,
  Save
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Extended stats interface for display
interface DisplayStats {
  totalAutomations: number
  activeAutomations: number
  triggersToday: number
  successRate: number
  timeSaved: string
  topAutomation: string
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
  // Use the Kazi Automations hook with mock data fallback
  const {
    automations,
    stats: apiStats,
    runningAutomations,
    runAutomation: executeAutomation,
    toggleAutomation: toggleAutomationStatus,
    deleteAutomation: removeAutomation,
    duplicateAutomation,
    createAutomation,
    updateAutomation
  } = useKaziAutomations({ useMockData: true })

  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('automations')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    trigger_type: 'event' as const,
    category: 'productivity'
  })
  const { toast } = useToast()

  // Compute display stats from API stats
  const stats: DisplayStats = useMemo(() => ({
    totalAutomations: apiStats.totalAutomations,
    activeAutomations: apiStats.activeAutomations,
    triggersToday: apiStats.totalRuns, // This would need real-time data for "today"
    successRate: apiStats.successRate,
    timeSaved: `${Math.round(apiStats.timeSaved / 60)} hours saved`,
    topAutomation: automations.length > 0
      ? automations.reduce((top, a) => a.run_count > top.run_count ? a : top, automations[0]).name
      : 'None yet'
  }), [apiStats, automations])

  // Run automation
  const runAutomation = useCallback((id: string) => {
    executeAutomation(id)
  }, [executeAutomation])

  // Open settings
  const openSettings = useCallback((automation: Automation) => {
    setSelectedAutomation(automation)
    setIsSettingsDialogOpen(true)
  }, [])

  // Filter automations
  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (automation.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || automation.category === filterCategory
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && automation.status === 'active') ||
      (filterStatus === 'inactive' && automation.status !== 'active')

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Toggle automation
  const toggleAutomation = useCallback((id: string) => {
    toggleAutomationStatus(id)
  }, [toggleAutomationStatus])

  // Delete automation
  const deleteAutomation = useCallback((id: string) => {
    removeAutomation(id)
  }, [removeAutomation])

  // Handle create automation
  const handleCreateAutomation = useCallback(async () => {
    if (!newAutomation.name) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' })
      return
    }
    await createAutomation({
      name: newAutomation.name,
      description: newAutomation.description,
      trigger_type: newAutomation.trigger_type,
      category: newAutomation.category,
      actions: [],
      status: 'draft'
    })
    setIsCreateDialogOpen(false)
    setNewAutomation({ name: '', description: '', trigger_type: 'event', category: 'productivity' })
  }, [newAutomation, createAutomation, toast])

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    if (!selectedAutomation) return
    await updateAutomation(selectedAutomation.id, selectedAutomation)
    setIsSettingsDialogOpen(false)
  }, [selectedAutomation, updateAutomation])

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
                              triggerTypes[automation.trigger_type as keyof typeof triggerTypes]?.color || 'bg-amber-500'
                            )}>
                              {triggerTypes[automation.trigger_type as keyof typeof triggerTypes]?.icon || <Zap className="h-4 w-4" />}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {automation.name}
                                </h3>
                                <Badge className={categories[automation.category as keyof typeof categories]?.color || 'bg-gray-100'}>
                                  {categories[automation.category as keyof typeof categories]?.label || automation.category}
                                </Badge>
                                {automation.status === 'active' ? (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                    {automation.status === 'paused' ? 'Paused' : automation.status === 'error' ? 'Error' : 'Draft'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {automation.description}
                              </p>

                              {/* Trigger Info */}
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  {triggerTypes[automation.trigger_type as keyof typeof triggerTypes]?.icon || <Zap className="h-3 w-3" />}
                                  <span className="capitalize">{automation.trigger_type}</span>
                                  {automation.trigger_config?.event && (
                                    <span className="text-gray-400">: {String(automation.trigger_config.event)}</span>
                                  )}
                                  {automation.trigger_config?.cron && (
                                    <span className="text-gray-400">: Scheduled</span>
                                  )}
                                </div>
                                <span className="text-gray-300">|</span>
                                <span className="text-xs text-gray-500">
                                  {automation.actions?.length || 0} action{(automation.actions?.length || 0) !== 1 ? 's' : ''}
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
                                checked={automation.status === 'active'}
                                onCheckedChange={() => toggleAutomation(automation.id)}
                              />

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => runAutomation(automation.id)}
                                disabled={runningAutomations.has(automation.id)}
                                title="Run Now"
                              >
                                {runningAutomations.has(automation.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openSettings(automation)}
                                title="Settings"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openSettings(automation)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => duplicateAutomation(automation.id)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setActiveTab('logs')}>
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
                            {automations.length > 0 ? automations[i % automations.length].name : `Automation ${i + 1}`}
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
                <Input
                  placeholder="e.g., Send welcome email to new clients"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What does this automation do?"
                  rows={2}
                  value={newAutomation.description}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select
                    value={newAutomation.trigger_type}
                    onValueChange={(value) => setNewAutomation(prev => ({ ...prev, trigger_type: value as 'event' | 'schedule' | 'webhook' | 'manual' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newAutomation.category}
                    onValueChange={(value) => setNewAutomation(prev => ({ ...prev, category: value }))}
                  >
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
                onClick={handleCreateAutomation}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                Create Automation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automation Settings
              </DialogTitle>
              <DialogDescription>
                Configure settings for "{selectedAutomation?.name}"
              </DialogDescription>
            </DialogHeader>

            {selectedAutomation && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Automation Name</Label>
                  <Input
                    value={selectedAutomation.name}
                    onChange={(e) => setSelectedAutomation(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedAutomation.description || ''}
                    onChange={(e) => setSelectedAutomation(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trigger Type</Label>
                    <Select
                      value={selectedAutomation.trigger_type}
                      onValueChange={(value) => setSelectedAutomation(prev => prev ? { ...prev, trigger_type: value as Automation['trigger_type'] } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event Trigger</SelectItem>
                        <SelectItem value="schedule">Schedule</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={selectedAutomation.category}
                      onValueChange={(value) => setSelectedAutomation(prev => prev ? { ...prev, category: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([key, cat]) => (
                          <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedAutomation.trigger_type === 'event' && (
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={String(selectedAutomation.trigger_config?.event || '')}
                      onValueChange={(value) => setSelectedAutomation(prev => prev ? {
                        ...prev,
                        trigger_config: { ...prev.trigger_config, event: value }
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task.created">Task Created</SelectItem>
                        <SelectItem value="task.completed">Task Completed</SelectItem>
                        <SelectItem value="project.created">Project Created</SelectItem>
                        <SelectItem value="project.completed">Project Completed</SelectItem>
                        <SelectItem value="client.created">Client Created</SelectItem>
                        <SelectItem value="invoice.created">Invoice Created</SelectItem>
                        <SelectItem value="invoice.paid">Invoice Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedAutomation.trigger_type === 'schedule' && (
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Actions ({selectedAutomation.actions?.length || 0})</Label>
                  <div className="space-y-2">
                    {(selectedAutomation.actions || []).map((action, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white capitalize">{action.type.replace(/-/g, ' ')}</p>
                          <p className="text-xs text-gray-500">{action.type}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Automation Status</p>
                    <p className="text-sm text-gray-500">Enable or disable this automation</p>
                  </div>
                  <Switch
                    checked={selectedAutomation.status === 'active'}
                    onCheckedChange={() => {
                      const newStatus = selectedAutomation.status === 'active' ? 'paused' : 'active'
                      setSelectedAutomation(prev => prev ? { ...prev, status: newStatus } : null)
                    }}
                  />
                </div>

                {/* Stats display */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAutomation.run_count}</p>
                    <p className="text-xs text-gray-500">Total Runs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedAutomation.success_rate}%</p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedAutomation.time_saved}m</p>
                    <p className="text-xs text-gray-500">Time Saved</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-amber-500 to-orange-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
