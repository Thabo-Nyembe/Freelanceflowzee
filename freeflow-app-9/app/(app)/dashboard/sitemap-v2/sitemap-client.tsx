'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Map, Search, FolderOpen, FileText, ChevronRight, ChevronDown, ExternalLink, Home, Settings, Users, BarChart3 } from 'lucide-react'

const siteStructure = [
  { id: 1, name: 'Dashboard', path: '/dashboard', icon: Home, children: [
    { id: 11, name: 'Overview', path: '/dashboard', icon: BarChart3 },
    { id: 12, name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  ]},
  { id: 2, name: 'Projects', path: '/dashboard/projects', icon: FolderOpen, children: [
    { id: 21, name: 'Active', path: '/dashboard/projects/active', icon: FileText },
    { id: 22, name: 'Archive', path: '/dashboard/projects/archive', icon: FileText },
  ]},
  { id: 3, name: 'Team', path: '/dashboard/team', icon: Users, children: [
    { id: 31, name: 'Members', path: '/dashboard/team/members', icon: Users },
    { id: 32, name: 'Roles', path: '/dashboard/team/roles', icon: Settings },
  ]},
  { id: 4, name: 'Settings', path: '/dashboard/settings', icon: Settings, children: [
    { id: 41, name: 'General', path: '/dashboard/settings/general', icon: Settings },
    { id: 42, name: 'Security', path: '/dashboard/settings/security', icon: Settings },
  ]},
]

export default function SitemapClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expanded, setExpanded] = useState<number[]>([1, 2, 3, 4])

  const toggleExpand = (id: number) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])
  }

  const stats = { totalPages: 12, sections: 4, lastUpdated: '2024-01-15' }

  const insights = [
    { icon: Map, title: `${stats.totalPages}`, description: 'Total pages' },
    { icon: FolderOpen, title: `${stats.sections}`, description: 'Sections' },
    { icon: FileText, title: 'Active', description: 'Status' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Map className="h-8 w-8 text-primary" />Sitemap</h1>
          <p className="text-muted-foreground mt-1">View and navigate site structure</p>
        </div>
        <Button variant="outline"><ExternalLink className="h-4 w-4 mr-2" />Export XML</Button>
      </div>

      <CollapsibleInsightsPanel title="Site Overview" insights={insights} defaultExpanded={true} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search pages..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Site Structure</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {siteStructure.map((section) => (
              <div key={section.id}>
                <button onClick={() => toggleExpand(section.id)} className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/50">
                  {expanded.includes(section.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <section.icon className="h-4 w-4" />
                  <span className="font-medium">{section.name}</span>
                  <Badge variant="secondary" className="ml-auto">{section.children.length}</Badge>
                </button>
                {expanded.includes(section.id) && (
                  <div className="ml-8 space-y-1">
                    {section.children.map((child) => (
                      <div key={child.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 text-sm text-muted-foreground">
                        <child.icon className="h-3 w-3" />
                        <span>{child.name}</span>
                        <code className="ml-auto text-xs bg-muted px-1 rounded">{child.path}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
