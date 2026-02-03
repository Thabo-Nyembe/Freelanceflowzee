'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Building2, Users, FileText, MessageSquare, Calendar, Clock,
  CheckCircle, AlertCircle, DollarSign, Download, Upload, Eye,
  Send, Search, Filter, Plus, Settings, ExternalLink, Link2,
  Bell, Shield, Palette, Zap, BarChart3, TrendingUp
} from 'lucide-react'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'

interface ClientProject {
  id: string
  name: string
  status: 'active' | 'completed' | 'on_hold' | 'review'
  progress: number
  dueDate: string
  budget: number
  spent: number
  tasksCompleted: number
  totalTasks: number
}

interface ClientInvoice {
  id: string
  number: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  issuedDate: string
}

interface ClientMessage {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  unread: boolean
}

const demoProjects: ClientProject[] = [
  { id: '1', name: 'Website Redesign', status: 'active', progress: 75, dueDate: '2024-02-28', budget: 15000, spent: 11250, tasksCompleted: 18, totalTasks: 24 },
  { id: '2', name: 'Mobile App Development', status: 'active', progress: 45, dueDate: '2024-03-15', budget: 45000, spent: 20250, tasksCompleted: 12, totalTasks: 28 },
  { id: '3', name: 'Brand Identity Package', status: 'review', progress: 100, dueDate: '2024-02-10', budget: 8500, spent: 8500, tasksCompleted: 15, totalTasks: 15 },
  { id: '4', name: 'Marketing Campaign', status: 'completed', progress: 100, dueDate: '2024-01-30', budget: 12000, spent: 11800, tasksCompleted: 20, totalTasks: 20 },
]

const demoInvoices: ClientInvoice[] = [
  { id: '1', number: 'INV-2024-001', amount: 5000, status: 'paid', dueDate: '2024-01-15', issuedDate: '2024-01-01' },
  { id: '2', number: 'INV-2024-002', amount: 7500, status: 'paid', dueDate: '2024-02-01', issuedDate: '2024-01-15' },
  { id: '3', number: 'INV-2024-003', amount: 6250, status: 'pending', dueDate: '2024-02-15', issuedDate: '2024-02-01' },
  { id: '4', number: 'INV-2024-004', amount: 4200, status: 'overdue', dueDate: '2024-02-05', issuedDate: '2024-01-20' },
]

const demoMessages: ClientMessage[] = [
  { id: '1', from: 'Project Manager', subject: 'Weekly Progress Update', preview: 'Here is this weeks progress report for the Website Redesign...', date: '2024-02-05', unread: true },
  { id: '2', from: 'Designer', subject: 'Design Review Request', preview: 'Please review the latest mockups for the homepage...', date: '2024-02-04', unread: true },
  { id: '3', from: 'Developer', subject: 'API Integration Complete', preview: 'The payment gateway integration has been completed...', date: '2024-02-03', unread: false },
  { id: '4', from: 'Account Manager', subject: 'Invoice Reminder', preview: 'This is a friendly reminder about invoice INV-2024-004...', date: '2024-02-02', unread: false },
]

const getProjectStatusColor = (status: ClientProject['status']) => {
  switch (status) {
    case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'on_hold': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  }
}

const getInvoiceStatusColor = (status: ClientInvoice['status']) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
}

export default function ClientPortalClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [projects] = useState<ClientProject[]>(demoProjects)
  const [invoices] = useState<ClientInvoice[]>(demoInvoices)
  const [messages] = useState<ClientMessage[]>(demoMessages)

  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0)
  const unreadMessages = messages.filter(m => m.unread).length
  const pendingInvoices = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
              <Building2 className="h-8 w-8 text-cyan-600" />
              Client Portal
            </h1>
            <p className="text-muted-foreground mt-1">Manage your projects, invoices, and communications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>

        {/* AI Insights */}
        <CollapsibleInsightsPanel
          title="Portal Insights"
          insights={[
            { label: 'Active Projects', value: activeProjects.toString(), change: '+1', changeType: 'positive' },
            { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, change: '+$15k', changeType: 'positive' },
            { label: 'Pending Payment', value: `$${pendingInvoices.toLocaleString()}`, change: '-$5k', changeType: 'negative' },
            { label: 'Unread Messages', value: unreadMessages.toString(), change: '+2', changeType: 'neutral' }
          ]}
          recommendations={[
            'Invoice INV-2024-004 is overdue - please review',
            'Website Redesign project is 75% complete and on track',
            'Brand Identity Package is ready for your final review'
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold">{activeProjects}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-cyan-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Budget Used</p>
                  <p className="text-2xl font-bold">{Math.round((totalSpent / totalBudget) * 100)}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending Payment</p>
                  <p className="text-2xl font-bold">${pendingInvoices.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Unread Messages</p>
                  <p className="text-2xl font-bold">{unreadMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="messages">Messages {unreadMessages > 0 && <Badge className="ml-2 bg-red-500">{unreadMessages}</Badge>}</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>Your ongoing projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.filter(p => p.status !== 'completed').slice(0, 3).map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge className={getProjectStatusColor(project.status)}>{project.status}</Badge>
                      </div>
                      <Progress value={project.progress} className="h-2 mb-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{project.progress}% complete</span>
                        <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Messages */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Messages</CardTitle>
                  <CardDescription>Latest communications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.slice(0, 3).map(message => (
                    <div key={message.id} className={`p-4 border rounded-lg ${message.unread ? 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800' : ''}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{message.from}</span>
                        <span className="text-xs text-muted-foreground">{new Date(message.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-medium">{message.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.slice(0, 4).map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <span className="font-semibold">{invoice.number}</span>
                        <p className="text-sm text-muted-foreground">Issued: {new Date(invoice.issuedDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">${invoice.amount.toLocaleString()}</span>
                        <Badge className={`ml-2 ${getInvoiceStatusColor(invoice.status)}`}>{invoice.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>View and track all your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getProjectStatusColor(project.status)}>{project.status}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="font-semibold">{project.progress}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Tasks</p>
                          <p className="font-semibold">{project.tasksCompleted}/{project.totalTasks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-semibold">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</p>
                        </div>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>Your complete billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                          <span className="font-semibold">{invoice.number}</span>
                          <p className="text-sm text-muted-foreground">
                            Issued: {new Date(invoice.issuedDate).toLocaleDateString()} |
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">${invoice.amount.toLocaleString()}</span>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>{invoice.status}</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Your communications with the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 ${message.unread ? 'bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{message.from.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold">{message.from}</span>
                            {message.unread && <Badge className="ml-2 bg-cyan-500">New</Badge>}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{new Date(message.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-medium">{message.subject}</p>
                      <p className="text-sm text-muted-foreground">{message.preview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Shared Files</CardTitle>
                <CardDescription>Project files and documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No files shared yet</h3>
                  <p className="text-muted-foreground mb-4">Files shared by the team will appear here</p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
