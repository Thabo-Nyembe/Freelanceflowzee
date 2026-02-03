'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Rocket, Calendar, CheckCircle, Package } from 'lucide-react'

const releases = [
  { version: 'v2.5.0', date: '2024-03-15', features: 12, bugFixes: 8, status: 'released' },
  { version: 'v2.6.0', date: '2024-04-01', features: 15, bugFixes: 0, status: 'planned' },
  { version: 'v2.4.2', date: '2024-02-28', features: 3, bugFixes: 12, status: 'released' },
]

export default function ReleasesClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Rocket className="h-8 w-8" />Release Management</h1>
      <CollapsibleInsightsPanel title="Releases Overview" insights={[
        { icon: Rocket, title: '24', description: 'Total releases' },
        { icon: Calendar, title: '3', description: 'This quarter' },
        { icon: CheckCircle, title: '22', description: 'Deployed' },
        { icon: Package, title: '2', description: 'Planned' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {releases.map((r, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{r.version}</h4>
                  <p className="text-sm text-muted-foreground">{r.date}</p>
                </div>
                <Badge className={r.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                  {r.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Features</p><p className="font-bold text-blue-600">{r.features}</p></div>
                <div><p className="text-muted-foreground">Bug Fixes</p><p className="font-bold text-green-600">{r.bugFixes}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{r.status}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
