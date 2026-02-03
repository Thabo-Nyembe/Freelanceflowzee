'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Repeat, Flame, Target, Calendar, CheckCircle, Plus,
  Search, Clock, Trophy, Star, Zap, Heart, Brain,
  Dumbbell, BookOpen, Coffee, Moon, Sun, MoreHorizontal,
  TrendingUp, Award, Sparkles
} from 'lucide-react'

const habits = [
  {
    id: 1,
    name: 'Morning Meditation',
    icon: Brain,
    category: 'mindfulness',
    frequency: 'daily',
    currentStreak: 12,
    bestStreak: 30,
    completedToday: true,
    completedThisWeek: [true, true, true, true, true, false, false],
    totalCompletions: 156,
    goal: 30,
    color: 'purple'
  },
  {
    id: 2,
    name: 'Exercise',
    icon: Dumbbell,
    category: 'health',
    frequency: 'daily',
    currentStreak: 8,
    bestStreak: 45,
    completedToday: false,
    completedThisWeek: [true, true, false, true, true, true, false],
    totalCompletions: 234,
    goal: 30,
    color: 'green'
  },
  {
    id: 3,
    name: 'Read for 30 mins',
    icon: BookOpen,
    category: 'learning',
    frequency: 'daily',
    currentStreak: 5,
    bestStreak: 21,
    completedToday: true,
    completedThisWeek: [true, false, true, true, true, false, false],
    totalCompletions: 89,
    goal: 30,
    color: 'blue'
  },
  {
    id: 4,
    name: 'No Coffee After 2pm',
    icon: Coffee,
    category: 'health',
    frequency: 'daily',
    currentStreak: 3,
    bestStreak: 14,
    completedToday: true,
    completedThisWeek: [true, true, true, false, true, true, true],
    totalCompletions: 45,
    goal: 30,
    color: 'orange'
  },
  {
    id: 5,
    name: 'Sleep by 11pm',
    icon: Moon,
    category: 'health',
    frequency: 'daily',
    currentStreak: 0,
    bestStreak: 10,
    completedToday: false,
    completedThisWeek: [false, true, false, true, false, true, false],
    totalCompletions: 67,
    goal: 30,
    color: 'indigo'
  },
  {
    id: 6,
    name: 'Weekly Review',
    icon: Target,
    category: 'productivity',
    frequency: 'weekly',
    currentStreak: 6,
    bestStreak: 12,
    completedToday: false,
    completedThisWeek: [false, false, false, false, false, false, true],
    totalCompletions: 24,
    goal: 12,
    color: 'pink'
  },
]

const categories = [
  { id: 'all', name: 'All Habits' },
  { id: 'health', name: 'Health' },
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'learning', name: 'Learning' },
  { id: 'productivity', name: 'Productivity' },
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function HabitsClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [habitStates, setHabitStates] = useState(
    habits.reduce((acc, h) => ({ ...acc, [h.id]: h.completedToday }), {})
  )

  const stats = useMemo(() => ({
    totalHabits: habits.length,
    completedToday: habits.filter(h => habitStates[h.id as keyof typeof habitStates]).length,
    longestStreak: Math.max(...habits.map(h => h.currentStreak)),
    totalCompletions: habits.reduce((sum, h) => sum + h.totalCompletions, 0),
  }), [habitStates])

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'all' || habit.category === activeTab
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  const toggleHabit = (habitId: number) => {
    setHabitStates(prev => ({
      ...prev,
      [habitId]: !prev[habitId as keyof typeof prev]
    }))
  }

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
    }
    return colors[color] || colors.blue
  }

  const insights = [
    { icon: CheckCircle, title: `${stats.completedToday}/${stats.totalHabits}`, description: 'Done today' },
    { icon: Flame, title: `${stats.longestStreak}`, description: 'Day streak' },
    { icon: Trophy, title: `${stats.totalCompletions}`, description: 'Total completions' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Repeat className="h-8 w-8 text-primary" />
            Habits
          </h1>
          <p className="text-muted-foreground mt-1">Build positive habits and track your progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Habit Stats"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Progress</p>
                <p className="text-2xl font-bold">{stats.completedToday}/{stats.totalHabits}</p>
                <Progress value={(stats.completedToday / stats.totalHabits) * 100} className="h-2 mt-2" />
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
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.longestStreak} days</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <Flame className="h-3 w-3 mr-1" />
                  Keep it going!
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {habits.reduce((sum, h) => sum + h.completedThisWeek.filter(Boolean).length, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Completions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Time</p>
                <p className="text-2xl font-bold">{stats.totalCompletions}</p>
                <p className="text-xs text-muted-foreground mt-1">Total completions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            className="pl-9 w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHabits.map((habit) => {
          const Icon = habit.icon
          const isCompleted = habitStates[habit.id as keyof typeof habitStates]
          return (
            <Card key={habit.id} className={`transition-all ${isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getColorClass(habit.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{habit.name}</h3>
                        {habit.currentStreak >= 7 && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-700">
                            <Flame className="h-3 w-3 mr-1" />
                            {habit.currentStreak}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{habit.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleHabit(habit.id)}
                      className={isCompleted ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Done
                        </>
                      ) : (
                        'Mark Complete'
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">This Week</p>
                  <div className="flex gap-1">
                    {habit.completedThisWeek.map((completed, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div
                          className={`h-8 w-full rounded ${
                            completed
                              ? 'bg-green-500'
                              : idx < 5
                              ? 'bg-red-200 dark:bg-red-900/30'
                              : 'bg-gray-200 dark:bg-gray-800'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{weekDays[idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Flame className="h-4 w-4 mr-1 text-orange-500" />
                    {habit.currentStreak} day streak
                  </span>
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                    Best: {habit.bestStreak} days
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
