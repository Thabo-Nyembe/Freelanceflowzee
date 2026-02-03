'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { AlertOctagon, Plus, Search, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Shield } from 'lucide-react'

const incidents = [
  { id: 'INC-001', title: 'Database Connection Failure', severity: 'critical', status: 'investigating', assignee: 'DevOps Team', created: '2024-02-01 09:15', resolved: null, affectedUsers: 1250, description: 'Primary database cluster unreachable' },
  { id: 'INC-002', title: 'API Response Time Degradation', severity: 'high', status: 'monitoring', assignee: 'Backend Team', created: '2024-02-01 08:30', resolved: null, affectedUsers: 450, description: 'API latency increased by 300%' },
  { id: 'INC-003', title: 'Payment Gateway Timeout', severity: 'critical', status: 'resolved', assignee: 'Finance Team', created: '2024-01-31 14:00', resolved: '2024-01-31 16:30', affectedUsers: 89, description: 'Payment processing failures' },
  { id: 'INC-004', title: 'Email Service Outage', severity: 'medium', status: 'investigating', assignee: 'Platform Team', created: '2024-02-01 07:00', resolved: null, affectedUsers: 2300, description: 'Emails not being sent' },
  { id: 'INC-005', title: 'CDN Performance Issues', severity: 'high', status: 'monitoring', assignee: 'Infrastructure', created: '2024-01-31 20:00', resolved: null, affectedUsers: 560, description: 'Static assets loading slowly' },
]

const incidentStats = [
  { severity: 'Critical', count: 8, mttr: '45 min', color: 'bg-red-100 text-red-700' },
  { severity: 'High', count: 15, mttr: '2.5 hours', color: 'bg-orange-100 text-orange-700' },
  { severity: 'Medium', count: 22, mttr: '4 hours', color: 'bg-yellow-100 text-yellow-700' },
  { severity: 'Low', count: 12, mttr: '8 hours', color: 'bg-green-100 text-green-700' },
]

const recentResolve = [
  { id: 'INC-003', title: 'Payment Gateway Timeout', duration: '2h 30m', team: 'Finance Team' },
  { id: 'INC-010', title: 'Login Service Degradation', duration: '1h 45m', team: 'Auth Team' },
  { id: 'INC-015', title: 'Cache Server Failure', duration: '3h 15m', team: 'Infrastructure' },
]

const teams = [
  { name: 'DevOps Team', active: 3, resolved: 24, avgTime: '2.1h' },
  { name: 'Backend Team', active: 2, resolved: 18, avgTime: '3.2h' },
  { name: 'Infrastructure', active: 4, resolved: 32, avgTime: '1.8h' },
]

export default function IncidentsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')

  const stats = useMemo(() => ({
    total: incidents.length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    monitoring: incidents.filter(i => i.status === 'monitoring').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  }), [])

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[severity]}>{severity}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      investigating: 'bg-red-100 text-red-700',
      monitoring: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredIncidents = useMemo(() => {
    return incidents.filter(i => 
      (severityFilter === 'all' || i.severity === severityFilter) &&
      (i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       i.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, severityFilter])

  const insights = [
    { icon: AlertOctagon, title: `${stats.total}`, description: 'Total incidents' },
    { icon: AlertTriangle, title: `${stats.investigating}`, description: 'Investigating' },
    { icon: Clock, title: `${stats.monitoring}`, description: 'Monitoring' },
    { icon: CheckCircle, title: `${stats.resolved}`, description: 'Resolved' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><AlertOctagon className="h-8 w-8 text-primary" />Incident Management</h1>
          <p className="text-muted-foreground mt-1">Track and resolve system incidents</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700"><Plus className="h-4 w-4 mr-2" />Report Incident</Button>
      </div>

      <CollapsibleInsightsPanel title="Incident Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {incidentStats.map((stat) => (
          <Card key={stat.severity}>
            <CardContent className="p-4">
              <Badge className={stat.color}>{stat.severity}</Badge>
              <p className="text-3xl font-bold mt-2">{stat.count}</p>
              <p className="text-xs text-muted-foreground mt-1">MTTR: {stat.mttr}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Incidents</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search incidents..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredIncidents.filter(i => i.status !== 'resolved').map((incident) => (
              <Card key={incident.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{incident.id}</Badge>
                        <h4 className="font-semibold">{incident.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {getSeverityBadge(incident.severity)}
                      {getStatusBadge(incident.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{incident.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{incident.affectedUsers.toLocaleString()} users affected</span>
                      </div>
                    </div>
                    <span className="text-muted-foreground">Started: {incident.created}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentResolve.map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{incident.id}</Badge>
                        <h4 className="font-semibold">{incident.title}</h4>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Resolved</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{incident.team}</span>
                      <span>Duration: {incident.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{team.name}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-medium text-lg text-red-600">{team.active}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Resolved</p>
                        <p className="font-medium text-lg text-green-600">{team.resolved}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium text-lg">{team.avgTime}</p>
                      </div>
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
