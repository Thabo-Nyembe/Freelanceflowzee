'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Target,
  Zap,
  Crown,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Users,
  Calendar,
  FileText,
  Video
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  points: number
  unlocked: boolean
  unlockedAt?: Date
  category: 'creation' | 'collaboration' | 'productivity' | 'mastery'
  requirement: number
  current: number
}

interface UserStats {
  totalPoints: number
  level: number
  streak: number
  projectsCompleted: number
  collaborations: number
  filesCreated: number
  videosEdited: number
  aiGenerations: number
  loginDays: number
}

interface DailyChallenge {
  id: string
  title: string
  description: string
  points: number
  icon: any
  completed: boolean
  progress: number
  target: number
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-project',
    title: 'First Steps',
    description: 'Create your first project',
    icon: Target,
    points: 100,
    unlocked: false,
    category: 'creation',
    requirement: 1,
    current: 0
  },
  {
    id: 'project-master',
    title: 'Project Master',
    description: 'Complete 10 projects',
    icon: Trophy,
    points: 500,
    unlocked: false,
    category: 'creation',
    requirement: 10,
    current: 0
  },
  {
    id: 'collaborator',
    title: 'Team Player',
    description: 'Collaborate with 5 team members',
    icon: Users,
    points: 250,
    unlocked: false,
    category: 'collaboration',
    requirement: 5,
    current: 0
  },
  {
    id: 'week-streak',
    title: 'Consistency King',
    description: '7-day login streak',
    icon: Flame,
    points: 300,
    unlocked: false,
    category: 'productivity',
    requirement: 7,
    current: 0
  },
  {
    id: 'ai-explorer',
    title: 'AI Explorer',
    description: 'Use AI tools 50 times',
    icon: Sparkles,
    points: 400,
    unlocked: false,
    category: 'mastery',
    requirement: 50,
    current: 0
  },
  {
    id: 'video-creator',
    title: 'Video Creator',
    description: 'Edit 20 videos',
    icon: Video,
    points: 350,
    unlocked: false,
    category: 'creation',
    requirement: 20,
    current: 0
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Complete 5 projects in one day',
    icon: Zap,
    points: 600,
    unlocked: false,
    category: 'productivity',
    requirement: 5,
    current: 0
  },
  {
    id: 'platform-master',
    title: 'Platform Master',
    description: 'Use all major features',
    icon: Crown,
    points: 1000,
    unlocked: false,
    category: 'mastery',
    requirement: 10,
    current: 0
  }
]

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily-login',
    title: 'Daily Login',
    description: 'Log in today',
    points: 50,
    icon: Calendar,
    completed: false,
    progress: 0,
    target: 1
  },
  {
    id: 'create-project',
    title: 'Create Something',
    description: 'Start a new project',
    points: 100,
    icon: FileText,
    completed: false,
    progress: 0,
    target: 1
  },
  {
    id: 'ai-generation',
    title: 'AI Power',
    description: 'Use AI tools 3 times',
    points: 150,
    icon: Sparkles,
    completed: false,
    progress: 0,
    target: 3
  },
  {
    id: 'collaborate',
    title: 'Team Work',
    description: 'Collaborate with teammates',
    points: 120,
    icon: Users,
    completed: false,
    progress: 0,
    target: 1
  }
]

export function RetentionSystem() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 2450,
    level: 8,
    streak: 5,
    projectsCompleted: 12,
    collaborations: 8,
    filesCreated: 45,
    videosEdited: 15,
    aiGenerations: 38,
    loginDays: 23
  })

  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES)
  const [showWelcomeRewards, setShowWelcomeRewards] = useState(false)

  // Calculate level progress
  const nextLevelPoints = (userStats.level + 1) * 500
  const currentLevelProgress = (userStats.totalPoints % 500) / 5

  // Update achievements based on stats
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      let current = 0

      switch (achievement.id) {
        case 'first-project':
        case 'project-master':
          current = userStats.projectsCompleted
          break
        case 'collaborator':
          current = userStats.collaborations
          break
        case 'week-streak':
          current = userStats.streak
          break
        case 'ai-explorer':
          current = userStats.aiGenerations
          break
        case 'video-creator':
          current = userStats.videosEdited
          break
      }

      return {
        ...achievement,
        current,
        unlocked: current >= achievement.requirement
      }
    })

    setAchievements(updatedAchievements)
  }, [userStats])

  // Mark daily login as complete
  useEffect(() => {
    const loginChallenge = dailyChallenges.find(c => c.id === 'daily-login')
    if (loginChallenge && !loginChallenge.completed) {
      setTimeout(() => {
        completeDailyChallenge('daily-login')
      }, 1000)
    }
  }, [])

  const completeDailyChallenge = (challengeId: string) => {
    setDailyChallenges(prev =>
      prev.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, completed: true, progress: challenge.target }
          : challenge
      )
    )

    const challenge = dailyChallenges.find(c => c.id === challengeId)
    if (challenge) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + challenge.points
      }))

      toast.success(`🎉 Challenge Complete!`, {
        description: `You earned ${challenge.points} points for "${challenge.title}"`,
        duration: 4000
      })
    }
  }

  const claimAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId && a.unlocked && !a.unlockedAt)

    if (achievement) {
      setAchievements(prev =>
        prev.map(a =>
          a.id === achievementId
            ? { ...a, unlockedAt: new Date() }
            : a
        )
      )

      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + achievement.points
      }))

      toast.success(`🏆 Achievement Unlocked!`, {
        description: `${achievement.title} - ${achievement.points} points earned!`,
        duration: 5000
      })
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'creation':
        return 'from-blue-500 to-purple-500'
      case 'collaboration':
        return 'from-green-500 to-teal-500'
      case 'productivity':
        return 'from-orange-500 to-red-500'
      case 'mastery':
        return 'from-yellow-500 to-amber-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* User Level & Progress */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Crown className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Level {userStats.level}</h3>
                <p className="text-white/80 text-sm">
                  {nextLevelPoints - (userStats.totalPoints % 500)} points to Level {userStats.level + 1}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
              <p className="text-white/80 text-sm">Total Points</p>
            </div>
          </div>

          <Progress value={currentLevelProgress} className="h-3 bg-white/20" />

          {/* Streak Counter */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-300" />
              <div>
                <div className="text-2xl font-bold">{userStats.streak}</div>
                <p className="text-white/80 text-xs">Day Streak</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-green-300" />
              <div>
                <div className="text-2xl font-bold">{userStats.projectsCompleted}</div>
                <p className="text-white/80 text-xs">Projects Done</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-300" />
              <div>
                <div className="text-2xl font-bold">{userStats.collaborations}</div>
                <p className="text-white/80 text-xs">Collaborations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Daily Challenges
              </CardTitle>
              <CardDescription>Complete challenges to earn bonus points</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {dailyChallenges.filter(c => c.completed).length}/{dailyChallenges.length} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyChallenges.map(challenge => {
            const ChallengeIcon = challenge.icon
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  challenge.completed
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800 hover:border-blue-300'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'p-3 rounded-full',
                    challenge.completed ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  )}>
                    {challenge.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <ChallengeIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        +{challenge.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                    {!challenge.completed && (
                      <div className="mt-2">
                        <Progress value={(challenge.progress / challenge.target) * 100} className="h-1.5" />
                        <p className="text-xs text-gray-500 mt-1">
                          {challenge.progress}/{challenge.target} completed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Achievements
              </CardTitle>
              <CardDescription>Unlock achievements to earn rewards</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map(achievement => {
              const AchievementIcon = achievement.icon
              const progress = Math.min((achievement.current / achievement.requirement) * 100, 100)

              return (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                  className={cn(
                    'relative p-4 rounded-xl border-2 transition-all',
                    achievement.unlocked
                      ? `bg-gradient-to-br ${getCategoryColor(achievement.category)} text-white border-transparent shadow-lg cursor-pointer`
                      : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                  )}
                  onClick={() => achievement.unlocked && !achievement.unlockedAt && claimAchievement(achievement.id)}
                >
                  {achievement.unlocked && !achievement.unlockedAt && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      NEW!
                    </div>
                  )}

                  <div className="text-center space-y-3">
                    <div className={cn(
                      'mx-auto w-16 h-16 rounded-full flex items-center justify-center',
                      achievement.unlocked
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gray-200 dark:bg-gray-800'
                    )}>
                      {achievement.unlocked ? (
                        <AchievementIcon className="h-8 w-8" />
                      ) : (
                        <Lock className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div>
                      <h4 className={cn(
                        'font-bold text-sm mb-1',
                        !achievement.unlocked && 'text-gray-500 dark:text-gray-400'
                      )}>
                        {achievement.title}
                      </h4>
                      <p className={cn(
                        'text-xs',
                        achievement.unlocked
                          ? 'text-white/90'
                          : 'text-gray-500 dark:text-gray-500'
                      )}>
                        {achievement.description}
                      </p>
                    </div>

                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5 bg-gray-300 dark:bg-gray-700" />
                        <p className="text-xs text-gray-500">
                          {achievement.current}/{achievement.requirement}
                        </p>
                      </div>
                    )}

                    <Badge
                      variant={achievement.unlocked ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {achievement.points} pts
                    </Badge>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.filesCreated}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Files Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.videosEdited}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Videos Edited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.aiGenerations}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI Generations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.loginDays}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
