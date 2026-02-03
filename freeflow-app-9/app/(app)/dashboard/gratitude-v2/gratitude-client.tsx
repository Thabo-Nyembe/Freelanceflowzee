'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Heart, Plus, Calendar, Star, Sparkles, Sun, Users,
  Home, Briefcase, Smile, Coffee, BookOpen, Clock,
  TrendingUp, Award, Camera, Quote, ArrowRight
} from 'lucide-react'

const gratitudeEntries = [
  {
    id: 1,
    date: '2024-01-15',
    items: [
      'Morning coffee with a beautiful sunrise',
      'Supportive team at work who helped with the project',
      'A good night\'s sleep after a busy week'
    ],
    category: 'daily',
    mood: 'grateful'
  },
  {
    id: 2,
    date: '2024-01-14',
    items: [
      'Family dinner with everyone together',
      'Progress on personal goals',
      'A kind message from an old friend'
    ],
    category: 'daily',
    mood: 'happy'
  },
  {
    id: 3,
    date: '2024-01-13',
    items: [
      'Health and ability to exercise',
      'Access to learning resources',
      'Comfortable home'
    ],
    category: 'daily',
    mood: 'content'
  },
  {
    id: 4,
    date: '2024-01-12',
    items: [
      'Weekend time to recharge',
      'Good book I started reading',
      'Nature walk in the park'
    ],
    category: 'daily',
    mood: 'peaceful'
  },
]

const categories = [
  { id: 'people', name: 'People', icon: Users },
  { id: 'work', name: 'Work', icon: Briefcase },
  { id: 'health', name: 'Health', icon: Heart },
  { id: 'home', name: 'Home', icon: Home },
  { id: 'experiences', name: 'Experiences', icon: Sparkles },
  { id: 'simple', name: 'Simple Things', icon: Coffee },
]

const prompts = [
  'What made you smile today?',
  'Who are you thankful for and why?',
  'What small moment brought you joy?',
  'What ability or skill are you grateful for?',
  'What challenge helped you grow recently?',
  'What about your environment are you thankful for?'
]

export default function GratitudeClient() {
  const [activeTab, setActiveTab] = useState('today')
  const [newItems, setNewItems] = useState(['', '', ''])
  const [currentPrompt, setCurrentPrompt] = useState(0)

  const stats = useMemo(() => ({
    totalEntries: gratitudeEntries.length,
    totalItems: gratitudeEntries.reduce((sum, e) => sum + e.items.length, 0),
    streak: 4,
    thisWeek: gratitudeEntries.length,
  }), [])

  const updateItem = (index: number, value: string) => {
    const updated = [...newItems]
    updated[index] = value
    setNewItems(updated)
  }

  const addNewItem = () => {
    setNewItems([...newItems, ''])
  }

  const nextPrompt = () => {
    setCurrentPrompt((prev) => (prev + 1) % prompts.length)
  }

  const insights = [
    { icon: Heart, title: `${stats.totalItems}`, description: 'Things grateful for' },
    { icon: Calendar, title: `${stats.streak}`, description: 'Day streak' },
    { icon: TrendingUp, title: `${stats.thisWeek}`, description: 'Entries this week' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Gratitude Journal
          </h1>
          <p className="text-muted-foreground mt-1">Practice daily gratitude and mindfulness</p>
        </div>
        <Button variant="outline">
          <Camera className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      <CollapsibleInsightsPanel
        title="Gratitude Stats"
        insights={insights}
        defaultExpanded={true}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Today&apos;s Gratitude
                </CardTitle>
                <CardDescription>
                  Write down 3 things you&apos;re grateful for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                        {idx + 1}
                      </div>
                      <Textarea
                        placeholder={`I'm grateful for...`}
                        value={item}
                        onChange={(e) => updateItem(idx, e.target.value)}
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={addNewItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another
                  </Button>
                </div>
                <div className="mt-6">
                  <Button className="w-full" disabled={newItems.every(i => !i.trim())}>
                    <Heart className="h-4 w-4 mr-2" />
                    Save Today&apos;s Gratitude
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-900">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-purple-500 mb-4" />
                  <p className="text-lg font-medium italic mb-4">
                    &ldquo;{prompts[currentPrompt]}&rdquo;
                  </p>
                  <Button variant="ghost" size="sm" onClick={nextPrompt}>
                    Next Prompt
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <Button key={cat.id} variant="outline" className="flex-col h-auto py-3">
                          <Icon className="h-5 w-5 mb-1" />
                          <span className="text-xs">{cat.name}</span>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500" />
                    Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats.streak} days</p>
                      <p className="text-sm text-muted-foreground">Keep it going!</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            i < stats.streak
                              ? 'bg-green-500 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          {i < stats.streak && <Heart className="h-3 w-3" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-4">
            {gratitudeEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{entry.date}</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {entry.mood}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {entry.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Heart className="h-4 w-4 text-pink-500 mt-1 flex-shrink-0" />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt, idx) => (
              <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-medium">{prompt}</p>
                  <Button variant="ghost" size="sm" className="mt-4">
                    Use This Prompt
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
