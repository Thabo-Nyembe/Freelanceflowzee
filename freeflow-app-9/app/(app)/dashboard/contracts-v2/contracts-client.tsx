'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { FileSignature, Plus, Search, Calendar, DollarSign, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react'

const contracts = [
  { id: 'CON-001', title: 'Software License Agreement - Microsoft', type: 'License', vendor: 'Microsoft Corp', value: 125000, status: 'active', startDate: '2023-01-01', endDate: '2025-12-31', renewalDate: '2025-10-01', autoRenew: true },
  { id: 'CON-002', title: 'Cloud Services Agreement - AWS', type: 'Service', vendor: 'Amazon Web Services', value: 85000, status: 'active', startDate: '2023-06-01', endDate: '2024-05-31', renewalDate: '2024-04-01', autoRenew: true },
  { id: 'CON-003', title: 'Consulting Services - Deloitte', type: 'Professional Services', vendor: 'Deloitte LLP', value: 250000, status: 'pending', startDate: '2024-03-01', endDate: '2024-12-31', renewalDate: null, autoRenew: false },
  { id: 'CON-004', title: 'Office Lease Agreement', type: 'Real Estate', vendor: 'Property Management Inc', value: 480000, status: 'active', startDate: '2022-01-01', endDate: '2027-12-31', renewalDate: '2027-06-01', autoRenew: false },
  { id: 'CON-005', title: 'Marketing Agency Services', type: 'Service', vendor: 'Creative Agency LLC', value: 120000, status: 'active', startDate: '2023-09-01', endDate: '2024-08-31', renewalDate: '2024-07-01', autoRenew: true },
  { id: 'CON-006', title: 'Equipment Leasing', type: 'Equipment', vendor: 'Tech Leasing Corp', value: 95000, status: 'expiring', startDate: '2021-03-01', endDate: '2024-02-28', renewalDate: '2024-01-15', autoRenew: false },
]

const contractTypes = [
  { name: 'Licenses', count: 15, value: 450000, color: 'bg-blue-100 text-blue-700' },
  { name: 'Services', count: 22, value: 680000, color: 'bg-purple-100 text-purple-700' },
  { name: 'Real Estate', count: 5, value: 1200000, color: 'bg-green-100 text-green-700' },
  { name: 'Equipment', count: 12, value: 320000, color: 'bg-orange-100 text-orange-700' },
]

const expiringContracts = [
  { id: 'CON-006', title: 'Equipment Leasing', vendor: 'Tech Leasing Corp', expiryDate: '2024-02-28', daysLeft: 25 },
  { id: 'CON-002', title: 'Cloud Services - AWS', vendor: 'Amazon Web Services', expiryDate: '2024-05-31', daysLeft: 117 },
  { id: 'CON-005', title: 'Marketing Agency', vendor: 'Creative Agency LLC', expiryDate: '2024-08-31', daysLeft: 209 },
]

const recentActivity = [
  { contract: 'CON-003', action: 'Contract submitted for approval', user: 'Legal Team', time: '2 hours ago' },
  { contract: 'CON-006', action: 'Renewal notice sent', user: 'Procurement', time: '1 day ago' },
  { contract: 'CON-001', action: 'Amendment added', user: 'IT Department', time: '3 days ago' },
]

export default function ContractsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    expiring: contracts.filter(c => c.status === 'expiring').length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      expiring: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => 
      (typeFilter === 'all' || c.type === typeFilter) &&
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, typeFilter])

  const insights = [
    { icon: FileSignature, title: `${stats.total}`, description: 'Total contracts' },
    { icon: CheckCircle, title: `${stats.active}`, description: 'Active' },
    { icon: AlertTriangle, title: `${stats.expiring}`, description: 'Expiring soon' },
    { icon: DollarSign, title: `$${(stats.totalValue / 1000000).toFixed(1)}M`, description: 'Total value' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><FileSignature className="h-8 w-8 text-primary" />Contract Management</h1>
          <p className="text-muted-foreground mt-1">Manage organizational contracts and agreements</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Contract</Button>
      </div>

      <CollapsibleInsightsPanel title="Contract Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contractTypes.map((type) => (
          <Card key={type.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <Badge className={type.color}>{type.name}</Badge>
              <p className="text-2xl font-bold mt-2">{type.count}</p>
              <p className="text-sm text-muted-foreground">${(type.value / 1000).toFixed(0)}k total value</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts">All Contracts</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search contracts..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="License">Licenses</option>
              <option value="Service">Services</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Equipment">Equipment</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredContracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{contract.id}</Badge>
                        <h4 className="font-semibold">{contract.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{contract.vendor}</span>
                        <span>•</span>
                        <span>{contract.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {getStatusBadge(contract.status)}
                      {contract.autoRenew && <Badge variant="outline">Auto-Renew</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Contract Value</p>
                      <p className="font-semibold text-lg text-green-600">${contract.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-medium">{contract.startDate} - {contract.endDate}</p>
                    </div>
                  </div>

                  {contract.renewalDate && (
                    <div className="text-sm mb-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Renewal Notice: {contract.renewalDate}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contracts Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringContracts.map((contract) => (
                  <div key={contract.id} className="p-4 border rounded-lg border-l-4 border-l-orange-500">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{contract.id}</Badge>
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.vendor}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">{contract.daysLeft} days left</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Expires: {contract.expiryDate}</p>
                    <Progress value={100 - (contract.daysLeft / 365 * 100)} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <Badge variant="outline" className="mb-2">{activity.contract}</Badge>
                    <p className="font-medium mb-1">{activity.action}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>{activity.time}</span>
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
