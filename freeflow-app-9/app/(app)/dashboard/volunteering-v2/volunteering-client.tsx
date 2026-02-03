'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Heart, Plus, Search, Users, Clock, MapPin, Calendar, TrendingUp } from 'lucide-react'

const opportunities = [
  { id: 1, title: 'Beach Cleanup', organization: 'Ocean Conservation', date: '2024-02-15', time: '9:00 AM', location: 'Sunset Beach', volunteers: 15, needed: 20, hours: 4, category: 'Environment' },
  { id: 2, title: 'Food Bank Sorting', organization: 'Community Food Bank', date: '2024-02-10', time: '2:00 PM', location: 'Downtown Center', volunteers: 8, needed: 10, hours: 3, category: 'Community' },
  { id: 3, title: 'Coding Workshop for Kids', organization: 'Tech Education', date: '2024-02-20', time: '10:00 AM', location: 'Tech Hub', volunteers: 12, needed: 15, hours: 5, category: 'Education' },
  { id: 4, title: 'Animal Shelter Support', organization: 'Pet Rescue', date: '2024-02-12', time: '1:00 PM', location: 'Animal Shelter', volunteers: 6, needed: 8, hours: 3, category: 'Animals' },
]

const myVolunteering = [
  { id: 1, event: 'Tree Planting Day', organization: 'Green Earth', date: '2024-01-20', hours: 5, status: 'completed' },
  { id: 2, event: 'Senior Center Visit', organization: 'Elder Care', date: '2024-02-08', hours: 3, status: 'upcoming' },
  { id: 3, event: 'Blood Drive', organization: 'Red Cross', date: '2024-01-15', hours: 2, status: 'completed' },
]

export default function VolunteeringClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    opportunities: opportunities.length,
    myHours: myVolunteering.reduce((sum, v) => sum + v.hours, 0),
    upcoming: myVolunteering.filter(v => v.status === 'upcoming').length,
    volunteersNeeded: opportunities.reduce((sum, o) => sum + (o.needed - o.volunteers), 0),
  }), [])

  const categories = ['all', ...new Set(opportunities.map(o => o.category))]

  const filteredOpportunities = useMemo(() => opportunities.filter(o =>
    (categoryFilter === 'all' || o.category === categoryFilter) &&
    o.title.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const insights = [
    { icon: Heart, title: `${stats.opportunities}`, description: 'Opportunities' },
    { icon: Clock, title: `${stats.myHours}h`, description: 'Hours volunteered' },
    { icon: Calendar, title: `${stats.upcoming}`, description: 'Upcoming events' },
    { icon: Users, title: `${stats.volunteersNeeded}`, description: 'Volunteers needed' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="h-8 w-8 text-primary" />Volunteering</h1>
          <p className="text-muted-foreground mt-1">Corporate volunteer opportunities</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Post Opportunity</Button>
      </div>

      <CollapsibleInsightsPanel title="Volunteering Overview" insights={insights} defaultExpanded={true} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Available Opportunities</h3>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search opportunities..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{opp.title}</h4>
                    <p className="text-sm text-muted-foreground">{opp.organization}</p>
                  </div>
                  <Badge variant="outline">{opp.category}</Badge>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{opp.date} at {opp.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{opp.hours} hours</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Volunteers</span>
                    <span>{opp.volunteers}/{opp.needed}</span>
                  </div>
                  <Progress value={opp.volunteers/opp.needed*100} className="h-2" />
                </div>

                <Button className="w-full" disabled={opp.volunteers >= opp.needed}>
                  {opp.volunteers >= opp.needed ? 'Spots Filled' : 'Sign Up'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">My Volunteering</h3>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {myVolunteering.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">{activity.event}</h4>
                    <p className="text-sm text-muted-foreground">{activity.organization} • {activity.hours} hours</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
