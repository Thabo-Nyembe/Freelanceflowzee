'use client'
import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Package, Plus, AlertTriangle, TrendingDown, Box } from 'lucide-react'

const items = [
  { sku: 'SKU-001', name: 'Product A', category: 'Electronics', stock: 45, reorder: 50, unit: 'pcs', value: 22500, status: 'low' },
  { sku: 'SKU-002', name: 'Product B', category: 'Furniture', stock: 120, reorder: 25, unit: 'pcs', value: 96000, status: 'ok' },
  { sku: 'SKU-003', name: 'Product C', category: 'Office Supplies', stock: 8, reorder: 100, unit: 'boxes', value: 2400, status: 'critical' },
]

export default function InventoryClient() {
  const stats = useMemo(() => ({
    total: items.length,
    lowStock: items.filter(i => i.status !== 'ok').length,
    totalValue: items.reduce((sum, i) => sum + i.value, 0),
    critical: items.filter(i => i.status === 'critical').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ok: 'bg-green-100 text-green-700',
      low: 'bg-yellow-100 text-yellow-700',
      critical: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Package, title: `${stats.total}`, description: 'Items tracked' },
    { icon: AlertTriangle, title: `${stats.lowStock}`, description: 'Low stock' },
    { icon: Box, title: `$${(stats.totalValue / 1000).toFixed(0)}k`, description: 'Inventory value' },
    { icon: TrendingDown, title: `${stats.critical}`, description: 'Critical' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="h-8 w-8 text-primary" />Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage inventory levels</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </div>

      <CollapsibleInsightsPanel title="Inventory Overview" insights={insights} defaultExpanded={true} />

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.sku}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{item.sku}</Badge>
                    <h4 className="font-semibold">{item.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Stock</p>
                  <p className="font-bold">{item.stock} {item.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reorder Level</p>
                  <p className="font-medium">{item.reorder}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium text-green-600">${item.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{item.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
