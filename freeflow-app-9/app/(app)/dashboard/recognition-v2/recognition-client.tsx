'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Heart, Plus, Search, Award, TrendingUp, Users, Star } from 'lucide-react'

const recognitions = [
  { id: 1, from: 'Sarah Chen', to: 'Mike Johnson', badge: 'Team Player', message: 'Thanks for helping with the presentation!', date: '2024-02-03', points: 10 },
  { id: 2, from: 'Tom Wilson', to: 'You', badge: 'Problem Solver', message: 'Great job fixing that critical bug!', date: '2024-02-02', points: 15 },
  { id: 3, from: 'Emily Davis', to: 'Sarah Chen', badge: 'Innovation', message: 'Love your creative approach to the project', date: '2024-02-01', points: 20 },
  { id: 4, from: 'Mike Johnson', to: 'Lisa Park', badge: 'Mentor', message: 'Thank you for guiding me through onboarding', date: '2024-01-30', points: 10 },
  { id: 5, from: 'You', to: 'Tom Wilson', badge: 'Team Player', message: 'Always willing to help the team', date: '2024-01-28', points: 10 },
]

const badges = [
  { id: 1, name: 'Team Player', description: 'Goes above and beyond to help teammates', icon: '🤝', count: 12, points: 10 },
  { id: 2, name: 'Innovation', description: 'Brings creative solutions to problems', icon: '💡', count: 8, points: 20 },
  { id: 3, name: 'Problem Solver', description: 'Tackles difficult challenges head-on', icon: '🎯', count: 15, points: 15 },
  { id: 4, name: 'Mentor', description: 'Helps others grow and develop', icon: '🌟', count: 6, points: 10 },
  { id: 5, name: 'Customer Champion', description: 'Puts customers first', icon: '🏆', count: 10, points: 15 },
  { id: 6, name: 'Quality Focus', description: 'Maintains high standards', icon: '✨', count: 9, points: 10 },
]

const leaderboard = [
  { id: 1, name: 'Mike Johnson', received: 45, given: 38, rank: 1 },
  { id: 2, name: 'Sarah Chen', received: 42, given: 40, rank: 2 },
  { id: 3, name: 'You', received: 35, given: 32, rank: 3 },
  { id: 4, name: 'Emily Davis', received: 30, given: 28, rank: 4 },
  { id: 5, name: 'Tom Wilson', received: 28, given: 25, rank: 5 },
]

const myStats = {
  received: 35,
  given: 32,
  totalPoints: 420,
  topBadge: 'Problem Solver',
}

export default function RecognitionClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalRecognitions: recognitions.length,
    receivedToday: recognitions.filter(r => r.date === '2024-02-03').length,
    givenThisWeek: recognitions.filter(r => r.from === 'You').length,
    trending: badges[0].name,
  }), [])

  const insights = [
    { icon: Heart, title: `${myStats.received}`, description: 'Received' },
    { icon: Award, title: `${myStats.given}`, description: 'Given' },
    { icon: Star, title: `${myStats.totalPoints}`, description: 'Points earned' },
    { icon: TrendingUp, title: myStats.topBadge, description: 'Top badge' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="h-8 w-8 text-primary" />Recognition</h1>
          <p className="text-muted-foreground mt-1">Celebrate and recognize team members</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Give Recognition</Button>
      </div>

      <CollapsibleInsightsPanel title="My Recognition Stats" insights={insights} defaultExpanded={true} />

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Recognition Feed</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4 mt-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search recognitions..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="space-y-3">
            {recognitions.map((recognition) => (
              <Card key={recognition.id} className={recognition.to === 'You' ? 'border-blue-200 bg-blue-50/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{recognition.from.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{recognition.from}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{recognition.to}</span>
                        <Badge variant="outline" className="ml-2">{recognition.badge}</Badge>
                      </div>

                      <p className="text-sm mb-2">{recognition.message}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{recognition.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {recognition.points} points
                        </span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id}>
                <CardContent className="p-4 text-center">
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h4 className="font-semibold mb-1">{badge.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>

                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div>
                      <p className="font-bold text-lg">{badge.count}</p>
                      <p className="text-xs text-muted-foreground">Given</p>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{badge.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {leaderboard.map((entry) => (
                  <div key={entry.id} className={`p-4 hover:bg-muted/50 ${entry.name === 'You' ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {entry.rank}
                        </div>
                        <div>
                          <h4 className="font-medium">{entry.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {entry.received} received • {entry.given} given
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.received + entry.given}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
