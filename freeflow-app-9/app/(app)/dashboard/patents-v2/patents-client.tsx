'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Award, Plus, Search, FileText, Clock, CheckCircle, Users, Calendar } from 'lucide-react'

const patents = [
  { id: 1, title: 'AI-Powered Workflow Optimization System', number: 'US-2024-001234', status: 'granted', inventors: ['Sarah Chen', 'Mike Johnson'], filed: '2023-03-15', granted: '2024-01-20', category: 'Software' },
  { id: 2, title: 'Quantum Data Encryption Method', number: 'US-2023-009876', status: 'pending', inventors: ['Dr. Emily Davis'], filed: '2023-08-10', granted: null, category: 'Security' },
  { id: 3, title: 'Sustainable Energy Storage Device', number: 'US-2024-002468', status: 'granted', inventors: ['Tom Wilson', 'Anna Lee', 'James Park'], filed: '2022-11-05', granted: '2023-12-15', category: 'Hardware' },
  { id: 4, title: 'Neural Network Architecture for Real-time Processing', number: 'US-2024-003691', status: 'in-review', inventors: ['Sarah Chen'], filed: '2024-01-08', granted: null, category: 'Software' },
  { id: 5, title: 'Biodegradable Packaging Material', number: 'US-2023-007531', status: 'granted', inventors: ['Maria Garcia', 'Lisa Park'], filed: '2022-06-20', granted: '2023-10-10', category: 'Materials' },
]

export default function PatentsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const stats = useMemo(() => ({
    total: patents.length,
    granted: patents.filter(p => p.status === 'granted').length,
    pending: patents.filter(p => p.status === 'pending').length,
    inReview: patents.filter(p => p.status === 'in-review').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      granted: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      'in-review': 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredPatents = useMemo(() => patents.filter(p =>
    (statusFilter === 'all' || p.status === statusFilter) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.number.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, statusFilter])

  const insights = [
    { icon: Award, title: `${stats.total}`, description: 'Total patents' },
    { icon: CheckCircle, title: `${stats.granted}`, description: 'Granted' },
    { icon: Clock, title: `${stats.pending}`, description: 'Pending' },
    { icon: FileText, title: `${stats.inReview}`, description: 'In review' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Award className="h-8 w-8 text-primary" />Patents & IP</h1>
          <p className="text-muted-foreground mt-1">Manage intellectual property and patents</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />File New Patent</Button>
      </div>

      <CollapsibleInsightsPanel title="Patent Overview" insights={insights} defaultExpanded={true} />

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patents..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <select className="border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="granted">Granted</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPatents.map((patent) => (
          <Card key={patent.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{patent.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">Patent No: {patent.number}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{patent.category}</Badge>
                  {getStatusBadge(patent.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    <span>Inventors</span>
                  </div>
                  <p>{patent.inventors.join(', ')}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Filed Date</span>
                  </div>
                  <p>{patent.filed}</p>
                </div>

                {patent.granted && (
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Granted Date</span>
                    </div>
                    <p>{patent.granted}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                <Button size="sm" variant="outline">Download</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
