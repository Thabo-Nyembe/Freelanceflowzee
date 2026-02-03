'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Archive, Search, FolderOpen, Calendar, DollarSign, Users, RotateCcw, Trash2, MoreHorizontal, Download } from 'lucide-react'

const archivedProjects = [
  { id: 1, name: 'Website Redesign 2023', client: 'TechCorp', completedDate: '2023-12-15', budget: 45000, spent: 42000, team: 5, status: 'completed' },
  { id: 2, name: 'Mobile App v1', client: 'StartupXYZ', completedDate: '2023-11-20', budget: 80000, spent: 78500, team: 8, status: 'completed' },
  { id: 3, name: 'Brand Refresh', client: 'GlobalCo', completedDate: '2023-10-05', budget: 25000, spent: 24000, team: 3, status: 'completed' },
  { id: 4, name: 'API Integration', client: 'DataFlow', completedDate: '2023-09-18', budget: 35000, spent: 36500, team: 4, status: 'cancelled' },
  { id: 5, name: 'Marketing Campaign', client: 'RetailMax', completedDate: '2023-08-30', budget: 15000, spent: 14200, team: 2, status: 'completed' },
]

export default function ProjectsArchiveClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    total: archivedProjects.length,
    completed: archivedProjects.filter(p => p.status === 'completed').length,
    totalBudget: archivedProjects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: archivedProjects.reduce((sum, p) => sum + p.spent, 0),
  }), [])

  const filteredProjects = useMemo(() => archivedProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery])

  const insights = [
    { icon: Archive, title: `${stats.total}`, description: 'Archived projects' },
    { icon: DollarSign, title: `$${(stats.totalSpent / 1000).toFixed(0)}K`, description: 'Total value' },
    { icon: Users, title: `${archivedProjects.reduce((sum, p) => sum + p.team, 0)}`, description: 'Team members' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Archive className="h-8 w-8 text-primary" />
            Project Archive
          </h1>
          <p className="text-muted-foreground mt-1">View and manage archived projects</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Archive</Button>
      </div>

      <CollapsibleInsightsPanel title="Archive Stats" insights={insights} defaultExpanded={true} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search archived projects..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{project.completedDate}</div>
                  <div className="text-sm"><Users className="h-3 w-3 inline mr-1" />{project.team}</div>
                  <div className="text-right">
                    <p className="font-medium">${project.spent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">of ${project.budget.toLocaleString()}</p>
                  </div>
                  <Badge className={project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{project.status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon"><RotateCcw className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
