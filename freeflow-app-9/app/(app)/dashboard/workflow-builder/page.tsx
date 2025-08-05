'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Workflow,
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
  TrendingUp,
  MoreHorizontal,
  Eye,
  Edit3,
  Users,
  Sparkles,
  Wand2,
  Save,
  Download,
  CheckCircle2
} from 'lucide-react'

export default function WorkflowBuilderPage() {
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const workflows = [
    {
      id: '1',
      name: 'Auto Invoice Generation',
      description: 'Automatically generate invoices when projects are completed',
      isActive: true,
      lastRun: new Date('2024-01-15'),
      totalRuns: 45,
      successRate: 98,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Client Check-in Reminder',
      description: 'Send weekly check-in emails to active clients',
      isActive: true,
      lastRun: new Date('2024-01-14'),
      totalRuns: 12,
      successRate: 100,
      createdAt: new Date('2024-01-08')
    },
    {
      id: '3',
      name: 'Project Deadline Alert',
      description: 'Alert team members 2 days before project deadlines',
      isActive: false,
      lastRun: new Date('2024-01-10'),
      totalRuns: 8,
      successRate: 87,
      createdAt: new Date('2024-01-05')
    }
  ]

  const templates = [
    {
      id: '1',
      name: 'Invoice Automation',
      description: 'Auto-generate and send invoices when projects complete',
      category: 'invoicing',
      complexity: 'simple',
      estimatedSavings: '2 hours/week',
      isPopular: true
    },
    {
      id: '2',
      name: 'Client Communication',
      description: 'Automated client check-ins and status updates',
      category: 'communication',
      complexity: 'moderate',
      estimatedSavings: '3 hours/week',
      isPopular: true
    },
    {
      id: '3',
      name: 'Project Management',
      description: 'Automated task assignments and deadline reminders',
      category: 'project-management',
      complexity: 'advanced',
      estimatedSavings: '5 hours/week',
      isPopular: false
    }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
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
          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-green-600">+2 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Workflow className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Saved</p>
                  <p className="text-3xl font-bold text-gray-900">24h</p>
                  <p className="text-sm text-purple-600">This week</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">98%</p>
                  <p className="text-sm text-green-600">Excellent</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Runs</p>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-blue-600">All time</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/30">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Builder
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white">
                          <Workflow className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                        </div>
                      </div>
                      <Switch checked={workflow.isActive} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Runs</p>
                        <p className="font-semibold">{workflow.totalRuns}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success Rate</p>
                        <p className="font-semibold text-green-600">{workflow.successRate}%</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last run: {workflow.lastRun.toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="invoicing">Invoicing</option>
                  <option value="communication">Communication</option>
                  <option value="project-management">Project Management</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            {template.isPopular && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        Saves {template.estimatedSavings}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" className="flex-1">
                        <Plus className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Visual Workflow Builder
                </CardTitle>
                <p className="text-gray-600">
                  Drag and drop components to build your custom workflow
                </p>
              </CardHeader>
              <CardContent className="h-96">
                <div className="h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Wand2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Building</h3>
                    <p className="text-gray-500 mb-4">Choose a template or start from scratch</p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Workflow
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}