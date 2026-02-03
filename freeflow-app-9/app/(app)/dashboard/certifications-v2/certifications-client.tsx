'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Award, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const certifications = [
  { name: 'AWS Solutions Architect', employee: 'John Doe', issueDate: '2023-06-15', expiryDate: '2026-06-15', status: 'active' },
  { name: 'PMP Certification', employee: 'Sarah Kim', issueDate: '2023-01-10', expiryDate: '2024-03-10', status: 'expiring-soon' },
  { name: 'Scrum Master', employee: 'Mike Roberts', issueDate: '2022-09-20', expiryDate: '2024-09-20', status: 'active' },
]

export default function CertificationsClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Award className="h-8 w-8" />Certifications</h1>
      <CollapsibleInsightsPanel title="Certifications Overview" insights={[
        { icon: Award, title: '45', description: 'Total certs' },
        { icon: CheckCircle, title: '38', description: 'Active' },
        { icon: Clock, title: '5', description: 'Expiring soon' },
        { icon: AlertTriangle, title: '2', description: 'Expired' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {certifications.map((cert, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.employee}</p>
                </div>
                <Badge className={
                  cert.status === 'active' ? 'bg-green-100 text-green-700' :
                  cert.status === 'expiring-soon' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }>{cert.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">Issue Date</p><p className="font-medium">{cert.issueDate}</p></div>
                <div><p className="text-muted-foreground">Expiry Date</p><p className="font-medium">{cert.expiryDate}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{cert.status.replace('-', ' ')}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
