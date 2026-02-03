'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { RotateCcw, Search, Package, Clock, CheckCircle, XCircle, Truck, DollarSign, AlertCircle, MoreHorizontal } from 'lucide-react'

const returns = [
  { id: 'RET-001', orderId: 'ORD-1234', customer: 'John Smith', product: 'Wireless Headphones', reason: 'Defective', status: 'pending', amount: 129.99, date: '2024-01-15' },
  { id: 'RET-002', orderId: 'ORD-1189', customer: 'Sarah Johnson', product: 'Smart Watch', reason: 'Wrong Size', status: 'approved', amount: 299.99, date: '2024-01-14' },
  { id: 'RET-003', orderId: 'ORD-1156', customer: 'Mike Chen', product: 'Laptop Stand', reason: 'Changed Mind', status: 'shipped', amount: 79.99, date: '2024-01-13' },
  { id: 'RET-004', orderId: 'ORD-1098', customer: 'Emily Davis', product: 'Monitor', reason: 'Damaged', status: 'completed', amount: 549.99, date: '2024-01-12' },
  { id: 'RET-005', orderId: 'ORD-1067', customer: 'Tom Wilson', product: 'Keyboard', reason: 'Not as described', status: 'rejected', amount: 149.99, date: '2024-01-10' },
]

export default function ReturnsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const stats = useMemo(() => ({
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    completed: returns.filter(r => r.status === 'completed').length,
    totalValue: returns.reduce((sum, r) => sum + r.amount, 0),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredReturns = useMemo(() => returns.filter(r =>
    (activeTab === 'all' || r.status === activeTab) &&
    (r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, activeTab])

  const insights = [
    { icon: RotateCcw, title: `${stats.total}`, description: 'Total returns' },
    { icon: Clock, title: `${stats.pending}`, description: 'Pending' },
    { icon: DollarSign, title: `$${stats.totalValue.toFixed(0)}`, description: 'Total value' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RotateCcw className="h-8 w-8 text-primary" />
            Returns
          </h1>
          <p className="text-muted-foreground mt-1">Process and manage product returns</p>
        </div>
        <Button><RotateCcw className="h-4 w-4 mr-2" />Process Return</Button>
      </div>

      <CollapsibleInsightsPanel title="Return Stats" insights={insights} defaultExpanded={true} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search returns..." className="pl-9 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredReturns.map((ret) => (
                  <div key={ret.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{ret.id}</span>
                          {getStatusBadge(ret.status)}
                        </div>
                        <h4 className="font-medium">{ret.product}</h4>
                        <p className="text-sm text-muted-foreground">{ret.customer} • {ret.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">${ret.amount}</p>
                        <p className="text-xs text-muted-foreground">{ret.date}</p>
                      </div>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
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
