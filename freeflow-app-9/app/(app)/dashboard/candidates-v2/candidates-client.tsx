'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { UserCheck, Plus, Search, Briefcase, Calendar, Star, MapPin, Mail, Phone, MoreHorizontal, FileText } from 'lucide-react'

const candidates = [
  { id: 1, name: 'Alex Johnson', email: 'alex@email.com', phone: '+1 555-0123', position: 'Senior Developer', location: 'New York', stage: 'interview', rating: 4.5, appliedDate: '2024-01-10', skills: ['React', 'Node.js', 'TypeScript'] },
  { id: 2, name: 'Maria Garcia', email: 'maria@email.com', phone: '+1 555-0456', position: 'Product Designer', location: 'Remote', stage: 'screening', rating: 4.2, appliedDate: '2024-01-12', skills: ['Figma', 'UI/UX', 'Prototyping'] },
  { id: 3, name: 'James Wilson', email: 'james@email.com', phone: '+1 555-0789', position: 'Data Analyst', location: 'Chicago', stage: 'offer', rating: 4.8, appliedDate: '2024-01-08', skills: ['Python', 'SQL', 'Tableau'] },
  { id: 4, name: 'Emma Brown', email: 'emma@email.com', phone: '+1 555-0147', position: 'Marketing Manager', location: 'Los Angeles', stage: 'hired', rating: 4.6, appliedDate: '2024-01-05', skills: ['SEO', 'Content', 'Analytics'] },
  { id: 5, name: 'Michael Lee', email: 'michael@email.com', phone: '+1 555-0258', position: 'DevOps Engineer', location: 'Seattle', stage: 'rejected', rating: 3.8, appliedDate: '2024-01-15', skills: ['AWS', 'Docker', 'Kubernetes'] },
]

const stages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']

export default function CandidatesClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const stats = useMemo(() => ({
    total: candidates.length,
    inPipeline: candidates.filter(c => !['hired', 'rejected'].includes(c.stage)).length,
    hired: candidates.filter(c => c.stage === 'hired').length,
    avgRating: (candidates.reduce((sum, c) => sum + c.rating, 0) / candidates.length).toFixed(1),
  }), [])

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-gray-100 text-gray-700',
      screening: 'bg-blue-100 text-blue-700',
      interview: 'bg-yellow-100 text-yellow-700',
      offer: 'bg-purple-100 text-purple-700',
      hired: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
  }

  const filteredCandidates = useMemo(() => candidates.filter(c =>
    (activeTab === 'all' || c.stage === activeTab) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.position.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [searchQuery, activeTab])

  const insights = [
    { icon: UserCheck, title: `${stats.total}`, description: 'Total candidates' },
    { icon: Briefcase, title: `${stats.inPipeline}`, description: 'In pipeline' },
    { icon: Star, title: `${stats.avgRating}`, description: 'Avg rating' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-primary" />
            Candidates
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage job applicants</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Candidate</Button>
      </div>

      <CollapsibleInsightsPanel title="Candidate Overview" insights={insights} defaultExpanded={true} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {stages.map(s => <TabsTrigger key={s} value={s}>{s}</TabsTrigger>)}
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-9 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12"><AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.position}</p>
                      </div>
                    </div>
                    <Badge className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{candidate.email}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-3 w-3" />{candidate.location}</div>
                    <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />Applied {candidate.appliedDate}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {candidate.skills.map(skill => <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /><span className="font-medium">{candidate.rating}</span></div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"><FileText className="h-4 w-4 mr-1" />Resume</Button>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
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
