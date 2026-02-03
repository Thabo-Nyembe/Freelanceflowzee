'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const logs = [
  { timestamp: '2024-02-03 14:32:15', user: 'john.doe@company.com', action: 'Login', ip: '192.168.1.45', status: 'success' },
  { timestamp: '2024-02-03 14:28:03', user: 'jane.smith@company.com', action: 'File Access', ip: '192.168.1.78', status: 'success' },
  { timestamp: '2024-02-03 14:15:22', user: 'unknown', action: 'Login Attempt', ip: '45.123.67.89', status: 'failed' },
]

export default function AccessLogsClient() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-8 w-8" />Access Logs</h1>
      <CollapsibleInsightsPanel title="Logs Overview" insights={[
        { icon: Shield, title: '1,245', description: 'Total events' },
        { icon: CheckCircle, title: '1,198', description: 'Successful' },
        { icon: AlertTriangle, title: '47', description: 'Failed attempts' },
        { icon: Clock, title: '24h', description: 'Time range' },
      ]} defaultExpanded={true} />
      <div className="space-y-3">
        {logs.map((log, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-3">
                <div>
                  <h4 className="font-semibold">{log.action}</h4>
                  <p className="text-sm text-muted-foreground">{log.timestamp}</p>
                </div>
                <Badge className={log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {log.status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><p className="text-muted-foreground">User</p><p className="font-medium">{log.user}</p></div>
                <div><p className="text-muted-foreground">IP Address</p><p className="font-medium">{log.ip}</p></div>
                <div><p className="text-muted-foreground">Action</p><p className="font-medium">{log.action}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
