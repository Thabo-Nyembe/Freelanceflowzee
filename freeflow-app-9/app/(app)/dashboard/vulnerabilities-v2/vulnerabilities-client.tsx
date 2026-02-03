'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react'

const vulnerabilities = [
  { title: 'SQL Injection in API', severity: 'critical', cvss: 9.8, status: 'open', detected: '2024-01-28' },
  { title: 'XSS in User Profile', severity: 'high', cvss: 7.5, status: 'in-progress', detected: '2024-01-25' },
  { title: 'Weak Password Policy', severity: 'medium', cvss: 5.3, status: 'resolved', detected: '2024-01-20' },
]

export default function VulnerabilitiesClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><AlertTriangle className="h-8 w-8" />Vulnerabilities</h1>
      <CollapsibleInsightsPanel title="Vulnerabilities Overview" insights={[
        { icon: AlertTriangle, title: '23', description: 'Total found' },
        { icon: XCircle, title: '8', description: 'Critical/High' },
        { icon: Shield, title: '7', description: 'In progress' },
        { icon: CheckCircle, title: '18', description: 'Resolved' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {vulnerabilities.map((vuln, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{vuln.title}</h4>
                  <p className="text-sm text-muted-foreground">Detected: {vuln.detected}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={
                    vuln.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    vuln.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>{vuln.severity}</Badge>
                  <Badge className={
                    vuln.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    vuln.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>{vuln.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">CVSS Score</p><p className="font-bold text-red-600">{vuln.cvss}</p></div>
                <div><p className="text-muted-foreground">Severity</p><p className="font-medium capitalize">{vuln.severity}</p></div>
                <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{vuln.status.replace('-', ' ')}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
