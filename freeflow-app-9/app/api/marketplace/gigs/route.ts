// Phase 6: Gig Listings API - Beats Fiverr
// Gap: Gig Listings (HIGH Priority)
// Competitors: Fiverr (gig marketplace), Contra
// Our Advantage: AI-optimized gig creation, dynamic pricing, package builder, analytics

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Demo gig listings
const demoGigs = [
  {
    id: 'gig-001',
    freelancerId: 'fl-001',
    freelancerName: 'Sarah Chen',
    freelancerLevel: 'Top Rated Plus',
    title: 'I will build a modern React web application',
    slug: 'build-modern-react-web-application',
    description: `Get a professionally built React web application tailored to your needs!

**What you'll get:**
- Clean, modern code using React 18+ and TypeScript
- Responsive design that works on all devices
- SEO-optimized structure
- Performance optimization
- Source code with documentation

**Why choose me?**
- 8+ years of React experience
- 87 completed projects with 98% success rate
- Fast delivery and excellent communication

**My process:**
1. Requirements discussion
2. Design approval
3. Development with regular updates
4. Testing and QA
5. Delivery and revisions`,
    category: 'Web Development',
    subcategory: 'React Development',
    tags: ['react', 'typescript', 'nextjs', 'frontend', 'web-app'],
    images: [
      '/gigs/sarah/react-gig-1.jpg',
      '/gigs/sarah/react-gig-2.jpg',
      '/gigs/sarah/react-gig-3.jpg'
    ],
    video: '/gigs/sarah/react-intro.mp4',
    packages: {
      basic: {
        name: 'Starter',
        price: 500,
        description: 'Simple React application with up to 3 pages',
        deliveryDays: 7,
        revisions: 2,
        features: [
          '3 pages',
          'Responsive design',
          'Basic animations',
          'Source code'
        ]
      },
      standard: {
        name: 'Professional',
        price: 1200,
        description: 'Full React application with authentication',
        deliveryDays: 14,
        revisions: 3,
        features: [
          '7 pages',
          'User authentication',
          'Database integration',
          'API integration',
          'Responsive design',
          'Source code',
          '30 days support'
        ]
      },
      premium: {
        name: 'Enterprise',
        price: 3000,
        description: 'Complete solution with advanced features',
        deliveryDays: 30,
        revisions: 'Unlimited',
        features: [
          '15+ pages',
          'Full authentication system',
          'Admin dashboard',
          'Payment integration',
          'Advanced animations',
          'Performance optimization',
          'SEO setup',
          'Source code',
          '90 days support',
          'Deployment assistance'
        ]
      }
    },
    addOns: [
      { id: 'addon-1', name: 'Extra page', price: 75, description: 'Add one additional page' },
      { id: 'addon-2', name: 'Express delivery', price: 150, description: '50% faster delivery' },
      { id: 'addon-3', name: 'API integration', price: 200, description: 'Connect to external API' },
      { id: 'addon-4', name: 'Extended support', price: 100, description: '30 extra days of support' }
    ],
    requirements: [
      { question: 'What is the purpose of your web application?', type: 'text', required: true },
      { question: 'Do you have design mockups or wireframes?', type: 'select', options: ['Yes', 'No', 'Need help'], required: true },
      { question: 'What features do you need?', type: 'multiselect', options: ['Authentication', 'Database', 'Payment', 'Admin Panel'], required: true },
      { question: 'Any reference websites you like?', type: 'text', required: false }
    ],
    faqs: [
      { question: 'Do you provide the source code?', answer: 'Yes, you receive full ownership of all source code.' },
      { question: 'Can you help with hosting?', answer: 'Yes, I can help deploy to Vercel, AWS, or your preferred platform.' },
      { question: 'What if I need changes after delivery?', answer: 'You get revisions included in your package, and I offer ongoing support packages.' }
    ],
    stats: {
      orders: 234,
      rating: 4.98,
      totalReviews: 198,
      responseTime: '< 1 hour',
      onTimeDelivery: 99,
      repeatClients: 65
    },
    seo: {
      title: 'Professional React Web Application Development | FreeFlow',
      description: 'Get a modern, responsive React web application built by a top-rated developer. Fast delivery, clean code, and excellent support.',
      keywords: ['react development', 'web application', 'frontend developer', 'react expert']
    },
    status: 'active',
    featured: true,
    impressions: 45000,
    clicks: 3200,
    conversionRate: 7.3,
    createdAt: '2023-06-15',
    updatedAt: '2024-01-10'
  },
  {
    id: 'gig-002',
    freelancerId: 'fl-002',
    freelancerName: 'Marcus Johnson',
    freelancerLevel: 'Top Rated',
    title: 'I will design a stunning UI/UX for your mobile app',
    slug: 'design-stunning-mobile-app-ui-ux',
    description: 'Transform your app idea into beautiful, user-friendly designs...',
    category: 'Design',
    subcategory: 'UI/UX Design',
    tags: ['ui-design', 'ux-design', 'mobile-app', 'figma', 'prototype'],
    images: ['/gigs/marcus/design-1.jpg'],
    video: null,
    packages: {
      basic: {
        name: 'Basic',
        price: 300,
        description: '3 mobile screens',
        deliveryDays: 5,
        revisions: 2,
        features: ['3 screens', 'Figma file', 'Mobile design']
      },
      standard: {
        name: 'Standard',
        price: 800,
        description: '8 screens with prototype',
        deliveryDays: 10,
        revisions: 3,
        features: ['8 screens', 'Interactive prototype', 'Design system', 'Figma file']
      },
      premium: {
        name: 'Premium',
        price: 2000,
        description: 'Complete app design',
        deliveryDays: 21,
        revisions: 'Unlimited',
        features: ['20+ screens', 'Full prototype', 'Design system', 'User flows', 'Handoff ready']
      }
    },
    addOns: [],
    requirements: [],
    faqs: [],
    stats: {
      orders: 156,
      rating: 4.95,
      totalReviews: 142,
      responseTime: '< 2 hours',
      onTimeDelivery: 98,
      repeatClients: 58
    },
    seo: {
      title: 'Professional Mobile App UI/UX Design | FreeFlow',
      description: 'Get stunning mobile app designs from a top-rated designer.',
      keywords: ['mobile app design', 'ui ux design', 'figma designer']
    },
    status: 'active',
    featured: false,
    impressions: 28000,
    clicks: 1800,
    conversionRate: 6.4,
    createdAt: '2023-08-20',
    updatedAt: '2024-01-05'
  }
]

// Gig categories
const gigCategories = [
  { id: 'web-dev', name: 'Web Development', subcategories: ['React', 'Vue', 'Angular', 'WordPress', 'Full-Stack'] },
  { id: 'mobile', name: 'Mobile Development', subcategories: ['iOS', 'Android', 'React Native', 'Flutter'] },
  { id: 'design', name: 'Design', subcategories: ['UI/UX', 'Graphic Design', 'Logo', 'Brand Identity'] },
  { id: 'writing', name: 'Writing', subcategories: ['Content Writing', 'Copywriting', 'Technical Writing'] },
  { id: 'video', name: 'Video & Animation', subcategories: ['Video Editing', 'Animation', 'Motion Graphics'] },
  { id: 'marketing', name: 'Digital Marketing', subcategories: ['SEO', 'Social Media', 'PPC', 'Email Marketing'] }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'search-gigs':
        return handleSearchGigs(params)
      case 'get-gig':
        return handleGetGig(params)
      case 'create-gig':
        return handleCreateGig(params)
      case 'update-gig':
        return handleUpdateGig(params)
      case 'add-package':
        return handleAddPackage(params)
      case 'add-addon':
        return handleAddAddon(params)
      case 'get-gig-analytics':
        return handleGetGigAnalytics(params)
      case 'ai-optimize-gig':
        return handleAIOptimizeGig(params)
      case 'generate-gig-content':
        return handleGenerateGigContent(params)
      case 'calculate-pricing':
        return handleCalculatePricing(params)
      case 'toggle-status':
        return handleToggleStatus(params)
      case 'feature-gig':
        return handleFeatureGig(params)
      case 'get-trending':
        return handleGetTrending(params)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Gigs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleSearchGigs(params: {
  query?: string
  category?: string
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  deliveryTime?: number
  sellerLevel?: string
  sortBy?: string
  page?: number
  limit?: number
}) {
  const {
    query,
    category,
    subcategory,
    minPrice,
    maxPrice,
    deliveryTime,
    sellerLevel,
    sortBy = 'recommended',
    page = 1,
    limit = 24
  } = params

  let gigs = [...demoGigs]

  // Apply filters
  if (query) {
    const queryLower = query.toLowerCase()
    gigs = gigs.filter(g =>
      g.title.toLowerCase().includes(queryLower) ||
      g.description.toLowerCase().includes(queryLower) ||
      g.tags.some(t => t.includes(queryLower))
    )
  }

  if (category) {
    gigs = gigs.filter(g => g.category === category)
  }

  if (subcategory) {
    gigs = gigs.filter(g => g.subcategory === subcategory)
  }

  if (minPrice) {
    gigs = gigs.filter(g => g.packages.basic.price >= minPrice)
  }

  if (maxPrice) {
    gigs = gigs.filter(g => g.packages.basic.price <= maxPrice)
  }

  if (deliveryTime) {
    gigs = gigs.filter(g => g.packages.basic.deliveryDays <= deliveryTime)
  }

  if (sellerLevel) {
    gigs = gigs.filter(g => g.freelancerLevel === sellerLevel)
  }

  // Sort
  switch (sortBy) {
    case 'recommended':
      gigs.sort((a, b) => (b.stats.rating * b.stats.orders) - (a.stats.rating * a.stats.orders))
      break
    case 'best-selling':
      gigs.sort((a, b) => b.stats.orders - a.stats.orders)
      break
    case 'newest':
      gigs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'price-low':
      gigs.sort((a, b) => a.packages.basic.price - b.packages.basic.price)
      break
    case 'price-high':
      gigs.sort((a, b) => b.packages.basic.price - a.packages.basic.price)
      break
  }

  // Pagination
  const startIndex = (page - 1) * limit
  const paginatedGigs = gigs.slice(startIndex, startIndex + limit)

  return NextResponse.json({
    success: true,
    data: {
      gigs: paginatedGigs.map(g => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        freelancerName: g.freelancerName,
        freelancerLevel: g.freelancerLevel,
        image: g.images[0],
        startingPrice: g.packages.basic.price,
        rating: g.stats.rating,
        reviewCount: g.stats.totalReviews,
        deliveryDays: g.packages.basic.deliveryDays
      })),
      pagination: {
        page,
        limit,
        total: gigs.length,
        totalPages: Math.ceil(gigs.length / limit)
      },
      filters: {
        categories: gigCategories,
        sellerLevels: ['New Seller', 'Rising Talent', 'Top Rated', 'Top Rated Plus'],
        deliveryOptions: [1, 3, 7, 14, 30]
      }
    }
  })
}

async function handleGetGig(params: { gigId?: string, slug?: string }) {
  const { gigId, slug } = params

  const gig = gigId
    ? demoGigs.find(g => g.id === gigId)
    : demoGigs.find(g => g.slug === slug)

  if (!gig) {
    return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  }

  // Track impression
  gig.impressions += 1

  return NextResponse.json({
    success: true,
    data: {
      ...gig,
      relatedGigs: demoGigs.filter(g => g.id !== gig.id && g.category === gig.category).slice(0, 4)
    }
  })
}

async function handleCreateGig(params: {
  freelancerId: string
  title: string
  description: string
  category: string
  subcategory: string
  tags: string[]
  packages: typeof demoGigs[0]['packages']
}) {
  const { freelancerId, title, description, category, subcategory, tags, packages } = params

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)

  const newGig = {
    id: `gig-${Date.now()}`,
    freelancerId,
    title,
    slug,
    description,
    category,
    subcategory,
    tags,
    images: [],
    video: null,
    packages,
    addOns: [],
    requirements: [],
    faqs: [],
    stats: {
      orders: 0,
      rating: 0,
      totalReviews: 0,
      responseTime: 'N/A',
      onTimeDelivery: 0,
      repeatClients: 0
    },
    status: 'draft',
    featured: false,
    impressions: 0,
    clicks: 0,
    conversionRate: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  return NextResponse.json({
    success: true,
    data: {
      gig: newGig,
      message: 'Gig created as draft',
      nextSteps: [
        'Add high-quality images (min 3)',
        'Add a video introduction',
        'Set up gig requirements',
        'Add FAQs',
        'Publish when ready'
      ]
    }
  })
}

async function handleUpdateGig(params: { gigId: string, updates: Record<string, unknown> }) {
  const { gigId, updates } = params

  const gig = demoGigs.find(g => g.id === gigId)

  if (!gig) {
    return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      gig: { ...gig, ...updates, updatedAt: new Date().toISOString() },
      message: 'Gig updated successfully'
    }
  })
}

async function handleAddPackage(params: {
  gigId: string
  packageType: 'basic' | 'standard' | 'premium'
  package: {
    name: string
    price: number
    description: string
    deliveryDays: number
    revisions: number | string
    features: string[]
  }
}) {
  const { gigId, packageType, package: pkg } = params

  return NextResponse.json({
    success: true,
    data: {
      gigId,
      packageType,
      package: pkg,
      message: `${packageType} package updated`
    }
  })
}

async function handleAddAddon(params: {
  gigId: string
  addon: {
    name: string
    price: number
    description: string
  }
}) {
  const { gigId, addon } = params

  return NextResponse.json({
    success: true,
    data: {
      gigId,
      addon: {
        id: `addon-${Date.now()}`,
        ...addon
      },
      message: 'Add-on created'
    }
  })
}

async function handleGetGigAnalytics(params: {
  gigId: string
  period?: string
}) {
  const { gigId, period = '30days' } = params

  const gig = demoGigs.find(g => g.id === gigId)

  if (!gig) {
    return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      gigId,
      period,
      analytics: {
        impressions: gig.impressions,
        clicks: gig.clicks,
        clickThroughRate: ((gig.clicks / gig.impressions) * 100).toFixed(2) + '%',
        orders: gig.stats.orders,
        conversionRate: gig.conversionRate.toFixed(2) + '%',
        revenue: gig.stats.orders * gig.packages.standard.price * 0.7, // Estimated
        avgOrderValue: gig.packages.standard.price,
        searchAppearances: Math.round(gig.impressions * 1.5),
        savedByBuyers: Math.round(gig.clicks * 0.15),
        trendsComparison: {
          impressions: '+12%',
          clicks: '+8%',
          orders: '+15%'
        },
        topSearchTerms: ['react developer', 'web application', 'frontend'],
        peakHours: ['10 AM PST', '2 PM PST', '8 PM EST'],
        buyerDemographics: {
          countries: [
            { country: 'USA', percentage: 45 },
            { country: 'UK', percentage: 20 },
            { country: 'Germany', percentage: 10 }
          ],
          devices: { desktop: 60, mobile: 35, tablet: 5 }
        }
      }
    }
  })
}

async function handleAIOptimizeGig(params: { gigId: string }) {
  const { gigId } = params

  const gig = demoGigs.find(g => g.id === gigId)

  if (!gig) {
    return NextResponse.json({ error: 'Gig not found' }, { status: 404 })
  }

  const optimizations = {
    currentScore: 78,
    potentialScore: 95,
    title: {
      current: gig.title,
      suggested: 'I will build a professional React web app with TypeScript and Next.js',
      reason: 'Including specific technologies improves search ranking by 35%'
    },
    tags: {
      current: gig.tags,
      suggested: [...gig.tags, 'web-development', 'javascript', 'responsive-design'],
      reason: 'Adding related tags increases visibility'
    },
    pricing: {
      basic: { current: gig.packages.basic.price, suggested: 449, reason: 'Psychological pricing increases conversions' },
      standard: { current: gig.packages.standard.price, suggested: 1199, reason: 'Standard package has highest conversion' },
      premium: { current: gig.packages.premium.price, suggested: 2999, reason: 'Premium pricing signals quality' }
    },
    description: {
      improvements: [
        'Add bullet points for better readability',
        'Include social proof (mention 87 projects)',
        'Add a call-to-action at the end'
      ]
    },
    images: {
      current: gig.images.length,
      recommended: 5,
      suggestions: ['Add portfolio showcase', 'Add process infographic', 'Add before/after example']
    },
    competitorAnalysis: {
      avgPrice: 650,
      avgDelivery: 10,
      yourAdvantage: 'Faster delivery, better reviews'
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      optimizations,
      estimatedImpact: {
        impressions: '+45%',
        clicks: '+30%',
        orders: '+20%'
      }
    }
  })
}

async function handleGenerateGigContent(params: {
  category: string
  skills: string[]
  experience: string
  targetAudience?: string
}) {
  const { category, skills, experience, targetAudience = 'businesses' } = params

  const generatedContent = {
    titleOptions: [
      `I will create a professional ${skills[0]} solution for your business`,
      `I will build a custom ${skills[0]} project with ${skills[1] || 'modern technologies'}`,
      `Expert ${skills[0]} developer - fast delivery, quality work`
    ],
    description: `Transform your ideas into reality with professional ${category.toLowerCase()} services!

**What I Offer:**
${skills.map(s => `- Expert ${s} development`).join('\n')}

**Why Work With Me?**
- ${experience} of professional experience
- Dedicated to quality and client satisfaction
- Clear communication throughout the project
- On-time delivery guaranteed

**My Process:**
1. Understand your requirements
2. Provide detailed proposal
3. Regular progress updates
4. Thorough testing
5. Deliver polished results

Let's discuss your project!`,
    suggestedTags: skills.map(s => s.toLowerCase().replace(/\s+/g, '-')).concat([
      category.toLowerCase().replace(/\s+/g, '-'),
      'professional',
      'expert'
    ]),
    packageSuggestions: {
      basic: {
        name: 'Starter',
        priceSuggestion: 299,
        features: ['Basic implementation', 'Source files', '2 revisions']
      },
      standard: {
        name: 'Professional',
        priceSuggestion: 799,
        features: ['Full implementation', 'Documentation', '3 revisions', '14-day support']
      },
      premium: {
        name: 'Enterprise',
        priceSuggestion: 1999,
        features: ['Complete solution', 'Priority support', 'Unlimited revisions', '30-day support']
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      generatedContent,
      tips: [
        'Customize the template with your unique selling points',
        'Add specific examples from your portfolio',
        'Include a compelling call-to-action'
      ]
    }
  })
}

async function handleCalculatePricing(params: {
  category: string
  complexity: 'simple' | 'medium' | 'complex'
  deliveryDays: number
  features: string[]
}) {
  const { category, complexity, deliveryDays, features } = params

  const basePrice = {
    simple: 200,
    medium: 500,
    complex: 1200
  }

  const categoryMultiplier: Record<string, number> = {
    'Web Development': 1.2,
    'Mobile Development': 1.3,
    'Design': 1.0,
    'Writing': 0.7,
    'Video & Animation': 1.1
  }

  const deliveryMultiplier = deliveryDays <= 3 ? 1.5 : deliveryDays <= 7 ? 1.2 : 1.0
  const featureAddon = features.length * 50

  const multiplier = categoryMultiplier[category] || 1.0
  const suggestedPrice = Math.round(
    (basePrice[complexity] * multiplier * deliveryMultiplier + featureAddon) / 10
  ) * 10

  return NextResponse.json({
    success: true,
    data: {
      suggestedPricing: {
        basic: suggestedPrice,
        standard: Math.round(suggestedPrice * 2.2),
        premium: Math.round(suggestedPrice * 4.5)
      },
      breakdown: {
        basePrice: basePrice[complexity],
        categoryMultiplier: multiplier,
        deliveryMultiplier,
        featureAddon
      },
      marketComparison: {
        low: Math.round(suggestedPrice * 0.6),
        average: suggestedPrice,
        high: Math.round(suggestedPrice * 1.5)
      },
      recommendation: complexity === 'simple'
        ? 'Price competitively to build initial reviews'
        : 'Your pricing reflects the complexity well'
    }
  })
}

async function handleToggleStatus(params: { gigId: string, status: 'active' | 'paused' | 'draft' }) {
  const { gigId, status } = params

  return NextResponse.json({
    success: true,
    data: {
      gigId,
      status,
      message: `Gig ${status === 'active' ? 'activated' : status === 'paused' ? 'paused' : 'set to draft'}`
    }
  })
}

async function handleFeatureGig(params: {
  gigId: string
  duration: number
  placement: 'category' | 'homepage' | 'search'
}) {
  const { gigId, duration, placement } = params

  const pricing = {
    category: 19,
    search: 39,
    homepage: 99
  }

  return NextResponse.json({
    success: true,
    data: {
      gigId,
      featured: {
        placement,
        duration: `${duration} days`,
        cost: pricing[placement] * duration,
        estimatedImpressions: {
          category: '5,000-10,000',
          search: '15,000-30,000',
          homepage: '50,000-100,000'
        }[placement],
        startDate: new Date().toISOString()
      }
    }
  })
}

async function handleGetTrending(params: { category?: string, limit?: number }) {
  const { category, limit = 10 } = params

  let gigs = [...demoGigs]

  if (category) {
    gigs = gigs.filter(g => g.category === category)
  }

  // Sort by recent performance
  gigs.sort((a, b) => b.conversionRate - a.conversionRate)

  return NextResponse.json({
    success: true,
    data: {
      trending: gigs.slice(0, limit),
      trendingCategories: [
        { category: 'AI Development', growth: '+145%' },
        { category: 'Video Editing', growth: '+78%' },
        { category: 'UI/UX Design', growth: '+45%' }
      ],
      emergingSkills: ['AI/ML', 'Prompt Engineering', 'No-Code Development']
    }
  })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Gig Listings API - Beats Fiverr',
      features: [
        'Three-tier package system',
        'Custom add-ons',
        'AI gig optimization',
        'Content generator',
        'Dynamic pricing calculator',
        'Advanced analytics',
        'Featured placements',
        'Trending insights'
      ],
      categories: gigCategories,
      endpoints: {
        searchGigs: 'POST with action: search-gigs',
        getGig: 'POST with action: get-gig',
        createGig: 'POST with action: create-gig',
        updateGig: 'POST with action: update-gig',
        addPackage: 'POST with action: add-package',
        addAddon: 'POST with action: add-addon',
        getGigAnalytics: 'POST with action: get-gig-analytics',
        aiOptimizeGig: 'POST with action: ai-optimize-gig',
        generateGigContent: 'POST with action: generate-gig-content',
        calculatePricing: 'POST with action: calculate-pricing',
        toggleStatus: 'POST with action: toggle-status',
        featureGig: 'POST with action: feature-gig',
        getTrending: 'POST with action: get-trending'
      }
    }
  })
}
