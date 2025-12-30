/**
 * Mock Data Adapters - DEPRECATED
 *
 * All mock data has been removed. Components should use real database queries.
 * These exports return empty arrays for backward compatibility.
 *
 * Migration:
 * - Use hooks from @/hooks/use-ai-data.ts for user data
 * - Use API routes for analytics, projects, clients
 * - Use Supabase client directly for real-time data
 */

console.warn('lib/mock-data/adapters is deprecated - use real database queries')

// Company info - can be from environment or database
export const companyInfo = {
  name: 'FreeFlow',
  description: 'The all-in-one platform for freelancers and agencies',
  tagline: 'Elevate Your Freelance Business',
  metrics: {
    customers: 0,
    mrr: 0,
    arr: 0,
    growth: 0,
    nps: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0
  }
}

// Empty arrays for backward compatibility - components should fetch real data
export const analyticsMetrics: any[] = []
export const analyticsFunnels: any[] = []
export const analyticsCohorts: any[] = []
export const analyticsReports: any[] = []
export const analyticsDashboards: any[] = []
export const analyticsAIInsights: any[] = []
export const analyticsCollaborators: any[] = []
export const analyticsPredictions: any[] = []
export const analyticsActivities: any[] = []
export const analyticsQuickActions: any[] = []
export const analyticsRealtimeMetrics: any = {}

// CRM/Customers - fetch from database
export const crmCustomers: any[] = []
export const crmDeals: any[] = []
export const crmLeads: any[] = []
export const crmActivities: any[] = []
export const crmQuickActions: any[] = []
export const crmStats: any = {}
export const crmAIInsights: any[] = []
export const crmPipelineStages: any[] = []

// Projects - fetch from database
export const projectsProjects: any[] = []
export const projectsTasks: any[] = []
export const projectsMilestones: any[] = []
export const projectsStats: any = {}
export const projectsAIInsights: any[] = []
export const projectsQuickActions: any[] = []
export const projectsKanbanColumns: any[] = []

// Financials - fetch from database
export const financialsTransactions: any[] = []
export const financialsInvoices: any[] = []
export const financialsExpenses: any[] = []
export const financialsStats: any = {}
export const financialsAIInsights: any[] = []
export const financialsQuickActions: any[] = []
export const financialsKPIs: any[] = []

// Team - fetch from database
export const teamMembers: any[] = []
export const teamStats: any = {}
export const teamAIInsights: any[] = []
export const teamQuickActions: any[] = []

// Products - fetch from database
export const productsItems: any[] = []
export const productsOrders: any[] = []
export const productsStats: any = {}

// Communications - fetch from database
export const communicationsMessages: any[] = []
export const communicationsConversations: any[] = []
export const communicationsEmails: any[] = []
export const communicationsEvents: any[] = []
export const communicationsStats: any = {}

// Integrations - fetch from database
export const integrationsAll: any[] = []
export const integrationsWebhooks: any[] = []
export const integrationsApiKeys: any[] = []
export const integrationsStats: any = {}

// Dashboard overview
export const overviewMetrics: any[] = []
export const overviewProjects: any[] = []
export const overviewActivities: any[] = []
export const overviewAIInsights: any[] = []
export const overviewQuickActions: any[] = []

// Growth hub
export const growthMetrics: any[] = []
export const growthRecommendations: any[] = []
export const growthGoals: any[] = []

// Performance
export const performanceMetrics: any[] = []
export const performanceBenchmarks: any[] = []
export const performanceAlerts: any[] = []

// Monitoring
export const monitoringStatus: any = {}
export const monitoringAlerts: any[] = []
export const monitoringLogs: any[] = []

// Re-export everything for convenience
export default {
  companyInfo,
  analyticsMetrics,
  analyticsFunnels,
  analyticsCohorts,
  analyticsReports,
  analyticsDashboards,
  analyticsAIInsights,
  analyticsCollaborators,
  analyticsPredictions,
  analyticsActivities,
  analyticsQuickActions,
  analyticsRealtimeMetrics,
  crmCustomers,
  crmDeals,
  crmLeads,
  crmActivities,
  crmQuickActions,
  crmStats,
  crmAIInsights,
  crmPipelineStages,
  projectsProjects,
  projectsTasks,
  projectsMilestones,
  projectsStats,
  projectsAIInsights,
  projectsQuickActions,
  projectsKanbanColumns,
  financialsTransactions,
  financialsInvoices,
  financialsExpenses,
  financialsStats,
  financialsAIInsights,
  financialsQuickActions,
  financialsKPIs,
  teamMembers,
  teamStats,
  teamAIInsights,
  teamQuickActions,
  productsItems,
  productsOrders,
  productsStats,
  communicationsMessages,
  communicationsConversations,
  communicationsEmails,
  communicationsEvents,
  communicationsStats,
  integrationsAll,
  integrationsWebhooks,
  integrationsApiKeys,
  integrationsStats,
  overviewMetrics,
  overviewProjects,
  overviewActivities,
  overviewAIInsights,
  overviewQuickActions,
  growthMetrics,
  growthRecommendations,
  growthGoals,
  performanceMetrics,
  performanceBenchmarks,
  performanceAlerts,
  monitoringStatus,
  monitoringAlerts,
  monitoringLogs
}
