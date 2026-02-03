'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Users, Plus, Search, Clock, Package, Phone, Mail, MessageSquare, Bell } from 'lucide-react'

const todayVisitors = [
  { id: 1, name: 'John Smith', company: 'TechCorp', visiting: 'Sarah Chen', purpose: 'Meeting', checkIn: '9:00 AM', status: 'checked-in' },
  { id: 2, name: 'Emily Davis', company: 'StartupXYZ', visiting: 'Mike Johnson', purpose: 'Interview', checkIn: '10:30 AM', status: 'waiting' },
  { id: 3, name: 'Robert Brown', company: 'GlobalCo', visiting: 'Tom Wilson', purpose: 'Delivery', checkIn: '11:00 AM', status: 'with-host' },
]

const packages = [
  { id: 1, recipient: 'Sarah Chen', carrier: 'FedEx', tracking: 'FX12345678', arrived: '8:30 AM', status: 'ready', size: 'Small' },
  { id: 2, recipient: 'IT Department', carrier: 'UPS', tracking: 'UPS98765432', arrived: '9:15 AM', status: 'picked-up', size: 'Large' },
  { id: 3, recipient: 'Mike Johnson', carrier: 'DHL', tracking: 'DHL11223344', arrived: '10:00 AM', status: 'ready', size: 'Medium' },
]

const calls = [
  { id: 1, caller: 'Client - ABC Corp', for: 'Sales Team', time: '9:30 AM', status: 'transferred' },
  { id: 2, caller: 'Vendor Support', for: 'IT Department', time: '10:15 AM', status: 'on-hold' },
  { id: 3, caller: 'Job Applicant', for: 'HR Team', time: '11:00 AM', status: 'pending' },
]

const messages = [
  { id: 1, from: 'Building Management', to: 'All Staff', subject: 'Elevator Maintenance - Floor 3', time: '8:00 AM', priority: 'high' },
  { id: 2, from: 'Security', to: 'Sarah Chen', subject: 'Visitor Pre-registration Reminder', time: '9:00 AM', priority: 'normal' },
  { id: 3, from: 'Facilities', to: 'All Staff', subject: 'Conference Room A Unavailable Today', time: '7:30 AM', priority: 'urgent' },
]

export default function ReceptionClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    visitors: todayVisitors.length,
    waitingVisitors: todayVisitors.filter(v => v.status === 'waiting').length,
    packages: packages.filter(p => p.status === 'ready').length,
    pendingCalls: calls.filter(c => c.status === 'pending' || c.status === 'on-hold').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'checked-in': 'bg-green-100 text-green-700',
      waiting: 'bg-yellow-100 text-yellow-700',
      'with-host': 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700',
      'picked-up': 'bg-gray-100 text-gray-700',
      transferred: 'bg-green-100 text-green-700',
      'on-hold': 'bg-yellow-100 text-yellow-700',
      pending: 'bg-blue-100 text-blue-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      normal: 'bg-blue-100 text-blue-700',
    }
    return <Badge variant="outline" className={styles[priority]}>{priority}</Badge>
  }

  const insights = [
    { icon: Users, title: `${stats.visitors}`, description: 'Visitors today' },
    { icon: Clock, title: `${stats.waitingVisitors}`, description: 'Currently waiting' },
    { icon: Package, title: `${stats.packages}`, description: 'Packages ready' },
    { icon: Phone, title: `${stats.pendingCalls}`, description: 'Pending calls' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Users className="h-8 w-8 text-primary" />Reception Desk</h1>
          <p className="text-muted-foreground mt-1">Manage visitors, packages, and communications</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Reception Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="visitors">
        <TabsList>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search visitors..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button><Plus className="h-4 w-4 mr-2" />Check In Visitor</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {todayVisitors.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{visitor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{visitor.name}</h4>
                        <p className="text-sm text-muted-foreground">{visitor.company}</p>
                        <p className="text-xs text-muted-foreground">Visiting: {visitor.visiting} • {visitor.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(visitor.status)}
                      <p className="text-xs text-muted-foreground mt-1">Checked in: {visitor.checkIn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">Package for {pkg.recipient}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{pkg.carrier} • {pkg.tracking}</p>
                        <p className="text-xs text-muted-foreground">Size: {pkg.size} • Arrived: {pkg.arrived}</p>
                      </div>
                      {getStatusBadge(pkg.status)}
                    </div>
                    {pkg.status === 'ready' && (
                      <Button size="sm" variant="outline" className="mt-2">Notify Recipient</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {calls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{call.caller}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">For: {call.for}</p>
                      <p className="text-xs text-muted-foreground">{call.time}</p>
                    </div>
                    {getStatusBadge(call.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{message.subject}</h4>
                        {getPriorityBadge(message.priority)}
                      </div>
                      <p className="text-sm text-muted-foreground">From: {message.from} • To: {message.to}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
