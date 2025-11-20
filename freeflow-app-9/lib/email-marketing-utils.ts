/**
 * Email Marketing Utilities
 * Helper functions and mock data for email marketing
 */

import {
  EmailCampaign,
  CampaignStatus,
  CampaignType,
  Subscriber,
  SubscriberStatus,
  Segment,
  EmailTemplate,
  Automation,
  EmailStats
} from './email-marketing-types'

export const MOCK_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'campaign-1',
    name: 'Summer Sale Newsletter',
    subject: '🔥 50% OFF Summer Sale - Limited Time!',
    preheader: 'Don\'t miss out on our biggest sale of the year',
    type: 'promotional',
    status: 'sent',
    fromName: 'KAZI Team',
    fromEmail: 'hello@kazi.com',
    replyTo: 'support@kazi.com',
    content: {
      html: '<html>...</html>',
      plainText: 'Summer Sale...',
      editor: 'drag-drop',
      template: 'template-1'
    },
    segmentId: 'segment-1',
    recipientCount: 5420,
    sentAt: new Date('2024-07-15'),
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-07-15'),
    stats: {
      sent: 5420,
      delivered: 5385,
      opened: 2154,
      clicked: 647,
      bounced: 35,
      complained: 2,
      unsubscribed: 18,
      deliveryRate: 99.4,
      openRate: 40.0,
      clickRate: 12.0,
      clickToOpenRate: 30.0,
      unsubscribeRate: 0.33,
      bounceRate: 0.65,
      revenue: 45820
    }
  },
  {
    id: 'campaign-2',
    name: 'Product Update Announcement',
    subject: 'Introducing: New Features You\'ll Love',
    type: 'announcement',
    status: 'sent',
    fromName: 'KAZI Team',
    fromEmail: 'updates@kazi.com',
    content: {
      html: '<html>...</html>',
      plainText: 'New features...',
      editor: 'drag-drop'
    },
    recipientCount: 8950,
    sentAt: new Date('2024-07-12'),
    createdAt: new Date('2024-07-08'),
    updatedAt: new Date('2024-07-12'),
    stats: {
      sent: 8950,
      delivered: 8892,
      opened: 3825,
      clicked: 1148,
      bounced: 58,
      complained: 5,
      unsubscribed: 24,
      deliveryRate: 99.4,
      openRate: 43.0,
      clickRate: 12.9,
      clickToOpenRate: 30.0,
      unsubscribeRate: 0.27,
      bounceRate: 0.65
    }
  },
  {
    id: 'campaign-3',
    name: 'Weekly Newsletter #45',
    subject: 'This Week in KAZI: Tips, Tricks & Updates',
    type: 'newsletter',
    status: 'scheduled',
    fromName: 'KAZI Team',
    fromEmail: 'newsletter@kazi.com',
    content: {
      html: '<html>...</html>',
      plainText: 'Weekly newsletter...',
      editor: 'drag-drop'
    },
    recipientCount: 12450,
    scheduledAt: new Date('2024-07-22T09:00:00'),
    createdAt: new Date('2024-07-18'),
    updatedAt: new Date('2024-07-19'),
    stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      clickToOpenRate: 0,
      unsubscribeRate: 0,
      bounceRate: 0
    }
  }
]

export const MOCK_SUBSCRIBERS: Subscriber[] = [
  {
    id: 'sub-1',
    email: 'sarah.johnson@techcorp.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    status: 'subscribed',
    tags: ['customer', 'enterprise', 'vip'],
    customFields: {
      company: 'TechCorp Inc',
      industry: 'Technology',
      plan: 'Enterprise'
    },
    source: 'website-signup',
    subscribedAt: new Date('2024-01-15'),
    engagement: {
      emailsSent: 45,
      emailsOpened: 38,
      emailsClicked: 22,
      lastOpenedAt: new Date('2024-07-18'),
      lastClickedAt: new Date('2024-07-17'),
      averageOpenRate: 84.4,
      averageClickRate: 48.9,
      engagementScore: 92
    },
    metadata: {
      location: {
        country: 'USA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles'
      },
      preferences: {
        frequency: 'weekly',
        topics: ['product-updates', 'tips']
      }
    }
  },
  {
    id: 'sub-2',
    email: 'mike.chen@startup.com',
    firstName: 'Mike',
    lastName: 'Chen',
    status: 'subscribed',
    tags: ['prospect', 'trial'],
    customFields: {
      company: 'Startup XYZ',
      plan: 'Trial'
    },
    source: 'landing-page',
    subscribedAt: new Date('2024-07-10'),
    engagement: {
      emailsSent: 8,
      emailsOpened: 6,
      emailsClicked: 3,
      lastOpenedAt: new Date('2024-07-19'),
      lastClickedAt: new Date('2024-07-18'),
      averageOpenRate: 75.0,
      averageClickRate: 37.5,
      engagementScore: 78
    },
    metadata: {
      location: {
        country: 'USA',
        city: 'New York'
      },
      preferences: {
        frequency: 'daily',
        topics: ['product-updates']
      }
    }
  }
]

export const MOCK_SEGMENTS: Segment[] = [
  {
    id: 'segment-1',
    name: 'Active Customers',
    description: 'Customers who have opened an email in the last 30 days',
    criteria: [
      {
        id: 'rule-1',
        field: 'status',
        operator: 'equals',
        value: 'subscribed',
        condition: 'and'
      },
      {
        id: 'rule-2',
        field: 'last_opened',
        operator: 'greater-than',
        value: '30 days ago',
        condition: 'and'
      }
    ],
    subscriberCount: 5420,
    isStatic: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-07-15')
  },
  {
    id: 'segment-2',
    name: 'VIP Customers',
    description: 'Enterprise plan customers',
    criteria: [
      {
        id: 'rule-3',
        field: 'tags',
        operator: 'contains',
        value: 'vip',
        condition: 'or'
      },
      {
        id: 'rule-4',
        field: 'plan',
        operator: 'equals',
        value: 'Enterprise',
        condition: 'or'
      }
    ],
    subscriberCount: 245,
    isStatic: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-07-10')
  }
]

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Promotional Sale',
    description: 'Perfect for promotional campaigns and sales',
    category: 'promotional',
    thumbnail: '/templates/promo-thumb.jpg',
    content: {
      html: '<html>...</html>',
      plainText: 'Template...',
      editor: 'drag-drop'
    },
    isPublic: true,
    usageCount: 24,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-15')
  },
  {
    id: 'template-2',
    name: 'Welcome Series',
    description: 'Welcome new subscribers',
    category: 'welcome',
    thumbnail: '/templates/welcome-thumb.jpg',
    content: {
      html: '<html>...</html>',
      plainText: 'Welcome...',
      editor: 'drag-drop'
    },
    isPublic: true,
    usageCount: 156,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-05-20')
  }
]

export const MOCK_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-1',
    name: 'Welcome Email Series',
    description: '3-email welcome sequence for new subscribers',
    trigger: 'subscriber-added',
    triggerConfig: {
      listId: 'list-1'
    },
    status: 'active',
    steps: [
      {
        id: 'step-1',
        type: 'send-email',
        delay: 0,
        delayUnit: 'minutes',
        config: {
          templateId: 'template-2',
          subject: 'Welcome to KAZI!'
        },
        order: 1,
        stats: {
          entered: 2450,
          completed: 2438,
          failed: 12
        }
      },
      {
        id: 'step-2',
        type: 'wait',
        delay: 3,
        delayUnit: 'days',
        config: {},
        order: 2,
        stats: {
          entered: 2438,
          completed: 2438,
          failed: 0
        }
      },
      {
        id: 'step-3',
        type: 'send-email',
        delay: 0,
        delayUnit: 'minutes',
        config: {
          subject: 'Getting Started with KAZI'
        },
        order: 3,
        stats: {
          entered: 2438,
          completed: 2401,
          failed: 37
        }
      }
    ],
    subscriberCount: 2450,
    completedCount: 1850,
    conversionRate: 75.5,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-07-15')
  }
]

export const MOCK_EMAIL_STATS: EmailStats = {
  totalSubscribers: 24580,
  activeSubscribers: 18945,
  newSubscribersToday: 45,
  newSubscribersThisWeek: 287,
  newSubscribersThisMonth: 1245,
  unsubscribedThisMonth: 142,
  totalCampaigns: 156,
  campaignsSent: 148,
  campaignsScheduled: 8,
  averageOpenRate: 42.5,
  averageClickRate: 12.8,
  revenueThisMonth: 145820,
  topPerformingCampaigns: [
    { campaignId: 'campaign-2', campaignName: 'Product Update Announcement', openRate: 43.0 },
    { campaignId: 'campaign-1', campaignName: 'Summer Sale Newsletter', openRate: 40.0 }
  ],
  subscriberGrowth: [
    { month: 'Jan', subscribers: 18500 },
    { month: 'Feb', subscribers: 19200 },
    { month: 'Mar', subscribers: 20100 },
    { month: 'Apr', subscribers: 21300 },
    { month: 'May', subscribers: 22800 },
    { month: 'Jun', subscribers: 24580 }
  ]
}

// Helper Functions
export function getCampaignStatusColor(status: CampaignStatus): string {
  const colors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    sending: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    sent: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return colors[status]
}

export function getSubscriberStatusColor(status: SubscriberStatus): string {
  const colors = {
    subscribed: 'bg-green-100 text-green-700',
    unsubscribed: 'bg-gray-100 text-gray-700',
    bounced: 'bg-red-100 text-red-700',
    complained: 'bg-orange-100 text-orange-700'
  }
  return colors[status]
}

export function getCampaignTypeIcon(type: CampaignType): string {
  const icons = {
    newsletter: '📰',
    promotional: '🎉',
    transactional: '📧',
    drip: '💧',
    announcement: '📢',
    custom: '✉️'
  }
  return icons[type]
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getEngagementColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

export function calculateEngagementScore(subscriber: Subscriber): number {
  const { engagement } = subscriber
  if (engagement.emailsSent === 0) return 0

  const openRateWeight = 0.4
  const clickRateWeight = 0.4
  const recencyWeight = 0.2

  const openScore = engagement.averageOpenRate * openRateWeight
  const clickScore = engagement.averageClickRate * clickRateWeight

  let recencyScore = 0
  if (engagement.lastOpenedAt) {
    const daysSinceLastOpen = Math.floor(
      (Date.now() - new Date(engagement.lastOpenedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    recencyScore = Math.max(0, 100 - daysSinceLastOpen) * recencyWeight
  }

  return Math.round(openScore + clickScore + recencyScore)
}

export function sortCampaignsByDate(campaigns: EmailCampaign[]): EmailCampaign[] {
  return [...campaigns].sort((a, b) => {
    const dateA = a.sentAt || a.scheduledAt || a.updatedAt
    const dateB = b.sentAt || b.scheduledAt || b.updatedAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}

export function filterCampaignsByStatus(campaigns: EmailCampaign[], statuses: CampaignStatus[]): EmailCampaign[] {
  return campaigns.filter(c => statuses.includes(c.status))
}

export function getTopPerformingCampaigns(campaigns: EmailCampaign[], count: number = 5): EmailCampaign[] {
  return [...campaigns]
    .filter(c => c.status === 'sent')
    .sort((a, b) => b.stats.openRate - a.stats.openRate)
    .slice(0, count)
}

export function calculateCampaignRevenue(campaign: EmailCampaign): number {
  return campaign.stats.revenue || 0
}

export function getActiveSubscribers(subscribers: Subscriber[]): Subscriber[] {
  return subscribers.filter(s => s.status === 'subscribed')
}

export function getEngagedSubscribers(subscribers: Subscriber[], minScore: number = 70): Subscriber[] {
  return subscribers.filter(s => s.engagement.engagementScore >= minScore)
}
