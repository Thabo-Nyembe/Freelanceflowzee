'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Shirt, Plus, Search, Clock, CheckCircle, AlertTriangle, User, Calendar, Package } from 'lucide-react'

const machines = [
  { id: 1, type: 'Washer', number: 'W-01', status: 'in-use', timeRemaining: 15, user: 'Sarah Chen', floor: '2nd Floor' },
  { id: 2, type: 'Washer', number: 'W-02', status: 'available', timeRemaining: 0, user: null, floor: '2nd Floor' },
  { id: 3, type: 'Dryer', number: 'D-01', status: 'in-use', timeRemaining: 25, user: 'Mike Johnson', floor: '2nd Floor' },
  { id: 4, type: 'Dryer', number: 'D-02', status: 'available', timeRemaining: 0, user: null, floor: '2nd Floor' },
  { id: 5, type: 'Washer', number: 'W-03', status: 'maintenance', timeRemaining: 0, user: null, floor: '3rd Floor' },
  { id: 6, type: 'Dryer', number: 'D-03', status: 'in-use', timeRemaining: 10, user: 'Emily Davis', floor: '3rd Floor' },
]

const orders = [
  { id: 1, customer: 'Sarah Chen', items: 5, service: 'Wash & Fold', status: 'in-progress', dropOff: '2024-02-01 9:00 AM', pickUp: '2024-02-02 5:00 PM' },
  { id: 2, customer: 'Mike Johnson', items: 3, service: 'Dry Cleaning', status: 'ready', dropOff: '2024-01-31 10:00 AM', pickUp: '2024-02-01 6:00 PM' },
  { id: 3, customer: 'Emily Davis', items: 8, service: 'Wash & Fold', status: 'pending', dropOff: '2024-02-01 2:00 PM', pickUp: '2024-02-03 5:00 PM' },
]

export default function LaundryClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalMachines: machines.length,
    available: machines.filter(m => m.status === 'available').length,
    inUse: machines.filter(m => m.status === 'in-use').length,
    activeOrders: orders.filter(o => o.status !== 'completed').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      available: 'bg-green-100 text-green-700',
      'in-use': 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Package, title: `${stats.totalMachines}`, description: 'Total machines' },
    { icon: CheckCircle, title: `${stats.available}`, description: 'Available' },
    { icon: Clock, title: `${stats.inUse}`, description: 'In use' },
    { icon: Shirt, title: `${stats.activeOrders}`, description: 'Active orders' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Shirt className="h-8 w-8 text-primary" />Laundry Service</h1>
          <p className="text-muted-foreground mt-1">Manage laundry machines and service orders</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Order</Button>
      </div>

      <CollapsibleInsightsPanel title="Laundry Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="machines">
        <TabsList>
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="orders">Service Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="machines" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {machines.map((machine) => (
              <Card key={machine.id} className={`hover:shadow-md transition-shadow ${machine.status === 'available' ? 'border-green-200' : machine.status === 'in-use' ? 'border-blue-200' : 'border-yellow-200'}`}>
                <CardContent className="p-4 text-center">
                  <div className="font-bold text-lg mb-1">{machine.number}</div>
                  <div className="text-sm text-muted-foreground mb-2">{machine.type}</div>
                  {getStatusBadge(machine.status)}
                  <div className="mt-3 text-xs text-muted-foreground">{machine.floor}</div>
                  {machine.timeRemaining > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-blue-600">{machine.timeRemaining} min</div>
                      <Progress value={100 - (machine.timeRemaining / 60 * 100)} className="h-1 mt-1" />
                      {machine.user && <div className="text-xs text-muted-foreground mt-1">{machine.user}</div>}
                    </div>
                  )}
                  {machine.status === 'available' && (
                    <Button size="sm" className="w-full mt-3">Start Cycle</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{order.customer}</h4>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{order.service} • {order.items} items</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>Drop-off: {order.dropOff}</span>
                        <span>Pick-up: {order.pickUp}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View Details</Button>
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
