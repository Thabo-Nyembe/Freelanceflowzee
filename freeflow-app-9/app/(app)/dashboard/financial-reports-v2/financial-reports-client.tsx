'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { FileText, TrendingUp, DollarSign } from 'lucide-react'

const reports = [
  { type: 'Income Statement', period: 'Q4 2023', revenue: 2500000, expenses: 1850000, profit: 650000 },
  { type: 'Balance Sheet', period: 'Dec 2023', assets: 5200000, liabilities: 2100000, equity: 3100000 },
]

export default function FinancialReportsClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />Financial Reports</h1>
      <CollapsibleInsightsPanel title="Reports Overview" insights={[
        { icon: DollarSign, title: '$2.5M', description: 'Revenue' },
        { icon: TrendingUp, title: '$650k', description: 'Net profit' },
        { icon: FileText, title: '12', description: 'Reports' },
        { icon: TrendingUp, title: '26%', description: 'Profit margin' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {reports.map((r, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{r.type}</h4>
                <Badge>{r.period}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {r.revenue && (
                  <>
                    <div><p className="text-muted-foreground">Revenue</p><p className="font-bold text-green-600">${(r.revenue / 1000000).toFixed(2)}M</p></div>
                    <div><p className="text-muted-foreground">Expenses</p><p className="font-bold text-red-600">${(r.expenses / 1000000).toFixed(2)}M</p></div>
                    <div><p className="text-muted-foreground">Profit</p><p className="font-bold">${(r.profit / 1000).toFixed(0)}k</p></div>
                  </>
                )}
                {r.assets && (
                  <>
                    <div><p className="text-muted-foreground">Assets</p><p className="font-bold">${(r.assets / 1000000).toFixed(2)}M</p></div>
                    <div><p className="text-muted-foreground">Liabilities</p><p className="font-bold">${(r.liabilities / 1000000).toFixed(2)}M</p></div>
                    <div><p className="text-muted-foreground">Equity</p><p className="font-bold">${(r.equity / 1000000).toFixed(2)}M</p></div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
