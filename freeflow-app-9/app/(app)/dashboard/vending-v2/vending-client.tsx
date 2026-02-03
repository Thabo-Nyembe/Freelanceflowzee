'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Coffee, Plus, Search, MapPin, AlertTriangle, TrendingUp, DollarSign, Package } from 'lucide-react'

const machines = [
  { id: 1, type: 'Snacks', location: '2nd Floor Break Room', status: 'online', stock: 75, capacity: 100, revenue: 245, lastRefill: '2024-02-01' },
  { id: 2, type: 'Beverages', location: '3rd Floor Lounge', status: 'online', stock: 60, capacity: 80, revenue: 320, lastRefill: '2024-02-01' },
  { id: 3, type: 'Coffee', location: '1st Floor Lobby', status: 'online', stock: 85, capacity: 100, revenue: 450, lastRefill: '2024-02-02' },
  { id: 4, type: 'Snacks', location: '4th Floor Commons', status: 'low-stock', stock: 15, capacity: 100, revenue: 180, lastRefill: '2024-01-28' },
  { id: 5, type: 'Beverages', location: 'Basement Gym', status: 'offline', stock: 0, capacity: 80, revenue: 0, lastRefill: '2024-01-25' },
]

const inventory = [
  { id: 1, item: 'Chips - Variety Pack', machine: 'Snacks (2nd Floor)', stock: 24, threshold: 10, price: 1.50 },
  { id: 2, item: 'Soda - Coca Cola', machine: 'Beverages (3rd Floor)', stock: 18, threshold: 12, price: 1.75 },
  { id: 3, item: 'Coffee - Arabica', machine: 'Coffee (1st Floor)', stock: 35, threshold: 15, price: 2.50 },
  { id: 4, item: 'Energy Bar', machine: 'Snacks (4th Floor)', stock: 5, threshold: 10, price: 2.00 },
  { id: 5, item: 'Water Bottles', machine: 'Beverages (Basement)', stock: 0, threshold: 15, price: 1.25 },
]

export default function VendingClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalMachines: machines.length,
    online: machines.filter(m => m.status === 'online').length,
    totalRevenue: machines.reduce((sum, m) => sum + m.revenue, 0),
    lowStock: inventory.filter(i => i.stock <= i.threshold).length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      online: 'bg-green-100 text-green-700',
      offline: 'bg-red-100 text-red-700',
      'low-stock': 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const insights = [
    { icon: Coffee, title: `${stats.totalMachines}`, description: 'Vending machines' },
    { icon: Package, title: `${stats.online}`, description: 'Online' },
    { icon: DollarSign, title: `$${stats.totalRevenue}`, description: 'Revenue this week' },
    { icon: AlertTriangle, title: `${stats.lowStock}`, description: 'Low stock items' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Coffee className="h-8 w-8 text-primary" />Vending Machines</h1>
          <p className="text-muted-foreground mt-1">Monitor vending machines and inventory</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Schedule Refill</Button>
      </div>

      <CollapsibleInsightsPanel title="Vending Overview" insights={insights} defaultExpanded={true} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Machines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((machine) => (
            <Card key={machine.id} className={`${machine.status === 'low-stock' ? 'border-yellow-200' : machine.status === 'offline' ? 'border-red-200' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{machine.type}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{machine.location}
                    </p>
                  </div>
                  {getStatusBadge(machine.status)}
                </div>

                {machine.status !== 'offline' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span>{machine.stock}/{machine.capacity}</span>
                      </div>
                      <Progress value={machine.stock/machine.capacity*100} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue (Week)</span>
                      <span className="font-medium">${machine.revenue}</span>
                    </div>

                    <p className="text-xs text-muted-foreground">Last refill: {machine.lastRefill}</p>
                  </div>
                )}

                {machine.status === 'offline' && (
                  <div className="text-sm text-red-600">
                    <p>Machine is offline</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact support for maintenance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Inventory</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {inventory.map((item) => {
                const isLowStock = item.stock <= item.threshold
                return (
                  <div key={item.id} className={`p-4 hover:bg-muted/50 ${isLowStock ? 'bg-yellow-50' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{item.item}</h4>
                          {isLowStock && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                              <AlertTriangle className="h-3 w-3 mr-1" />Low Stock
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.machine}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${item.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Stock: {item.stock} units</span>
                      <span className="text-muted-foreground">Threshold: {item.threshold}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
