// Phase 6: Success Score/Rating API - Beats Upwork JSS
// Gap: Success Score/Rating (HIGH Priority)
// Competitors: Upwork (Job Success Score), Fiverr (Seller Levels)
// Our Advantage: Transparent scoring, AI insights, predictive success modeling, gamification

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo success score data
const demoSuccessScores = {
  'fl-001': {
    freelancerId: 'fl-001',
    freelancerName: 'Sarah Chen',
    successScore: 98,
    tier: 'Exceptional',
    level: 'Top Rated Plus',
    levelProgress: 98,
    metrics: {
      jobSuccessRate: 98,
      onTimeDelivery: 99,
      clientSatisfaction: 4.98,
      communicationScore: 97,
      qualityScore: 99,
      repeatClientRate: 65,
      disputeRate: 0.5,
      cancellationRate: 1.2,
      responseRate: 99,
      avgResponseTime: 2
    },
    history: {
      totalProjects: 87,
      totalEarnings: 450000,
      avgProjectValue: 5172,
      longestRelationship: '3 years',
      topClients: 12,
      perfectRatings: 82
    },
    weights: {
      jobSuccess: 0.30,
      onTimeDelivery: 0.15,
      clientSatisfaction: 0.20,
      communication: 0.10,
      quality: 0.15,
      repeatClients: 0.10
    },
    scoreBreakdown: {
      jobSuccess: { score: 98, weighted: 29.4, maxPossible: 30 },
      onTimeDelivery: { score: 99, weighted: 14.85, maxPossible: 15 },
      clientSatisfaction: { score: 99.6, weighted: 19.92, maxPossible: 20 },
      communication: { score: 97, weighted: 9.7, maxPossible: 10 },
      quality: { score: 99, weighted: 14.85, maxPossible: 15 },
      repeatClients: { score: 93, weighted: 9.3, maxPossible: 10 }
    },
    trend: {
      current: 98,
      lastMonth: 97,
      lastQuarter: 96,
      lastYear: 94,
      direction: 'up',
      change: '+1'
    },
    achievements: [
      { badge: '100 Projects', earnedAt: '2023-08-15', rarity: 'rare' },
      { badge: 'Perfect Quarter', earnedAt: '2023-12-31', rarity: 'epic' },
      { badge: '5-Star Streak', count: 25, earnedAt: '2024-01-10', rarity: 'legendary' },
      { badge: 'Fast Responder', earnedAt: '2023-03-20', rarity: 'common' },
      { badge: 'Client Favorite', earnedAt: '2023-10-05', rarity: 'rare' }
    ],
    insights: {
      strengths: [
        'Exceptional delivery consistency',
        'Outstanding client communication',
        'High repeat client rate'
      ],
      improvements: [
        'Consider taking on larger projects to increase avg value',
        'Expand to new categories for growth'
      ],
      comparison: {
        vsCategory: '+15 points above category average',
        vsTopPerformers: 'Top 2% in your category',
        vsPlatform: 'Top 5% platform-wide'
      }
    },
    projectedScore: {
      nextMonth: 98,
      nextQuarter: 99,
      confidence: 0.85
    },
    lastCalculated: '2024-01-16T08:00:00Z'
  }
}

// Level definitions
const levels = {
  'New': { min: 0, max: 0, icon: 'seedling', color: 'gray', requirements: { projects: 0, earnings: 0 } },
  'Rising Talent': { min: 1, max: 69, icon: 'trending-up', color: 'blue', requirements: { projects: 1, earnings: 1000 } },
  'Top Rated': { min: 70, max: 89, icon: 'star', color: 'purple', requirements: { projects: 5, earnings: 10000, successScore: 70 } },
  'Top Rated Plus': { min: 90, max: 100, icon: 'crown', color: 'gold', requirements: { projects: 25, earnings: 50000, successScore: 90 } },
  'Expert': { min: 95, max: 100, icon: 'gem', color: 'diamond', requirements: { projects: 50, earnings: 100000, successScore: 95, interview: true } }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'get-score':
        return handleGetScore(params)
      case 'get-breakdown':
        return handleGetBreakdown(params)
      case 'get-history':
        return handleGetHistory(params)
      case 'predict-impact':
        return handlePredictImpact(params)
      case 'get-achievements':
        return handleGetAchievements(params)
      case 'get-leaderboard':
        return handleGetLeaderboard(params)
      case 'get-level-progress':
        return handleGetLevelProgress(params)
      case 'simulate-score':
        return handleSimulateScore(params)
      case 'get-insights':
        return handleGetInsights(params)
      case 'compare-scores':
        return handleCompareScores(params)
      case 'get-score-factors':
        return handleGetScoreFactors(params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Success Score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleGetScore(params: { freelancerId: string }) {
  const { freelancerId } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  if (!scoreData) {
    return NextResponse.json({
      success: true,
      data: {
        freelancerId,
        successScore: null,
        level: 'New',
        message: 'Complete your first project to start building your success score'
      }
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      successScore: scoreData.successScore,
      tier: scoreData.tier,
      level: scoreData.level,
      trend: scoreData.trend,
      quickStats: {
        totalProjects: scoreData.history.totalProjects,
        clientSatisfaction: scoreData.metrics.clientSatisfaction,
        onTimeDelivery: scoreData.metrics.onTimeDelivery + '%'
      },
      badges: scoreData.achievements.slice(0, 3),
      lastCalculated: scoreData.lastCalculated
    }
  })
}

async function handleGetBreakdown(params: { freelancerId: string }) {
  const { freelancerId } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  if (!scoreData) {
    return NextResponse.json({ error: 'No score data found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      totalScore: scoreData.successScore,
      breakdown: scoreData.scoreBreakdown,
      weights: scoreData.weights,
      explanation: {
        jobSuccess: 'Percentage of contracts that ended successfully',
        onTimeDelivery: 'Projects delivered by the deadline',
        clientSatisfaction: 'Average client rating (weighted by project value)',
        communication: 'Response time, message quality, updates frequency',
        quality: 'Code/work quality based on revisions and feedback',
        repeatClients: 'Clients who hired you again'
      },
      improvementPotential: {
        highestImpact: 'jobSuccess',
        easyWins: ['communication', 'onTimeDelivery'],
        currentWeakest: 'repeatClients'
      }
    }
  })
}

async function handleGetHistory(params: {
  freelancerId: string
  period?: string
}) {
  const { freelancerId, period = '12months' } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  if (!scoreData) {
    return NextResponse.json({ error: 'No score data found' }, { status: 404 })
  }

  // Generate historical data
  const historicalScores = [
    { date: '2023-02', score: 89, projects: 3, earnings: 15000 },
    { date: '2023-04', score: 91, projects: 5, earnings: 25000 },
    { date: '2023-06', score: 93, projects: 8, earnings: 40000 },
    { date: '2023-08', score: 94, projects: 12, earnings: 60000 },
    { date: '2023-10', score: 96, projects: 15, earnings: 75000 },
    { date: '2023-12', score: 97, projects: 18, earnings: 90000 },
    { date: '2024-01', score: 98, projects: 20, earnings: 100000 }
  ]

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      period,
      history: historicalScores,
      milestones: [
        { date: '2023-06', milestone: 'Reached Top Rated', score: 90 },
        { date: '2023-10', milestone: 'Reached Top Rated Plus', score: 95 }
      ],
      growthRate: '+9 points over 12 months',
      averageMonthlyGrowth: 0.75
    }
  })
}

async function handlePredictImpact(params: {
  freelancerId: string
  scenario: {
    projectType?: string
    estimatedRating?: number
    deliveryOnTime?: boolean
    projectValue?: number
  }
}) {
  const { freelancerId, scenario } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]
  const currentScore = scoreData?.successScore || 50

  // Simulate impact
  let impact = 0
  const factors: string[] = []

  if (scenario.estimatedRating === 5) {
    impact += 0.5
    factors.push('5-star rating: +0.5 points')
  } else if (scenario.estimatedRating === 4) {
    impact += 0.1
    factors.push('4-star rating: +0.1 points')
  } else if (scenario.estimatedRating && scenario.estimatedRating < 4) {
    impact -= (4 - scenario.estimatedRating) * 0.5
    factors.push(`${scenario.estimatedRating}-star rating: ${impact} points`)
  }

  if (scenario.deliveryOnTime) {
    impact += 0.2
    factors.push('On-time delivery: +0.2 points')
  } else if (scenario.deliveryOnTime === false) {
    impact -= 0.5
    factors.push('Late delivery: -0.5 points')
  }

  if (scenario.projectValue && scenario.projectValue > 5000) {
    impact += 0.3
    factors.push('High-value project: +0.3 points (weighted more heavily)')
  }

  const projectedScore = Math.min(100, Math.max(0, currentScore + impact))

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      currentScore,
      projectedScore: Math.round(projectedScore * 10) / 10,
      impact: Math.round(impact * 10) / 10,
      factors,
      levelImpact: projectedScore >= 95 && currentScore < 95
        ? 'Would reach Expert level!'
        : projectedScore >= 90 && currentScore < 90
          ? 'Would reach Top Rated Plus!'
          : 'No level change'
    }
  })
}

async function handleGetAchievements(params: { freelancerId: string }) {
  const { freelancerId } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  const allAchievements = [
    { id: 'first-project', name: 'First Project', description: 'Complete your first project', rarity: 'common', earned: true },
    { id: 'fast-responder', name: 'Fast Responder', description: 'Average response time under 1 hour', rarity: 'common', earned: true },
    { id: 'five-star-10', name: '10 Five-Star Reviews', description: 'Receive 10 five-star ratings', rarity: 'common', earned: true },
    { id: 'five-star-50', name: '50 Five-Star Reviews', description: 'Receive 50 five-star ratings', rarity: 'rare', earned: true },
    { id: 'perfect-quarter', name: 'Perfect Quarter', description: 'Maintain 100% success rate for 3 months', rarity: 'epic', earned: true },
    { id: 'century', name: 'Century', description: 'Complete 100 projects', rarity: 'rare', earned: false, progress: 87 },
    { id: 'million-dollar', name: 'Million Dollar', description: 'Earn $1,000,000 lifetime', rarity: 'legendary', earned: false, progress: 45 },
    { id: 'streak-25', name: '25 Project Streak', description: '25 consecutive 5-star projects', rarity: 'legendary', earned: true },
    { id: 'client-favorite', name: 'Client Favorite', description: '10+ repeat clients', rarity: 'rare', earned: true },
    { id: 'top-1-percent', name: 'Top 1%', description: 'Reach top 1% of freelancers', rarity: 'legendary', earned: false, progress: 80 }
  ]

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      earned: allAchievements.filter(a => a.earned),
      inProgress: allAchievements.filter(a => !a.earned && a.progress),
      locked: allAchievements.filter(a => !a.earned && !a.progress),
      totalPoints: allAchievements.filter(a => a.earned).length * 100,
      nextAchievement: {
        ...allAchievements.find(a => !a.earned && a.progress),
        progressToNext: '87%'
      }
    }
  })
}

async function handleGetLeaderboard(params: {
  category?: string
  period?: string
  limit?: number
}) {
  const { category = 'all', period = 'monthly', limit = 10 } = params

  const leaderboard = [
    { rank: 1, freelancerId: 'fl-003', name: 'Elena Rodriguez', score: 99, change: 0, projects: 15, earnings: 45000 },
    { rank: 2, freelancerId: 'fl-001', name: 'Sarah Chen', score: 98, change: 1, projects: 12, earnings: 38000 },
    { rank: 3, freelancerId: 'fl-004', name: 'James Wilson', score: 97, change: -1, projects: 18, earnings: 52000 },
    { rank: 4, freelancerId: 'fl-002', name: 'Marcus Johnson', score: 96, change: 2, projects: 14, earnings: 35000 },
    { rank: 5, freelancerId: 'fl-005', name: 'Priya Patel', score: 95, change: 0, projects: 11, earnings: 28000 }
  ]

  return NextResponse.json({
    success: true,
    data: {
      category,
      period,
      leaderboard: leaderboard.slice(0, limit),
      yourRank: {
        position: 2,
        percentile: 'Top 2%',
        pointsToFirst: 1
      },
      periodEnds: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
    }
  })
}

async function handleGetLevelProgress(params: { freelancerId: string }) {
  const { freelancerId } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  if (!scoreData) {
    return NextResponse.json({
      success: true,
      data: {
        freelancerId,
        currentLevel: 'New',
        nextLevel: 'Rising Talent',
        progress: 0,
        requirements: levels['Rising Talent'].requirements,
        benefits: ['Basic badge', 'Appear in search results']
      }
    })
  }

  const currentLevel = scoreData.level as keyof typeof levels
  const levelOrder = Object.keys(levels)
  const currentIndex = levelOrder.indexOf(currentLevel)
  const nextLevel = levelOrder[currentIndex + 1] as keyof typeof levels | undefined

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      currentLevel,
      currentLevelDetails: levels[currentLevel],
      nextLevel: nextLevel || 'Maximum level reached',
      nextLevelDetails: nextLevel ? levels[nextLevel] : null,
      progress: scoreData.levelProgress,
      currentStats: {
        projects: scoreData.history.totalProjects,
        earnings: scoreData.history.totalEarnings,
        successScore: scoreData.successScore
      },
      milestoneRewards: {
        nextMilestone: nextLevel ? `Reach ${nextLevel}` : 'Maintain Expert status',
        reward: nextLevel ? 'Unlock exclusive badges and priority support' : 'Quarterly bonus eligibility'
      }
    }
  })
}

async function handleSimulateScore(params: {
  metrics: {
    jobSuccessRate?: number
    onTimeDelivery?: number
    clientSatisfaction?: number
    communicationScore?: number
    qualityScore?: number
    repeatClientRate?: number
  }
}) {
  const { metrics } = params

  const weights = {
    jobSuccess: 0.30,
    onTimeDelivery: 0.15,
    clientSatisfaction: 0.20,
    communication: 0.10,
    quality: 0.15,
    repeatClients: 0.10
  }

  const simulatedScore =
    (metrics.jobSuccessRate || 80) * weights.jobSuccess +
    (metrics.onTimeDelivery || 80) * weights.onTimeDelivery +
    ((metrics.clientSatisfaction || 4) / 5 * 100) * weights.clientSatisfaction +
    (metrics.communicationScore || 80) * weights.communication +
    (metrics.qualityScore || 80) * weights.quality +
    (metrics.repeatClientRate || 30) * weights.repeatClients

  const tier =
    simulatedScore >= 95 ? 'Exceptional' :
    simulatedScore >= 85 ? 'Excellent' :
    simulatedScore >= 75 ? 'Strong' :
    simulatedScore >= 65 ? 'Good' : 'Building'

  return NextResponse.json({
    success: true,
    data: {
      simulatedScore: Math.round(simulatedScore),
      tier,
      level: simulatedScore >= 90 ? 'Top Rated Plus' :
             simulatedScore >= 70 ? 'Top Rated' :
             simulatedScore >= 50 ? 'Rising Talent' : 'New',
      breakdown: {
        jobSuccess: Math.round((metrics.jobSuccessRate || 80) * weights.jobSuccess * 10) / 10,
        onTimeDelivery: Math.round((metrics.onTimeDelivery || 80) * weights.onTimeDelivery * 10) / 10,
        clientSatisfaction: Math.round(((metrics.clientSatisfaction || 4) / 5 * 100) * weights.clientSatisfaction * 10) / 10,
        communication: Math.round((metrics.communicationScore || 80) * weights.communication * 10) / 10,
        quality: Math.round((metrics.qualityScore || 80) * weights.quality * 10) / 10,
        repeatClients: Math.round((metrics.repeatClientRate || 30) * weights.repeatClients * 10) / 10
      }
    }
  })
}

async function handleGetInsights(params: { freelancerId: string }) {
  const { freelancerId } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  if (!scoreData) {
    return NextResponse.json({
      success: true,
      data: {
        freelancerId,
        insights: {
          message: 'Complete projects to start receiving personalized insights'
        }
      }
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      insights: scoreData.insights,
      aiRecommendations: [
        {
          type: 'quick-win',
          action: 'Respond to messages within 1 hour',
          impact: 'Could increase communication score by 2 points',
          difficulty: 'easy'
        },
        {
          type: 'growth',
          action: 'Take on 2 more projects this month',
          impact: 'Faster path to Expert level',
          difficulty: 'medium'
        },
        {
          type: 'optimization',
          action: 'Offer small discount for repeat clients',
          impact: 'Could increase repeat client rate by 10%',
          difficulty: 'medium'
        }
      ],
      riskFactors: [
        {
          factor: 'Lower activity this month',
          risk: 'Score may decrease without new positive reviews',
          mitigation: 'Complete at least 2 projects this month'
        }
      ]
    }
  })
}

async function handleCompareScores(params: {
  freelancerId: string
  compareWith?: string[]
  anonymized?: boolean
}) {
  const { freelancerId, anonymized = true } = params

  const scoreData = demoSuccessScores[freelancerId as keyof typeof demoSuccessScores]

  return NextResponse.json({
    success: true,
    data: {
      your: {
        score: scoreData?.successScore || 50,
        level: scoreData?.level || 'New'
      },
      comparison: {
        categoryAverage: 78,
        topPerformersAverage: 94,
        platformAverage: 72
      },
      percentile: {
        inCategory: 95,
        onPlatform: 98
      },
      peers: anonymized ? [
        { id: 'peer-1', score: 95, level: 'Top Rated Plus' },
        { id: 'peer-2', score: 92, level: 'Top Rated Plus' },
        { id: 'peer-3', score: 88, level: 'Top Rated' }
      ] : []
    }
  })
}

async function handleGetScoreFactors(params: Record<string, never>) {
  return NextResponse.json({
    success: true,
    data: {
      factors: [
        {
          name: 'Job Success Rate',
          weight: '30%',
          description: 'Percentage of contracts completed successfully without disputes or cancellations',
          howToImprove: ['Complete all milestones', 'Communicate proactively', 'Deliver quality work']
        },
        {
          name: 'Client Satisfaction',
          weight: '20%',
          description: 'Weighted average of client ratings (larger projects count more)',
          howToImprove: ['Exceed expectations', 'Be responsive', 'Handle feedback professionally']
        },
        {
          name: 'On-Time Delivery',
          weight: '15%',
          description: 'Percentage of projects delivered by the agreed deadline',
          howToImprove: ['Set realistic deadlines', 'Communicate delays early', 'Use time tracking']
        },
        {
          name: 'Quality Score',
          weight: '15%',
          description: 'Based on revisions requested and explicit quality feedback',
          howToImprove: ['Review requirements carefully', 'Test thoroughly', 'Get feedback before final delivery']
        },
        {
          name: 'Communication',
          weight: '10%',
          description: 'Response time, message quality, and update frequency',
          howToImprove: ['Respond within 24 hours', 'Provide regular updates', 'Be clear and professional']
        },
        {
          name: 'Repeat Clients',
          weight: '10%',
          description: 'Percentage of clients who hire you again',
          howToImprove: ['Build relationships', 'Offer loyalty benefits', 'Follow up after projects']
        }
      ],
      calculation: {
        formula: 'Sum of (Factor Score × Weight)',
        range: '0-100',
        updateFrequency: 'Daily'
      }
    }
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Success Score/Rating API - Beats Upwork JSS',
      features: [
        'Transparent multi-factor scoring',
        'Real-time score breakdown',
        'Impact prediction before completing projects',
        'Achievement/gamification system',
        'Category leaderboards',
        'Level progression system',
        'AI-powered insights',
        'Score simulation tool'
      ],
      levels,
      endpoints: {
        getScore: 'POST with action: get-score',
        getBreakdown: 'POST with action: get-breakdown',
        getHistory: 'POST with action: get-history',
        predictImpact: 'POST with action: predict-impact',
        getAchievements: 'POST with action: get-achievements',
        getLeaderboard: 'POST with action: get-leaderboard',
        getLevelProgress: 'POST with action: get-level-progress',
        simulateScore: 'POST with action: simulate-score',
        getInsights: 'POST with action: get-insights',
        compareScores: 'POST with action: compare-scores',
        getScoreFactors: 'POST with action: get-score-factors'
      }
    }
  })
}
