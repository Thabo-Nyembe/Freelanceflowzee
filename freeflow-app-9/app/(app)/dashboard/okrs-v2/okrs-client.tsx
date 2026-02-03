'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Target, TrendingUp, Calendar, Search, Plus, CheckCircle,
  Clock, Users, ChevronDown, ChevronRight, MoreHorizontal,
  Flag, Layers, BarChart3, AlertTriangle, Trophy, Star
} from 'lucide-react'

const okrs = [
  {
    id: 1,
    objective: 'Increase Market Share in Enterprise Segment',
    owner: 'Sarah Chen',
    team: 'Sales',
    quarter: 'Q1 2024',
    progress: 68,
    status: 'on-track',
    keyResults: [
      { id: 1, title: 'Close 15 enterprise deals worth $500K+', progress: 80, target: 15, current: 12 },
      { id: 2, title: 'Reduce sales cycle by 20%', progress: 60, target: 20, current: 12 },
      { id: 3, title: 'Achieve 90% customer retention', progress: 65, target: 90, current: 58 },
    ]
  },
  {
    id: 2,
    objective: 'Launch Next-Gen Product Platform',
    owner: 'Mike Johnson',
    team: 'Product',
    quarter: 'Q1 2024',
    progress: 45,
    status: 'at-risk',
    keyResults: [
      { id: 1, title: 'Complete core platform development', progress: 60, target: 100, current: 60 },
      { id: 2, title: 'Achieve 99.9% uptime in beta', progress: 40, target: 99.9, current: 99.2 },
      { id: 3, title: 'Onboard 50 beta customers', progress: 35, target: 50, current: 18 },
    ]
  },
  {
    id: 3,
    objective: 'Build World-Class Engineering Culture',
    owner: 'Emily Davis',
    team: 'Engineering',
    quarter: 'Q1 2024',
    progress: 82,
    status: 'on-track',
    keyResults: [
      { id: 1, title: 'Reduce deployment time to <15 mins', progress: 90, target: 15, current: 12 },
      { id: 2, title: 'Achieve 80% code coverage', progress: 85, target: 80, current: 78 },
      { id: 3, title: 'Complete 100% of tech debt backlog', progress: 70, target: 100, current: 70 },
    ]
  },
  {
    id: 4,
    objective: 'Expand Brand Awareness',
    owner: 'Tom Wilson',
    team: 'Marketing',
    quarter: 'Q1 2024',
    progress: 55,
    status: 'on-track',
    keyResults: [
      { id: 1, title: 'Increase organic traffic by 50%', progress: 60, target: 50, current: 30 },
      { id: 2, title: 'Grow social following to 100K', progress: 55, target: 100000, current: 55000 },
      { id: 3, title: 'Launch 5 thought leadership pieces', progress: 50, target: 5, current: 2 },
    ]
  },
]

const teams = ['All Teams', 'Sales', 'Product', 'Engineering', 'Marketing', 'Customer Success']

export default function OkrsClient() {
  const [activeTab, setActiveTab] = useState('Q1 2024')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('All Teams')
  const [expandedOkr, setExpandedOkr] = useState<number | null>(1)

  const stats = useMemo(() => ({
    totalObjectives: okrs.length,
    onTrack: okrs.filter(o => o.status === 'on-track').length,
    atRisk: okrs.filter(o => o.status === 'at-risk').length,
    avgProgress: Math.round(okrs.reduce((sum, o) => sum + o.progress, 0) / okrs.length),
  }), [])

  const filteredOkrs = useMemo(() => {
    return okrs.filter(okr => {
      const matchesSearch = okr.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           okr.owner.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTeam = selectedTeam === 'All Teams' || okr.team === selectedTeam
      return matchesSearch && matchesTeam
    })
  }, [searchQuery, selectedTeam])

  const getStatusBadge = (status: string) => {
    const styles = {
      'on-track': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'at-risk': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'behind': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'completed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </Badge>
    )
  }

  const insights = [
    { icon: Target, title: `${stats.totalObjectives}`, description: 'Objectives' },
    { icon: TrendingUp, title: `${stats.avgProgress}%`, description: 'Avg Progress' },
    { icon: CheckCircle, title: `${stats.onTrack}`, description: 'On Track' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            OKRs
          </h1>
          <p className="text-muted-foreground mt-1">Objectives and Key Results tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Objective
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="OKR Summary"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objectives</p>
                <p className="text-2xl font-bold">{stats.totalObjectives}</p>
                <p className="text-xs text-muted-foreground mt-1">This quarter</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Key Results</p>
                <p className="text-2xl font-bold">{okrs.reduce((sum, o) => sum + o.keyResults.length, 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Being tracked</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{stats.onTrack}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.onTrack / stats.totalObjectives) * 100)}% of objectives</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{stats.atRisk}</p>
                <p className="text-xs text-yellow-600 mt-1">Needs attention</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="Q4 2023">Q4 2023</TabsTrigger>
            <TabsTrigger value="Q1 2024">Q1 2024</TabsTrigger>
            <TabsTrigger value="Q2 2024">Q2 2024</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search objectives..."
              className="pl-9 w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOkrs.map((okr) => (
          <Card key={okr.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedOkr(expandedOkr === okr.id ? null : okr.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Button variant="ghost" size="icon" className="mt-1">
                    {expandedOkr === okr.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{okr.objective}</h3>
                      {getStatusBadge(okr.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Avatar className="h-5 w-5 mr-1">
                          <AvatarFallback className="text-xs">{okr.owner.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {okr.owner}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {okr.team}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {okr.quarter}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{okr.progress}%</p>
                    <p className="text-xs text-muted-foreground">{okr.keyResults.length} Key Results</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 ml-10">
                <Progress value={okr.progress} className="h-2" />
              </div>
            </div>

            {expandedOkr === okr.id && (
              <div className="border-t bg-muted/20 p-4 pl-14">
                <h4 className="text-sm font-medium mb-3">Key Results</h4>
                <div className="space-y-3">
                  {okr.keyResults.map((kr) => (
                    <div key={kr.id} className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{kr.title}</p>
                        <span className="text-sm font-bold">{kr.progress}%</span>
                      </div>
                      <Progress value={kr.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {kr.current} / {kr.target}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
