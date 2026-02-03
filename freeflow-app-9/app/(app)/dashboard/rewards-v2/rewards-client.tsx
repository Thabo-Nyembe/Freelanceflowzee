'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Award, Plus, Search, Star, TrendingUp, Gift, Users, Trophy } from 'lucide-react'

const myRewards = {
  totalPoints: 2450,
  tier: 'Gold',
  nextTier: 'Platinum',
  pointsToNextTier: 550,
  lifetimePoints: 5200,
}

const availableRewards = [
  { id: 1, name: 'Extra Day Off', points: 500, category: 'Time Off', available: 10, redeemed: 45, icon: '🏖️' },
  { id: 2, name: '$50 Amazon Gift Card', points: 500, category: 'Gift Cards', available: 25, redeemed: 120, icon: '🎁' },
  { id: 3, name: 'Premium Parking Spot (1 Month)', points: 300, category: 'Perks', available: 5, redeemed: 30, icon: '🅿️' },
  { id: 4, name: 'Company Swag Pack', points: 200, category: 'Merchandise', available: 50, redeemed: 80, icon: '👕' },
  { id: 5, name: 'Professional Development Course', points: 1000, category: 'Learning', available: 15, redeemed: 25, icon: '📚' },
  { id: 6, name: 'Team Lunch Budget ($200)', points: 800, category: 'Team Events', available: 8, redeemed: 15, icon: '🍽️' },
]

const recentActivity = [
  { id: 1, action: 'Earned 50 points', reason: 'Completed project milestone', date: '2024-02-01', points: 50 },
  { id: 2, action: 'Redeemed reward', reason: 'Company Swag Pack', date: '2024-01-28', points: -200 },
  { id: 3, action: 'Earned 100 points', reason: 'Employee of the Month', date: '2024-01-25', points: 100 },
  { id: 4, action: 'Earned 25 points', reason: 'Peer recognition', date: '2024-01-20', points: 25 },
]

const leaderboard = [
  { id: 1, name: 'Sarah Chen', points: 3200, tier: 'Platinum', rank: 1 },
  { id: 2, name: 'Mike Johnson', points: 2850, tier: 'Gold', rank: 2 },
  { id: 3, name: 'You', points: 2450, tier: 'Gold', rank: 3 },
  { id: 4, name: 'Emily Davis', points: 2100, tier: 'Gold', rank: 4 },
  { id: 5, name: 'Tom Wilson', points: 1950, tier: 'Silver', rank: 5 },
]

export default function RewardsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = ['all', ...new Set(availableRewards.map(r => r.category))]

  const filteredRewards = useMemo(() => availableRewards.filter(r =>
    (categoryFilter === 'all' || r.category === categoryFilter) &&
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery, categoryFilter])

  const getTierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      Platinum: 'bg-purple-100 text-purple-700',
      Gold: 'bg-yellow-100 text-yellow-700',
      Silver: 'bg-gray-100 text-gray-700',
      Bronze: 'bg-orange-100 text-orange-700',
    }
    return <Badge className={styles[tier]}>{tier}</Badge>
  }

  const insights = [
    { icon: Star, title: `${myRewards.totalPoints}`, description: 'Available points' },
    { icon: Trophy, title: myRewards.tier, description: 'Current tier' },
    { icon: TrendingUp, title: `${myRewards.pointsToNextTier}`, description: 'Points to next tier' },
    { icon: Award, title: `${myRewards.lifetimePoints}`, description: 'Lifetime points' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Award className="h-8 w-8 text-primary" />Rewards Program</h1>
          <p className="text-muted-foreground mt-1">Earn points and redeem rewards</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="My Rewards" insights={insights} defaultExpanded={true} />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Progress to {myRewards.nextTier}</h3>
              <p className="text-sm text-muted-foreground">{myRewards.pointsToNextTier} more points needed</p>
            </div>
            {getTierBadge(myRewards.tier)}
          </div>
          <Progress value={(myRewards.totalPoints / (myRewards.totalPoints + myRewards.pointsToNextTier)) * 100} className="h-3" />
        </CardContent>
      </Card>

      <Tabs defaultValue="redeem">
        <TabsList>
          <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="redeem" className="space-y-4 mt-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rewards..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRewards.map((reward) => {
              const canAfford = myRewards.totalPoints >= reward.points
              return (
                <Card key={reward.id} className={!canAfford ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="text-4xl mb-3">{reward.icon}</div>
                    <h4 className="font-semibold mb-2">{reward.name}</h4>
                    <Badge variant="outline" className="mb-3">{reward.category}</Badge>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points:</span>
                        <span className="font-bold text-primary">{reward.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span>{reward.available}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Redeemed:</span>
                        <span>{reward.redeemed}x</span>
                      </div>
                    </div>

                    <Button className="w-full" disabled={!canAfford || reward.available === 0}>
                      {!canAfford ? `Need ${reward.points - myRewards.totalPoints} more points` : reward.available === 0 ? 'Out of Stock' : 'Redeem'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{activity.action}</h4>
                        <p className="text-sm text-muted-foreground">{activity.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                      </div>
                      <Badge variant={activity.points > 0 ? 'default' : 'outline'} className={activity.points > 0 ? 'bg-green-100 text-green-700' : ''}>
                        {activity.points > 0 ? '+' : ''}{activity.points}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                          {getTierBadge(entry.tier)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{entry.points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
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
