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
  BookOpen, PenLine, Calendar, Search, Plus, Star,
  Tag, Clock, MoreHorizontal, Trash2, Lock, Unlock,
  Sparkles, Heart, Brain, Sun, Moon, FileText, Filter
} from 'lucide-react'

const journals = [
  {
    id: 1,
    title: 'Morning Reflections',
    content: 'Started the day with a clear mind. The morning meditation helped me focus on what matters most. Feeling grateful for the opportunity to work on meaningful projects...',
    date: '2024-01-15',
    time: '07:30 AM',
    mood: 'peaceful',
    tags: ['morning', 'gratitude', 'meditation'],
    isPrivate: true,
    isFavorite: true,
    wordCount: 250
  },
  {
    id: 2,
    title: 'Project Breakthrough',
    content: 'Finally solved the complex algorithm issue that was blocking progress. The solution came to me during my afternoon walk. Sometimes stepping away is the best approach...',
    date: '2024-01-14',
    time: '04:15 PM',
    mood: 'excited',
    tags: ['work', 'achievement', 'problem-solving'],
    isPrivate: false,
    isFavorite: true,
    wordCount: 180
  },
  {
    id: 3,
    title: 'Weekly Review',
    content: 'Looking back at this week, I accomplished more than expected. Key wins: completed 3 major tasks, improved team communication, and started a new habit...',
    date: '2024-01-12',
    time: '06:00 PM',
    mood: 'satisfied',
    tags: ['review', 'productivity', 'goals'],
    isPrivate: true,
    isFavorite: false,
    wordCount: 420
  },
  {
    id: 4,
    title: 'Learning Journey',
    content: 'Spent the day exploring new technologies. The learning curve is steep but exciting. Made notes about potential applications for our current projects...',
    date: '2024-01-11',
    time: '09:00 PM',
    mood: 'curious',
    tags: ['learning', 'technology', 'growth'],
    isPrivate: false,
    isFavorite: false,
    wordCount: 320
  },
  {
    id: 5,
    title: 'Mindfulness Practice',
    content: 'Today I focused on being present. Noticed how often my mind wanders to future worries. The practice of bringing attention back to the present moment is powerful...',
    date: '2024-01-10',
    time: '08:45 AM',
    mood: 'calm',
    tags: ['mindfulness', 'present', 'awareness'],
    isPrivate: true,
    isFavorite: true,
    wordCount: 275
  },
]

const moodOptions = [
  { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
  { value: 'excited', label: 'Excited', emoji: '🎉' },
  { value: 'satisfied', label: 'Satisfied', emoji: '😊' },
  { value: 'curious', label: 'Curious', emoji: '🤔' },
  { value: 'calm', label: 'Calm', emoji: '🧘' },
  { value: 'grateful', label: 'Grateful', emoji: '🙏' },
]

export default function JournalsClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJournal, setSelectedJournal] = useState<number | null>(1)
  const [isWriting, setIsWriting] = useState(false)

  const stats = useMemo(() => ({
    totalEntries: journals.length,
    thisWeek: journals.filter(j => new Date(j.date) >= new Date('2024-01-09')).length,
    totalWords: journals.reduce((sum, j) => sum + j.wordCount, 0),
    streak: 7,
  }), [])

  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesSearch = journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           journal.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           journal.tags.some(t => t.includes(searchQuery.toLowerCase()))
      const matchesTab = activeTab === 'all' ||
                        (activeTab === 'favorites' && journal.isFavorite) ||
                        (activeTab === 'private' && journal.isPrivate)
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  const getMoodEmoji = (mood: string) => {
    const found = moodOptions.find(m => m.value === mood)
    return found?.emoji || '😊'
  }

  const insights = [
    { icon: BookOpen, title: `${stats.totalEntries}`, description: 'Total entries' },
    { icon: PenLine, title: `${stats.totalWords}`, description: 'Words written' },
    { icon: Calendar, title: `${stats.streak}`, description: 'Day streak' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Journal
          </h1>
          <p className="text-muted-foreground mt-1">Capture your thoughts, ideas, and reflections</p>
        </div>
        <Button onClick={() => setIsWriting(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      <CollapsibleInsightsPanel
        title="Writing Stats"
        insights={insights}
        defaultExpanded={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Entries</CardTitle>
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="favorites" className="flex-1">
                    <Star className="h-3 w-3 mr-1" />
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger value="private" className="flex-1">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredJournals.map((journal) => (
                  <div
                    key={journal.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedJournal === journal.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedJournal(journal.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{getMoodEmoji(journal.mood)}</span>
                        <h4 className="font-medium text-sm truncate">{journal.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        {journal.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        {journal.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {journal.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{journal.date}</span>
                      <span>{journal.wordCount} words</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isWriting ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Entry title..."
                    className="text-xl font-semibold border-0 p-0 focus-visible:ring-0"
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsWriting(false)}>
                      Cancel
                    </Button>
                    <Button size="sm">
                      Save Entry
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {moodOptions.map((mood) => (
                    <Button key={mood.value} variant="outline" size="sm">
                      {mood.emoji} {mood.label}
                    </Button>
                  ))}
                </div>
                <Textarea
                  placeholder="Start writing your thoughts..."
                  className="min-h-[400px] resize-none"
                />
                <div className="flex items-center gap-2 mt-4">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Add tags (comma separated)" className="flex-1" />
                </div>
              </CardContent>
            </Card>
          ) : selectedJournal ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getMoodEmoji(journals.find(j => j.id === selectedJournal)?.mood || '')}</span>
                      <h2 className="text-2xl font-bold">
                        {journals.find(j => j.id === selectedJournal)?.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {journals.find(j => j.id === selectedJournal)?.date}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {journals.find(j => j.id === selectedJournal)?.time}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {journals.find(j => j.id === selectedJournal)?.wordCount} words
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Star className={`h-4 w-4 ${journals.find(j => j.id === selectedJournal)?.isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      {journals.find(j => j.id === selectedJournal)?.isPrivate ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-lg leading-relaxed">
                    {journals.find(j => j.id === selectedJournal)?.content}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {journals.find(j => j.id === selectedJournal)?.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an entry</h3>
                <p className="text-muted-foreground mb-4">Choose an entry from the list to view</p>
                <Button onClick={() => setIsWriting(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Write New Entry
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
