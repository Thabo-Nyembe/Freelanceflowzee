'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Target, TrendingUp, Calendar, Search, Plus, CheckCircle,
  Clock, AlertTriangle, Star, Flag, Users, MoreHorizontal,
  ArrowRight, Zap, Trophy, Award, Timer, BarChart3
} from 'lucide-react'

const goals = [
  {
    id: 1,
    title: 'Increase Monthly Revenue',
    description: 'Achieve $100K monthly recurring revenue by Q2',
    category: 'financial',
    priority: 'high',
    progress: 75,
    target: 100000,
    current: 75000,
    unit: '$',
    deadline: '2024-06-30',
    status: 'on-track',
    owner: 'Sarah Chen',
    keyResults: 3,
    completedResults: 2
  },
  {
    id: 2,
    title: 'Expand Customer Base',
    description: 'Acquire 500 new enterprise customers',
    category: 'growth',
    priority: 'high',
    progress: 60,
    target: 500,
    current: 300,
    unit: '',
    deadline: '2024-12-31',
    status: 'on-track',
    owner: 'Mike Johnson',
    keyResults: 4,
    completedResults: 2
  },
  {
    id: 3,
    title: 'Improve Customer Satisfaction',
    description: 'Achieve NPS score of 70+',
    category: 'customer',
    priority: 'medium',
    progress: 85,
    target: 70,
    current: 59,
    unit: '',
    deadline: '2024-03-31',
    status: 'at-risk',
    owner: 'Emily Davis',
    keyResults: 3,
    completedResults: 2
  },
  {
    id: 4,
    title: 'Launch Mobile App',
    description: 'Release v1.0 of mobile application',
    category: 'product',
    priority: 'high',
    progress: 45,
    target: 100,
    current: 45,
    unit: '%',
    deadline: '2024-04-30',
    status: 'behind',
    owner: 'Tom Wilson',
    keyResults: 5,
    completedResults: 2
  },
  {
    id: 5,
    title: 'Reduce Churn Rate',
    description: 'Lower monthly churn to under 2%',
    category: 'customer',
    priority: 'medium',
    progress: 90,
    target: 2,
    current: 2.2,
    unit: '%',
    deadline: '2024-03-31',
    status: 'on-track',
    owner: 'Lisa Park',
    keyResults: 3,
    completedResults: 3
  },
]

const categories = [
  { id: 'all', name: 'All Goals', count: 5 },
  { id: 'financial', name: 'Financial', count: 1 },
  { id: 'growth', name: 'Growth', count: 1 },
  { id: 'customer', name: 'Customer', count: 2 },
  { id: 'product', name: 'Product', count: 1 },
]

export default function GoalsClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const stats = useMemo(() => ({
    totalGoals: goals.length,
    onTrack: goals.filter(g => g.status === 'on-track').length,
    atRisk: goals.filter(g => g.status === 'at-risk').length,
    avgProgress: Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length),
  }), [])

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           goal.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'all' || goal.category === activeTab
      const matchesPriority = priorityFilter === 'all' || goal.priority === priorityFilter
      return matchesSearch && matchesTab && matchesPriority
    })
  }, [searchQuery, activeTab, priorityFilter])

  const getStatusBadge = (status: string) => {
    const styles = {
      'on-track': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'at-risk': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'behind': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'completed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    }
    const icons = {
      'on-track': <CheckCircle className="h-3 w-3 mr-1" />,
      'at-risk': <AlertTriangle className="h-3 w-3 mr-1" />,
      'behind': <Clock className="h-3 w-3 mr-1" />,
      'completed': <Trophy className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant="outline" className={`${styles[status as keyof typeof styles]} flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return (
      <Badge variant="outline" className={styles[priority as keyof typeof styles]}>
        <Flag className="h-3 w-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const insights = [
    { icon: Target, title: `${stats.totalGoals}`, description: 'Active goals' },
    { icon: TrendingUp, title: `${stats.avgProgress}%`, description: 'Avg progress' },
    { icon: CheckCircle, title: `${stats.onTrack}`, description: 'On track' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">Track and achieve your strategic objectives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Goals Overview"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{stats.totalGoals}</p>
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
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{stats.onTrack}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.onTrack / stats.totalGoals) * 100)}% of goals</p>
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <p className="text-xs text-muted-foreground mt-1">Across all goals</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name} ({cat.count})
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search goals..."
                className="pl-9 w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="space-y-4">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        {getStatusBadge(goal.status)}
                        {getPriorityBadge(goal.priority)}
                      </div>
                      <p className="text-muted-foreground">{goal.description}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">
                          {goal.unit === '$' ? `$${goal.current.toLocaleString()}` : goal.current}
                          {' / '}
                          {goal.unit === '$' ? `$${goal.target.toLocaleString()}` : goal.target}
                          {goal.unit === '%' ? '%' : ''}
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {goal.owner}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {goal.deadline}
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {goal.completedResults}/{goal.keyResults} Key Results
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
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
