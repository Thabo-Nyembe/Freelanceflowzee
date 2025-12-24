'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Link2, Zap, Plus, Search, Filter, Play, Pause, Settings, ChevronRight,
  ArrowRight, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity,
  Layers, GitBranch, Database, Cloud, Globe, Mail, Calendar, FileText, Users,
  MessageSquare, BarChart3, ShoppingCart, CreditCard, Bell, Folder, Image,
  MoreHorizontal, Edit, Trash2, Copy, Eye, History, Star, TrendingUp
} from 'lucide-react'

// Zapier-level interfaces
interface App {
  id: string
  name: string
  icon: string
  category: string
  description: string
  isConnected: boolean
  triggers: Trigger[]
  actions: Action[]
  premium: boolean
  popular: boolean
}

interface Trigger {
  id: string
  appId: string
  name: string
  description: string
  type: 'instant' | 'polling'
}

interface Action {
  id: string
  appId: string
  name: string
  description: string
}

interface Zap {
  id: string
  name: string
  description: string
  trigger: {
    app: App
    trigger: Trigger
  }
  actions: {
    app: App
    action: Action
  }[]
  status: 'on' | 'off' | 'error'
  lastRun: string
  taskCount: number
  successRate: number
  createdAt: string
  folder?: string
}

interface TaskHistory {
  id: string
  zapId: string
  zapName: string
  status: 'success' | 'error' | 'filtered'
  trigger: string
  actions: string[]
  timestamp: string
  duration: number
  dataIn: number
  dataOut: number
}

interface Template {
  id: string
  name: string
  description: string
  apps: App[]
  usageCount: number
  category: string
}

// Mock apps
const mockApps: App[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    category: 'Communication',
    description: 'Team messaging and collaboration',
    isConnected: true,
    triggers: [
      { id: 't1', appId: 'slack', name: 'New Message', description: 'Triggers when a new message is posted', type: 'instant' },
      { id: 't2', appId: 'slack', name: 'New Channel', description: 'Triggers when a new channel is created', type: 'instant' }
    ],
    actions: [
      { id: 'a1', appId: 'slack', name: 'Send Message', description: 'Post a message to a channel' },
      { id: 'a2', appId: 'slack', name: 'Create Channel', description: 'Create a new Slack channel' }
    ],
    premium: false,
    popular: true
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    category: 'Email',
    description: 'Google email service',
    isConnected: true,
    triggers: [
      { id: 't3', appId: 'gmail', name: 'New Email', description: 'Triggers when a new email arrives', type: 'polling' },
      { id: 't4', appId: 'gmail', name: 'New Labeled Email', description: 'Triggers when an email gets a label', type: 'polling' }
    ],
    actions: [
      { id: 'a3', appId: 'gmail', name: 'Send Email', description: 'Send an email from your Gmail account' },
      { id: 'a4', appId: 'gmail', name: 'Create Label', description: 'Create a new Gmail label' }
    ],
    premium: false,
    popular: true
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    icon: '📊',
    category: 'Productivity',
    description: 'Spreadsheet collaboration',
    isConnected: true,
    triggers: [
      { id: 't5', appId: 'sheets', name: 'New Row', description: 'Triggers when a new row is added', type: 'polling' }
    ],
    actions: [
      { id: 'a5', appId: 'sheets', name: 'Create Row', description: 'Add a new row to a spreadsheet' },
      { id: 'a6', appId: 'sheets', name: 'Update Row', description: 'Update an existing row' }
    ],
    premium: false,
    popular: true
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    category: 'CRM',
    description: 'Customer relationship management',
    isConnected: false,
    triggers: [
      { id: 't6', appId: 'salesforce', name: 'New Lead', description: 'Triggers when a new lead is created', type: 'instant' },
      { id: 't7', appId: 'salesforce', name: 'Updated Record', description: 'Triggers when a record is updated', type: 'instant' }
    ],
    actions: [
      { id: 'a7', appId: 'salesforce', name: 'Create Lead', description: 'Create a new lead' },
      { id: 'a8', appId: 'salesforce', name: 'Update Record', description: 'Update any Salesforce record' }
    ],
    premium: true,
    popular: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    category: 'Payment',
    description: 'Online payment processing',
    isConnected: true,
    triggers: [
      { id: 't8', appId: 'stripe', name: 'New Payment', description: 'Triggers when a payment is received', type: 'instant' },
      { id: 't9', appId: 'stripe', name: 'New Customer', description: 'Triggers when a customer is created', type: 'instant' }
    ],
    actions: [
      { id: 'a9', appId: 'stripe', name: 'Create Invoice', description: 'Create a new invoice' }
    ],
    premium: false,
    popular: true
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    category: 'Productivity',
    description: 'All-in-one workspace',
    isConnected: false,
    triggers: [
      { id: 't10', appId: 'notion', name: 'New Database Item', description: 'Triggers when a new item is added', type: 'polling' }
    ],
    actions: [
      { id: 'a10', appId: 'notion', name: 'Create Page', description: 'Create a new Notion page' },
      { id: 'a11', appId: 'notion', name: 'Update Page', description: 'Update an existing page' }
    ],
    premium: false,
    popular: true
  }
]

// Mock Zaps
const mockZaps: Zap[] = [
  {
    id: 'zap1',
    name: 'New Stripe payments to Slack',
    description: 'Get notified in Slack when you receive a new payment',
    trigger: { app: mockApps[4], trigger: mockApps[4].triggers[0] },
    actions: [{ app: mockApps[0], action: mockApps[0].actions[0] }],
    status: 'on',
    lastRun: '2024-01-15T10:30:00Z',
    taskCount: 1250,
    successRate: 99.8,
    createdAt: '2024-01-01T10:00:00Z',
    folder: 'Sales'
  },
  {
    id: 'zap2',
    name: 'Gmail to Google Sheets',
    description: 'Log new emails to a spreadsheet',
    trigger: { app: mockApps[1], trigger: mockApps[1].triggers[0] },
    actions: [{ app: mockApps[2], action: mockApps[2].actions[0] }],
    status: 'on',
    lastRun: '2024-01-15T10:25:00Z',
    taskCount: 3450,
    successRate: 98.5,
    createdAt: '2023-12-15T09:00:00Z',
    folder: 'Marketing'
  },
  {
    id: 'zap3',
    name: 'New Slack messages to Notion',
    description: 'Save important Slack messages to Notion',
    trigger: { app: mockApps[0], trigger: mockApps[0].triggers[0] },
    actions: [{ app: mockApps[5], action: mockApps[5].actions[0] }],
    status: 'error',
    lastRun: '2024-01-14T18:00:00Z',
    taskCount: 890,
    successRate: 85.2,
    createdAt: '2024-01-05T14:00:00Z'
  },
  {
    id: 'zap4',
    name: 'Multi-step: New lead workflow',
    description: 'Create lead in Salesforce, notify Slack, update Sheets',
    trigger: { app: mockApps[1], trigger: mockApps[1].triggers[0] },
    actions: [
      { app: mockApps[0], action: mockApps[0].actions[0] },
      { app: mockApps[2], action: mockApps[2].actions[0] }
    ],
    status: 'off',
    lastRun: '2024-01-10T12:00:00Z',
    taskCount: 450,
    successRate: 97.2,
    createdAt: '2023-11-20T11:00:00Z',
    folder: 'Sales'
  }
]

// Mock task history
const mockTasks: TaskHistory[] = [
  { id: 'task1', zapId: 'zap1', zapName: 'New Stripe payments to Slack', status: 'success', trigger: 'New Payment: $199.00', actions: ['Send Message: #sales'], timestamp: '2024-01-15T10:30:00Z', duration: 1.2, dataIn: 245, dataOut: 128 },
  { id: 'task2', zapId: 'zap2', zapName: 'Gmail to Google Sheets', status: 'success', trigger: 'New Email: Invoice from Vendor', actions: ['Create Row: Sheet1'], timestamp: '2024-01-15T10:25:00Z', duration: 2.1, dataIn: 1024, dataOut: 256 },
  { id: 'task3', zapId: 'zap3', zapName: 'New Slack messages to Notion', status: 'error', trigger: 'New Message: #general', actions: ['Create Page: Failed - Auth Error'], timestamp: '2024-01-14T18:00:00Z', duration: 0.5, dataIn: 512, dataOut: 0 },
  { id: 'task4', zapId: 'zap1', zapName: 'New Stripe payments to Slack', status: 'success', trigger: 'New Payment: $49.00', actions: ['Send Message: #sales'], timestamp: '2024-01-15T09:45:00Z', duration: 1.1, dataIn: 230, dataOut: 122 },
  { id: 'task5', zapId: 'zap2', zapName: 'Gmail to Google Sheets', status: 'filtered', trigger: 'New Email: Newsletter', actions: ['Filtered: Does not match criteria'], timestamp: '2024-01-15T09:30:00Z', duration: 0.3, dataIn: 2048, dataOut: 0 }
]

// Mock templates
const mockTemplates: Template[] = [
  { id: 'temp1', name: 'Slack + Google Sheets', description: 'Send Slack messages to a spreadsheet', apps: [mockApps[0], mockApps[2]], usageCount: 125000, category: 'Popular' },
  { id: 'temp2', name: 'Email to CRM', description: 'Create CRM records from emails', apps: [mockApps[1], mockApps[3]], usageCount: 89000, category: 'Sales' },
  { id: 'temp3', name: 'Payment notifications', description: 'Get notified of new payments', apps: [mockApps[4], mockApps[0]], usageCount: 67000, category: 'Finance' },
  { id: 'temp4', name: 'Document automation', description: 'Automate document workflows', apps: [mockApps[5], mockApps[2]], usageCount: 45000, category: 'Productivity' }
]

export default function ConnectorsClient() {
  const [activeTab, setActiveTab] = useState('zaps')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZap, setSelectedZap] = useState<Zap | null>(null)
  const [showZapDialog, setShowZapDialog] = useState(false)
  const [showAppDialog, setShowAppDialog] = useState(false)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const getStatusColor = (status: Zap['status']) => {
    switch (status) {
      case 'on': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'off': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const getTaskStatusColor = (status: TaskHistory['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'error': return 'bg-red-100 text-red-700'
      case 'filtered': return 'bg-yellow-100 text-yellow-700'
    }
  }

  const categories = [...new Set(mockApps.map(a => a.category))]
  const filteredApps = categoryFilter
    ? mockApps.filter(a => a.category === categoryFilter)
    : mockApps

  const stats = useMemo(() => ({
    totalZaps: mockZaps.length,
    activeZaps: mockZaps.filter(z => z.status === 'on').length,
    totalTasks: mockZaps.reduce((sum, z) => sum + z.taskCount, 0),
    successRate: mockZaps.reduce((sum, z) => sum + z.successRate, 0) / mockZaps.length,
    connectedApps: mockApps.filter(a => a.isConnected).length
  }), [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Automation Hub</h1>
                <p className="text-orange-100">Zapier-level Workflow Automation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <History className="w-4 h-4 mr-2" />
                Task History
              </Button>
              <Button className="bg-white text-orange-600 hover:bg-orange-50">
                <Plus className="w-4 h-4 mr-2" />
                Create Zap
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-orange-200" />
                <div>
                  <p className="text-sm text-orange-200">Active Zaps</p>
                  <p className="text-2xl font-bold">{stats.activeZaps}/{stats.totalZaps}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-orange-200" />
                <div>
                  <p className="text-sm text-orange-200">Tasks Run</p>
                  <p className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-200" />
                <div>
                  <p className="text-sm text-orange-200">Success Rate</p>
                  <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <Link2 className="w-5 h-5 text-orange-200" />
                <div>
                  <p className="text-sm text-orange-200">Connected Apps</p>
                  <p className="text-2xl font-bold">{stats.connectedApps}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-white/10 border-white/20 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-orange-200" />
                <div>
                  <p className="text-sm text-orange-200">This Month</p>
                  <p className="text-2xl font-bold">+23%</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="zaps" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              My Zaps
            </TabsTrigger>
            <TabsTrigger value="apps" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Task History
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Zaps Tab */}
          <TabsContent value="zaps" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search zaps..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Folder className="w-4 h-4 mr-2" />
                  Folders
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {mockZaps.map(zap => (
                <Card key={zap.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-2xl">
                          {zap.trigger.app.icon}
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        {zap.actions.map((action, i) => (
                          <div key={i} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-2xl">
                            {action.app.icon}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="font-semibold">{zap.name}</h3>
                        <p className="text-sm text-gray-500">{zap.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(zap.status)}>
                        {zap.status === 'on' ? 'Active' : zap.status === 'off' ? 'Paused' : 'Error'}
                      </Badge>
                      {zap.folder && <Badge variant="outline">{zap.folder}</Badge>}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Preview */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-x-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded border min-w-fit">
                      <span>{zap.trigger.app.icon}</span>
                      <div className="text-sm">
                        <p className="font-medium">{zap.trigger.trigger.name}</p>
                        <p className="text-xs text-gray-500">{zap.trigger.app.name}</p>
                      </div>
                    </div>
                    {zap.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded border min-w-fit">
                          <span>{action.app.icon}</span>
                          <div className="text-sm">
                            <p className="font-medium">{action.action.name}</p>
                            <p className="text-xs text-gray-500">{action.app.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-xl font-bold">{zap.taskCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Tasks</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-xl font-bold text-green-600">{zap.successRate}%</p>
                      <p className="text-xs text-gray-500">Success</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-xl font-bold">{zap.actions.length + 1}</p>
                      <p className="text-xs text-gray-500">Steps</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <p className="text-sm font-medium">{new Date(zap.lastRun).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Last Run</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-gray-500">Created {new Date(zap.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View History
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {zap.status === 'on' ? (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Turn On
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search apps..." className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {filteredApps.map(app => (
                <Card
                  key={app.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => { setSelectedApp(app); setShowAppDialog(true); }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{app.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{app.name}</h3>
                          {app.premium && <Badge className="bg-purple-100 text-purple-700">Premium</Badge>}
                        </div>
                        <p className="text-xs text-gray-500">{app.category}</p>
                      </div>
                    </div>
                    {app.isConnected && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{app.triggers.length} triggers</span>
                    <span>{app.actions.length} actions</span>
                  </div>
                  <Button variant={app.isConnected ? 'outline' : 'default'} className="w-full mt-4" size="sm">
                    {app.isConnected ? 'Manage Connection' : 'Connect'}
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Task History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Task History</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
                  <div>Status</div>
                  <div>Zap</div>
                  <div>Trigger</div>
                  <div>Actions</div>
                  <div>Time</div>
                  <div>Duration</div>
                </div>
              </div>
              <ScrollArea className="h-[500px]">
                {mockTasks.map(task => (
                  <div key={task.id} className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="grid grid-cols-6 gap-4 items-center">
                      <div>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                           task.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                           <AlertTriangle className="w-3 h-3 mr-1" />}
                          {task.status}
                        </Badge>
                      </div>
                      <div className="font-medium text-sm truncate">{task.zapName}</div>
                      <div className="text-sm text-gray-600 truncate">{task.trigger}</div>
                      <div className="text-sm text-gray-600 truncate">{task.actions.join(', ')}</div>
                      <div className="text-sm text-gray-500">{new Date(task.timestamp).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{task.duration}s</div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Popular Templates</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {mockTemplates.map(template => (
                <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {template.apps.map(app => (
                        <span key={app.id} className="text-3xl">{app.icon}</span>
                      ))}
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.usageCount.toLocaleString()} users
                    </span>
                    <Button size="sm">Use Template</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* App Dialog */}
      <Dialog open={showAppDialog} onOpenChange={setShowAppDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>App Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{selectedApp.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                  <p className="text-gray-500">{selectedApp.description}</p>
                  <Badge className="mt-2">{selectedApp.category}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Triggers ({selectedApp.triggers.length})</h3>
                  <div className="space-y-2">
                    {selectedApp.triggers.map(trigger => (
                      <div key={trigger.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{trigger.name}</span>
                          <Badge variant="outline" className="text-xs">{trigger.type}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{trigger.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Actions ({selectedApp.actions.length})</h3>
                  <div className="space-y-2">
                    {selectedApp.actions.map(action => (
                      <div key={action.id} className="p-3 border rounded-lg">
                        <span className="font-medium">{action.name}</span>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg">
                {selectedApp.isConnected ? 'Manage Connection' : 'Connect ' + selectedApp.name}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
