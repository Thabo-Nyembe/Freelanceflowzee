import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('API-AIComponentRecommendations')

// Component templates by project type
const componentTemplates: Record<string, any[]> = {
  dashboard: [
    { name: 'Analytics Dashboard', category: 'analytics', baseScore: 92 },
    { name: 'KPI Cards', category: 'metrics', baseScore: 88 },
    { name: 'Activity Feed', category: 'engagement', baseScore: 85 },
    { name: 'Quick Actions Bar', category: 'productivity', baseScore: 90 }
  ],
  ecommerce: [
    { name: 'Product Catalog', category: 'commerce', baseScore: 94 },
    { name: 'Shopping Cart', category: 'checkout', baseScore: 91 },
    { name: 'Customer Reviews', category: 'social-proof', baseScore: 87 },
    { name: 'Wishlist', category: 'engagement', baseScore: 83 }
  ],
  portfolio: [
    { name: 'Project Gallery', category: 'showcase', baseScore: 93 },
    { name: 'Contact Form', category: 'conversion', baseScore: 89 },
    { name: 'Testimonials', category: 'social-proof', baseScore: 86 },
    { name: 'Skills Section', category: 'expertise', baseScore: 84 }
  ],
  saas: [
    { name: 'User Dashboard', category: 'core', baseScore: 95 },
    { name: 'Pricing Table', category: 'conversion', baseScore: 91 },
    { name: 'Feature Comparison', category: 'sales', baseScore: 88 },
    { name: 'Onboarding Flow', category: 'activation', baseScore: 92 }
  ],
  blog: [
    { name: 'Article Cards', category: 'content', baseScore: 90 },
    { name: 'Search & Filter', category: 'navigation', baseScore: 87 },
    { name: 'Newsletter Signup', category: 'conversion', baseScore: 85 },
    { name: 'Related Posts', category: 'engagement', baseScore: 82 }
  ],
  default: [
    { name: 'Hero Section', category: 'core', baseScore: 88 },
    { name: 'Feature Grid', category: 'showcase', baseScore: 85 },
    { name: 'CTA Section', category: 'conversion', baseScore: 90 },
    { name: 'Footer Navigation', category: 'navigation', baseScore: 80 }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectType, projectId, existingComponents } = await request.json();

    const type = projectType?.toLowerCase() || 'default'
    const templates = componentTemplates[type] || componentTemplates.default

    // Generate personalized recommendations
    const recommendations = templates.map((template, index) => {
      const varianceScore = Math.floor(Math.random() * 10) - 5
      const aiScore = Math.min(100, Math.max(70, template.baseScore + varianceScore))
      const conversionBoost = Math.floor(15 + (aiScore - 80) * 0.5)

      return {
        id: `rec-${Date.now()}-${index}`,
        name: template.name,
        description: `Optimized ${template.name.toLowerCase()} component for ${type} projects`,
        category: template.category,
        aiScore,
        conversionBoost: `+${conversionBoost}%`,
        priority: aiScore >= 90 ? 'high' : aiScore >= 85 ? 'medium' : 'low',
        implementation: generateImplementationSteps(template.name, template.category),
        estimatedEffort: aiScore >= 90 ? '2-4 hours' : '4-8 hours',
        tags: [type, template.category, 'ai-recommended']
      }
    }).sort((a, b) => b.aiScore - a.aiScore)

    // Save recommendations to database
    const { data: savedRec, error: dbError } = await supabase
      .from('component_recommendations')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        project_type: type,
        recommendations: recommendations,
        existing_components: existingComponents || [],
        status: 'generated'
      })
      .select()
      .single()

    if (dbError) {
      logger.error('Database error saving recommendations', { error: dbError.message })
    }

    return NextResponse.json({
      success: true,
      id: savedRec?.id,
      projectType: type,
      recommendations: {
        components: recommendations,
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'high').length
      }
    });
  } catch (error) {
    logger.error('AI Component Recommendations error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('component_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: recommendations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations || [],
      count: recommendations?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function generateImplementationSteps(componentName: string, category: string): string[] {
  const baseSteps = [
    `Create ${componentName} component structure`,
    'Add responsive styling and animations',
    'Integrate with data layer'
  ]

  const categorySteps: Record<string, string[]> = {
    analytics: ['Connect to analytics API', 'Add chart visualizations'],
    conversion: ['Add tracking events', 'A/B test variations'],
    engagement: ['Add real-time updates', 'Implement notifications'],
    commerce: ['Connect to payment system', 'Add inventory checks'],
    core: ['Setup state management', 'Add error handling']
  }

  return [...baseSteps, ...(categorySteps[category] || ['Add unit tests'])]
}