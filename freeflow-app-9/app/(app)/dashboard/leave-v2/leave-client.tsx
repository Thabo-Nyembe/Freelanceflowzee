'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { CalendarDays, Plus, Calendar, Clock, CheckCircle, XCircle, MoreHorizontal, Plane, Heart, Baby, Briefcase } from 'lucide-react'

const leaveRequests = [
  { id: 1, employee: 'Sarah Chen', type: 'vacation', startDate: '2024-02-01', endDate: '2024-02-05', days: 5, status: 'approved', reason: 'Family vacation' },
  { id: 2, employee: 'Mike Johnson', type: 'sick', startDate: '2024-01-18', endDate: '2024-01-19', days: 2, status: 'pending', reason: 'Medical appointment' },
  { id: 3, employee: 'Emily Davis', type: 'personal', startDate: '2024-01-25', endDate: '2024-01-25', days: 1, status: 'pending', reason: 'Personal errand' },
  { id: 4, employee: 'Tom Wilson', type: 'vacation', startDate: '2024-02-10', endDate: '2024-02-15', days: 6, status: 'approved', reason: 'Holiday trip' },
  { id: 5, employee: 'Lisa Park', type: 'parental', startDate: '2024-03-01', endDate: '2024-05-31', days: 92, status: 'approved', reason: 'Maternity leave' },
]

const leaveBalance = { vacation: { total: 20, used: 8, pending: 5 }, sick: { total: 10, used: 3, pending: 0 }, personal: { total: 5, used: 2, pending: 1 } }

export default function LeaveClient() {
  const [activeTab, setActiveTab] = useState('all')

  const stats = useMemo(() => ({
    pending: leaveRequests.filter(l => l.status === 'pending').length,
    approved: leaveRequests.filter(l => l.status === 'approved').length,
    totalDays: leaveRequests.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0),
  }), [])

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = { vacation: Plane, sick: Heart, personal: Briefcase, parental: Baby }
    return icons[type] || Calendar
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = { vacation: 'bg-blue-100 text-blue-700', sick: 'bg-red-100 text-red-700', personal: 'bg-purple-100 text-purple-700', parental: 'bg-pink-100 text-pink-700' }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredRequests = useMemo(() => leaveRequests.filter(l => activeTab === 'all' || l.status === activeTab), [activeTab])

  const insights = [
    { icon: Clock, title: `${stats.pending}`, description: 'Pending requests' },
    { icon: CheckCircle, title: `${stats.approved}`, description: 'Approved' },
    { icon: CalendarDays, title: `${stats.totalDays}`, description: 'Days scheduled' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            Leave Management
          </h1>
          <p className="text-muted-foreground mt-1">Request and manage time off</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Request Leave</Button>
      </div>

      <CollapsibleInsightsPanel title="Leave Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(leaveBalance).map(([type, balance]) => (
          <Card key={type}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium capitalize">{type}</span>
                <Badge className={getTypeColor(type)}>{balance.total - balance.used - balance.pending} available</Badge>
              </div>
              <Progress value={((balance.used + balance.pending) / balance.total) * 100} className="h-2 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{balance.used} used</span>
                <span>{balance.pending} pending</span>
                <span>{balance.total} total</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredRequests.map((request) => {
                  const TypeIcon = getTypeIcon(request.type)
                  return (
                    <div key={request.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Avatar><AvatarFallback>{request.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <div>
                          <h4 className="font-medium">{request.employee}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TypeIcon className="h-3 w-3" />
                            <span className="capitalize">{request.type}</span>
                            <span>•</span>
                            <span>{request.startDate} - {request.endDate}</span>
                            <span>({request.days} days)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(request.status)}
                        {request.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-green-600"><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-600"><XCircle className="h-4 w-4" /></Button>
                          </div>
                        )}
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
