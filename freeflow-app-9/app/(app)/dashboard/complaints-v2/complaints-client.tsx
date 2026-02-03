'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { MessageSquare, Plus, Search, AlertTriangle, Clock, CheckCircle, XCircle, User } from 'lucide-react'

const complaints = [
  { id: 1, subject: 'Noisy Office Environment', category: 'Workplace', priority: 'medium', status: 'in-progress', submitted: '2024-02-01', assignedTo: 'Facilities Team', anonymous: false },
  { id: 2, subject: 'Unfair Performance Review', category: 'HR', priority: 'high', status: 'under-review', submitted: '2024-01-30', assignedTo: 'HR Manager', anonymous: true },
  { id: 3, subject: 'Parking Space Issues', category: 'Facilities', priority: 'low', status: 'resolved', submitted: '2024-01-28', assignedTo: 'Operations', anonymous: false },
  { id: 4, subject: 'Broken Coffee Machine', category: 'Equipment', priority: 'medium', status: 'in-progress', submitted: '2024-02-02', assignedTo: 'Maintenance', anonymous: false },
  { id: 5, subject: 'Team Communication Problems', category: 'Management', priority: 'high', status: 'under-review', submitted: '2024-01-25', assignedTo: 'Department Head', anonymous: true },
]

const myComplaints = [
  { id: 1, subject: 'Temperature Control in Office', status: 'resolved', submitted: '2024-01-20', resolution: 'HVAC system adjusted' },
  { id: 2, subject: 'Late Salary Payment', status: 'in-progress', submitted: '2024-01-18', resolution: null },
]

export default function ComplaintsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    total: complaints.length,
    underReview: complaints.filter(c => c.status === 'under-review').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'under-review': 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      dismissed: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge variant="outline" className={styles[priority]}>{priority}</Badge>
  }

  const categories = ['all', ...new Set(complaints.map(c => c.category))]

  const filteredComplaints = useMemo(() => complaints.filter(c =>
    (statusFilter === 'all' || c.status === statusFilter) &&
    (categoryFilter === 'all' || c.category === categoryFilter) &&
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, statusFilter, categoryFilter])

  const insights = [
    { icon: MessageSquare, title: `${stats.total}`, description: 'Total complaints' },
    { icon: Clock, title: `${stats.underReview}`, description: 'Under review' },
    { icon: AlertTriangle, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: CheckCircle, title: `${stats.resolved}`, description: 'Resolved' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><MessageSquare className="h-8 w-8 text-primary" />Complaints & Issues</h1>
          <p className="text-muted-foreground mt-1">Submit and track workplace complaints</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />File Complaint</Button>
      </div>

      <CollapsibleInsightsPanel title="Complaints Overview" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Complaints</TabsTrigger>
          <TabsTrigger value="mine">My Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search complaints..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
            <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="under-review">Under Review</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{complaint.subject}</h4>
                        {complaint.anonymous && <Badge variant="outline" className="bg-gray-100">Anonymous</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{complaint.category}</Badge>
                        {getPriorityBadge(complaint.priority)}
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Submitted: {complaint.submitted}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Assigned to: {complaint.assignedTo}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          <div className="space-y-3">
            {myComplaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{complaint.subject}</h4>
                      <p className="text-sm text-muted-foreground">Submitted: {complaint.submitted}</p>
                      {complaint.resolution && (
                        <p className="text-sm text-green-600 mt-1">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          {complaint.resolution}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(complaint.status)}
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
