'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Receipt, DollarSign, Calendar, AlertTriangle } from 'lucide-react'

const taxes = [
  { type: 'Corporate Tax', quarter: 'Q4 2023', owed: 125000, paid: 125000, status: 'paid', dueDate: '2024-01-15' },
  { type: 'Sales Tax', quarter: 'Q4 2023', owed: 45000, paid: 0, status: 'pending', dueDate: '2024-02-15' },
]

export default function TaxesClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Receipt className="h-8 w-8" />Tax Management</h1>
      <CollapsibleInsightsPanel title="Tax Overview" insights={[
        { icon: DollarSign, title: '$450k', description: 'Annual taxes' },
        { icon: Receipt, title: '$125k', description: 'Paid this quarter' },
        { icon: Calendar, title: '2', description: 'Upcoming' },
        { icon: AlertTriangle, title: '1', description: 'Overdue' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {taxes.map((t, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{t.type}</h4>
                  <p className="text-sm text-muted-foreground">{t.quarter}</p>
                </div>
                <Badge className={t.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {t.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Owed</p><p className="font-bold">${t.owed.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Paid</p><p className="font-bold text-green-600">${t.paid.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Due Date</p><p className="font-medium">{t.dueDate}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
