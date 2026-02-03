'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  FileText, Calendar, Clock, Search, Plus, Download, Upload,
  CheckCircle, XCircle, AlertTriangle, MoreHorizontal, Send,
  Eye, Pencil, Users, DollarSign, TrendingUp, Shield, FileCheck,
  Archive, RefreshCw, Bell, Signature
} from 'lucide-react'

const contracts = [
  {
    id: 'CNT-001',
    title: 'Enterprise Software License',
    client: 'TechCorp Inc',
    type: 'License',
    value: 125000,
    status: 'active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    autoRenew: true,
    signatories: ['John Smith', 'Sarah Chen'],
    completedSteps: 5,
    totalSteps: 5
  },
  {
    id: 'CNT-002',
    title: 'Consulting Services Agreement',
    client: 'StartupXYZ',
    type: 'Service',
    value: 75000,
    status: 'pending_signature',
    startDate: '2024-02-01',
    endDate: '2024-07-31',
    autoRenew: false,
    signatories: ['Mike Johnson'],
    completedSteps: 3,
    totalSteps: 5
  },
  {
    id: 'CNT-003',
    title: 'NDA - Project Alpha',
    client: 'Global Media',
    type: 'NDA',
    value: 0,
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    autoRenew: true,
    signatories: ['Emily Davis', 'Tom Wilson'],
    completedSteps: 5,
    totalSteps: 5
  },
  {
    id: 'CNT-004',
    title: 'Equipment Lease Agreement',
    client: 'Local Boutique',
    type: 'Lease',
    value: 24000,
    status: 'expiring_soon',
    startDate: '2023-02-01',
    endDate: '2024-01-31',
    autoRenew: false,
    signatories: ['Lisa Wang'],
    completedSteps: 5,
    totalSteps: 5
  },
  {
    id: 'CNT-005',
    title: 'Master Service Agreement',
    client: 'Enterprise Plus',
    type: 'MSA',
    value: 250000,
    status: 'draft',
    startDate: null,
    endDate: null,
    autoRenew: false,
    signatories: [],
    completedSteps: 2,
    totalSteps: 5
  },
]

const templates = [
  { name: 'NDA Template', type: 'NDA', uses: 45, lastUpdated: '2024-01-10' },
  { name: 'Service Agreement', type: 'Service', uses: 32, lastUpdated: '2024-01-08' },
  { name: 'License Agreement', type: 'License', uses: 28, lastUpdated: '2024-01-05' },
  { name: 'Consulting Contract', type: 'Consulting', uses: 18, lastUpdated: '2024-01-02' },
]

export default function ContractsManagementClient() {
  const [activeTab, setActiveTab] = useState('contracts')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => {
    const active = contracts.filter(c => c.status === 'active')
    const pending = contracts.filter(c => c.status === 'pending_signature')
    const expiring = contracts.filter(c => c.status === 'expiring_soon')
    return {
      activeContracts: active.length,
      pendingSignature: pending.length,
      expiringSoon: expiring.length,
      totalValue: contracts.reduce((sum, c) => sum + c.value, 0)
    }
  }, [])

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contract.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contract.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending_signature: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      expiring_soon: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    const labels = {
      active: 'Active',
      pending_signature: 'Pending Signature',
      draft: 'Draft',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired',
    }
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{labels[status as keyof typeof labels]}</Badge>
  }

  const insights = [
    { icon: FileCheck, title: `${stats.activeContracts} Active`, description: 'Contracts' },
    { icon: DollarSign, title: `$${(stats.totalValue / 1000).toFixed(0)}K`, description: 'Total value' },
    { icon: AlertTriangle, title: `${stats.expiringSoon} Expiring`, description: 'Within 30 days' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Contract Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage contracts, agreements, and signatures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Contract Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{stats.activeContracts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Signature</p>
                <p className="text-2xl font-bold">{stats.pendingSignature}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Signature className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contracts">All Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Contracts</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contracts..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_signature">Pending Signature</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">{contract.id}</span>
                          {getStatusBadge(contract.status)}
                          <Badge variant="outline">{contract.type}</Badge>
                        </div>
                        <h4 className="font-medium mt-1">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {contract.value > 0 && (
                        <div className="text-right">
                          <p className="font-semibold">${contract.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Contract value</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm">{contract.startDate || 'Not set'}</p>
                        <p className="text-xs text-muted-foreground">to</p>
                        <p className="text-sm">{contract.endDate || 'Not set'}</p>
                      </div>
                      <div className="w-24">
                        <Progress value={(contract.completedSteps / contract.totalSteps) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {contract.completedSteps}/{contract.totalSteps} steps
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
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
                  <CardTitle>Contract Templates</CardTitle>
                  <CardDescription>Reusable contract templates</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline" className="mt-1">{template.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{template.uses} uses</span>
                      <span>Updated {template.lastUpdated}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">Use Template</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Renewals</CardTitle>
              <CardDescription>Contracts expiring in the next 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.filter(c => c.status === 'expiring_soon' || c.autoRenew).map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">Ends {contract.endDate}</p>
                        {contract.autoRenew && (
                          <Badge className="bg-green-100 text-green-700">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Auto-renew
                          </Badge>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
