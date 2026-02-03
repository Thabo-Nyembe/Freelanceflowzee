'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { ClipboardCheck, Plus, Search, Calendar, CheckCircle, AlertTriangle, Clock, TrendingUp, FileText } from 'lucide-react'

const audits = [
  { id: 'AUD-001', title: 'Annual Financial Audit', type: 'Financial', status: 'in-progress', auditor: 'KPMG', startDate: '2024-01-15', endDate: '2024-03-15', progress: 65, findings: 3, severity: 'medium' },
  { id: 'AUD-002', title: 'ISO 27001 Compliance', type: 'Security', status: 'scheduled', auditor: 'BSI Group', startDate: '2024-03-01', endDate: '2024-04-30', progress: 0, findings: 0, severity: 'none' },
  { id: 'AUD-003', title: 'GDPR Compliance Review', type: 'Privacy', status: 'completed', auditor: 'Deloitte', startDate: '2023-11-01', endDate: '2024-01-31', progress: 100, findings: 8, severity: 'low' },
  { id: 'AUD-004', title: 'SOC 2 Type II', type: 'Security', status: 'in-progress', auditor: 'EY', startDate: '2024-02-01', endDate: '2024-05-31', progress: 40, findings: 5, severity: 'medium' },
  { id: 'AUD-005', title: 'Internal Controls Audit', type: 'Operations', status: 'completed', auditor: 'Internal Team', startDate: '2023-12-01', endDate: '2024-01-15', progress: 100, findings: 12, severity: 'high' },
]

const auditTypes = [
  { name: 'Financial', count: 8, color: 'bg-blue-100 text-blue-700' },
  { name: 'Security', count: 12, color: 'bg-red-100 text-red-700' },
  { name: 'Privacy', count: 6, color: 'bg-purple-100 text-purple-700' },
  { name: 'Operations', count: 10, color: 'bg-green-100 text-green-700' },
  { name: 'Compliance', count: 9, color: 'bg-orange-100 text-orange-700' },
]

const findings = [
  { audit: 'AUD-005', finding: 'Inadequate access controls', severity: 'high', status: 'open', assigned: 'IT Security' },
  { audit: 'AUD-001', finding: 'Missing documentation', severity: 'medium', status: 'in-progress', assigned: 'Finance' },
  { audit: 'AUD-003', finding: 'Data retention policy gaps', severity: 'low', status: 'resolved', assigned: 'Legal' },
]

const upcomingAudits = [
  { title: 'PCI DSS Compliance', auditor: 'QSA Firm', date: '2024-04-01', type: 'Security' },
  { title: 'HR Practices Audit', auditor: 'Internal Team', date: '2024-04-15', type: 'HR' },
  { title: 'Environmental Compliance', auditor: 'EPA Certified', date: '2024-05-01', type: 'Environmental' },
]

export default function AuditsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const stats = useMemo(() => ({
    total: audits.length,
    inProgress: audits.filter(a => a.status === 'in-progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    scheduled: audits.filter(a => a.status === 'scheduled').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      scheduled: 'bg-yellow-100 text-yellow-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-yellow-100 text-yellow-700',
      none: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[severity]}>{severity}</Badge>
  }

  const filteredAudits = useMemo(() => {
    return audits.filter(a => 
      (typeFilter === 'all' || a.type === typeFilter) &&
      (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       a.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, typeFilter])

  const insights = [
    { icon: ClipboardCheck, title: `${stats.total}`, description: 'Total audits' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.completed}`, description: 'Completed' },
    { icon: Calendar, title: `${stats.scheduled}`, description: 'Scheduled' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ClipboardCheck className="h-8 w-8 text-primary" />Audit Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage organizational audits</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Schedule Audit</Button>
      </div>

      <CollapsibleInsightsPanel title="Audit Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {auditTypes.map((type) => (
          <Card key={type.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Badge className={type.color}>{type.name}</Badge>
              <p className="text-2xl font-bold mt-2">{type.count}</p>
              <p className="text-xs text-muted-foreground">Audits</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audits">
        <TabsList>
          <TabsTrigger value="audits">Active Audits</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search audits..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {auditTypes.map(type => <option key={type.name} value={type.name}>{type.name}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {filteredAudits.map((audit) => (
              <Card key={audit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{audit.id}</Badge>
                        <h4 className="font-semibold">{audit.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{audit.type}</span>
                        <span>•</span>
                        <span>Auditor: {audit.auditor}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(audit.status)}
                      {audit.findings > 0 && getSeverityBadge(audit.severity)}
                    </div>
                  </div>

                  {audit.status === 'in-progress' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{audit.startDate} - {audit.endDate}</span>
                      </div>
                    </div>
                    {audit.findings > 0 && (
                      <span className="text-muted-foreground">{audit.findings} findings</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="findings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {findings.map((finding, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-1">{finding.audit}</Badge>
                        <h4 className="font-semibold">{finding.finding}</h4>
                      </div>
                      <div className="flex gap-2">
                        {getSeverityBadge(finding.severity)}
                        {getStatusBadge(finding.status as any)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Assigned to: {finding.assigned}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAudits.map((audit, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{audit.title}</h4>
                        <p className="text-sm text-muted-foreground">Auditor: {audit.auditor}</p>
                      </div>
                      <Badge>{audit.type}</Badge>
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
      </Tabs>
    </div>
  )
}
