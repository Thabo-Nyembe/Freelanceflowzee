'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Handshake, DollarSign, TrendingUp, Search, Plus, Filter,
  MoreHorizontal, Calendar, Users, Target, ArrowRight,
  Clock, CheckCircle, XCircle, Building2, Phone
} from 'lucide-react'

const deals = [
  { id: 1, name: 'Enterprise Software License', company: 'TechCorp Inc', value: 125000, stage: 'negotiation', probability: 75, owner: 'Sarah Chen', closeDate: '2024-02-15' },
  { id: 2, name: 'Annual Support Contract', company: 'Global Systems', value: 48000, stage: 'proposal', probability: 60, owner: 'Mike Johnson', closeDate: '2024-02-28' },
  { id: 3, name: 'Custom Development Project', company: 'StartupXYZ', value: 85000, stage: 'discovery', probability: 30, owner: 'Emily Davis', closeDate: '2024-03-15' },
  { id: 4, name: 'Platform Migration', company: 'FinanceHub', value: 200000, stage: 'closed-won', probability: 100, owner: 'Tom Wilson', closeDate: '2024-01-10' },
  { id: 5, name: 'Training Package', company: 'EduTech', value: 15000, stage: 'qualified', probability: 45, owner: 'Sarah Chen', closeDate: '2024-02-20' },
  { id: 6, name: 'API Integration', company: 'DataFlow', value: 35000, stage: 'closed-lost', probability: 0, owner: 'Mike Johnson', closeDate: '2024-01-05' },
]

const stages = ['discovery', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']

export default function DealsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStage, setSelectedStage] = useState('all')

  const stats = useMemo(() => ({
    totalValue: deals.filter(d => !d.stage.includes('closed')).reduce((sum, d) => sum + d.value, 0),
    closedWon: deals.filter(d => d.stage === 'closed-won').reduce((sum, d) => sum + d.value, 0),
    activeDeals: deals.filter(d => !d.stage.includes('closed')).length,
    winRate: Math.round((deals.filter(d => d.stage === 'closed-won').length / deals.filter(d => d.stage.includes('closed')).length) * 100),
  }), [])

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      discovery: 'bg-gray-100 text-gray-700',
      qualified: 'bg-blue-100 text-blue-700',
      proposal: 'bg-yellow-100 text-yellow-700',
      negotiation: 'bg-purple-100 text-purple-700',
      'closed-won': 'bg-green-100 text-green-700',
      'closed-lost': 'bg-red-100 text-red-700',
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
  }

  const insights = [
    { icon: DollarSign, title: `$${(stats.totalValue / 1000).toFixed(0)}K`, description: 'Pipeline value' },
    { icon: Target, title: `${stats.activeDeals}`, description: 'Active deals' },
    { icon: TrendingUp, title: `${stats.winRate}%`, description: 'Win rate' },
  ]

  const filteredDeals = useMemo(() => deals.filter(d =>
    (selectedStage === 'all' || d.stage === selectedStage) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.company.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, selectedStage])

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Handshake className="h-8 w-8 text-primary" />
            Deals
          </h1>
          <p className="text-muted-foreground mt-1">Manage your sales pipeline and opportunities</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Deal</Button>
      </div>

      <CollapsibleInsightsPanel title="Deal Insights" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Value', value: `$${(stats.totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'blue' },
          { label: 'Won This Month', value: `$${(stats.closedWon / 1000).toFixed(0)}K`, icon: CheckCircle, color: 'green' },
          { label: 'Active Deals', value: stats.activeDeals, icon: Target, color: 'purple' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: TrendingUp, color: 'orange' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search deals..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
          <option value="all">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{deal.name}</h4>
                    <p className="text-sm text-muted-foreground">{deal.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold">${deal.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{deal.probability}% probability</p>
                  </div>
                  <Badge className={getStageColor(deal.stage)}>{deal.stage.replace('-', ' ')}</Badge>
                  <div className="text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {deal.closeDate}
                  </div>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
