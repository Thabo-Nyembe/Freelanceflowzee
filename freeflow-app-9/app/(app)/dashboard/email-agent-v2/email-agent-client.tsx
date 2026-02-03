'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Mail, Bot, Zap, Clock, Search, Filter, Send, Reply, Forward,
  Sparkles, Brain, MessageSquare, TrendingUp, CheckCircle, Settings,
  Play, Pause, AlertCircle, RefreshCw, Calendar, User, Building2,
  FileText, PenTool, BarChart3, Target, Inbox, Archive, Star
} from 'lucide-react'

const emailAgents = [
  {
    id: 1,
    name: 'Lead Response Agent',
    description: 'Auto-responds to new lead inquiries within minutes',
    status: 'active',
    responsesHandled: 156,
    avgResponseTime: '3 min',
    satisfaction: 94,
    triggers: ['New email from unknown sender', 'Subject contains "inquiry" or "quote"']
  },
  {
    id: 2,
    name: 'Follow-up Agent',
    description: 'Sends follow-up emails after no response for 3 days',
    status: 'active',
    responsesHandled: 89,
    avgResponseTime: '72 hours',
    satisfaction: 88,
    triggers: ['No reply for 3 days', 'Thread marked as "awaiting response"']
  },
  {
    id: 3,
    name: 'Meeting Scheduler',
    description: 'Handles meeting requests and calendar coordination',
    status: 'active',
    responsesHandled: 234,
    avgResponseTime: '5 min',
    satisfaction: 96,
    triggers: ['Keywords: "schedule", "meeting", "call"', 'Calendar invite requests']
  },
  {
    id: 4,
    name: 'Support Triage Agent',
    description: 'Categorizes and routes support tickets',
    status: 'paused',
    responsesHandled: 412,
    avgResponseTime: '1 min',
    satisfaction: 91,
    triggers: ['Emails to support@', 'Subject contains "help" or "issue"']
  },
]

const recentActivity = [
  { id: 1, agent: 'Lead Response Agent', action: 'Sent introduction email', recipient: 'john@techcorp.com', time: '2 min ago', status: 'sent' },
  { id: 2, agent: 'Meeting Scheduler', action: 'Confirmed meeting time', recipient: 'sarah@startup.io', time: '15 min ago', status: 'sent' },
  { id: 3, agent: 'Follow-up Agent', action: 'Scheduled follow-up', recipient: 'mike@agency.co', time: '1 hour ago', status: 'scheduled' },
  { id: 4, agent: 'Lead Response Agent', action: 'Awaiting approval', recipient: 'lisa@enterprise.com', time: '2 hours ago', status: 'pending' },
  { id: 5, agent: 'Meeting Scheduler', action: 'Rescheduled meeting', recipient: 'tom@design.co', time: '3 hours ago', status: 'sent' },
]

const emailTemplates = [
  { id: 1, name: 'Lead Introduction', category: 'Sales', uses: 89, openRate: 62, replyRate: 34 },
  { id: 2, name: 'Follow-up Reminder', category: 'Sales', uses: 156, openRate: 58, replyRate: 22 },
  { id: 3, name: 'Meeting Confirmation', category: 'Scheduling', uses: 234, openRate: 95, replyRate: 78 },
  { id: 4, name: 'Project Update', category: 'Client', uses: 67, openRate: 82, replyRate: 45 },
  { id: 5, name: 'Invoice Reminder', category: 'Billing', uses: 43, openRate: 76, replyRate: 31 },
]

export default function EmailAgentClient() {
  const [activeTab, setActiveTab] = useState('agents')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null)

  const stats = useMemo(() => ({
    totalHandled: emailAgents.reduce((sum, a) => sum + a.responsesHandled, 0),
    activeAgents: emailAgents.filter(a => a.status === 'active').length,
    avgSatisfaction: Math.round(emailAgents.reduce((sum, a) => sum + a.satisfaction, 0) / emailAgents.length),
    timeSaved: '47 hours'
  }), [])

  const insights = [
    { icon: Zap, title: '47 Hours Saved', description: 'This month through automation' },
    { icon: TrendingUp, title: '94% Satisfaction', description: 'Average across all agents' },
    { icon: Target, title: '891 Emails Handled', description: 'Without manual intervention' },
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
    } else if (status === 'paused') {
      return <Badge variant="secondary">Paused</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const getActivityStatus = (status: string) => {
    const styles = {
      sent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            Email Agent
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered email automation and responses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Automation Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Handled</p>
                <p className="text-2xl font-bold">{stats.totalHandled}</p>
                <p className="text-xs text-green-600 mt-1">+156 this week</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold">{stats.activeAgents}</p>
                <p className="text-xs text-muted-foreground mt-1">of {emailAgents.length} total</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">{stats.timeSaved}</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{stats.avgSatisfaction}%</p>
                <Progress value={stats.avgSatisfaction} className="h-2 mt-2" />
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="compose">AI Compose</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {emailAgents.map((agent) => (
              <Card key={agent.id} className={selectedAgent === agent.id ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>{agent.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(agent.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <p className="text-xl font-bold">{agent.responsesHandled}</p>
                      <p className="text-xs text-muted-foreground">Handled</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <p className="text-xl font-bold">{agent.avgResponseTime}</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <p className="text-xl font-bold">{agent.satisfaction}%</p>
                      <p className="text-xs text-muted-foreground">Satisfaction</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Triggers:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.triggers.map((trigger, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{trigger}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch checked={agent.status === 'active'} />
                      <span className="text-sm">{agent.status === 'active' ? 'Active' : 'Paused'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Configure</Button>
                      <Button size="sm">View Logs</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Activity</CardTitle>
              <CardDescription>Latest actions taken by your email agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.agent}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{activity.recipient}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {getActivityStatus(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>Pre-built templates for AI agents</CardDescription>
                </div>
                <Button>
                  <PenTool className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emailTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <Badge variant="outline" className="mt-1">{template.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="font-semibold">{template.uses}</p>
                        <p className="text-xs text-muted-foreground">Uses</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">{template.openRate}%</p>
                        <p className="text-xs text-muted-foreground">Open Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-blue-600">{template.replyRate}%</p>
                        <p className="text-xs text-muted-foreground">Reply Rate</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Email Composer
              </CardTitle>
              <CardDescription>Let AI help you write the perfect email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient</label>
                  <Input placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tone</label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">What would you like to say?</label>
                <Textarea
                  placeholder="Describe what you want to communicate... e.g., 'Follow up on the proposal I sent last week, express interest in their feedback, and suggest a call next Tuesday'"
                  rows={4}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Email
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI-Generated Preview</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Subject:</strong> Following Up on Our Proposal</p>
                  <p className="italic">Start typing above to generate an email preview...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
