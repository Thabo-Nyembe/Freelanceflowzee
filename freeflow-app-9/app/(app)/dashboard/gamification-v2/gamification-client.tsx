'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Trophy, Star, Zap, Target, Award, Crown, Medal, Flame,
  TrendingUp, Gift, Sparkles, Users, Calendar, Clock,
  CheckCircle2, Lock, Unlock, ArrowUp, Heart, ThumbsUp,
  MessageSquare, Share2, Eye, Download, Play, Pause
} from 'lucide-react'

// Demo data
const demoUserStats = {
  level: 12,
  xp: 8450,
  xpToNext: 10000,
  totalPoints: 24500,
  rank: 3,
  streak: 15,
  badges: 28,
  challenges: 45,
}

const demoBadges = [
  { id: '1', name: 'Early Adopter', icon: '🚀', description: 'Joined in the first month', earned: true, rarity: 'legendary' },
  { id: '2', name: 'Project Master', icon: '📊', description: 'Complete 50 projects', earned: true, rarity: 'epic' },
  { id: '3', name: 'Client Favorite', icon: '⭐', description: '10 five-star reviews', earned: true, rarity: 'rare' },
  { id: '4', name: 'Speed Demon', icon: '⚡', description: 'Complete task in under 1 hour', earned: true, rarity: 'common' },
  { id: '5', name: 'Team Player', icon: '🤝', description: 'Collaborate with 20 users', earned: true, rarity: 'rare' },
  { id: '6', name: 'Revenue King', icon: '💰', description: 'Earn $100K in revenue', earned: false, rarity: 'legendary', progress: 75 },
  { id: '7', name: 'Perfect Week', icon: '🎯', description: '7-day completion streak', earned: true, rarity: 'epic' },
  { id: '8', name: 'Night Owl', icon: '🦉', description: 'Work after midnight 10 times', earned: false, rarity: 'common', progress: 60 },
]

const demoChallenges = [
  { id: '1', name: 'Complete 5 tasks today', reward: 500, progress: 3, target: 5, type: 'daily', expires: '23h 45m' },
  { id: '2', name: 'Send 3 invoices', reward: 300, progress: 2, target: 3, type: 'daily', expires: '23h 45m' },
  { id: '3', name: 'Get a 5-star review', reward: 1000, progress: 0, target: 1, type: 'weekly', expires: '5d 12h' },
  { id: '4', name: 'Complete 20 projects', reward: 5000, progress: 18, target: 20, type: 'monthly', expires: '12d' },
  { id: '5', name: 'Reach $10K revenue', reward: 2500, progress: 8500, target: 10000, type: 'monthly', expires: '12d' },
]

const demoLeaderboard = [
  { rank: 1, name: 'Sarah Chen', avatar: '/avatars/sarah.jpg', points: 45200, level: 18, streak: 32 },
  { rank: 2, name: 'Mike Johnson', avatar: '/avatars/mike.jpg', points: 38900, level: 16, streak: 28 },
  { rank: 3, name: 'You', avatar: '/avatars/you.jpg', points: 24500, level: 12, streak: 15, isCurrentUser: true },
  { rank: 4, name: 'Emma Wilson', avatar: '/avatars/emma.jpg', points: 22100, level: 11, streak: 12 },
  { rank: 5, name: 'Alex Kim', avatar: '/avatars/alex.jpg', points: 19800, level: 10, streak: 8 },
  { rank: 6, name: 'Chris Brown', avatar: '/avatars/chris.jpg', points: 17500, level: 9, streak: 5 },
  { rank: 7, name: 'Jordan Lee', avatar: '/avatars/jordan.jpg', points: 15200, level: 8, streak: 3 },
]

const demoRewards = [
  { id: '1', name: 'Premium Theme Pack', cost: 5000, type: 'cosmetic', available: true },
  { id: '2', name: '1 Month Pro Upgrade', cost: 15000, type: 'subscription', available: true },
  { id: '3', name: 'Priority Support', cost: 8000, type: 'service', available: true },
  { id: '4', name: 'Custom Badge', cost: 3000, type: 'cosmetic', available: true },
  { id: '5', name: 'Feature Request Vote', cost: 10000, type: 'influence', available: false },
]

export default function GamificationClient() {
  const [activeTab, setActiveTab] = useState('overview')

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-400 to-pink-500'
      case 'rare': return 'from-blue-400 to-cyan-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gamification Hub
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Level up, earn rewards, and compete with others
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-2">
              <Flame className="w-4 h-4 mr-2" />
              {demoUserStats.streak} Day Streak
            </Badge>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Crown className="w-8 h-8 opacity-80" />
                <Badge variant="secondary" className="bg-white/20 text-white border-0">Level {demoUserStats.level}</Badge>
              </div>
              <div className="text-3xl font-bold mb-2">{demoUserStats.xp.toLocaleString()} XP</div>
              <Progress value={(demoUserStats.xp / demoUserStats.xpToNext) * 100} className="h-2 bg-white/20" />
              <p className="text-purple-100 text-sm mt-2">{demoUserStats.xpToNext - demoUserStats.xp} XP to Level {demoUserStats.level + 1}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
                <Badge variant="outline" className="border-yellow-200 text-yellow-600">Points</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{demoUserStats.totalPoints.toLocaleString()}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Total Points Earned</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Medal className="w-8 h-8 text-amber-500" />
                <Badge variant="outline" className="border-amber-200 text-amber-600">Rank #{demoUserStats.rank}</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{demoUserStats.badges}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Badges Earned</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-green-500" />
                <Badge variant="outline" className="border-green-200 text-green-600">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{demoUserStats.challenges}</div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Challenges Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Challenges */}
              <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Active Challenges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoChallenges.slice(0, 3).map((challenge) => (
                      <div key={challenge.id} className="p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{challenge.name}</p>
                            <p className="text-sm text-slate-500">Expires in {challenge.expires}</p>
                          </div>
                          <Badge className={challenge.type === 'daily' ? 'bg-blue-100 text-blue-700' : challenge.type === 'weekly' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}>
                            {challenge.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={(challenge.progress / challenge.target) * 100} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{challenge.progress}/{challenge.target}</span>
                          <Badge variant="outline" className="border-yellow-200 text-yellow-600">
                            <Star className="w-3 h-3 mr-1" />
                            {challenge.reward}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Badges */}
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Recent Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {demoBadges.filter(b => b.earned).slice(0, 6).map((badge) => (
                      <div key={badge.id} className="text-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => toast.info(badge.description)}>
                        <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center text-2xl mb-2`}>
                          {badge.icon}
                        </div>
                        <p className="text-xs font-medium truncate">{badge.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle>All Badges</CardTitle>
                <CardDescription>Collect badges by completing achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {demoBadges.map((badge) => (
                    <div key={badge.id} className={`p-4 rounded-lg border ${badge.earned ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900 opacity-60'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center text-2xl ${!badge.earned && 'grayscale'}`}>
                          {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <p className="font-semibold">{badge.name}</p>
                          <Badge variant="outline" className={getRarityBadge(badge.rarity)}>
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{badge.description}</p>
                      {!badge.earned && badge.progress && (
                        <div className="mt-3">
                          <Progress value={badge.progress} className="h-2" />
                          <p className="text-xs text-slate-500 mt-1">{badge.progress}% complete</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle>All Challenges</CardTitle>
                <CardDescription>Complete challenges to earn points and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoChallenges.map((challenge) => (
                    <div key={challenge.id} className="p-6 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${challenge.type === 'daily' ? 'bg-blue-100' : challenge.type === 'weekly' ? 'bg-purple-100' : 'bg-green-100'}`}>
                            {challenge.type === 'daily' ? <Clock className="w-6 h-6 text-blue-600" /> : challenge.type === 'weekly' ? <Calendar className="w-6 h-6 text-purple-600" /> : <Target className="w-6 h-6 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{challenge.name}</p>
                            <p className="text-sm text-slate-500">Expires in {challenge.expires}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 mb-2">
                            <Star className="w-3 h-3 mr-1" />
                            {challenge.reward} pts
                          </Badge>
                          <Badge variant="outline" className={challenge.type === 'daily' ? 'border-blue-200 text-blue-600' : challenge.type === 'weekly' ? 'border-purple-200 text-purple-600' : 'border-green-200 text-green-600'}>
                            {challenge.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={(challenge.progress / challenge.target) * 100} className="flex-1 h-3" />
                        <span className="text-lg font-bold">{challenge.progress}/{challenge.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Global Leaderboard
                </CardTitle>
                <CardDescription>See how you rank against other users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoLeaderboard.map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg ${user.isCurrentUser ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300' : 'border hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-yellow-100 text-yellow-600' : user.rank === 2 ? 'bg-gray-100 text-gray-600' : user.rank === 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                          {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.name} {user.isCurrentUser && <Badge className="ml-2 bg-purple-100 text-purple-700">You</Badge>}</p>
                          <p className="text-sm text-slate-500">Level {user.level} • {user.streak} day streak</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{user.points.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-pink-500" />
                      Reward Shop
                    </CardTitle>
                    <CardDescription>Spend your points on exclusive rewards</CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-2">
                    <Star className="w-4 h-4 mr-2" />
                    {demoUserStats.totalPoints.toLocaleString()} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {demoRewards.map((reward) => (
                    <div key={reward.id} className={`p-6 rounded-lg border ${reward.available ? 'bg-white dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-900 opacity-60'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline">{reward.type}</Badge>
                        {!reward.available && <Badge variant="destructive">Sold Out</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{reward.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-5 h-5" />
                          <span className="font-bold">{reward.cost.toLocaleString()}</span>
                        </div>
                        <Button size="sm" disabled={!reward.available || demoUserStats.totalPoints < reward.cost} onClick={() => toast.success(`Redeemed ${reward.name}!`)}>
                          {demoUserStats.totalPoints >= reward.cost ? 'Redeem' : 'Not enough'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
