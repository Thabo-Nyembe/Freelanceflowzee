'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { TestTube, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const testSuites = [
  { name: 'Unit Tests', total: 450, passed: 438, failed: 12, coverage: 87, automated: true },
  { name: 'Integration Tests', total: 125, passed: 118, failed: 7, coverage: 72, automated: true },
  { name: 'E2E Tests', total: 48, passed: 42, failed: 6, coverage: 65, automated: false },
]

export default function TestingClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><TestTube className="h-8 w-8" />Testing Dashboard</h1>
      <CollapsibleInsightsPanel title="Testing Overview" insights={[
        { icon: TestTube, title: '623', description: 'Total tests' },
        { icon: CheckCircle, title: '598', description: 'Passed' },
        { icon: XCircle, title: '25', description: 'Failed' },
        { icon: TrendingUp, title: '78%', description: 'Coverage' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {testSuites.map((suite, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <h4 className="font-semibold">{suite.name}</h4>
                <div className="flex gap-2">
                  <Badge className={suite.automated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {suite.automated ? 'Automated' : 'Manual'}
                  </Badge>
                  <Badge>{suite.coverage}% coverage</Badge>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Passed: {suite.passed}</span>
                  <span>Failed: {suite.failed}</span>
                </div>
                <Progress value={(suite.passed / suite.total) * 100} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Total</p><p className="font-bold">{suite.total}</p></div>
                <div><p className="text-muted-foreground">Passed</p><p className="font-bold text-green-600">{suite.passed}</p></div>
                <div><p className="text-muted-foreground">Failed</p><p className="font-bold text-red-600">{suite.failed}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
