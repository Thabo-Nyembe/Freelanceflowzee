'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Target, Plus, DollarSign, TrendingUp, Calendar, CheckCircle } from 'lucide-react'

const opportunities = [
  { id: 'OPP-001', name: 'Enterprise Deal - Acme Corp', stage: 'Proposal', value: 250000, probability: 75, closeDate: '2024-03-15', owner: 'Sarah M.' },
  { id: 'OPP-002', name: 'SMB Expansion - TechStart', stage: 'Negotiation', value: 85000, probability: 90, closeDate: '2024-02-28', owner: 'Mike C.' },
  { id: 'OPP-003', name: 'Upsell - Global Solutions', stage: 'Qualification', value: 120000, probability: 50, closeDate: '2024-04-01', owner: 'Emma W.' },
]

const stages = [
  { name: 'Qualification', count: 12, value: 450000, color: 'bg-blue-100 text-blue-700' },
  { name: 'Proposal', count: 8, value: 680000, color: 'bg-purple-100 text-purple-700' },
  { name: 'Negotiation', count: 5, value: 920000, color: 'bg-orange-100 text-orange-700' },
  { name: 'Closed Won', count: 15, value: 1250000, color: 'bg-green-100 text-green-700' },
]

export default function OpportunitiesClient() {
  const stats = useMemo(() => ({
    total: opportunities.length,
    totalValue: opportunities.reduce((sum, o) => sum + o.value, 0),
    avgProbability: Math.round(opportunities.reduce((sum, o) => sum + o.probability, 0) / opportunities.length),
    weighted: opportunities.reduce((sum, o) => sum + (o.value * o.probability / 100), 0),
  }), [])

  const getStageBadge = (stage: string) => {
    const styles: Record<string, string> = {
      'Qualification': 'bg-blue-100 text-blue-700',
      'Proposal': 'bg-purple-100 text-purple-700',
      'Negotiation': 'bg-orange-100 text-orange-700',
      'Closed Won': 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[stage]}>{stage}</Badge>
  }

  const insights = [
    { icon: Target, title: `${stats.total}`, description: 'Active opportunities' },
    { icon: DollarSign, title: `$${(stats.totalValue / 1000000).toFixed(1)}M`, description: 'Pipeline value' },
    { icon: TrendingUp, title: `${stats.avgProbability}%`, description: 'Avg probability' },
    { icon: CheckCircle, title: `$${(stats.weighted / 1000).toFixed(0)}k`, description: 'Weighted pipeline' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8 text-primary" />Opportunities</h1>
          <p className="text-muted-foreground mt-1">Manage sales opportunities and deals</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Opportunity</Button>
      </div>

      <CollapsibleInsightsPanel title="Opportunities Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <Card key={stage.name}>
            <CardContent className="p-4 text-center">
              <Badge className={stage.color}>{stage.name}</Badge>
              <p className="text-2xl font-bold mt-2">{stage.count}</p>
              <p className="text-xs text-muted-foreground">${(stage.value / 1000).toFixed(0)}k value</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {opportunities.map((opp) => (
          <Card key={opp.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{opp.id}</Badge>
                    <h4 className="font-semibold">{opp.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Owner: {opp.owner}</p>
                </div>
                {getStageBadge(opp.stage)}
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Probability</span>
                  <span className="font-medium">{opp.probability}%</span>
                </div>
                <Progress value={opp.probability} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-bold text-green-600">${opp.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weighted</p>
                  <p className="font-bold">${((opp.value * opp.probability) / 100).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Close Date</p>
                  <p className="font-medium">{opp.closeDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
