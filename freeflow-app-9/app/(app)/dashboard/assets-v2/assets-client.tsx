'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Server, Plus, Search, Laptop, Smartphone, Monitor, HardDrive, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const assets = [
  { id: 'AST-001', name: 'MacBook Pro 16"', type: 'Laptop', assignedTo: 'John Smith', department: 'Engineering', status: 'active', purchaseDate: '2023-05-15', warranty: '2025-05-15', value: 2999, condition: 'excellent' },
  { id: 'AST-002', name: 'Dell XPS 15', type: 'Laptop', assignedTo: 'Emma Wilson', department: 'Design', status: 'active', purchaseDate: '2023-06-20', warranty: '2026-06-20', value: 1899, condition: 'good' },
  { id: 'AST-003', name: 'iPhone 14 Pro', type: 'Mobile', assignedTo: 'Mike Chen', department: 'Sales', status: 'active', purchaseDate: '2023-09-01', warranty: '2024-09-01', value: 1099, condition: 'excellent' },
  { id: 'AST-004', name: 'Dell UltraSharp Monitor', type: 'Monitor', assignedTo: 'Sarah Davis', department: 'Marketing', status: 'active', purchaseDate: '2023-04-10', warranty: '2026-04-10', value: 599, condition: 'good' },
  { id: 'AST-005', name: 'HP Server Rack', type: 'Server', assignedTo: 'IT Department', department: 'IT', status: 'maintenance', purchaseDate: '2022-03-15', warranty: '2025-03-15', value: 8999, condition: 'fair' },
  { id: 'AST-006', name: 'Surface Pro 9', type: 'Tablet', assignedTo: 'Alex Johnson', department: 'Product', status: 'active', purchaseDate: '2023-11-05', warranty: '2025-11-05', value: 1299, condition: 'excellent' },
  { id: 'AST-007', name: 'Lenovo ThinkPad', type: 'Laptop', assignedTo: null, department: null, status: 'available', purchaseDate: '2023-12-01', warranty: '2026-12-01', value: 1499, condition: 'new' },
]

const assetCategories = [
  { name: 'Laptops', count: 48, value: 95000, color: 'bg-blue-100 text-blue-700', icon: Laptop },
  { name: 'Monitors', count: 62, value: 38000, color: 'bg-purple-100 text-purple-700', icon: Monitor },
  { name: 'Mobile Devices', count: 35, value: 42000, color: 'bg-green-100 text-green-700', icon: Smartphone },
  { name: 'Servers', count: 12, value: 125000, color: 'bg-red-100 text-red-700', icon: Server },
]

const maintenanceSchedule = [
  { asset: 'AST-005', name: 'HP Server Rack', date: '2024-02-15', type: 'Preventive' },
  { asset: 'AST-012', name: 'Network Switch', date: '2024-02-20', type: 'Inspection' },
  { asset: 'AST-018', name: 'UPS System', date: '2024-02-25', type: 'Battery Check' },
]

const warrantyExpiring = [
  { asset: 'AST-003', name: 'iPhone 14 Pro', expires: '2024-09-01', daysLeft: 212 },
  { asset: 'AST-022', name: 'Samsung Monitor', expires: '2024-05-15', daysLeft: 103 },
  { asset: 'AST-015', name: 'iPad Pro', expires: '2024-08-20', daysLeft: 200 },
]

export default function AssetsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: assets.length,
    active: assets.filter(a => a.status === 'active').length,
    available: assets.filter(a => a.status === 'available').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    totalValue: assets.reduce((sum, a) => sum + a.value, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      available: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      retired: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const getConditionBadge = (condition: string) => {
    const styles: Record<string, string> = {
      new: 'bg-green-100 text-green-700',
      excellent: 'bg-blue-100 text-blue-700',
      good: 'bg-yellow-100 text-yellow-700',
      fair: 'bg-orange-100 text-orange-700',
      poor: 'bg-red-100 text-red-700',
    }
    return <Badge variant="outline" className={styles[condition]}>{condition}</Badge>
  }

  const filteredAssets = useMemo(() => {
    return assets.filter(a => 
      (typeFilter === 'all' || a.type === typeFilter) &&
      (statusFilter === 'all' || a.status === statusFilter) &&
      (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, typeFilter, statusFilter])

  const insights = [
    { icon: Server, title: `${stats.total}`, description: 'Total assets' },
    { icon: CheckCircle, title: `${stats.active}`, description: 'In use' },
    { icon: Clock, title: `${stats.available}`, description: 'Available' },
    { icon: AlertTriangle, title: `$${(stats.totalValue / 1000).toFixed(0)}k`, description: 'Total value' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Server className="h-8 w-8 text-primary" />Asset Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage company assets</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Asset</Button>
      </div>

      <CollapsibleInsightsPanel title="Asset Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {assetCategories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <category.icon className="h-5 w-5 text-muted-foreground" />
                <Badge className={category.color}>{category.name}</Badge>
              </div>
              <p className="text-2xl font-bold">{category.count}</p>
              <p className="text-sm text-muted-foreground">${category.value.toLocaleString()} total value</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">All Assets</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="warranty">Warranty</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assets..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Laptop">Laptops</option>
              <option value="Monitor">Monitors</option>
              <option value="Mobile">Mobile</option>
              <option value="Server">Servers</option>
            </select>
            <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{asset.id}</Badge>
                        <h4 className="font-semibold">{asset.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{asset.type}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(asset.status)}
                      {getConditionBadge(asset.condition)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span className="font-medium">{asset.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{asset.department || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase Date:</span>
                      <span className="font-medium">{asset.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium text-green-600">${asset.value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty Until:</span>
                      <span className="font-medium">{asset.warranty}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {maintenanceSchedule.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{item.asset}</Badge>
                        <h4 className="font-semibold">{item.name}</h4>
                      </div>
                      <Badge>{item.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Scheduled: {item.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Warranties Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warrantyExpiring.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{item.asset}</Badge>
                        <h4 className="font-semibold">{item.name}</h4>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">{item.daysLeft} days left</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Expires: {item.expires}</p>
                    <Progress value={(item.daysLeft / 365) * 100} className="h-2 mt-2" />
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
