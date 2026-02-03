'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Kanban, Plus, DollarSign, TrendingUp, Target, Filter, MoreHorizontal, GripVertical } from 'lucide-react'

const pipelineStages = [
  { id: 'lead', name: 'New Leads', color: 'bg-gray-500', deals: [
    { id: 1, name: 'Website Redesign', company: 'TechStart', value: 15000, owner: 'Sarah' },
    { id: 2, name: 'Mobile App', company: 'AppCo', value: 45000, owner: 'Mike' },
  ]},
  { id: 'qualified', name: 'Qualified', color: 'bg-blue-500', deals: [
    { id: 3, name: 'ERP Integration', company: 'BigCorp', value: 80000, owner: 'Emily' },
  ]},
  { id: 'proposal', name: 'Proposal Sent', color: 'bg-yellow-500', deals: [
    { id: 4, name: 'Cloud Migration', company: 'DataFlow', value: 120000, owner: 'Tom' },
    { id: 5, name: 'Security Audit', company: 'SecureNet', value: 25000, owner: 'Sarah' },
  ]},
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-500', deals: [
    { id: 6, name: 'Annual Contract', company: 'EnterpriseCo', value: 200000, owner: 'Mike' },
  ]},
  { id: 'closed', name: 'Closed Won', color: 'bg-green-500', deals: [
    { id: 7, name: 'Support Package', company: 'ClientFirst', value: 35000, owner: 'Emily' },
  ]},
]

export default function PipelineClient() {
  const stats = useMemo(() => ({
    totalValue: pipelineStages.flatMap(s => s.deals).reduce((sum, d) => sum + d.value, 0),
    totalDeals: pipelineStages.flatMap(s => s.deals).length,
    avgDealSize: Math.round(pipelineStages.flatMap(s => s.deals).reduce((sum, d) => sum + d.value, 0) / pipelineStages.flatMap(s => s.deals).length),
  }), [])

  const insights = [
    { icon: DollarSign, title: `$${(stats.totalValue / 1000).toFixed(0)}K`, description: 'Total pipeline' },
    { icon: Target, title: `${stats.totalDeals}`, description: 'Active deals' },
    { icon: TrendingUp, title: `$${(stats.avgDealSize / 1000).toFixed(0)}K`, description: 'Avg deal size' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Kanban className="h-8 w-8 text-primary" />
            Sales Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">Visualize and manage your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          <Button><Plus className="h-4 w-4 mr-2" />Add Deal</Button>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Pipeline Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-72">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-sm">{stage.name}</CardTitle>
                    <Badge variant="secondary">{stage.deals.length}</Badge>
                  </div>
                  <span className="text-sm font-bold">${(stage.deals.reduce((sum, d) => sum + d.value, 0) / 1000).toFixed(0)}K</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {stage.deals.map((deal) => (
                  <Card key={deal.id} className="cursor-grab hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{deal.name}</h4>
                          <p className="text-xs text-muted-foreground">{deal.company}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-green-600">${(deal.value / 1000).toFixed(0)}K</span>
                            <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{deal.owner.charAt(0)}</AvatarFallback></Avatar>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="ghost" className="w-full border-2 border-dashed">
                  <Plus className="h-4 w-4 mr-2" />Add Deal
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
