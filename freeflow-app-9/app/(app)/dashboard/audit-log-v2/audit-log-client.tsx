'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { ClipboardList, Search, Filter, Download, User, Clock, Activity, FileEdit, Trash2, Plus, LogIn, Settings } from 'lucide-react'

const auditLogs = [
  { id: 1, user: 'Sarah Chen', action: 'updated', resource: 'Project Settings', resourceId: 'PRJ-001', timestamp: '2024-01-15 14:32:15', ip: '192.168.1.100', details: 'Changed project deadline' },
  { id: 2, user: 'Mike Johnson', action: 'created', resource: 'Invoice', resourceId: 'INV-234', timestamp: '2024-01-15 14:15:42', ip: '192.168.1.101', details: 'New invoice for TechCorp' },
  { id: 3, user: 'Emily Davis', action: 'deleted', resource: 'Document', resourceId: 'DOC-567', timestamp: '2024-01-15 13:45:30', ip: '192.168.1.102', details: 'Removed draft document' },
  { id: 4, user: 'Tom Wilson', action: 'login', resource: 'System', resourceId: '', timestamp: '2024-01-15 13:30:00', ip: '192.168.1.103', details: 'Successful login' },
  { id: 5, user: 'Lisa Park', action: 'updated', resource: 'User Settings', resourceId: 'USR-089', timestamp: '2024-01-15 12:20:18', ip: '192.168.1.104', details: 'Updated notification preferences' },
  { id: 6, user: 'Sarah Chen', action: 'created', resource: 'Task', resourceId: 'TSK-789', timestamp: '2024-01-15 11:55:33', ip: '192.168.1.100', details: 'Created new development task' },
]

export default function AuditLogClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const stats = useMemo(() => ({
    total: auditLogs.length,
    today: auditLogs.filter(l => l.timestamp.startsWith('2024-01-15')).length,
    updates: auditLogs.filter(l => l.action === 'updated').length,
    creates: auditLogs.filter(l => l.action === 'created').length,
  }), [])

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = { updated: FileEdit, created: Plus, deleted: Trash2, login: LogIn, settings: Settings }
    return icons[action] || Activity
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = { updated: 'bg-blue-100 text-blue-700', created: 'bg-green-100 text-green-700', deleted: 'bg-red-100 text-red-700', login: 'bg-purple-100 text-purple-700' }
    return colors[action] || 'bg-gray-100 text-gray-700'
  }

  const filteredLogs = useMemo(() => auditLogs.filter(l =>
    (actionFilter === 'all' || l.action === actionFilter) &&
    (l.user.toLowerCase().includes(searchQuery.toLowerCase()) || l.resource.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, actionFilter])

  const insights = [
    { icon: ClipboardList, title: `${stats.total}`, description: 'Total entries' },
    { icon: Clock, title: `${stats.today}`, description: 'Today' },
    { icon: Activity, title: `${stats.updates}`, description: 'Updates' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">Track all system activities and changes</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Logs</Button>
      </div>

      <CollapsibleInsightsPanel title="Activity Stats" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Action type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
            <SelectItem value="login">Login</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action)
              return (
                <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                  <Avatar><AvatarFallback>{log.user.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.user}</span>
                      <Badge className={getActionColor(log.action)}><ActionIcon className="h-3 w-3 mr-1" />{log.action}</Badge>
                      <span className="text-muted-foreground">{log.resource}</span>
                      {log.resourceId && <code className="text-xs bg-muted px-1 rounded">{log.resourceId}</code>}
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{log.timestamp}</p>
                    <p className="text-xs">{log.ip}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
