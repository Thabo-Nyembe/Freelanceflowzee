'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Wallet, Plus, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

const budgets = [
  { dept: 'Sales', allocated: 500000, spent: 385000, remaining: 115000, utilization: 77 },
  { dept: 'Marketing', allocated: 350000, spent: 298000, remaining: 52000, utilization: 85 },
  { dept: 'Engineering', allocated: 650000, spent: 520000, remaining: 130000, utilization: 80 },
]

export default function BudgetsClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Wallet className="h-8 w-8" />Budget Management</h1>
          <p className="text-muted-foreground mt-1">Track department budgets and spending</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Budget</Button>
      </div>

      <CollapsibleInsightsPanel title="Budget Overview" insights={[
        { icon: Wallet, title: '$3.2M', description: 'Total budget' },
        { icon: DollarSign, title: '$2.1M', description: 'Spent' },
        { icon: TrendingUp, title: '66%', description: 'Utilization' },
        { icon: AlertTriangle, title: '3', description: 'Over budget' },
      ]} defaultExpanded={true} />

      <div className="space-y-3">
        {budgets.map((b, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{b.dept}</h4>
                <Badge className={b.utilization > 90 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                  {b.utilization}%
                </Badge>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Spent: ${b.spent.toLocaleString()}</span>
                  <span>Remaining: ${b.remaining.toLocaleString()}</span>
                </div>
                <Progress value={b.utilization} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Allocated</p>
                  <p className="font-bold">${b.allocated.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Spent</p>
                  <p className="font-bold text-red-600">${b.spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-bold text-green-600">${b.remaining.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
