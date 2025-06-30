'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  FileText, 
  Mail, 
  Calendar, 
  GitBranch, 
  BarChart3, 
  Clock, 
  Bell, 
  AlertCircle, 
  Timer,
  Play,
  Search,
  Filter,
  Plus,
  Settings,
  TrendingUp
} from 'lucide-react'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay'
  title: string
  description: string
  icon: any
  position: { x: number; y: number }
  data: Record<string, any>
  connected: string[]
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  complexity: 'simple' | 'moderate' | 'advanced'
  estimatedSavings: string
  nodes: WorkflowNode[]
  connections: Array<{ from: string; to: string }>
  isPopular: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
  totalRuns: number
  successRate: number
  createdAt: Date
  nodes: WorkflowNode[]
  connections: Array<{ from: string; to: string }>
}

export default function WorkflowBuilderPage() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: '1',
      name: 'Auto Invoice on Project Completion',
      description: 'Automatically generate and send invoices when project status changes to completed',
      category: 'invoicing',
      complexity: 'simple',
      estimatedSavings: '2 hours/week',
      isPopular: true,
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          title: 'Project Status Changed',
          description: 'Triggers when project status becomes "completed"',
          icon: Target,
          position: { x: 100, y: 100 },
          data: { event: 'project.status.completed' },
          connected: ['action-1']
        },
        {
          id: 'action-1',
          type: 'action',
          title: 'Generate Invoice',
          description: 'Create invoice based on project details',
          icon: FileText,
          position: { x: 100, y: 200 },
          data: { template: 'standard-invoice' },
          connected: ['action-2']
        },
        {
          id: 'action-2',
          type: 'action',
          title: 'Send Email to Client',
          description: 'Email invoice to client with payment instructions',
          icon: Mail,
          position: { x: 100, y: 300 },
          data: { template: 'invoice-email' },
          connected: []
        }
      ],
      connections: [
        { from: 'trigger-1', to: 'action-1' },
        { from: 'action-1', to: 'action-2' }
      ]
    },
    {
      id: '2',
      name: 'Weekly Client Check-in',
      description: 'Send automated project updates to clients every Friday',
      category: 'client-management',
      complexity: 'moderate',
      estimatedSavings: '3 hours/week',
      isPopular: true,
      nodes: [
        {
          id: 'trigger-2',
          type: 'trigger',
          title: 'Weekly Schedule',
          description: 'Every Friday at 4 PM',
          icon: Calendar,
          position: { x: 100, y: 100 },
          data: { schedule: 'weekly', day: 'friday', time: '16:00' },
          connected: ['condition-1']
        },
        {
          id: 'condition-1',
          type: 'condition',
          title: 'Check Active Projects',
          description: 'Only for clients with active projects',
          icon: GitBranch,
          position: { x: 100, y: 200 },
          data: { condition: 'active_projects > 0' },
          connected: ['action-3']
        },
        {
          id: 'action-3',
          type: 'action',
          title: 'Send Progress Update',
          description: 'Email weekly progress summary',
          icon: BarChart3,
          position: { x: 100, y: 300 },
          data: { template: 'weekly-update' },
          connected: []
        }
      ],
      connections: [
        { from: 'trigger-2', to: 'condition-1' },
        { from: 'condition-1', to: 'action-3' }
      ]
    },
    {
      id: '3',
      name: 'Time Tracking Reminders',
      description: 'Smart reminders to start/stop time tracking based on calendar',
      category: 'time-management',
      complexity: 'moderate',
      estimatedSavings: '1.5 hours/week',
      isPopular: false,
      nodes: [
        {
          id: 'trigger-3',
          type: 'trigger',
          title: 'Calendar Event Starts',
          description: 'When a work-related event begins',
          icon: Calendar,
          position: { x: 100, y: 100 },
          data: { source: 'calendar', type: 'work-event' },
          connected: ['action-4']
        },
        {
          id: 'action-4',
          type: 'action',
          title: 'Start Time Tracking',
          description: 'Automatically start timer for project',
          icon: Clock,
          position: { x: 100, y: 200 },
          data: { action: 'start_timer' },
          connected: ['action-5']
        },
        {
          id: 'action-5',
          type: 'action',
          title: 'Send Notification',
          description: 'Confirm time tracking started',
          icon: Bell,
          position: { x: 100, y: 300 },
          data: { type: 'push-notification' },
          connected: []
        }
      ],
      connections: [
        { from: 'trigger-3', to: 'action-4' },
        { from: 'action-4', to: 'action-5' }
      ]
    },
    {
      id: '4',
      name: 'Payment Follow-up Sequence',
      description: 'Automated follow-up for overdue invoices with escalating reminders',
      category: 'invoicing',
      complexity: 'advanced',
      estimatedSavings: '4 hours/month',
      isPopular: true,
      nodes: [
        {
          id: 'trigger-4',
          type: 'trigger',
          title: 'Invoice Overdue',
          description: 'Invoice is 7 days past due',
          icon: AlertCircle,
          position: { x: 100, y: 100 },
          data: { condition: 'days_overdue >= 7' },
          connected: ['action-6']
        },
        {
          id: 'action-6',
          type: 'action',
          title: 'Send Reminder Email',
          description: 'Polite reminder about overdue payment',
          icon: Mail,
          position: { x: 100, y: 200 },
          data: { template: 'payment-reminder-1' },
          connected: ['delay-1']
        },
        {
          id: 'delay-1',
          type: 'delay',
          title: 'Wait 7 Days',
          description: 'Wait before next reminder',
          icon: Timer,
          position: { x: 100, y: 300 },
          data: { duration: 7, unit: 'days' },
          connected: ['action-7']
        },
        {
          id: 'action-7',
          type: 'action',
          title: 'Final Notice',
          description: 'Send final payment notice',
          icon: AlertCircle,
          position: { x: 100, y: 400 },
          data: { template: 'payment-final-notice' },
          connected: []
        }
      ],
      connections: [
        { from: 'trigger-4', to: 'action-6' },
        { from: 'action-6', to: 'delay-1' },
        { from: 'delay-1', to: 'action-7' }
      ]
    }
  ]

  const myWorkflows: Workflow[] = [
    {
      id: 'w1',
      name: 'Auto Invoice Generator',
      description: 'Automatically creates invoices when projects are completed',
      isActive: true,
      lastRun: new Date('2024-06-10T10:30:00'),
      nextRun: new Date('2024-06-11T14:00:00'),
      totalRuns: 24,
      successRate: 96,
      createdAt: new Date('2024-05-15'),
      nodes: workflowTemplates[0].nodes,
      connections: workflowTemplates[0].connections
    },
    {
      id: 'w2',
      name: 'Client Progress Updates',
      description: 'Weekly automated progress reports to all active clients',
      isActive: true,
      lastRun: new Date('2024-06-07T16:00:00'),
      nextRun: new Date('2024-06-14T16:00:00'),
      totalRuns: 8,
      successRate: 100,
      createdAt: new Date('2024-05-20'),
      nodes: workflowTemplates[1].nodes,
      connections: workflowTemplates[1].connections
    },
    {
      id: 'w3',
      name: 'Time Tracking Helper',
      description: 'Smart reminders and automatic time tracking',
      isActive: false,
      lastRun: new Date('2024-06-09T09:00:00'),
      nextRun: undefined,
      totalRuns: 156,
      successRate: 87,
      createdAt: new Date('2024-04-10'),
      nodes: workflowTemplates[2].nodes,
      connections: workflowTemplates[2].connections
    }
  ]

  const availableTriggers: WorkflowTrigger[] = [
    {
      id: 't1',
      type: 'time',
      name: 'Schedule',
      description: 'Run at specific times or intervals',
      icon: Clock,
      config: {}
    },
    {
      id: 't2',
      type: 'event',
      name: 'Project Status Change',
      description: 'When project status changes',
      icon: Target,
      config: {}
    },
    {
      id: 't3',
      type: 'event',
      name: 'New Client Added',
      description: 'When a new client is created',
      icon: Users,
      config: {}
    },
    {
      id: 't4',
      type: 'condition',
      name: 'Invoice Overdue',
      description: 'When invoice payment is overdue',
      icon: AlertCircle,
      config: {}
    },
    {
      id: 't5',
      type: 'webhook',
      name: 'External API Call',
      description: 'Triggered by external system',
      icon: Webhook,
      config: {}
    }
  ]

  const availableActions: WorkflowAction[] = [
    {
      id: 'a1',
      type: 'email',
      name: 'Send Email',
      description: 'Send custom email to client or team',
      icon: Mail,
      config: {}
    },
    {
      id: 'a2',
      type: 'invoice',
      name: 'Generate Invoice',
      description: 'Create and send invoice',
      icon: FileText,
      config: {}
    },
    {
      id: 'a3',
      type: 'notification',
      name: 'Send Notification',
      description: 'Push notification or in-app alert',
      icon: Bell,
      config: {}
    },
    {
      id: 'a4',
      type: 'task',
      name: 'Create Task',
      description: 'Add task to project or personal list',
      icon: CheckCircle2,
      config: {}
    },
    {
      id: 'a5',
      type: 'api',
      name: 'API Request',
      description: 'Call external API or webhook',
      icon: Code,
      config: {}
    },
    {
      id: 'a6',
      type: 'database',
      name: 'Update Records',
      description: 'Modify database records',
      icon: Database,
      config: {}
    }
  ]

  const toggleWorkflow = (id: string) => {
    console.log('Toggling workflow: ', id)
  }

  const createFromTemplate = (template: WorkflowTemplate) => {
    console.log('Creating workflow from template: ', template)
  }

  const WorkflowCard = ({ workflow }: { workflow: Workflow }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${workflow.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Workflow className={`h-5 w-5 ${workflow.isActive ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {workflow.name}
              </h3>
              <p className="text-sm text-gray-600">{workflow.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={workflow.isActive}
              onCheckedChange={() => toggleWorkflow(workflow.id)}
            />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{workflow.totalRuns}</p>
            <p className="text-xs text-gray-600">Total Runs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{workflow.successRate}%</p>
            <p className="text-xs text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {workflow.lastRun ? workflow.lastRun.toLocaleDateString() : 'Never'}
            </p>
            <p className="text-xs text-gray-600">Last Run</p>
          </div>
        </div>
        
        {workflow.nextRun && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Next run:</span>
            <span className="font-medium">{workflow.nextRun.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <Badge className={workflow.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {workflow.isActive ? "Active" : "Inactive"}
          </Badge>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm">
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const TemplateCard = ({ template }: { template: WorkflowTemplate }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
                {template.isPopular && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Badge className={
              template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
              template.complexity === 'moderate' ? 'bg-yellow-100 text-yellow-800' : "bg-red-100 text-red-800"
            }>
              {template.complexity}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {template.category}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-600">{template.estimatedSavings}</p>
            <p className="text-xs text-gray-500">estimated savings</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <GitBranch className="h-4 w-4 mr-2" />
          <span>{template.nodes.length} steps</span>
        </div>
        
        <Button 
          onClick={() => createFromTemplate(template)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Use Template
        </Button>
      </CardContent>
    </Card>
  )

  const WorkflowBuilder = () => (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Workflow Builder</h2>
              <p className="text-sm text-gray-600">Create custom automation workflows</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsBuilderOpen(false)}
              className="text-gray-500"
            >
              ✕
            </Button>
          </div>
        </div>
        <div className="flex-1 flex">
          {/* Sidebar with components */}
          <div className="w-64 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Triggers</h3>
                <div className="space-y-2">
                  {availableTriggers.map((trigger) => (
                    <div key={trigger.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <trigger.icon className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{trigger.name}</p>
                          <p className="text-xs text-gray-600">{trigger.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
                <div className="space-y-2">
                  {availableActions.map((action) => (
                    <div key={action.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <action.icon className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{action.name}</p>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Canvas area */}
          <div className="flex-1 bg-gray-50 relative">
            <div className="absolute inset-4 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Drag & Drop to Build</h3>
                <p className="text-gray-500">Drag triggers and actions from the sidebar to create your workflow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <Workflow className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Workflow Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create powerful automations to streamline your freelance business
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsBuilderOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
            <Button variant="outline" className="border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Active Workflows</p>
                  <p className="text-2xl font-bold text-blue-900">8</p>
                </div>
                <Play className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Time Saved</p>
                  <p className="text-2xl font-bold text-green-900">24.5h</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900">94.8%</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Total Executions</p>
                  <p className="text-2xl font-bold text-orange-900">1,247</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger 
              value="workflows" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Workflow className="h-4 w-4 mr-2" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* My Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {myWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="invoicing">Invoicing</SelectItem>
                    <SelectItem value="client-management">Client Management</SelectItem>
                    <SelectItem value="project-tracking">Project Tracking</SelectItem>
                    <SelectItem value="time-management">Time Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Workflow Performance</h3>
                <div className="space-y-4">
                  {myWorkflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">{workflow.totalRuns} executions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{workflow.successRate}%</p>
                        <p className="text-sm text-gray-600">success rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Time & Cost Savings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Time Saved</span>
                    <span className="text-2xl font-bold text-green-600">24.5 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Cost Savings</span>
                    <span className="text-2xl font-bold text-green-600">$3,062</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tasks Automated</span>
                    <span className="text-2xl font-bold text-blue-600">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ROI</span>
                    <span className="text-2xl font-bold text-purple-600">2,840%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Workflow Builder Modal */}
      {isBuilderOpen && <WorkflowBuilder />}
    </div>
  )
} 