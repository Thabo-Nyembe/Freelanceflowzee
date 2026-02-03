'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Smile, Heart, Calendar, TrendingUp, Plus, Clock,
  Sun, Cloud, CloudRain, Zap, Coffee, Moon, Star,
  Activity, BarChart3, Sparkles, Frown, Meh
} from 'lucide-react'

const moodHistory = [
  { date: '2024-01-15', mood: 'great', score: 9, note: 'Productive day, completed all tasks', factors: ['exercise', 'good sleep'] },
  { date: '2024-01-14', mood: 'good', score: 7, note: 'Steady day, some challenges but managed well', factors: ['work', 'social'] },
  { date: '2024-01-13', mood: 'okay', score: 5, note: 'Felt a bit tired, need more rest', factors: ['poor sleep'] },
  { date: '2024-01-12', mood: 'great', score: 8, note: 'Weekend relaxation helped', factors: ['rest', 'family'] },
  { date: '2024-01-11', mood: 'good', score: 7, note: 'Normal work day', factors: ['work'] },
  { date: '2024-01-10', mood: 'low', score: 4, note: 'Stressful meeting, need to decompress', factors: ['stress', 'work'] },
  { date: '2024-01-09', mood: 'good', score: 7, note: 'Good progress on project', factors: ['achievement'] },
]

const moodOptions = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-500', score: 9 },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-500', score: 7 },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-500', score: 5 },
  { value: 'low', label: 'Low', emoji: '😔', color: 'bg-orange-500', score: 3 },
  { value: 'bad', label: 'Bad', emoji: '😢', color: 'bg-red-500', score: 1 },
]

const factorOptions = [
  { id: 'exercise', label: 'Exercise', icon: Activity },
  { id: 'good sleep', label: 'Good Sleep', icon: Moon },
  { id: 'poor sleep', label: 'Poor Sleep', icon: CloudRain },
  { id: 'work', label: 'Work', icon: Zap },
  { id: 'social', label: 'Social', icon: Heart },
  { id: 'stress', label: 'Stress', icon: Cloud },
  { id: 'family', label: 'Family', icon: Heart },
  { id: 'rest', label: 'Rest', icon: Coffee },
  { id: 'achievement', label: 'Achievement', icon: Star },
]

export default function MoodClient() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [activeView, setActiveView] = useState('log')

  const stats = useMemo(() => {
    const avgScore = moodHistory.reduce((sum, m) => sum + m.score, 0) / moodHistory.length
    const greatDays = moodHistory.filter(m => m.mood === 'great' || m.mood === 'good').length
    return {
      avgScore: avgScore.toFixed(1),
      streak: 7,
      greatDays,
      totalLogs: moodHistory.length,
    }
  }, [])

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId)
        ? prev.filter(f => f !== factorId)
        : [...prev, factorId]
    )
  }

  const getMoodData = (mood: string) => {
    return moodOptions.find(m => m.value === mood)
  }

  const insights = [
    { icon: Smile, title: `${stats.avgScore}`, description: 'Avg mood score' },
    { icon: TrendingUp, title: `${stats.greatDays}`, description: 'Great days' },
    { icon: Calendar, title: `${stats.streak}`, description: 'Day streak' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smile className="h-8 w-8 text-primary" />
            Mood Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Track your emotional well-being over time</p>
        </div>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Insights
        </Button>
      </div>

      <CollapsibleInsightsPanel
        title="Mood Overview"
        insights={insights}
        defaultExpanded={true}
      />

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList>
          <TabsTrigger value="log">Log Mood</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>How are you feeling?</CardTitle>
                <CardDescription>Select your current mood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4 mb-8">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                        selectedMood === mood.value
                          ? 'bg-primary/10 border-2 border-primary scale-110'
                          : 'hover:bg-muted border-2 border-transparent'
                      }`}
                    >
                      <span className="text-4xl mb-2">{mood.emoji}</span>
                      <span className="text-sm font-medium">{mood.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">What factors affected your mood?</h4>
                  <div className="flex flex-wrap gap-2">
                    {factorOptions.map((factor) => {
                      const Icon = factor.icon
                      return (
                        <Button
                          key={factor.id}
                          variant={selectedFactors.includes(factor.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleFactor(factor.id)}
                        >
                          <Icon className="h-4 w-4 mr-1" />
                          {factor.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">Add a note (optional)</h4>
                  <Textarea
                    placeholder="How was your day? What happened?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button className="w-full" disabled={!selectedMood}>
                  <Plus className="h-4 w-4 mr-2" />
                  Save Mood Entry
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your mood over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodHistory.slice(0, 5).map((entry, idx) => {
                    const moodData = getMoodData(entry.mood)
                    return (
                      <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="text-center">
                          <span className="text-2xl">{moodData?.emoji}</span>
                          <p className="text-xs text-muted-foreground mt-1">{entry.date.slice(5)}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{entry.mood}</span>
                            <Badge variant="outline">{entry.score}/10</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.factors.map((factor) => (
                              <Badge key={factor} variant="secondary" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood History</CardTitle>
              <CardDescription>View all your mood entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                {moodHistory.map((entry, idx) => {
                  const moodData = getMoodData(entry.mood)
                  return (
                    <div
                      key={idx}
                      className="flex-1 text-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    >
                      <span className="text-2xl">{moodData?.emoji}</span>
                      <p className="text-xs text-muted-foreground mt-1">{entry.date.slice(8)}</p>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-3">
                {moodHistory.map((entry, idx) => {
                  const moodData = getMoodData(entry.mood)
                  return (
                    <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                      <span className="text-3xl">{moodData?.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entry.date}</span>
                          <Badge className={moodData?.color}>{entry.score}/10</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{entry.note}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>How often you feel each mood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodOptions.map((mood) => {
                    const count = moodHistory.filter(m => m.mood === mood.value).length
                    const percentage = (count / moodHistory.length) * 100
                    return (
                      <div key={mood.value} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{mood.emoji}</span>
                            {mood.label}
                          </span>
                          <span>{count} days ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contributing Factors</CardTitle>
                <CardDescription>What impacts your mood most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {factorOptions.slice(0, 6).map((factor) => {
                    const count = moodHistory.filter(m => m.factors.includes(factor.id)).length
                    const Icon = factor.icon
                    return (
                      <div key={factor.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{factor.label}</span>
                        </div>
                        <Badge variant="secondary">{count} times</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
