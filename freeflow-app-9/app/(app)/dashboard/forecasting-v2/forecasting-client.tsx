'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { TrendingUp, DollarSign, Target, Calendar, CheckCircle } from 'lucide-react'

const forecasts = [
  { quarter: 'Q1 2024', target: 2500000, committed: 1850000, pipeline: 3200000, actual: 1250000, daysLeft: 45 },
  { quarter: 'Q2 2024', target: 2800000, committed: 950000, pipeline: 2100000, actual: 0, daysLeft: 135 },
]

const reps = [
  { name: 'Sarah Johnson', quota: 500000, committed: 380000, pipeline: 620000, attainment: 76 },
  { name: 'Mike Chen', quota: 450000, committed: 310000, pipeline: 485000, attainment: 69 },
  { name: 'Emma Wilson', quota: 400000, committed: 295000, pipeline: 520000, attainment: 74 },
]

export default function ForecastingClient() {
  const stats = useMemo(() => ({
    q1Target: forecasts[0].target,
    q1Committed: forecasts[0].committed,
    attainment: Math.round((forecasts[0].committed / forecasts[0].target) * 100),
    daysLeft: forecasts[0].daysLeft,
  }), [])

  const insights = [
    { icon: Target, title: `$${(stats.q1Target / 1000000).toFixed(1)}M`, description: 'Q1 target' },
    { icon: DollarSign, title: `$${(stats.q1Committed / 1000000).toFixed(2)}M`, description: 'Committed' },
    { icon: TrendingUp, title: `${stats.attainment}%`, description: 'To target' },
    { icon: Calendar, title: `${stats.daysLeft}`, description: 'Days left' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><TrendingUp className="h-8 w-8 text-primary" />Sales Forecasting</h1>
          <p className="text-muted-foreground mt-1">Track and predict sales performance</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Forecast Overview" insights={insights} defaultExpanded={true} />

      <div className="space-y-3">
        {forecasts.map((f, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold text-lg">{f.quarter}</h4>
                <Badge>Target: ${(f.target / 1000000).toFixed(1)}M</Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress to Target</span>
                  <span className="font-medium">{Math.round((f.committed / f.target) * 100)}%</span>
                </div>
                <Progress value={(f.committed / f.target) * 100} className="h-2" />
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Committed</p>
                  <p className="font-bold text-green-600">${(f.committed / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pipeline</p>
                  <p className="font-bold">${(f.pipeline / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Actual</p>
                  <p className="font-bold text-blue-600">${(f.actual / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days Left</p>
                  <p className="font-bold">{f.daysLeft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Rep Performance</h3>
          <div className="space-y-3">
            {reps.map((rep, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <h4 className="font-semibold">{rep.name}</h4>
                  <Badge className={rep.attainment >= 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {rep.attainment}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quota</p>
                    <p className="font-medium">${(rep.quota / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Committed</p>
                    <p className="font-medium text-green-600">${(rep.committed / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pipeline</p>
                    <p className="font-medium">${(rep.pipeline / 1000).toFixed(0)}k</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
