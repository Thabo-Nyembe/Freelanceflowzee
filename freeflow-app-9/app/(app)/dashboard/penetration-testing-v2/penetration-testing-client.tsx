'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Target, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const tests = [
  { name: 'Q1 2024 External Pentest', type: 'External', date: '2024-01-15', findings: 12, critical: 2, status: 'completed' },
  { name: 'API Security Assessment', type: 'API', date: '2024-02-01', findings: 8, critical: 1, status: 'in-progress' },
  { name: 'Web Application Test', type: 'Web', date: '2024-02-15', findings: 0, critical: 0, status: 'scheduled' },
]

export default function PenetrationTestingClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8" />Penetration Testing</h1>
      <CollapsibleInsightsPanel title="Testing Overview" insights={[
        { icon: Target, title: '18', description: 'Total tests' },
        { icon: AlertTriangle, title: '45', description: 'Findings' },
        { icon: Shield, title: '8', description: 'Critical fixed' },
        { icon: CheckCircle, title: '15', description: 'Completed' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {tests.map((test, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.date}</p>
                </div>
                <div className="flex gap-2">
                  <Badge>{test.type}</Badge>
                  <Badge className={
                    test.status === 'completed' ? 'bg-green-100 text-green-700' :
                    test.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>{test.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Findings</p><p className="font-bold">{test.findings}</p></div>
                <div><p className="text-muted-foreground">Critical</p><p className="font-bold text-red-600">{test.critical}</p></div>
                <div><p className="text-muted-foreground">Type</p><p className="font-medium">{test.type}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
