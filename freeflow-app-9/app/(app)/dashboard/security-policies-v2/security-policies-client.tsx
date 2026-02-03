'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { FileText, Shield, CheckCircle, Clock } from 'lucide-react'

const policies = [
  { name: 'Password Policy', category: 'Access Control', status: 'active', lastReview: '2024-01-15', compliance: 100 },
  { name: 'Data Encryption', category: 'Data Protection', status: 'active', lastReview: '2024-01-10', compliance: 100 },
  { name: 'Incident Response', category: 'Security Operations', status: 'under-review', lastReview: '2023-12-20', compliance: 85 },
]

export default function SecurityPoliciesClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8" />Security Policies</h1>
      <CollapsibleInsightsPanel title="Policies Overview" insights={[
        { icon: FileText, title: '24', description: 'Total policies' },
        { icon: Shield, title: '21', description: 'Active' },
        { icon: Clock, title: '3', description: 'Under review' },
        { icon: CheckCircle, title: '95%', description: 'Compliance' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {policies.map((policy, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{policy.name}</h4>
                  <p className="text-sm text-muted-foreground">{policy.category}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={policy.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {policy.status}
                  </Badge>
                  <Badge>{policy.compliance}%</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Last Review</p><p className="font-medium">{policy.lastReview}</p></div>
                <div><p className="text-muted-foreground">Category</p><p className="font-medium">{policy.category}</p></div>
                <div><p className="text-muted-foreground">Compliance</p><p className="font-bold text-green-600">{policy.compliance}%</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
