'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { ShoppingCart, Plus, Search, Clock, CheckCircle, DollarSign, Package, TrendingUp, User } from 'lucide-react'

const purchaseOrders = [
  { id: 1, poNumber: 'PO-2024-001', vendor: 'Office Supplies Co', items: 'Office furniture, stationery', amount: 5400, status: 'approved', requestedBy: 'Sarah Chen', date: '2024-02-01' },
  { id: 2, poNumber: 'PO-2024-002', vendor: 'Tech Solutions Inc', items: 'Laptops, monitors', amount: 12500, status: 'pending', requestedBy: 'Mike Johnson', date: '2024-02-02' },
  { id: 3, poNumber: 'PO-2024-003', vendor: 'Cleaning Services Ltd', items: 'Cleaning supplies', amount: 800, status: 'received', requestedBy: 'Emily Davis', date: '2024-01-28' },
  { id: 4, poNumber: 'PO-2024-004', vendor: 'Software Licensing Corp', items: 'Annual licenses', amount: 25000, status: 'in-review', requestedBy: 'Tom Wilson', date: '2024-02-03' },
]

const vendors = [
  { id: 1, name: 'Office Supplies Co', category: 'Office Equipment', rating: 4.5, orders: 45, totalSpent: 125000 },
  { id: 2, name: 'Tech Solutions Inc', category: 'Technology', rating: 4.8, orders: 32, totalSpent: 450000 },
  { id: 3, name: 'Cleaning Services Ltd', category: 'Facilities', rating: 4.2, orders: 24, totalSpent: 36000 },
  { id: 4, name: 'Software Licensing Corp', category: 'Software', rating: 4.7, orders: 18, totalSpent: 280000 },
]

const requests = [
  { id: 1, item: 'Standing Desks (10 units)', requester: 'HR Team', urgency: 'medium', budget: 8000, status: 'pending' },
  { id: 2, item: 'Video Conferencing Equipment', requester: 'IT Team', urgency: 'high', budget: 15000, status: 'approved' },
  { id: 3, item: 'Marketing Materials', requester: 'Marketing Team', urgency: 'low', budget: 2500, status: 'pending' },
]

export default function ProcurementClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalOrders: purchaseOrders.length,
    pending: purchaseOrders.filter(po => po.status === 'pending' || po.status === 'in-review').length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.amount, 0),
    activeVendors: vendors.length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      'in-review': 'bg-blue-100 text-blue-700',
      received: 'bg-gray-100 text-gray-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge variant="outline" className={styles[urgency]}>{urgency}</Badge>
  }

  const insights = [
    { icon: ShoppingCart, title: `${stats.totalOrders}`, description: 'Purchase orders' },
    { icon: Clock, title: `${stats.pending}`, description: 'Pending approval' },
    { icon: DollarSign, title: `$${stats.totalValue.toLocaleString()}`, description: 'Total value' },
    { icon: Package, title: `${stats.activeVendors}`, description: 'Active vendors' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShoppingCart className="h-8 w-8 text-primary" />Procurement</h1>
          <p className="text-muted-foreground mt-1">Manage purchase orders and vendors</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Purchase Order</Button>
      </div>

      <CollapsibleInsightsPanel title="Procurement Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{po.poNumber}</h4>
                          {getStatusBadge(po.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{po.vendor}</p>
                        <p className="text-sm text-muted-foreground">{po.items}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${po.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />{po.requestedBy}
                      </span>
                      <span>{po.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{vendor.name}</h4>
                      <Badge variant="outline" className="mt-1">{vendor.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{vendor.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders:</span>
                      <span className="font-medium">{vendor.orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Spent:</span>
                      <span className="font-medium">${vendor.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full mt-3">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{request.item}</h4>
                        {getUrgencyBadge(request.urgency)}
                      </div>
                      <p className="text-sm text-muted-foreground">Requested by: {request.requester}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${request.budget.toLocaleString()}</p>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
