/**
 * Lead Generation Utilities
 * Helper functions and mock data for lead generation
 */

import {
  Lead,
  LeadStatus,
  LeadScore,
  LeadForm,
  LandingPage,
  LeadCampaign,
  LeadMagnet,
  NurtureSequence,
  LeadGenStats,
  ABTest
} from './lead-gen-types'

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc',
    jobTitle: 'Marketing Director',
    source: 'landing-page',
    status: 'qualified',
    score: 85,
    scoreLabel: 'hot',
    tags: ['enterprise', 'high-value', 'tech'],
    customFields: {
      companySize: '500-1000',
      budget: '$50k-$100k',
      timeline: '1-3 months'
    },
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-07-15'),
    lastContactedAt: new Date('2024-07-14'),
    metadata: {
      pageViews: 12,
      formSubmissions: 2,
      emailOpens: 8,
      emailClicks: 5,
      downloadedAssets: ['ebook-1', 'whitepaper-2'],
      visitedPages: ['/pricing', '/features', '/case-studies'],
      timeOnSite: 1200,
      deviceType: 'desktop',
      browser: 'chrome',
      location: {
        city: 'San Francisco',
        country: 'USA'
      }
    }
  },
  {
    id: 'lead-2',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@startup.com',
    company: 'Startup XYZ',
    jobTitle: 'Founder',
    source: 'social-media',
    status: 'new',
    score: 65,
    scoreLabel: 'warm',
    tags: ['startup', 'saas'],
    customFields: {
      companySize: '10-50',
      timeline: '3-6 months'
    },
    createdAt: new Date('2024-07-18'),
    updatedAt: new Date('2024-07-18'),
    metadata: {
      pageViews: 5,
      formSubmissions: 1,
      emailOpens: 2,
      emailClicks: 1,
      downloadedAssets: [],
      visitedPages: ['/'],
      timeOnSite: 320,
      deviceType: 'mobile',
      browser: 'safari'
    }
  },
  {
    id: 'lead-3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@agency.com',
    company: 'Creative Agency',
    jobTitle: 'CEO',
    source: 'paid-ads',
    status: 'contacted',
    score: 45,
    scoreLabel: 'warm',
    tags: ['agency', 'creative'],
    customFields: {
      companySize: '50-100',
      budget: '$10k-$25k'
    },
    createdAt: new Date('2024-07-12'),
    updatedAt: new Date('2024-07-16'),
    lastContactedAt: new Date('2024-07-16'),
    metadata: {
      pageViews: 8,
      formSubmissions: 1,
      emailOpens: 4,
      emailClicks: 2,
      downloadedAssets: ['checklist-1'],
      visitedPages: ['/pricing', '/features'],
      timeOnSite: 540,
      deviceType: 'desktop',
      browser: 'firefox'
    }
  }
]

export const MOCK_FORMS: LeadForm[] = [
  {
    id: 'form-1',
    name: 'Free Trial Sign Up',
    description: 'Main trial signup form',
    fields: [
      {
        id: 'field-1',
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
        order: 1
      },
      {
        id: 'field-2',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true,
        order: 2
      },
      {
        id: 'field-3',
        type: 'email',
        label: 'Email Address',
        placeholder: 'you@company.com',
        required: true,
        validation: {
          pattern: '^[^@]+@[^@]+\\.[^@]+$',
          customError: 'Please enter a valid email address'
        },
        order: 3
      },
      {
        id: 'field-4',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 000-0000',
        required: false,
        order: 4
      },
      {
        id: 'field-5',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Your company',
        required: true,
        order: 5
      },
      {
        id: 'field-6',
        type: 'select',
        label: 'Company Size',
        required: true,
        options: ['1-10', '11-50', '51-200', '201-500', '500+'],
        order: 6
      }
    ],
    settings: {
      submitButtonText: 'Start Free Trial',
      successMessage: 'Thank you! Check your email to get started.',
      notificationEmail: 'leads@company.com',
      allowFileUpload: false,
      maxFileSize: 5242880,
      enableCaptcha: true,
      doubleOptIn: true,
      tags: ['trial', 'high-intent'],
      autoAssign: 'user-1'
    },
    submissions: 245,
    conversionRate: 32.5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-07-01'),
    isActive: true
  },
  {
    id: 'form-2',
    name: 'eBook Download',
    description: 'Lead magnet form for eBook',
    fields: [
      {
        id: 'field-7',
        type: 'text',
        label: 'Name',
        placeholder: 'Your name',
        required: true,
        order: 1
      },
      {
        id: 'field-8',
        type: 'email',
        label: 'Email',
        placeholder: 'your@email.com',
        required: true,
        order: 2
      }
    ],
    settings: {
      submitButtonText: 'Download Now',
      successMessage: 'Your download is ready! Check your email.',
      allowFileUpload: false,
      maxFileSize: 0,
      enableCaptcha: false,
      doubleOptIn: false,
      tags: ['ebook', 'content'],
      autoAssign: 'user-2'
    },
    submissions: 587,
    conversionRate: 48.2,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-15'),
    isActive: true
  }
]

export const MOCK_LANDING_PAGES: LandingPage[] = [
  {
    id: 'page-1',
    name: 'Free Trial Landing Page',
    slug: 'free-trial',
    title: 'Start Your Free 14-Day Trial',
    description: 'Try all premium features free for 14 days',
    status: 'published',
    template: 'modern-saas',
    sections: [
      {
        id: 'section-1',
        type: 'hero',
        title: 'Hero Section',
        content: {
          headline: 'Transform Your Business Today',
          subheadline: 'The all-in-one platform for modern teams',
          ctaText: 'Start Free Trial',
          backgroundImage: '/images/hero-bg.jpg'
        },
        order: 1,
        isVisible: true
      },
      {
        id: 'section-2',
        type: 'features',
        title: 'Features',
        content: {
          features: [
            { icon: '🚀', title: 'Fast & Reliable', description: 'Lightning-fast performance' },
            { icon: '🔒', title: 'Secure', description: 'Bank-level security' },
            { icon: '📊', title: 'Analytics', description: 'Powerful insights' }
          ]
        },
        order: 2,
        isVisible: true
      },
      {
        id: 'section-3',
        type: 'form',
        title: 'Sign Up Form',
        content: {
          formId: 'form-1'
        },
        order: 3,
        isVisible: true
      }
    ],
    seo: {
      metaTitle: 'Start Your Free Trial | KAZI Platform',
      metaDescription: 'Try KAZI free for 14 days. No credit card required.',
      metaKeywords: ['free trial', 'saas', 'platform'],
      ogImage: '/images/og-trial.jpg'
    },
    formId: 'form-1',
    stats: {
      views: 3420,
      uniqueVisitors: 2890,
      submissions: 245,
      conversionRate: 8.5,
      averageTimeOnPage: 145,
      bounceRate: 42
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-10'),
    publishedAt: new Date('2024-01-20')
  },
  {
    id: 'page-2',
    name: 'eBook Landing Page',
    slug: 'digital-marketing-guide',
    title: 'Free Digital Marketing Guide',
    description: 'Download our comprehensive guide to digital marketing',
    status: 'published',
    template: 'content-download',
    sections: [
      {
        id: 'section-4',
        type: 'hero',
        title: 'Hero',
        content: {
          headline: 'Master Digital Marketing in 2024',
          subheadline: 'Free 50-page comprehensive guide',
          ctaText: 'Download Free Guide'
        },
        order: 1,
        isVisible: true
      },
      {
        id: 'section-5',
        type: 'form',
        title: 'Download Form',
        content: {
          formId: 'form-2'
        },
        order: 2,
        isVisible: true
      }
    ],
    seo: {
      metaTitle: 'Free Digital Marketing Guide | KAZI',
      metaDescription: 'Download our free 50-page digital marketing guide',
      metaKeywords: ['digital marketing', 'guide', 'ebook'],
      ogImage: '/images/og-ebook.jpg'
    },
    formId: 'form-2',
    stats: {
      views: 5210,
      uniqueVisitors: 4320,
      submissions: 587,
      conversionRate: 13.6,
      averageTimeOnPage: 95,
      bounceRate: 35
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-15'),
    publishedAt: new Date('2024-02-05')
  }
]

export const MOCK_CAMPAIGNS: LeadCampaign[] = [
  {
    id: 'campaign-1',
    name: 'Summer Free Trial Campaign',
    description: 'Q3 trial signup campaign',
    type: 'multi-channel',
    status: 'active',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-09-30'),
    budget: 15000,
    spent: 8500,
    landingPageId: 'page-1',
    formId: 'form-1',
    targetAudience: 'B2B SaaS companies, 50-500 employees',
    goals: [
      {
        id: 'goal-1',
        metric: 'leads',
        target: 500,
        current: 245,
        progress: 49
      },
      {
        id: 'goal-2',
        metric: 'conversions',
        target: 100,
        current: 45,
        progress: 45
      }
    ],
    stats: {
      impressions: 125000,
      clicks: 4850,
      clickThroughRate: 3.88,
      leads: 245,
      conversions: 45,
      conversionRate: 18.4,
      costPerLead: 34.69,
      costPerConversion: 188.89,
      roi: 245
    },
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-07-15')
  },
  {
    id: 'campaign-2',
    name: 'eBook Content Marketing',
    description: 'Lead magnet campaign',
    type: 'content',
    status: 'active',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-12-31'),
    budget: 5000,
    spent: 2800,
    landingPageId: 'page-2',
    formId: 'form-2',
    targetAudience: 'Marketing professionals',
    goals: [
      {
        id: 'goal-3',
        metric: 'leads',
        target: 1000,
        current: 587,
        progress: 58.7
      }
    ],
    stats: {
      impressions: 85000,
      clicks: 6420,
      clickThroughRate: 7.55,
      leads: 587,
      conversions: 120,
      conversionRate: 20.4,
      costPerLead: 4.77,
      costPerConversion: 23.33,
      roi: 385
    },
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-07-15')
  }
]

export const MOCK_LEAD_MAGNETS: LeadMagnet[] = [
  {
    id: 'magnet-1',
    name: 'Digital Marketing Guide 2024',
    type: 'ebook',
    description: 'Comprehensive 50-page guide to modern digital marketing',
    fileUrl: '/downloads/marketing-guide-2024.pdf',
    thumbnailUrl: '/images/ebook-thumb.jpg',
    formId: 'form-2',
    downloads: 587,
    conversionRate: 48.2,
    createdAt: new Date('2024-02-01'),
    isActive: true
  },
  {
    id: 'magnet-2',
    name: 'SaaS Growth Checklist',
    type: 'checklist',
    description: '20-point checklist for scaling your SaaS business',
    fileUrl: '/downloads/saas-checklist.pdf',
    thumbnailUrl: '/images/checklist-thumb.jpg',
    formId: 'form-2',
    downloads: 342,
    conversionRate: 52.8,
    createdAt: new Date('2024-03-15'),
    isActive: true
  }
]

export const MOCK_NURTURE_SEQUENCES: NurtureSequence[] = [
  {
    id: 'sequence-1',
    name: 'Trial User Onboarding',
    description: '7-day email sequence for trial users',
    trigger: 'form-submission',
    triggerValue: 'form-1',
    steps: [
      {
        id: 'step-1',
        type: 'email',
        delay: 0,
        delayUnit: 'minutes',
        content: {
          subject: 'Welcome to KAZI!',
          body: 'Get started with your free trial...'
        },
        order: 1,
        stats: {
          sent: 245,
          opened: 198,
          clicked: 145,
          completed: 245
        }
      },
      {
        id: 'step-2',
        type: 'wait',
        delay: 2,
        delayUnit: 'days',
        content: {},
        order: 2,
        stats: {
          sent: 0,
          completed: 245
        }
      },
      {
        id: 'step-3',
        type: 'email',
        delay: 0,
        delayUnit: 'minutes',
        content: {
          subject: 'Tips for Getting the Most Out of KAZI',
          body: 'Here are some pro tips...'
        },
        order: 3,
        stats: {
          sent: 245,
          opened: 175,
          clicked: 98,
          completed: 245
        }
      }
    ],
    status: 'in-progress',
    enrolledLeads: 245,
    completedLeads: 128,
    completionRate: 52.2,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-07-15'),
    isActive: true
  }
]

export const MOCK_AB_TESTS: ABTest[] = [
  {
    id: 'test-1',
    name: 'Trial Page Headline Test',
    type: 'landing-page',
    status: 'running',
    variants: [
      {
        id: 'variant-1',
        name: 'Control - Original',
        isControl: true,
        resourceId: 'page-1',
        traffic: 50,
        conversions: 120,
        conversionRate: 8.2
      },
      {
        id: 'variant-2',
        name: 'Variant A - New Headline',
        isControl: false,
        resourceId: 'page-1-variant',
        traffic: 50,
        conversions: 135,
        conversionRate: 9.1
      }
    ],
    startDate: new Date('2024-07-01'),
    trafficSplit: [50, 50],
    conversionGoal: 'form-submission',
    stats: {
      totalVisitors: 2950,
      totalConversions: 255,
      confidenceLevel: 92,
      statisticalSignificance: true
    }
  }
]

export const MOCK_LEAD_GEN_STATS: LeadGenStats = {
  totalLeads: 1245,
  newLeadsToday: 12,
  newLeadsThisWeek: 87,
  newLeadsThisMonth: 342,
  conversionRate: 18.5,
  averageLeadScore: 62,
  hotLeads: 145,
  warmLeads: 487,
  coldLeads: 613,
  leadsBySource: [
    { source: 'landing-page', count: 512, conversionRate: 24.5 },
    { source: 'social-media', count: 298, conversionRate: 15.2 },
    { source: 'paid-ads', count: 245, conversionRate: 21.8 },
    { source: 'organic', count: 134, conversionRate: 12.4 },
    { source: 'email', count: 56, conversionRate: 32.1 }
  ],
  leadsByStatus: {
    new: 345,
    contacted: 287,
    qualified: 198,
    unqualified: 142,
    converted: 185,
    lost: 88
  },
  topPerformingForms: [
    { formId: 'form-2', formName: 'eBook Download', submissions: 587 },
    { formId: 'form-1', formName: 'Free Trial Sign Up', submissions: 245 }
  ],
  topPerformingPages: [
    { pageId: 'page-2', pageName: 'eBook Landing Page', conversions: 587 },
    { pageId: 'page-1', pageName: 'Free Trial Landing Page', conversions: 245 }
  ]
}

// Helper Functions
export function getLeadStatusColor(status: LeadStatus): string {
  const colors = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    qualified: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    unqualified: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    converted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
    lost: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status]
}

export function getLeadScoreColor(score: LeadScore): string {
  const colors = {
    cold: 'bg-gray-100 text-gray-700',
    warm: 'bg-yellow-100 text-yellow-700',
    hot: 'bg-red-100 text-red-700'
  }
  return colors[score]
}

export function getLeadScoreLabel(score: number): LeadScore {
  if (score >= 70) return 'hot'
  if (score >= 40) return 'warm'
  return 'cold'
}

export function calculateLeadScore(lead: Lead): number {
  let score = 0

  // Email engagement
  score += lead.metadata.emailOpens * 5
  score += lead.metadata.emailClicks * 10

  // Website engagement
  score += lead.metadata.pageViews * 2
  score += lead.metadata.formSubmissions * 15
  score += lead.metadata.downloadedAssets.length * 10

  // Company size bonus
  if (lead.company) score += 10

  return Math.min(score, 100)
}

export function getCampaignStatusColor(status: CampaignStatus): string {
  const colors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-blue-100 text-blue-700'
  }
  return colors[status]
}

export function formatROI(roi: number): string {
  return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`
}

export function sortLeadsByScore(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => b.score - a.score)
}

export function filterLeadsByStatus(leads: Lead[], statuses: LeadStatus[]): Lead[] {
  return leads.filter(lead => statuses.includes(lead.status))
}

export function filterLeadsByScore(leads: Lead[], scores: LeadScore[]): Lead[] {
  return leads.filter(lead => scores.includes(lead.scoreLabel))
}

export function getHotLeads(leads: Lead[]): Lead[] {
  return leads.filter(lead => lead.scoreLabel === 'hot')
}

export function getRecentLeads(leads: Lead[], days: number = 7): Lead[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  return leads.filter(lead => new Date(lead.createdAt) >= cutoffDate)
}
