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

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_CAMPAIGNS: EmailCampaign[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_SUBSCRIBERS: Subscriber[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_SEGMENTS: Segment[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_TEMPLATES: EmailTemplate[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_AUTOMATIONS: Automation[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_EMAIL_STATS: EmailStats = {
  totalSubscribers: 0,
  activeSubscribers: 0,
  newSubscribersToday: 0,
  newSubscribersThisWeek: 0,
  newSubscribersThisMonth: 0,
  unsubscribedThisMonth: 0,
  totalCampaigns: 0,
  campaignsSent: 0,
  campaignsScheduled: 0,
  averageOpenRate: 0,
  averageClickRate: 0,
  revenueThisMonth: 0,
  topPerformingCampaigns: [],
  subscriberGrowth: []
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
