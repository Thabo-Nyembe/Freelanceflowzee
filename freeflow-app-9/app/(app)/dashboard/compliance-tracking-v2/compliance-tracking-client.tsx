'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Shield, CheckCircle, AlertTriangle, Clock, TrendingUp, Calendar, FileText } from 'lucide-react'

const regulations = [
  { id: 'REG-001', name: 'GDPR', fullName: 'General Data Protection Regulation', status: 'compliant', lastAudit: '2024-01-15', nextAudit: '2024-07-15', compliance: 98, requirements: 25, met: 24 },
  { id: 'REG-002', name: 'SOC 2', fullName: 'Service Organization Control 2', status: 'in-progress', lastAudit: '2023-12-01', nextAudit: '2024-06-01', compliance: 85, requirements: 30, met: 26 },
  { id: 'REG-003', name: 'HIPAA', fullName: 'Health Insurance Portability Act', status: 'compliant', lastAudit: '2024-02-01', nextAudit: '2024-08-01', compliance: 100, requirements: 18, met: 18 },
  { id: 'REG-004', name: 'PCI DSS', fullName: 'Payment Card Industry Data Security', status: 'at-risk', lastAudit: '2023-11-15', nextAudit: '2024-05-15', compliance: 72, requirements: 35, met: 25 },
  { id: 'REG-005', name: 'ISO 27001', fullName: 'Information Security Management', status: 'in-progress', lastAudit: '2024-01-20', nextAudit: '2024-07-20', compliance: 88, requirements: 40, met: 35 },
]

const complianceStats = [
  { name: 'Compliant', count: 8, color: 'bg-green-100 text-green-700' },
  { name: 'In Progress', count: 5, color: 'bg-blue-100 text-blue-700' },
  { name: 'At Risk', count: 3, color: 'bg-red-100 text-red-700' },
  { name: 'Pending', count: 2, color: 'bg-yellow-100 text-yellow-700' },
]

const upcomingAudits = [
  { regulation: 'PCI DSS', date: '2024-05-15', daysLeft: 100, auditor: 'External QSA' },
  { regulation: 'SOC 2', date: '2024-06-01', daysLeft: 117, auditor: 'Big 4 Firm' },
  { regulation: 'GDPR', date: '2024-07-15', daysLeft: 161, auditor: 'Internal Team' },
]

const actionItems = [
  { id: 1, regulation: 'PCI DSS', action: 'Update firewall configurations', priority: 'high', dueDate: '2024-03-01', assignedTo: 'IT Security', status: 'in-progress' },
  { id: 2, regulation: 'SOC 2', action: 'Complete access control review', priority: 'medium', dueDate: '2024-03-15', assignedTo: 'Compliance Team', status: 'pending' },
  { id: 3, regulation: 'ISO 27001', action: 'Document incident response procedures', priority: 'high', dueDate: '2024-02-28', assignedTo: 'Security Team', status: 'in-progress' },
]

export default function ComplianceTrackingClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    total: regulations.length,
    compliant: regulations.filter(r => r.status === 'compliant').length,
    inProgress: regulations.filter(r => r.status === 'in-progress').length,
    atRisk: regulations.filter(r => r.status === 'at-risk').length,
    avgCompliance: Math.round(regulations.reduce((sum, r) => sum + r.compliance, 0) / regulations.length),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      compliant: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'at-risk': 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[priority]}>{priority}</Badge>
  }

  const filteredRegulations = useMemo(() => {
    if (filter === 'all') return regulations
    return regulations.filter(r => r.status === filter)
  }, [filter])

  const insights = [
    { icon: Shield, title: `${stats.total}`, description: 'Regulations tracked' },
    { icon: CheckCircle, title: `${stats.compliant}`, description: 'Compliant' },
    { icon: AlertTriangle, title: `${stats.atRisk}`, description: 'At risk' },
    { icon: TrendingUp, title: `${stats.avgCompliance}%`, description: 'Avg compliance' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Shield className="h-8 w-8 text-primary" />Compliance Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor regulatory compliance and requirements</p>
        </div>
        <Button><FileText className="h-4 w-4 mr-2" />Generate Report</Button>
      </div>

      <CollapsibleInsightsPanel title="Compliance Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {complianceStats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Badge className={stat.color}>{stat.name}</Badge>
              <p className="text-3xl font-bold mt-2">{stat.count}</p>
              <p className="text-xs text-muted-foreground">Regulations</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="regulations">
        <TabsList>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="audits">Upcoming Audits</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'compliant' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('compliant')}>Compliant</Button>
            <Button variant={filter === 'in-progress' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('in-progress')}>In Progress</Button>
            <Button variant={filter === 'at-risk' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('at-risk')}>At Risk</Button>
          </div>

          <div className="space-y-3">
            {filteredRegulations.map((reg) => (
              <Card key={reg.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{reg.name}</h4>
                        {getStatusBadge(reg.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{reg.fullName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{reg.compliance}%</p>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Requirements Met</span>
                      <span className="font-medium">{reg.met}/{reg.requirements}</span>
                    </div>
                    <Progress value={reg.compliance} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Last Audit</p>
                      <p className="font-medium">{reg.lastAudit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Audit</p>
                      <p className="font-medium">{reg.nextAudit}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    <Button size="sm" variant="outline" className="flex-1">Update Status</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Compliance Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAudits.map((audit, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{audit.regulation}</h4>
                        <p className="text-sm text-muted-foreground">Auditor: {audit.auditor}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">{audit.daysLeft} days</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Scheduled: {audit.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.regulation}</Badge>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <h4 className="font-semibold">{item.action}</h4>
                      </div>
                      {getStatusBadge(item.status as any)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Assigned to: {item.assignedTo}</span>
                      <span>Due: {item.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
