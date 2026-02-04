import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('ai-recommendations');

// ============================================================================
// WORLD-CLASS AI RECOMMENDATIONS API
// ============================================================================
// Intelligent recommendation engine powered by AI
// - Personalized content recommendations
// - Product/service recommendations
// - Pricing recommendations
// - Workflow recommendations
// - Growth recommendations
// - Content strategy recommendations
// - SEO recommendations
// - Marketing recommendations
// ============================================================================

// Types
type RecommendationType =
  | 'content'
  | 'product'
  | 'pricing'
  | 'workflow'
  | 'growth'
  | 'strategy'
  | 'seo'
  | 'marketing'
  | 'design'
  | 'engagement'
  | 'monetization'
  | 'collaboration'
  | 'automation'
  | 'learning'
  | 'networking';

type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

type UserContext = {
  industry?: string;
  businessType?: string;
  goals?: string[];
  audienceSize?: number;
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  budget?: 'limited' | 'moderate' | 'flexible' | 'enterprise';
  currentChallenges?: string[];
  preferredPlatforms?: string[];
};

interface RecommendationRequest {
  action: string;
  recommendationType?: RecommendationType;
  userContext?: UserContext;
  currentData?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  limit?: number;
  category?: string;
  includeExplanations?: boolean;
  filters?: Record<string, unknown>;
  feedbackId?: string;
  feedbackType?: 'helpful' | 'not_helpful' | 'implemented';
  contentId?: string;
  productId?: string;
  workflowId?: string;
  query?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getAIRecommendations(prompt: string, systemPrompt: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (anthropicKey) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text || '';
  }

  throw new Error('No AI provider configured');
}

function calculateRelevanceScore(
  recommendation: Record<string, unknown>,
  userContext: UserContext
): number {
  let score = 50; // Base score

  // Industry match
  if (recommendation.industry === userContext.industry) score += 15;

  // Goal alignment
  const recGoals = (recommendation.relevantGoals as string[]) || [];
  const matchingGoals = recGoals.filter(g => userContext.goals?.includes(g));
  score += matchingGoals.length * 10;

  // Experience level match
  if (recommendation.experienceLevel === userContext.experience) score += 10;

  // Budget compatibility
  if (recommendation.budgetLevel === userContext.budget) score += 10;

  return Math.min(100, Math.max(0, score));
}

function prioritizeRecommendations(
  recommendations: Record<string, unknown>[],
  userContext: UserContext
): Record<string, unknown>[] {
  return recommendations
    .map(rec => ({
      ...rec,
      relevanceScore: calculateRelevanceScore(rec, userContext),
    }))
    .sort((a, b) => (b.relevanceScore as number) - (a.relevanceScore as number));
}

// Recommendation generators for demo mode
function generateContentRecommendations(context: UserContext): Record<string, unknown>[] {
  const baseRecommendations = [
    {
      id: 'content_1',
      type: 'content',
      title: 'Create a comprehensive industry guide',
      description: 'Long-form content that establishes authority and generates organic traffic',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        traffic: '+25%',
        engagement: '+40%',
        leads: '+15%',
      },
      actionSteps: [
        'Research top 10 questions in your industry',
        'Create detailed answers with examples',
        'Add visuals and downloadable resources',
        'Optimize for target keywords',
        'Promote across social channels',
      ],
      estimatedEffort: '2-3 days',
      category: 'authority_building',
      relevantGoals: ['brand_awareness', 'lead_generation', 'seo'],
      industry: context.industry,
    },
    {
      id: 'content_2',
      type: 'content',
      title: 'Start a video series showcasing your process',
      description: 'Behind-the-scenes content that builds trust and engagement',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        engagement: '+60%',
        trust: '+35%',
        conversions: '+20%',
      },
      actionSteps: [
        'Plan 5-10 episode topics',
        'Set up simple recording setup',
        'Create consistent intro/outro',
        'Post weekly on YouTube and social',
        'Repurpose into shorts and clips',
      ],
      estimatedEffort: '4-6 hours/week',
      category: 'video_content',
      relevantGoals: ['engagement', 'brand_building', 'trust'],
    },
    {
      id: 'content_3',
      type: 'content',
      title: 'Launch an email newsletter',
      description: 'Build direct relationship with audience through regular updates',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        retention: '+45%',
        sales: '+30%',
        ltv: '+25%',
      },
      actionSteps: [
        'Define newsletter value proposition',
        'Set up email platform (ConvertKit, Mailchimp)',
        'Create welcome sequence (5 emails)',
        'Plan content calendar',
        'Add signup forms across site',
      ],
      estimatedEffort: '2-3 hours/week',
      category: 'email_marketing',
      relevantGoals: ['retention', 'sales', 'community'],
    },
    {
      id: 'content_4',
      type: 'content',
      title: 'Create case studies from best projects',
      description: 'Social proof that converts prospects into clients',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        conversions: '+40%',
        trust: '+50%',
        salesCycle: '-20%',
      },
      actionSteps: [
        'Select 3-5 best client outcomes',
        'Interview clients for testimonials',
        'Document before/after with metrics',
        'Create detailed narrative',
        'Feature prominently on website',
      ],
      estimatedEffort: '1-2 days each',
      category: 'social_proof',
      relevantGoals: ['conversions', 'trust', 'sales'],
    },
    {
      id: 'content_5',
      type: 'content',
      title: 'Develop a lead magnet/free resource',
      description: 'Valuable free content that captures leads',
      priority: 'critical' as RecommendationPriority,
      expectedImpact: {
        leads: '+100%',
        emailList: '+50%',
        authority: '+30%',
      },
      actionSteps: [
        'Identify biggest pain point of audience',
        'Create solution as PDF/template/tool',
        'Design professional landing page',
        'Set up email capture and delivery',
        'Promote across all channels',
      ],
      estimatedEffort: '3-5 days',
      category: 'lead_generation',
      relevantGoals: ['lead_generation', 'email_list', 'authority'],
    },
  ];

  return prioritizeRecommendations(baseRecommendations, context);
}

function generatePricingRecommendations(context: UserContext): Record<string, unknown>[] {
  const baseRecommendations = [
    {
      id: 'pricing_1',
      type: 'pricing',
      title: 'Implement value-based pricing',
      description: 'Price based on value delivered rather than time spent',
      priority: 'critical' as RecommendationPriority,
      expectedImpact: {
        revenue: '+40%',
        profitMargin: '+60%',
        clientSatisfaction: '+25%',
      },
      actionSteps: [
        'Calculate ROI you deliver to clients',
        'Research competitor pricing',
        'Create pricing tiers based on outcomes',
        'Develop value communication framework',
        'Train on value-based sales conversations',
      ],
      estimatedEffort: '1 week',
      category: 'pricing_strategy',
      relevantGoals: ['revenue', 'profitability'],
      budgetLevel: 'flexible',
    },
    {
      id: 'pricing_2',
      type: 'pricing',
      title: 'Add premium tier with exclusive features',
      description: 'Capture high-value clients with premium offerings',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        aov: '+80%',
        revenue: '+30%',
        brandPerception: '+40%',
      },
      actionSteps: [
        'Identify features top clients value most',
        'Bundle premium features and services',
        'Set price at 2-3x standard tier',
        'Create exclusive benefits (priority support, etc.)',
        'Market to qualified prospects only',
      ],
      estimatedEffort: '3-5 days',
      category: 'tier_structure',
      relevantGoals: ['revenue', 'premium_positioning'],
    },
    {
      id: 'pricing_3',
      type: 'pricing',
      title: 'Introduce retainer/subscription model',
      description: 'Create predictable recurring revenue',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        mrr: '+200%',
        clientRetention: '+45%',
        cashFlow: '+60%',
      },
      actionSteps: [
        'Define monthly deliverables package',
        'Set competitive monthly pricing',
        'Create contract templates',
        'Implement billing automation',
        'Convert best clients to retainers',
      ],
      estimatedEffort: '1-2 weeks',
      category: 'revenue_model',
      relevantGoals: ['recurring_revenue', 'stability', 'retention'],
    },
    {
      id: 'pricing_4',
      type: 'pricing',
      title: 'Create project packages instead of hourly',
      description: 'Fixed-price packages for common project types',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        efficiency: '+35%',
        profitMargin: '+25%',
        clientClarity: '+50%',
      },
      actionSteps: [
        'Analyze past projects for patterns',
        'Create 3-5 standard packages',
        'Define clear scope and deliverables',
        'Build package pricing calculator',
        'Update website with packages',
      ],
      estimatedEffort: '2-3 days',
      category: 'productization',
      relevantGoals: ['efficiency', 'scalability'],
      budgetLevel: 'moderate',
    },
  ];

  return prioritizeRecommendations(baseRecommendations, context);
}

function generateGrowthRecommendations(context: UserContext): Record<string, unknown>[] {
  const baseRecommendations = [
    {
      id: 'growth_1',
      type: 'growth',
      title: 'Implement referral program',
      description: 'Turn happy clients into growth engine',
      priority: 'critical' as RecommendationPriority,
      expectedImpact: {
        newClients: '+40%',
        cac: '-50%',
        ltv: '+30%',
      },
      actionSteps: [
        'Design referral incentive structure',
        'Create referral tracking system',
        'Develop referral request templates',
        'Automate referral follow-ups',
        'Celebrate and reward referrers',
      ],
      estimatedEffort: '1 week',
      category: 'referral_marketing',
      relevantGoals: ['acquisition', 'growth', 'cost_efficiency'],
    },
    {
      id: 'growth_2',
      type: 'growth',
      title: 'Build strategic partnerships',
      description: 'Collaborate with complementary businesses',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        reach: '+100%',
        leads: '+50%',
        credibility: '+40%',
      },
      actionSteps: [
        'Identify complementary businesses',
        'Reach out with value proposition',
        'Create mutual benefit structure',
        'Develop co-marketing campaigns',
        'Cross-promote to each others audiences',
      ],
      estimatedEffort: 'Ongoing',
      category: 'partnerships',
      relevantGoals: ['reach', 'credibility', 'leads'],
    },
    {
      id: 'growth_3',
      type: 'growth',
      title: 'Expand to new market segment',
      description: 'Apply expertise to adjacent market',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        addressableMarket: '+150%',
        revenue: '+60%',
        diversification: '+100%',
      },
      actionSteps: [
        'Research adjacent markets',
        'Identify transferable skills/services',
        'Develop market-specific positioning',
        'Create targeted marketing materials',
        'Test with pilot clients',
      ],
      estimatedEffort: '2-4 weeks',
      category: 'market_expansion',
      relevantGoals: ['growth', 'diversification', 'revenue'],
      experienceLevel: 'advanced',
    },
    {
      id: 'growth_4',
      type: 'growth',
      title: 'Launch an online course or workshop',
      description: 'Monetize expertise with scalable offerings',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        passiveIncome: '+$10k-50k/year',
        authority: '+60%',
        leads: '+80%',
      },
      actionSteps: [
        'Identify most valuable teachable skill',
        'Outline course curriculum',
        'Record video lessons',
        'Set up course platform',
        'Create launch marketing plan',
      ],
      estimatedEffort: '4-8 weeks',
      category: 'productization',
      relevantGoals: ['passive_income', 'scalability', 'authority'],
    },
    {
      id: 'growth_5',
      type: 'growth',
      title: 'Optimize conversion funnel',
      description: 'Improve every step of the customer journey',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        conversions: '+50%',
        revenue: '+35%',
        efficiency: '+40%',
      },
      actionSteps: [
        'Map current customer journey',
        'Identify drop-off points',
        'A/B test key pages',
        'Improve call-to-actions',
        'Implement retargeting',
      ],
      estimatedEffort: '2-3 weeks',
      category: 'conversion_optimization',
      relevantGoals: ['conversions', 'efficiency', 'revenue'],
    },
  ];

  return prioritizeRecommendations(baseRecommendations, context);
}

function generateSEORecommendations(context: UserContext): Record<string, unknown>[] {
  return [
    {
      id: 'seo_1',
      type: 'seo',
      title: 'Optimize for featured snippets',
      description: 'Target position zero in search results',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        organicTraffic: '+40%',
        visibility: '+80%',
        authority: '+30%',
      },
      actionSteps: [
        'Find question-based keywords',
        'Create answer-focused content',
        'Use structured data markup',
        'Format for quick answers (lists, tables)',
        'Monitor and iterate',
      ],
      category: 'search_optimization',
    },
    {
      id: 'seo_2',
      type: 'seo',
      title: 'Build quality backlinks',
      description: 'Earn links from authoritative sites',
      priority: 'critical' as RecommendationPriority,
      expectedImpact: {
        domainAuthority: '+20%',
        rankings: '+35%',
        referralTraffic: '+50%',
      },
      actionSteps: [
        'Create linkable assets (guides, tools, research)',
        'Guest post on industry blogs',
        'Pursue HARO opportunities',
        'Build relationships with journalists',
        'Recover broken backlinks',
      ],
      category: 'link_building',
    },
    {
      id: 'seo_3',
      type: 'seo',
      title: 'Improve page speed',
      description: 'Faster sites rank higher and convert better',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        rankings: '+15%',
        bounceRate: '-25%',
        conversions: '+20%',
      },
      actionSteps: [
        'Run PageSpeed Insights audit',
        'Optimize images (WebP, lazy loading)',
        'Enable browser caching',
        'Minimize JavaScript/CSS',
        'Use CDN for static assets',
      ],
      category: 'technical_seo',
    },
    {
      id: 'seo_4',
      type: 'seo',
      title: 'Create topic clusters',
      description: 'Comprehensive content strategy for topical authority',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        topicalAuthority: '+60%',
        rankings: '+40%',
        internalLinking: '+200%',
      },
      actionSteps: [
        'Identify 3-5 core topics',
        'Create pillar content for each',
        'Write supporting cluster content',
        'Implement internal linking strategy',
        'Update and expand regularly',
      ],
      category: 'content_strategy',
    },
  ];
}

function generateMarketingRecommendations(context: UserContext): Record<string, unknown>[] {
  return [
    {
      id: 'marketing_1',
      type: 'marketing',
      title: 'Launch targeted LinkedIn campaign',
      description: 'B2B lead generation on professional network',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        leads: '+45%',
        brandAwareness: '+60%',
        networking: '+100%',
      },
      actionSteps: [
        'Optimize LinkedIn profile',
        'Create content calendar',
        'Engage with target audience daily',
        'Use LinkedIn ads for reach',
        'Connect with decision-makers',
      ],
      category: 'social_marketing',
      preferredPlatforms: ['linkedin'],
    },
    {
      id: 'marketing_2',
      type: 'marketing',
      title: 'Implement marketing automation',
      description: 'Nurture leads automatically',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        efficiency: '+50%',
        leadNurturing: '+80%',
        conversions: '+30%',
      },
      actionSteps: [
        'Choose automation platform',
        'Map customer journey stages',
        'Create automated email sequences',
        'Set up lead scoring',
        'Implement behavior-based triggers',
      ],
      category: 'automation',
    },
    {
      id: 'marketing_3',
      type: 'marketing',
      title: 'Create video testimonials',
      description: 'Powerful social proof that converts',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        conversions: '+60%',
        trust: '+70%',
        engagement: '+40%',
      },
      actionSteps: [
        'Identify happy clients',
        'Create simple recording instructions',
        'Offer incentive for participation',
        'Edit for impact',
        'Feature across all channels',
      ],
      category: 'social_proof',
    },
    {
      id: 'marketing_4',
      type: 'marketing',
      title: 'Run webinar series',
      description: 'Generate leads while demonstrating expertise',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        leads: '+100%',
        authority: '+50%',
        engagement: '+80%',
      },
      actionSteps: [
        'Plan monthly topic calendar',
        'Choose webinar platform',
        'Create registration landing pages',
        'Promote across channels',
        'Follow up with attendees',
      ],
      category: 'lead_generation',
    },
  ];
}

function generateWorkflowRecommendations(context: UserContext): Record<string, unknown>[] {
  return [
    {
      id: 'workflow_1',
      type: 'workflow',
      title: 'Automate client onboarding',
      description: 'Streamlined process for new clients',
      priority: 'critical' as RecommendationPriority,
      expectedImpact: {
        timePerClient: '-60%',
        clientExperience: '+80%',
        consistency: '+100%',
      },
      actionSteps: [
        'Map current onboarding steps',
        'Create automated welcome sequence',
        'Set up project templates',
        'Automate contract and payment',
        'Build resource library access',
      ],
      category: 'client_management',
    },
    {
      id: 'workflow_2',
      type: 'workflow',
      title: 'Implement project management system',
      description: 'Centralized workflow management',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        productivity: '+40%',
        deadlines: '+50%',
        collaboration: '+60%',
      },
      actionSteps: [
        'Choose PM tool (Notion, Asana, etc.)',
        'Create project templates',
        'Set up team workflows',
        'Implement time tracking',
        'Create reporting dashboards',
      ],
      category: 'productivity',
    },
    {
      id: 'workflow_3',
      type: 'workflow',
      title: 'Create SOP documentation',
      description: 'Standardize all processes',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        consistency: '+90%',
        training: '-70% time',
        delegation: '+100%',
      },
      actionSteps: [
        'List all recurring processes',
        'Document step-by-step procedures',
        'Include screenshots/videos',
        'Store in accessible location',
        'Update regularly',
      ],
      category: 'documentation',
    },
    {
      id: 'workflow_4',
      type: 'workflow',
      title: 'Set up automated invoicing',
      description: 'Never chase payments again',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        cashFlow: '+30%',
        adminTime: '-80%',
        latepayments: '-60%',
      },
      actionSteps: [
        'Choose invoicing software',
        'Set up recurring invoices',
        'Enable automatic reminders',
        'Add multiple payment options',
        'Implement late fee automation',
      ],
      category: 'finance',
    },
  ];
}

function generateEngagementRecommendations(context: UserContext): Record<string, unknown>[] {
  return [
    {
      id: 'engagement_1',
      type: 'engagement',
      title: 'Build community platform',
      description: 'Create space for audience connection',
      priority: 'high' as RecommendationPriority,
      expectedImpact: {
        retention: '+60%',
        engagement: '+200%',
        advocacy: '+100%',
      },
      actionSteps: [
        'Choose platform (Discord, Circle, etc.)',
        'Define community guidelines',
        'Create welcome experience',
        'Plan regular events/AMAs',
        'Identify and empower moderators',
      ],
      category: 'community',
    },
    {
      id: 'engagement_2',
      type: 'engagement',
      title: 'Implement gamification',
      description: 'Make interaction rewarding',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        engagement: '+80%',
        completion: '+50%',
        retention: '+40%',
      },
      actionSteps: [
        'Define key actions to reward',
        'Create points/badge system',
        'Add leaderboards',
        'Design meaningful rewards',
        'Launch and iterate',
      ],
      category: 'user_experience',
    },
    {
      id: 'engagement_3',
      type: 'engagement',
      title: 'Create interactive content',
      description: 'Quizzes, calculators, assessments',
      priority: 'medium' as RecommendationPriority,
      expectedImpact: {
        engagement: '+150%',
        leads: '+70%',
        shares: '+100%',
      },
      actionSteps: [
        'Identify interactive content opportunities',
        'Choose tool (Typeform, Outgrow, etc.)',
        'Design valuable experience',
        'Capture leads in exchange',
        'Promote and embed on site',
      ],
      category: 'interactive',
    },
  ];
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: RecommendationRequest = await request.json();
    const { action } = body;

    // Get user from auth header or allow demo mode
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const isDemo = !userId;

    switch (action) {
      // ======================================================================
      // GET PERSONALIZED RECOMMENDATIONS
      // ======================================================================
      case 'get-personalized': {
        const {
          userContext = {},
          limit = 10,
          includeExplanations = true,
        } = body;

        const context: UserContext = {
          industry: userContext.industry || 'general',
          businessType: userContext.businessType || 'freelancer',
          goals: userContext.goals || ['growth', 'revenue'],
          experience: userContext.experience || 'intermediate',
          budget: userContext.budget || 'moderate',
          ...userContext,
        };

        // Gather recommendations from all categories
        const allRecommendations = [
          ...generateContentRecommendations(context),
          ...generatePricingRecommendations(context),
          ...generateGrowthRecommendations(context),
          ...generateSEORecommendations(context),
          ...generateMarketingRecommendations(context),
          ...generateWorkflowRecommendations(context),
          ...generateEngagementRecommendations(context),
        ];

        // Sort by relevance and priority
        const prioritizedRecs = allRecommendations
          .map(rec => ({
            ...rec,
            relevanceScore: calculateRelevanceScore(rec, context),
          }))
          .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority as RecommendationPriority] -
                                priorityOrder[a.priority as RecommendationPriority];
            if (priorityDiff !== 0) return priorityDiff;
            return (b.relevanceScore as number) - (a.relevanceScore as number);
          })
          .slice(0, limit);

        // Get AI-powered explanations if requested
        let aiInsights = null;
        if (includeExplanations) {
          try {
            const insightsPrompt = `Given this user context: ${JSON.stringify(context)}

And these top recommendations: ${JSON.stringify(prioritizedRecs.slice(0, 5).map(r => r.title))}

Provide a brief personalized explanation of why these recommendations are most important for this specific user. Focus on their unique situation and goals.`;

            const insights = await getAIRecommendations(
              insightsPrompt,
              'You are a business growth advisor. Provide concise, actionable insights.'
            );
            aiInsights = insights;
          } catch {
            aiInsights = 'Focus on the highest-priority recommendations first for maximum impact.';
          }
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: {
            recommendations: prioritizedRecs,
            context,
            aiInsights,
            totalAvailable: allRecommendations.length,
            generatedAt: new Date().toISOString(),
          },
        });
      }

      // ======================================================================
      // GET CATEGORY-SPECIFIC RECOMMENDATIONS
      // ======================================================================
      case 'get-by-category': {
        const {
          recommendationType = 'growth',
          userContext = {},
          limit = 5,
        } = body;

        const context: UserContext = {
          industry: userContext.industry || 'general',
          goals: userContext.goals || [],
          experience: userContext.experience || 'intermediate',
          budget: userContext.budget || 'moderate',
          ...userContext,
        };

        let recommendations: Record<string, unknown>[] = [];

        switch (recommendationType) {
          case 'content':
            recommendations = generateContentRecommendations(context);
            break;
          case 'pricing':
            recommendations = generatePricingRecommendations(context);
            break;
          case 'growth':
            recommendations = generateGrowthRecommendations(context);
            break;
          case 'seo':
            recommendations = generateSEORecommendations(context);
            break;
          case 'marketing':
            recommendations = generateMarketingRecommendations(context);
            break;
          case 'workflow':
            recommendations = generateWorkflowRecommendations(context);
            break;
          case 'engagement':
            recommendations = generateEngagementRecommendations(context);
            break;
          default:
            recommendations = generateGrowthRecommendations(context);
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: {
            category: recommendationType,
            recommendations: recommendations.slice(0, limit),
            context,
          },
        });
      }

      // ======================================================================
      // GET AI-POWERED RECOMMENDATIONS
      // ======================================================================
      case 'get-ai-recommendations': {
        const { userContext = {}, query } = body;

        const prompt = query || `Generate personalized business recommendations for someone with this profile:
Industry: ${userContext.industry || 'general'}
Business Type: ${userContext.businessType || 'freelancer'}
Experience: ${userContext.experience || 'intermediate'}
Goals: ${(userContext.goals || ['growth']).join(', ')}
Budget: ${userContext.budget || 'moderate'}
Challenges: ${(userContext.currentChallenges || ['scaling']).join(', ')}`;

        try {
          const aiRecommendations = await getAIRecommendations(
            prompt,
            `You are an expert business growth consultant. Provide specific, actionable recommendations tailored to the user's profile. For each recommendation include:
1. Title (concise)
2. Description (1-2 sentences)
3. Priority (critical/high/medium/low)
4. Expected impact
5. Action steps (3-5 bullet points)
6. Estimated effort

Return as JSON array of recommendations.`
          );

          let parsed;
          try {
            parsed = JSON.parse(aiRecommendations);
          } catch {
            parsed = { rawRecommendations: aiRecommendations };
          }

          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: {
              recommendations: parsed,
              context: userContext,
              source: 'ai_generated',
              generatedAt: new Date().toISOString(),
            },
          });
        } catch {
          // Fallback to template recommendations
          const fallbackRecs = generateGrowthRecommendations(userContext);
          return NextResponse.json({
            success: true,
            demo: isDemo,
            data: {
              recommendations: fallbackRecs,
              context: userContext,
              source: 'template',
              note: 'AI generation unavailable, showing curated recommendations',
            },
          });
        }
      }

      // ======================================================================
      // GET QUICK WINS
      // ======================================================================
      case 'get-quick-wins': {
        const { userContext = {}, limit = 5 } = body;

        // Filter for quick-win recommendations (low effort, high impact)
        const allRecs = [
          ...generateContentRecommendations(userContext),
          ...generateMarketingRecommendations(userContext),
          ...generateWorkflowRecommendations(userContext),
        ];

        const quickWins = allRecs
          .filter(rec => {
            const effort = rec.estimatedEffort as string;
            return effort && (
              effort.includes('hour') ||
              effort.includes('day') ||
              effort.includes('1 week')
            );
          })
          .map(rec => ({
            ...rec,
            quickWinScore: rec.priority === 'critical' ? 4 :
                          rec.priority === 'high' ? 3 :
                          rec.priority === 'medium' ? 2 : 1,
          }))
          .sort((a, b) => b.quickWinScore - a.quickWinScore)
          .slice(0, limit);

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: {
            quickWins,
            context: userContext,
            tip: 'Start with the highest-priority quick wins for immediate impact',
          },
        });
      }

      // ======================================================================
      // GET STRATEGIC RECOMMENDATIONS
      // ======================================================================
      case 'get-strategic': {
        const { userContext = {}, limit = 5 } = body;

        // Filter for strategic, long-term recommendations
        const allRecs = [
          ...generateGrowthRecommendations(userContext),
          ...generatePricingRecommendations(userContext),
        ];

        const strategic = allRecs
          .filter(rec => {
            const effort = rec.estimatedEffort as string;
            return effort && (
              effort.includes('week') ||
              effort.includes('month') ||
              effort.includes('Ongoing')
            );
          })
          .slice(0, limit);

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: {
            strategicRecommendations: strategic,
            context: userContext,
            note: 'These recommendations require more investment but deliver transformational results',
          },
        });
      }

      // ======================================================================
      // SAVE RECOMMENDATION FEEDBACK
      // ======================================================================
      case 'save-feedback': {
        const { feedbackId, feedbackType } = body;

        if (!feedbackId || !feedbackType) {
          return NextResponse.json({
            success: false,
            error: 'Feedback ID and type are required',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Feedback would be saved',
              feedbackId,
              feedbackType,
            },
          });
        }

        const { error } = await supabase
          .from('recommendation_feedback')
          .insert({
            user_id: userId,
            recommendation_id: feedbackId,
            feedback_type: feedbackType,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          data: {
            message: 'Feedback saved successfully',
            feedbackId,
            feedbackType,
          },
        });
      }

      // ======================================================================
      // GET IMPLEMENTATION ROADMAP
      // ======================================================================
      case 'get-roadmap': {
        const { userContext = {} } = body;

        const context: UserContext = {
          industry: userContext.industry || 'general',
          goals: userContext.goals || ['growth'],
          experience: userContext.experience || 'intermediate',
          ...userContext,
        };

        // Create a phased implementation roadmap
        const roadmap = {
          phase1: {
            name: 'Foundation (Week 1-2)',
            focus: 'Quick wins and essential setup',
            recommendations: [
              ...generateWorkflowRecommendations(context).slice(0, 2),
              ...generateContentRecommendations(context)
                .filter(r => r.priority === 'critical')
                .slice(0, 1),
            ],
          },
          phase2: {
            name: 'Growth Engine (Week 3-4)',
            focus: 'Building momentum',
            recommendations: [
              ...generateMarketingRecommendations(context).slice(0, 2),
              ...generateSEORecommendations(context).slice(0, 1),
            ],
          },
          phase3: {
            name: 'Scale (Month 2)',
            focus: 'Expanding reach and revenue',
            recommendations: [
              ...generatePricingRecommendations(context).slice(0, 2),
              ...generateGrowthRecommendations(context).slice(0, 1),
            ],
          },
          phase4: {
            name: 'Optimize (Month 3+)',
            focus: 'Refinement and expansion',
            recommendations: [
              ...generateEngagementRecommendations(context).slice(0, 2),
              ...generateGrowthRecommendations(context).slice(2, 3),
            ],
          },
        };

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: {
            roadmap,
            context,
            advice: 'Focus on completing each phase before moving to the next. Quality over speed.',
          },
        });
      }

      // ======================================================================
      // GET RECOMMENDATION HISTORY
      // ======================================================================
      case 'get-history': {
        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              history: [
                {
                  id: 'hist_1',
                  recommendation: 'Implement referral program',
                  status: 'implemented',
                  implementedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  results: { newClients: '+12', revenue: '+$5,000' },
                },
                {
                  id: 'hist_2',
                  recommendation: 'Create lead magnet',
                  status: 'in_progress',
                  startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                },
              ],
            },
          });
        }

        const { data: history, error } = await supabase
          .from('recommendation_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          data: { history },
        });
      }

      // ======================================================================
      // MARK RECOMMENDATION AS IMPLEMENTED
      // ======================================================================
      case 'mark-implemented': {
        const { feedbackId, currentData } = body;

        if (!feedbackId) {
          return NextResponse.json({
            success: false,
            error: 'Recommendation ID is required',
          }, { status: 400 });
        }

        if (isDemo) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              message: 'Demo mode: Would mark as implemented',
              recommendationId: feedbackId,
            },
          });
        }

        const { error } = await supabase
          .from('recommendation_history')
          .insert({
            user_id: userId,
            recommendation_id: feedbackId,
            status: 'implemented',
            results: currentData,
            implemented_at: new Date().toISOString(),
          });

        if (error) throw error;

        return NextResponse.json({
          success: true,
          data: {
            message: 'Recommendation marked as implemented',
            recommendationId: feedbackId,
          },
        });
      }

      // ======================================================================
      // GET SIMILAR RECOMMENDATIONS
      // ======================================================================
      case 'get-similar': {
        const { recommendationType, userContext = {} } = body;

        if (!recommendationType) {
          return NextResponse.json({
            success: false,
            error: 'Recommendation type is required',
          }, { status: 400 });
        }

        let similarRecs: Record<string, unknown>[] = [];

        // Get similar recommendations based on type
        switch (recommendationType) {
          case 'content':
          case 'marketing':
            similarRecs = [
              ...generateContentRecommendations(userContext),
              ...generateMarketingRecommendations(userContext),
            ];
            break;
          case 'pricing':
          case 'growth':
            similarRecs = [
              ...generatePricingRecommendations(userContext),
              ...generateGrowthRecommendations(userContext),
            ];
            break;
          case 'workflow':
          case 'automation':
            similarRecs = generateWorkflowRecommendations(userContext);
            break;
          default:
            similarRecs = generateGrowthRecommendations(userContext);
        }

        return NextResponse.json({
          success: true,
          demo: isDemo,
          data: {
            similar: similarRecs.slice(0, 5),
            basedOn: recommendationType,
          },
        });
      }

      // ======================================================================
      // GET RECOMMENDATION CATEGORIES
      // ======================================================================
      case 'get-categories': {
        const categories = [
          {
            id: 'content',
            name: 'Content Strategy',
            description: 'Build authority and attract audience with valuable content',
            icon: '📝',
          },
          {
            id: 'pricing',
            name: 'Pricing Strategy',
            description: 'Optimize pricing for maximum revenue and profitability',
            icon: '💰',
          },
          {
            id: 'growth',
            name: 'Growth Tactics',
            description: 'Scale your business with proven growth strategies',
            icon: '📈',
          },
          {
            id: 'seo',
            name: 'SEO & Organic',
            description: 'Improve search visibility and organic traffic',
            icon: '🔍',
          },
          {
            id: 'marketing',
            name: 'Marketing',
            description: 'Reach and convert your target audience',
            icon: '📣',
          },
          {
            id: 'workflow',
            name: 'Workflows & Automation',
            description: 'Streamline operations and save time',
            icon: '⚡',
          },
          {
            id: 'engagement',
            name: 'Engagement & Retention',
            description: 'Keep audience engaged and coming back',
            icon: '🤝',
          },
        ];

        return NextResponse.json({
          success: true,
          data: { categories },
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`,
          availableActions: [
            'get-personalized',
            'get-by-category',
            'get-ai-recommendations',
            'get-quick-wins',
            'get-strategic',
            'save-feedback',
            'get-roadmap',
            'get-history',
            'mark-implemented',
            'get-similar',
            'get-categories',
          ],
        }, { status: 400 });
    }
  } catch (error) {
    logger.error('AI Recommendations API Error', { error });
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    }, { status: 500 });
  }
}

// GET handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'get-categories';

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ action }),
  }));
}
