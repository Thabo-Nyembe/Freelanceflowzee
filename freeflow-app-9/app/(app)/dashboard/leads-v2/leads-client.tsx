'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserPlus, Plus, Search, TrendingUp, DollarSign, CheckCircle, Clock } from 'lucide-react'

const leads = [
  { id: 'L-001', name: 'Acme Corp', contact: 'John Smith', email: 'john@acme.com', phone: '+1-555-0123', source: 'Website', status: 'new', value: 50000, score: 85 },
  { id: 'L-002', name: 'TechStart Inc', contact: 'Sarah Johnson', email: 'sarah@techstart.com', phone: '+1-555-0124', source: 'Referral', status: 'qualified', value: 75000, score: 92 },
  { id: 'L-003', name: 'Global Solutions', contact: 'Mike Chen', email: 'mike@global.com', phone: '+1-555-0125', source: 'Cold Call', status: 'contacted', value: 35000, score: 68 },
]

const sources = [
  { name: 'Website', count: 145, conversion: 24, color: 'bg-blue-100 text-blue-700' },
  { name: 'Referral', count: 89, conversion: 45, color: 'bg-green-100 text-green-700' },
  { name: 'Cold Call', count: 67, conversion: 15, color: 'bg-purple-100 text-purple-700' },
  { name: 'Social Media', count: 102, conversion: 32, color: 'bg-pink-100 text-pink-700' },
]

export default function LeadsClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    total: leads.length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    totalValue: leads.reduce((sum, l) => sum + l.value, 0),
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-green-100 text-green-700',
      unqualified: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: UserPlus, title: `${stats.total}`, description: 'Total leads' },
    { icon: CheckCircle, title: `${stats.qualified}`, description: 'Qualified' },
    { icon: DollarSign, title: `$${(stats.totalValue / 1000).toFixed(0)}k`, description: 'Pipeline value' },
    { icon: TrendingUp, title: `${stats.avgScore}`, description: 'Avg score' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UserPlus className="h-8 w-8 text-primary" />Leads Management</h1>
          <p className="text-muted-foreground mt-1">Track and qualify sales leads</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Lead</Button>
      </div>

      <CollapsibleInsightsPanel title="Leads Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {sources.map((source) => (
          <Card key={source.name}>
            <CardContent className="p-4 text-center">
              <Badge className={source.color}>{source.name}</Badge>
              <p className="text-2xl font-bold mt-2">{source.count}</p>
              <p className="text-xs text-muted-foreground">{source.conversion}% conversion</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search leads..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="space-y-3">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{lead.id}</Badge>
                    <h4 className="font-semibold">{lead.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{lead.contact} • {lead.email}</p>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(lead.status)}
                  <Badge className="bg-purple-100 text-purple-700">Score: {lead.score}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium">{lead.source}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-medium text-green-600">${lead.value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
