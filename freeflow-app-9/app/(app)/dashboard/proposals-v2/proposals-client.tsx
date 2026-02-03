'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  FileText, Plus, Search, Filter, Send, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, Calendar, DollarSign, User, Building,
  Copy, Download, Edit, Trash2, MoreHorizontal, TrendingUp,
  Mail, FileSignature, ArrowRight
} from 'lucide-react'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'

interface Proposal {
  id: string
  title: string
  client: string
  company: string
  value: number
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
  createdAt: string
  sentAt?: string
  expiresAt: string
  viewCount: number
  lastViewed?: string
  sections: number
  template?: string
}

const demoProposals: Proposal[] = [
  {
    id: '1',
    title: 'Website Redesign Proposal',
    client: 'John Smith',
    company: 'TechCorp Inc.',
    value: 15000,
    status: 'accepted',
    createdAt: '2024-01-10',
    sentAt: '2024-01-12',
    expiresAt: '2024-02-12',
    viewCount: 8,
    lastViewed: '2024-01-20',
    sections: 6,
    template: 'Premium Web'
  },
  {
    id: '2',
    title: 'Mobile App Development',
    client: 'Sarah Johnson',
    company: 'StartupXYZ',
    value: 45000,
    status: 'viewed',
    createdAt: '2024-02-01',
    sentAt: '2024-02-03',
    expiresAt: '2024-03-03',
    viewCount: 5,
    lastViewed: '2024-02-10',
    sections: 8,
    template: 'App Development'
  },
  {
    id: '3',
    title: 'Brand Identity Package',
    client: 'Mike Davis',
    company: 'Creative Agency',
    value: 8500,
    status: 'sent',
    createdAt: '2024-02-15',
    sentAt: '2024-02-16',
    expiresAt: '2024-03-16',
    viewCount: 0,
    sections: 5,
    template: 'Branding'
  },
  {
    id: '4',
    title: 'E-commerce Platform',
    client: 'Emily Chen',
    company: 'RetailPro',
    value: 28000,
    status: 'draft',
    createdAt: '2024-02-20',
    expiresAt: '2024-03-20',
    viewCount: 0,
    sections: 7,
    template: 'E-commerce'
  },
  {
    id: '5',
    title: 'Marketing Campaign',
    client: 'Robert Wilson',
    company: 'GrowthCo',
    value: 12000,
    status: 'declined',
    createdAt: '2024-01-25',
    sentAt: '2024-01-27',
    expiresAt: '2024-02-27',
    viewCount: 3,
    lastViewed: '2024-02-05',
    sections: 4,
    template: 'Marketing'
  },
  {
    id: '6',
    title: 'SaaS Dashboard Design',
    client: 'Lisa Brown',
    company: 'DataViz Inc.',
    value: 22000,
    status: 'expired',
    createdAt: '2024-01-05',
    sentAt: '2024-01-07',
    expiresAt: '2024-02-07',
    viewCount: 2,
    lastViewed: '2024-01-15',
    sections: 6,
    template: 'SaaS'
  }
]

const getStatusColor = (status: Proposal['status']) => {
  switch (status) {
    case 'draft': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
    case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'viewed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'declined': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getStatusIcon = (status: Proposal['status']) => {
  switch (status) {
    case 'draft': return <FileText className="h-4 w-4" />
    case 'sent': return <Send className="h-4 w-4" />
    case 'viewed': return <Eye className="h-4 w-4" />
    case 'accepted': return <CheckCircle className="h-4 w-4" />
    case 'declined': return <XCircle className="h-4 w-4" />
    case 'expired': return <Clock className="h-4 w-4" />
  }
}

export default function ProposalsClient() {
  const [proposals, setProposals] = useState<Proposal[]>(demoProposals)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredProposals = proposals.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || item.status === activeTab
    return matchesSearch && matchesTab
  })

  const totalValue = proposals.reduce((sum, p) => sum + p.value, 0)
  const acceptedValue = proposals.filter(p => p.status === 'accepted').reduce((sum, p) => sum + p.value, 0)
  const pendingValue = proposals.filter(p => ['sent', 'viewed'].includes(p.status)).reduce((sum, p) => sum + p.value, 0)
  const acceptanceRate = Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.filter(p => p.status !== 'draft').length) * 100) || 0

  const statusCounts = {
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    viewed: proposals.filter(p => p.status === 'viewed').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    declined: proposals.filter(p => p.status === 'declined').length,
    expired: proposals.filter(p => p.status === 'expired').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
              <FileSignature className="h-8 w-8 text-emerald-600" />
              Proposals
            </h1>
            <p className="text-muted-foreground mt-1">Create and track your business proposals</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        {/* AI Insights Panel */}
        <CollapsibleInsightsPanel
          title="Proposal Insights"
          insights={[
            { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, change: '+$12,500', changeType: 'positive' },
            { label: 'Won Value', value: `$${acceptedValue.toLocaleString()}`, change: '+$15,000', changeType: 'positive' },
            { label: 'Pending', value: `$${pendingValue.toLocaleString()}`, change: '+$45,000', changeType: 'positive' },
            { label: 'Win Rate', value: `${acceptanceRate}%`, change: '+5%', changeType: 'positive' }
          ]}
          recommendations={[
            'Follow up on 2 proposals viewed but not responded to',
            'Your proposals with video intros have 40% higher acceptance',
            'Consider sending proposals on Tuesday for best open rates'
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Value</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Won</p>
                  <p className="text-2xl font-bold">${acceptedValue.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending</p>
                  <p className="text-2xl font-bold">${pendingValue.toLocaleString()}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold">{acceptanceRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals, clients, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">All ({proposals.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({statusCounts.draft})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({statusCounts.sent})</TabsTrigger>
            <TabsTrigger value="viewed">Viewed ({statusCounts.viewed})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({statusCounts.accepted})</TabsTrigger>
            <TabsTrigger value="declined">Declined ({statusCounts.declined})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-4">
              {filteredProposals.map(proposal => (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{proposal.title}</h3>
                          <Badge className={getStatusColor(proposal.status)}>
                            {getStatusIcon(proposal.status)}
                            <span className="ml-1 capitalize">{proposal.status}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {proposal.client}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {proposal.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${proposal.value.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Created {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                          {proposal.viewCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {proposal.viewCount} views
                            </span>
                          )}
                        </div>
                        {proposal.template && (
                          <Badge variant="outline" className="mt-2">{proposal.template} Template</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {proposal.status === 'draft' && (
                          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                        {['sent', 'viewed'].includes(proposal.status) && (
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-1" />
                            Follow Up
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {['sent', 'viewed'].includes(proposal.status) && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Expires: {new Date(proposal.expiresAt).toLocaleDateString()}
                          </span>
                          {proposal.lastViewed && (
                            <span className="text-muted-foreground">
                              Last viewed: {new Date(proposal.lastViewed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredProposals.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
              <p className="text-muted-foreground mb-4">Create your first proposal to start winning clients</p>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>Start with a professional template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Web Design', 'Mobile App', 'Branding', 'Marketing'].map(template => (
                <Button key={template} variant="outline" className="h-auto py-4 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>{template}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
