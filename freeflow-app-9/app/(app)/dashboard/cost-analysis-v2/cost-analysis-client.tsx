'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { PieChart, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react'

const costs = [
  { category: 'Salaries', amount: 850000, percent: 45, trend: -2 },
  { category: 'Operations', amount: 420000, percent: 22, trend: 5 },
  { category: 'Marketing', amount: 280000, percent: 15, trend: -3 },
]

export default function CostAnalysisClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><PieChart className="h-8 w-8" />Cost Analysis</h1>
      <CollapsibleInsightsPanel title="Cost Overview" insights={[
        { icon: DollarSign, title: '$1.9M', description: 'Total costs' },
        { icon: TrendingDown, title: '45%', description: 'Salaries' },
        { icon: PieChart, title: '22%', description: 'Operations' },
        { icon: AlertTriangle, title: '3', description: 'Over budget' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {costs.map((c, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{c.category}</h4>
                <div className="flex gap-2">
                  <Badge>{c.percent}%</Badge>
                  <Badge className={c.trend < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {c.trend > 0 ? '+' : ''}{c.trend}%
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Amount</p><p className="font-bold">${c.amount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Share</p><p className="font-medium">{c.percent}% of total</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
