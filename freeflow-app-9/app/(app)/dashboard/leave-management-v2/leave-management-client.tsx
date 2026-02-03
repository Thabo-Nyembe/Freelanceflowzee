'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users, TrendingUp, Plane } from 'lucide-react'

const leaveRequests = [
  { id: 1, employee: 'Sarah Johnson', type: 'Vacation', startDate: '2024-03-01', endDate: '2024-03-05', days: 5, status: 'pending', reason: 'Family vacation', appliedDate: '2024-02-15' },
  { id: 2, employee: 'Mike Chen', type: 'Sick Leave', startDate: '2024-02-20', endDate: '2024-02-21', days: 2, status: 'approved', reason: 'Medical appointment', appliedDate: '2024-02-19' },
  { id: 3, employee: 'Emily Davis', type: 'Personal', startDate: '2024-03-10', endDate: '2024-03-12', days: 3, status: 'pending', reason: 'Personal matters', appliedDate: '2024-02-18' },
  { id: 4, employee: 'Alex Wilson', type: 'Vacation', startDate: '2024-04-01', endDate: '2024-04-07', days: 7, status: 'approved', reason: 'Annual vacation', appliedDate: '2024-02-10' },
  { id: 5, employee: 'Lisa Brown', type: 'Sick Leave', startDate: '2024-02-25', endDate: '2024-02-25', days: 1, status: 'rejected', reason: 'Not feeling well', appliedDate: '2024-02-24' },
]

const employeeBalances = [
  { name: 'Sarah Johnson', department: 'Engineering', vacation: 15, sick: 8, personal: 5, used: 7, total: 28 },
  { name: 'Mike Chen', department: 'Product', vacation: 20, sick: 10, personal: 5, used: 12, total: 35 },
  { name: 'Emily Davis', department: 'Design', vacation: 15, sick: 8, personal: 5, used: 5, total: 28 },
  { name: 'Alex Wilson', department: 'Marketing', vacation: 18, sick: 8, personal: 5, used: 10, total: 31 },
  { name: 'Lisa Brown', department: 'Sales', vacation: 15, sick: 8, personal: 5, used: 3, total: 28 },
]

const leaveCalendar = [
  { date: '2024-03-01', employees: ['Sarah Johnson', 'Mike Chen'], type: 'Vacation' },
  { date: '2024-03-05', employees: ['Emily Davis'], type: 'Personal' },
  { date: '2024-03-10', employees: ['Alex Wilson', 'Lisa Brown'], type: 'Sick Leave' },
]

const leaveTypes = [
  { name: 'Vacation', count: 45, days: 235, color: 'bg-blue-100 text-blue-700' },
  { name: 'Sick Leave', count: 28, days: 89, color: 'bg-red-100 text-red-700' },
  { name: 'Personal', count: 15, days: 52, color: 'bg-purple-100 text-purple-700' },
  { name: 'Other', count: 8, days: 24, color: 'bg-gray-100 text-gray-700' },
]

export default function LeaveManagementClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    totalDays: leaveRequests.reduce((sum, r) => sum + r.days, 0),
    avgDays: Math.round(leaveRequests.reduce((sum, r) => sum + r.days, 0) / leaveRequests.length),
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    const icons: Record<string, any> = {
      pending: AlertCircle,
      approved: CheckCircle,
      rejected: XCircle,
    }
    const Icon = icons[status]
    return (
      <Badge className={styles[status]}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return leaveRequests
    return leaveRequests.filter(r => r.status === filter)
  }, [filter])

  const insights = [
    { icon: Clock, title: `${stats.pending}`, description: 'Pending requests' },
    { icon: CheckCircle, title: `${stats.approved}`, description: 'Approved' },
    { icon: Calendar, title: `${stats.totalDays}`, description: 'Total days' },
    { icon: TrendingUp, title: `${stats.avgDays}`, description: 'Avg days/request' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Plane className="h-8 w-8 text-primary" />Leave Management</h1>
          <p className="text-muted-foreground mt-1">Manage employee leave requests and balances</p>
        </div>
        <Button><Calendar className="h-4 w-4 mr-2" />Request Leave</Button>
      </div>

      <CollapsibleInsightsPanel title="Leave Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveTypes.map((type) => (
          <Card key={type.name}>
            <CardContent className="p-4">
              <Badge className={type.color}>{type.name}</Badge>
              <div className="mt-3">
                <p className="text-2xl font-bold">{type.count}</p>
                <p className="text-xs text-muted-foreground">requests</p>
                <p className="text-sm text-muted-foreground mt-1">{type.days} days total</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances">Employee Balances</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <div className="flex gap-2 mb-4">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
            <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>Pending</Button>
            <Button variant={filter === 'approved' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('approved')}>Approved</Button>
            <Button variant={filter === 'rejected' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('rejected')}>Rejected</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.employee}`} />
                          <AvatarFallback>{request.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{request.employee}</h4>
                          <p className="text-sm text-muted-foreground">{request.type} • {request.days} days</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="font-medium">{request.startDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p className="font-medium">{request.endDate}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">Reason: {request.reason}</p>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" className="flex-1">Approve</Button>
                        <Button size="sm" variant="outline" className="flex-1">Reject</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeBalances.map((employee, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} />
                          <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.department}</p>
                        </div>
                      </div>
                      <Badge>{employee.total - employee.used} days left</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Vacation</p>
                        <p className="font-medium">{employee.vacation} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sick</p>
                        <p className="font-medium">{employee.sick} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Personal</p>
                        <p className="font-medium">{employee.personal} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Used</p>
                        <p className="font-medium text-red-600">{employee.used} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Leave Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveCalendar.map((day, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{day.date}</h4>
                      <Badge variant="outline">{day.employees.length} employees</Badge>
                    </div>
                    <div className="space-y-2">
                      {day.employees.map((emp, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp}`} />
                            <AvatarFallback>{emp.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span>{emp}</span>
                          <span className="text-muted-foreground">• {day.type}</span>
                        </div>
                      ))}
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
