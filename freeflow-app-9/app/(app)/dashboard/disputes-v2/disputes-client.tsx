'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  AlertTriangle, DollarSign, Clock, Search, Filter, FileText,
  MessageSquare, CheckCircle, XCircle, AlertCircle, Scale,
  Calendar, ChevronRight, Upload, Shield, TrendingDown, Eye,
  MoreHorizontal, History, Gavel, Send, Paperclip
} from 'lucide-react'

const disputes = [
  {
    id: 'DSP-001',
    client: 'Tech Solutions Ltd',
    clientAvatar: '/avatars/tech.jpg',
    amount: 5200,
    reason: 'Service not as described',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-10',
    dueDate: '2024-01-25',
    project: 'Website Redesign',
    description: 'Client claims the delivered website does not match the agreed specifications.',
    evidence: 3,
    messages: 8
  },
  {
    id: 'DSP-002',
    client: 'StartupXYZ',
    clientAvatar: '/avatars/startup.jpg',
    amount: 1800,
    reason: 'Unauthorized charge',
    status: 'under_review',
    priority: 'medium',
    createdAt: '2024-01-08',
    dueDate: '2024-01-23',
    project: 'Mobile App MVP',
    description: 'Client disputes a charge for additional features they claim were not requested.',
    evidence: 5,
    messages: 12
  },
  {
    id: 'DSP-003',
    client: 'Global Media Co',
    clientAvatar: '/avatars/media.jpg',
    amount: 12500,
    reason: 'Quality dispute',
    status: 'open',
    priority: 'high',
    createdAt: '2024-01-05',
    dueDate: '2024-01-20',
    project: 'Video Production',
    description: 'Client is dissatisfied with the video quality and requests a partial refund.',
    evidence: 7,
    messages: 15
  },
  {
    id: 'DSP-004',
    client: 'Local Boutique',
    clientAvatar: '/avatars/boutique.jpg',
    amount: 750,
    reason: 'Duplicate charge',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-01-02',
    dueDate: '2024-01-17',
    project: 'Brand Identity',
    description: 'System error caused duplicate payment. Refund processed.',
    evidence: 2,
    messages: 4,
    resolution: 'Full refund issued'
  },
  {
    id: 'DSP-005',
    client: 'E-commerce Plus',
    clientAvatar: '/avatars/ecom.jpg',
    amount: 3400,
    reason: 'Delivery delay',
    status: 'won',
    priority: 'medium',
    createdAt: '2023-12-28',
    dueDate: '2024-01-12',
    project: 'Store Integration',
    description: 'Client disputed due to project timeline extension. Evidence of agreed changes provided.',
    evidence: 6,
    messages: 9,
    resolution: 'Dispute won - documentation showed timeline approved'
  },
]

const messages = [
  { id: 1, from: 'client', name: 'John (Tech Solutions)', message: 'The website header is not matching the mockups we approved.', time: '2 hours ago' },
  { id: 2, from: 'support', name: 'Support Team', message: 'Thank you for reaching out. Can you please specify which elements differ from the mockups?', time: '1 hour ago' },
  { id: 3, from: 'client', name: 'John (Tech Solutions)', message: 'The color scheme and font sizes are different from what was shown in the prototype.', time: '45 min ago' },
]

export default function DisputesClient() {
  const [activeTab, setActiveTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDispute, setSelectedDispute] = useState<string | null>('DSP-001')
  const [newMessage, setNewMessage] = useState('')

  const stats = useMemo(() => {
    const open = disputes.filter(d => d.status === 'open' || d.status === 'under_review')
    const won = disputes.filter(d => d.status === 'won')
    const resolved = disputes.filter(d => d.status === 'resolved' || d.status === 'won')
    return {
      activeDisputes: open.length,
      totalAmount: open.reduce((sum, d) => sum + d.amount, 0),
      winRate: Math.round((won.length / Math.max(resolved.length, 1)) * 100),
      avgResolutionTime: '8 days'
    }
  }, [])

  const filteredDisputes = useMemo(() => {
    return disputes.filter(dispute => {
      const matchesSearch = dispute.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dispute.project.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
      const matchesTab = activeTab === 'active'
        ? ['open', 'under_review'].includes(dispute.status)
        : ['resolved', 'won', 'lost'].includes(dispute.status)
      return matchesSearch && matchesStatus && matchesTab
    })
  }, [searchQuery, statusFilter, activeTab])

  const currentDispute = disputes.find(d => d.id === selectedDispute)

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      under_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      resolved: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      won: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const labels = {
      open: 'Open',
      under_review: 'Under Review',
      resolved: 'Resolved',
      won: 'Won',
      lost: 'Lost',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return <Badge variant="outline" className={styles[priority as keyof typeof styles]}>{priority}</Badge>
  }

  const insights = [
    { icon: Shield, title: '80% Win Rate', description: 'On resolved disputes' },
    { icon: Clock, title: '8 Days Average', description: 'Resolution time' },
    { icon: TrendingDown, title: '-15% Disputes', description: 'Compared to last month' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            Disputes
          </h1>
          <p className="text-muted-foreground mt-1">Manage and resolve payment disputes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Dispute Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Disputes</p>
                <p className="text-2xl font-bold">{stats.activeDisputes}</p>
                <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount at Risk</p>
                <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">In active disputes</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate}%</p>
                <Progress value={stats.winRate} className="h-2 mt-2" />
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
                <p className="text-xs text-muted-foreground mt-1">Time to resolve</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disputes List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                  <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search disputes..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDispute === dispute.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedDispute(dispute.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{dispute.id}</span>
                      {getStatusBadge(dispute.status)}
                    </div>
                    <p className="font-medium">{dispute.client}</p>
                    <p className="text-sm text-muted-foreground truncate">{dispute.reason}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold">${dispute.amount.toLocaleString()}</span>
                      {getPriorityBadge(dispute.priority)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dispute Details */}
        <div className="lg:col-span-2">
          {currentDispute ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">{currentDispute.id}</span>
                      {getStatusBadge(currentDispute.status)}
                      {getPriorityBadge(currentDispute.priority)}
                    </div>
                    <CardTitle>{currentDispute.client}</CardTitle>
                    <CardDescription>{currentDispute.project}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${currentDispute.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Disputed Amount</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="font-medium">{currentDispute.reason}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {currentDispute.dueDate}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="p-3 bg-muted/50 rounded-lg text-sm">{currentDispute.description}</p>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{currentDispute.evidence} Evidence files</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{currentDispute.messages} Messages</span>
                  </div>
                </div>

                {/* Messages Section */}
                <div className="border rounded-lg">
                  <div className="p-3 border-b bg-muted/30">
                    <p className="font-medium">Communication</p>
                  </div>
                  <div className="p-4 space-y-4 max-h-[200px] overflow-y-auto">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.from === 'support' ? 'justify-end' : ''}`}>
                        <div className={`max-w-[80%] ${msg.from === 'support' ? 'order-1' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            msg.from === 'support'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.name} · {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button variant="outline" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Evidence
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Files
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Issue Refund</Button>
                    <Button>
                      <Gavel className="h-4 w-4 mr-2" />
                      Submit Response
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select a dispute to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
