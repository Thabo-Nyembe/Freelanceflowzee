// Phase 6: Freelancer Talent Search API - Beats Upwork & Toptal
// Gap: Freelancer Talent Search (HIGH Priority)
// Competitors: Upwork (basic search), Toptal (curated network)
// Our Advantage: AI-powered talent discovery, skill verification, real-time availability

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo freelancer data for testing
const demoFreelancers = [
  {
    id: 'fl-001',
    name: 'Sarah Chen',
    title: 'Senior Full-Stack Developer',
    avatar: '/avatars/sarah.jpg',
    location: 'San Francisco, CA',
    timezone: 'PST',
    hourlyRate: 150,
    currency: 'USD',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    experienceYears: 8,
    totalEarnings: 450000,
    completedProjects: 87,
    successRate: 98,
    responseTime: '< 1 hour',
    availability: 'available',
    availableHoursPerWeek: 40,
    verificationLevel: 'top-rated-plus',
    badges: ['Rising Talent', 'Top Rated Plus', 'Expert Vetted'],
    languages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Mandarin', proficiency: 'fluent' }
    ],
    education: [
      { degree: 'MS Computer Science', institution: 'Stanford University', year: 2016 }
    ],
    certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
    portfolio: {
      items: 12,
      featured: ['E-commerce Platform', 'FinTech Dashboard', 'Healthcare App']
    },
    reviews: {
      average: 4.98,
      total: 145,
      breakdown: { 5: 140, 4: 4, 3: 1, 2: 0, 1: 0 }
    },
    aiMatchScore: 97,
    lastActive: '2 minutes ago'
  },
  {
    id: 'fl-002',
    name: 'Marcus Johnson',
    title: 'UI/UX Design Lead',
    avatar: '/avatars/marcus.jpg',
    location: 'London, UK',
    timezone: 'GMT',
    hourlyRate: 120,
    currency: 'USD',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Design Systems', 'Prototyping'],
    experienceYears: 10,
    totalEarnings: 380000,
    completedProjects: 124,
    successRate: 99,
    responseTime: '< 2 hours',
    availability: 'available',
    availableHoursPerWeek: 30,
    verificationLevel: 'expert-vetted',
    badges: ['Top Rated Plus', 'Expert Vetted', 'Design Expert'],
    languages: [
      { language: 'English', proficiency: 'native' }
    ],
    education: [
      { degree: 'BA Graphic Design', institution: 'Royal College of Art', year: 2014 }
    ],
    certifications: ['Google UX Design', 'Nielsen Norman Group'],
    portfolio: {
      items: 24,
      featured: ['Banking App Redesign', 'SaaS Dashboard', 'Mobile Commerce']
    },
    reviews: {
      average: 4.99,
      total: 198,
      breakdown: { 5: 196, 4: 2, 3: 0, 2: 0, 1: 0 }
    },
    aiMatchScore: 94,
    lastActive: '15 minutes ago'
  },
  {
    id: 'fl-003',
    name: 'Elena Rodriguez',
    title: 'DevOps & Cloud Architect',
    avatar: '/avatars/elena.jpg',
    location: 'Berlin, Germany',
    timezone: 'CET',
    hourlyRate: 175,
    currency: 'USD',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'Docker', 'CI/CD'],
    experienceYears: 12,
    totalEarnings: 620000,
    completedProjects: 56,
    successRate: 100,
    responseTime: '< 30 minutes',
    availability: 'limited',
    availableHoursPerWeek: 20,
    verificationLevel: 'expert-vetted',
    badges: ['Top Rated Plus', 'Expert Vetted', 'Enterprise Ready'],
    languages: [
      { language: 'English', proficiency: 'fluent' },
      { language: 'Spanish', proficiency: 'native' },
      { language: 'German', proficiency: 'conversational' }
    ],
    education: [
      { degree: 'PhD Computer Engineering', institution: 'TU Munich', year: 2012 }
    ],
    certifications: ['AWS DevOps Professional', 'CKA', 'HashiCorp Terraform'],
    portfolio: {
      items: 8,
      featured: ['Enterprise Migration', 'Multi-Cloud Architecture', 'Zero-Downtime Deploy']
    },
    reviews: {
      average: 5.0,
      total: 89,
      breakdown: { 5: 89, 4: 0, 3: 0, 2: 0, 1: 0 }
    },
    aiMatchScore: 91,
    lastActive: '1 hour ago'
  }
]

// Skill categories for filtering
const skillCategories = {
  development: ['React', 'Node.js', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby'],
  design: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'UX Research', 'Prototyping'],
  devops: ['Kubernetes', 'Docker', 'AWS', 'GCP', 'Azure', 'Terraform', 'CI/CD'],
  data: ['Python', 'SQL', 'Machine Learning', 'Data Analysis', 'Tableau', 'Power BI'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
  marketing: ['SEO', 'Content Writing', 'Social Media', 'PPC', 'Email Marketing']
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'search':
        return handleSearch(params)
      case 'get-freelancer':
        return handleGetFreelancer(params)
      case 'ai-recommend':
        return handleAIRecommend(params)
      case 'filter-by-skills':
        return handleFilterBySkills(params)
      case 'filter-by-availability':
        return handleFilterByAvailability(params)
      case 'get-similar':
        return handleGetSimilar(params)
      case 'save-search':
        return handleSaveSearch(params)
      case 'get-trending-skills':
        return handleGetTrendingSkills(params)
      case 'instant-match':
        return handleInstantMatch(params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Freelancer search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleSearch(params: {
  query?: string
  skills?: string[]
  minRate?: number
  maxRate?: number
  availability?: string
  location?: string
  experienceYears?: number
  verificationLevel?: string
  sortBy?: string
  page?: number
  limit?: number
}) {
  const {
    query,
    skills,
    minRate,
    maxRate,
    availability,
    location,
    experienceYears,
    verificationLevel,
    sortBy = 'aiMatchScore',
    page = 1,
    limit = 20
  } = params

  // In production, this would query Supabase with full-text search
  let results = [...demoFreelancers]

  // Apply filters
  if (query) {
    const queryLower = query.toLowerCase()
    results = results.filter(f =>
      f.name.toLowerCase().includes(queryLower) ||
      f.title.toLowerCase().includes(queryLower) ||
      f.skills.some(s => s.toLowerCase().includes(queryLower))
    )
  }

  if (skills && skills.length > 0) {
    results = results.filter(f =>
      skills.some(skill => f.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase()))
    )
  }

  if (minRate) {
    results = results.filter(f => f.hourlyRate >= minRate)
  }

  if (maxRate) {
    results = results.filter(f => f.hourlyRate <= maxRate)
  }

  if (availability) {
    results = results.filter(f => f.availability === availability)
  }

  if (verificationLevel) {
    results = results.filter(f => f.verificationLevel === verificationLevel)
  }

  // Sort results
  results.sort((a, b) => {
    switch (sortBy) {
      case 'aiMatchScore':
        return b.aiMatchScore - a.aiMatchScore
      case 'hourlyRate':
        return a.hourlyRate - b.hourlyRate
      case 'successRate':
        return b.successRate - a.successRate
      case 'experienceYears':
        return b.experienceYears - a.experienceYears
      case 'totalEarnings':
        return b.totalEarnings - a.totalEarnings
      default:
        return b.aiMatchScore - a.aiMatchScore
    }
  })

  // Pagination
  const startIndex = (page - 1) * limit
  const paginatedResults = results.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    success: true,
    data: {
      freelancers: paginatedResults,
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit)
      },
      filters: {
        skillCategories,
        availabilityOptions: ['available', 'limited', 'busy'],
        verificationLevels: ['rising-talent', 'top-rated', 'top-rated-plus', 'expert-vetted'],
        sortOptions: ['aiMatchScore', 'hourlyRate', 'successRate', 'experienceYears']
      }
    }
  })
}

async function handleGetFreelancer(params: { freelancerId: string }) {
  const { freelancerId } = params

  const freelancer = demoFreelancers.find(f => f.id === freelancerId)

  if (!freelancer) {
    return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 })
  }

  // Add extended profile data
  const extendedProfile = {
    ...freelancer,
    workHistory: [
      {
        title: 'Full-Stack Development for FinTech Startup',
        client: 'Confidential',
        duration: '6 months',
        budget: 75000,
        rating: 5,
        feedback: 'Exceptional work quality and communication. Delivered ahead of schedule.'
      },
      {
        title: 'E-commerce Platform Redesign',
        client: 'RetailCo',
        duration: '4 months',
        budget: 45000,
        rating: 5,
        feedback: 'Outstanding technical skills. Would hire again without hesitation.'
      }
    ],
    testimonials: [
      {
        author: 'John Smith',
        company: 'TechStartup Inc',
        text: 'One of the best developers I\'ve worked with. Highly recommended!',
        rating: 5
      }
    ],
    availability_calendar: {
      thisWeek: { available: 35, booked: 5 },
      nextWeek: { available: 40, booked: 0 },
      timezone: freelancer.timezone
    }
  }

  return NextResponse.json({
    success: true,
    data: extendedProfile
  })
}

async function handleAIRecommend(params: {
  projectDescription: string
  requiredSkills: string[]
  budget?: number
  timeline?: string
  projectType?: string
}) {
  const { projectDescription, requiredSkills, budget, timeline, projectType } = params

  // AI-powered matching algorithm (simulated)
  // In production, this would use ML models trained on successful project outcomes
  const recommendations = demoFreelancers.map(freelancer => {
    let matchScore = 0
    const matchReasons: string[] = []

    // Skill match (40% weight)
    const matchedSkills = requiredSkills.filter(skill =>
      freelancer.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
    )
    const skillMatchPercent = (matchedSkills.length / requiredSkills.length) * 100
    matchScore += skillMatchPercent * 0.4
    if (matchedSkills.length > 0) {
      matchReasons.push(`Matches ${matchedSkills.length}/${requiredSkills.length} required skills`)
    }

    // Budget fit (20% weight)
    if (budget) {
      const estimatedHours = budget / freelancer.hourlyRate
      if (estimatedHours >= 20) {
        matchScore += 20
        matchReasons.push('Budget aligns with rate')
      }
    }

    // Success rate (20% weight)
    matchScore += (freelancer.successRate / 100) * 20
    if (freelancer.successRate >= 95) {
      matchReasons.push(`${freelancer.successRate}% success rate`)
    }

    // Availability (20% weight)
    if (freelancer.availability === 'available') {
      matchScore += 20
      matchReasons.push('Immediately available')
    } else if (freelancer.availability === 'limited') {
      matchScore += 10
      matchReasons.push('Limited availability')
    }

    return {
      freelancer,
      matchScore: Math.round(matchScore),
      matchReasons,
      estimatedProjectFit: matchScore >= 80 ? 'Excellent' : matchScore >= 60 ? 'Good' : 'Fair'
    }
  })

  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore)

  return NextResponse.json({
    success: true,
    data: {
      recommendations: recommendations.slice(0, 10),
      aiInsights: {
        topMatch: recommendations[0]?.freelancer.name,
        averageMatchScore: Math.round(
          recommendations.reduce((sum, r) => sum + r.matchScore, 0) / recommendations.length
        ),
        suggestedBudgetRange: {
          min: Math.min(...recommendations.slice(0, 3).map(r => r.freelancer.hourlyRate * 40)),
          max: Math.max(...recommendations.slice(0, 3).map(r => r.freelancer.hourlyRate * 80))
        },
        marketAnalysis: {
          averageRate: 148,
          demandLevel: 'High',
          availableTalent: recommendations.filter(r => r.freelancer.availability === 'available').length
        }
      }
    }
  })
}

async function handleFilterBySkills(params: { skills: string[], matchAll?: boolean }) {
  const { skills, matchAll = false } = params

  let results = demoFreelancers.filter(freelancer => {
    const freelancerSkills = freelancer.skills.map(s => s.toLowerCase())
    if (matchAll) {
      return skills.every(skill => freelancerSkills.includes(skill.toLowerCase()))
    }
    return skills.some(skill => freelancerSkills.includes(skill.toLowerCase()))
  })

  return NextResponse.json({
    success: true,
    data: {
      freelancers: results,
      matchType: matchAll ? 'all_skills' : 'any_skill',
      totalMatches: results.length
    }
  })
}

async function handleFilterByAvailability(params: {
  minHoursPerWeek: number
  timezone?: string
  startDate?: string
}) {
  const { minHoursPerWeek, timezone } = params

  let results = demoFreelancers.filter(freelancer => {
    const meetsHours = freelancer.availableHoursPerWeek >= minHoursPerWeek
    const meetsTimezone = !timezone || freelancer.timezone === timezone
    return meetsHours && meetsTimezone
  })

  return NextResponse.json({
    success: true,
    data: {
      freelancers: results,
      filters: {
        minHoursPerWeek,
        timezone
      }
    }
  })
}

async function handleGetSimilar(params: { freelancerId: string, limit?: number }) {
  const { freelancerId, limit = 5 } = params

  const targetFreelancer = demoFreelancers.find(f => f.id === freelancerId)
  if (!targetFreelancer) {
    return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 })
  }

  // Find similar freelancers based on skills and rate
  const similar = demoFreelancers
    .filter(f => f.id !== freelancerId)
    .map(f => {
      const sharedSkills = f.skills.filter(skill =>
        targetFreelancer.skills.includes(skill)
      )
      const rateDiff = Math.abs(f.hourlyRate - targetFreelancer.hourlyRate)
      const similarity = (sharedSkills.length * 20) - (rateDiff * 0.1)
      return { freelancer: f, similarity, sharedSkills }
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)

  return NextResponse.json({
    success: true,
    data: {
      basedOn: targetFreelancer.name,
      similar: similar.map(s => ({
        ...s.freelancer,
        sharedSkills: s.sharedSkills,
        similarityScore: Math.round(s.similarity)
      }))
    }
  })
}

async function handleSaveSearch(params: {
  userId: string
  searchName: string
  criteria: Record<string, unknown>
  alertFrequency?: string
}) {
  const { userId, searchName, criteria, alertFrequency = 'daily' } = params

  // In production, save to Supabase
  const savedSearch = {
    id: `search-${Date.now()}`,
    userId,
    searchName,
    criteria,
    alertFrequency,
    createdAt: new Date().toISOString(),
    lastRun: null,
    matchCount: 0
  }

  return NextResponse.json({
    success: true,
    data: {
      savedSearch,
      message: `Search "${searchName}" saved. You'll receive ${alertFrequency} alerts for new matches.`
    }
  })
}

async function handleGetTrendingSkills(params: { category?: string }) {
  const { category } = params

  const trendingSkills = [
    { skill: 'AI/ML Engineering', growth: 245, demand: 'Very High', avgRate: 175 },
    { skill: 'React/Next.js', growth: 89, demand: 'Very High', avgRate: 125 },
    { skill: 'Rust Development', growth: 156, demand: 'High', avgRate: 165 },
    { skill: 'Kubernetes/DevOps', growth: 78, demand: 'High', avgRate: 150 },
    { skill: 'UI/UX Design', growth: 45, demand: 'High', avgRate: 110 },
    { skill: 'Mobile Development', growth: 34, demand: 'Medium', avgRate: 120 },
    { skill: 'Blockchain/Web3', growth: -12, demand: 'Medium', avgRate: 140 },
    { skill: 'Data Engineering', growth: 67, demand: 'High', avgRate: 145 }
  ]

  return NextResponse.json({
    success: true,
    data: {
      trending: trendingSkills,
      marketInsights: {
        hottest: 'AI/ML Engineering',
        mostStable: 'React/Next.js',
        emerging: ['Rust Development', 'AI Agents', 'LLM Fine-tuning'],
        declining: ['Blockchain/Web3', 'PHP']
      }
    }
  })
}

async function handleInstantMatch(params: {
  projectDescription: string
  budget: number
  deadline: string
  urgency: 'normal' | 'urgent' | 'critical'
}) {
  const { projectDescription, budget, deadline, urgency } = params

  // Instant matching for urgent projects
  const availableNow = demoFreelancers.filter(f => f.availability === 'available')

  const instantMatches = availableNow.map(freelancer => ({
    freelancer,
    canStartImmediately: true,
    estimatedResponseTime: freelancer.responseTime,
    urgencyFit: urgency === 'critical' ? freelancer.responseTime.includes('30') || freelancer.responseTime.includes('1 hour') : true,
    quotedRate: urgency === 'critical' ? freelancer.hourlyRate * 1.5 : freelancer.hourlyRate
  }))

  return NextResponse.json({
    success: true,
    data: {
      instantMatches: instantMatches.slice(0, 5),
      urgencyLevel: urgency,
      estimatedStartTime: urgency === 'critical' ? '< 2 hours' : '< 24 hours',
      recommendation: urgency === 'critical'
        ? 'We recommend inviting top 3 matches simultaneously for fastest response'
        : 'Send invites to your preferred match first'
    }
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  if (action === 'categories') {
    return NextResponse.json({
      success: true,
      data: {
        categories: skillCategories,
        totalFreelancers: demoFreelancers.length
      }
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      message: 'Freelancer Talent Search API - Beats Upwork & Toptal',
      features: [
        'AI-powered talent matching',
        'Skill-based filtering',
        'Real-time availability',
        'Instant match for urgent projects',
        'Saved search alerts',
        'Similar freelancer discovery',
        'Market trend insights'
      ],
      endpoints: {
        search: 'POST with action: search',
        getFreelancer: 'POST with action: get-freelancer',
        aiRecommend: 'POST with action: ai-recommend',
        filterBySkills: 'POST with action: filter-by-skills',
        filterByAvailability: 'POST with action: filter-by-availability',
        getSimilar: 'POST with action: get-similar',
        saveSearch: 'POST with action: save-search',
        getTrendingSkills: 'POST with action: get-trending-skills',
        instantMatch: 'POST with action: instant-match'
      }
    }
  })
}
