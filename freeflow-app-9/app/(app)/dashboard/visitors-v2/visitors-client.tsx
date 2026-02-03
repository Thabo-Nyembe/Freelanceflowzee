'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserPlus, Plus, Search, Clock, CheckCircle, XCircle, Building, Calendar, LogIn, LogOut, MoreHorizontal } from 'lucide-react'

const visitors = [
  { id: 1, name: 'John Smith', company: 'TechCorp', host: 'Sarah Chen', purpose: 'Business Meeting', checkIn: '9:00 AM', checkOut: null, status: 'checked-in', badge: 'V-001' },
  { id: 2, name: 'Emily Davis', company: 'StartupXYZ', host: 'Mike Johnson', purpose: 'Interview', checkIn: '10:30 AM', checkOut: '12:00 PM', status: 'checked-out', badge: 'V-002' },
  { id: 3, name: 'Robert Brown', company: 'GlobalCo', host: 'Tom Wilson', purpose: 'Client Visit', checkIn: null, checkOut: null, status: 'expected', badge: null },
  { id: 4, name: 'Lisa Park', company: 'DataFlow', host: 'Emily Chen', purpose: 'Training', checkIn: '8:30 AM', checkOut: null, status: 'checked-in', badge: 'V-003' },
  { id: 5, name: 'James Wilson', company: 'MediaHub', host: 'Alex Kim', purpose: 'Delivery', checkIn: '2:00 PM', checkOut: '2:15 PM', status: 'checked-out', badge: 'V-004' },
]

export default function VisitorsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: visitors.length,
    checkedIn: visitors.filter(v => v.status === 'checked-in').length,
    expected: visitors.filter(v => v.status === 'expected').length,
    checkedOut: visitors.filter(v => v.status === 'checked-out').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'checked-in': 'bg-green-100 text-green-700',
      'checked-out': 'bg-gray-100 text-gray-700',
      expected: 'bg-blue-100 text-blue-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredVisitors = useMemo(() => visitors.filter(v =>
    (statusFilter === 'all' || v.status === statusFilter) &&
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.company.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, statusFilter])

  const insights = [
    { icon: UserPlus, title: `${stats.total}`, description: 'Total visitors today' },
    { icon: LogIn, title: `${stats.checkedIn}`, description: 'Currently on-site' },
    { icon: Clock, title: `${stats.expected}`, description: 'Expected' },
    { icon: LogOut, title: `${stats.checkedOut}`, description: 'Checked out' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UserPlus className="h-8 w-8 text-primary" />Visitors</h1>
          <p className="text-muted-foreground mt-1">Manage visitor check-ins and access</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Pre-register Visitor</Button>
      </div>

      <CollapsibleInsightsPanel title="Visitor Stats" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search visitors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="checked-in">Checked In</option>
          <option value="expected">Expected</option>
          <option value="checked-out">Checked Out</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredVisitors.map((visitor) => (
              <div key={visitor.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{visitor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{visitor.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" /><span>{visitor.company}</span>
                      <span>•</span>
                      <span>Host: {visitor.host}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-right">
                    <p className="text-muted-foreground">{visitor.purpose}</p>
                    {visitor.badge && <p className="font-mono text-xs">Badge: {visitor.badge}</p>}
                  </div>
                  <div className="text-sm text-center min-w-[100px]">
                    {visitor.checkIn && <p className="text-green-600">In: {visitor.checkIn}</p>}
                    {visitor.checkOut && <p className="text-gray-600">Out: {visitor.checkOut}</p>}
                    {!visitor.checkIn && <p className="text-blue-600">Expected</p>}
                  </div>
                  {getStatusBadge(visitor.status)}
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
