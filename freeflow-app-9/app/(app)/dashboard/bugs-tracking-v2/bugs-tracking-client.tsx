'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Bug, Plus, Search, AlertCircle, CheckCircle2, XCircle, Clock, Users, Code } from 'lucide-react'

const bugs = [
  { id: 1, title: 'Login page redirect loop', severity: 'critical', status: 'open', priority: 'critical', assignedTo: 'Sarah Chen', reportedBy: 'Mike Johnson', createdDate: '2025-01-28', component: 'Authentication', browser: 'Chrome', reproducible: true, affectedUsers: 2847 },
  { id: 2, title: 'Data export timeout', severity: 'high', status: 'in-progress', priority: 'high', assignedTo: 'Tom Wilson', reportedBy: 'Lisa Anderson', createdDate: '2025-01-26', component: 'Data Export', browser: 'All', reproducible: true, affectedUsers: 156 },
  { id: 3, title: 'Mobile menu not closing', severity: 'medium', status: 'open', priority: 'medium', assignedTo: null, reportedBy: 'David Kim', createdDate: '2025-01-25', component: 'UI', browser: 'Safari iOS', reproducible: true, affectedUsers: 89 },
  { id: 4, title: 'Dashboard loading slowly', severity: 'medium', status: 'in-progress', priority: 'high', assignedTo: 'Emma Davis', reportedBy: 'John Smith', createdDate: '2025-01-24', component: 'Dashboard', browser: 'Firefox', reproducible: false, affectedUsers: 234 },
  { id: 5, title: 'Email notifications not sent', severity: 'high', status: 'open', priority: 'critical', assignedTo: 'Anna Lee', reportedBy: 'Sarah Chen', createdDate: '2025-01-27', component: 'Notifications', browser: 'N/A', reproducible: true, affectedUsers: 1203 },
  { id: 6, title: 'File upload fails > 10MB', severity: 'medium', status: 'resolved', priority: 'medium', assignedTo: 'Mike Johnson', reportedBy: 'Tom Wilson', createdDate: '2025-01-20', component: 'File Upload', browser: 'All', reproducible: true, affectedUsers: 67 },
  { id: 7, title: 'Calendar sync delay', severity: 'low', status: 'open', priority: 'low', assignedTo: null, reportedBy: 'Emma Davis', createdDate: '2025-01-22', component: 'Calendar', browser: 'N/A', reproducible: false, affectedUsers: 45 },
  { id: 8, title: 'Search results incomplete', severity: 'high', status: 'in-progress', priority: 'high', assignedTo: 'David Kim', reportedBy: 'Anna Lee', createdDate: '2025-01-23', component: 'Search', browser: 'Edge', reproducible: true, affectedUsers: 432 },
]

export default function BugsTrackingClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: bugs.length,
    open: bugs.filter(b => b.status === 'open').length,
    inProgress: bugs.filter(b => b.status === 'in-progress').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
    critical: bugs.filter(b => b.severity === 'critical').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'open': 'bg-red-100 text-red-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-gray-100 text-gray-700',
    }
    const labels: Record<string, string> = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed',
    }
    return <Badge className={styles[status]}>{labels[status]}</Badge>
  }

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    }
    return <Badge variant="outline" className={styles[severity]}>{severity}</Badge>
  }

  const severities = ['all', 'critical', 'high', 'medium', 'low']
  const statuses = ['all', 'open', 'in-progress', 'resolved', 'closed']

  const filteredBugs = useMemo(() => bugs.filter(b =>
    (severityFilter === 'all' || b.severity === severityFilter) &&
    (statusFilter === 'all' || b.status === statusFilter) &&
    (b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.component.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, severityFilter, statusFilter])

  const insights = [
    { icon: Bug, title: `${stats.total}`, description: 'Total bugs' },
    { icon: AlertCircle, title: `${stats.critical}`, description: 'Critical bugs' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle2, title: `${stats.resolved}`, description: 'Resolved' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Bug className="h-8 w-8 text-primary" />Bug Tracking</h1>
          <p className="text-muted-foreground mt-1">Track and manage software bugs</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Report Bug</Button>
      </div>

      <CollapsibleInsightsPanel title="Bug Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bugs..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          {severities.map(sev => <option key={sev} value={sev}>{sev === 'all' ? 'All Severities' : sev}</option>)}
        </select>
        <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBugs.map((bug) => (
          <Card key={bug.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">#{bug.id} {bug.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{bug.component}</p>
                </div>
                {getSeverityBadge(bug.severity)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                {getStatusBadge(bug.status)}
                <Badge variant="secondary" className="text-xs">{bug.browser}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Reported by</span>
                  <span className="font-medium">{bug.reportedBy}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Assigned to</span>
                  <span className="font-medium">{bug.assignedTo || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Created</span>
                  <span className="font-medium">{bug.createdDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Affected users</span>
                  <span className="font-medium">{bug.affectedUsers.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={bug.reproducible ? 'default' : 'secondary'} className="text-xs">
                  {bug.reproducible ? 'Reproducible' : 'Not Reproducible'}
                </Badge>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                <Button size="sm" variant="ghost">Assign</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
