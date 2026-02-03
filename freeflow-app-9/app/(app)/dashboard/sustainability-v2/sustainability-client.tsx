'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Leaf, TrendingDown, TrendingUp, Recycle, Droplets, Zap, ArrowDown, ArrowUp } from 'lucide-react'

const metrics = {
  carbonFootprint: { current: 245, previous: 280, unit: 'tons CO2', target: 200 },
  energyUsage: { current: 45000, previous: 48000, unit: 'kWh', target: 40000 },
  waterUsage: { current: 12000, previous: 13500, unit: 'gallons', target: 10000 },
  wasteRecycled: { current: 75, previous: 68, unit: '%', target: 85 },
}

const initiatives = [
  { id: 1, name: 'Solar Panel Installation', status: 'in-progress', impact: 'High', category: 'Energy', progress: 65, completion: '2024-04-15' },
  { id: 2, name: 'Zero Waste Program', status: 'active', impact: 'High', category: 'Waste', progress: 100, completion: '2024-01-10' },
  { id: 3, name: 'Electric Vehicle Fleet', status: 'planning', impact: 'Medium', category: 'Transportation', progress: 15, completion: '2024-08-01' },
  { id: 4, name: 'Water Conservation System', status: 'active', impact: 'Medium', category: 'Water', progress: 100, completion: '2023-12-20' },
]

const goals = [
  { id: 1, title: 'Carbon Neutral by 2025', progress: 62, status: 'on-track' },
  { id: 2, title: '100% Renewable Energy', progress: 45, status: 'on-track' },
  { id: 3, title: 'Zero Landfill Waste', progress: 75, status: 'ahead' },
  { id: 4, title: '50% Water Reduction', progress: 38, status: 'behind' },
]

export default function SustainabilityClient() {
  const getChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous * 100).toFixed(1)
    const isPositive = current > previous
    return { change: Math.abs(parseFloat(change)), isPositive }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      planning: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      'on-track': 'bg-green-100 text-green-700',
      ahead: 'bg-blue-100 text-blue-700',
      behind: 'bg-orange-100 text-orange-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getImpactBadge = (impact: string) => {
    const styles: Record<string, string> = {
      High: 'bg-red-100 text-red-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-green-100 text-green-700',
    }
    return <Badge variant="outline" className={styles[impact]}>{impact} Impact</Badge>
  }

  const insights = [
    { icon: Leaf, title: `${metrics.carbonFootprint.current}`, description: `tons CO2 (${getChange(metrics.carbonFootprint.current, metrics.carbonFootprint.previous).change}% ↓)` },
    { icon: Zap, title: `${(metrics.energyUsage.current / 1000).toFixed(0)}k`, description: `kWh (${getChange(metrics.energyUsage.current, metrics.energyUsage.previous).change}% ↓)` },
    { icon: Droplets, title: `${(metrics.waterUsage.current / 1000).toFixed(0)}k`, description: `gallons (${getChange(metrics.waterUsage.current, metrics.waterUsage.previous).change}% ↓)` },
    { icon: Recycle, title: `${metrics.wasteRecycled.current}%`, description: `waste recycled (${getChange(metrics.wasteRecycled.current, metrics.wasteRecycled.previous).change}% ↑)` },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Leaf className="h-8 w-8 text-primary" />Sustainability</h1>
          <p className="text-muted-foreground mt-1">Track environmental impact and initiatives</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Sustainability Metrics" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([key, metric]) => {
          const { change, isPositive } = getChange(metric.current, metric.previous)
          const isGoodChange = key === 'wasteRecycled' ? isPositive : !isPositive

          return (
            <Card key={key}>
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold">{metric.current.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-sm mb-3">
                  {isGoodChange ? (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  )}
                  <span className={isGoodChange ? 'text-green-600' : 'text-red-600'}>
                    {change}% {isPositive ? 'increase' : 'decrease'}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Target: {metric.target.toLocaleString()}</span>
                  </div>
                  <Progress value={metric.current/metric.target*100} className="h-1" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="initiatives">
        <TabsList>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="initiatives" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initiatives.map((initiative) => (
              <Card key={initiative.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{initiative.name}</h4>
                      <Badge variant="outline" className="mt-1">{initiative.category}</Badge>
                    </div>
                    {getStatusBadge(initiative.status)}
                  </div>

                  <div className="space-y-3">
                    {getImpactBadge(initiative.impact)}

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{initiative.progress}%</span>
                      </div>
                      <Progress value={initiative.progress} className="h-2" />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Target completion: {initiative.completion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <div className="space-y-3">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{goal.title}</h4>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
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
