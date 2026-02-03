'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { TrendingUp, DollarSign, Target } from 'lucide-react'

const revenue = [
  { source: 'Product Sales', current: 1850000, previous: 1620000, growth: 14.2, target: 2000000 },
  { source: 'Services', current: 680000, previous: 590000, growth: 15.3, target: 750000 },
]

export default function RevenueTrackingClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="h-8 w-8" />Revenue Tracking</h1>
      <CollapsibleInsightsPanel title="Revenue Overview" insights={[
        { icon: DollarSign, title: '$2.5M', description: 'Total revenue' },
        { icon: TrendingUp, title: '14.6%', description: 'Growth' },
        { icon: Target, title: '$2.8M', description: 'Target' },
        { icon: Target, title: '89%', description: 'To target' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {revenue.map((r, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{r.source}</h4>
                <Badge className="bg-green-100 text-green-700">+{r.growth}%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Current</p><p className="font-bold text-green-600">${(r.current / 1000000).toFixed(2)}M</p></div>
                <div><p className="text-muted-foreground">Previous</p><p className="font-medium">${(r.previous / 1000000).toFixed(2)}M</p></div>
                <div><p className="text-muted-foreground">Target</p><p className="font-medium">${(r.target / 1000000).toFixed(2)}M</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
