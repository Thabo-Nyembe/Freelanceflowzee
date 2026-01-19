// Phase 6: Client Reviews & Ratings API - Beats Fiverr & Upwork
// Gap: Client Reviews & Ratings (HIGH Priority)
// Competitors: Fiverr (seller levels), Upwork (JSS score)
// Our Advantage: AI-verified reviews, multi-dimensional ratings, fraud detection

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo reviews data
const demoReviews = [
  {
    id: 'rev-001',
    freelancerId: 'fl-001',
    clientId: 'client-001',
    projectId: 'proj-001',
    projectTitle: 'E-commerce Platform Development',
    ratings: {
      overall: 5,
      quality: 5,
      communication: 5,
      expertise: 5,
      professionalism: 5,
      wouldHireAgain: true
    },
    review: {
      text: 'Sarah delivered exceptional work on our e-commerce platform. Her technical expertise in React and Node.js was evident throughout the project. Communication was excellent - always responsive and proactive about updates.',
      highlights: ['Technical Excellence', 'Great Communication', 'On-time Delivery'],
      privateNote: 'Would recommend for any complex web project'
    },
    projectMetrics: {
      budget: 75000,
      actualCost: 72000,
      estimatedDuration: '6 months',
      actualDuration: '5.5 months',
      deliveredOnTime: true,
      withinBudget: true
    },
    verification: {
      status: 'verified',
      method: 'payment-verified',
      aiAnalysis: {
        sentiment: 'very_positive',
        authenticity: 98,
        spamProbability: 2
      }
    },
    response: {
      text: 'Thank you for the wonderful review! It was a pleasure working on this project. The clear requirements and responsive feedback made the collaboration smooth.',
      date: '2024-01-16'
    },
    helpful: {
      count: 24,
      users: ['user-101', 'user-102']
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16'
  },
  {
    id: 'rev-002',
    freelancerId: 'fl-001',
    clientId: 'client-002',
    projectId: 'proj-002',
    projectTitle: 'FinTech Dashboard',
    ratings: {
      overall: 5,
      quality: 5,
      communication: 4,
      expertise: 5,
      professionalism: 5,
      wouldHireAgain: true
    },
    review: {
      text: 'Fantastic developer who really understands complex financial requirements. The dashboard exceeded our expectations with excellent data visualization.',
      highlights: ['Domain Expertise', 'Quality Code', 'Problem Solver'],
      privateNote: null
    },
    projectMetrics: {
      budget: 45000,
      actualCost: 45000,
      estimatedDuration: '4 months',
      actualDuration: '4 months',
      deliveredOnTime: true,
      withinBudget: true
    },
    verification: {
      status: 'verified',
      method: 'payment-verified',
      aiAnalysis: {
        sentiment: 'very_positive',
        authenticity: 96,
        spamProbability: 3
      }
    },
    response: null,
    helpful: {
      count: 18,
      users: []
    },
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  }
]

// Rating categories with descriptions
const ratingCategories = {
  quality: 'Quality of deliverables',
  communication: 'Responsiveness and clarity',
  expertise: 'Technical/professional skills',
  professionalism: 'Reliability and conduct',
  timeline: 'Meeting deadlines',
  value: 'Value for money'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'submit-review':
        return handleSubmitReview(params)
      case 'get-reviews':
        return handleGetReviews(params)
      case 'get-review-summary':
        return handleGetReviewSummary(params)
      case 'respond-to-review':
        return handleRespondToReview(params)
      case 'mark-helpful':
        return handleMarkHelpful(params)
      case 'report-review':
        return handleReportReview(params)
      case 'request-revision':
        return handleRequestRevision(params)
      case 'calculate-score':
        return handleCalculateScore(params)
      case 'get-review-analytics':
        return handleGetReviewAnalytics(params)
      case 'verify-review':
        return handleVerifyReview(params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Reviews API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleSubmitReview(params: {
  freelancerId: string
  projectId: string
  ratings: {
    overall: number
    quality: number
    communication: number
    expertise: number
    professionalism: number
  }
  reviewText: string
  highlights?: string[]
  privateNote?: string
  wouldHireAgain: boolean
}) {
  const {
    freelancerId,
    projectId,
    ratings,
    reviewText,
    highlights = [],
    privateNote,
    wouldHireAgain
  } = params

  // Validate ratings
  const invalidRatings = Object.entries(ratings).filter(
    ([_, value]) => value < 1 || value > 5
  )
  if (invalidRatings.length > 0) {
    return NextResponse.json({
      error: 'All ratings must be between 1 and 5'
    }, { status: 400 })
  }

  // AI analysis for fraud detection
  const aiAnalysis = analyzeReviewAuthenticity(reviewText, ratings)

  if (aiAnalysis.spamProbability > 80) {
    return NextResponse.json({
      error: 'Review flagged for manual review',
      reason: 'Potential spam detected'
    }, { status: 400 })
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    freelancerId,
    projectId,
    ratings: {
      ...ratings,
      wouldHireAgain
    },
    review: {
      text: reviewText,
      highlights,
      privateNote
    },
    verification: {
      status: 'pending',
      method: 'payment-pending',
      aiAnalysis
    },
    helpful: {
      count: 0,
      users: []
    },
    createdAt: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    data: {
      review: newReview,
      message: 'Review submitted successfully. It will be verified after payment confirmation.',
      impactPreview: {
        newOverallRating: calculateNewOverallRating(freelancerId, ratings.overall),
        levelProgress: '+15 points toward next level'
      }
    }
  })
}

function analyzeReviewAuthenticity(text: string, ratings: Record<string, number>) {
  // Simulated AI analysis
  const wordCount = text.split(' ').length
  const hasSpecifics = /delivered|project|work|quality|communication/i.test(text)
  const isGeneric = /great|good|nice|awesome|excellent/i.test(text) && wordCount < 20

  let authenticity = 70
  let spamProbability = 30

  if (wordCount > 30) authenticity += 10
  if (hasSpecifics) authenticity += 15
  if (isGeneric) {
    authenticity -= 20
    spamProbability += 30
  }

  // Check for rating consistency
  const ratingValues = Object.values(ratings)
  const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
  const variance = ratingValues.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratingValues.length
  if (variance < 0.1 && avgRating === 5) {
    spamProbability += 10
  }

  return {
    sentiment: avgRating >= 4 ? 'very_positive' : avgRating >= 3 ? 'positive' : 'mixed',
    authenticity: Math.min(authenticity, 100),
    spamProbability: Math.max(0, Math.min(spamProbability, 100))
  }
}

function calculateNewOverallRating(freelancerId: string, newRating: number): number {
  const existingReviews = demoReviews.filter(r => r.freelancerId === freelancerId)
  const totalRatings = existingReviews.length
  const currentSum = existingReviews.reduce((sum, r) => sum + r.ratings.overall, 0)
  return Number(((currentSum + newRating) / (totalRatings + 1)).toFixed(2))
}

async function handleGetReviews(params: {
  freelancerId?: string
  clientId?: string
  projectId?: string
  minRating?: number
  sortBy?: string
  page?: number
  limit?: number
}) {
  const {
    freelancerId,
    clientId,
    minRating,
    sortBy = 'recent',
    page = 1,
    limit = 10
  } = params

  let reviews = [...demoReviews]

  if (freelancerId) {
    reviews = reviews.filter(r => r.freelancerId === freelancerId)
  }

  if (clientId) {
    reviews = reviews.filter(r => r.clientId === clientId)
  }

  if (minRating) {
    reviews = reviews.filter(r => r.ratings.overall >= minRating)
  }

  // Sort
  switch (sortBy) {
    case 'recent':
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'highest':
      reviews.sort((a, b) => b.ratings.overall - a.ratings.overall)
      break
    case 'lowest':
      reviews.sort((a, b) => a.ratings.overall - b.ratings.overall)
      break
    case 'helpful':
      reviews.sort((a, b) => b.helpful.count - a.helpful.count)
      break
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const paginatedReviews = reviews.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    success: true,
    data: {
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        total: reviews.length,
        totalPages: Math.ceil(reviews.length / limit)
      }
    }
  })
}

async function handleGetReviewSummary(params: { freelancerId: string }) {
  const { freelancerId } = params

  const reviews = demoReviews.filter(r => r.freelancerId === freelancerId)

  if (reviews.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        freelancerId,
        hasReviews: false
      }
    })
  }

  const summary = {
    totalReviews: reviews.length,
    overallRating: Number((reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length).toFixed(2)),
    categoryAverages: {
      quality: Number((reviews.reduce((sum, r) => sum + r.ratings.quality, 0) / reviews.length).toFixed(2)),
      communication: Number((reviews.reduce((sum, r) => sum + r.ratings.communication, 0) / reviews.length).toFixed(2)),
      expertise: Number((reviews.reduce((sum, r) => sum + r.ratings.expertise, 0) / reviews.length).toFixed(2)),
      professionalism: Number((reviews.reduce((sum, r) => sum + r.ratings.professionalism, 0) / reviews.length).toFixed(2))
    },
    ratingDistribution: {
      5: reviews.filter(r => r.ratings.overall === 5).length,
      4: reviews.filter(r => r.ratings.overall === 4).length,
      3: reviews.filter(r => r.ratings.overall === 3).length,
      2: reviews.filter(r => r.ratings.overall === 2).length,
      1: reviews.filter(r => r.ratings.overall === 1).length
    },
    wouldHireAgain: {
      yes: reviews.filter(r => r.ratings.wouldHireAgain).length,
      percentage: Math.round((reviews.filter(r => r.ratings.wouldHireAgain).length / reviews.length) * 100)
    },
    projectMetrics: {
      onTimeDelivery: Math.round((reviews.filter(r => r.projectMetrics.deliveredOnTime).length / reviews.length) * 100),
      withinBudget: Math.round((reviews.filter(r => r.projectMetrics.withinBudget).length / reviews.length) * 100)
    },
    topHighlights: getTopHighlights(reviews),
    verifiedPercentage: Math.round((reviews.filter(r => r.verification.status === 'verified').length / reviews.length) * 100)
  }

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      summary,
      recentReviews: reviews.slice(0, 3)
    }
  })
}

function getTopHighlights(reviews: typeof demoReviews): Array<{ highlight: string, count: number }> {
  const highlightCounts: Record<string, number> = {}

  reviews.forEach(review => {
    review.review.highlights.forEach(highlight => {
      highlightCounts[highlight] = (highlightCounts[highlight] || 0) + 1
    })
  })

  return Object.entries(highlightCounts)
    .map(([highlight, count]) => ({ highlight, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

async function handleRespondToReview(params: {
  reviewId: string
  freelancerId: string
  responseText: string
}) {
  const { reviewId, freelancerId, responseText } = params

  const review = demoReviews.find(r => r.id === reviewId && r.freelancerId === freelancerId)

  if (!review) {
    return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 })
  }

  if (review.response) {
    return NextResponse.json({ error: 'Review already has a response' }, { status: 400 })
  }

  // Update review with response
  const response = {
    text: responseText,
    date: new Date().toISOString().split('T')[0]
  }

  return NextResponse.json({
    success: true,
    data: {
      reviewId,
      response,
      message: 'Response added successfully'
    }
  })
}

async function handleMarkHelpful(params: {
  reviewId: string
  userId: string
}) {
  const { reviewId, userId } = params

  const review = demoReviews.find(r => r.id === reviewId)

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  if (review.helpful.users.includes(userId)) {
    return NextResponse.json({ error: 'Already marked as helpful' }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    data: {
      reviewId,
      helpfulCount: review.helpful.count + 1,
      message: 'Marked as helpful'
    }
  })
}

async function handleReportReview(params: {
  reviewId: string
  reporterId: string
  reason: string
  details?: string
}) {
  const { reviewId, reporterId, reason, details } = params

  const validReasons = [
    'fake_review',
    'inappropriate_content',
    'spam',
    'harassment',
    'conflict_of_interest',
    'other'
  ]

  if (!validReasons.includes(reason)) {
    return NextResponse.json({
      error: 'Invalid report reason',
      validReasons
    }, { status: 400 })
  }

  const report = {
    id: `report-${Date.now()}`,
    reviewId,
    reporterId,
    reason,
    details,
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    data: {
      report,
      message: 'Report submitted. Our team will review within 24-48 hours.'
    }
  })
}

async function handleRequestRevision(params: {
  reviewId: string
  freelancerId: string
  reason: string
}) {
  const { reviewId, freelancerId, reason } = params

  const review = demoReviews.find(r => r.id === reviewId && r.freelancerId === freelancerId)

  if (!review) {
    return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      reviewId,
      status: 'revision_requested',
      message: 'Revision request sent to the client. They will be notified to update their review if appropriate.'
    }
  })
}

async function handleCalculateScore(params: { freelancerId: string }) {
  const { freelancerId } = params

  const reviews = demoReviews.filter(r => r.freelancerId === freelancerId)

  if (reviews.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        freelancerId,
        score: null,
        message: 'No reviews yet'
      }
    })
  }

  // Calculate Job Success Score (JSS) - similar to Upwork
  const weights = {
    rating: 0.4,
    repeatClients: 0.2,
    onTimeDelivery: 0.2,
    withinBudget: 0.1,
    responseRate: 0.1
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length
  const uniqueClients = new Set(reviews.map(r => r.clientId)).size
  const repeatClientRate = uniqueClients > 0 ? (reviews.length - uniqueClients) / reviews.length : 0
  const onTimeRate = reviews.filter(r => r.projectMetrics.deliveredOnTime).length / reviews.length
  const budgetRate = reviews.filter(r => r.projectMetrics.withinBudget).length / reviews.length

  const jss = Math.round(
    (avgRating / 5 * 100 * weights.rating) +
    (repeatClientRate * 100 * weights.repeatClients) +
    (onTimeRate * 100 * weights.onTimeDelivery) +
    (budgetRate * 100 * weights.withinBudget) +
    (95 * weights.responseRate) // Simulated response rate
  )

  // Determine level
  let level = 'New'
  if (jss >= 90 && reviews.length >= 10) level = 'Top Rated Plus'
  else if (jss >= 80 && reviews.length >= 5) level = 'Top Rated'
  else if (jss >= 70 && reviews.length >= 3) level = 'Rising Talent'

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      jobSuccessScore: jss,
      level,
      breakdown: {
        ratingContribution: Math.round(avgRating / 5 * 100 * weights.rating),
        repeatClientContribution: Math.round(repeatClientRate * 100 * weights.repeatClients),
        onTimeContribution: Math.round(onTimeRate * 100 * weights.onTimeDelivery),
        budgetContribution: Math.round(budgetRate * 100 * weights.withinBudget)
      },
      nextLevel: {
        target: level === 'Top Rated' ? 'Top Rated Plus' : level === 'Rising Talent' ? 'Top Rated' : 'Rising Talent',
        requirements: level === 'Top Rated'
          ? 'Maintain 90%+ JSS with 10+ reviews'
          : 'Maintain 80%+ JSS with 5+ reviews'
      }
    }
  })
}

async function handleGetReviewAnalytics(params: {
  freelancerId: string
  period?: string
}) {
  const { freelancerId, period = '12months' } = params

  const reviews = demoReviews.filter(r => r.freelancerId === freelancerId)

  return NextResponse.json({
    success: true,
    data: {
      freelancerId,
      period,
      analytics: {
        totalReviews: reviews.length,
        averageRating: 4.98,
        ratingTrend: '+0.02',
        satisfactionRate: 99,
        responseTimeToReviews: '< 24 hours',
        sentimentBreakdown: {
          veryPositive: 95,
          positive: 4,
          neutral: 1,
          negative: 0
        },
        monthlyTrend: [
          { month: 'Jan', reviews: 5, avgRating: 4.9 },
          { month: 'Feb', reviews: 4, avgRating: 5.0 },
          { month: 'Mar', reviews: 6, avgRating: 4.95 }
        ],
        topMentionedSkills: ['React', 'Communication', 'Problem-solving'],
        improvementAreas: ['Response time during weekends'],
        competitorComparison: {
          yourScore: 98,
          categoryAverage: 85,
          topPerformerAverage: 95
        }
      }
    }
  })
}

async function handleVerifyReview(params: {
  reviewId: string
  method: 'payment' | 'project-completion' | 'manual'
}) {
  const { reviewId, method } = params

  const review = demoReviews.find(r => r.id === reviewId)

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      reviewId,
      verification: {
        status: 'verified',
        method,
        verifiedAt: new Date().toISOString(),
        badge: 'Verified Purchase'
      }
    }
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Client Reviews & Ratings API - Beats Fiverr & Upwork',
      features: [
        'Multi-dimensional ratings',
        'AI-verified authenticity',
        'Fraud/spam detection',
        'Job Success Score (JSS)',
        'Review analytics',
        'Freelancer responses',
        'Helpful voting',
        'Report system'
      ],
      ratingCategories,
      endpoints: {
        submitReview: 'POST with action: submit-review',
        getReviews: 'POST with action: get-reviews',
        getReviewSummary: 'POST with action: get-review-summary',
        respondToReview: 'POST with action: respond-to-review',
        markHelpful: 'POST with action: mark-helpful',
        reportReview: 'POST with action: report-review',
        requestRevision: 'POST with action: request-revision',
        calculateScore: 'POST with action: calculate-score',
        getReviewAnalytics: 'POST with action: get-review-analytics',
        verifyReview: 'POST with action: verify-review'
      }
    }
  })
}
