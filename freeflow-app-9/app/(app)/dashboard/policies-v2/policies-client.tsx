'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { FileText, Plus, Search, Calendar, CheckCircle, Clock, AlertTriangle, Users, Eye } from 'lucide-react'

const policies = [
  { id: 'POL-001', title: 'Data Privacy Policy', category: 'Privacy', status: 'active', version: '2.1', lastUpdated: '2024-01-15', nextReview: '2024-07-15', owner: 'Legal Team', acknowledged: 145, total: 150 },
  { id: 'POL-002', title: 'Code of Conduct', category: 'HR', status: 'active', version: '1.5', lastUpdated: '2023-12-01', nextReview: '2024-06-01', owner: 'HR Department', acknowledged: 148, total: 150 },
  { id: 'POL-003', title: 'Information Security Policy', category: 'Security', status: 'active', version: '3.0', lastUpdated: '2024-02-01', nextReview: '2024-08-01', owner: 'IT Security', acknowledged: 142, total: 150 },
  { id: 'POL-004', title: 'Remote Work Policy', category: 'HR', status: 'review', version: '1.2', lastUpdated: '2023-09-15', nextReview: '2024-03-15', owner: 'HR Department', acknowledged: 150, total: 150 },
  { id: 'POL-005', title: 'Acceptable Use Policy', category: 'IT', status: 'active', version: '2.0', lastUpdated: '2023-11-20', nextReview: '2024-05-20', owner: 'IT Department', acknowledged: 138, total: 150 },
  { id: 'POL-006', title: 'Expense Reimbursement', category: 'Finance', status: 'draft', version: '2.5', lastUpdated: '2024-01-30', nextReview: '2024-02-15', owner: 'Finance', acknowledged: 0, total: 150 },
]

const categories = [
  { name: 'Privacy', count: 8, color: 'bg-purple-100 text-purple-700' },
  { name: 'Security', count: 12, color: 'bg-red-100 text-red-700' },
  { name: 'HR', count: 15, color: 'bg-blue-100 text-blue-700' },
  { name: 'IT', count: 10, color: 'bg-green-100 text-green-700' },
  { name: 'Finance', count: 6, color: 'bg-orange-100 text-orange-700' },
]

const recentUpdates = [
  { policy: 'POL-003', title: 'Information Security Policy', date: '2024-02-01', type: 'Major Update' },
  { policy: 'POL-006', title: 'Expense Reimbursement', date: '2024-01-30', type: 'Draft Created' },
  { policy: 'POL-001', title: 'Data Privacy Policy', date: '2024-01-15', type: 'Minor Update' },
]

const reviewRequired = [
  { policy: 'POL-006', title: 'Expense Reimbursement', dueDate: '2024-02-15', daysLeft: 12 },
  { policy: 'POL-004', title: 'Remote Work Policy', dueDate: '2024-03-15', daysLeft: 40 },
  { policy: 'POL-005', title: 'Acceptable Use Policy', dueDate: '2024-05-20', daysLeft: 106 },
]

export default function PoliciesClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    total: policies.length,
    active: policies.filter(p => p.status === 'active').length,
    review: policies.filter(p => p.status === 'review').length,
    draft: policies.filter(p => p.status === 'draft').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      review: 'bg-yellow-100 text-yellow-700',
      draft: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => 
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      (p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       p.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, categoryFilter])

  const insights = [
    { icon: FileText, title: `${stats.total}`, description: 'Total policies' },
    { icon: CheckCircle, title: `${stats.active}`, description: 'Active' },
    { icon: Clock, title: `${stats.review}`, description: 'In review' },
    { icon: AlertTriangle, title: `${stats.draft}`, description: 'Drafts' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="h-8 w-8 text-primary" />Policy Management</h1>
          <p className="text-muted-foreground mt-1">Manage organizational policies and guidelines</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Policy</Button>
      </div>

      <CollapsibleInsightsPanel title="Policy Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Badge className={category.color}>{category.name}</Badge>
              <p className="text-2xl font-bold mt-2">{category.count}</p>
              <p className="text-xs text-muted-foreground">Policies</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">All Policies</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="reviews">Pending Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search policies..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPolicies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{policy.id}</Badge>
                        <h4 className="font-semibold">{policy.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{policy.category}</span>
                        <span>•</span>
                        <span>v{policy.version}</span>
                      </div>
                    </div>
                    {getStatusBadge(policy.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium">{policy.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{policy.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Review:</span>
                      <span className="font-medium">{policy.nextReview}</span>
                    </div>
                    {policy.status === 'active' && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Acknowledged:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{policy.acknowledged}/{policy.total}</span>
                          <Badge variant="outline" className={policy.acknowledged === policy.total ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {Math.round((policy.acknowledged / policy.total) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1"><Eye className="h-4 w-4 mr-1" />View</Button>
                    <Button size="sm" variant="outline" className="flex-1">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{update.policy}</Badge>
                        <h4 className="font-semibold">{update.title}</h4>
                      </div>
                      <Badge>{update.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{update.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Policies Requiring Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reviewRequired.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{item.policy}</Badge>
                        <h4 className="font-semibold">{item.title}</h4>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">{item.daysLeft} days left</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
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
