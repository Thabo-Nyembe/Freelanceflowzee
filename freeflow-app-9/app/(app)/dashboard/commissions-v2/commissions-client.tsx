'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { DollarSign, Users, TrendingUp, CheckCircle } from 'lucide-react'

const commissions = [
  { rep: 'Sarah Johnson', sales: 1250000, commission: 87500, rate: 7, paid: true, period: 'Jan 2024' },
  { rep: 'Mike Chen', sales: 980000, commission: 68600, rate: 7, paid: false, period: 'Jan 2024' },
  { rep: 'Emma Wilson', sales: 1450000, commission: 101500, rate: 7, paid: true, period: 'Jan 2024' },
  { rep: 'Alex Johnson', sales: 650000, commission: 45500, rate: 7, paid: false, period: 'Jan 2024' },
]

export default function CommissionsClient() {
  const stats = useMemo(() => ({
    totalReps: commissions.length,
    totalCommissions: commissions.reduce((sum, c) => sum + c.commission, 0),
    totalSales: commissions.reduce((sum, c) => sum + c.sales, 0),
    paid: commissions.filter(c => c.paid).length,
  }), [])

  const insights = [
    { icon: Users, title: `${stats.totalReps}`, description: 'Sales reps' },
    { icon: DollarSign, title: `$${(stats.totalCommissions / 1000).toFixed(0)}k`, description: 'Total commissions' },
    { icon: TrendingUp, title: `$${(stats.totalSales / 1000000).toFixed(1)}M`, description: 'Total sales' },
    { icon: CheckCircle, title: `${stats.paid}`, description: 'Paid this month' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><DollarSign className="h-8 w-8 text-primary" />Sales Commissions</h1>
          <p className="text-muted-foreground mt-1">Track and manage sales commissions</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Commission Overview" insights={insights} defaultExpanded={true} />

      <div className="space-y-3">
        {commissions.map((comm, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{comm.rep}</h4>
                  <p className="text-sm text-muted-foreground">{comm.period}</p>
                </div>
                <Badge className={comm.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {comm.paid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Sales</p>
                  <p className="font-bold">${comm.sales.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-bold">{comm.rate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Commission</p>
                  <p className="font-bold text-green-600">${comm.commission.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
