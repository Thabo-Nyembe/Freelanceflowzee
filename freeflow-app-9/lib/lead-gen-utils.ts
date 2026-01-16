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

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_LEADS: Lead[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_FORMS: LeadForm[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_LANDING_PAGES: LandingPage[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_CAMPAIGNS: LeadCampaign[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_LEAD_MAGNETS: LeadMagnet[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_NURTURE_SEQUENCES: NurtureSequence[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_AB_TESTS: ABTest[] = []

// MIGRATED: Batch #10 - Removed mock data, using database hooks
export const MOCK_LEAD_GEN_STATS: LeadGenStats = {
  totalLeads: 0,
  newLeadsToday: 0,
  newLeadsThisWeek: 0,
  newLeadsThisMonth: 0,
  conversionRate: 0,
  averageLeadScore: 0,
  hotLeads: 0,
  warmLeads: 0,
  coldLeads: 0,
  leadsBySource: [],
  leadsByStatus: {
    new: 0,
    contacted: 0,
    qualified: 0,
    unqualified: 0,
    converted: 0,
    lost: 0
  },
  topPerformingForms: [],
  topPerformingPages: []
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
