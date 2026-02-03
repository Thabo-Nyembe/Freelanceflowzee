'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { MapPin, Users, DollarSign, TrendingUp } from 'lucide-react'

const territories = [
  { name: 'North America East', rep: 'Sarah Johnson', accounts: 45, revenue: 1250000, quota: 1500000, attainment: 83 },
  { name: 'North America West', rep: 'Mike Chen', accounts: 38, revenue: 980000, quota: 1200000, attainment: 82 },
  { name: 'EMEA', rep: 'Emma Wilson', accounts: 52, revenue: 1450000, quota: 1800000, attainment: 81 },
  { name: 'APAC', rep: 'Alex Johnson', accounts: 28, revenue: 650000, quota: 900000, attainment: 72 },
]

export default function TerritoriesClient() {
  const stats = useMemo(() => ({
    totalTerritories: territories.length,
    totalReps: territories.length,
    totalRevenue: territories.reduce((sum, t) => sum + t.revenue, 0),
    avgAttainment: Math.round(territories.reduce((sum, t) => sum + t.attainment, 0) / territories.length),
  }), [])

  const insights = [
    { icon: MapPin, title: `${stats.totalTerritories}`, description: 'Territories' },
    { icon: Users, title: `${stats.totalReps}`, description: 'Sales reps' },
    { icon: DollarSign, title: `$${(stats.totalRevenue / 1000000).toFixed(1)}M`, description: 'Total revenue' },
    { icon: TrendingUp, title: `${stats.avgAttainment}%`, description: 'Avg attainment' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MapPin className="h-8 w-8 text-primary" />Sales Territories</h1>
          <p className="text-muted-foreground mt-1">Manage sales territories and coverage</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Territory Overview" insights={insights} defaultExpanded={true} />

      <div className="space-y-3">
        {territories.map((terr, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{terr.name}</h4>
                  <p className="text-sm text-muted-foreground">{terr.rep}</p>
                </div>
                <Badge className={terr.attainment >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {terr.attainment}% Attainment
                </Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Quota Achievement</span>
                  <span className="font-medium">${terr.revenue.toLocaleString()} / ${terr.quota.toLocaleString()}</span>
                </div>
                <Progress value={terr.attainment} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Accounts</p>
                  <p className="font-bold">{terr.accounts}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue</p>
                  <p className="font-bold text-green-600">${(terr.revenue / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quota</p>
                  <p className="font-bold">${(terr.quota / 1000000).toFixed(2)}M</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
